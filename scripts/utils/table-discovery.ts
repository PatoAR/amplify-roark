/**
 * Shared utility for discovering DynamoDB table names across different scripts
 * 
 * This utility handles multi-branch deployments by discovering the correct environment's tables.
 * 
 * Discovery order:
 * 1. Environment variable (explicit override) - HIGHEST PRIORITY
 * 2. CloudFormation stack outputs (branch-aware, recommended)
 * 3. DynamoDB ListTables (fallback with multi-table warnings)
 * 
 * Security: Requires minimal AWS permissions:
 * - cloudformation:DescribeStacks (recommended for branch safety)
 * - dynamodb:ListTables (fallback only)
 */

import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import { execSync } from 'child_process';

/**
 * Discover the actual DynamoDB table name for a given model
 * 
 * Multi-branch safe: Automatically detects the correct environment's tables
 * using CloudFormation stack outputs. This prevents accidentally operating
 * on tables from different branches/environments.
 * 
 * @param modelName - The Amplify model name (e.g., 'SESCampaignContact')
 * @param envVarName - Optional environment variable name to check first
 * @param outputKeyName - CloudFormation output key name (e.g., 'SESCampaignContactTableName')
 * @returns Promise<string> - The physical table name
 * @throws Error if table cannot be discovered
 * 
 * @example
 * // Recommended: Uses CloudFormation outputs for branch safety
 * const tableName = await discoverTableName(
 *   'SESCampaignContact', 
 *   'CONTACT_TABLE_NAME',
 *   'SESCampaignContactTableName'
 * );
 * 
 * // With environment variable override
 * CONTACT_TABLE_NAME=MyTable-abc123 npm run import contacts.xlsx
 */
export async function discoverTableName(
  modelName: string,
  envVarName?: string,
  outputKeyName?: string
): Promise<string> {
  // Priority 1: Check environment variable (explicit override)
  if (envVarName && process.env[envVarName]) {
    const tableName = process.env[envVarName];
    console.log(`✓ Using table from environment variable ${envVarName}: ${tableName}`);
    return tableName;
  }

  // Priority 2: Query CloudFormation stack outputs (branch-aware, recommended)
  if (outputKeyName) {
    try {
      const cfnTableName = await getTableNameFromCloudFormation(outputKeyName);
      if (cfnTableName) {
        return cfnTableName;
      }
    } catch (error) {
      console.log(`⚠ CloudFormation lookup failed, trying DynamoDB ListTables...`);
      // Continue to fallback methods
    }
  }

  // Priority 3: DynamoDB ListTables (fallback with warnings)
  console.log(`Discovering table via DynamoDB ListTables for model: ${modelName}...`);
  const tableName = await discoverViaListTables(modelName);
  
  if (!tableName) {
    throw new Error(
      `Table for model "${modelName}" not found.\n\n` +
      `Troubleshooting:\n` +
      `1. Ensure the Amplify backend is deployed: npx ampx sandbox\n` +
      `2. Verify AWS credentials and region: aws sts get-caller-identity\n` +
      `3. Set ${envVarName || 'TABLE_NAME'} environment variable:\n` +
      `   ${envVarName || 'TABLE_NAME'}=YourTableName npm run script-name`
    );
  }
  
  return tableName;
}

/**
 * Get the current git branch name
 * Returns null if git is not available or not in a git repository
 */
function getCurrentGitBranch(): string | null {
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
    return branch || null;
  } catch (error) {
    // Git not available or not in a git repo
    return null;
  }
}

/**
 * Get table name from CloudFormation stack outputs
 * This is the recommended method for multi-branch deployments
 * Now branch-aware: filters stacks by current git branch
 */
