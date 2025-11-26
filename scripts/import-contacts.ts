import * as XLSX from 'xlsx';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import * as readline from 'readline';

// Initialize DynamoDB client
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// Table name will be provided via environment variable or use default
// In production, Amplify sets this automatically from the schema
const CONTACT_TABLE_NAME = process.env.CONTACT_TABLE_NAME || 'SESCampaignContact';
const COMPANY_SPACING_DAYS = 3;
const BATCH_SIZE = 25; // DynamoDB batch write limit

interface ExcelRow {
  Company: string;
  FirstName: string;
  LastName: string;
  email: string;
}

interface Contact extends ExcelRow {
  Sent_Status: boolean;
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
        Sent_Status: false,
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
async function writeContactsToDynamoDB(contacts: Contact[]): Promise<void> {
  console.log(`Writing ${contacts.length} contacts to DynamoDB...`);

  // Split into batches
  for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
    const batch = contacts.slice(i, i + BATCH_SIZE);
    
    const putRequests = batch.map(contact => ({
      PutRequest: {
        Item: {
          email: contact.email,
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
            [CONTACT_TABLE_NAME]: putRequests,
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

    await writeContactsToDynamoDB(contacts);
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

