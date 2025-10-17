import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { useSession } from '../context/SessionContext';
import { type Schema } from '../../amplify/data/resource';
import { listUserSubscriptions } from '../graphql/queries';

export function useFreeDaysRemaining() {
  const { userId, isAuthenticated } = useSession();
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only proceed if user is authenticated and we have a userId
    if (!isAuthenticated || !userId) {
      setDaysLeft(null);
      setError(null);
      return;
    }

    const fetchSubscription = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const client = generateClient<Schema>();
        const result = await client.graphql({
          query: listUserSubscriptions,
          variables: { filter: { owner: { eq: userId } } }
        }) as any;
        
        const items = result.data?.listUserSubscriptions?.items || [];
        if (items.length > 0 && items[0].trialEndDate) {
          const end = new Date(items[0].trialEndDate);
          const now = new Date();
          const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          setDaysLeft(Math.max(0, diff));
        } else {
          setDaysLeft(0);
        }
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
        setDaysLeft(0); // Default to 0 days on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [userId, isAuthenticated]);

  return { daysLeft, isLoading, error };
} 