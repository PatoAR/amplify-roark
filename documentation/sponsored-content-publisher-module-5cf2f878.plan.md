<!-- 5cf2f878-64f4-4b24-8b4f-ddf0f3172e76 6364decb-de3c-488e-81bb-2e3aa22519e1 -->
# Sponsored Content Publisher Module

## Overview

Build a complete content publishing system for administrators to grant access to specific users who can then create, schedule, and monitor sponsored articles.

## Database Schema Changes

### 1. ContentPublisher Model

Add new model to `amplify/data/resource.ts`:

- `owner`: User ID (string, required)
- `grantedBy`: Admin user ID who granted access (string)
- `grantedAt`: Timestamp when access was granted (datetime)
- `isActive`: Boolean flag to enable/disable access
- `notes`: Optional admin notes (string)

Authorization: Admins can create/update/delete, publishers can read their own record.

### 2. SponsoredArticle Model

Add new model to `amplify/data/resource.ts`:

- `owner`: Publisher user ID (string, required)
- `title`, `source`, `summary`, `industry`, `companies`, `countries`, `language`: Same as Article
- `link`: URL or document link (string, required)
- `documentKey`: S3 key if document uploaded (string, nullable)
- `category`: Always "SPONSORED" (enum)
- `callToAction`: CTA text (string)
- `status`: enum ['draft', 'scheduled', 'active', 'expired', 'cancelled']
- `scheduleConfig`: JSON field storing:
- `timesPerDay`: number
- `times`: array of time strings (HH:mm format)
- `durationDays`: number
- `startDate`: datetime
- `endDate`: datetime
- `publishedInstances`: Array of published article IDs (for tracking)
- `createdAt`, `updatedAt`: Timestamps

Authorization: Publishers can create/read/update their own, admins can read all.

### 3. ArticleInteraction Model

Add new model to `amplify/data/resource.ts`:

- `articleId`: Article ID (string, required)
- `sponsoredArticleId`: Reference to SponsoredArticle (string, nullable)
- `userId`: User who interacted (string, nullable for anonymous)
- `interactionType`: enum ['view', 'click', 'impression']
- `timestamp`: When interaction occurred (datetime, required)
- `deviceInfo`: Device/browser info (string)
- `sessionId`: User session ID (string, nullable)

Authorization: Authenticated users can create, publishers can read their own articles' interactions.

### 4. Storage Configuration

Add S3 storage bucket in `amplify/storage/resource.ts` for document uploads:

- Path: `sponsored-content/{userId}/{articleId}/{filename}`
- Access: Publishers can upload/read their own, admins can read all

## Backend Functions

### 1. Article Scheduler Lambda

Create `amplify/functions/article-scheduler/resource.ts`:

- Triggered by EventBridge cron (every 15 minutes)
- Queries SponsoredArticle for articles that should be published now
- Creates Article records with category=SPONSORED
- Updates SponsoredArticle status and publishedInstances
- Handles timezone conversions
- Schedules next publication if needed

### 2. Admin Management Function (Optional)

Create `amplify/functions/admin-manager/resource.ts`:

- Mutation to grant/revoke publisher access
- Validates admin permissions
- Updates ContentPublisher model

## Frontend Components

### 1. Admin Interface

**File**: `src/pages/admin/ContentPublisherManagement.tsx`

- List all users with publisher access
- Grant/revoke access
- View publisher activity
- Uses MASTER_EMAIL check for access control

### 2. Publisher Dashboard

**File**: `src/pages/publisher/PublisherDashboard.tsx`

- Overview of published articles
- Quick stats (total articles, active schedules, total views/clicks)
- Recent activity feed

### 3. Article Creation Form

**File**: `src/pages/publisher/CreateSponsoredArticle.tsx`

- Form with all article fields (title, source, summary, industry, etc.)
- Link input OR document upload (mutually exclusive)
- Document upload using Amplify Storage
- Schedule configuration:
- Times per day selector
- Time picker for each time slot
- Duration in days
- Start date picker
- Preview of schedule
- Save as draft or schedule immediately

