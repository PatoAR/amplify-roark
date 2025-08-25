import { useState, useEffect, useCallback } from 'react';
import { Menu, MenuItem, Divider, Button } from "@aws-amplify/ui-react";
import { useNavigate } from "react-router-dom";
import { useSession } from '../../context/SessionContext';
import Modal from './Modal'
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { Gift, TrendingUp, Building2, HardHat, Zap, Wheat, Banknote, Stethoscope, Factory, Satellite, ShoppingBag, Plane, Train } from 'lucide-react';
import { useFreeDaysRemaining } from '../../hooks/useFreeDaysRemaining';
import { useTranslation } from '../../i18n';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { COUNTRY_OPTIONS, INDUSTRY_OPTIONS } from '../../constants/countries';

const HeaderNav = () => {
  const { t } = useTranslation();
  const { logout } = useSession();
  const navigate = useNavigate();
  const [showFiltersModal, setShowFiltersModal] = useState(false); // State to control modal visibility
  const { preferences, savePreferences } = useUserPreferences();
  const [localIndustries, setLocalIndustries] = useState(preferences.industries);
  const [localCountries, setLocalCountries] = useState(preferences.countries);
  const daysLeft = useFreeDaysRemaining();
  const [isSaving, setIsSaving] = useState(false);

  // New state for "all" selections
  const [selectAllIndustries, setSelectAllIndustries] = useState(false);
  const [selectAllCountries, setSelectAllCountries] = useState(false);

  
  const handleOpenFiltersModal = useCallback(() => {
    // When opening the modal, sync local state with context
    setLocalIndustries(preferences.industries);
    setLocalCountries(preferences.countries);
    
    // Check if all industries/countries are selected
    setSelectAllIndustries(preferences.industries.length === INDUSTRY_OPTIONS.length);
    setSelectAllCountries(preferences.countries.length === COUNTRY_OPTIONS.length);
    
    setShowFiltersModal(true);
  }, [preferences.industries, preferences.countries]);

  // Listen for the custom event from the WelcomeScreen
  useEffect(() => {
    window.addEventListener('open-filters-modal', handleOpenFiltersModal);
    return () => {
      window.removeEventListener('open-filters-modal', handleOpenFiltersModal);
    };
  }, [handleOpenFiltersModal]);

  const handleCloseFiltersModal = useCallback(() => setShowFiltersModal(false), []);

  const onSubmitFilters = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Prevent multiple submissions
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      await savePreferences({
        industries: localIndustries,
        countries: localCountries,
      });
      handleCloseFiltersModal();
    } catch (error) {
      console.error('Error saving preferences', error);
    } finally {
      setIsSaving(false);
    }
  }, [localIndustries, localCountries, savePreferences, handleCloseFiltersModal, isSaving]);
  
  // Handlers for tag system
  const handleIndustryChange = useCallback((industryId: string) => {
    if (selectAllIndustries) return; // Mute individual selections when "all" is selected
    
    setLocalIndustries(prev => 
      prev.includes(industryId) 
        ? prev.filter(id => id !== industryId) 
        : [...prev, industryId]
    );
  }, [selectAllIndustries]);

  const handleCountryChange = useCallback((countryId: string) => {
    if (selectAllCountries) return; // Mute individual selections when "all" is selected
    
    setLocalCountries(prev => 
      prev.includes(countryId) 
        ? prev.filter(id => id !== countryId) 
        : [...prev, countryId]
    );
  }, [selectAllCountries]);

  // New handlers for "all" selections
  const handleAllIndustriesToggle = useCallback(() => {
    if (selectAllIndustries) {
      // Deselect all industries
      setLocalIndustries([]);
      setSelectAllIndustries(false);
    } else {
      // Select all industries
      setLocalIndustries(INDUSTRY_OPTIONS.map(industry => industry.id));
      setSelectAllIndustries(true);
    }
  }, [selectAllIndustries]);

  const handleAllCountriesToggle = useCallback(() => {
    if (selectAllCountries) {
      // Deselect all countries
      setLocalCountries([]);
      setSelectAllCountries(false);
    } else {
      // Select all countries
      setLocalCountries(COUNTRY_OPTIONS.map(country => country.id));
      setSelectAllCountries(true);
    }
  }, [selectAllCountries]);
  
  const getFilteringLegend = useCallback(() => {
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
  }, [localIndustries, localCountries, t]);

  return (
    <>
      {/* Invite Friends Icon with Badge */}
      <div
        className="invite-friends-icon"
        onClick={() => navigate('/settings/referral')}
        title={t('menu.inviteFriends')}
      >
        <Gift size={24} />
        {typeof daysLeft === 'number' && daysLeft > 0 && (
          <span className={`days-counter ${daysLeft > 30 ? 'high' : 'low'}`}>
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
                // Map icon names to actual icon components
                const iconMap: Record<string, React.ComponentType<any>> = {
                  'TrendingUp': TrendingUp,
                  'Building2': Building2,
                  'HardHat': HardHat,
                  'Zap': Zap,
                  'Wheat': Wheat,
                  'Banknote': Banknote,
                  'Stethoscope': Stethoscope,
                  'Factory': Factory,
                  'Satellite': Satellite,
                  'ShoppingBag': ShoppingBag,
                  'Plane': Plane,
                  'Train': Train
                };
                const IconComponent = iconMap[industry.icon] || TrendingUp;
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
            <Button 
              type="submit" 
              variation="primary" 
              isFullWidth 
              isLoading={isSaving}
              loadingText={t('filters.saving')}
              disabled={isSaving}
            >
              {isSaving ? t('filters.saving') : t('filters.applyFilters')}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default HeaderNav;