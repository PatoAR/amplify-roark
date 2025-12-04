/**
 * Migration Script: Add createdAt and updatedAt to Existing SES Campaign Contacts
 * 
 * This script fixes existing DynamoDB records that are missing createdAt and updatedAt fields.
 * These fields are required by Amplify's GraphQL schema but were missing from records
 * imported directly to DynamoDB.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { discoverTableName } from './utils/table-discovery';

// Initialize AWS clients
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const BATCH_SIZE = 25; // DynamoDB batch write limit

/**
 * Scan all items from the table
 */
async function scanAllItems(tableName: string): Promise<any[]> {
  const items: any[] = [];
  let lastEvaluatedKey: Record<string, any> | undefined;

  do {
    const command = new ScanCommand({
      TableName: tableName,
      ExclusiveStartKey: lastEvaluatedKey,
    });

    const response = await dynamoClient.send(command);
    
    if (response.Items) {
      items.push(...response.Items);
    }

    lastEvaluatedKey = response.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return items;
}

/**
 * Update items to add createdAt and updatedAt fields
 */
async function updateItems(tableName: string, items: any[]): Promise<void> {
  const now = new Date().toISOString();
  let updatedCount = 0;

  // Filter items that are missing createdAt or updatedAt
  const itemsToUpdate = items.filter(item => !item.createdAt || !item.updatedAt);

  if (itemsToUpdate.length === 0) {
    console.log('✅ All items already have createdAt and updatedAt fields');
    return;
  }

  console.log(`Found ${itemsToUpdate.length} items missing timestamp fields`);

  // Process in batches
  for (let i = 0; i < itemsToUpdate.length; i += BATCH_SIZE) {
    const batch = itemsToUpdate.slice(i, i + BATCH_SIZE);
    
    const putRequests = batch.map(item => ({
      PutRequest: {
        Item: {
          ...item,
          createdAt: item.createdAt || now,
          updatedAt: item.updatedAt || now,
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
      
      updatedCount += batch.length;
      console.log(`✅ Updated batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} items)`);
    } catch (error) {
      console.error(`❌ Error updating batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error);
      throw error;
    }
  }

  console.log(`\n✅ Successfully updated ${updatedCount} items`);
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🔍 Discovering SESCampaignContact table...');
    const tableName = await discoverTableName(
      'SESCampaignContact',
      'CONTACT_TABLE_NAME',
      'SESCampaignContactTableName'
    );
    console.log(`✅ Found table: ${tableName}\n`);

    console.log('📊 Scanning all items...');
    const items = await scanAllItems(tableName);
    console.log(`Found ${items.length} total items\n`);

    if (items.length === 0) {
      console.log('⚠️  Table is empty. Nothing to update.');
      return;
    }

    // Show sample of items
    console.log('Sample item structure:');
    const sample = items[0];
    console.log({
      id: sample.id,
      email: sample.email,
      Company: sample.Company,
      hasCreatedAt: !!sample.createdAt,
      hasUpdatedAt: !!sample.updatedAt,
    });
    console.log('');

    console.log('🔄 Updating items with missing timestamps...');
    await updateItems(tableName, items);

    console.log('\n✅ Migration complete!');
    console.log('\nNext steps:');
    console.log('1. Refresh the Analytics Dashboard in your browser');
    console.log('2. Verify all SES metrics are displaying correctly');
    console.log('3. Deploy code changes when ready (includes updated import script)');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

main();

