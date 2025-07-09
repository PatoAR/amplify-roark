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
    companies
    countries
    createdAt
    id
    industry
    language
    link
    source
    summary
    timestamp
    title
    ttl
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetArticleQueryVariables,
  APITypes.GetArticleQuery
>;
export const getReferral = /* GraphQL */ `query GetReferral($id: ID!) {
  getReferral(id: $id) {
    completedAt
    createdAt
    freeMonthsEarned
    id
    owner
    referralCode
    referredId
    referrerId
    status
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetReferralQueryVariables,
  APITypes.GetReferralQuery
>;
export const getReferralCode = /* GraphQL */ `query GetReferralCode($id: ID!) {
  getReferralCode(id: $id) {
    code
    createdAt
    id
    isActive
    owner
    successfulReferrals
    totalReferrals
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetReferralCodeQueryVariables,
  APITypes.GetReferralCodeQuery
>;
export const getUserProfile = /* GraphQL */ `query GetUserProfile($id: ID!) {
  getUserProfile(id: $id) {
    countryPreferences
    createdAt
    id
    industryPreferences
    owner
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetUserProfileQueryVariables,
  APITypes.GetUserProfileQuery
>;
export const getUserSubscription = /* GraphQL */ `query GetUserSubscription($id: ID!) {
  getUserSubscription(id: $id) {
    createdAt
    earnedFreeMonths
    id
    owner
    referralCodeUsed
    referrerId
    subscriptionStatus
    totalFreeMonths
    trialEndDate
    trialStartDate
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetUserSubscriptionQueryVariables,
  APITypes.GetUserSubscriptionQuery
>;
export const listArticles = /* GraphQL */ `query ListArticles(
  $filter: ModelArticleFilterInput
  $limit: Int
  $nextToken: String
) {
  listArticles(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      companies
      countries
      createdAt
      id
      industry
      language
      link
      source
      summary
      timestamp
      title
      ttl
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
export const listReferralCodes = /* GraphQL */ `query ListReferralCodes(
  $filter: ModelReferralCodeFilterInput
  $limit: Int
  $nextToken: String
) {
  listReferralCodes(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      code
      createdAt
      id
      isActive
      owner
      successfulReferrals
      totalReferrals
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
export const listReferrals = /* GraphQL */ `query ListReferrals(
  $filter: ModelReferralFilterInput
  $limit: Int
  $nextToken: String
) {
  listReferrals(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      completedAt
      createdAt
      freeMonthsEarned
      id
      owner
      referralCode
      referredId
      referrerId
      status
      updatedAt
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
export const listUserProfiles = /* GraphQL */ `query ListUserProfiles(
  $filter: ModelUserProfileFilterInput
  $limit: Int
  $nextToken: String
) {
  listUserProfiles(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      countryPreferences
      createdAt
      id
      industryPreferences
      owner
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
export const listUserSubscriptions = /* GraphQL */ `query ListUserSubscriptions(
  $filter: ModelUserSubscriptionFilterInput
  $limit: Int
  $nextToken: String
) {
  listUserSubscriptions(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      createdAt
      earnedFreeMonths
      id
      owner
      referralCodeUsed
      referrerId
      subscriptionStatus
      totalFreeMonths
      trialEndDate
      trialStartDate
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
