import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Flex,
  Heading,
  View,
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './UserSettings.css';

const UserSettings = () => {
  const navigate = useNavigate();

  const settingsCards = [
    {
      id: 'password',
      title: 'Change Password',
      description: 'Update your account password',
      icon: '🔐',
      path: '/settings/password',
      color: 'primary'
    },
    {
      id: 'account',
      title: 'Delete Account',
      description: 'Permanently delete your account and all data',
      icon: '🗑️',
      path: '/settings/delete-account',
      color: 'danger'
    },
    {
      id: 'referral',
      title: 'Invite Friends',
      description: 'Share your referral code and earn free months',
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
          ← Back to News Feed
        </Button>
      </Flex>

      <Heading level={2} className="settings-main-title">
        Settings
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
