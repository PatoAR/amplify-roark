# Perkins News Service - Referral System

## Overview

This document describes the complete referral system implementation for Perkins News Service. The system allows users to invite friends and earn 3 additional months of free access for each successful referral.

## Features

### 🎁 Referral System Features

1. **Unique Referral Codes**: Each user gets a unique 8-character referral code
2. **Multi-Platform Sharing**: Share via WhatsApp, Email, or copy link
3. **Real-time Validation**: Referral codes are validated in real-time
4. **Statistics Tracking**: Track successful referrals and earned months
5. **Subscription Management**: Automatic extension of free trial periods
6. **URL-based Signup**: Users can sign up using referral links

### 📊 Business Logic

- **Initial Free Trial**: 3 months for all new users
- **Referral Bonus**: 3 additional months for each successful referral
- **Referrer Reward**: 3 additional months when someone uses your code
- **No Limits**: Users can earn unlimited months through referrals

## Technical Architecture

### Database Schema

#### ReferralCode Model
```typescript
{
  owner: string,           // User ID of code owner
  code: string,           // Unique 8-character code
  isActive: boolean,      // Whether code is active
  totalReferrals: number, // Total attempts
  successfulReferrals: number // Successful referrals
}
```

#### Referral Model
```typescript
{
  referrerId: string,     // User who referred
  referredId: string,     // User who was referred
  referralCode: string,   // Code used
  status: 'pending' | 'completed' | 'expired',
  completedAt: datetime,
  freeMonthsEarned: number
}
```

#### UserSubscription Model
```typescript
{
  owner: string,
  subscriptionStatus: 'free_trial' | 'active' | 'expired' | 'cancelled',
  trialStartDate: datetime,
  trialEndDate: datetime,
  totalFreeMonths: number,    // Initial 3 months
  earnedFreeMonths: number,   // Additional from referrals
  referralCodeUsed: string,   // Code used during signup
  referrerId: string         // ID of referrer
}
```

### Backend Services

#### Lambda Functions

1. **referral-processor**: Handles referral code generation and validation
2. **referral-api**: REST API endpoints for referral operations
3. **custom-message**: Enhanced email templates with referral information

#### API Endpoints

- `POST /api/referral` - Handle referral operations
  - `action: 'generate_code'` - Generate new referral code
  - `action: 'validate_code'` - Validate referral code
  - `action: 'process_referral'` - Process successful referral
  - `action: 'extend_subscription'` - Extend user subscription

### Frontend Components

#### useReferral Hook
```typescript
const {
  referralCode,
  referralStats,
  isLoading,
  error,
  generateReferralCode,
  validateReferralCode,
  shareReferralLink,
  getReferralUrl,
  refreshData
} = useReferral();
```

#### Referral Component
- Beautiful UI with gradient background
- Real-time referral code display
- Multi-platform sharing options
- Statistics dashboard
- How-it-works guide

#### CustomSignUp Component
- Handles referral codes during signup
- Real-time validation
- URL parameter support (`?ref=CODE`)
- Enhanced user experience

## User Flow

### 1. Referrer Flow
1. User visits Settings → "🎁 Invite Friends" tab
2. System generates unique referral code
3. User shares code via WhatsApp, Email, or copy link
4. User tracks statistics and earnings

### 2. Referred User Flow
1. User clicks referral link or enters code during signup
2. System validates referral code in real-time
3. User completes signup with referral information
4. Both users get 3 months of additional free access

### 3. System Processing
1. Lambda function processes referral
2. Creates referral record
3. Updates referral code statistics
4. Extends both users' subscriptions
5. Sends confirmation emails

## Implementation Details

### URL Structure
- Referral links: `https://yourapp.com/signup?ref=ABC12345`
- Settings page: `/settings` with referral tab

### Email Integration
- Enhanced welcome emails with referral information
- Custom messages based on referral status
- Professional branding and clear instructions

### Security Features
- Unique code generation with collision detection
- Real-time validation
- Owner-based authorization
- CORS support for API endpoints

### Performance Optimizations
- Caching of referral codes
- Efficient database queries with indexes
- Lazy loading of referral statistics
- Optimistic UI updates

## Deployment Instructions

### 1. Deploy Backend
```bash
# Deploy to sandbox
npx amplify sandbox

# Generate GraphQL code
npx ampx generate graphql-client-code --format graphql-codegen --out ./src/graphql/
```

### 2. Update Frontend
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Test Referral System
1. Create a new account
2. Visit Settings → "🎁 Invite Friends"
3. Generate and share referral code
4. Test signup with referral code
5. Verify subscription extensions

## Configuration

### Environment Variables
- `REFERRAL_BONUS_MONTHS`: Number of months earned per referral (default: 3)
- `INITIAL_FREE_MONTHS`: Initial free trial months (default: 3)
- `REFERRAL_CODE_LENGTH`: Length of referral codes (default: 8)

### Customization Options
- Modify email templates in `amplify/auth/custom-message/handler.ts`
- Adjust UI styling in component CSS files
- Update business logic in Lambda functions
- Customize validation rules and error messages

## Monitoring and Analytics

### Key Metrics
- Total referral codes generated
- Successful referrals per user
- Average months earned per user
- Conversion rate of referral links
- Most popular sharing platforms

### Logging
- All referral operations are logged
- Error tracking and monitoring
- Performance metrics collection
- User behavior analytics

## Future Enhancements

### Planned Features
1. **Referral Tiers**: Different rewards for different referral levels
2. **Social Integration**: Direct sharing to social media platforms
3. **Gamification**: Leaderboards and achievements
4. **Analytics Dashboard**: Detailed referral analytics
5. **A/B Testing**: Test different referral incentives
6. **Internationalization**: Multi-language support

### Technical Improvements
1. **WebSocket Integration**: Real-time referral notifications
2. **Advanced Analytics**: Machine learning for referral optimization
3. **Mobile App**: Native mobile referral experience
4. **API Rate Limiting**: Prevent abuse and spam
5. **Advanced Security**: Fraud detection and prevention

## Troubleshooting

### Common Issues

1. **Referral Code Not Working**
   - Check if code is active
   - Verify user hasn't already used a referral code
   - Ensure proper database permissions

2. **Subscription Not Extended**
   - Check Lambda function logs
   - Verify user subscription exists
   - Ensure proper date calculations

3. **Sharing Not Working**
   - Check browser permissions for clipboard
   - Verify WhatsApp/Email client availability
   - Test on different devices/platforms

### Debug Steps
1. Check browser console for errors
2. Review Lambda function logs
3. Verify database records
4. Test API endpoints directly
5. Check network connectivity

## Support

For technical support or questions about the referral system:
- Check the logs in AWS CloudWatch
- Review the database records in DynamoDB
- Test the API endpoints manually
- Contact the development team

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Maintainer**: Perkins News Service Team 