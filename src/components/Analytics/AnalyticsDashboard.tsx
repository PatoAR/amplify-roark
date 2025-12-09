import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import { Amplify } from 'aws-amplify';
import { type Schema } from '../../../amplify/data/resource';
import { useSession } from '../../context/SessionContext';
import { listUserActivities, listUserSubscriptions, listSESCampaignContacts } from '../../graphql/queries';
import { useTranslation } from '../../i18n';
import { MASTER_EMAIL } from '../../constants/auth';
import './AnalyticsDashboard.css';

interface AggregatedAnalytics {
  registeredUsers: number;
  totalSessions: number;
  averageSessionsPerUser: number;
  averageSessionDuration: number;
  totalTimeSpent: number;
  activeUsers: number;
  subscriptionStatusBreakdown: {
    free_trial: number;
    active: number;
    expired: number;
    cancelled: number;
  };
  sessionsPerUser: Array<{
    userId: string;
    sessionCount: number;
  }>;
}

interface SESCampaignMetrics {
  totalContacts: number;
  contactsSent: number;
  contactsPending: number;
  contactsWithErrors: number;
  permanentFailures: number;
  temporaryFailures: number;
  successRate: number;
  errorRate: number;
  languageDistribution: {
    es: number;
    en: number;
    pt: number;
  };
  topCompanies: Array<{
    company: string;
    contactCount: number;
  }>;
  dailySendRate: number;
  averageDaysToSend: number;
  // Conversion metrics
  contactsRegistered: number;
  conversionRate: number;
  conversionRateByLanguage: {
    es: number;
    en: number;
    pt: number;
  };
}

async function fetchAllActivities(
  client: ReturnType<typeof generateClient<Schema>>,
  startDate?: string
): Promise<any[]> {
  let allActivities: any[] = [];
  let nextToken: string | null = null;

  do {
    const filter: any = {};
    if (startDate) {
      filter.startTime = { ge: startDate };
    }

    const result = await client.graphql({
      query: listUserActivities,
      variables: {
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        limit: 1000,
        nextToken,
      },
    }) as any;

    const items = result.data?.listUserActivities?.items || [];
    allActivities = allActivities.concat(items);
    nextToken = result.data?.listUserActivities?.nextToken || null;
  } while (nextToken);

  return allActivities;
}

async function fetchAllSubscriptions(
  client: ReturnType<typeof generateClient<Schema>>
): Promise<any[]> {
  let allSubscriptions: any[] = [];
  let nextToken: string | null = null;

  do {
    const result = await client.graphql({
      query: listUserSubscriptions,
      variables: {
        limit: 1000,
        nextToken,
      },
    }) as any;

    const items = result.data?.listUserSubscriptions?.items || [];
    allSubscriptions = allSubscriptions.concat(items);
    nextToken = result.data?.listUserSubscriptions?.nextToken || null;
  } while (nextToken);

  return allSubscriptions;
}

