# UI/UX Design Guidelines
## Perkins News Service - Unified Minimalistic Design System

## 🎨 Design Philosophy

Our design system follows a **minimalistic and ascetic approach** that prioritizes:
- **Clean, uncluttered interfaces** with generous whitespace
- **Consistent visual hierarchy** through typography and spacing
- **Subtle, purposeful interactions** with smooth transitions
- **Accessibility-first design** with proper contrast and focus states
- **Mobile-responsive layouts** that work seamlessly across devices

## 🎯 Design Principles

### 1. **Simplicity First**
- Remove unnecessary elements
- Use whitespace effectively
- Focus on content over decoration

### 2. **Consistency**
- Unified color palette
- Standardized spacing system
- Consistent typography hierarchy
- Reusable component patterns

### 3. **Accessibility**
- High contrast ratios
- Clear focus indicators
- Semantic HTML structure
- Screen reader compatibility

### 4. **Performance**
- Smooth animations (60fps)
- Optimized for reduced motion preferences
- Fast loading times

## 🎨 Color System

### Primary Colors
```css
--color-background: #F7F5F2;     /* Warm off-white background */
--color-surface: #ffffff;         /* Pure white surfaces */
--color-surface-secondary: #fdfdfd; /* Slightly off-white */
--color-border: #e5e7eb;         /* Subtle borders */
--color-border-light: #f3f4f6;   /* Light borders */
```

### Text Colors
```css
--color-text-primary: #1c1c1c;   /* Main text */
--color-text-secondary: #555;     /* Secondary text */
--color-text-tertiary: #666;      /* Tertiary text */
--color-text-muted: #888;         /* Muted text */
```

### Accent Colors
```css
--color-primary: #007bff;         /* Primary blue */
--color-primary-hover: #0056b3;   /* Darker blue for hover */
--color-success: #10b981;         /* Success green */
--color-warning: #f59e0b;         /* Warning orange */
--color-error: #ef4444;           /* Error red */
```

## 📝 Typography

### Font Stack
```css
--font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Font Sizes
```css
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */
```

### Font Weights
```css
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Line Heights
```css
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

## 📏 Spacing System

### Spacing Scale
```css
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-2xl: 3rem;     /* 48px */
--space-3xl: 4rem;     /* 64px */
```

## 🔲 Border Radius

```css
--border-radius-sm: 4px;
--border-radius-md: 8px;
--border-radius-lg: 12px;
--border-radius-xl: 16px;
```

## 🌟 Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

## ⚡ Transitions

```css
--transition-fast: 0.15s ease;
--transition-normal: 0.2s ease;
--transition-slow: 0.3s ease;
```

## 🧩 Component Guidelines

### Cards
- Use subtle shadows (`--shadow-sm`)
- Rounded corners (`--border-radius-md`)
- Consistent padding (`--space-lg`)
- Hover effects with elevation

### Buttons
- Primary: Blue background with white text
- Secondary: White background with border
- Ghost: Transparent with hover state
- Consistent padding and border radius

### Forms
- Clear labels and inputs
- Proper spacing between elements
- Validation states with appropriate colors
- Accessible focus indicators

### Navigation
- Fixed header with backdrop blur
- Clear active states
- Responsive mobile menu
- Consistent spacing

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Considerations
- Touch-friendly button sizes (44px minimum)
- Adequate spacing for touch targets
- Simplified navigation patterns
- Optimized typography scaling

## ♿ Accessibility

### Color Contrast
- Minimum 4.5:1 ratio for normal text
- Minimum 3:1 ratio for large text
- High contrast mode support

### Focus States
- Visible focus indicators
- Keyboard navigation support
- Screen reader compatibility

### Motion
- Respect `prefers-reduced-motion`
- Smooth, purposeful animations
- No auto-playing content

## 🎯 Component Examples

### Card Component
```css
.card {
  background: var(--color-surface);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  border: var(--border-width) solid var(--color-border);
  transition: box-shadow var(--transition-normal), transform var(--transition-normal);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}
```

### Button Component
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-sm) var(--space-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--border-radius-md);
  border: var(--border-width) solid transparent;
  cursor: pointer;
  transition: all var(--transition-normal);
}
```

### Badge Component
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  border-radius: var(--border-radius-sm);
  line-height: 1;
}
```

## 🚀 Implementation Guidelines

### CSS Custom Properties
- Use design system variables consistently
- Avoid hardcoded values
- Maintain semantic naming

### Component Structure
- Modular, reusable components
- Consistent prop interfaces
- Clear documentation

### Performance
- Optimize animations for 60fps
- Use CSS transforms over layout changes
- Minimize repaints and reflows

## 📋 Checklist for New Components

- [ ] Uses design system variables
- [ ] Responsive design implemented
- [ ] Accessibility features included
- [ ] Hover/focus states defined
- [ ] Loading states considered
- [ ] Error states handled
- [ ] Mobile touch targets adequate
- [ ] Keyboard navigation supported
- [ ] Screen reader compatible
- [ ] Performance optimized

## 🎨 Visual Hierarchy

### Primary Actions
- Use primary blue color
- Prominent placement
- Clear call-to-action text

### Secondary Actions
- Use secondary button style
- Less prominent placement
- Supporting role

### Information Display
- Clear typography hierarchy
- Appropriate color usage
- Consistent spacing

## 🔄 State Management

### Loading States
- Skeleton screens for content
- Spinner for actions
- Progress indicators

### Error States
- Clear error messages
- Recovery options
- Appropriate error colors

### Success States
- Confirmation messages
- Visual feedback
- Next steps guidance

This design system ensures a consistent, accessible, and performant user experience across the Perkins News Service application. 