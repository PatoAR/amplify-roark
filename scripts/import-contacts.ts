import * as XLSX from 'xlsx';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { CloudFormationClient, ListStacksCommand, DescribeStackResourcesCommand, StackResourceSummary } from '@aws-sdk/client-cloudformation';
import * as readline from 'readline';

// Initialize AWS clients
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const cloudFormationClient = new CloudFormationClient({});

// Table name will be provided via environment variable, discovered automatically, or use default
const COMPANY_SPACING_DAYS = 3;
const BATCH_SIZE = 25; // DynamoDB batch write limit

/**
 * Discover the actual table name by querying CloudFormation stacks
 * This works across different branches/environments (dev, main) as it finds the table
 * from the actual deployed Amplify stack resources
 */
async function discoverTableName(modelName: string): Promise<string> {
  // If explicitly set via environment variable, use it
  const envTableName = process.env.CONTACT_TABLE_NAME;
  if (envTableName) {
    return envTableName;
  }

  try {
    // List all CloudFormation stacks (including deleted ones, but we'll filter)
    const listStacksResponse = await cloudFormationClient.send(
      new ListStacksCommand({
        StackStatusFilter: [
          'CREATE_COMPLETE',
          'UPDATE_COMPLETE',
          'UPDATE_ROLLBACK_COMPLETE',
        ],
      })
    );

    const stacks = listStacksResponse.StackSummaries || [];

    // Find Amplify stacks (they typically contain "amplify" or match Amplify naming patterns)
    // Amplify Gen 2 stacks follow pattern: amplify-{appId}-{branch}-{hash}
    const amplifyStacks = stacks.filter(stack => 
      stack.StackName?.includes('amplify') || 
      stack.StackName?.includes('data') ||
      stack.StackName?.match(/^[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+$/) // Amplify Gen 2 pattern
    );

    if (amplifyStacks.length === 0) {
      throw new Error(
        `No Amplify stacks found. Make sure you're connected to the correct AWS account and region.\n` +
        `Set CONTACT_TABLE_NAME environment variable to specify the table name manually.`
      );
    }

    // Search through all Amplify stacks for the table resource
    for (const stack of amplifyStacks) {
      if (!stack.StackName) continue;

      try {
        const resourcesResponse = await cloudFormationClient.send(
          new DescribeStackResourcesCommand({
            StackName: stack.StackName,
          })
        );

        const resources = resourcesResponse.StackResources || [];

        // Look for DynamoDB table resources that match our model name
        // Amplify Gen 2 creates tables with logical ID like "SESCampaignContact{hash}"
        const tableResource = resources.find(resource => {
          if (resource.ResourceType !== 'AWS::DynamoDB::Table') return false;
          
          // Check if logical ID starts with model name
          const logicalId = resource.LogicalResourceId || '';
          return logicalId.startsWith(modelName) || logicalId.includes(modelName);
        });

        if (tableResource && tableResource.PhysicalResourceId) {
          console.log(`Found table: ${tableResource.PhysicalResourceId} in stack: ${stack.StackName}`);
          return tableResource.PhysicalResourceId;
        }
      } catch (error) {
        // Continue searching other stacks if this one fails
        continue;
      }
    }

    // If not found in CloudFormation, try listing DynamoDB tables as fallback
    console.warn('Table not found in CloudFormation stacks, trying DynamoDB list tables...');
    const { DynamoDBClient: DDBClient, ListTablesCommand } = await import('@aws-sdk/client-dynamodb');
    const ddbClient = new DDBClient({});
    const listResponse = await ddbClient.send(new ListTablesCommand({}));
    const tableNames = listResponse.TableNames || [];
    
    const matchingTable = tableNames.find(name => name.startsWith(modelName));
    if (matchingTable) {
      console.log(`Found table via DynamoDB list: ${matchingTable}`);
      return matchingTable;
    }

    throw new Error(
      `Table "${modelName}" not found in any CloudFormation stack or DynamoDB.\n` +
      `Searched ${amplifyStacks.length} Amplify stack(s).\n` +
      `Available DynamoDB tables: ${tableNames.join(', ') || '(none)'}\n` +
      `Set CONTACT_TABLE_NAME environment variable to specify the table name manually.`
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('Table')) {
      throw error;
    }
    throw new Error(
      `Failed to discover table name: ${error instanceof Error ? error.message : String(error)}\n` +
      `Set CONTACT_TABLE_NAME environment variable to specify the table name manually.`
    );
  }
}

interface ExcelRow {
  Company: string;
  FirstName: string;
  LastName: string;
  email: string;
}

interface Contact extends ExcelRow {
  Sent_Status: string; // 'true' or 'false' (stored as string for indexing)
  Target_Send_Date: string;
  Send_Group_ID: number;
  Company_Sequence: number;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add days to a date string (YYYY-MM-DD)
 */
function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Read Excel file and parse contacts
 */
function readExcelFile(filePath: string): ExcelRow[] {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

  // Validate required columns
  const requiredColumns = ['Company', 'FirstName', 'LastName', 'email'];
  const firstRow = data[0];
  if (!firstRow) {
    throw new Error('Excel file is empty');
  }

  const missingColumns = requiredColumns.filter(col => !(col in firstRow));
  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }

  // Filter out rows with missing email
  return data.filter((row: ExcelRow) => row.email && row.email.trim() !== '');
}

/**
 * Group contacts by company and calculate Send_Group_ID and Target_Send_Date
 */
function processContacts(rows: ExcelRow[], startDate?: string): Contact[] {
  const start = startDate || getTodayDate();
  
  // Group by Company
  const companyGroups = new Map<string, ExcelRow[]>();
  for (const row of rows) {
    const company = row.Company.trim();
    if (!companyGroups.has(company)) {
      companyGroups.set(company, []);
    }
    companyGroups.get(company)!.push(row);
  }

  // Sort companies alphabetically for consistent ordering
  const sortedCompanies = Array.from(companyGroups.keys()).sort();

  const contacts: Contact[] = [];
  let sendGroupId = 1;

  for (const company of sortedCompanies) {
    const companyContacts = companyGroups.get(company)!;
    let currentDate = start;
    let companySequence = 1;

    for (const contact of companyContacts) {
      contacts.push({
        ...contact,
        Sent_Status: 'false', // Store as string for indexing
        Target_Send_Date: currentDate,
        Send_Group_ID: sendGroupId++,
        Company_Sequence: companySequence++,
      });

      // Next contact from same company: add spacing days
      if (companySequence <= companyContacts.length) {
        currentDate = addDays(currentDate, COMPANY_SPACING_DAYS);
      }
    }
  }

  return contacts;
}

/**
 * Batch write contacts to DynamoDB
 */
async function writeContactsToDynamoDB(contacts: Contact[], tableName: string): Promise<void> {
  console.log(`Writing ${contacts.length} contacts to DynamoDB table: ${tableName}...`);

  // Split into batches
  for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
    const batch = contacts.slice(i, i + BATCH_SIZE);
    
    const putRequests = batch.map(contact => ({
      PutRequest: {
        Item: {
          // Primary key is 'email' (using .identifier() in schema)
          // Note: If you get a key mismatch error, the table was created with 'id' as primary key
          // You'll need to delete the table and redeploy to use the new schema
          email: contact.email, // Primary key - matches schema with email.identifier()
          Company: contact.Company,
          FirstName: contact.FirstName,
          LastName: contact.LastName,
          Sent_Status: contact.Sent_Status,
          Target_Send_Date: contact.Target_Send_Date,
          Send_Group_ID: contact.Send_Group_ID,
          Company_Sequence: contact.Company_Sequence,
        },
      },
    }));

    try {
      await dynamoClient.send(
        new BatchWriteCommand({
          RequestItems: {
            [tableName]: putRequests,
          },
        })
      );
      console.log(`Written batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} contacts)`);
    } catch (error) {
      console.error(`Error writing batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error);
      throw error;
    }
  }

  console.log(`Successfully wrote ${contacts.length} contacts to DynamoDB`);
}

/**
 * Main function
 */
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
  };

  try {
    // Discover the actual table name
    console.log('Discovering DynamoDB table name...');
    const tableName = await discoverTableName('SESCampaignContact');

    const filePath = process.argv[2] || await question('Enter path to Excel file: ');
    const startDateArg = process.argv[3];

    console.log(`Reading Excel file: ${filePath}`);
    const rows = readExcelFile(filePath);
    console.log(`Found ${rows.length} contacts in Excel file`);

    const contacts = processContacts(rows, startDateArg);
    console.log(`Processed ${contacts.length} contacts`);
    console.log(`Companies: ${new Set(contacts.map(c => c.Company)).size}`);
    console.log(`Send Group ID range: ${contacts[0].Send_Group_ID} - ${contacts[contacts.length - 1].Send_Group_ID}`);

    // Show sample of first few contacts
    console.log('\nSample contacts:');
    contacts.slice(0, 5).forEach(c => {
      console.log(`  ${c.email} (${c.Company}) - Group: ${c.Send_Group_ID}, Date: ${c.Target_Send_Date}, Seq: ${c.Company_Sequence}`);
    });

    const confirm = await question('\nProceed with import? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes') {
      console.log('Import cancelled');
      rl.close();
      return;
    }

    await writeContactsToDynamoDB(contacts, tableName);
    console.log('\nImport completed successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { readExcelFile, processContacts, writeContactsToDynamoDB };

