import { generateClient } from 'aws-amplify/api';
import { type Schema } from '../amplify/data/resource'; // Gen 2 schema types

// Authenticated client for owner-based models (e.g. UserProfile)
export const authClient = generateClient<Schema>({
  authMode: 'userPool'
});

// Public client for read-only public data (e.g. Article feed)
export const publicClient = generateClient<Schema>({
  authMode: 'apiKey'
});
