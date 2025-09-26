import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { type Schema } from '../../../amplify/data/resource';
import { useSession } from '../../context/SessionContext';
import './AnalyticsDashboard.css';

interface SessionStats {
  totalSessions: number;
  totalDuration: number;
  averageSessionLength: number;
}

export const AnalyticsDashboard = () => {
  const { userId } = useSession();
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalSessions: 0,
    totalDuration: 0,
    averageSessionLength: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (userId) {
      loadAnalytics();
    }
  }, [userId, timeRange]);

  const loadAnalytics = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const client = generateClient<Schema>();
      
      // Calculate date range
      const now = new Date();
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

      // Load session data
      const { data: activities } = await client.models.UserActivity.list({
        filter: { 
          owner: { eq: userId },
          startTime: { ge: startDate.toISOString() }
        }
      });

      // Calculate session stats
      const sessions = activities || [];
      const totalSessions = sessions.length;
      const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);

      setSessionStats({
        totalSessions,
        totalDuration,
        averageSessionLength: totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0,
      });
    } catch (error) {
      console.error('Failed to load analytics', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading) {
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
            <span className="stat-value">{sessionStats.totalSessions}</span>
            <span className="stat-label">Total Sessions</span>
          </div>
          
          <div className="stat-card">
            <span className="stat-value">{formatDuration(sessionStats.totalDuration)}</span>
            <span className="stat-label">Total Time</span>
          </div>
          
          <div className="stat-card">
            <span className="stat-value">
              {sessionStats.totalSessions > 0 
                ? formatDuration(sessionStats.averageSessionLength)
                : '0s'
              }
            </span>
            <span className="stat-label">Average Session Length</span>
          </div>
        </div>

        <div className="analytics-section">
          <h2>Session Overview</h2>
          <p>
            You've had <strong>{sessionStats.totalSessions}</strong> sessions in the last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}.
          </p>
          <p>
            Total time spent: <strong>{formatDuration(sessionStats.totalDuration)}</strong>
          </p>
          {sessionStats.totalSessions > 0 && (
            <p>
              Average session length: <strong>{formatDuration(sessionStats.averageSessionLength)}</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}; 