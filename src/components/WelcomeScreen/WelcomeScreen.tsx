import './WelcomeScreen.css';

const WelcomeScreen = () => {
  const handleOpenFiltersModal = () => {
    window.dispatchEvent(new CustomEvent('open-filters-modal'));
  };

  return (
    <div className="welcome-box">
      <div className="welcome-icon">👋</div>
      <h1 className="welcome-title">Welcome to Perkins News</h1>
      <p className="welcome-subtitle">
        To get started, personalize your news feed by selecting the industries and countries that matter most to you.
      </p>
      <button className="welcome-button" onClick={handleOpenFiltersModal}>
        Personalize Your Feed
      </button>
      <p className="welcome-hint">
        You can always change these settings later from the main menu.
      </p>
    </div>
  );
};

export default WelcomeScreen;