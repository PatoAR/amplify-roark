import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSessionManager } from '../hooks/useSessionManager';
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
  const { userId } = useSessionManager();
  const [preferences, setPreferences] = useState<UserPreferences>({
    industries: [],
    countries: []
  });
  const [isDisclaimerVisible, setIsDisclaimerVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfileId, setUserProfileId] = useState<string | null>(null);

  // Reset disclaimer visibility on every login
  useEffect(() => {
    if (userId) {
      setIsDisclaimerVisible(true);
    }
  }, [userId]);

  // Function to load preferences, fetched only once here
  const loadUserPreferences = async (cognitoUserId: string) => {
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
  };

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

  // Function to save preferences
  const savePreferences = async (newPrefs: UserPreferences) => {
    if (!userId) {
      console.error("Cannot save preferences, no user is authenticated.");
      return;
    }

    const client = generateClient();
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
        // trackPreferenceUpdate('industries', changedIndustries); // This line was removed as per the edit hint
      }
      if (changedCountries.length > 0) {
        // trackPreferenceUpdate('countries', changedCountries); // This line was removed as per the edit hint
      }
      
      console.log("Preferences saved successfully.");
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  // Function to dismiss disclaimer (session-only, no persistence)
  const dismissDisclaimer = () => {
    setIsDisclaimerVisible(false);
  };

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