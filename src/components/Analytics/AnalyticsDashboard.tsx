import { useState, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import { type Schema } from '../../../amplify/data/resource';
import './AnalyticsDashboard.css';

interface SessionStats {
  totalSessions: number;
  totalDuration: number;
  averageSessionLength: number;
  totalPageViews: number;
  totalInteractions: number;
}

interface EventStats {
  eventType: string;
  count: number;
  percentage: number;
}

export const AnalyticsDashboard = () => {
  const { user } = useAuthenticator();
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalSessions: 0,
    totalDuration: 0,
    averageSessionLength: 0,
    totalPageViews: 0,
    totalInteractions: 0,
  });
  const [eventStats, setEventStats] = useState<EventStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (user?.userId) {
      loadAnalytics();
    }
  }, [user?.userId, timeRange]);

  const loadAnalytics = async () => {
    if (!user?.userId) return;

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
          owner: { eq: user.userId },
          startTime: { ge: startDate.toISOString() }
        }
      });

      // Load event data
      const { data: events } = await client.models.UserEvent.list({
        filter: { 
          owner: { eq: user.userId },
          timestamp: { ge: startDate.toISOString() }
        }
      });

      // Calculate session stats
      const sessions = activities || [];
      const totalSessions = sessions.length;
      const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
      const totalPageViews = sessions.reduce((sum, session) => sum + (session.pageViews || 0), 0);
      const totalInteractions = sessions.reduce((sum, session) => sum + (session.interactions || 0), 0);

      setSessionStats({
        totalSessions,
        totalDuration,
        averageSessionLength: totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0,
        totalPageViews,
        totalInteractions,
      });

      // Calculate event stats
      const eventCounts: Record<string, number> = {};
      const allEvents = events || [];
      
      allEvents.forEach(event => {
        if (event.eventType) {
          eventCounts[event.eventType] = (eventCounts[event.eventType] || 0) + 1;
        }
      });

      const totalEvents = allEvents.length;
      const eventStatsArray = Object.entries(eventCounts).map(([eventType, count]) => ({
        eventType,
        count,
        percentage: totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0,
      }));

      setEventStats(eventStatsArray.sort((a, b) => b.count - a.count));

    } catch (error) {
      console.error('Failed to load analytics', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatEventType = (eventType: string): string => {
    return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="analytics-dashboard">
        <div className="analytics-loading">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>📊 Activity Analytics</h2>
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

      <div className="analytics-grid">
        <div className="stats-card">
          <h3>Session Overview</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{sessionStats.totalSessions}</span>
              <span className="stat-label">Sessions</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{formatDuration(sessionStats.totalDuration)}</span>
              <span className="stat-label">Total Time</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{formatDuration(sessionStats.averageSessionLength)}</span>
              <span className="stat-label">Avg Session</span>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <h3>Engagement</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{sessionStats.totalPageViews}</span>
              <span className="stat-label">Page Views</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{sessionStats.totalInteractions}</span>
              <span className="stat-label">Interactions</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {sessionStats.totalSessions > 0 
                  ? Math.round(sessionStats.totalPageViews / sessionStats.totalSessions) 
                  : 0}
              </span>
              <span className="stat-label">Views/Session</span>
            </div>
          </div>
        </div>

        <div className="stats-card full-width">
          <h3>Event Breakdown</h3>
          <div className="event-stats">
            {eventStats.length > 0 ? (
              eventStats.map((event) => (
                <div key={event.eventType} className="event-item">
                  <div className="event-info">
                    <span className="event-type">{formatEventType(event.eventType)}</span>
                    <span className="event-count">{event.count}</span>
                  </div>
                  <div className="event-bar">
                    <div 
                      className="event-progress" 
                      style={{ width: `${event.percentage}%` }}
                    />
                  </div>
                  <span className="event-percentage">{event.percentage}%</span>
                </div>
              ))
            ) : (
              <p className="no-data">No activity data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 