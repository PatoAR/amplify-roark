import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { discoverTableName } from './utils/table-discovery';

// Initialize AWS clients
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const CONTROL_KEY = 'main';

interface CampaignControl {
  id: string; // Primary key - stores 'main'
  control: string;
  isEnabled: boolean;
  lastUpdated: string;
  updatedBy?: string;
}

/**
 * Get current campaign status
 */
async function getCampaignStatus(tableName: string): Promise<CampaignControl | null> {
  try {
    const result = await dynamoClient.send(
      new GetCommand({
        TableName: tableName,
        Key: { id: CONTROL_KEY }, // Use 'id' as primary key, store 'main' as the id value
      })
    );

    return result.Item as CampaignControl | null;
  } catch (error) {
    console.error('Error getting campaign status:', error);
    throw error;
  }
}

/**
 * Set campaign status
 */
async function setCampaignStatus(tableName: string, isEnabled: boolean, updatedBy?: string): Promise<void> {
  const now = new Date().toISOString();
  
  const control: CampaignControl = {
    id: CONTROL_KEY, // Use 'id' as primary key, store 'main' as the id value
    control: CONTROL_KEY,
    isEnabled,
    lastUpdated: now,
    updatedBy,
  };

  try {
    await dynamoClient.send(
      new PutCommand({
        TableName: tableName,
        Item: control,
      })
    );
  } catch (error) {
    console.error('Error setting campaign status:', error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  const command = process.argv[2];

  if (!command || (command !== 'enable' && command !== 'disable' && command !== 'status')) {
    console.log('Usage: node toggle-campaign.ts [enable|disable|status]');
    console.log('');
    console.log('Commands:');
    console.log('  enable  - Enable the SES campaign');
    console.log('  disable - Disable the SES campaign');
    console.log('  status  - Show current campaign status');
    process.exit(1);
  }

  try {
    // Discover the actual table name using shared utility
    // Uses CloudFormation outputs for branch-safe discovery
    const tableName = await discoverTableName(
      'SESCampaignControl', 
      'CAMPAIGN_CONTROL_TABLE_NAME',
      'SESCampaignControlTableName'
    );

    if (command === 'status') {
      const status = await getCampaignStatus(tableName);
      if (!status) {
        console.log('Campaign control item not found. Campaign is likely enabled by default.');
      } else {
        console.log('Current campaign status:');
        console.log(`  Enabled: ${status.isEnabled}`);
        console.log(`  Last Updated: ${status.lastUpdated}`);
        if (status.updatedBy) {
          console.log(`  Updated By: ${status.updatedBy}`);
        }
      }
    } else {
      const isEnabled = command === 'enable';
      await setCampaignStatus(tableName, isEnabled, process.env.USER || 'script');
      
      const status = await getCampaignStatus(tableName);
      console.log(`Campaign ${isEnabled ? 'enabled' : 'disabled'} successfully`);
      console.log(`Current status: ${status?.isEnabled ? 'ENABLED' : 'DISABLED'}`);
      console.log(`Last Updated: ${status?.lastUpdated}`);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { getCampaignStatus, setCampaignStatus };

