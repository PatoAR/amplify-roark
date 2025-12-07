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
    articleType
    callToAction
    category
    companies
    countries
    createdAt
    id
    industry
    language
    link
    priorityDuration
    priorityUntil
    source
    sponsorLink
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
export const createDeletedUserEmail = /* GraphQL */ `mutation CreateDeletedUserEmail(
  $condition: ModelDeletedUserEmailConditionInput
  $input: CreateDeletedUserEmailInput!
) {
  createDeletedUserEmail(condition: $condition, input: $input) {
    createdAt
    deletedAt
    deletionReason
    email
    id
    originalUserId
    owner
    subscriptionStatus
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateDeletedUserEmailMutationVariables,
  APITypes.CreateDeletedUserEmailMutation
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
export const createSESCampaignContact = /* GraphQL */ `mutation CreateSESCampaignContact(
  $condition: ModelSESCampaignContactConditionInput
  $input: CreateSESCampaignContactInput!
) {
  createSESCampaignContact(condition: $condition, input: $input) {
    Company
    Company_Sequence
    Error_Status
    FirstName
    Language
    LastName
    Send_Group_ID
    Sent_Date
    Sent_Status
    Target_Send_Date
    createdAt
    email
    id
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateSESCampaignContactMutationVariables,
  APITypes.CreateSESCampaignContactMutation
>;
export const createSESCampaignControl = /* GraphQL */ `mutation CreateSESCampaignControl(
  $condition: ModelSESCampaignControlConditionInput
  $input: CreateSESCampaignControlInput!
) {
  createSESCampaignControl(condition: $condition, input: $input) {
    control
    createdAt
    id
    isEnabled
    lastUpdated
    updatedAt
    updatedBy
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateSESCampaignControlMutationVariables,
  APITypes.CreateSESCampaignControlMutation
>;
export const createUserActivity = /* GraphQL */ `mutation CreateUserActivity(
  $condition: ModelUserActivityConditionInput
  $input: CreateUserActivityInput!
) {
  createUserActivity(condition: $condition, input: $input) {
    createdAt
    deviceInfo
    duration
    endTime
    id
    isActive
    owner
    sessionId
    startTime
    updatedAt
    userAgent
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateUserActivityMutationVariables,
  APITypes.CreateUserActivityMutation
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
    email
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
    articleType
    callToAction
    category
    companies
    countries
    createdAt
    id
    industry
    language
    link
    priorityDuration
    priorityUntil
    source
    sponsorLink
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
export const deleteDeletedUserEmail = /* GraphQL */ `mutation DeleteDeletedUserEmail(
  $condition: ModelDeletedUserEmailConditionInput
  $input: DeleteDeletedUserEmailInput!
) {
  deleteDeletedUserEmail(condition: $condition, input: $input) {
    createdAt
    deletedAt
    deletionReason
    email
    id
    originalUserId
    owner
    subscriptionStatus
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteDeletedUserEmailMutationVariables,
  APITypes.DeleteDeletedUserEmailMutation
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
export const deleteSESCampaignContact = /* GraphQL */ `mutation DeleteSESCampaignContact(
  $condition: ModelSESCampaignContactConditionInput
  $input: DeleteSESCampaignContactInput!
) {
  deleteSESCampaignContact(condition: $condition, input: $input) {
    Company
    Company_Sequence
    Error_Status
    FirstName
    Language
    LastName
    Send_Group_ID
    Sent_Date
    Sent_Status
    Target_Send_Date
    createdAt
    email
    id
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteSESCampaignContactMutationVariables,
  APITypes.DeleteSESCampaignContactMutation
>;
export const deleteSESCampaignControl = /* GraphQL */ `mutation DeleteSESCampaignControl(
  $condition: ModelSESCampaignControlConditionInput
  $input: DeleteSESCampaignControlInput!
) {
  deleteSESCampaignControl(condition: $condition, input: $input) {
    control
    createdAt
    id
    isEnabled
    lastUpdated
    updatedAt
    updatedBy
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteSESCampaignControlMutationVariables,
  APITypes.DeleteSESCampaignControlMutation
>;
export const deleteUserActivity = /* GraphQL */ `mutation DeleteUserActivity(
  $condition: ModelUserActivityConditionInput
  $input: DeleteUserActivityInput!
) {
  deleteUserActivity(condition: $condition, input: $input) {
    createdAt
    deviceInfo
    duration
    endTime
    id
    isActive
    owner
    sessionId
    startTime
    updatedAt
    userAgent
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteUserActivityMutationVariables,
  APITypes.DeleteUserActivityMutation
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
    email
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
    articleType
    callToAction
    category
    companies
    countries
    createdAt
    id
    industry
    language
    link
    priorityDuration
    priorityUntil
    source
    sponsorLink
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
export const updateDeletedUserEmail = /* GraphQL */ `mutation UpdateDeletedUserEmail(
  $condition: ModelDeletedUserEmailConditionInput
  $input: UpdateDeletedUserEmailInput!
) {
  updateDeletedUserEmail(condition: $condition, input: $input) {
    createdAt
    deletedAt
    deletionReason
    email
    id
    originalUserId
    owner
    subscriptionStatus
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateDeletedUserEmailMutationVariables,
  APITypes.UpdateDeletedUserEmailMutation
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
export const updateSESCampaignContact = /* GraphQL */ `mutation UpdateSESCampaignContact(
  $condition: ModelSESCampaignContactConditionInput
  $input: UpdateSESCampaignContactInput!
) {
  updateSESCampaignContact(condition: $condition, input: $input) {
    Company
    Company_Sequence
    Error_Status
    FirstName
    Language
    LastName
    Send_Group_ID
    Sent_Date
    Sent_Status
    Target_Send_Date
    createdAt
    email
    id
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateSESCampaignContactMutationVariables,
  APITypes.UpdateSESCampaignContactMutation
>;
export const updateSESCampaignControl = /* GraphQL */ `mutation UpdateSESCampaignControl(
  $condition: ModelSESCampaignControlConditionInput
  $input: UpdateSESCampaignControlInput!
) {
  updateSESCampaignControl(condition: $condition, input: $input) {
    control
    createdAt
    id
    isEnabled
    lastUpdated
    updatedAt
    updatedBy
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateSESCampaignControlMutationVariables,
  APITypes.UpdateSESCampaignControlMutation
>;
export const updateUserActivity = /* GraphQL */ `mutation UpdateUserActivity(
  $condition: ModelUserActivityConditionInput
  $input: UpdateUserActivityInput!
) {
  updateUserActivity(condition: $condition, input: $input) {
    createdAt
    deviceInfo
    duration
    endTime
    id
    isActive
    owner
    sessionId
    startTime
    updatedAt
    userAgent
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateUserActivityMutationVariables,
  APITypes.UpdateUserActivityMutation
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
    email
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
export const upgradeSubscription = /* GraphQL */ `mutation UpgradeSubscription(
  $paymentMethodId: String
  $planId: String!
  $userId: String!
) {
  upgradeSubscription(
    paymentMethodId: $paymentMethodId
    planId: $planId
    userId: $userId
  )
}
` as GeneratedMutation<
  APITypes.UpgradeSubscriptionMutationVariables,
  APITypes.UpgradeSubscriptionMutation
>;
