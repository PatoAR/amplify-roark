import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

interface SubscriptionUpgradeRequest {
  planId: string;
  userId: string;
  paymentMethodId?: string;
}

interface SubscriptionUpgradeResponse {
  success: boolean;
  message: string;
  subscriptionId?: string;
  error?: string;
  data?: {
    planId: string;
    planName: string;
    amount: number;
    period: string;
    nextBillingDate: string;
  };
}

// AppSync resolver event format
interface AppSyncResolverEvent {
  arguments: {
    planId: string;
    userId: string;
    paymentMethodId?: string;
  };
  identity?: {
    sub?: string;
    claims?: {
      email?: string;
      'cognito:username'?: string;
    };
  };
  request?: {
    userAttributes?: {
      email?: string;
      sub?: string;
    };
  };
}

type SubscriptionEvent = APIGatewayProxyEvent | SubscriptionUpgradeRequest | AppSyncResolverEvent;

export const handler = async (
  event: SubscriptionEvent
): Promise<APIGatewayProxyResult | SubscriptionUpgradeResponse> => {
  // Handle HTTP events (Function URL / API Gateway) - return HTTP response
  if ('httpMethod' in event || 'requestContext' in event) {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Content-Type': 'application/json',
    };

    // Handle CORS preflight
    if ('httpMethod' in event && event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: '',
      };
    }

    try {
      // API Gateway/Function URL - parse from body
      const requestData = JSON.parse((event as APIGatewayProxyEvent).body || '{}');
      const { planId, userId, paymentMethodId } = requestData;

      if (!planId || !userId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Missing required fields: planId and userId',
          }),
        };
      }

      const result = await processSubscriptionUpgrade(planId, userId, paymentMethodId);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result),
      };
    } catch (error) {
      console.error('Subscription upgrade error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Internal server error',
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
      };
    }
  }

  // Handle AppSync resolver events - return data directly
  try {
    let planId: string;
    let userId: string;
    let paymentMethodId: string | undefined;

    // AppSync resolver format
    if ('arguments' in event) {
      const args = (event as AppSyncResolverEvent).arguments;
      planId = args.planId;
      userId = args.userId;
      paymentMethodId = args.paymentMethodId;
    } 
    // Direct Lambda invocation format
    else if ('planId' in event && 'userId' in event) {
      const requestData = event as SubscriptionUpgradeRequest;
      planId = requestData.planId;
      userId = requestData.userId;
      paymentMethodId = requestData.paymentMethodId;
    } else {
      throw new Error('Invalid event format');
    }

    if (!planId || !userId) {
      throw new Error('Missing required fields: planId and userId');
    }

    return await processSubscriptionUpgrade(planId, userId, paymentMethodId);
  } catch (error) {
    console.error('Subscription upgrade error:', error);
    return {
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

async function processSubscriptionUpgrade(
  planId: string,
  userId: string,
  paymentMethodId?: string
): Promise<SubscriptionUpgradeResponse> {
  try {

    // Parse plan details
    const planDetails = parsePlanId(planId);
    if (!planDetails) {
      return {
        success: false,
        message: 'Invalid plan ID',
      };
    }

    // For now, simulate successful subscription creation
    // In a real implementation, you would:
    // 1. Process payment with Stripe/PayPal
    // 2. Create subscription record
    // 3. Update user access permissions
    
    const subscriptionId = await createSubscription(userId, planDetails);
    
    return {
      success: true,
      message: 'Subscription upgraded successfully',
      subscriptionId,
      data: {
        planId,
        planName: planDetails.name,
        amount: planDetails.price,
        period: planDetails.period,
        nextBillingDate: calculateNextBillingDate(planDetails.period as 'monthly' | 'yearly'),
      },
    };
  } catch (error) {
    console.error('Subscription upgrade error:', error);
    throw error;
  }
}

function parsePlanId(planId: string) {
  const plans = {
    'perkins-monthly': { name: 'Perkins', price: 0.99, period: 'monthly' },
    'perkins-yearly': { name: 'Perkins', price: 9.50, period: 'yearly' },
  };
  
  return plans[planId as keyof typeof plans] || null;
}

async function createSubscription(userId: string, planDetails: any): Promise<string> {
  // This is a mock implementation
  // In a real app, you would:
  // 1. Create a subscription record in your database
  // 2. Process payment
  // 3. Update user permissions
  
  const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Mock database update (TODO: Implement actual subscription creation)
  
  return subscriptionId;
}

function calculateNextBillingDate(period: 'monthly' | 'yearly'): string {
  const now = new Date();
  if (period === 'monthly') {
    now.setMonth(now.getMonth() + 1);
  } else {
    now.setFullYear(now.getFullYear() + 1);
  }
  return now.toISOString();
}
