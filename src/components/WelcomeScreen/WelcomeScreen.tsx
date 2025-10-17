import { useTranslation } from '../../i18n';
import './WelcomeScreen.css';

const WelcomeScreen = () => {
  const { t } = useTranslation();

  const handleOpenFiltersModal = () => {
    window.dispatchEvent(new CustomEvent('open-filters-modal'));
  };

  return (
    <div className="welcome-box">
      <div className="welcome-icon">👋</div>
      <h1 className="welcome-title">{t('welcome.title')}</h1>
      <p className="welcome-subtitle">
        {t('welcome.subtitle')}
      </p>
      <p className="welcome-referral-intro">
        {t('welcome.referralIntro')}
      </p>
      <button className="welcome-button" onClick={handleOpenFiltersModal}>
        {t('welcome.button')}
      </button>
      <p className="welcome-hint">
        {t('welcome.hint')}
      </p>
    </div>
  );
};

export default WelcomeScreen;