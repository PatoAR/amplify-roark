/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getArticle = /* GraphQL */ `query GetArticle($id: ID!) {
  getArticle(id: $id) {
    timestamp
    source
    title
    industry
    summary
    link
    companies
    countries
    language
    ttl
    category
    priorityDuration
    callToAction
    sponsorLink
    priorityUntil
    createdAt
    id
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetArticleQueryVariables,
  APITypes.GetArticleQuery
>;
export const listArticles = /* GraphQL */ `query ListArticles(
  $filter: ModelArticleFilterInput
  $limit: Int
  $nextToken: String
) {
  listArticles(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      timestamp
      source
      title
      industry
      summary
      link
      companies
      countries
      language
      ttl
      category
      priorityDuration
      callToAction
      sponsorLink
      priorityUntil
      createdAt
      id
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListArticlesQueryVariables,
  APITypes.ListArticlesQuery
>;
export const listArticleByCreatedAt = /* GraphQL */ `query ListArticleByCreatedAt(
  $createdAt: AWSDateTime!
  $sortDirection: ModelSortDirection
  $filter: ModelArticleFilterInput
  $limit: Int
  $nextToken: String
) {
  listArticleByCreatedAt(
    createdAt: $createdAt
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      timestamp
      source
      title
      industry
      summary
      link
      companies
      countries
      language
      ttl
      category
      priorityDuration
      callToAction
      sponsorLink
      priorityUntil
      createdAt
      id
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListArticleByCreatedAtQueryVariables,
  APITypes.ListArticleByCreatedAtQuery
>;
export const getUserProfile = /* GraphQL */ `query GetUserProfile($id: ID!) {
  getUserProfile(id: $id) {
    owner
    industryPreferences
    countryPreferences
    id
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetUserProfileQueryVariables,
  APITypes.GetUserProfileQuery
>;
export const listUserProfiles = /* GraphQL */ `query ListUserProfiles(
  $filter: ModelUserProfileFilterInput
  $limit: Int
  $nextToken: String
) {
  listUserProfiles(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      owner
      industryPreferences
      countryPreferences
      id
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListUserProfilesQueryVariables,
  APITypes.ListUserProfilesQuery
>;
export const getReferralCode = /* GraphQL */ `query GetReferralCode($id: ID!) {
  getReferralCode(id: $id) {
    owner
    code
    isActive
    totalReferrals
    successfulReferrals
    id
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetReferralCodeQueryVariables,
  APITypes.GetReferralCodeQuery
>;
export const listReferralCodes = /* GraphQL */ `query ListReferralCodes(
  $filter: ModelReferralCodeFilterInput
  $limit: Int
  $nextToken: String
) {
  listReferralCodes(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      owner
      code
      isActive
      totalReferrals
      successfulReferrals
      id
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListReferralCodesQueryVariables,
  APITypes.ListReferralCodesQuery
>;
export const getReferral = /* GraphQL */ `query GetReferral($id: ID!) {
  getReferral(id: $id) {
    referrerId
    referredId
    referralCode
    status
    completedAt
    freeMonthsEarned
    id
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetReferralQueryVariables,
  APITypes.GetReferralQuery
>;
export const listReferrals = /* GraphQL */ `query ListReferrals(
  $filter: ModelReferralFilterInput
  $limit: Int
  $nextToken: String
) {
  listReferrals(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      referrerId
      referredId
      referralCode
      status
      completedAt
      freeMonthsEarned
      id
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListReferralsQueryVariables,
  APITypes.ListReferralsQuery
>;
export const getUserSubscription = /* GraphQL */ `query GetUserSubscription($id: ID!) {
  getUserSubscription(id: $id) {
    owner
    subscriptionStatus
    trialStartDate
    trialEndDate
    totalFreeMonths
    earnedFreeMonths
    referralCodeUsed
    referrerId
    id
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetUserSubscriptionQueryVariables,
  APITypes.GetUserSubscriptionQuery
>;
export const listUserSubscriptions = /* GraphQL */ `query ListUserSubscriptions(
  $filter: ModelUserSubscriptionFilterInput
  $limit: Int
  $nextToken: String
) {
  listUserSubscriptions(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      owner
      subscriptionStatus
      trialStartDate
      trialEndDate
      totalFreeMonths
      earnedFreeMonths
      referralCodeUsed
      referrerId
      id
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListUserSubscriptionsQueryVariables,
  APITypes.ListUserSubscriptionsQuery
>;
export const getUserActivity = /* GraphQL */ `query GetUserActivity($id: ID!) {
  getUserActivity(id: $id) {
    owner
    sessionId
    startTime
    endTime
    duration
    deviceInfo
    userAgent
    isActive
    id
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetUserActivityQueryVariables,
  APITypes.GetUserActivityQuery
>;
export const listUserActivities = /* GraphQL */ `query ListUserActivities(
  $filter: ModelUserActivityFilterInput
  $limit: Int
  $nextToken: String
) {
  listUserActivities(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      owner
      sessionId
      startTime
      endTime
      duration
      deviceInfo
      userAgent
      isActive
      id
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListUserActivitiesQueryVariables,
  APITypes.ListUserActivitiesQuery
>;
export const getDeletedUserEmail = /* GraphQL */ `query GetDeletedUserEmail($id: ID!) {
  getDeletedUserEmail(id: $id) {
    email
    deletedAt
    originalUserId
    subscriptionStatus
    deletionReason
    id
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetDeletedUserEmailQueryVariables,
  APITypes.GetDeletedUserEmailQuery
>;
export const listDeletedUserEmails = /* GraphQL */ `query ListDeletedUserEmails(
  $filter: ModelDeletedUserEmailFilterInput
  $limit: Int
  $nextToken: String
) {
  listDeletedUserEmails(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      email
      deletedAt
      originalUserId
      subscriptionStatus
      deletionReason
      id
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListDeletedUserEmailsQueryVariables,
  APITypes.ListDeletedUserEmailsQuery
>;
export const getAnalytics = /* GraphQL */ `query GetAnalytics($timeRange: String) {
  getAnalytics(timeRange: $timeRange)
}
` as GeneratedQuery<
  APITypes.GetAnalyticsQueryVariables,
  APITypes.GetAnalyticsQuery
>;
