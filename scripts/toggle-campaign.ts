import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { CloudFormationClient, ListStacksCommand, DescribeStackResourcesCommand } from '@aws-sdk/client-cloudformation';

// Initialize AWS clients
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const cloudFormationClient = new CloudFormationClient({});

const CONTROL_KEY = 'main';

/**
 * Discover the actual table name by querying CloudFormation stacks
 * This works across different branches/environments (dev, main) as it finds the table
 * from the actual deployed Amplify stack resources
 */
async function discoverTableName(modelName: string): Promise<string> {
  // If explicitly set via environment variable, use it
  const envTableName = process.env.CAMPAIGN_CONTROL_TABLE_NAME;
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
        `Set CAMPAIGN_CONTROL_TABLE_NAME environment variable to specify the table name manually.`
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
        // Amplify Gen 2 creates tables with logical ID like "SESCampaignControl{hash}"
        const tableResource = resources.find(resource => {
          if (resource.ResourceType !== 'AWS::DynamoDB::Table') return false;
          
          // Check if logical ID starts with model name
          const logicalId = resource.LogicalResourceId || '';
          return logicalId.startsWith(modelName) || logicalId.includes(modelName);
        });

        if (tableResource && tableResource.PhysicalResourceId) {
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
      return matchingTable;
    }

    throw new Error(
      `Table "${modelName}" not found in any CloudFormation stack or DynamoDB.\n` +
      `Searched ${amplifyStacks.length} Amplify stack(s).\n` +
      `Available DynamoDB tables: ${tableNames.join(', ') || '(none)'}\n` +
      `Set CAMPAIGN_CONTROL_TABLE_NAME environment variable to specify the table name manually.`
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('Table')) {
      throw error;
    }
    throw new Error(
      `Failed to discover table name: ${error instanceof Error ? error.message : String(error)}\n` +
      `Set CAMPAIGN_CONTROL_TABLE_NAME environment variable to specify the table name manually.`
    );
  }
}

interface CampaignControl {
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
        Key: { control: CONTROL_KEY },
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
    // Discover the actual table name
    console.log('Discovering DynamoDB table name...');
    const tableName = await discoverTableName('SESCampaignControl');
    console.log(`Using table: ${tableName}`);

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

