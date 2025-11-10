# Pre-Production Deployment Checklist
**Date:** October 22, 2025  
**Reviewed By:** AI Assistant  
**Codebase:** amplify-roark (Perkins News Service)

---

## Executive Summary

This comprehensive pre-production review has identified **22 critical and high-priority issues** that must be addressed before production deployment. The application is built on AWS Amplify with React frontend and includes subscription management, referral systems, and real-time news delivery.

**Overall Status:** ⚠️ **NOT READY FOR PRODUCTION**

---

## 🔴 CRITICAL ISSUES (Must Fix Before Production)

### 1. **SECURITY: API Key Expiration Too Short**
**Severity:** CRITICAL  
**File:** `amplify/data/resource.ts:134`

**Issue:**
```typescript
apiKeyAuthorizationMode: {
  expiresInDays: 30,  // ❌ Too short for production
}
```

**Impact:**
- API keys expire every 30 days
- Will break backend integrations (article ingestion, referral processing)
- Requires manual intervention monthly

**Recommendation:**
```typescript
apiKeyAuthorizationMode: {
  expiresInDays: 365,  // ✅ Yearly rotation is more appropriate
}
```

---

### 2. **CODE QUALITY: Excessive console.log Statements**
**Severity:** HIGH  
**Files Affected:** 29 files across frontend and backend

**Backend Functions (Lambda) with console.log:**
- `amplify/functions/referral-api/handler.ts` - 14+ console.log statements
- `amplify/functions/referral-processor/handler.ts` - 10+ console.log statements  
- `amplify/functions/subscription-manager/handler.ts` - 5+ console.log statements
- `amplify/auth/post-confirmation/handler.ts` - 18+ console.log statements

**Frontend Files with console.log (25 files):**
- `src/App.tsx` (line 100: visibility change logging)
- `src/main.tsx` (error logging)
- `src/context/SessionContext.tsx` (lines 25, 28, 31)
- `src/hooks/useSessionManager.ts`
- `src/hooks/useSubscriptionStatus.ts`
- `src/hooks/useReferral.ts`
- `src/hooks/useActivityTracking.ts`
- And 18 more files...

**Impact:**
- Performance overhead in production
- Potential exposure of sensitive data in logs
- CloudWatch costs for excessive logging
- Debugging information visible to users (browser console)

**Recommendation:**
- Replace with proper logging framework (e.g., Winston for backend)
- Use environment-based logging (only log in development)
- Remove all `console.log` statements from production code
- Keep `console.error` for critical errors only

---

### 3. **SECURITY: Missing Error Boundary**
**Severity:** HIGH  
**Files:** Application-wide

**Issue:**
- No React Error Boundary implementation found
- Application will crash completely if any component throws an error
- No graceful error handling at component tree level

**Impact:**
- Poor user experience (blank white screen on errors)
- No error reporting mechanism
- Loss of user session on component errors

**Fix Required:**
Create error boundary component:
```typescript
// src/components/ErrorBoundary/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Log to error reporting service
    // Show fallback UI
  }
}
```

