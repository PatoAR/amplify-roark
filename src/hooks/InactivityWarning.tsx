import { Card, Flex, Heading, Text, Button } from '@aws-amplify/ui-react';

interface InactivityDialogProps {
  isOpen: boolean;
  onConfirm: () => void; // User wants to stay logged in
  onCancel: () => void;  // User wants to log out
  timeLeft: number;
}

export const InactivityDialog: React.FC<InactivityDialogProps> = ({ isOpen, onConfirm, onCancel, timeLeft }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="dialog-overlay" onClick={onConfirm} role="dialog" aria-modal="true">
      <Card
        className="dialog-content"
        variation="elevated"
        // Stop click from propagating to the overlay, which would close the dialog
        onClick={(e) => e.stopPropagation()} 
      >
        <Flex direction="column" gap="large">
          <Heading level={4}>Inactivity Warning</Heading>
          
          <Text>
            For your security, you will be logged out in less than {Math.ceil(timeLeft / 60)} minute(s).
            Do you want to stay logged in?
          </Text>

          <Flex justifyContent="flex-end" gap="small">
            <Button onClick={onCancel} variation="warning">Logout</Button>
            <Button onClick={onConfirm} variation="primary" autoFocus>Stay Logged In</Button>
          </Flex>
        </Flex>
      </Card>
    </div>
  );
};