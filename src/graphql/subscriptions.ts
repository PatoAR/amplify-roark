/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateArticle = /* GraphQL */ `subscription OnCreateArticle($filter: ModelSubscriptionArticleFilterInput) {
  onCreateArticle(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateArticleSubscriptionVariables,
  APITypes.OnCreateArticleSubscription
>;
export const onUpdateArticle = /* GraphQL */ `subscription OnUpdateArticle($filter: ModelSubscriptionArticleFilterInput) {
  onUpdateArticle(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateArticleSubscriptionVariables,
  APITypes.OnUpdateArticleSubscription
>;
export const onDeleteArticle = /* GraphQL */ `subscription OnDeleteArticle($filter: ModelSubscriptionArticleFilterInput) {
  onDeleteArticle(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteArticleSubscriptionVariables,
  APITypes.OnDeleteArticleSubscription
>;
export const onCreateUserProfile = /* GraphQL */ `subscription OnCreateUserProfile(
  $filter: ModelSubscriptionUserProfileFilterInput
  $owner: String
) {
  onCreateUserProfile(filter: $filter, owner: $owner) {
    owner
    industryPreferences
    countryPreferences
    id
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateUserProfileSubscriptionVariables,
  APITypes.OnCreateUserProfileSubscription
>;
export const onUpdateUserProfile = /* GraphQL */ `subscription OnUpdateUserProfile(
  $filter: ModelSubscriptionUserProfileFilterInput
  $owner: String
) {
  onUpdateUserProfile(filter: $filter, owner: $owner) {
    owner
    industryPreferences
    countryPreferences
    id
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateUserProfileSubscriptionVariables,
  APITypes.OnUpdateUserProfileSubscription
>;
export const onDeleteUserProfile = /* GraphQL */ `subscription OnDeleteUserProfile(
  $filter: ModelSubscriptionUserProfileFilterInput
  $owner: String
) {
  onDeleteUserProfile(filter: $filter, owner: $owner) {
    owner
    industryPreferences
    countryPreferences
    id
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteUserProfileSubscriptionVariables,
  APITypes.OnDeleteUserProfileSubscription
>;
export const onCreateReferralCode = /* GraphQL */ `subscription OnCreateReferralCode(
  $filter: ModelSubscriptionReferralCodeFilterInput
  $owner: String
) {
  onCreateReferralCode(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateReferralCodeSubscriptionVariables,
  APITypes.OnCreateReferralCodeSubscription
>;
export const onUpdateReferralCode = /* GraphQL */ `subscription OnUpdateReferralCode(
  $filter: ModelSubscriptionReferralCodeFilterInput
  $owner: String
) {
  onUpdateReferralCode(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateReferralCodeSubscriptionVariables,
  APITypes.OnUpdateReferralCodeSubscription
>;
export const onDeleteReferralCode = /* GraphQL */ `subscription OnDeleteReferralCode(
  $filter: ModelSubscriptionReferralCodeFilterInput
  $owner: String
) {
  onDeleteReferralCode(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteReferralCodeSubscriptionVariables,
  APITypes.OnDeleteReferralCodeSubscription
>;
export const onCreateReferral = /* GraphQL */ `subscription OnCreateReferral(
  $filter: ModelSubscriptionReferralFilterInput
  $owner: String
) {
  onCreateReferral(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateReferralSubscriptionVariables,
  APITypes.OnCreateReferralSubscription
>;
export const onUpdateReferral = /* GraphQL */ `subscription OnUpdateReferral(
  $filter: ModelSubscriptionReferralFilterInput
  $owner: String
) {
  onUpdateReferral(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateReferralSubscriptionVariables,
  APITypes.OnUpdateReferralSubscription
>;
export const onDeleteReferral = /* GraphQL */ `subscription OnDeleteReferral(
  $filter: ModelSubscriptionReferralFilterInput
  $owner: String
) {
  onDeleteReferral(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteReferralSubscriptionVariables,
  APITypes.OnDeleteReferralSubscription
>;
export const onCreateUserSubscription = /* GraphQL */ `subscription OnCreateUserSubscription(
  $filter: ModelSubscriptionUserSubscriptionFilterInput
  $owner: String
) {
  onCreateUserSubscription(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateUserSubscriptionSubscriptionVariables,
  APITypes.OnCreateUserSubscriptionSubscription
>;
export const onUpdateUserSubscription = /* GraphQL */ `subscription OnUpdateUserSubscription(
  $filter: ModelSubscriptionUserSubscriptionFilterInput
  $owner: String
) {
  onUpdateUserSubscription(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateUserSubscriptionSubscriptionVariables,
  APITypes.OnUpdateUserSubscriptionSubscription
>;
export const onDeleteUserSubscription = /* GraphQL */ `subscription OnDeleteUserSubscription(
  $filter: ModelSubscriptionUserSubscriptionFilterInput
  $owner: String
) {
  onDeleteUserSubscription(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteUserSubscriptionSubscriptionVariables,
  APITypes.OnDeleteUserSubscriptionSubscription
>;
export const onCreateUserActivity = /* GraphQL */ `subscription OnCreateUserActivity(
  $filter: ModelSubscriptionUserActivityFilterInput
  $owner: String
) {
  onCreateUserActivity(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateUserActivitySubscriptionVariables,
  APITypes.OnCreateUserActivitySubscription
>;
export const onUpdateUserActivity = /* GraphQL */ `subscription OnUpdateUserActivity(
  $filter: ModelSubscriptionUserActivityFilterInput
  $owner: String
) {
  onUpdateUserActivity(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateUserActivitySubscriptionVariables,
  APITypes.OnUpdateUserActivitySubscription
>;
export const onDeleteUserActivity = /* GraphQL */ `subscription OnDeleteUserActivity(
  $filter: ModelSubscriptionUserActivityFilterInput
  $owner: String
) {
  onDeleteUserActivity(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteUserActivitySubscriptionVariables,
  APITypes.OnDeleteUserActivitySubscription
>;
export const onCreateUserEvent = /* GraphQL */ `subscription OnCreateUserEvent(
  $filter: ModelSubscriptionUserEventFilterInput
  $owner: String
) {
  onCreateUserEvent(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateUserEventSubscriptionVariables,
  APITypes.OnCreateUserEventSubscription
>;
export const onUpdateUserEvent = /* GraphQL */ `subscription OnUpdateUserEvent(
  $filter: ModelSubscriptionUserEventFilterInput
  $owner: String
) {
  onUpdateUserEvent(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateUserEventSubscriptionVariables,
  APITypes.OnUpdateUserEventSubscription
>;
export const onDeleteUserEvent = /* GraphQL */ `subscription OnDeleteUserEvent(
  $filter: ModelSubscriptionUserEventFilterInput
  $owner: String
) {
  onDeleteUserEvent(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteUserEventSubscriptionVariables,
  APITypes.OnDeleteUserEventSubscription
>;