Wrap App in `main.tsx`:
```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

### 4. **DATA MODEL: IP Address Collection Without Privacy Policy**
**Severity:** HIGH (Legal/Compliance)  
**File:** `amplify/data/resource.ts:105`

**Issue:** ✅ **RESOLVED**
```typescript
UserActivity: a.model({
  ipAddress: a.string(),  // ❌ Collecting IP addresses - REMOVED
  userAgent: a.string(),
  deviceInfo: a.string(),
  // ... other fields
})
```

**Current Status:**
- ~~Schema defines `ipAddress` field~~ **REMOVED** ✅
- Implementation in `useActivityTracking.ts` does NOT collect IP (good!)
- Schema no longer includes the field

**Legal Concerns:**
- GDPR/CCPA compliance requires disclosure
- Privacy policy must mention data collection
- Need user consent for tracking

**Recommendation:**
- ✅ Remove `ipAddress` field from schema if not using it **DONE**
- Add privacy policy page
- Implement cookie consent banner
- Add data retention policies

---

### 5. **BUILD CONFIG: Missing Environment-Specific Configurations**
**Severity:** HIGH  
**Files:** `vite.config.ts`, missing `.env` files

**Issue:**
- No environment-specific configuration
- No `.env.production`, `.env.development` files
- Build configuration is minimal
- No production optimizations configured

**Missing Configurations:**
- Source maps handling for production
- Bundle size optimization
- Tree shaking configuration  
- Code splitting strategy
- Asset optimization

**Fix Required:**
Update `vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: process.env.NODE_ENV !== 'production',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          aws: ['aws-amplify'],
        }
      }
    }
  }
})
```

---

## ⚠️ HIGH PRIORITY ISSUES

### 6. **PERFORMANCE: Potential Infinite Recursion in Referral Code Generation** ✅ **RESOLVED**
**Severity:** MEDIUM-HIGH  
**Files:** 
- `amplify/functions/referral-api/handler.ts:238`
- `amplify/functions/referral-processor/handler.ts:110`

**Issue:** ✅ **FIXED**
```typescript
async function generateReferralCode(userId: string, retryCount = 0) {
  const MAX_RETRIES = 10;
  
  if (existingCodes.listReferralCodes.items.length > 0) {
    // Retry with a new code if we haven't exceeded max retries
    if (retryCount >= MAX_RETRIES) {
      console.error(`Failed to generate unique referral code after ${MAX_RETRIES} attempts`);
      return { /* error response */ };
    }
    return await generateReferralCode(userId, retryCount + 1);  // ✅ Retry limit added
  }
}
```

**Impact:**
- ~~Could cause infinite recursion if collision rate is high~~ **FIXED**
- ~~Lambda timeout (potential cost spike)~~ **FIXED**
- ~~No maximum retry limit~~ **FIXED**

**Fix Applied:**
- ✅ Added `MAX_RETRIES = 10` constant
- ✅ Added `retryCount` parameter with default value
- ✅ Check retry count before recursive call
- ✅ Return error after max retries exceeded
- ✅ Applied fix to both handler files

---

### 7. **SECURITY: Overly Permissive CORS Headers**
**Severity:** MEDIUM-HIGH  
**Files:** 
- `amplify/functions/referral-api/handler.ts:92`
- `amplify/functions/subscription-manager/handler.ts:20`

**Issue:**
```typescript
headers = {
  'Access-Control-Allow-Origin': '*',  // ❌ Allows any origin
}
```

**Impact:**
- Any website can call your API
- Cross-site request forgery (CSRF) vulnerability
- Potential abuse of API endpoints

**Fix Required:**
```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
headers = {
  'Access-Control-Allow-Origin': allowedOrigins.includes(origin) 
    ? origin 
    : allowedOrigins[0],
}
```

---

### 8. **CODE QUALITY: TODO/FIXME Items in Production Code**
**Severity:** MEDIUM  
**Files Found:** 7 files with TODO comments

**Files:**
- `src/i18n.ts`
- `src/pages/newsfeed/NewsSocketClient.tsx`
- `src/hooks/useSubscriptionStatus.ts`
- `src/context/NewsContext.tsx`
- `src/components/NewsManager/NewsManager.tsx`
- `src/App.tsx`
- `src/types/errors.ts`

**Recommendation:**
- Review all TODO items
- Create tickets for incomplete features
- Remove or complete before production

---

### 9. **DEPENDENCIES: Package Version Audit Needed**
**Severity:** MEDIUM  
**File:** `package.json`

**Issue:**
- No security audit performed
- Using caret (^) versioning for critical packages
- Some packages may have known vulnerabilities

**Key Dependencies:**
- `react`: ^18.2.0
- `aws-amplify`: ^6.14.4
- `framer-motion`: ^12.12.1
- `react-router-dom`: ^7.6.0

**Action Required:**
```bash
npm audit
npm audit fix
npm outdated
```

**Recommendation:**
- Lock dependencies for production stability
- Run security audit
- Update packages with known vulnerabilities

---

### 10. **USER EXPERIENCE: Missing Meta Tags for SEO and Social Sharing**
**Severity:** MEDIUM  
**File:** `index.html`

**Issue:**
```html
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/png" href="/PerkinsLogo_Base_Transp_P.png" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Perkins - Intelligence First</title>
  <!-- ❌ Missing meta tags -->
