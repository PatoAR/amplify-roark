import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import { type Schema } from '../../amplify/data/resource';
import { useActivityTracking } from '../hooks/useActivityTracking';

interface UserPreferences {
  industries: string[];
  countries: string[];
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  savePreferences: (newPrefs: UserPreferences) => Promise<void>;
  isLoading: boolean;
  userProfileId: string | null; 
}

// Create the context with a default value
const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

// Create the Provider component
export const UserPreferencesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuthenticator();
  const [preferences, setPreferences] = useState<UserPreferences>({ industries: [], countries: [] });
  const [userProfileId, setUserProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { trackPreferenceUpdate } = useActivityTracking();
  const clientRef = useRef<ReturnType<typeof generateClient<Schema>> | null>(null);

  // Initialize client when needed
  const getClient = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = generateClient<Schema>();
    }
    return clientRef.current;
  }, []);

  // Function to load preferences, fetched only once here
  const loadUserPreferences = useCallback(async (cognitoUserId: string) => {
    setIsLoading(true);
    try {
      const client = getClient();

      const listUserProfilesQuery = /* GraphQL */ `
        query ListUserProfiles($filter: ModelUserProfileFilterInput) {
          listUserProfiles(filter: $filter) {
            items {
              id
              owner
              industryPreferences
              countryPreferences
            }
          }
        }
      `;

      const result = await client.graphql({
        query: listUserProfilesQuery,
        variables: {
          filter: { owner: { eq: cognitoUserId } }
        }
      }) as any;

      const profiles = result.data?.listUserProfiles?.items || [];
      if (profiles && profiles.length > 0) {
        const profile = profiles[0];
        setPreferences({
          industries: profile.industryPreferences?.filter(Boolean) as string[] || [],
          countries: profile.countryPreferences?.filter(Boolean) as string[] || [],
        });
        setUserProfileId(profile.id);
        console.log('✅ User preferences loaded successfully');
      } else {
        // No profile exists, reset to default
        setPreferences({ industries: [], countries: [] });
        setUserProfileId(null);
        console.log('ℹ️ No user profile found, using default preferences');
      }
    } catch (error) {
      console.error("Failed to load user preferences:", error);
      // Set default preferences on error
      setPreferences({ industries: [], countries: [] });
      setUserProfileId(null);
    } finally {
      setIsLoading(false);
    }
  }, [getClient]);

  // Effect to load preferences when user logs in
  useEffect(() => {
    if (user?.userId) {
      loadUserPreferences(user.userId);
    } else {
      // No user, reset to default state
      setPreferences({ industries: [], countries: [] });
      setUserProfileId(null);
      setIsLoading(false);
    }
  }, [user, loadUserPreferences]);

  // Function to save preferences
  const savePreferences = async (newPrefs: UserPreferences) => {
    if (!user?.userId) {
      console.error("Cannot save preferences, no user is authenticated.");
      return;
    }

    const client = getClient();
    if (!client) {
      console.error('Cannot save preferences: Amplify client not available');
      return;
    }

    const payload = {
      industryPreferences: newPrefs.industries,
      countryPreferences: newPrefs.countries,
    };
    try {
      if (userProfileId) {
        // Update existing profile
        const updateUserProfileMutation = /* GraphQL */ `
          mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
            updateUserProfile(input: $input) {
              id
              owner
              industryPreferences
              countryPreferences
            }
          }
        `;

        await client.graphql({
          query: updateUserProfileMutation,
          variables: {
            input: { id: userProfileId, ...payload }
          }
        }) as any;
      } else {
        // Create new profile
        const createUserProfileMutation = /* GraphQL */ `
          mutation CreateUserProfile($input: CreateUserProfileInput!) {
            createUserProfile(input: $input) {
              id
              owner
              industryPreferences
              countryPreferences
            }
          }
        `;

        const result = await client.graphql({
          query: createUserProfileMutation,
          variables: {
            input: payload
          }
        }) as any;

        if (result.data?.createUserProfile) {
          setUserProfileId(result.data.createUserProfile.id);
        }
      }
      setPreferences(newPrefs); // Update state immediately for responsiveness
      
      // Track preference updates
      const changedIndustries = newPrefs.industries.filter(ind => !preferences.industries.includes(ind));
      const changedCountries = newPrefs.countries.filter(country => !preferences.countries.includes(country));
      
      if (changedIndustries.length > 0) {
        trackPreferenceUpdate('industries', changedIndustries);
      }
      if (changedCountries.length > 0) {
        trackPreferenceUpdate('countries', changedCountries);
      }
      
      console.log("Preferences saved successfully.");
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  const value = { preferences, savePreferences, isLoading, userProfileId };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

// Create a custom hook for easy consumption
export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};