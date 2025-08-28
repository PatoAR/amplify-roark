# Optimal Usage Modal

## Overview

The Optimal Usage Modal is a new feature that helps users understand how to get the best experience from the Perkins web app. It explains the optimal desktop/laptop usage patterns and provides visual guidance with screenshots.

## Features

- **Automatic Display**: Shows automatically on first login as the first thing users see
- **User Preference**: Users can opt to not see the modal again
- **Local Storage**: Preference is saved in localStorage
- **Simple Integration**: Only appears on login, no manual triggers or settings integration

## Implementation Details

### Components

1. **OptimalUsageModal** (`src/components/OptimalUsageModal/OptimalUsageModal.tsx`)
   - Main modal component
   - Uses the same Modal component as the filter modal
   - Includes checkbox for "don't show again" preference
   - Displays three sections with images

2. **CSS Styling** (`src/components/OptimalUsageModal/OptimalUsageModal.css`)
   - Follows the same design patterns as the filter modal
   - Responsive design with proper spacing and typography
   - Consistent with the app's design system

### Integration Points

1. **WelcomeScreen** (`src/components/WelcomeScreen/WelcomeScreen.tsx`)
   - Automatically shows modal on first login
   - Checks localStorage for user preference
   - Modal appears immediately as the first thing users see

### Local Storage

- **Key**: `perkins-optimal-usage-modal-hidden`
- **Value**: `'true'` when user opts to not show again
- **Reset**: Removed when user clicks reset option

### Images

- **split_screen.png**: Shows browser split screen feature
- **open_right.png**: Shows "open on right" browser option
- Images are copied to `public/` directory for proper access

## Usage Instructions

### For Users

1. **First Login**: Modal appears automatically as the first thing you see
2. **User Control**: Check "Don't show this message again" to skip future displays
3. **Preference Saved**: Your choice is remembered for future logins

### For Developers

1. **Adding New Sections**: Modify the modal content in `OptimalUsageModal.tsx`
2. **Styling Changes**: Update `OptimalUsageModal.css`
3. **Translations**: Add new keys to `src/i18n.ts`
4. **Integration**: The modal is automatically integrated into the WelcomeScreen

## Content Sections

1. **Split Screen**: Explains browser split screen feature (with compact image)
2. **Article Size**: Recommends one-third screen width for article list
3. **Open Right**: Shows how to use "open on right" option
4. **Tip**: General advice for optimal workflow
5. **User Preference**: Checkbox to opt out of future displays

**Note**: The modal automatically closes when users click outside or press Escape, with no "Got it" button needed.

## Technical Notes

- Uses React hooks for state management
- Follows the same modal pattern as existing components
- Responsive design with CSS custom properties
- Internationalization support through i18n system
- Consistent with the app's UI/UX guidelines

## Future Enhancements

- Add video tutorials
- Include browser-specific instructions
- Add keyboard shortcuts guide
- Include accessibility tips
- Add performance optimization tips
