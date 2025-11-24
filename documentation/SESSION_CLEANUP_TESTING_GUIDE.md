# Session Cleanup Testing Guide

This guide helps you verify that session cleanup works properly in all scenarios.

## Prerequisites

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Go to **Application** tab → **Local Storage** → your domain
4. Have access to Analytics Dashboard (if you're a master user)

---

## Test 1: Manual Logout Cleanup

### Steps:
1. **Before logout:**
   - Open Console
   - Note the current sessionId (check console logs for "✅ Activity tracking started" or "✅ Session restored")
   - Open Application → Local Storage
   - Look for keys starting with `roark_`:
     - `roark_session_id`
     - `roark_session_record_id`
     - `roark_session_start_time`
     - `roark_article_read_states_<sessionId>`

2. **Perform logout:**
   - Click logout button
   - Watch console for: `✅ Activity session ended`

3. **After logout - Verify:**

   **Console:**
   - ✅ Should see: `✅ Activity session ended`
   - ❌ Should NOT see any errors

   **Local Storage:**
   ```javascript
   // Run in console:
   Object.keys(localStorage).filter(k => k.startsWith('roark_'))
   // Should return: [] (empty array)
   ```

   **Preserved keys (should still exist):**
   ```javascript
   // Run in console:
   ['theme', 'userLanguage', 'perkins-optimal-usage-modal-hidden'].forEach(k => 
     console.log(k, localStorage.getItem(k))
   )
   // These should still exist
   ```

   **Database Verification (Choose one method):**

   **Method 1: Browser Console Helper (Easiest)**
   ```javascript
   // In browser console, run:
   __checkSessions()
   
   // Or for a specific user:
   __checkSessions("YOUR_USER_ID")
   ```
   This will show all sessions with:
   - `isActive: false` (should be false after logout)
   - `endTime: <timestamp>` (should be set)
   - `duration: <number in seconds>` (should be calculated)

   **Method 2: Analytics Dashboard (Aggregated View)**
   - Go to `/analytics` (if master user: `master@perkinsintel.com`)
   - The dashboard shows aggregated statistics
   - Note: This doesn't show individual session details, only totals

   **Method 3: Direct GraphQL Query**
   - Use AWS AppSync Console or GraphQL Playground
   - Run the query from "Database Query Examples" section below

---

## Test 2: Browser Console Verification

### Quick Check Script

Run this in the browser console to check session state:

```javascript
// Check session in localStorage
const sessionId = localStorage.getItem('roark_session_id');
const recordId = localStorage.getItem('roark_session_record_id');
const startTime = localStorage.getItem('roark_session_start_time');

console.log('Session Info:', {
  sessionId,
  recordId,
  startTime,
  exists: !!(sessionId && recordId && startTime)
});

// Check article read states
const sessionKeys = Object.keys(localStorage).filter(k => k.startsWith('roark_article_read_states_'));
console.log('Article read state keys:', sessionKeys);

// Check if session keys are cleared
const roarkKeys = Object.keys(localStorage).filter(k => k.startsWith('roark_'));
console.log('All roark_ keys:', roarkKeys);
console.log('Session cleaned?', roarkKeys.length === 0);
```

### Expected Results:

**When session is active:**
- `sessionId`, `recordId`, `startTime` should have values
- `roark_article_read_states_<sessionId>` key should exist if articles were read

**After logout:**
- All `roark_*` keys should be removed
- Only preserved keys (`theme`, `userLanguage`, etc.) should remain

---

## Test 3: Database Verification

### Option A: Via Analytics Dashboard

1. Log in as master user (`master@perkinsintel.com`)
2. Go to `/analytics`
3. Check the session data:
   - Look for your recent session
   - Verify:
     - `isActive: false` (after logout)
     - `endTime` is set
     - `duration` is calculated correctly

### Option B: Direct GraphQL Query

If you have access to GraphQL playground or can run queries:

```graphql
query ListMySessions {
  listUserActivities(filter: { owner: { eq: "YOUR_USER_ID" } }) {
    items {
      id
      sessionId
      startTime
      endTime
      duration
      isActive
      createdAt
      updatedAt
    }
  }
}
```

**Check:**
- Most recent session should have `isActive: false`
- `endTime` should be recent (within last few minutes)
- `duration` should be reasonable (not 0, not extremely large)

---

## Test 4: Multiple Tabs Cleanup

### Steps:
1. Open the app in **Tab 1**
2. Open the app in **Tab 2** (same browser)
3. Both tabs should share the same session (check console logs)
4. **Logout from Tab 1**
5. **Check Tab 2:**

   **Console (Tab 2):**
   - Should detect session cleared (via storage event)
   - May show session-related updates

   **Local Storage (Tab 2):**
   - Session keys should be cleared
   - User should be logged out or redirected

---

## Test 5: Inactivity Logout Cleanup

### Steps:
1. Log in
2. Wait for inactivity timer (2 hours default, or modify in code for testing)
3. When inactivity logout triggers:

   **Console:**
   - Should see: `✅ Activity session ended`
   - May see: `inactivity-logout` key preserved

   **Local Storage:**
   ```javascript
   // Check if inactivity-logout key exists
   localStorage.getItem('inactivity-logout')
   // Should exist temporarily
   ```

   **Database:**
   - Session should be marked `isActive: false`
   - `endTime` and `duration` should be set

---

## Test 6: Page Refresh After Logout

### Steps:
1. Logout
2. Refresh the page
3. **Verify:**
   - Should NOT see "Session restored" in console
   - Should NOT create a new session
   - Should be on landing page (unauthenticated)

---

## Test 7: Session Expiration Cleanup

### Steps:
1. Create a session
2. Wait 30+ minutes (or modify `SESSION_EXPIRATION_MS` in `sessionService.ts` for testing)
3. Open a new tab or refresh
4. **Verify:**
   - Old session should be expired automatically
   - New session should be created
   - Old session in database should have `isActive: false`

---

## Test 8: Article Read States Cleanup

### Steps:
1. Mark some articles as read
2. Check localStorage:
   ```javascript
   const sessionId = localStorage.getItem('roark_session_id');
   const readStatesKey = `roark_article_read_states_${sessionId}`;
   const readStates = JSON.parse(localStorage.getItem(readStatesKey) || '[]');
   console.log('Read states:', readStates);
   ```
3. Logout
4. **Verify:**
   ```javascript
   // Should be null/undefined
   localStorage.getItem(readStatesKey)
   ```

---

## Automated Testing Script

Run this comprehensive check in the console:

```javascript
function testSessionCleanup() {
  console.log('=== SESSION CLEANUP TEST ===\n');
  
  // 1. Check session keys
  const sessionKeys = ['roark_session_id', 'roark_session_record_id', 'roark_session_start_time'];
  const hasSession = sessionKeys.every(k => localStorage.getItem(k));
  console.log('1. Active session exists:', hasSession);
  
  // 2. Check article read states
  const readStateKeys = Object.keys(localStorage).filter(k => 
    k.startsWith('roark_article_read_states_')
  );
  console.log('2. Article read state keys:', readStateKeys.length);
  
  // 3. Check preserved keys
  const preservedKeys = ['theme', 'userLanguage', 'perkins-optimal-usage-modal-hidden'];
  const preserved = preservedKeys.filter(k => localStorage.getItem(k));
  console.log('3. Preserved keys:', preserved);
  
  // 4. Check for orphaned keys
  const allRoarkKeys = Object.keys(localStorage).filter(k => k.startsWith('roark_'));
  console.log('4. All roark_ keys:', allRoarkKeys);
  
  // 5. Summary
  if (hasSession) {
    console.log('\n✅ Session is ACTIVE');
    console.log('   Session ID:', localStorage.getItem('roark_session_id'));
  } else {
    console.log('\n✅ Session is CLEANED');
    if (allRoarkKeys.length > 0) {
      console.log('⚠️  WARNING: Found orphaned keys:', allRoarkKeys);
    } else {
      console.log('✅ All session keys properly cleaned');
    }
  }
  
  console.log('\n=== END TEST ===');
}

// Run the test
testSessionCleanup();
```

---

## Common Issues to Check

### Issue 1: Session not ending in database
**Symptoms:**
- `isActive: true` after logout
- `endTime: null`
- `duration: null`

**Check:**
- Console for errors during logout
- Network tab for failed GraphQL mutations
- Verify `endSession()` is being called

### Issue 2: localStorage not cleared
**Symptoms:**
- `roark_*` keys still exist after logout

**Check:**
- Console for errors
- Verify `SessionService.clearStoredSessionInfo()` is called
- Check if logout completed successfully

### Issue 3: Article read states not cleared
**Symptoms:**
- `roark_article_read_states_*` key exists after logout

**Check:**
- Verify `SessionService.clearArticleReadStates()` is called
- Check if sessionId is available when clearing

---

## Quick Verification Checklist

After logout, verify:

- [ ] Console shows: `✅ Activity session ended`
- [ ] No `roark_*` keys in localStorage
- [ ] Preserved keys (`theme`, `userLanguage`) still exist
- [ ] Database shows `isActive: false`
- [ ] Database shows `endTime` is set
- [ ] Database shows `duration` is calculated
- [ ] New login creates a new session (not restoring old one)
- [ ] Article read states are cleared

---

## Testing with Modified Timeouts (For Faster Testing)

To test expiration faster, temporarily modify in `src/utils/sessionService.ts`:

```typescript
// For testing only - change this temporarily
const SESSION_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes (instead of 120 minutes / 2 hours)
```

**Remember to revert after testing!**

---

## Database Query Examples

### Method 1: Browser Console (Recommended - Easiest)

After logout, open browser console and run:

```javascript
// Check all sessions
__checkSessions()

// Check sessions for your user ID (get from console logs or localStorage before logout)
__checkSessions("YOUR_USER_ID_HERE")
```

**What to look for:**
- Most recent session should show:
  - ✅ `isActive: false`
  - ✅ `endTime: <recent timestamp>` (not null)
  - ✅ `duration: <number>` (not null, should be in seconds)
- If you see `isActive: true` for recent sessions, cleanup didn't work

### Method 2: Direct GraphQL Queries

If you have access to AWS AppSync Console or GraphQL Playground:

**Check all your sessions:**
```graphql
query MySessions {
  listUserActivities {
    items {
      sessionId
      startTime
      endTime
      duration
      isActive
      owner
    }
  }
}
```

**Check active sessions only (should be empty after logout):**
```graphql
query ActiveSessions {
  listUserActivities(filter: { isActive: { eq: true } }) {
    items {
      sessionId
      startTime
      owner
      endTime
      duration
    }
  }
}
```

**Check recent sessions:**
```graphql
query RecentSessions {
  listUserActivities(
    filter: { 
      startTime: { ge: "2024-01-01T00:00:00Z" }
    }
    limit: 50
  ) {
    items {
      sessionId
      startTime
      endTime
      duration
      isActive
      owner
    }
  }
}
```

**Check sessions for specific user:**
```graphql
query UserSessions($userId: String!) {
  listUserActivities(
    filter: { owner: { eq: $userId } }
    limit: 50
  ) {
    items {
      sessionId
      startTime
      endTime
      duration
      isActive
    }
  }
}
```

**Variables:**
```json
{
  "userId": "YOUR_USER_ID_HERE"
}
```

---

## Expected Console Logs

### During Normal Operation:
```
✅ Activity tracking started: { sessionId: '...', recordId: '...' }
// OR
✅ Session restored: { sessionId: '...', recordId: '...' }
```

### During Logout:
```
✅ Activity session ended
```

### Errors to Watch For:
```
❌ Failed to end activity session
❌ Failed to end session
Logout error
```

If you see errors, check the Network tab for failed GraphQL requests.

