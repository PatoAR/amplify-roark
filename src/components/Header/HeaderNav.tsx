import { useState, useEffect } from 'react';
import { Menu, MenuItem, Divider, Button, CheckboxField } from "@aws-amplify/ui-react";
import { useNavigate } from "react-router-dom";
import { useAuthenticator } from '@aws-amplify/ui-react';
import Modal from './Modal'
import { useUserPreferences } from '../../context/UserPreferencesContext';

const INDUSTRY_OPTIONS = [
  { id: '💵 MARKETS', label: '💵 MARKETS' },
  { id: '📈 ECONOMY', label: '📈 ECONOMY' },
  { id: '⛏️ MINING', label: '⛏️ MINING' },
  { id: '⚡ ENERGY', label: '⚡ ENERGY' },
  { id: '🚜 AGRIBUSINESS', label: '🚜 AGRIBUSINESS' },
  { id: '🏛️ FINANCIALS', label: '🏛️ FINANCIALS' },
  { id: '💊 HEALTHCARE', label: '💊 HEALTHCARE' },
  { id: '🏭 INDUSTRIALS', label: '🏭 INDUSTRIALS' },
  { id: '🛰️ TECH•MEDIA•TELCO', label: '🛰️ TECH•MEDIA•TELCO' },
  { id: '🛍️ RETAIL', label: '🛍️ RETAIL' },
  { id: '✈️ TRAVEL•LEISURE', label: '✈️ TRAVEL•LEISURE' },
  { id: '🚂 TRANSPORTATION', label: '🚂 TRANSPORTATION' },
];

const COUNTRY_OPTIONS = [
  { id: 'Q414', label: '🇦🇷 ARG' },
  { id: 'Q155', label: '🇧🇷 BRA' },
];

const HeaderNav = () => {
  const { signOut } = useAuthenticator();
  const navigate = useNavigate();
  const [showFiltersModal, setShowFiltersModal] = useState(false); // State to control modal visibility
  const { preferences, savePreferences } = useUserPreferences();
  const [localIndustries, setLocalIndustries] = useState(preferences.industries);
  const [localCountries, setLocalCountries] = useState(preferences.countries);

  // Ensure local state syncs with the context
  useEffect(() => {
    setLocalIndustries(preferences.industries);
    setLocalCountries(preferences.countries);
  }, [preferences]);

  const handleOpenFiltersModal = () => {
    // When opening the modal, sync local state with context
    setLocalIndustries(preferences.industries);
    setLocalCountries(preferences.countries);
    setShowFiltersModal(true);
  };
  const handleCloseFiltersModal = () => setShowFiltersModal(false);

  const onSubmitFilters = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await savePreferences({
      industries: localIndustries,
      countries: localCountries,
    });
    handleCloseFiltersModal();
  };
  
  // Handlers now update local state
  const handleIndustryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setLocalIndustries(prev => checked ? [...prev, value] : prev.filter(id => id !== value));
  };
  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setLocalCountries(prev => checked ? [...prev, value] : prev.filter(id => id !== value));
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
              checked={localIndustries.includes(industry.id)}
              onChange={handleIndustryChange}
              name="industry"
            />
          ))}
          <Divider />
          <h3>Filter by Country:</h3>
          {COUNTRY_OPTIONS.map((country) => (
            <CheckboxField
              key={country.id}
              label={country.label}
              value={country.id} // The value when checked
              checked={localCountries.includes(country.id)}
              onChange={handleCountryChange}
              name="country"
            />
          ))}
          <Button type="submit">Submit</Button>
        </form>
      </Modal>
    </>
  );
};

export default HeaderNav;