async function getTableNameFromCloudFormation(outputKeyName: string): Promise<string | null> {
  const cfnClient = new CloudFormationClient({});
  
  try {
    // Get current git branch for branch-aware filtering
    const currentBranch = getCurrentGitBranch();
    if (currentBranch) {
      console.log(`Detected git branch: ${currentBranch}`);
    } else {
      console.log(`⚠ Could not detect git branch. Will search all stacks.`);
    }
    
    // Get all stacks (Amplify Gen 2 creates stacks with pattern: amplify-{appname}-{branch}-...)
    const response = await cfnClient.send(new DescribeStacksCommand({}));
    const stacks = response.Stacks || [];
    
    // Find Amplify data stacks (they contain the table outputs)
    // Stack name pattern: amplify-{appname}-{branch}-data-{hash} or similar
    let amplifyDataStacks = stacks.filter(stack => 
      stack.StackName?.includes('amplify') && 
      stack.StackName?.includes('data') &&
      stack.StackStatus !== 'DELETE_COMPLETE'
    );
    
    // Filter by branch if we detected a branch
    if (currentBranch) {
      const branchFilteredStacks = amplifyDataStacks.filter(stack => {
        const stackName = stack.StackName || '';
        // Check if stack name contains the branch name
        // Handle both direct branch name and normalized versions (e.g., main vs master)
        return stackName.includes(`-${currentBranch}-`) || 
               stackName.includes(`-${currentBranch}_`) ||
               stackName.endsWith(`-${currentBranch}`);
      });
      
      if (branchFilteredStacks.length > 0) {
        amplifyDataStacks = branchFilteredStacks;
        console.log(`Found ${amplifyDataStacks.length} stack(s) matching branch "${currentBranch}"`);
      } else {
        console.log(`⚠ No stacks found matching branch "${currentBranch}". Searching all stacks...`);
      }
    }
    
    // Search for the output in matching stacks
    for (const stack of amplifyDataStacks) {
      const output = stack.Outputs?.find(o => o.OutputKey === outputKeyName);
      if (output?.OutputValue) {
        if (currentBranch) {
          console.log(`✓ Found table from CloudFormation stack "${stack.StackName}" (branch: ${currentBranch})`);
        } else {
          console.log(`✓ Found table from CloudFormation stack "${stack.StackName}"`);
        }
        return output.OutputValue;
      }
    }
    
    return null;
  } catch (error) {
    // If CloudFormation access fails, we'll fall back to ListTables
    if (error instanceof Error && error.message.includes('AccessDenied')) {
      console.log(`⚠ No CloudFormation access. Consider adding cloudformation:DescribeStacks permission.`);
    }
    throw error;
  }
}

/**
 * Discover table via DynamoDB ListTables (fallback method)
 * Warns if multiple matching tables found (multi-branch scenario)
 */
async function discoverViaListTables(modelName: string): Promise<string | null> {
  try {
    const currentBranch = getCurrentGitBranch();
    const ddbClient = new DynamoDBClient({});
    const listResponse = await ddbClient.send(new ListTablesCommand({}));
    const tableNames = listResponse.TableNames || [];
    
    // Amplify Gen 2 table naming: {ModelName}-{hash}-{environment}
    const matchingTables = tableNames.filter(name => name.startsWith(modelName));
    
    if (matchingTables.length === 0) {
      return null;
    }
    
    if (matchingTables.length > 1) {
      console.log(`\n⚠️  WARNING: Multiple tables found for model "${modelName}":`);
      matchingTables.forEach((table, idx) => {
        console.log(`   ${idx + 1}. ${table}`);
      });
      
      if (currentBranch) {
        console.log(`\n   Current git branch: ${currentBranch}`);
        console.log(`   ⚠️  Cannot determine which table belongs to branch "${currentBranch}" from table names alone.`);
      }
      
      console.log(`\n   Using first match: ${matchingTables[0]}`);
      console.log(`   ⚠️  This may not be the correct branch/environment!`);
      console.log(`\n   Solutions:`);
      console.log(`   1. Use CloudFormation discovery (requires cloudformation:DescribeStacks permission)`);
      console.log(`   2. Specify the correct table via environment variable:`);
      console.log(`      CONTACT_TABLE_NAME=${matchingTables[0]} npm run script-name\n`);
    } else {
      console.log(`✓ Found table via DynamoDB: ${matchingTables[0]}`);
      if (currentBranch) {
        console.log(`   (Note: Branch "${currentBranch}" detected, but table name doesn't indicate branch)`);
      }
    }
    
    return matchingTables[0];
  } catch (error) {
    throw new Error(
      `Failed to list DynamoDB tables: ${error instanceof Error ? error.message : String(error)}\n` +
      `Ensure you have dynamodb:ListTables permission.`
    );
  }
}

/**
 * Discover multiple table names in a single call
 * More efficient than calling discoverTableName multiple times
 * 
 * @param models - Array of model configurations with name, env var, and output key
 * @returns Promise<Map<string, string>> - Map of model names to table names
 * 
 * @example
 * const tables = await discoverMultipleTables([
 *   { 
 *     modelName: 'SESCampaignContact', 
 *     envVarName: 'CONTACT_TABLE_NAME',
 *     outputKeyName: 'SESCampaignContactTableName'
 *   },
 *   { 
 *     modelName: 'SESCampaignControl', 
 *     envVarName: 'CAMPAIGN_CONTROL_TABLE_NAME',
 *     outputKeyName: 'SESCampaignControlTableName'
 *   }
 * ]);
 */
export async function discoverMultipleTables(
  models: Array<{ modelName: string; envVarName?: string; outputKeyName?: string }>
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  
  // Discover each table using the unified discovery method
  for (const model of models) {
    const tableName = await discoverTableName(
      model.modelName, 
      model.envVarName, 
      model.outputKeyName
    );
    result.set(model.modelName, tableName);
  }
  
  return result;
}