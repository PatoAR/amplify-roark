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
` as GeneratedSubscription<
  APITypes.OnCreateArticleSubscriptionVariables,
  APITypes.OnCreateArticleSubscription
>;
export const onCreateDeletedUserEmail = /* GraphQL */ `subscription OnCreateDeletedUserEmail(
  $filter: ModelSubscriptionDeletedUserEmailFilterInput
  $owner: String
) {
  onCreateDeletedUserEmail(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateDeletedUserEmailSubscriptionVariables,
  APITypes.OnCreateDeletedUserEmailSubscription
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
export const onCreateSESCampaignContact = /* GraphQL */ `subscription OnCreateSESCampaignContact(
  $filter: ModelSubscriptionSESCampaignContactFilterInput
) {
  onCreateSESCampaignContact(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateSESCampaignContactSubscriptionVariables,
  APITypes.OnCreateSESCampaignContactSubscription
>;
export const onCreateSESCampaignControl = /* GraphQL */ `subscription OnCreateSESCampaignControl(
  $filter: ModelSubscriptionSESCampaignControlFilterInput
) {
  onCreateSESCampaignControl(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateSESCampaignControlSubscriptionVariables,
  APITypes.OnCreateSESCampaignControlSubscription
>;
export const onCreateUserActivity = /* GraphQL */ `subscription OnCreateUserActivity(
  $filter: ModelSubscriptionUserActivityFilterInput
  $owner: String
) {
  onCreateUserActivity(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateUserActivitySubscriptionVariables,
  APITypes.OnCreateUserActivitySubscription
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
` as GeneratedSubscription<
  APITypes.OnCreateUserSubscriptionSubscriptionVariables,
  APITypes.OnCreateUserSubscriptionSubscription
>;
export const onDeleteArticle = /* GraphQL */ `subscription OnDeleteArticle($filter: ModelSubscriptionArticleFilterInput) {
  onDeleteArticle(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteArticleSubscriptionVariables,
  APITypes.OnDeleteArticleSubscription
>;
export const onDeleteDeletedUserEmail = /* GraphQL */ `subscription OnDeleteDeletedUserEmail(
  $filter: ModelSubscriptionDeletedUserEmailFilterInput
  $owner: String
) {
  onDeleteDeletedUserEmail(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteDeletedUserEmailSubscriptionVariables,
  APITypes.OnDeleteDeletedUserEmailSubscription
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
export const onDeleteSESCampaignContact = /* GraphQL */ `subscription OnDeleteSESCampaignContact(
  $filter: ModelSubscriptionSESCampaignContactFilterInput
) {
  onDeleteSESCampaignContact(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteSESCampaignContactSubscriptionVariables,
  APITypes.OnDeleteSESCampaignContactSubscription
>;
export const onDeleteSESCampaignControl = /* GraphQL */ `subscription OnDeleteSESCampaignControl(
  $filter: ModelSubscriptionSESCampaignControlFilterInput
) {
  onDeleteSESCampaignControl(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteSESCampaignControlSubscriptionVariables,
  APITypes.OnDeleteSESCampaignControlSubscription
>;
export const onDeleteUserActivity = /* GraphQL */ `subscription OnDeleteUserActivity(
  $filter: ModelSubscriptionUserActivityFilterInput
  $owner: String
) {
  onDeleteUserActivity(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteUserActivitySubscriptionVariables,
  APITypes.OnDeleteUserActivitySubscription
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
` as GeneratedSubscription<
  APITypes.OnDeleteUserSubscriptionSubscriptionVariables,
  APITypes.OnDeleteUserSubscriptionSubscription
>;
export const onUpdateArticle = /* GraphQL */ `subscription OnUpdateArticle($filter: ModelSubscriptionArticleFilterInput) {
  onUpdateArticle(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateArticleSubscriptionVariables,
  APITypes.OnUpdateArticleSubscription
>;
export const onUpdateDeletedUserEmail = /* GraphQL */ `subscription OnUpdateDeletedUserEmail(
  $filter: ModelSubscriptionDeletedUserEmailFilterInput
  $owner: String
) {
  onUpdateDeletedUserEmail(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateDeletedUserEmailSubscriptionVariables,
  APITypes.OnUpdateDeletedUserEmailSubscription
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
export const onUpdateSESCampaignContact = /* GraphQL */ `subscription OnUpdateSESCampaignContact(
  $filter: ModelSubscriptionSESCampaignContactFilterInput
) {
  onUpdateSESCampaignContact(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateSESCampaignContactSubscriptionVariables,
  APITypes.OnUpdateSESCampaignContactSubscription
>;
export const onUpdateSESCampaignControl = /* GraphQL */ `subscription OnUpdateSESCampaignControl(
  $filter: ModelSubscriptionSESCampaignControlFilterInput
) {
  onUpdateSESCampaignControl(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateSESCampaignControlSubscriptionVariables,
  APITypes.OnUpdateSESCampaignControlSubscription
>;
export const onUpdateUserActivity = /* GraphQL */ `subscription OnUpdateUserActivity(
  $filter: ModelSubscriptionUserActivityFilterInput
  $owner: String
) {
  onUpdateUserActivity(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateUserActivitySubscriptionVariables,
  APITypes.OnUpdateUserActivitySubscription
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
` as GeneratedSubscription<
  APITypes.OnUpdateUserSubscriptionSubscriptionVariables,
  APITypes.OnUpdateUserSubscriptionSubscription
>;
