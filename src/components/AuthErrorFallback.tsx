import React from 'react';
import { useTranslation } from '../i18n';
import { Button, Card, Flex, Heading, Text } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { signOut } from 'aws-amplify/auth';

interface AuthErrorFallbackProps {
  error: Error;
  onRetry: () => void;
  onLogout: () => void;
}

export const AuthErrorFallback: React.FC<AuthErrorFallbackProps> = ({ error, onRetry, onLogout }) => {
  const { t } = useTranslation();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry behavior - reload the page
      window.location.reload();
    }
  };

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default logout behavior
      try {
        await signOut();
      } catch (error) {
        console.error('Error during logout:', error);
        // Force reload as fallback
        window.location.reload();
      }
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      padding: '20px',
      backgroundColor: '#f5f5f5'
    }}>
      <Card variation="elevated" style={{ maxWidth: '500px', width: '100%' }}>
        <Flex direction="column" gap="large" alignItems="center">
          <Heading level={3} textAlign="center">
            {t('authError.title')}
          </Heading>
          
          <Text textAlign="center">
            {error?.message || t('authError.message')}
          </Text>

          {error && (
            <details style={{ width: '100%', fontSize: '12px', color: '#666' }}>
              <summary>{t('authError.technicalDetails')}</summary>
              <pre style={{ 
                background: '#f0f0f0', 
                padding: '10px', 
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {error.stack || error.message}
              </pre>
            </details>
          )}

          <Flex gap="medium" justifyContent="center">
            <Button onClick={handleRetry} variation="primary">
              {t('authError.tryAgain')}
            </Button>
            <Button onClick={handleLogout} variation="warning">
              {t('authError.logout')}
            </Button>
          </Flex>
        </Flex>
      </Card>
    </div>
  );
}; 