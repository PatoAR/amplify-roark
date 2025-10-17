// Feature flags for controlling application behavior
export const FEATURE_FLAGS = {
  // Set to true when subscription functionality should be enabled
  ENABLE_SUBSCRIPTIONS: false,
  
  // Set to true when subscription upgrade modals should be shown
  ENABLE_SUBSCRIPTION_UPGRADES: false,
  
  // Set to true when subscription upgrade buttons should be visible
  ENABLE_SUBSCRIPTION_BUTTONS: false,
} as const;

// Helper functions for feature flag checks
export const isSubscriptionEnabled = () => FEATURE_FLAGS.ENABLE_SUBSCRIPTIONS;
export const isSubscriptionUpgradeEnabled = () => FEATURE_FLAGS.ENABLE_SUBSCRIPTION_UPGRADES;
export const isSubscriptionButtonEnabled = () => FEATURE_FLAGS.ENABLE_SUBSCRIPTION_BUTTONS;
