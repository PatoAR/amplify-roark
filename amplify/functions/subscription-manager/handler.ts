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
}

type SubscriptionEvent = APIGatewayProxyEvent | SubscriptionUpgradeRequest;

export const handler = async (
  event: SubscriptionEvent
): Promise<APIGatewayProxyResult> => {
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
    // Handle different event formats
    // For direct Lambda invocations (via invoke()), event is the payload directly
    let requestData: SubscriptionUpgradeRequest;
    if ('planId' in event && 'userId' in event) {
      // Direct invocation - event is the payload
      requestData = event as SubscriptionUpgradeRequest;
    } else {
      // API Gateway/Function URL - parse from body
      requestData = JSON.parse((event as APIGatewayProxyEvent).body || '{}');
    }

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

    // Parse plan details
    const planDetails = parsePlanId(planId);
    if (!planDetails) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Invalid plan ID',
        }),
      };
    }

    // For now, simulate successful subscription creation
    // In a real implementation, you would:
    // 1. Process payment with Stripe/PayPal
    // 2. Create subscription record
    // 3. Update user access permissions
    
    const subscriptionId = await createSubscription(userId, planDetails);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
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
      }),
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
};

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
