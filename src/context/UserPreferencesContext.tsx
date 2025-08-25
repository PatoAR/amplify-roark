import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useSession } from './SessionContext';
import { generateClient } from 'aws-amplify/api';

interface UserPreferences {
  industries: string[];
  countries: string[];
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  savePreferences: (newPrefs: UserPreferences) => Promise<void>;
  dismissDisclaimer: () => void;
  isDisclaimerVisible: boolean;
  isLoading: boolean;
  userProfileId: string | null;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

interface UserPreferencesProviderProps {
  children: ReactNode;
}

export const UserPreferencesProvider: React.FC<UserPreferencesProviderProps> = ({ children }) => {
  const { userId } = useSession();
  const [preferences, setPreferences] = useState<UserPreferences>({
    industries: [],
    countries: []
  });
  const [isDisclaimerVisible, setIsDisclaimerVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfileId, setUserProfileId] = useState<string | null>(null);
  
  // Add debouncing for rapid preference updates
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingPreferencesRef = useRef<UserPreferences | null>(null);

  // Reset disclaimer visibility on every login
  useEffect(() => {
    if (userId) {
      setIsDisclaimerVisible(true);
    }
  }, [userId]);

  // Function to load preferences, fetched only once here
  const loadUserPreferences = useCallback(async (cognitoUserId: string) => {
    setIsLoading(true);
    try {
      const client = generateClient();

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
        // User preferences loaded
      } else {
        // No profile exists, reset to default
        setPreferences({ industries: [], countries: [] });
        setUserProfileId(null);
        // No user profile found, using default preferences
      }
    } catch (error) {
      console.error("Failed to load user preferences:", error);
      // Set default preferences on error
      setPreferences({ industries: [], countries: [] });
      setUserProfileId(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to load preferences when user logs in
  useEffect(() => {
    if (userId) {
      loadUserPreferences(userId);
    } else {
      // No user, reset to default state
      setPreferences({ industries: [], countries: [] });
      setUserProfileId(null);
      setIsLoading(false);
    }
  }, [userId, loadUserPreferences]);

  // Function to save preferences with debouncing
  const savePreferences = useCallback(async (newPrefs: UserPreferences) => {
    if (!userId) {
      console.error("Cannot save preferences, no user is authenticated.");
      return;
    }

    // Store pending preferences for debouncing
    pendingPreferencesRef.current = newPrefs;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for debounced save
    saveTimeoutRef.current = setTimeout(async () => {
      const prefsToSave = pendingPreferencesRef.current;
      if (!prefsToSave) return;

      const client = generateClient();
      if (!client) {
        console.error('Cannot save preferences: Amplify client not available');
        return;
      }

      const payload = {
        industryPreferences: prefsToSave.industries,
        countryPreferences: prefsToSave.countries,
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

        // Update state efficiently by comparing with current state
        setPreferences(prevPrefs => {
          // Only update if there are actual changes
          if (JSON.stringify(prevPrefs) === JSON.stringify(prefsToSave)) {
            return prevPrefs;
          }
          return prefsToSave;
        });
        
         // Preferences saved
      } catch (error) {
        console.error("Error saving preferences", error);
      } finally {
        // Clear pending preferences after save attempt
        pendingPreferencesRef.current = null;
      }
    }, 300); // 300ms debounce delay
  }, [userId, userProfileId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Function to dismiss disclaimer (session-only, no persistence)
  const dismissDisclaimer = useCallback(() => {
    setIsDisclaimerVisible(false);
  }, []);

  const value: UserPreferencesContextType = {
    preferences,
    savePreferences,
    dismissDisclaimer,
    isDisclaimerVisible,
    isLoading,
    userProfileId
  };

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