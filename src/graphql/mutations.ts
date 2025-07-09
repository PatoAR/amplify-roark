/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createArticle = /* GraphQL */ `mutation CreateArticle(
  $condition: ModelArticleConditionInput
  $input: CreateArticleInput!
) {
  createArticle(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateArticleMutationVariables,
  APITypes.CreateArticleMutation
>;
export const createReferral = /* GraphQL */ `mutation CreateReferral(
  $condition: ModelReferralConditionInput
  $input: CreateReferralInput!
) {
  createReferral(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateReferralMutationVariables,
  APITypes.CreateReferralMutation
>;
export const createReferralCode = /* GraphQL */ `mutation CreateReferralCode(
  $condition: ModelReferralCodeConditionInput
  $input: CreateReferralCodeInput!
) {
  createReferralCode(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateReferralCodeMutationVariables,
  APITypes.CreateReferralCodeMutation
>;
export const createUserProfile = /* GraphQL */ `mutation CreateUserProfile(
  $condition: ModelUserProfileConditionInput
  $input: CreateUserProfileInput!
) {
  createUserProfile(condition: $condition, input: $input) {
    countryPreferences
    createdAt
    id
    industryPreferences
    owner
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateUserProfileMutationVariables,
  APITypes.CreateUserProfileMutation
>;
export const createUserSubscription = /* GraphQL */ `mutation CreateUserSubscription(
  $condition: ModelUserSubscriptionConditionInput
  $input: CreateUserSubscriptionInput!
) {
  createUserSubscription(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateUserSubscriptionMutationVariables,
  APITypes.CreateUserSubscriptionMutation
>;
export const deleteArticle = /* GraphQL */ `mutation DeleteArticle(
  $condition: ModelArticleConditionInput
  $input: DeleteArticleInput!
) {
  deleteArticle(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteArticleMutationVariables,
  APITypes.DeleteArticleMutation
>;
export const deleteReferral = /* GraphQL */ `mutation DeleteReferral(
  $condition: ModelReferralConditionInput
  $input: DeleteReferralInput!
) {
  deleteReferral(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteReferralMutationVariables,
  APITypes.DeleteReferralMutation
>;
export const deleteReferralCode = /* GraphQL */ `mutation DeleteReferralCode(
  $condition: ModelReferralCodeConditionInput
  $input: DeleteReferralCodeInput!
) {
  deleteReferralCode(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteReferralCodeMutationVariables,
  APITypes.DeleteReferralCodeMutation
>;
export const deleteUserProfile = /* GraphQL */ `mutation DeleteUserProfile(
  $condition: ModelUserProfileConditionInput
  $input: DeleteUserProfileInput!
) {
  deleteUserProfile(condition: $condition, input: $input) {
    countryPreferences
    createdAt
    id
    industryPreferences
    owner
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteUserProfileMutationVariables,
  APITypes.DeleteUserProfileMutation
>;
export const deleteUserSubscription = /* GraphQL */ `mutation DeleteUserSubscription(
  $condition: ModelUserSubscriptionConditionInput
  $input: DeleteUserSubscriptionInput!
) {
  deleteUserSubscription(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteUserSubscriptionMutationVariables,
  APITypes.DeleteUserSubscriptionMutation
>;
export const updateArticle = /* GraphQL */ `mutation UpdateArticle(
  $condition: ModelArticleConditionInput
  $input: UpdateArticleInput!
) {
  updateArticle(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateArticleMutationVariables,
  APITypes.UpdateArticleMutation
>;
export const updateReferral = /* GraphQL */ `mutation UpdateReferral(
  $condition: ModelReferralConditionInput
  $input: UpdateReferralInput!
) {
  updateReferral(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateReferralMutationVariables,
  APITypes.UpdateReferralMutation
>;
export const updateReferralCode = /* GraphQL */ `mutation UpdateReferralCode(
  $condition: ModelReferralCodeConditionInput
  $input: UpdateReferralCodeInput!
) {
  updateReferralCode(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateReferralCodeMutationVariables,
  APITypes.UpdateReferralCodeMutation
>;
export const updateUserProfile = /* GraphQL */ `mutation UpdateUserProfile(
  $condition: ModelUserProfileConditionInput
  $input: UpdateUserProfileInput!
) {
  updateUserProfile(condition: $condition, input: $input) {
    countryPreferences
    createdAt
    id
    industryPreferences
    owner
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateUserProfileMutationVariables,
  APITypes.UpdateUserProfileMutation
>;
export const updateUserSubscription = /* GraphQL */ `mutation UpdateUserSubscription(
  $condition: ModelUserSubscriptionConditionInput
  $input: UpdateUserSubscriptionInput!
) {
  updateUserSubscription(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateUserSubscriptionMutationVariables,
  APITypes.UpdateUserSubscriptionMutation
>;
