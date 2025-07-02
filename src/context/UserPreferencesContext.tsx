import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { authClient } from '../amplify-client'; // Adjust path if needed

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

  // Function to load preferences, fetched only once here
  const loadUserPreferences = useCallback(async (cognitoUserId: string) => {
    setIsLoading(true);
    try {
      const { data: profiles } = await authClient.models.UserProfile.list({
        filter: { owner: { eq: cognitoUserId } }
      });
      if (profiles && profiles.length > 0) {
        const profile = profiles[0];
        setPreferences({
          industries: profile.industryPreferences?.filter(Boolean) as string[] || [],
          countries: profile.countryPreferences?.filter(Boolean) as string[] || [],
        });
        setUserProfileId(profile.id);
      } else {
        // No profile exists, reset to default
        setPreferences({ industries: [], countries: [] });
        setUserProfileId(null);
      }
    } catch (error) {
      console.error("Failed to load user preferences:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    const payload = {
      industryPreferences: newPrefs.industries,
      countryPreferences: newPrefs.countries,
    };
    try {
      if (userProfileId) {
        await authClient.models.UserProfile.update({ id: userProfileId, ...payload });
      } else {
        const { data: newProfile } = await authClient.models.UserProfile.create(payload);
        if (newProfile) setUserProfileId(newProfile.id);
      }
      setPreferences(newPrefs); // Update state immediately for responsiveness
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