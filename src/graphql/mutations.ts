/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createArticle = /* GraphQL */ `mutation CreateArticle(
  $input: CreateArticleInput!
  $condition: ModelArticleConditionInput
) {
  createArticle(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateArticleMutationVariables,
  APITypes.CreateArticleMutation
>;
export const updateArticle = /* GraphQL */ `mutation UpdateArticle(
  $input: UpdateArticleInput!
  $condition: ModelArticleConditionInput
) {
  updateArticle(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateArticleMutationVariables,
  APITypes.UpdateArticleMutation
>;
export const deleteArticle = /* GraphQL */ `mutation DeleteArticle(
  $input: DeleteArticleInput!
  $condition: ModelArticleConditionInput
) {
  deleteArticle(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteArticleMutationVariables,
  APITypes.DeleteArticleMutation
>;
export const createUserProfile = /* GraphQL */ `mutation CreateUserProfile(
  $input: CreateUserProfileInput!
  $condition: ModelUserProfileConditionInput
) {
  createUserProfile(input: $input, condition: $condition) {
    owner
    industryPreferences
    countryPreferences
    id
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateUserProfileMutationVariables,
  APITypes.CreateUserProfileMutation
>;
export const updateUserProfile = /* GraphQL */ `mutation UpdateUserProfile(
  $input: UpdateUserProfileInput!
  $condition: ModelUserProfileConditionInput
) {
  updateUserProfile(input: $input, condition: $condition) {
    owner
    industryPreferences
    countryPreferences
    id
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateUserProfileMutationVariables,
  APITypes.UpdateUserProfileMutation
>;
export const deleteUserProfile = /* GraphQL */ `mutation DeleteUserProfile(
  $input: DeleteUserProfileInput!
  $condition: ModelUserProfileConditionInput
) {
  deleteUserProfile(input: $input, condition: $condition) {
    owner
    industryPreferences
    countryPreferences
    id
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteUserProfileMutationVariables,
  APITypes.DeleteUserProfileMutation
>;
export const createReferralCode = /* GraphQL */ `mutation CreateReferralCode(
  $input: CreateReferralCodeInput!
  $condition: ModelReferralCodeConditionInput
) {
  createReferralCode(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateReferralCodeMutationVariables,
  APITypes.CreateReferralCodeMutation
>;
export const updateReferralCode = /* GraphQL */ `mutation UpdateReferralCode(
  $input: UpdateReferralCodeInput!
  $condition: ModelReferralCodeConditionInput
) {
  updateReferralCode(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateReferralCodeMutationVariables,
  APITypes.UpdateReferralCodeMutation
>;
export const deleteReferralCode = /* GraphQL */ `mutation DeleteReferralCode(
  $input: DeleteReferralCodeInput!
  $condition: ModelReferralCodeConditionInput
) {
  deleteReferralCode(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteReferralCodeMutationVariables,
  APITypes.DeleteReferralCodeMutation
>;
export const createReferral = /* GraphQL */ `mutation CreateReferral(
  $input: CreateReferralInput!
  $condition: ModelReferralConditionInput
) {
  createReferral(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateReferralMutationVariables,
  APITypes.CreateReferralMutation
>;
export const updateReferral = /* GraphQL */ `mutation UpdateReferral(
  $input: UpdateReferralInput!
  $condition: ModelReferralConditionInput
) {
  updateReferral(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateReferralMutationVariables,
  APITypes.UpdateReferralMutation
>;
export const deleteReferral = /* GraphQL */ `mutation DeleteReferral(
  $input: DeleteReferralInput!
  $condition: ModelReferralConditionInput
) {
  deleteReferral(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteReferralMutationVariables,
  APITypes.DeleteReferralMutation
>;
export const createUserSubscription = /* GraphQL */ `mutation CreateUserSubscription(
  $input: CreateUserSubscriptionInput!
  $condition: ModelUserSubscriptionConditionInput
) {
  createUserSubscription(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateUserSubscriptionMutationVariables,
  APITypes.CreateUserSubscriptionMutation
>;
export const updateUserSubscription = /* GraphQL */ `mutation UpdateUserSubscription(
  $input: UpdateUserSubscriptionInput!
  $condition: ModelUserSubscriptionConditionInput
) {
  updateUserSubscription(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateUserSubscriptionMutationVariables,
  APITypes.UpdateUserSubscriptionMutation
>;
export const deleteUserSubscription = /* GraphQL */ `mutation DeleteUserSubscription(
  $input: DeleteUserSubscriptionInput!
  $condition: ModelUserSubscriptionConditionInput
) {
  deleteUserSubscription(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteUserSubscriptionMutationVariables,
  APITypes.DeleteUserSubscriptionMutation
>;
export const createUserActivity = /* GraphQL */ `mutation CreateUserActivity(
  $input: CreateUserActivityInput!
  $condition: ModelUserActivityConditionInput
) {
  createUserActivity(input: $input, condition: $condition) {
    owner
    sessionId
    startTime
    endTime
    duration
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
` as GeneratedMutation<
  APITypes.CreateUserActivityMutationVariables,
  APITypes.CreateUserActivityMutation
>;
export const updateUserActivity = /* GraphQL */ `mutation UpdateUserActivity(
  $input: UpdateUserActivityInput!
  $condition: ModelUserActivityConditionInput
) {
  updateUserActivity(input: $input, condition: $condition) {
    owner
    sessionId
    startTime
    endTime
    duration
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
` as GeneratedMutation<
  APITypes.UpdateUserActivityMutationVariables,
  APITypes.UpdateUserActivityMutation
>;
export const deleteUserActivity = /* GraphQL */ `mutation DeleteUserActivity(
  $input: DeleteUserActivityInput!
  $condition: ModelUserActivityConditionInput
) {
  deleteUserActivity(input: $input, condition: $condition) {
    owner
    sessionId
    startTime
    endTime
    duration
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
` as GeneratedMutation<
  APITypes.DeleteUserActivityMutationVariables,
  APITypes.DeleteUserActivityMutation
>;
export const createDeletedUserEmail = /* GraphQL */ `mutation CreateDeletedUserEmail(
  $input: CreateDeletedUserEmailInput!
  $condition: ModelDeletedUserEmailConditionInput
) {
  createDeletedUserEmail(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateDeletedUserEmailMutationVariables,
  APITypes.CreateDeletedUserEmailMutation
>;
export const updateDeletedUserEmail = /* GraphQL */ `mutation UpdateDeletedUserEmail(
  $input: UpdateDeletedUserEmailInput!
  $condition: ModelDeletedUserEmailConditionInput
) {
  updateDeletedUserEmail(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateDeletedUserEmailMutationVariables,
  APITypes.UpdateDeletedUserEmailMutation
>;
export const deleteDeletedUserEmail = /* GraphQL */ `mutation DeleteDeletedUserEmail(
  $input: DeleteDeletedUserEmailInput!
  $condition: ModelDeletedUserEmailConditionInput
) {
  deleteDeletedUserEmail(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteDeletedUserEmailMutationVariables,
  APITypes.DeleteDeletedUserEmailMutation
>;
