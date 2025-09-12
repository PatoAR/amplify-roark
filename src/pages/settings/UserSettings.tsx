import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Button,
  Flex,
  View,
  Heading,
  Card,
  Alert,
  Text,
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useTranslation } from '../../i18n';
import './UserSettings.css';

const UserSettings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);


  const settingsCards = [
    {
      id: 'password',
      title: t('settings.changePassword'),
      description: t('settings.changePasswordDesc'),
      icon: '🔐',
      path: '/settings/password',
      color: 'primary'
    },
    {
      id: 'account',
      title: t('settings.deleteAccount'),
      description: t('settings.deleteAccountDesc'),
      icon: '🗑️',
      path: '/settings/delete-account',
      color: 'danger'
    },
    {
      id: 'referral',
      title: t('settings.inviteFriends'),
      description: t('settings.inviteFriendsDesc'),
      icon: '🎁',
      path: '/settings/referral',
      color: 'success'
    },

  ];

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  const handleBack = () => {
    navigate('/');
  };

  // Check for success parameter and show banner
  useEffect(() => {
    const successParam = searchParams.get('success');
    if (successParam === 'password-changed') {
      setShowSuccessBanner(true);
      // Clear the URL parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('success');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams]);

  const handleDismissBanner = () => {
    setShowSuccessBanner(false);
  };

  return (
    <Flex
      className="settings-box"
      direction="column"
      gap="1rem"
    >
      <Flex alignItems="center" gap="1rem" className="page-header">
        <Button
          variation="link"
          onClick={handleBack}
          className="back-button"
        >
          {t('settings.backToNews')}
        </Button>
      </Flex>

      <Heading level={2} className="settings-main-title">
        {t('settings.title')}
      </Heading>
      
      {showSuccessBanner && (
        <Alert variation="success" isDismissible onDismiss={handleDismissBanner}>
          {t('password.passwordUpdated')}
        </Alert>
      )}
      
      <Flex 
        direction="row" 
        gap="1rem" 
        wrap="wrap"
        className="settings-cards-container"
      >
        {settingsCards.map((card) => (
          <Card
            key={card.id}
            className={`settings-card settings-card-${card.color}`}
            onClick={() => handleCardClick(card.path)}
          >
            <Flex direction="column" gap="0.5rem">
              <View className="card-icon">
                {card.icon}
              </View>
              <Heading level={4} className="card-title">
                {card.title}
              </Heading>
              <View className="card-description">
                {card.description}
              </View>
            </Flex>
          </Card>
        ))}
      </Flex>

      {/* Contact Information */}
      <View className="contact-section">
        <Text fontSize="small" color="font.secondary" textAlign="center">
          Need help? Contact us at{' '}
          <a 
            href="mailto:info@perkinsintel.com" 
            className="contact-email"
            style={{ 
              color: 'var(--color-font-primary)', 
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            info@perkinsintel.com
          </a>
        </Text>
      </View>
    </Flex>
  );
};

export default UserSettings;
