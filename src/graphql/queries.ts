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
` as GeneratedQuery<
  APITypes.GetArticleQueryVariables,
  APITypes.GetArticleQuery
>;
export const getDeletedUserEmail = /* GraphQL */ `query GetDeletedUserEmail($id: ID!) {
  getDeletedUserEmail(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetDeletedUserEmailQueryVariables,
  APITypes.GetDeletedUserEmailQuery
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
export const getSESCampaignContact = /* GraphQL */ `query GetSESCampaignContact($id: ID!) {
  getSESCampaignContact(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetSESCampaignContactQueryVariables,
  APITypes.GetSESCampaignContactQuery
>;
export const getSESCampaignControl = /* GraphQL */ `query GetSESCampaignControl($id: ID!) {
  getSESCampaignControl(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetSESCampaignControlQueryVariables,
  APITypes.GetSESCampaignControlQuery
>;
export const getUserActivity = /* GraphQL */ `query GetUserActivity($id: ID!) {
  getUserActivity(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetUserActivityQueryVariables,
  APITypes.GetUserActivityQuery
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
` as GeneratedQuery<
  APITypes.GetUserSubscriptionQueryVariables,
  APITypes.GetUserSubscriptionQuery
>;
export const listArticleByCreatedAt = /* GraphQL */ `query ListArticleByCreatedAt(
  $createdAt: AWSDateTime!
  $filter: ModelArticleFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listArticleByCreatedAt(
    createdAt: $createdAt
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListArticleByCreatedAtQueryVariables,
  APITypes.ListArticleByCreatedAtQuery
>;
export const listArticles = /* GraphQL */ `query ListArticles(
  $filter: ModelArticleFilterInput
  $limit: Int
  $nextToken: String
) {
  listArticles(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListArticlesQueryVariables,
  APITypes.ListArticlesQuery
>;
export const listDeletedUserEmails = /* GraphQL */ `query ListDeletedUserEmails(
  $filter: ModelDeletedUserEmailFilterInput
  $limit: Int
  $nextToken: String
) {
  listDeletedUserEmails(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListDeletedUserEmailsQueryVariables,
  APITypes.ListDeletedUserEmailsQuery
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
export const listSESCampaignContactByEmail = /* GraphQL */ `query ListSESCampaignContactByEmail(
  $email: String!
  $filter: ModelSESCampaignContactFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listSESCampaignContactByEmail(
    email: $email
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListSESCampaignContactByEmailQueryVariables,
  APITypes.ListSESCampaignContactByEmailQuery
>;
export const listSESCampaignContactBySent_Status = /* GraphQL */ `query ListSESCampaignContactBySent_Status(
  $Sent_Status: String!
  $filter: ModelSESCampaignContactFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listSESCampaignContactBySent_Status(
    Sent_Status: $Sent_Status
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListSESCampaignContactBySent_StatusQueryVariables,
  APITypes.ListSESCampaignContactBySent_StatusQuery
>;
export const listSESCampaignContacts = /* GraphQL */ `query ListSESCampaignContacts(
  $filter: ModelSESCampaignContactFilterInput
  $limit: Int
  $nextToken: String
) {
  listSESCampaignContacts(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListSESCampaignContactsQueryVariables,
  APITypes.ListSESCampaignContactsQuery
>;
export const listSESCampaignControlByControl = /* GraphQL */ `query ListSESCampaignControlByControl(
  $control: String!
  $filter: ModelSESCampaignControlFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listSESCampaignControlByControl(
    control: $control
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      control
      createdAt
      id
      isEnabled
      lastUpdated
      updatedAt
      updatedBy
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListSESCampaignControlByControlQueryVariables,
  APITypes.ListSESCampaignControlByControlQuery
>;
export const listSESCampaignControls = /* GraphQL */ `query ListSESCampaignControls(
  $filter: ModelSESCampaignControlFilterInput
  $limit: Int
  $nextToken: String
) {
  listSESCampaignControls(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      control
      createdAt
      id
      isEnabled
      lastUpdated
      updatedAt
      updatedBy
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListSESCampaignControlsQueryVariables,
  APITypes.ListSESCampaignControlsQuery
>;
export const listUserActivities = /* GraphQL */ `query ListUserActivities(
  $filter: ModelUserActivityFilterInput
  $limit: Int
  $nextToken: String
) {
  listUserActivities(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListUserActivitiesQueryVariables,
  APITypes.ListUserActivitiesQuery
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListUserSubscriptionsQueryVariables,
  APITypes.ListUserSubscriptionsQuery
>;