async function fetchAllSESCampaignContacts(
  client: ReturnType<typeof generateClient<Schema>>,
): Promise<any[]> {
  // CRITICAL: This must be the FIRST line - if we don't see this, the function isn't being called
  console.log('[AnalyticsDashboard] ===== Starting SES Campaign Contacts Fetch =====');
  console.log('[AnalyticsDashboard] Function entry timestamp:', new Date().toISOString());
  console.log('[AnalyticsDashboard] Client type:', typeof client);
  console.log('[AnalyticsDashboard] Query imported:', typeof listSESCampaignContacts);
  
  // Log Amplify config immediately to diagnose environment issues
  try {
    const config = Amplify.getConfig();
    const apiEndpoint = config.API?.GraphQL?.endpoint || 'NOT CONFIGURED';
    console.log('[AnalyticsDashboard] Current GraphQL Endpoint:', apiEndpoint);
    console.log('[AnalyticsDashboard] API Region:', config.API?.GraphQL?.region || 'NOT SET');
    console.log('[AnalyticsDashboard] Default Auth Mode:', config.API?.GraphQL?.defaultAuthMode || 'NOT SET');
  } catch (configErr) {
    console.error('[AnalyticsDashboard] Failed to read Amplify config:', configErr);
  }
  
  let allContacts: any[] = [];
  let nextToken: string | null = null;
  let pageCount = 0;

  try {
    // First attempt - check if query works at all
    console.log('[AnalyticsDashboard] Attempting first GraphQL query...');
    
    do {
      pageCount++;
      console.log(`[AnalyticsDashboard] === Fetching page ${pageCount} of SES contacts ===`);
      
      // Use GraphQL approach (consistent with fetchAllSubscriptions)
      const result = await client.graphql({
        query: listSESCampaignContacts,
        variables: {
          limit: 1000,
          nextToken,
        },
      }) as any;

      console.log('[AnalyticsDashboard] GraphQL query completed. Checking result...');

      // Log any errors returned (check both result.errors and nested structure)
      if (result.errors && result.errors.length > 0) {
        console.error('[AnalyticsDashboard] ❌ GraphQL Errors in result.errors:');
        result.errors.forEach((error: any, index: number) => {
          console.error(`  Error ${index + 1}: ${error.message}`);
          console.error(`    Type: ${error.errorType}`);
          console.error(`    Path: ${JSON.stringify(error.path)}`);
          console.error(`    Full error:`, JSON.stringify(error, null, 2));
        });
      }

      // Check if result.data exists at all
      if (!result.data) {
        console.error('[AnalyticsDashboard] ❌ No data field in GraphQL result!');
        console.error('[AnalyticsDashboard] Full result:', JSON.stringify(result, null, 2));
        break;
      }

      // Check if listSESCampaignContacts exists
      if (!result.data.listSESCampaignContacts) {
        console.error('[AnalyticsDashboard] ❌ listSESCampaignContacts is null/undefined in result.data!');
        console.error('[AnalyticsDashboard] Available keys in result.data:', Object.keys(result.data));
        console.error('[AnalyticsDashboard] Full result.data:', JSON.stringify(result.data, null, 2));
        break;
      }

      // Log raw result structure for debugging
      console.log('[AnalyticsDashboard] Raw result structure:', {
        hasData: !!result.data?.listSESCampaignContacts,
        dataIsNull: result.data?.listSESCampaignContacts === null,
        dataIsUndefined: result.data?.listSESCampaignContacts === undefined,
        hasItems: !!result.data?.listSESCampaignContacts?.items,
        itemsIsArray: Array.isArray(result.data?.listSESCampaignContacts?.items),
        dataLength: result.data?.listSESCampaignContacts?.items?.length ?? 0,
        hasNextToken: !!result.data?.listSESCampaignContacts?.nextToken,
      });

      const items = result.data?.listSESCampaignContacts?.items || [];
      
      console.log(`[AnalyticsDashboard] Extracted items array length: ${items.length}`);
      
      // Sample first item to see structure
      if (items.length > 0) {
        console.log('[AnalyticsDashboard] ✅ Sample contact structure:', {
          keys: Object.keys(items[0] || {}),
          sample: items[0],
        });
      } else if (pageCount === 1) {
        console.warn('[AnalyticsDashboard] ⚠️ First page returned 0 items. Result structure:', {
          hasListSESCampaignContacts: !!result.data?.listSESCampaignContacts,
          listSESCampaignContactsType: typeof result.data?.listSESCampaignContacts,
          listSESCampaignContactsValue: result.data?.listSESCampaignContacts,
        });
      }

      console.log(`[AnalyticsDashboard] Page ${pageCount}: Fetched ${items.length} contacts`);
      
      const validItems = items.filter((item: any) => item !== null && item !== undefined);
      console.log(`[AnalyticsDashboard] Page ${pageCount}: ${validItems.length} valid contacts after null filter`);
      
      allContacts = allContacts.concat(validItems);
      nextToken = result.data?.listSESCampaignContacts?.nextToken || null;
      
      console.log(`[AnalyticsDashboard] Page ${pageCount} complete. Total so far: ${allContacts.length}, hasNextToken: ${!!nextToken}`);
    } while (nextToken);

    console.log(`[AnalyticsDashboard] ===== Fetch Complete =====`);
    console.log(`[AnalyticsDashboard] Total SES contacts fetched: ${allContacts.length} across ${pageCount} page(s)`);
    
    // Log statistics about the fetched data
    if (allContacts.length > 0) {
      const sentCount = allContacts.filter(c => c.Sent_Status === 'true').length;
      const pendingCount = allContacts.filter(c => c.Sent_Status === 'false').length;
      const withErrors = allContacts.filter(c => c.Error_Status).length;
      
      console.log('[AnalyticsDashboard] ✅ SES contacts breakdown:', {
        total: allContacts.length,
        sent: sentCount,
        pending: pendingCount,
        withErrors: withErrors,
        companies: new Set(allContacts.map(c => c.Company)).size,
        languages: {
          es: allContacts.filter(c => (c.Language || 'es') === 'es').length,
          en: allContacts.filter(c => c.Language === 'en').length,
          pt: allContacts.filter(c => c.Language === 'pt').length,
        }
      });
    } else {
      console.warn('[AnalyticsDashboard] ⚠️⚠️⚠️ WARNING: No SES contacts found in database!');
      console.warn('[AnalyticsDashboard] This could indicate:');
      console.warn('[AnalyticsDashboard] 1. GraphQL API endpoint is pointing to wrong environment');
      console.warn('[AnalyticsDashboard] 2. Authorization rules are blocking access');
      console.warn('[AnalyticsDashboard] 3. Data doesn\'t exist in this environment');
      console.warn('[AnalyticsDashboard] 4. Table name mismatch between branches');
    }

    return allContacts;
  } catch (error) {
    console.error('[AnalyticsDashboard] ❌❌❌ CRITICAL ERROR fetching SES Campaign Contacts ❌❌❌');
    console.error('[AnalyticsDashboard] Error object:', error);
    
    // Better error logging
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as any;
      console.error('[AnalyticsDashboard] Error details:', {
        message: errorObj.message,
        name: errorObj.name,
        errors: errorObj.errors,
        data: errorObj.data,
        stack: errorObj.stack,
      });
      
      // If there are GraphQL errors, log them individually
      if (errorObj.errors && Array.isArray(errorObj.errors)) {
        console.error('[AnalyticsDashboard] GraphQL Errors in catch block:');
        errorObj.errors.forEach((err: any, idx: number) => {
          console.error(`  Error ${idx + 1}:`, JSON.stringify(err, null, 2));
        });
      }
      
      // Check for network/API errors
      if (errorObj.message) {
        if (errorObj.message.includes('Network')) {
          console.error('[AnalyticsDashboard] ⚠️ Network error - check API endpoint configuration');
        }
        if (errorObj.message.includes('Unauthorized') || errorObj.message.includes('401')) {
          console.error('[AnalyticsDashboard] ⚠️ Authorization error - check API key and auth rules');
        }
        if (errorObj.message.includes('Forbidden') || errorObj.message.includes('403')) {
          console.error('[AnalyticsDashboard] ⚠️ Forbidden error - check authorization rules');
        }
      }
    } else {
      console.error('[AnalyticsDashboard] Error (not an object):', String(error));
    }
    
    console.error('[AnalyticsDashboard] Returning empty array to allow dashboard to render');
    // Return empty array instead of throwing to allow dashboard to render
    return [];
  }
}