</head>
```

**Missing Tags:**
- Open Graph tags for social media
- Twitter Card tags
- Description meta tag
- Keywords meta tag
- Theme color
- Apple touch icons

**Fix Required:**
```html
<meta name="description" content="Your description here" />
<meta property="og:title" content="Perkins - Intelligence First" />
<meta property="og:description" content="..." />
<meta property="og:image" content="/og-image.png" />
<meta name="twitter:card" content="summary_large_image" />
```

---

### 11. **MONITORING: No Error Tracking/Monitoring Service**
**Severity:** MEDIUM  
**Files:** Application-wide

**Issue:**
- No integration with error tracking (Sentry, Rollbar, etc.)
- No application performance monitoring
- No user analytics beyond custom tracking

**Impact:**
- Can't track production errors
- No visibility into user experience
- Difficult to debug production issues

**Recommendation:**
- Integrate Sentry or similar service
- Add CloudWatch dashboards for Lambda functions
- Set up alerts for critical errors

---

## ⚡ MEDIUM PRIORITY ISSUES

### 12. **AUTHENTICATION: Password Policy Could Be Stronger**
**Severity:** MEDIUM  
**File:** `amplify_outputs.json` (set in Cognito)

**Current Policy:**
```json
"password_policy": {
  "min_length": 8,
  "require_lowercase": true,
  "require_numbers": true,
  "require_symbols": true,
  "require_uppercase": true
}
```

**Issue:**
- 8 characters is minimum acceptable
- No maximum length specified
- No password history enforcement

**Recommendation:**
- Increase minimum to 12 characters
- Implement password history (last 5 passwords)
- Add password strength meter in UI

---

### 13. **FEATURE FLAGS: Subscriptions Disabled But Code Present**
**Severity:** MEDIUM  
**File:** `src/config/features.ts`

**Issue:**
```typescript
export const FEATURE_FLAGS = {
  ENABLE_SUBSCRIPTIONS: false,
  ENABLE_SUBSCRIPTION_UPGRADES: false,
  ENABLE_SUBSCRIPTION_BUTTONS: false,
}
```

**Observation:**
- Subscription code is fully implemented
- Database models exist for subscriptions
- Backend functions handle subscription logic
- Feature is disabled via flags

**Recommendation for Production:**
- If subscriptions won't be used, remove dead code
- If planning to enable, create activation plan
- Document subscription pricing and payment integration status
- Note: `subscription-manager` Lambda appears to be a stub

---

### 14. **DATA RETENTION: No TTL Implementation for UserActivity**
**Severity:** MEDIUM  
**File:** `amplify/data/resource.ts:96-108`

**Issue:**
```typescript
UserActivity: a.model({
  sessionId: a.string().required(),
  startTime: a.datetime().required(),
  endTime: a.datetime(),
  duration: a.integer(),
  // ❌ No TTL field for automatic deletion
})
```

**Impact:**
- UserActivity records grow indefinitely
- Increased DynamoDB costs
- Privacy concerns (data retention)
- GDPR compliance issues

**Fix Required:**
```typescript
UserActivity: a.model({
  // ... existing fields
  ttl: a.integer(), // Unix timestamp for auto-deletion
})
```

Set TTL to 90 days:
```typescript
ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60)
```

---

### 15. **CODE ORGANIZATION: Inconsistent Error Handling**
**Severity:** MEDIUM  
**Files:** Multiple Lambda functions

**Issue:**
- Some functions return errors in response body
- Others throw exceptions
- Inconsistent error response formats
- No centralized error handling

**Examples:**
```typescript
// referral-api/handler.ts - returns error in body
return {
  statusCode: 500,
  body: JSON.stringify({ error: 'Internal server error' })
};

