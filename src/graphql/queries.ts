/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
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
    id
    createdAt
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
  APITypes.ListArticlesQueryVariables,
  APITypes.ListArticlesQuery
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
export const listUserSubscriptions = /* GraphQL */ `
  query ListUserSubscriptions($filter: ModelUserSubscriptionFilterInput) {
    listUserSubscriptions(filter: $filter) {
      items {
        id
        owner
        trialEndDate
      }
    }
  }
`;
export const getUserActivity = /* GraphQL */ `query GetUserActivity($id: ID!) {
  getUserActivity(id: $id) {
    owner
    sessionId
    startTime
    endTime
    duration
    pageViews
    interactions
    deviceInfo
    userAgent
    ipAddress
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
      pageViews
      interactions
      deviceInfo
      userAgent
      ipAddress
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
export const getUserEvent = /* GraphQL */ `query GetUserEvent($id: ID!) {
  getUserEvent(id: $id) {
    owner
    sessionId
    eventType
    eventData
    timestamp
    pageUrl
    elementId
    metadata
    id
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetUserEventQueryVariables,
  APITypes.GetUserEventQuery
>;
export const listUserEvents = /* GraphQL */ `query ListUserEvents(
  $filter: ModelUserEventFilterInput
  $limit: Int
  $nextToken: String
) {
  listUserEvents(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      owner
      sessionId
      eventType
      eventData
      timestamp
      pageUrl
      elementId
      metadata
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
  APITypes.ListUserEventsQueryVariables,
  APITypes.ListUserEventsQuery
>;
