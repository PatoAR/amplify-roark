import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { useSession } from '../../context/SessionContext';
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

export const AnalyticsDashboard = () => {
  const { userId } = useSession();
  const [isMasterUser, setIsMasterUser] = useState<boolean | null>(null);
  const [analytics, setAnalytics] = useState<AggregatedAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

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
      // Get user email to pass to Lambda for verification
      const user = await getCurrentUser();
      const userEmail = user.signInDetails?.loginId || user.username;

      // Invoke the analytics aggregator Lambda function via HTTP endpoint
      const response = await fetch('/api/analytics-aggregator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          timeRange,
          userEmail, // Pass email for Lambda verification
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch analytics data' }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setAnalytics(data);
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
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Show access denied if not master user
  if (isMasterUser === false) {
    return (
      <div className="analytics-dashboard">
        <div className="analytics-header">
          <h1>Analytics Dashboard</h1>
        </div>
        <div className="analytics-content">
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
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
        <div className="analytics-header">
          <h1>Analytics Dashboard</h1>
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
        </div>
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-dashboard">
        <div className="analytics-header">
          <h1>Analytics Dashboard</h1>
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
        </div>
        <div className="analytics-content">
          <div style={{ textAlign: 'center', padding: '3rem', color: '#dc3545' }}>
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={loadAnalytics} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
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
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
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
      </div>

      <div className="analytics-content">
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{analytics.registeredUsers}</span>
            <span className="stat-label">Registered Users</span>
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
            <span className="stat-value">{formatDuration(analytics.averageSessionDuration)}</span>
            <span className="stat-label">Avg Session Duration</span>
          </div>
          
          <div className="stat-card">
            <span className="stat-value">{formatDuration(analytics.totalTimeSpent)}</span>
            <span className="stat-label">Total Time Spent</span>
          </div>
          
          <div className="stat-card">
            <span className="stat-value">{analytics.activeUsers}</span>
            <span className="stat-label">Active Users</span>
          </div>
        </div>

        <div className="analytics-section">
          <h2>System Overview</h2>
          <p>
            There are <strong>{analytics.registeredUsers}</strong> registered users in the system.
          </p>
          <p>
            Total sessions across all users: <strong>{analytics.totalSessions}</strong>
          </p>
          <p>
            Average sessions per user: <strong>{analytics.averageSessionsPerUser.toFixed(1)}</strong>
          </p>
          <p>
            Average session duration: <strong>{formatDuration(analytics.averageSessionDuration)}</strong>
          </p>
          <p>
            Total time spent across all users: <strong>{formatDuration(analytics.totalTimeSpent)}</strong>
          </p>
          <p>
            Active users (last 7 days): <strong>{analytics.activeUsers}</strong>
          </p>
        </div>

        <div className="analytics-section">
          <h2>Subscription Status Breakdown</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <div>Free Trial: <strong>{analytics.subscriptionStatusBreakdown.free_trial}</strong></div>
            <div>Active: <strong>{analytics.subscriptionStatusBreakdown.active}</strong></div>
            <div>Expired: <strong>{analytics.subscriptionStatusBreakdown.expired}</strong></div>
            <div>Cancelled: <strong>{analytics.subscriptionStatusBreakdown.cancelled}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}; 