### 4. Article List/Management

**File**: `src/pages/publisher/ManageArticles.tsx`

- List all articles (draft, scheduled, active, expired)
- Edit/delete drafts
- View/edit schedules
- Cancel active schedules

### 5. Analytics Dashboard

**File**: `src/pages/publisher/ArticleAnalytics.tsx`

- Per-article statistics:
- Total views, clicks, impressions
- Click-through rate
- Views over time (chart)
- Unique users
- Filter by date range
- Export data option

### 6. Route Protection

**File**: `src/components/PublisherGuard/PublisherGuard.tsx`

- Checks if user has ContentPublisher record with isActive=true
- Redirects unauthorized users
- Shows loading state while checking

## Integration Points

### 1. Article Click Tracking

Update `src/pages/newsfeed/NewsSocketClient.tsx`:

- Track impressions when article is displayed
- Track clicks when article link is clicked
- Create ArticleInteraction records

### 2. Routing

Update `src/App.tsx`:

- Add routes:
- `/admin/publishers` - Admin management
- `/publisher` - Publisher dashboard
- `/publisher/create` - Create article
- `/publisher/articles` - Manage articles
- `/publisher/analytics` - Analytics

### 3. Navigation

Update `src/components/Header/HeaderNav.tsx`:

- Add "Publisher" menu for authorized publishers
- Add "Admin" menu for master user

## Implementation Details

### Scheduling Logic

- Store schedule as JSON in SponsoredArticle.scheduleConfig
- Lambda runs every 15 minutes, checks:
- Articles with status='scheduled' or 'active'
- Current time matches any scheduled time (within 15-min window)
- Article hasn't exceeded durationDays
- Article hasn't exceeded timesPerDay for today
- On publish: Create Article record, update SponsoredArticle.publishedInstances
- When duration expires: Set status='expired'

### Document Upload Flow

1. User selects document in form
2. Upload to S3 using Amplify Storage
3. Get S3 key/URL
4. Store in SponsoredArticle.documentKey
5. Set link field to S3 presigned URL or public URL
6. When creating Article, use same link

### Analytics Tracking

- **Impression**: When article appears in newsfeed (track on article display)
- **View**: When article is visible for >2 seconds (track on visibility)
- **Click**: When user clicks article link (track on click handler)
- Aggregate data in frontend for performance

## Authorization Rules

### ContentPublisher

- Admins (master user): create, read, update, delete all
- Publishers: read own record only
- Public API key: read (for validation)

### SponsoredArticle

- Publishers: create, read, update own articles
- Admins: read all
- Public API key: read (for scheduler)

### ArticleInteraction

- Authenticated: create (for tracking)
- Publishers: read interactions for own articles
- Admins: read all

## UI/UX Considerations

- Follow existing minimalistic style (NewsSocketClient, WelcomeScreen as reference)
- Simple forms with clear labels
- Schedule preview shows next 7 days of publication times
- Analytics charts using simple line/bar charts
- Responsive design for mobile

## Testing Considerations

- Test scheduler with various time configurations
- Test document upload with different file types
- Test analytics aggregation accuracy
- Test authorization rules
- Test timezone handling

### To-dos

- [ ] Add ContentPublisher, SponsoredArticle, and ArticleInteraction models to amplify/data/resource.ts with proper authorization rules
- [ ] Configure S3 storage bucket in amplify/storage/resource.ts for document uploads
- [ ] Create article-scheduler Lambda function with EventBridge cron trigger to publish scheduled articles
- [ ] Create admin interface (ContentPublisherManagement.tsx) to grant/revoke publisher access
- [ ] Create PublisherGuard component to protect publisher routes
- [ ] Create article creation form with document upload and schedule configuration
- [ ] Create article list/management interface for publishers to view/edit/cancel articles
- [ ] Create analytics dashboard showing views, clicks, impressions, and CTR per article
- [ ] Integrate impression/view/click tracking into NewsSocketClient component
- [ ] Add publisher and admin routes to App.tsx and update HeaderNav with new menu items