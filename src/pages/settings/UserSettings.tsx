import { useNavigate } from 'react-router-dom';
import {
  Button,
  Flex,
  View,
  Heading,
  Card,
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useTranslation } from '../../i18n';
import './UserSettings.css';

const UserSettings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const settingsCards = [
    {
      id: 'password',
      title: t('userSettings.changePassword'),
      description: t('userSettings.changePasswordDesc'),
      icon: '🔐',
      path: '/settings/password',
      color: 'primary'
    },
    {
      id: 'account',
      title: t('userSettings.deleteAccount'),
      description: t('userSettings.deleteAccountDesc'),
      icon: '🗑️',
      path: '/settings/delete-account',
      color: 'danger'
    },
    {
      id: 'referral',
      title: t('userSettings.inviteFriends'),
      description: t('userSettings.inviteFriendsDesc'),
      icon: '🎁',
      path: '/settings/referral',
      color: 'success'
    }
  ];

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  const handleBack = () => {
    navigate('/');
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
        {t('userSettings.title')}
      </Heading>
      
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
    </Flex>
  );
};

export default UserSettings;
