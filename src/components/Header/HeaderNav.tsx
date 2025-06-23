import { useState, useEffect } from 'react';
import { Menu, MenuItem, Divider, Button } from "@aws-amplify/ui-react";
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
  { id: 'Q414', label: 'ARG', code:'ar' },
  { id: 'Q155', label: 'BRA', code: 'br' },
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
  
  // Handlers for tag system
  const handleIndustryChange = (industryId: string) => {
    setLocalIndustries(prev => 
      prev.includes(industryId) 
        ? prev.filter(id => id !== industryId) 
        : [...prev, industryId]
    );
  };

  const handleCountryChange = (countryId: string) => {
    setLocalCountries(prev => 
      prev.includes(countryId) 
        ? prev.filter(id => id !== countryId) 
        : [...prev, countryId]
    );
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
        title="Select News Filters"
      >
        {/* The form is now much cleaner and uses the tag system */}
        <form onSubmit={onSubmitFilters} className="modal-form-layout">
          <div className="form-section">
            <h3 className="section-title">Industries</h3>
            <div className="tag-container">
              {INDUSTRY_OPTIONS.map((industry) => (
                <button
                  type="button" // Important to prevent form submission on click
                  key={industry.id}
                  className="tag-button"
                  data-checked={localIndustries.includes(industry.id)}
                  onClick={() => handleIndustryChange(industry.id)}
                >
                  {industry.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="form-section">
            <h3 className="section-title">Countries</h3>
            <div className="tag-container">
              {COUNTRY_OPTIONS.map((country) => (
                <button
                  type="button"
                  key={country.id}
                  className="tag-button"
                  data-checked={localCountries.includes(country.id)}
                  onClick={() => handleCountryChange(country.id)}
                >
                  <img
                    src={`https://flagcdn.com/w20/${country.code}.png`}
                    alt={`${country.label} flag`}
                    style={{ width: '20px', height: '15px', marginRight: '0.5rem' }}
                  />
                  {country.label}
                </button>
              ))}
            </div>
          </div>

          {/* Moved the submission button to a dedicated footer area */}
          <div className="modal-form-footer">
            <Button type="submit" variation="primary" isFullWidth>Apply Filters</Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default HeaderNav;