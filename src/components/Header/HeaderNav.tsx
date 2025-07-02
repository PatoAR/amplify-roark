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
  { id: 'Q298', label: 'CHL', code: 'cl' },
  { id: 'Q733', label: 'PAR', code: 'py' },
  { id: 'Q77', label: 'URU', code: 'uy' },
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

  // Listen for the custom event from the WelcomeScreen
  useEffect(() => {
    window.addEventListener('open-filters-modal', handleOpenFiltersModal);
    return () => {
      window.removeEventListener('open-filters-modal', handleOpenFiltersModal);
    };
  }, [handleOpenFiltersModal]);

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
  
  const getFilteringLegend = () => {
    const hasIndustries = localIndustries.length > 0;
    const hasCountries = localCountries.length > 0;

    if (hasIndustries && hasCountries) {
      return 'Articles that match BOTH the selected industries AND countries will be shown.';
    }
    if (hasIndustries) {
      return 'All articles that match ANY of the selected industries will be shown.';
    }
    if (hasCountries) {
      return 'All articles that match ANY of the selected countries will be shown.';
    }
    // This is the state where no articles will be shown after applying filters.
    return 'No filters are selected. ALL articles will be shown.';
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

          <div className="filter-legend">
            <span className="filter-legend-icon">ℹ️</span>
            <p className="filter-legend-text">{getFilteringLegend()}</p>
          </div>
          
          {/* Submission button dedicated footer area */}
          <div className="modal-form-footer">
            <Button type="submit" variation="primary" isFullWidth>Apply Filters</Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default HeaderNav;