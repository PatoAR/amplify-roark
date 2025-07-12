import { useTranslation } from '../i18n';
import { Button, Card, Flex, Heading, Text } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

interface InactivityDialogProps {
  isOpen: boolean;
  timeLeft: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const InactivityDialog: React.FC<InactivityDialogProps> = ({ isOpen, timeLeft, onConfirm, onCancel }) => {
  const { t } = useTranslation();

  if (!isOpen) {
    return null;
  }

  const minutes = Math.ceil(timeLeft / 60);
  const message = t('inactivity.message').replace('{minutes}', minutes.toString());

  return (
    <div className="dialog-overlay" onClick={onConfirm} role="dialog" aria-modal="true">
      <Card
        className="dialog-content"
        variation="elevated"
        // Stop click from propagating to the overlay, which would close the dialog
        onClick={(e) => e.stopPropagation()} 
      >
        <Flex direction="column" gap="large">
          <Heading level={4}>{t('inactivity.title')}</Heading>
          
          <Text>
            {message}
          </Text>

          <Flex justifyContent="flex-end" gap="small">
            <Button onClick={onCancel} variation="warning">{t('inactivity.logout')}</Button>
            <Button onClick={onConfirm} variation="primary" autoFocus>{t('inactivity.stayLoggedIn')}</Button>
          </Flex>
        </Flex>
      </Card>
    </div>
  );
};