/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateArticle = /* GraphQL */ `subscription OnCreateArticle($filter: ModelSubscriptionArticleFilterInput) {
  onCreateArticle(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateArticleSubscriptionVariables,
  APITypes.OnCreateArticleSubscription
>;
export const onCreateReferral = /* GraphQL */ `subscription OnCreateReferral(
  $filter: ModelSubscriptionReferralFilterInput
  $owner: String
) {
  onCreateReferral(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateReferralSubscriptionVariables,
  APITypes.OnCreateReferralSubscription
>;
export const onCreateReferralCode = /* GraphQL */ `subscription OnCreateReferralCode(
  $filter: ModelSubscriptionReferralCodeFilterInput
  $owner: String
) {
  onCreateReferralCode(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateReferralCodeSubscriptionVariables,
  APITypes.OnCreateReferralCodeSubscription
>;
export const onCreateUserProfile = /* GraphQL */ `subscription OnCreateUserProfile(
  $filter: ModelSubscriptionUserProfileFilterInput
  $owner: String
) {
  onCreateUserProfile(filter: $filter, owner: $owner) {
    countryPreferences
    createdAt
    id
    industryPreferences
    owner
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateUserProfileSubscriptionVariables,
  APITypes.OnCreateUserProfileSubscription
>;
export const onCreateUserSubscription = /* GraphQL */ `subscription OnCreateUserSubscription(
  $filter: ModelSubscriptionUserSubscriptionFilterInput
  $owner: String
) {
  onCreateUserSubscription(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateUserSubscriptionSubscriptionVariables,
  APITypes.OnCreateUserSubscriptionSubscription
>;
export const onDeleteArticle = /* GraphQL */ `subscription OnDeleteArticle($filter: ModelSubscriptionArticleFilterInput) {
  onDeleteArticle(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteArticleSubscriptionVariables,
  APITypes.OnDeleteArticleSubscription
>;
export const onDeleteReferral = /* GraphQL */ `subscription OnDeleteReferral(
  $filter: ModelSubscriptionReferralFilterInput
  $owner: String
) {
  onDeleteReferral(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteReferralSubscriptionVariables,
  APITypes.OnDeleteReferralSubscription
>;
export const onDeleteReferralCode = /* GraphQL */ `subscription OnDeleteReferralCode(
  $filter: ModelSubscriptionReferralCodeFilterInput
  $owner: String
) {
  onDeleteReferralCode(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteReferralCodeSubscriptionVariables,
  APITypes.OnDeleteReferralCodeSubscription
>;
export const onDeleteUserProfile = /* GraphQL */ `subscription OnDeleteUserProfile(
  $filter: ModelSubscriptionUserProfileFilterInput
  $owner: String
) {
  onDeleteUserProfile(filter: $filter, owner: $owner) {
    countryPreferences
    createdAt
    id
    industryPreferences
    owner
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteUserProfileSubscriptionVariables,
  APITypes.OnDeleteUserProfileSubscription
>;
export const onDeleteUserSubscription = /* GraphQL */ `subscription OnDeleteUserSubscription(
  $filter: ModelSubscriptionUserSubscriptionFilterInput
  $owner: String
) {
  onDeleteUserSubscription(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteUserSubscriptionSubscriptionVariables,
  APITypes.OnDeleteUserSubscriptionSubscription
>;
export const onUpdateArticle = /* GraphQL */ `subscription OnUpdateArticle($filter: ModelSubscriptionArticleFilterInput) {
  onUpdateArticle(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateArticleSubscriptionVariables,
  APITypes.OnUpdateArticleSubscription
>;
export const onUpdateReferral = /* GraphQL */ `subscription OnUpdateReferral(
  $filter: ModelSubscriptionReferralFilterInput
  $owner: String
) {
  onUpdateReferral(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateReferralSubscriptionVariables,
  APITypes.OnUpdateReferralSubscription
>;
export const onUpdateReferralCode = /* GraphQL */ `subscription OnUpdateReferralCode(
  $filter: ModelSubscriptionReferralCodeFilterInput
  $owner: String
) {
  onUpdateReferralCode(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateReferralCodeSubscriptionVariables,
  APITypes.OnUpdateReferralCodeSubscription
>;
export const onUpdateUserProfile = /* GraphQL */ `subscription OnUpdateUserProfile(
  $filter: ModelSubscriptionUserProfileFilterInput
  $owner: String
) {
  onUpdateUserProfile(filter: $filter, owner: $owner) {
    countryPreferences
    createdAt
    id
    industryPreferences
    owner
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateUserProfileSubscriptionVariables,
  APITypes.OnUpdateUserProfileSubscription
>;
export const onUpdateUserSubscription = /* GraphQL */ `subscription OnUpdateUserSubscription(
  $filter: ModelSubscriptionUserSubscriptionFilterInput
  $owner: String
) {
  onUpdateUserSubscription(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateUserSubscriptionSubscriptionVariables,
  APITypes.OnUpdateUserSubscriptionSubscription
>;
