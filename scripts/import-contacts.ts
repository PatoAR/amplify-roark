import * as XLSX from 'xlsx';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand, BatchGetCommand } from '@aws-sdk/lib-dynamodb';
import * as readline from 'readline';
import { discoverTableName } from './utils/table-discovery';

// Initialize AWS clients
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// Configuration constants
const COMPANY_SPACING_DAYS = 3;
const BATCH_SIZE = 25; // DynamoDB batch write limit

interface ExcelRow {
  Company: string;
  FirstName: string;
  LastName: string;
  email: string;
  Language?: string; // Preferred language: 'es', 'en', or 'pt' (optional, defaults to 'es')
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
 * Normalize email address for comparison (lowercase, trim)
 */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Read Excel file and parse contacts, removing duplicates within the file
 */
function readExcelFile(filePath: string): { contacts: ExcelRow[]; duplicates: ExcelRow[] } {
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

  // Filter out rows with missing email and normalize language
  const validRows = data
    .filter((row: ExcelRow) => row.email && row.email.trim() !== '')
    .map((row: ExcelRow) => {
      // Normalize language: validate and default to 'es' if invalid or missing
      if (row.Language) {
        const lang = row.Language.trim().toLowerCase();
        if (['es', 'en', 'pt'].includes(lang)) {
          row.Language = lang;
        } else {
          console.warn(`Invalid language "${row.Language}" for ${row.email}, defaulting to 'es'`);
          row.Language = 'es';
        }
      } else {
        row.Language = 'es'; // Default to Spanish
      }
      return row;
    });
  
  // Detect duplicates within the Excel file (by normalized email)
  const seenEmails = new Map<string, ExcelRow>();
  const contacts: ExcelRow[] = [];
  const duplicates: ExcelRow[] = [];
  
  for (const row of validRows) {
    const normalizedEmail = normalizeEmail(row.email);
    
    if (seenEmails.has(normalizedEmail)) {
      duplicates.push(row);
    } else {
      seenEmails.set(normalizedEmail, row);
      contacts.push(row);
    }
  }
  
  return { contacts, duplicates };
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
 * Check which contacts already exist in DynamoDB
 */
async function checkExistingContacts(contacts: Contact[], tableName: string): Promise<Set<string>> {
  const existingEmails = new Set<string>();
  
  // Batch check contacts in chunks (DynamoDB BatchGetItem limit is 100 items)
  const CHECK_BATCH_SIZE = 100;
  
  for (let i = 0; i < contacts.length; i += CHECK_BATCH_SIZE) {
    const batch = contacts.slice(i, i + CHECK_BATCH_SIZE);
    
    const keys = batch.map(contact => ({
      id: contact.email, // Primary key
    }));
    
    try {
      const result = await dynamoClient.send(
        new BatchGetCommand({
          RequestItems: {
            [tableName]: {
              Keys: keys,
            },
          },
        })
      );
      
      // Mark emails that exist in DynamoDB
      const existingItems = result.Responses?.[tableName] || [];
      for (const item of existingItems) {
        if (item.email) {
          existingEmails.add(normalizeEmail(item.email));
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not check existing contacts for batch ${Math.floor(i / CHECK_BATCH_SIZE) + 1}:`, error);
      // Continue processing - we'll try to write anyway and handle conflicts
    }
  }
  
  return existingEmails;
}

/**
 * Batch write contacts to DynamoDB, skipping duplicates
 */
async function writeContactsToDynamoDB(
  contacts: Contact[], 
  tableName: string, 
  skipDuplicates: boolean = true
): Promise<{ written: number; skipped: number }> {
  console.log(`Checking for existing contacts in DynamoDB...`);
  const existingEmails = await checkExistingContacts(contacts, tableName);
  
  // Filter out duplicates if skipDuplicates is true
  const contactsToWrite = skipDuplicates
    ? contacts.filter(contact => !existingEmails.has(normalizeEmail(contact.email)))
    : contacts;
  
  const skippedCount = contacts.length - contactsToWrite.length;
  
  if (skippedCount > 0) {
    console.log(`Skipping ${skippedCount} duplicate contact(s) already in DynamoDB`);
  }
  
  if (contactsToWrite.length === 0) {
    console.log('No new contacts to write (all are duplicates)');
    return { written: 0, skipped: skippedCount };
  }
  
  console.log(`Writing ${contactsToWrite.length} new contacts to DynamoDB table: ${tableName}...`);

  // Split into batches
  for (let i = 0; i < contactsToWrite.length; i += BATCH_SIZE) {
    const batch = contactsToWrite.slice(i, i + BATCH_SIZE);
    
    const putRequests = batch.map(contact => ({
      PutRequest: {
        Item: {
          // Amplify Gen 2 uses 'id' as primary key. Store email as the id value for direct lookups
          id: contact.email, // Primary key - use email as the id value
          email: contact.email,
          Company: contact.Company,
          FirstName: contact.FirstName,
          LastName: contact.LastName,
          Language: contact.Language || 'es', // Preferred language (defaults to 'es')
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

  console.log(`Successfully wrote ${contactsToWrite.length} contacts to DynamoDB`);
  return { written: contactsToWrite.length, skipped: skippedCount };
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
    // Discover the actual table name using shared utility
    // Uses CloudFormation outputs for branch-safe discovery
    const tableName = await discoverTableName(
      'SESCampaignContact', 
      'CONTACT_TABLE_NAME',
      'SESCampaignContactTableName'
    );

    const filePath = process.argv[2] || await question('Enter path to Excel file: ');
    const startDateArg = process.argv[3];

    console.log(`Reading Excel file: ${filePath}`);
    const { contacts: rows, duplicates: fileDuplicates } = readExcelFile(filePath);
    console.log(`Found ${rows.length + fileDuplicates.length} contacts in Excel file`);
    
    if (fileDuplicates.length > 0) {
      console.log(`\n⚠️  Found ${fileDuplicates.length} duplicate email(s) within the Excel file:`);
      fileDuplicates.slice(0, 10).forEach(dup => {
        console.log(`  - ${dup.email} (${dup.Company})`);
      });
      if (fileDuplicates.length > 10) {
        console.log(`  ... and ${fileDuplicates.length - 10} more`);
      }
      console.log('(Duplicates within file will be skipped)');
    }

    const contacts = processContacts(rows, startDateArg);
    console.log(`\nProcessed ${contacts.length} unique contacts`);
    console.log(`Companies: ${new Set(contacts.map(c => c.Company)).size}`);
    if (contacts.length > 0) {
      console.log(`Send Group ID range: ${contacts[0].Send_Group_ID} - ${contacts[contacts.length - 1].Send_Group_ID}`);
    }

    // Show sample of first few contacts
    if (contacts.length > 0) {
      console.log('\nSample contacts:');
      contacts.slice(0, 5).forEach(c => {
        console.log(`  ${c.email} (${c.Company}) - Group: ${c.Send_Group_ID}, Date: ${c.Target_Send_Date}, Seq: ${c.Company_Sequence}`);
      });
    }

    const confirm = await question('\nProceed with import? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes') {
      console.log('Import cancelled');
      rl.close();
      return;
    }

    const result = await writeContactsToDynamoDB(contacts, tableName, true);
    console.log(`\n✅ Import completed successfully!`);
    console.log(`   - Written: ${result.written} new contact(s)`);
    console.log(`   - Skipped: ${result.skipped} duplicate(s) already in database`);
    if (fileDuplicates.length > 0) {
      console.log(`   - Skipped: ${fileDuplicates.length} duplicate(s) within Excel file`);
    }
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

export { readExcelFile, processContacts, writeContactsToDynamoDB, checkExistingContacts, normalizeEmail };

