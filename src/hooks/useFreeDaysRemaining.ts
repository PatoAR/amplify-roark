import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { useSession } from '../context/SessionContext';
import { type Schema } from '../../amplify/data/resource';
import { listUserSubscriptions } from '../graphql/queries';

export function useFreeDaysRemaining() {
  const { userId } = useSession();
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchSubscription = async () => {
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
    };

    fetchSubscription();
  }, [userId]);

  return daysLeft;
} 