import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import { type Schema } from '../../../amplify/data/resource';
import { useSession } from '../../context/SessionContext';
import { listUserActivities, listUserSubscriptions } from '../../graphql/queries';
import { useTranslation } from '../../i18n';
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

const MASTER_EMAIL = 'master@perkinsintel.com';

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

function aggregateAnalytics(
  activities: any[],
  subscriptions: any[],
  timeRange: '7d' | '30d' | '90d'
): AggregatedAnalytics {
  // Calculate date range if provided
  let startDate: string | undefined;
  if (timeRange) {
    const now = new Date();
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const start = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    startDate = start.toISOString();
  }

  // Filter activities by date range if needed
  const filteredActivities = startDate
    ? activities.filter((activity) => {
        const activityDate = new Date(activity.startTime);
        return activityDate >= new Date(startDate!);
      })
    : activities;

  // Calculate registered users
  const uniqueUserIds = new Set(subscriptions.map((sub: any) => sub.owner).filter(Boolean));
  const registeredUsers = uniqueUserIds.size;

  // Calculate sessions per user
  const sessionsByUser = new Map<string, number>();
  filteredActivities.forEach((activity: any) => {
    if (activity.owner) {
      sessionsByUser.set(activity.owner, (sessionsByUser.get(activity.owner) || 0) + 1);
    }
  });

  const totalSessions = filteredActivities.length;

  // Calculate session durations
  const now = new Date();
  let totalDuration = 0;
  let validDurations = 0;

  filteredActivities.forEach((activity: any) => {
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

  // Calculate active users (users with active sessions or activity within the selected time range)
  const activeUserIds = new Set<string>();
  
  // filteredActivities already contains activities within the selected time range
  filteredActivities.forEach((activity: any) => {
    if (activity.owner) {
      // Count users with active sessions or any activity in the time range
      activeUserIds.add(activity.owner);
    }
  });

  const activeUsers = activeUserIds.size;
  
  // Calculate average sessions per user based on active users (not registered users)
  const averageSessionsPerUser = activeUsers > 0 ? totalSessions / activeUsers : 0;

  // Calculate subscription status breakdown
  const statusBreakdown = {
    free_trial: 0,
    active: 0,
    expired: 0,
    cancelled: 0,
  };

  subscriptions.forEach((sub: any) => {
    const status = sub.subscriptionStatus;
    if (status && statusBreakdown.hasOwnProperty(status)) {
      statusBreakdown[status as keyof typeof statusBreakdown]++;
    }
  });

  // Get sessions per user (top users)
  const sessionsPerUser = Array.from(sessionsByUser.entries())
    .map(([userId, sessionCount]) => ({ userId, sessionCount }))
    .sort((a, b) => b.sessionCount - a.sessionCount);

  return {
    registeredUsers,
    totalSessions,
    averageSessionsPerUser: Math.round(averageSessionsPerUser * 100) / 100,
    averageSessionDuration,
    totalTimeSpent: totalDuration,
    activeUsers,
    subscriptionStatusBreakdown: statusBreakdown,
    sessionsPerUser,
  };
}

export const AnalyticsDashboard = () => {
  const { userId } = useSession();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isMasterUser, setIsMasterUser] = useState<boolean | null>(null);
  const [analytics, setAnalytics] = useState<AggregatedAnalytics | null>(null);
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
    if (!userId || !isMasterUser) return;

    setIsLoading(true);
    setError(null);
    try {
      const client = generateClient<Schema>();

      // Fetch all data in parallel
      const [activities, subscriptions] = await Promise.all([
        fetchAllActivities(client),
        fetchAllSubscriptions(client),
      ]);

      // Aggregate analytics in the frontend
      const aggregated = aggregateAnalytics(activities, subscriptions, timeRange);
      setAnalytics(aggregated);
    } catch (error) {
      console.error('Failed to load analytics', error);
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
      </div>
    </div>
  );
};
