import { useState, useEffect } from 'react';
import { Menu, MenuItem, Divider, Button } from "@aws-amplify/ui-react";
import { useNavigate } from "react-router-dom";
import { useSession } from '../../context/SessionContext';
import Modal from './Modal'
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { Gift, TrendingUp, Building2, HardHat, Zap, Wheat, Banknote, Stethoscope, Factory, Satellite, ShoppingBag, Plane, Train } from 'lucide-react';
import { useFreeDaysRemaining } from '../../hooks/useFreeDaysRemaining';
import { useTranslation } from '../../i18n';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';

const INDUSTRY_OPTIONS = [
  { id: '💵 MARKETS', label: 'MARKETS', icon: TrendingUp },
  { id: '📈 ECONOMY', label: 'ECONOMY', icon: Building2 },
  { id: '⛏️ MINING', label: 'MINING', icon: HardHat },
  { id: '⚡ ENERGY', label: 'ENERGY', icon: Zap },
  { id: '🚜 AGRIBUSINESS', label: 'AGRIBUSINESS', icon: Wheat },
  { id: '🏛️ FINANCIALS', label: 'FINANCIALS', icon: Banknote },
  { id: '💊 HEALTHCARE', label: 'HEALTHCARE', icon: Stethoscope },
  { id: '🏭 INDUSTRIALS', label: 'INDUSTRIALS', icon: Factory },
  { id: '🛰️ TECH•MEDIA•TELCO', label: 'TECH•MEDIA•TELCO', icon: Satellite },
  { id: '🛍️ RETAIL', label: 'RETAIL', icon: ShoppingBag },
  { id: '✈️ TRAVEL•LEISURE', label: 'TRAVEL•LEISURE', icon: Plane },
  { id: '🚂 TRANSPORTATION', label: 'TRANSPORTATION', icon: Train },
];

const COUNTRY_OPTIONS = [
  { id: 'global', label: 'GLOBAL', code: 'global' },
  { id: 'Q414', label: 'ARG', code:'ar' },
  { id: 'Q155', label: 'BRA', code: 'br' },
  { id: 'Q298', label: 'CHL', code: 'cl' },
  { id: 'Q733', label: 'PAR', code: 'py' },
  { id: 'Q77', label: 'URU', code: 'uy' },
];

