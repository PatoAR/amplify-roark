import { useState, useEffect } from 'react';
import { Menu, MenuItem, Divider, Button, CheckboxField } from "@aws-amplify/ui-react";
import { useNavigate } from "react-router-dom";
import { useAuthenticator } from '@aws-amplify/ui-react';
import Modal from './Modal'
import { client } from "./../../amplify-client"

const INDUSTRY_OPTIONS = [
  { id: 'tech', label: 'Technology' },
  { id: 'fina', label: 'Finance' },
  { id: 'heal', label: 'Healthcare' },
  { id: 'manu', label: 'Manufacturing' },
  { id: 'reta', label: 'Retail' },
  { id: 'educ', label: 'Education' },
];

const HeaderNav = () => {
  const { signOut, user } = useAuthenticator();
  const navigate = useNavigate();
  const [showFiltersModal, setShowFiltersModal] = useState(false); // State to control modal visibility
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [userProfileId, setUserProfileId] = useState<string | null>(null); 
  
  // Load user's saved preferences
  const loadUserPreferences = async (cognitoUserId: string) => {
    try {
      // Query for the specific user's profile using the automatically added 'owner' field
      const { data: userProfiles, errors } = await client.models.UserProfile.list({
        filter: { owner: { eq: cognitoUserId } }
      });

      if (errors){
        console.log ("Error fetching user profile:", errors);
        return;
      }
      if (userProfiles.length > 0) {
        // If a profile exists, load its preferences
        const profile = userProfiles[0];
        // Filter out null/undefined values before setting state
        const preferences = profile.industryPreferences?.filter(
          (industry): industry is string => industry !== null && industry !== undefined
        ) || [];
        setSelectedIndustries(preferences);
        setUserProfileId(profile.id);
      } else {
        // No existing profile, so create a new one when preferences are saved
        console.log("No existing user profile found. A new one will be created on save.");
        setSelectedIndustries([]); // Ensure no old selections persist if no profile
        setUserProfileId(null);
      }
    } catch (error) {
      console.error("Error loading user preferences:", error);
    }
  };

  // Load preferences when the component mounts or user changes
  useEffect(() => {
    if (user && user.userId) { // Only load if a user is logged in
      loadUserPreferences(user.userId);
    } else {
      setSelectedIndustries([]);
      setUserProfileId(null);
    }
  }, [user]); // Re-run if the user object changes
  
  const handleOpenFiltersModal = () => setShowFiltersModal(true);
  const handleCloseFiltersModal = () => setShowFiltersModal(false);

  // Handler for when a checkbox is changed
  const handleIndustryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const industryId = event.target.value;
    const isChecked = event.target.checked;

    setSelectedIndustries(prevSelected => {
      if (isChecked) {
        // Add the industry if it's checked and not already in the array
        return [...prevSelected, industryId];
      } else {
        // Remove the industry if it's unchecked
        return prevSelected.filter(id => id !== industryId);
      }
    });
  };

  // Handler for when selectios are submitted
  const onSubmitFilters = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Submitting selected industries:", selectedIndustries);

    if (!user || !user.userId) {
      console.error("No user logged in. Cannot save preferences.");
      return;
    }

    try {
      if (userProfileId) {
        // Update existing profile
        const { data, errors } = await client.models.UserProfile.update({
          id: userProfileId,
          industryPreferences: selectedIndustries
        });
        if (errors) {
          console.error("Error updating user profile:", errors);
        } else {
          console.log("User preferences updated:", data);
        }
      } else {
        // Create a new profile if one doesn't exist
        const { data, errors } = await client.models.UserProfile.create({
          industryPreferences: selectedIndustries,
        });
        if (errors) {
          console.error("Error creating user profile:", errors);
        } else if (data) {
          console.log("New user profile created:", data);
          setUserProfileId(data.id);
        }
      }
      // trigger a re-fetch of articles based on new filters if needed on the main page.
    } catch (error) {
      console.error("Error saving user preferences:", error);
    }
    handleCloseFiltersModal();
  };

  return (
    <>    
      <Menu menuAlign="end" aria-label="User menu">
        <MenuItem onClick={handleOpenFiltersModal}>Filters</MenuItem>
        <Divider />
        <MenuItem onClick={() => navigate("/settings")}>Settings</MenuItem>
        <MenuItem onClick={signOut}>Logout</MenuItem>
      </Menu>

      <Modal
        show={showFiltersModal}
        onClose={handleCloseFiltersModal}
        title="Apply Filters"
      >
        <form onSubmit={onSubmitFilters}>
          <h3>Filter by Industry:</h3>
          {INDUSTRY_OPTIONS.map((industry) => (
            <CheckboxField
              key={industry.id}
              label={industry.label}
              value={industry.id} // The value when checked
              checked={selectedIndustries.includes(industry.id)} // Check if this industry is in our state
              onChange={handleIndustryChange}
              name="industry" // Common name for all checkboxes in the group (optional for control, good for semantics)
            />
          ))}
          <Button type="submit">Submit</Button>
        </form>
      </Modal>
    </>
  );
};

export default HeaderNav;