function normalizeEmail(email: string | null | undefined): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}

function calculateSESCampaignMetrics(contacts: any[], registeredUsers: any[]): SESCampaignMetrics {
  console.log('[AnalyticsDashboard] Calculating SES Campaign Metrics...');
  console.log('[AnalyticsDashboard] Input:', {
    contactsCount: contacts.length,
    registeredUsersCount: registeredUsers.length,
  });

  // Filter out null/undefined contacts to prevent errors
  // Use type guard for better type safety
  const validContacts = contacts.filter((c): c is NonNullable<typeof c> => c !== null && c !== undefined);
  const totalContacts = validContacts.length;
  
  console.log(`[AnalyticsDashboard] Valid contacts after filtering: ${totalContacts}`);
  
  // Log a sample contact to verify structure
  if (validContacts.length > 0) {
    console.log('[AnalyticsDashboard] Sample contact for verification:', {
      hasEmail: !!validContacts[0].email,
      hasCompany: !!validContacts[0].Company,
      hasSentStatus: !!validContacts[0].Sent_Status,
      sentStatusValue: validContacts[0].Sent_Status,
      hasLanguage: !!validContacts[0].Language,
      languageValue: validContacts[0].Language,
      keys: Object.keys(validContacts[0]),
    });
  }
  
  // Count by status
  const contactsSent = validContacts.filter(c => c.Sent_Status === 'true').length;
  const contactsPending = validContacts.filter(c => c.Sent_Status === 'false').length;
  const contactsWithErrors = validContacts.filter(c => c.Error_Status).length;
  const permanentFailures = validContacts.filter(c => 
    c.Error_Status && c.Error_Status.includes('PERMANENT_FAILURE:')
  ).length;
  const temporaryFailures = contactsWithErrors - permanentFailures;
  
  console.log('[AnalyticsDashboard] Status breakdown:', {
    total: totalContacts,
    sent: contactsSent,
    pending: contactsPending,
    withErrors: contactsWithErrors,
    permanentFailures,
    temporaryFailures,
  });
  
  // Calculate rates
  const attempted = contactsSent + contactsWithErrors;
  const successRate = attempted > 0 ? (contactsSent / attempted) * 100 : 0;
  const errorRate = attempted > 0 ? (contactsWithErrors / attempted) * 100 : 0;
  
  // Language distribution
  const languageDistribution = {
    es: validContacts.filter(c => (c.Language || 'es') === 'es').length,
    en: validContacts.filter(c => c.Language === 'en').length,
    pt: validContacts.filter(c => c.Language === 'pt').length,
  };
  
  // Top companies
  const companyCounts = new Map<string, number>();
  validContacts.forEach(c => {
    const company = c.Company || 'Unknown';
    companyCounts.set(company, (companyCounts.get(company) || 0) + 1);
  });
  
  const topCompanies = Array.from(companyCounts.entries())
    .map(([company, contactCount]) => ({ company, contactCount }))
    .sort((a, b) => b.contactCount - a.contactCount)
    .slice(0, 10);
  
  // Calculate daily send rate (average sends per day)
  const sentContacts = validContacts.filter(c => c.Sent_Status === 'true' && c.Sent_Date);
  const sentDates = sentContacts.map(c => c.Sent_Date).filter(Boolean);
  const uniqueDays = new Set(sentDates).size;
  const dailySendRate = uniqueDays > 0 ? sentContacts.length / uniqueDays : 0;
  
  // Calculate average days to send (from target date to sent date)
  let totalDaysToSend = 0;
  let validDaysToSend = 0;
  sentContacts.forEach(c => {
    if (c.Target_Send_Date && c.Sent_Date) {
      const targetDate = new Date(c.Target_Send_Date);
      const sentDate = new Date(c.Sent_Date);
      const daysDiff = Math.ceil((sentDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff >= 0) {
        totalDaysToSend += daysDiff;
        validDaysToSend++;
      }
    }
  });
  const averageDaysToSend = validDaysToSend > 0 ? totalDaysToSend / validDaysToSend : 0;
  
  // Calculate conversion metrics - match campaign contacts with registered users by email
  const registeredEmails = new Set(
    registeredUsers
      .filter((u): u is NonNullable<typeof u> & { email: string } => u !== null && u !== undefined && Boolean(u.email))
      .map(u => normalizeEmail(u.email))
      .filter(email => email !== '') // Filter out empty emails after normalization
  );
  
  // Find contacts that registered (were sent and registered)
  const contactsRegistered = validContacts.filter(c => {
    if (!c.email) return false;
    const contactEmail = normalizeEmail(c.email);
    return c.Sent_Status === 'true' && registeredEmails.has(contactEmail);
  }).length;
  
  // Calculate overall conversion rate (registered / sent)
  const conversionRate = contactsSent > 0 ? (contactsRegistered / contactsSent) * 100 : 0;
  
  // Calculate conversion rate by language
  const conversionRateByLanguage = {
    es: (() => {
      const sentES = validContacts.filter(c => c.Sent_Status === 'true' && (c.Language || 'es') === 'es').length;
      const registeredES = validContacts.filter(c => {
        if (!c.email) return false;
        const contactEmail = normalizeEmail(c.email);
        return c.Sent_Status === 'true' && (c.Language || 'es') === 'es' && registeredEmails.has(contactEmail);
      }).length;
      return sentES > 0 ? (registeredES / sentES) * 100 : 0;
    })(),
    en: (() => {
      const sentEN = validContacts.filter(c => c.Sent_Status === 'true' && c.Language === 'en').length;
      const registeredEN = validContacts.filter(c => {
        if (!c.email) return false;
        const contactEmail = normalizeEmail(c.email);
        return c.Sent_Status === 'true' && c.Language === 'en' && registeredEmails.has(contactEmail);
      }).length;
      return sentEN > 0 ? (registeredEN / sentEN) * 100 : 0;
    })(),
    pt: (() => {
      const sentPT = validContacts.filter(c => c.Sent_Status === 'true' && c.Language === 'pt').length;
      const registeredPT = validContacts.filter(c => {
        if (!c.email) return false;
        const contactEmail = normalizeEmail(c.email);
        return c.Sent_Status === 'true' && c.Language === 'pt' && registeredEmails.has(contactEmail);
      }).length;
      return sentPT > 0 ? (registeredPT / sentPT) * 100 : 0;
    })(),
  };
  
  const metrics = {
    totalContacts,
    contactsSent,
    contactsPending,
    contactsWithErrors,
    permanentFailures,
    temporaryFailures,
    successRate: Math.round(successRate * 100) / 100,
    errorRate: Math.round(errorRate * 100) / 100,
    languageDistribution,
    topCompanies,
    dailySendRate: Math.round(dailySendRate * 100) / 100,
    averageDaysToSend: Math.round(averageDaysToSend * 100) / 100,
    contactsRegistered,
    conversionRate: Math.round(conversionRate * 100) / 100,
    conversionRateByLanguage: {
      es: Math.round(conversionRateByLanguage.es * 100) / 100,
      en: Math.round(conversionRateByLanguage.en * 100) / 100,
      pt: Math.round(conversionRateByLanguage.pt * 100) / 100,
    },
  };
  
  console.log('[AnalyticsDashboard] Calculated SES metrics:', metrics);
  
  return metrics;
}

function aggregateAnalytics(
  activities: any[],
  subscriptions: any[],
  timeRange: '7d' | '30d' | '90d',
  masterUserId?: string
): AggregatedAnalytics {
  console.log('[aggregateAnalytics] Starting aggregation:', {
    totalActivities: activities.length,
    totalSubscriptions: subscriptions.length,
    timeRange,
    masterUserId,
  });

  // Calculate date range if provided
  let startDate: string | undefined;
  if (timeRange) {
    const now = new Date();
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const start = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    startDate = start.toISOString();
  }

  // Filter out master user data if masterUserId is provided
  let filteredActivities = activities;
  const masterActivityCount = masterUserId 
    ? activities.filter((activity) => activity.owner === masterUserId).length 
    : 0;
  if (masterUserId) {
    filteredActivities = filteredActivities.filter((activity) => activity.owner !== masterUserId);
  }

  // Filter activities by date range if needed
  const beforeDateFilter = filteredActivities.length;
  filteredActivities = startDate
    ? filteredActivities.filter((activity) => {
        const activityDate = new Date(activity.startTime);
        return activityDate >= new Date(startDate!);
      })
    : filteredActivities;
  const afterDateFilter = filteredActivities.length;

  // Filter out master user subscriptions if masterUserId is provided
  let filteredSubscriptions = subscriptions;
  const masterSubscriptionCount = masterUserId
    ? subscriptions.filter((sub: any) => sub.owner === masterUserId).length
    : 0;
  if (masterUserId) {
    filteredSubscriptions = filteredSubscriptions.filter((sub: any) => sub.owner !== masterUserId);
  }

  console.log('[aggregateAnalytics] After filtering:', {
    filteredActivities: filteredActivities.length,
    filteredSubscriptions: filteredSubscriptions.length,
    masterActivitiesExcluded: masterActivityCount,
    masterSubscriptionsExcluded: masterSubscriptionCount,
    activitiesExcludedByDateRange: beforeDateFilter - afterDateFilter,
  });

  // Calculate registered users (excluding master user)
  const registeredUserIds = new Set(filteredSubscriptions.map((sub: any) => sub.owner).filter(Boolean));
  const registeredUsers = registeredUserIds.size;

  console.log('[aggregateAnalytics] Registered users:', {
    count: registeredUsers,
    userIds: Array.from(registeredUserIds),
  });

  // Calculate sessions per user (only for registered users)
  const sessionsByUser = new Map<string, number>();
  filteredActivities.forEach((activity: any) => {
    if (activity.owner && registeredUserIds.has(activity.owner)) {
      sessionsByUser.set(activity.owner, (sessionsByUser.get(activity.owner) || 0) + 1);
    }
  });

  // Filter activities to only include those from registered users
  const registeredUserActivities = filteredActivities.filter((activity: any) => 
    activity.owner && registeredUserIds.has(activity.owner)
  );

  const totalSessions = registeredUserActivities.length;

  // Calculate session durations (only for registered users)
  const now = new Date();
  let totalDuration = 0;
  let validDurations = 0;

  registeredUserActivities.forEach((activity: any) => {
    if (activity.duration) {
      totalDuration += activity.duration;
      validDurations++;
    } else if (activity.isActive && activity.startTime) {
      // Calculate duration for active sessions
      const sessionStart = new Date(activity.startTime);
      const seconds = Math.floor((now.getTime() - sessionStart.getTime()) / 1000);
      if (seconds > 0) {
        totalDuration += seconds;
        validDurations++;
      }
    }
  });

  const averageSessionDuration = validDurations > 0 ? Math.round(totalDuration / validDurations) : 0;

  // Calculate active users (registered users with activity within the selected time range)
  // Active users = registered users who have activities in the time range
  const activeUserIds = new Set<string>();
  
  registeredUserActivities.forEach((activity: any) => {
    if (activity.owner) {
      activeUserIds.add(activity.owner);
    }
  });

  const activeUsers = activeUserIds.size;

  // Log activities from users without subscriptions (for debugging)
  const activitiesFromUnregisteredUsers = filteredActivities.filter(
    (activity: any) => activity.owner && !registeredUserIds.has(activity.owner)
  );
  if (activitiesFromUnregisteredUsers.length > 0) {
    const unregisteredUserIds = new Set(
      activitiesFromUnregisteredUsers.map((a: any) => a.owner).filter(Boolean)
    );
    console.warn('[aggregateAnalytics] Found activities from users without subscriptions:', {
      activityCount: activitiesFromUnregisteredUsers.length,
      uniqueUserIds: Array.from(unregisteredUserIds),
      note: 'These are excluded from Active Users calculation',
    });
  }

  console.log('[aggregateAnalytics] Active users:', {
    count: activeUsers,
    userIds: Array.from(activeUserIds),
    registeredUserActivities: registeredUserActivities.length,
  });
  
  // Calculate average sessions per user based on active users (not registered users)
  const averageSessionsPerUser = activeUsers > 0 ? totalSessions / activeUsers : 0;

  // Calculate subscription status breakdown
  const statusBreakdown = {
    free_trial: 0,
    active: 0,
    expired: 0,
    cancelled: 0,
  };

  filteredSubscriptions.forEach((sub: any) => {
    const status = sub.subscriptionStatus;
    if (status && statusBreakdown.hasOwnProperty(status)) {
      statusBreakdown[status as keyof typeof statusBreakdown]++;
    }
  });

  // Get sessions per user (top users)
  const sessionsPerUser = Array.from(sessionsByUser.entries())
    .map(([userId, sessionCount]) => ({ userId, sessionCount }))
    .sort((a, b) => b.sessionCount - a.sessionCount);

  const result = {
    registeredUsers,
    totalSessions,
    averageSessionsPerUser: Math.round(averageSessionsPerUser * 100) / 100,
    averageSessionDuration,
    totalTimeSpent: totalDuration,
    activeUsers,
    subscriptionStatusBreakdown: statusBreakdown,
    sessionsPerUser,
  };

  console.log('[aggregateAnalytics] Final metrics:', {
    registeredUsers: result.registeredUsers,
    activeUsers: result.activeUsers,
    totalSessions: result.totalSessions,
    averageSessionsPerUser: result.averageSessionsPerUser,
    subscriptionStatusBreakdown: result.subscriptionStatusBreakdown,
  });

  return result;
}

export const AnalyticsDashboard = () => {
  const { userId } = useSession();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isMasterUser, setIsMasterUser] = useState<boolean | null>(null);
  const [analytics, setAnalytics] = useState<AggregatedAnalytics | null>(null);
  const [sesMetrics, setSESMetrics] = useState<SESCampaignMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const handleBack = () => {
    navigate('/');
  };

  // Check if user is master
  useEffect(() => {
    const checkMasterUser = async () => {
      try {
        const user = await getCurrentUser();
        const userEmail = user.signInDetails?.loginId || user.username;
        setIsMasterUser(userEmail?.toLowerCase() === MASTER_EMAIL.toLowerCase());
      } catch (error) {
        console.error('Failed to get current user:', error);
        setIsMasterUser(false);
      }
    };

    if (userId) {
      checkMasterUser();
    }
  }, [userId]);

  const loadAnalytics = useCallback(async () => {
    if (!userId || !isMasterUser) {
      console.log('[AnalyticsDashboard] Skipping analytics load - userId:', userId, 'isMasterUser:', isMasterUser);
      return;
    }

    console.log('[AnalyticsDashboard] Starting analytics load for userId:', userId, 'timeRange:', timeRange);
    
    // Log Amplify configuration to help diagnose environment issues
    try {
      const config = Amplify.getConfig();
      console.log('[AnalyticsDashboard] Amplify API Configuration:', {
        hasAPI: !!config.API,
        graphqlEndpoint: config.API?.GraphQL?.endpoint || 'NOT SET',
        region: config.API?.GraphQL?.region || 'NOT SET',
        defaultAuthMode: config.API?.GraphQL?.defaultAuthMode || 'NOT SET',
      });
    } catch (configError) {
      console.warn('[AnalyticsDashboard] Could not read Amplify config:', configError);
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const client = generateClient<Schema>();

      // Fetch all data in parallel
      console.log('[AnalyticsDashboard] Fetching all data sources in parallel...');
      console.log('[AnalyticsDashboard] Starting Promise.all for activities, subscriptions, and SES contacts...');
      
      // Wrap SES contacts fetch individually to catch any errors
      let sesContacts: any[] = [];
      try {
        console.log('[AnalyticsDashboard] About to call fetchAllSESCampaignContacts...');
        sesContacts = await fetchAllSESCampaignContacts(client);
        console.log('[AnalyticsDashboard] fetchAllSESCampaignContacts returned:', sesContacts.length, 'contacts');
      } catch (sesError) {
        console.error('[AnalyticsDashboard] ❌ ERROR in fetchAllSESCampaignContacts:', sesError);
        console.error('[AnalyticsDashboard] Error details:', {
          message: sesError instanceof Error ? sesError.message : String(sesError),
          stack: sesError instanceof Error ? sesError.stack : undefined,
          fullError: sesError,
        });
        sesContacts = []; // Continue with empty array
      }
      
      // Fetch other data in parallel
      const [activities, subscriptions] = await Promise.all([
        fetchAllActivities(client),
        fetchAllSubscriptions(client),
      ]);

      console.log('[AnalyticsDashboard] ===== Promise.all complete =====');
      console.log('[AnalyticsDashboard] Data fetch complete:', {
        activitiesCount: activities.length,
        subscriptionsCount: subscriptions.length,
        sesContactsCount: sesContacts.length,
      });
      
      // Log detailed info about sesContacts
      if (sesContacts.length === 0) {
        console.warn('[AnalyticsDashboard] ⚠️⚠️⚠️ sesContacts array is EMPTY!');
        console.warn('[AnalyticsDashboard] This will cause all SES metrics to show zero.');
        console.warn('[AnalyticsDashboard] Check the fetchAllSESCampaignContacts logs above for details.');
      } else {
        console.log('[AnalyticsDashboard] ✅ sesContacts fetched successfully:', {
          count: sesContacts.length,
          firstContactSample: sesContacts[0] ? Object.keys(sesContacts[0]) : 'N/A',
        });
      }

      // Aggregate analytics in the frontend (exclude master user data)
      console.log('[AnalyticsDashboard] Aggregating user analytics...');
      console.log('[AnalyticsDashboard] Master user info:', {
        userId,
        isMasterUser,
        totalActivitiesBeforeFilter: activities.length,
        totalSubscriptionsBeforeFilter: subscriptions.length,
      });
      
      // Log master user's activities and subscriptions for verification
      if (userId) {
        const masterActivities = activities.filter((a: any) => a.owner === userId);
        const masterSubscriptions = subscriptions.filter((s: any) => s.owner === userId);
        console.log('[AnalyticsDashboard] Master user data to be excluded:', {
          activities: masterActivities.length,
          subscriptions: masterSubscriptions.length,
          activityOwners: masterActivities.map((a: any) => a.owner).slice(0, 5),
          subscriptionOwners: masterSubscriptions.map((s: any) => s.owner).slice(0, 5),
        });
      }
      
      const aggregated = aggregateAnalytics(activities, subscriptions, timeRange, userId);
      setAnalytics(aggregated);
      console.log('[AnalyticsDashboard] User analytics aggregated:', {
        registeredUsers: aggregated.registeredUsers,
        totalSessions: aggregated.totalSessions,
        activeUsers: aggregated.activeUsers,
      });
      
      // Calculate SES campaign metrics (pass filtered subscriptions to exclude master user)
      console.log('[AnalyticsDashboard] Calculating SES campaign metrics...');
      const filteredSubscriptionsForSES = userId
        ? subscriptions.filter((sub: any) => sub.owner !== userId)
        : subscriptions;
      console.log('[AnalyticsDashboard] SES metrics - subscriptions:', {
        total: subscriptions.length,
        filtered: filteredSubscriptionsForSES.length,
        masterExcluded: subscriptions.length - filteredSubscriptionsForSES.length,
      });
      const sesCampaignMetrics = calculateSESCampaignMetrics(sesContacts, filteredSubscriptionsForSES);
      setSESMetrics(sesCampaignMetrics);
      console.log('[AnalyticsDashboard] ✅ Analytics load complete');
    } catch (error) {
      console.error('[AnalyticsDashboard] ❌ Failed to load analytics:', error);
      console.error('[AnalyticsDashboard] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      setError(error instanceof Error ? error.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, [userId, isMasterUser, timeRange]);

  useEffect(() => {
    if (userId && isMasterUser) {
      loadAnalytics();
    } else if (isMasterUser === false) {
      setIsLoading(false);
    }
  }, [userId, isMasterUser, timeRange, loadAnalytics]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return '0m';
    }
  };

  // Show access denied if not master user
  if (isMasterUser === false) {
    return (
      <div className="analytics-dashboard">
        <div className="analytics-page-header">
          <button
            onClick={handleBack}
            className="back-button"
          >
            {t('settings.backToNews')}
          </button>
        </div>
        <div className="analytics-header">
          <h1>Analytics Dashboard</h1>
        </div>
        <div className="analytics-content">
          <div className="error-message">
            <h2>Access Denied</h2>
            <p>You do not have permission to access this dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || isMasterUser === null) {
    return (
      <div className="analytics-dashboard">
        <div className="analytics-page-header">
          <button
            onClick={handleBack}
            className="back-button"
          >
            {t('settings.backToNews')}
          </button>
        </div>
        <div className="analytics-header">
          <h1>Analytics Dashboard</h1>
        </div>
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-dashboard">
        <div className="analytics-page-header">
          <button
            onClick={handleBack}
            className="back-button"
          >
            {t('settings.backToNews')}
          </button>
        </div>
        <div className="analytics-header">
          <h1>Analytics Dashboard</h1>
        </div>
        <div className="analytics-content">
          <div className="error-message error">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={loadAnalytics} className="retry-button">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-page-header">
        <button
          onClick={handleBack}
          className="back-button"
        >
          {t('settings.backToNews')}
        </button>
      </div>

      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
      </div>
      
      <div className="time-range-selector">
        <button
          className={timeRange === '7d' ? 'active' : ''}
          onClick={() => setTimeRange('7d')}
        >
          7 Days
        </button>
        <button
          className={timeRange === '30d' ? 'active' : ''}
          onClick={() => setTimeRange('30d')}
        >
          30 Days
        </button>
        <button
          className={timeRange === '90d' ? 'active' : ''}
          onClick={() => setTimeRange('90d')}
        >
          90 Days
        </button>
      </div>

      <div className="analytics-content">
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{analytics.activeUsers}</span>
            <span className="stat-label">Active Users</span>
          </div>

          <div className="stat-card">
            <span className="stat-value">{analytics.totalSessions}</span>
            <span className="stat-label">Total Sessions</span>
          </div>

          <div className="stat-card">
            <span className="stat-value">
              {analytics.averageSessionsPerUser.toFixed(1)}
            </span>
            <span className="stat-label">Avg Sessions Per User</span>
          </div>

          <div className="stat-card">
            <span className="stat-value">{analytics.registeredUsers}</span>
            <span className="stat-label">Registered Users</span>
          </div>

          <div className="stat-card">
            <span className="stat-value">{formatDuration(analytics.totalTimeSpent)}</span>
            <span className="stat-label">Total Time Spent</span>
          </div>

          <div className="stat-card">
            <span className="stat-value">{formatDuration(analytics.averageSessionDuration)}</span>
            <span className="stat-label">Avg Session Duration</span>
          </div>
        </div>

        <div className="subscription-card">
          <h2 className="subscription-card-title">Subscription Status Breakdown</h2>
          <div className="subscription-items">
            <div className="subscription-item">
              <span className="subscription-label">Free Trial</span>
              <span className="subscription-value">{analytics.subscriptionStatusBreakdown.free_trial}</span>
            </div>
            <div className="subscription-item">
              <span className="subscription-label">Active</span>
              <span className="subscription-value">{analytics.subscriptionStatusBreakdown.active}</span>
            </div>
            <div className="subscription-item">
              <span className="subscription-label">Expired</span>
              <span className="subscription-value">{analytics.subscriptionStatusBreakdown.expired}</span>
            </div>
            <div className="subscription-item">
              <span className="subscription-label">Cancelled</span>
              <span className="subscription-value">{analytics.subscriptionStatusBreakdown.cancelled}</span>
            </div>
          </div>
        </div>

        {sesMetrics && (
          <>
            <h2 className="section-title" style={{ marginTop: 'var(--space-2xl)', marginBottom: 'var(--space-lg)' }}>
              SES Campaign Metrics
            </h2>
            
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-value">{sesMetrics.totalContacts}</span>
                <span className="stat-label">Total Contacts</span>
              </div>

              <div className="stat-card">
                <span className="stat-value">{sesMetrics.contactsSent}</span>
                <span className="stat-label">Contacts Sent</span>
              </div>

              <div className="stat-card">
                <span className="stat-value">{sesMetrics.contactsPending}</span>
                <span className="stat-label">Contacts Pending</span>
              </div>

              <div className="stat-card">
                <span className="stat-value">{sesMetrics.contactsWithErrors}</span>
                <span className="stat-label">Contacts With Errors</span>
              </div>

              <div className="stat-card">
                <span className="stat-value">{sesMetrics.successRate.toFixed(0)}%</span>
                <span className="stat-label">Success Rate</span>
              </div>

              <div className="stat-card">
                <span className="stat-value">{sesMetrics.errorRate.toFixed(0)}%</span>
                <span className="stat-label">Error Rate</span>
              </div>

              <div className="stat-card">
                <span className="stat-value">{sesMetrics.permanentFailures}</span>
                <span className="stat-label">Permanent Failures</span>
              </div>

              <div className="stat-card">
                <span className="stat-value">{sesMetrics.temporaryFailures}</span>
                <span className="stat-label">Temporary Failures</span>
              </div>

              <div className="stat-card">
                <span className="stat-value">{sesMetrics.dailySendRate.toFixed(1)}</span>
                <span className="stat-label">Avg Daily Send Rate</span>
              </div>

              <div className="stat-card" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-primary)' }}>
                <span className="stat-value">{sesMetrics.contactsRegistered}</span>
                <span className="stat-label">Contacts Registered</span>
              </div>

              <div className="stat-card" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-primary)' }}>
                <span className="stat-value">{sesMetrics.conversionRate.toFixed(0)}%</span>
                <span className="stat-label">Conversion Rate</span>
              </div>
            </div>

            <div className="subscription-card">
              <h2 className="subscription-card-title">Language Distribution</h2>
              <div className="subscription-items">
                <div className="subscription-item">
                  <span className="subscription-label">Spanish (es)</span>
                  <span className="subscription-value">{sesMetrics.languageDistribution.es}</span>
                </div>
                <div className="subscription-item">
                  <span className="subscription-label">English (en)</span>
                  <span className="subscription-value">{sesMetrics.languageDistribution.en}</span>
                </div>
                <div className="subscription-item">
                  <span className="subscription-label">Portuguese (pt)</span>
                  <span className="subscription-value">{sesMetrics.languageDistribution.pt}</span>
                </div>
              </div>
            </div>

            <div className="subscription-card" style={{ marginTop: 'var(--space-2xl)' }}>
              <h2 className="subscription-card-title">Conversion Rate by Language</h2>
              <div className="subscription-items">
                <div className="subscription-item">
                  <span className="subscription-label">Spanish (es)</span>
                  <span className="subscription-value">{sesMetrics.conversionRateByLanguage.es.toFixed(0)}%</span>
                </div>
                <div className="subscription-item">
                  <span className="subscription-label">English (en)</span>
                  <span className="subscription-value">{sesMetrics.conversionRateByLanguage.en.toFixed(0)}%</span>
                </div>
                <div className="subscription-item">
                  <span className="subscription-label">Portuguese (pt)</span>
                  <span className="subscription-value">{sesMetrics.conversionRateByLanguage.pt.toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {sesMetrics.topCompanies.length > 0 && (
              <div className="subscription-card" style={{ marginTop: 'var(--space-2xl)' }}>
                <h2 className="subscription-card-title">Top Companies</h2>
                <div className="subscription-items">
                  {sesMetrics.topCompanies.map((company, index) => (
                    <div key={index} className="subscription-item">
                      <span className="subscription-label">{company.company}</span>
                      <span className="subscription-value">{company.contactCount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