// post-confirmation/handler.ts - swallows errors
catch (error) {
  console.error('Error:', error);
  return event; // ❌ Silently fails
}
```

**Recommendation:**
- Create centralized error handler
- Standardize error response format
- Implement proper error logging
- Return consistent error codes

---

### 16. **PERFORMANCE: No Lazy Loading for Routes**
**Severity:** MEDIUM  
**File:** `src/App.tsx`

**Issue:**
```typescript
import NewsSocketClient from "./pages/newsfeed/NewsSocketClient";
import UserSettings from "./pages/settings/UserSettings";
import PasswordSettings from "./pages/settings/PasswordSettings";
// ... all imports loaded upfront
```

**Impact:**
- Larger initial bundle size
- Slower initial page load
- All components loaded even if not accessed

**Fix Required:**
```typescript
const NewsSocketClient = lazy(() => import("./pages/newsfeed/NewsSocketClient"));
const UserSettings = lazy(() => import("./pages/settings/UserSettings"));

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/" element={<NewsSocketClient />} />
  </Routes>
</Suspense>
```

---

### 17. **TYPESCRIPT: Using 'any' Types in Multiple Places**
**Severity:** MEDIUM  
**Files:** Multiple

**Examples:**
```typescript
// amplify/functions/referral-api/handler.ts:40
async function appsyncRequest<T = any>(query: string, variables?: any)

// Similar in other files
```

**Impact:**
- Loss of type safety
- Potential runtime errors
- Harder to maintain

**Recommendation:**
- Define proper TypeScript interfaces
- Remove all `any` types
- Enable `noImplicitAny` in tsconfig (already enabled ✓)

---

### 18. **TESTING: No Test Files Found**
**Severity:** MEDIUM  
**Files:** Application-wide

**Issue:**
- No unit tests
- No integration tests  
- No E2E tests
- No test configuration

**Impact:**
- No automated quality checks
- Risk of regressions
- Difficult to refactor safely

**Recommendation:**
- Add Jest + React Testing Library
- Write tests for critical paths:
  - Authentication flow
  - Referral processing
  - Subscription management
- Set up CI/CD testing pipeline

---

## 📋 LOW PRIORITY / NICE TO HAVE

### 19. **DOCUMENTATION: README Contains Development TODOs**
**Severity:** LOW  
**File:** `README.md`

**Issue:**
```markdown
## ToDo's
- Colombia / Mexico complete
- Apply for AWS grant - Fernando Errandosoro ITBA
- Open (MPago) business account for Finu - pay AWS, GEMINI.
- Legal disclaimers
```

**Recommendation:**
- Move TODOs to project management tool
- Clean up README for production
- Add production deployment instructions
- Document environment setup

---

### 20. **BUILD: No Production Build Verification**
**Severity:** LOW  
**Files:** Build process

**Issue:**
- No automated build verification
- No bundle size limits
- No performance budgets

**Recommendation:**
```json
// package.json
"scripts": {
  "build": "tsc && vite build",
  "build:analyze": "vite build --mode analyze",
  "size-limit": "size-limit"
}
```

---

### 21. **ACCESSIBILITY: No ARIA Labels or A11y Considerations**
**Severity:** LOW  
**Files:** UI Components

**Issue:**
- Limited accessibility attributes
- No keyboard navigation testing
- No screen reader testing

**Recommendation:**
- Add ARIA labels
- Test with screen readers
- Implement keyboard navigation
- Add focus management

---

### 22. **PERFORMANCE: Images Not Optimized**
**Severity:** LOW  
**Files:** `/public` directory

**Issue:**
- Multiple logo variants (some unused)
- No image optimization
- No responsive images

**Files:**
```
public/
  - BaseLogo_P.PNG
  - PerkinsLogo_Base_Gray.png
  - PerkinsLogo_Base_Transp.png (multiple versions)
  - etc.