const HeaderNav = () => {
  const { logout } = useSession();
  const navigate = useNavigate();
  const [showFiltersModal, setShowFiltersModal] = useState(false); // State to control modal visibility
  const { preferences, savePreferences } = useUserPreferences();
  const [localIndustries, setLocalIndustries] = useState(preferences.industries);
  const [localCountries, setLocalCountries] = useState(preferences.countries);
  const daysLeft = useFreeDaysRemaining();

  // New state for "all" selections
  const [selectAllIndustries, setSelectAllIndustries] = useState(false);
  const [selectAllCountries, setSelectAllCountries] = useState(false);

  
  const handleOpenFiltersModal = () => {
    // When opening the modal, sync local state with context
    setLocalIndustries(preferences.industries);
    setLocalCountries(preferences.countries);
    
    // Check if all industries/countries are selected
    setSelectAllIndustries(preferences.industries.length === INDUSTRY_OPTIONS.length);
    setSelectAllCountries(preferences.countries.length === COUNTRY_OPTIONS.length);
    
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
    if (selectAllIndustries) return; // Mute individual selections when "all" is selected
    
    setLocalIndustries(prev => 
      prev.includes(industryId) 
        ? prev.filter(id => id !== industryId) 
        : [...prev, industryId]
    );
  };

  const handleCountryChange = (countryId: string) => {
    if (selectAllCountries) return; // Mute individual selections when "all" is selected
    
    setLocalCountries(prev => 
      prev.includes(countryId) 
        ? prev.filter(id => id !== countryId) 
        : [...prev, countryId]
    );
  };

  // New handlers for "all" selections
  const handleAllIndustriesToggle = () => {
    if (selectAllIndustries) {
      // Deselect all industries
      setLocalIndustries([]);
      setSelectAllIndustries(false);
    } else {
      // Select all industries
      setLocalIndustries(INDUSTRY_OPTIONS.map(industry => industry.id));
      setSelectAllIndustries(true);
    }
  };

  const handleAllCountriesToggle = () => {
    if (selectAllCountries) {
      // Deselect all countries
      setLocalCountries([]);
      setSelectAllCountries(false);
    } else {
      // Select all countries
      setLocalCountries(COUNTRY_OPTIONS.map(country => country.id));
      setSelectAllCountries(true);
    }
  };
  
  const getFilteringLegend = () => {
    const hasIndustries = localIndustries.length > 0;
    const hasCountries = localCountries.length > 0;
    const allCountriesSelected = localCountries.length === COUNTRY_OPTIONS.length;

    if (hasIndustries && hasCountries && !allCountriesSelected) {
      return t('filters.legend');
    }
    if (hasIndustries) {
      return t('filters.legendIndustriesOnly');
    }
    if (hasCountries && !allCountriesSelected) {
      return t('filters.legendCountriesOnly');
    }
    if (allCountriesSelected) {
      return hasIndustries 
        ? t('filters.legendAllCountries')
        : t('filters.legendNoFilters');
    }
    // This is the state where no articles will be shown after applying filters.
    return t('filters.legendNoFilters');
  };

  const { t } = useTranslation();

  return (
    <>
      {/* Invite Friends Icon with Badge */}
      <div
        className="invite-friends-icon"
        style={{ position: 'relative', cursor: 'pointer', display: 'inline-block', marginRight: 16 }}
        onClick={() => navigate('/settings/referral')}
        title={t('menu.inviteFriends')}
      >
        <Gift size={24} />
        {typeof daysLeft === 'number' && daysLeft > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              background: 'red',
              color: 'white',
              borderRadius: '50%',
              fontSize: 12,
              minWidth: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 5px',
              fontWeight: 600,
              boxShadow: '0 0 0 2px white',
            }}
          >
            {daysLeft}
          </span>
        )}
      </div>

      {/* Language Switcher */}
      <LanguageSwitcher />

      {/* Existing Menu */}
      <Menu menuAlign="end" aria-label="User menu">
        <MenuItem onClick={handleOpenFiltersModal}>{t('menu.filters')}</MenuItem>
        <Divider />
        <MenuItem onClick={() => navigate("/settings")}>{t('menu.settings')}</MenuItem>
        <MenuItem onClick={logout}>Logout</MenuItem>
      </Menu>

      <Modal
        show={showFiltersModal}
        onClose={handleCloseFiltersModal}
        title={t('filters.title')}
      >
        <form onSubmit={onSubmitFilters} className="modal-form-layout">
          <div className="form-section">
            <div className="section-header">
              <h3 className="section-title">{t('filters.industries')}</h3>
              <button
                type="button"
                className="all-button"
                data-checked={selectAllIndustries}
                onClick={handleAllIndustriesToggle}
              >
                {t('filters.allIndustries')}
              </button>
            </div>
            <div className="tag-container">
              {INDUSTRY_OPTIONS.map((industry) => {
                const IconComponent = industry.icon;
                return (
                  <button
                    type="button" // Important to prevent form submission on click
                    key={industry.id}
                    className="tag-button"
                    data-checked={localIndustries.includes(industry.id)}
                    data-disabled={selectAllIndustries}
                    onClick={() => handleIndustryChange(industry.id)}
                  >
                    <IconComponent size={16} />
                    {industry.label}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="form-section">
            <div className="section-header">
              <h3 className="section-title">{t('filters.countries')}</h3>
              <button
                type="button"
                className="all-button"
                data-checked={selectAllCountries}
                onClick={handleAllCountriesToggle}
              >
                {t('filters.allCountries')}
              </button>
            </div>
            <div className="tag-container">
              {COUNTRY_OPTIONS.map((country) => (
                <button
                  type="button"
                  key={country.id}
                  className="tag-button"
                  data-checked={localCountries.includes(country.id)}
                  data-disabled={selectAllCountries}
                  onClick={() => handleCountryChange(country.id)}
                >
                  {country.id === 'global' ? (
                    <span style={{ fontSize: '16px', marginRight: '0.5rem' }}>🌍</span>
                  ) : (
                    <img
                      src={`https://flagcdn.com/w20/${country.code}.png`}
                      alt={`${country.label} flag`}
                      style={{ width: '20px', height: '15px', marginRight: '0.5rem' }}
                    />
                  )}
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
            <Button type="submit" variation="primary" isFullWidth>{t('filters.applyFilters')}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default HeaderNav;