```

**Recommendation:**
- Remove unused images
- Optimize PNG files
- Use modern formats (WebP)
- Implement responsive images

---

## ✅ POSITIVE FINDINGS

### What's Good:

1. ✅ **TypeScript Strict Mode Enabled** - `tsconfig.json` has `"strict": true`
2. ✅ **Good Authentication Flow** - Amplify Authenticator properly implemented
3. ✅ **Session Management** - Comprehensive session tracking and inactivity logout
4. ✅ **Error Handling UI** - `AuthErrorFallback` component provides good UX
5. ✅ **Responsive Design** - Mobile-first approach visible in CSS
6. ✅ **Internationalization** - i18n setup for multi-language support
7. ✅ **Code Splitting Prepared** - Using Vite which supports it by default
8. ✅ **Modern Stack** - React 18, AWS Amplify Gen 2, TypeScript
9. ✅ **Feature Flags** - Good pattern for feature management
10. ✅ **IP Tracking Disabled** - Privacy-conscious (IP field exists but not populated)
11. ✅ **Secrets Properly Managed** - `amplify_outputs.json` correctly ignored by git

---

## 📊 PRIORITY MATRIX

| Priority | Issue Count | Must Fix Before Launch |
|----------|-------------|------------------------|
| CRITICAL | 5 | Yes |
| HIGH | 6 | Yes |
| MEDIUM | 7 | Review & Plan |
| LOW | 4 | Post-launch OK |

---

## 🚀 PRE-LAUNCH CHECKLIST

### Immediate Action Required (Before Production):

- [ ] **FIX #1:** Increase API key expiration to 365 days
- [ ] **FIX #2:** Remove all `console.log` statements (29 files)
- [ ] **FIX #3:** Implement React Error Boundary
- [ ] **FIX #4:** Add privacy policy page (IP/tracking disclosure)
- [ ] **FIX #5:** Configure production build optimizations
- [ ] **FIX #6:** Add retry limits to referral code generation
- [ ] **FIX #7:** Restrict CORS to specific origins
- [ ] **FIX #8:** Resolve all TODO comments
- [ ] **FIX #9:** Run npm audit and fix vulnerabilities

### Recommended Before Launch:

- [ ] Add comprehensive meta tags to `index.html`
- [ ] Integrate error tracking service (Sentry)
- [ ] Implement lazy loading for routes
- [ ] Add TTL to UserActivity records
- [ ] Create centralized error handling
- [ ] Review and strengthen password policy
- [ ] Clean up README documentation
- [ ] Write basic test coverage (auth, critical paths)

### Post-Launch (Can Be Deferred):

- [ ] Optimize images and use WebP
- [ ] Improve accessibility (ARIA labels)
- [ ] Set up bundle size monitoring
- [ ] Implement comprehensive testing

---

## 🔧 RECOMMENDED NEXT STEPS

1. **Create GitHub Issues** for all CRITICAL and HIGH priority items
2. **Schedule Security Review** with team
3. **Perform Load Testing** on Lambda functions
4. **Document Deployment Process**
5. **Set Up Monitoring** (CloudWatch, Sentry)
6. **Create Rollback Plan**
7. **Perform Penetration Testing**
8. **Legal Review** (Privacy Policy, Terms of Service)

---

## 📞 ADDITIONAL RECOMMENDATIONS

### Security
- Implement rate limiting on API endpoints
- Add request validation/sanitization
- Set up AWS WAF for DDoS protection
- Enable CloudTrail for audit logging

### Performance
- Set up CloudFront CDN for static assets
- Implement caching strategy
- Optimize database queries
- Monitor Lambda cold starts

### Operations
- Set up automated backups
- Create disaster recovery plan
- Document incident response procedures
- Set up staging environment

---

**Report Generated:** October 22, 2025  
**Review Status:** Complete  
**Recommendation:** Address all CRITICAL and HIGH priority issues before production deployment.

