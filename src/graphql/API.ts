/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type Article = {
  __typename: "Article",
  articleType?: string | null,
  callToAction?: string | null,
  category?: ArticleCategory | null,
  companies?: string | null,
  countries?: string | null,
  createdAt?: string | null,
  id: string,
  industry?: string | null,
  language?: string | null,
  link?: string | null,
  priorityDuration?: number | null,
  priorityUntil?: string | null,
  source: string,
  sponsorLink?: string | null,
  summary?: string | null,
  timestamp?: string | null,
  title: string,
  ttl?: number | null,
  updatedAt: string,
};

export enum ArticleCategory {
  NEWS = "NEWS",
  SPONSORED = "SPONSORED",
  STATISTICS = "STATISTICS",
}


export type DeletedUserEmail = {
  __typename: "DeletedUserEmail",
  createdAt: string,
  deletedAt: string,
  deletionReason?: string | null,
  email: string,
  id: string,
  originalUserId?: string | null,
  owner?: string | null,
  subscriptionStatus?: string | null,
  updatedAt: string,
};

export type Referral = {
  __typename: "Referral",
  completedAt?: string | null,
  createdAt: string,
  freeMonthsEarned?: number | null,
  id: string,
  owner?: string | null,
  referralCode: string,
  referredId: string,
  referrerId: string,
  status?: ReferralStatus | null,
  updatedAt: string,
};

export enum ReferralStatus {
  completed = "completed",
  expired = "expired",
  pending = "pending",
}


export type ReferralCode = {
  __typename: "ReferralCode",
  code: string,
  createdAt: string,
  id: string,
  isActive?: boolean | null,
  owner?: string | null,
  successfulReferrals?: number | null,
  totalReferrals?: number | null,
  updatedAt: string,
};

export type SESCampaignContact = {
  __typename: "SESCampaignContact",
  Company: string,
  Company_Sequence?: number | null,
  Error_Status?: string | null,
  FirstName: string,
  Language?: string | null,
  LastName: string,
  Send_Group_ID: number,
  Sent_Date?: string | null,
  Sent_Status?: string | null,
  Target_Send_Date: string,
  createdAt: string,
  email: string,
  id: string,
  updatedAt: string,
};

export type SESCampaignControl = {
  __typename: "SESCampaignControl",
  control: string,
  createdAt: string,
  id: string,
  isEnabled?: boolean | null,
  lastUpdated: string,
  updatedAt: string,
  updatedBy?: string | null,
};

export type UserActivity = {
  __typename: "UserActivity",
  createdAt: string,
  deviceInfo?: string | null,
  duration?: number | null,
  endTime?: string | null,
  id: string,
  isActive?: boolean | null,
  owner?: string | null,
  sessionId: string,
  startTime: string,
  updatedAt: string,
  userAgent?: string | null,
};

export type UserProfile = {
  __typename: "UserProfile",
  countryPreferences?: Array< string | null > | null,
  createdAt: string,
  id: string,
  industryPreferences?: Array< string | null > | null,
  owner?: string | null,
  updatedAt: string,
};

export type UserSubscription = {
  __typename: "UserSubscription",
  createdAt: string,
  earnedFreeMonths?: number | null,
  email?: string | null,
  id: string,
  owner?: string | null,
  referralCodeUsed?: string | null,
  referrerId?: string | null,
  subscriptionStatus?: UserSubscriptionSubscriptionStatus | null,
  totalFreeMonths?: number | null,
  trialEndDate?: string | null,
  trialStartDate?: string | null,
  updatedAt: string,
};

export enum UserSubscriptionSubscriptionStatus {
  active = "active",
  cancelled = "cancelled",
  expired = "expired",
  free_trial = "free_trial",
}


export type ModelStringKeyConditionInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
};

export type ModelArticleFilterInput = {
  and?: Array< ModelArticleFilterInput | null > | null,
  articleType?: ModelStringInput | null,
  callToAction?: ModelStringInput | null,
  category?: ModelArticleCategoryInput | null,
  companies?: ModelStringInput | null,
  countries?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  id?: ModelIDInput | null,
  industry?: ModelStringInput | null,
  language?: ModelStringInput | null,
  link?: ModelStringInput | null,
  not?: ModelArticleFilterInput | null,
  or?: Array< ModelArticleFilterInput | null > | null,
  priorityDuration?: ModelIntInput | null,
  priorityUntil?: ModelStringInput | null,
  source?: ModelStringInput | null,
  sponsorLink?: ModelStringInput | null,
  summary?: ModelStringInput | null,
  timestamp?: ModelStringInput | null,
  title?: ModelStringInput | null,
  ttl?: ModelIntInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelStringInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  _null = "_null",
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
}


export type ModelSizeInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export type ModelArticleCategoryInput = {
  eq?: ArticleCategory | null,
  ne?: ArticleCategory | null,
};

export type ModelIDInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export type ModelIntInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelArticleConnection = {
  __typename: "ModelArticleConnection",
  items:  Array<Article | null >,
  nextToken?: string | null,
};

export type ModelDeletedUserEmailFilterInput = {
  and?: Array< ModelDeletedUserEmailFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  deletedAt?: ModelStringInput | null,
  deletionReason?: ModelStringInput | null,
  email?: ModelStringInput | null,
  id?: ModelIDInput | null,
  not?: ModelDeletedUserEmailFilterInput | null,
  or?: Array< ModelDeletedUserEmailFilterInput | null > | null,
  originalUserId?: ModelStringInput | null,
  owner?: ModelStringInput | null,
  subscriptionStatus?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelDeletedUserEmailConnection = {
  __typename: "ModelDeletedUserEmailConnection",
  items:  Array<DeletedUserEmail | null >,
  nextToken?: string | null,
};

export type ModelReferralCodeFilterInput = {
  and?: Array< ModelReferralCodeFilterInput | null > | null,
  code?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  id?: ModelIDInput | null,
  isActive?: ModelBooleanInput | null,
  not?: ModelReferralCodeFilterInput | null,
  or?: Array< ModelReferralCodeFilterInput | null > | null,
  owner?: ModelStringInput | null,
  successfulReferrals?: ModelIntInput | null,
  totalReferrals?: ModelIntInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelBooleanInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  eq?: boolean | null,
  ne?: boolean | null,
};

export type ModelReferralCodeConnection = {
  __typename: "ModelReferralCodeConnection",
  items:  Array<ReferralCode | null >,
  nextToken?: string | null,
};

export type ModelReferralFilterInput = {
  and?: Array< ModelReferralFilterInput | null > | null,
  completedAt?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  freeMonthsEarned?: ModelIntInput | null,
  id?: ModelIDInput | null,
  not?: ModelReferralFilterInput | null,
  or?: Array< ModelReferralFilterInput | null > | null,
  owner?: ModelStringInput | null,
  referralCode?: ModelStringInput | null,
  referredId?: ModelStringInput | null,
  referrerId?: ModelStringInput | null,
  status?: ModelReferralStatusInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelReferralStatusInput = {
  eq?: ReferralStatus | null,
  ne?: ReferralStatus | null,
};

export type ModelReferralConnection = {
  __typename: "ModelReferralConnection",
  items:  Array<Referral | null >,
  nextToken?: string | null,
};

export type ModelSESCampaignContactFilterInput = {
  Company?: ModelStringInput | null,
  Company_Sequence?: ModelIntInput | null,
  Error_Status?: ModelStringInput | null,
  FirstName?: ModelStringInput | null,
  Language?: ModelStringInput | null,
  LastName?: ModelStringInput | null,
  Send_Group_ID?: ModelIntInput | null,
  Sent_Date?: ModelStringInput | null,
  Sent_Status?: ModelStringInput | null,
  Target_Send_Date?: ModelStringInput | null,
  and?: Array< ModelSESCampaignContactFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  email?: ModelStringInput | null,
  id?: ModelIDInput | null,
  not?: ModelSESCampaignContactFilterInput | null,
  or?: Array< ModelSESCampaignContactFilterInput | null > | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelSESCampaignContactConnection = {
  __typename: "ModelSESCampaignContactConnection",
  items:  Array<SESCampaignContact | null >,
  nextToken?: string | null,
};

export type ModelSESCampaignControlFilterInput = {
  and?: Array< ModelSESCampaignControlFilterInput | null > | null,
  control?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  id?: ModelIDInput | null,
  isEnabled?: ModelBooleanInput | null,
  lastUpdated?: ModelStringInput | null,
  not?: ModelSESCampaignControlFilterInput | null,
  or?: Array< ModelSESCampaignControlFilterInput | null > | null,
  updatedAt?: ModelStringInput | null,
  updatedBy?: ModelStringInput | null,
};

export type ModelSESCampaignControlConnection = {
  __typename: "ModelSESCampaignControlConnection",
  items:  Array<SESCampaignControl | null >,
  nextToken?: string | null,
};

export type ModelUserActivityFilterInput = {
  and?: Array< ModelUserActivityFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  deviceInfo?: ModelStringInput | null,
  duration?: ModelIntInput | null,
  endTime?: ModelStringInput | null,
  id?: ModelIDInput | null,
  isActive?: ModelBooleanInput | null,
  not?: ModelUserActivityFilterInput | null,
  or?: Array< ModelUserActivityFilterInput | null > | null,
  owner?: ModelStringInput | null,
  sessionId?: ModelStringInput | null,
  startTime?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  userAgent?: ModelStringInput | null,
};

export type ModelUserActivityConnection = {
  __typename: "ModelUserActivityConnection",
  items:  Array<UserActivity | null >,
  nextToken?: string | null,
};

export type ModelUserProfileFilterInput = {
  and?: Array< ModelUserProfileFilterInput | null > | null,
  countryPreferences?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  id?: ModelIDInput | null,
  industryPreferences?: ModelStringInput | null,
  not?: ModelUserProfileFilterInput | null,
  or?: Array< ModelUserProfileFilterInput | null > | null,
  owner?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelUserProfileConnection = {
  __typename: "ModelUserProfileConnection",
  items:  Array<UserProfile | null >,
  nextToken?: string | null,
};

export type ModelUserSubscriptionFilterInput = {
  and?: Array< ModelUserSubscriptionFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  earnedFreeMonths?: ModelIntInput | null,
  email?: ModelStringInput | null,
  id?: ModelIDInput | null,
  not?: ModelUserSubscriptionFilterInput | null,
  or?: Array< ModelUserSubscriptionFilterInput | null > | null,
  owner?: ModelStringInput | null,
  referralCodeUsed?: ModelStringInput | null,
  referrerId?: ModelStringInput | null,
  subscriptionStatus?: ModelUserSubscriptionSubscriptionStatusInput | null,
  totalFreeMonths?: ModelIntInput | null,
  trialEndDate?: ModelStringInput | null,
  trialStartDate?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelUserSubscriptionSubscriptionStatusInput = {
  eq?: UserSubscriptionSubscriptionStatus | null,
  ne?: UserSubscriptionSubscriptionStatus | null,
};

export type ModelUserSubscriptionConnection = {
  __typename: "ModelUserSubscriptionConnection",
  items:  Array<UserSubscription | null >,
  nextToken?: string | null,
};

export type ModelArticleConditionInput = {
  and?: Array< ModelArticleConditionInput | null > | null,
  articleType?: ModelStringInput | null,
  callToAction?: ModelStringInput | null,
  category?: ModelArticleCategoryInput | null,
  companies?: ModelStringInput | null,
  countries?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  industry?: ModelStringInput | null,
  language?: ModelStringInput | null,
  link?: ModelStringInput | null,
  not?: ModelArticleConditionInput | null,
  or?: Array< ModelArticleConditionInput | null > | null,
  priorityDuration?: ModelIntInput | null,
  priorityUntil?: ModelStringInput | null,
  source?: ModelStringInput | null,
  sponsorLink?: ModelStringInput | null,
  summary?: ModelStringInput | null,
  timestamp?: ModelStringInput | null,
  title?: ModelStringInput | null,
  ttl?: ModelIntInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateArticleInput = {
  articleType?: string | null,
  callToAction?: string | null,
  category?: ArticleCategory | null,
  companies?: string | null,
  countries?: string | null,
  createdAt?: string | null,
  id?: string | null,
  industry?: string | null,
  language?: string | null,
  link?: string | null,
  priorityDuration?: number | null,
  priorityUntil?: string | null,
  source: string,
  sponsorLink?: string | null,
  summary?: string | null,
  timestamp?: string | null,
  title: string,
  ttl?: number | null,
};

export type ModelDeletedUserEmailConditionInput = {
  and?: Array< ModelDeletedUserEmailConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  deletedAt?: ModelStringInput | null,
  deletionReason?: ModelStringInput | null,
  email?: ModelStringInput | null,
  not?: ModelDeletedUserEmailConditionInput | null,
  or?: Array< ModelDeletedUserEmailConditionInput | null > | null,
  originalUserId?: ModelStringInput | null,
  owner?: ModelStringInput | null,
  subscriptionStatus?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateDeletedUserEmailInput = {
  deletedAt: string,
  deletionReason?: string | null,
  email: string,
  id?: string | null,
  originalUserId?: string | null,
  subscriptionStatus?: string | null,
};

export type ModelReferralConditionInput = {
  and?: Array< ModelReferralConditionInput | null > | null,
  completedAt?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  freeMonthsEarned?: ModelIntInput | null,
  not?: ModelReferralConditionInput | null,
  or?: Array< ModelReferralConditionInput | null > | null,
  owner?: ModelStringInput | null,
  referralCode?: ModelStringInput | null,
  referredId?: ModelStringInput | null,
  referrerId?: ModelStringInput | null,
  status?: ModelReferralStatusInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateReferralInput = {
  completedAt?: string | null,
  freeMonthsEarned?: number | null,
  id?: string | null,
  referralCode: string,
  referredId: string,
  referrerId: string,
  status?: ReferralStatus | null,
};

export type ModelReferralCodeConditionInput = {
  and?: Array< ModelReferralCodeConditionInput | null > | null,
  code?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  isActive?: ModelBooleanInput | null,
  not?: ModelReferralCodeConditionInput | null,
  or?: Array< ModelReferralCodeConditionInput | null > | null,
  owner?: ModelStringInput | null,
  successfulReferrals?: ModelIntInput | null,
  totalReferrals?: ModelIntInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateReferralCodeInput = {
  code: string,
  id?: string | null,
  isActive?: boolean | null,
  owner?: string | null,
  successfulReferrals?: number | null,
  totalReferrals?: number | null,
};

export type ModelSESCampaignContactConditionInput = {
  Company?: ModelStringInput | null,
  Company_Sequence?: ModelIntInput | null,
  Error_Status?: ModelStringInput | null,
  FirstName?: ModelStringInput | null,
  Language?: ModelStringInput | null,
  LastName?: ModelStringInput | null,
  Send_Group_ID?: ModelIntInput | null,
  Sent_Date?: ModelStringInput | null,
  Sent_Status?: ModelStringInput | null,
  Target_Send_Date?: ModelStringInput | null,
  and?: Array< ModelSESCampaignContactConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  email?: ModelStringInput | null,
  not?: ModelSESCampaignContactConditionInput | null,
  or?: Array< ModelSESCampaignContactConditionInput | null > | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateSESCampaignContactInput = {
  Company: string,
  Company_Sequence?: number | null,
  Error_Status?: string | null,
  FirstName: string,
  Language?: string | null,
  LastName: string,
  Send_Group_ID: number,
  Sent_Date?: string | null,
  Sent_Status?: string | null,
  Target_Send_Date: string,
  email: string,
  id?: string | null,
};

export type ModelSESCampaignControlConditionInput = {
  and?: Array< ModelSESCampaignControlConditionInput | null > | null,
  control?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  isEnabled?: ModelBooleanInput | null,
  lastUpdated?: ModelStringInput | null,
  not?: ModelSESCampaignControlConditionInput | null,
  or?: Array< ModelSESCampaignControlConditionInput | null > | null,
  updatedAt?: ModelStringInput | null,
  updatedBy?: ModelStringInput | null,
};

export type CreateSESCampaignControlInput = {
  control: string,
  id?: string | null,
  isEnabled?: boolean | null,
  lastUpdated: string,
  updatedBy?: string | null,
};

export type ModelUserActivityConditionInput = {
  and?: Array< ModelUserActivityConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  deviceInfo?: ModelStringInput | null,
  duration?: ModelIntInput | null,
  endTime?: ModelStringInput | null,
  isActive?: ModelBooleanInput | null,
  not?: ModelUserActivityConditionInput | null,
  or?: Array< ModelUserActivityConditionInput | null > | null,
  owner?: ModelStringInput | null,
  sessionId?: ModelStringInput | null,
  startTime?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  userAgent?: ModelStringInput | null,
};

export type CreateUserActivityInput = {
  deviceInfo?: string | null,
  duration?: number | null,
  endTime?: string | null,
  id?: string | null,
  isActive?: boolean | null,
  owner?: string | null,
  sessionId: string,
  startTime: string,
  userAgent?: string | null,
};

export type ModelUserProfileConditionInput = {
  and?: Array< ModelUserProfileConditionInput | null > | null,
  countryPreferences?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  industryPreferences?: ModelStringInput | null,
  not?: ModelUserProfileConditionInput | null,
  or?: Array< ModelUserProfileConditionInput | null > | null,
  owner?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateUserProfileInput = {
  countryPreferences?: Array< string | null > | null,
  id?: string | null,
  industryPreferences?: Array< string | null > | null,
  owner?: string | null,
};

export type ModelUserSubscriptionConditionInput = {
  and?: Array< ModelUserSubscriptionConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  earnedFreeMonths?: ModelIntInput | null,
  email?: ModelStringInput | null,
  not?: ModelUserSubscriptionConditionInput | null,
  or?: Array< ModelUserSubscriptionConditionInput | null > | null,
  owner?: ModelStringInput | null,
  referralCodeUsed?: ModelStringInput | null,
  referrerId?: ModelStringInput | null,
  subscriptionStatus?: ModelUserSubscriptionSubscriptionStatusInput | null,
  totalFreeMonths?: ModelIntInput | null,
  trialEndDate?: ModelStringInput | null,
  trialStartDate?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateUserSubscriptionInput = {
  earnedFreeMonths?: number | null,
  email?: string | null,
  id?: string | null,
  owner?: string | null,
  referralCodeUsed?: string | null,
  referrerId?: string | null,
  subscriptionStatus?: UserSubscriptionSubscriptionStatus | null,
  totalFreeMonths?: number | null,
  trialEndDate?: string | null,
  trialStartDate?: string | null,
};

export type DeleteArticleInput = {
  id: string,
};

export type DeleteDeletedUserEmailInput = {
  id: string,
};

export type DeleteReferralInput = {
  id: string,
};

export type DeleteReferralCodeInput = {
  id: string,
};

export type DeleteSESCampaignContactInput = {
  id: string,
};

export type DeleteSESCampaignControlInput = {
  id: string,
};

export type DeleteUserActivityInput = {
  id: string,
};

export type DeleteUserProfileInput = {
  id: string,
};

export type DeleteUserSubscriptionInput = {
  id: string,
};

export type UpdateArticleInput = {
  articleType?: string | null,
  callToAction?: string | null,
  category?: ArticleCategory | null,
  companies?: string | null,
  countries?: string | null,
  createdAt?: string | null,
  id: string,
  industry?: string | null,
  language?: string | null,
  link?: string | null,
  priorityDuration?: number | null,
  priorityUntil?: string | null,
  source?: string | null,
  sponsorLink?: string | null,
  summary?: string | null,
  timestamp?: string | null,
  title?: string | null,
  ttl?: number | null,
};

export type UpdateDeletedUserEmailInput = {
  deletedAt?: string | null,
  deletionReason?: string | null,
  email?: string | null,
  id: string,
  originalUserId?: string | null,
  subscriptionStatus?: string | null,
};

export type UpdateReferralInput = {
  completedAt?: string | null,
  freeMonthsEarned?: number | null,
  id: string,
  referralCode?: string | null,
  referredId?: string | null,
  referrerId?: string | null,
  status?: ReferralStatus | null,
};

export type UpdateReferralCodeInput = {
  code?: string | null,
  id: string,
  isActive?: boolean | null,
  owner?: string | null,
  successfulReferrals?: number | null,
  totalReferrals?: number | null,
};

export type UpdateSESCampaignContactInput = {
  Company?: string | null,
  Company_Sequence?: number | null,
  Error_Status?: string | null,
  FirstName?: string | null,
  Language?: string | null,
  LastName?: string | null,
  Send_Group_ID?: number | null,
  Sent_Date?: string | null,
  Sent_Status?: string | null,
  Target_Send_Date?: string | null,
  email?: string | null,
  id: string,
};

export type UpdateSESCampaignControlInput = {
  control?: string | null,
  id: string,
  isEnabled?: boolean | null,
  lastUpdated?: string | null,
  updatedBy?: string | null,
};

export type UpdateUserActivityInput = {
  deviceInfo?: string | null,
  duration?: number | null,
  endTime?: string | null,
  id: string,
  isActive?: boolean | null,
  owner?: string | null,
  sessionId?: string | null,
  startTime?: string | null,
  userAgent?: string | null,
};

export type UpdateUserProfileInput = {
  countryPreferences?: Array< string | null > | null,
  id: string,
  industryPreferences?: Array< string | null > | null,
  owner?: string | null,
};

export type UpdateUserSubscriptionInput = {
  earnedFreeMonths?: number | null,
  email?: string | null,
  id: string,
  owner?: string | null,
  referralCodeUsed?: string | null,
  referrerId?: string | null,
  subscriptionStatus?: UserSubscriptionSubscriptionStatus | null,
  totalFreeMonths?: number | null,
  trialEndDate?: string | null,
  trialStartDate?: string | null,
};

export type ModelSubscriptionArticleFilterInput = {
  and?: Array< ModelSubscriptionArticleFilterInput | null > | null,
  articleType?: ModelSubscriptionStringInput | null,
  callToAction?: ModelSubscriptionStringInput | null,
  category?: ModelSubscriptionStringInput | null,
  companies?: ModelSubscriptionStringInput | null,
  countries?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  industry?: ModelSubscriptionStringInput | null,
  language?: ModelSubscriptionStringInput | null,
  link?: ModelSubscriptionStringInput | null,
  or?: Array< ModelSubscriptionArticleFilterInput | null > | null,
  priorityDuration?: ModelSubscriptionIntInput | null,
  priorityUntil?: ModelSubscriptionStringInput | null,
  source?: ModelSubscriptionStringInput | null,
  sponsorLink?: ModelSubscriptionStringInput | null,
  summary?: ModelSubscriptionStringInput | null,
  timestamp?: ModelSubscriptionStringInput | null,
  title?: ModelSubscriptionStringInput | null,
  ttl?: ModelSubscriptionIntInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionStringInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionIDInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionIntInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  in?: Array< number | null > | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionDeletedUserEmailFilterInput = {
  and?: Array< ModelSubscriptionDeletedUserEmailFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  deletedAt?: ModelSubscriptionStringInput | null,
  deletionReason?: ModelSubscriptionStringInput | null,
  email?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionDeletedUserEmailFilterInput | null > | null,
  originalUserId?: ModelSubscriptionStringInput | null,
  owner?: ModelStringInput | null,
  subscriptionStatus?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionReferralFilterInput = {
  and?: Array< ModelSubscriptionReferralFilterInput | null > | null,
  completedAt?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  freeMonthsEarned?: ModelSubscriptionIntInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionReferralFilterInput | null > | null,
  owner?: ModelStringInput | null,
  referralCode?: ModelSubscriptionStringInput | null,
  referredId?: ModelSubscriptionStringInput | null,
  referrerId?: ModelSubscriptionStringInput | null,
  status?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionReferralCodeFilterInput = {
  and?: Array< ModelSubscriptionReferralCodeFilterInput | null > | null,
  code?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  isActive?: ModelSubscriptionBooleanInput | null,
  or?: Array< ModelSubscriptionReferralCodeFilterInput | null > | null,
  owner?: ModelStringInput | null,
  successfulReferrals?: ModelSubscriptionIntInput | null,
  totalReferrals?: ModelSubscriptionIntInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionBooleanInput = {
  eq?: boolean | null,
  ne?: boolean | null,
};

export type ModelSubscriptionSESCampaignContactFilterInput = {
  Company?: ModelSubscriptionStringInput | null,
  Company_Sequence?: ModelSubscriptionIntInput | null,
  Error_Status?: ModelSubscriptionStringInput | null,
  FirstName?: ModelSubscriptionStringInput | null,
  Language?: ModelSubscriptionStringInput | null,
  LastName?: ModelSubscriptionStringInput | null,
  Send_Group_ID?: ModelSubscriptionIntInput | null,
  Sent_Date?: ModelSubscriptionStringInput | null,
  Sent_Status?: ModelSubscriptionStringInput | null,
  Target_Send_Date?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionSESCampaignContactFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  email?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionSESCampaignContactFilterInput | null > | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionSESCampaignControlFilterInput = {
  and?: Array< ModelSubscriptionSESCampaignControlFilterInput | null > | null,
  control?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  isEnabled?: ModelSubscriptionBooleanInput | null,
  lastUpdated?: ModelSubscriptionStringInput | null,
  or?: Array< ModelSubscriptionSESCampaignControlFilterInput | null > | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  updatedBy?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionUserActivityFilterInput = {
  and?: Array< ModelSubscriptionUserActivityFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  deviceInfo?: ModelSubscriptionStringInput | null,
  duration?: ModelSubscriptionIntInput | null,
  endTime?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  isActive?: ModelSubscriptionBooleanInput | null,
  or?: Array< ModelSubscriptionUserActivityFilterInput | null > | null,
  owner?: ModelStringInput | null,
  sessionId?: ModelSubscriptionStringInput | null,
  startTime?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  userAgent?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionUserProfileFilterInput = {
  and?: Array< ModelSubscriptionUserProfileFilterInput | null > | null,
  countryPreferences?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  industryPreferences?: ModelSubscriptionStringInput | null,
  or?: Array< ModelSubscriptionUserProfileFilterInput | null > | null,
  owner?: ModelStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionUserSubscriptionFilterInput = {
  and?: Array< ModelSubscriptionUserSubscriptionFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  earnedFreeMonths?: ModelSubscriptionIntInput | null,
  email?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionUserSubscriptionFilterInput | null > | null,
  owner?: ModelStringInput | null,
  referralCodeUsed?: ModelSubscriptionStringInput | null,
  referrerId?: ModelSubscriptionStringInput | null,
  subscriptionStatus?: ModelSubscriptionStringInput | null,
  totalFreeMonths?: ModelSubscriptionIntInput | null,
  trialEndDate?: ModelSubscriptionStringInput | null,
  trialStartDate?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type GetArticleQueryVariables = {
  id: string,
};

export type GetArticleQuery = {
  getArticle?:  {
    __typename: "Article",
    articleType?: string | null,
    callToAction?: string | null,
    category?: ArticleCategory | null,
    companies?: string | null,
    countries?: string | null,
    createdAt?: string | null,
    id: string,
    industry?: string | null,
    language?: string | null,
    link?: string | null,
    priorityDuration?: number | null,
    priorityUntil?: string | null,
    source: string,
    sponsorLink?: string | null,
    summary?: string | null,
    timestamp?: string | null,
    title: string,
    ttl?: number | null,
    updatedAt: string,
  } | null,
};

export type GetDeletedUserEmailQueryVariables = {
  id: string,
};

export type GetDeletedUserEmailQuery = {
  getDeletedUserEmail?:  {
    __typename: "DeletedUserEmail",
    createdAt: string,
    deletedAt: string,
    deletionReason?: string | null,
    email: string,
    id: string,
    originalUserId?: string | null,
    owner?: string | null,
    subscriptionStatus?: string | null,
    updatedAt: string,
  } | null,
};

export type GetReferralQueryVariables = {
  id: string,
};

export type GetReferralQuery = {
  getReferral?:  {
    __typename: "Referral",
    completedAt?: string | null,
    createdAt: string,
    freeMonthsEarned?: number | null,
    id: string,
    owner?: string | null,
    referralCode: string,
    referredId: string,
    referrerId: string,
    status?: ReferralStatus | null,
    updatedAt: string,
  } | null,
};

export type GetReferralCodeQueryVariables = {
  id: string,
};

export type GetReferralCodeQuery = {
  getReferralCode?:  {
    __typename: "ReferralCode",
    code: string,
    createdAt: string,
    id: string,
    isActive?: boolean | null,
    owner?: string | null,
    successfulReferrals?: number | null,
    totalReferrals?: number | null,
    updatedAt: string,
  } | null,
};

export type GetSESCampaignContactQueryVariables = {
  id: string,
};

export type GetSESCampaignContactQuery = {
  getSESCampaignContact?:  {
    __typename: "SESCampaignContact",
    Company: string,
    Company_Sequence?: number | null,
    Error_Status?: string | null,
    FirstName: string,
    Language?: string | null,
    LastName: string,
    Send_Group_ID: number,
    Sent_Date?: string | null,
    Sent_Status?: string | null,
    Target_Send_Date: string,
    createdAt: string,
    email: string,
    id: string,
    updatedAt: string,
  } | null,
};

export type GetSESCampaignControlQueryVariables = {
  id: string,
};

export type GetSESCampaignControlQuery = {
  getSESCampaignControl?:  {
    __typename: "SESCampaignControl",
    control: string,
    createdAt: string,
    id: string,
    isEnabled?: boolean | null,
    lastUpdated: string,
    updatedAt: string,
    updatedBy?: string | null,
  } | null,
};

export type GetUserActivityQueryVariables = {
  id: string,
};

export type GetUserActivityQuery = {
  getUserActivity?:  {
    __typename: "UserActivity",
    createdAt: string,
    deviceInfo?: string | null,
    duration?: number | null,
    endTime?: string | null,
    id: string,
    isActive?: boolean | null,
    owner?: string | null,
    sessionId: string,
    startTime: string,
    updatedAt: string,
    userAgent?: string | null,
  } | null,
};

export type GetUserProfileQueryVariables = {
  id: string,
};

export type GetUserProfileQuery = {
  getUserProfile?:  {
    __typename: "UserProfile",
    countryPreferences?: Array< string | null > | null,
    createdAt: string,
    id: string,
    industryPreferences?: Array< string | null > | null,
    owner?: string | null,
    updatedAt: string,
  } | null,
};

export type GetUserSubscriptionQueryVariables = {
  id: string,
};

export type GetUserSubscriptionQuery = {
  getUserSubscription?:  {
    __typename: "UserSubscription",
    createdAt: string,
    earnedFreeMonths?: number | null,
    email?: string | null,
    id: string,
    owner?: string | null,
    referralCodeUsed?: string | null,
    referrerId?: string | null,
    subscriptionStatus?: UserSubscriptionSubscriptionStatus | null,
    totalFreeMonths?: number | null,
    trialEndDate?: string | null,
    trialStartDate?: string | null,
    updatedAt: string,
  } | null,
};

export type ListArticleByArticleTypeAndCreatedAtQueryVariables = {
  articleType: string,
  createdAt?: ModelStringKeyConditionInput | null,
  filter?: ModelArticleFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListArticleByArticleTypeAndCreatedAtQuery = {
  listArticleByArticleTypeAndCreatedAt?:  {
    __typename: "ModelArticleConnection",
    items:  Array< {
      __typename: "Article",
      articleType?: string | null,
      callToAction?: string | null,
      category?: ArticleCategory | null,
      companies?: string | null,
      countries?: string | null,
      createdAt?: string | null,
      id: string,
      industry?: string | null,
      language?: string | null,
      link?: string | null,
      priorityDuration?: number | null,
      priorityUntil?: string | null,
      source: string,
      sponsorLink?: string | null,
      summary?: string | null,
      timestamp?: string | null,
      title: string,
      ttl?: number | null,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListArticlesQueryVariables = {
  filter?: ModelArticleFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListArticlesQuery = {
  listArticles?:  {
    __typename: "ModelArticleConnection",
    items:  Array< {
      __typename: "Article",
      articleType?: string | null,
      callToAction?: string | null,
      category?: ArticleCategory | null,
      companies?: string | null,
      countries?: string | null,
      createdAt?: string | null,
      id: string,
      industry?: string | null,
      language?: string | null,
      link?: string | null,
      priorityDuration?: number | null,
      priorityUntil?: string | null,
      source: string,
      sponsorLink?: string | null,
      summary?: string | null,
      timestamp?: string | null,
      title: string,
      ttl?: number | null,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListDeletedUserEmailsQueryVariables = {
  filter?: ModelDeletedUserEmailFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListDeletedUserEmailsQuery = {
  listDeletedUserEmails?:  {
    __typename: "ModelDeletedUserEmailConnection",
    items:  Array< {
      __typename: "DeletedUserEmail",
      createdAt: string,
      deletedAt: string,
      deletionReason?: string | null,
      email: string,
      id: string,
      originalUserId?: string | null,
      owner?: string | null,
      subscriptionStatus?: string | null,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListReferralCodesQueryVariables = {
  filter?: ModelReferralCodeFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListReferralCodesQuery = {
  listReferralCodes?:  {
    __typename: "ModelReferralCodeConnection",
    items:  Array< {
      __typename: "ReferralCode",
      code: string,
      createdAt: string,
      id: string,
      isActive?: boolean | null,
      owner?: string | null,
      successfulReferrals?: number | null,
      totalReferrals?: number | null,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListReferralsQueryVariables = {
  filter?: ModelReferralFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListReferralsQuery = {
  listReferrals?:  {
    __typename: "ModelReferralConnection",
    items:  Array< {
      __typename: "Referral",
      completedAt?: string | null,
      createdAt: string,
      freeMonthsEarned?: number | null,
      id: string,
      owner?: string | null,
      referralCode: string,
      referredId: string,
      referrerId: string,
      status?: ReferralStatus | null,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListSESCampaignContactByEmailQueryVariables = {
  email: string,
  filter?: ModelSESCampaignContactFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListSESCampaignContactByEmailQuery = {
  listSESCampaignContactByEmail?:  {
    __typename: "ModelSESCampaignContactConnection",
    items:  Array< {
      __typename: "SESCampaignContact",
      Company: string,
      Company_Sequence?: number | null,
      Error_Status?: string | null,
      FirstName: string,
      Language?: string | null,
      LastName: string,
      Send_Group_ID: number,
      Sent_Date?: string | null,
      Sent_Status?: string | null,
      Target_Send_Date: string,
      createdAt: string,
      email: string,
      id: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListSESCampaignContactBySent_StatusQueryVariables = {
  Sent_Status: string,
  filter?: ModelSESCampaignContactFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListSESCampaignContactBySent_StatusQuery = {
  listSESCampaignContactBySent_Status?:  {
    __typename: "ModelSESCampaignContactConnection",
    items:  Array< {
      __typename: "SESCampaignContact",
      Company: string,
      Company_Sequence?: number | null,
      Error_Status?: string | null,
      FirstName: string,
      Language?: string | null,
      LastName: string,
      Send_Group_ID: number,
      Sent_Date?: string | null,
      Sent_Status?: string | null,
      Target_Send_Date: string,
      createdAt: string,
      email: string,
      id: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListSESCampaignContactsQueryVariables = {
  filter?: ModelSESCampaignContactFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListSESCampaignContactsQuery = {
  listSESCampaignContacts?:  {
    __typename: "ModelSESCampaignContactConnection",
    items:  Array< {
      __typename: "SESCampaignContact",
      Company: string,
      Company_Sequence?: number | null,
      Error_Status?: string | null,
      FirstName: string,
      Language?: string | null,
      LastName: string,
      Send_Group_ID: number,
      Sent_Date?: string | null,
      Sent_Status?: string | null,
      Target_Send_Date: string,
      createdAt: string,
      email: string,
      id: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListSESCampaignControlByControlQueryVariables = {
  control: string,
  filter?: ModelSESCampaignControlFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListSESCampaignControlByControlQuery = {
  listSESCampaignControlByControl?:  {
    __typename: "ModelSESCampaignControlConnection",
    items:  Array< {
      __typename: "SESCampaignControl",
      control: string,
      createdAt: string,
      id: string,
      isEnabled?: boolean | null,
      lastUpdated: string,
      updatedAt: string,
      updatedBy?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListSESCampaignControlsQueryVariables = {
  filter?: ModelSESCampaignControlFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListSESCampaignControlsQuery = {
  listSESCampaignControls?:  {
    __typename: "ModelSESCampaignControlConnection",
    items:  Array< {
      __typename: "SESCampaignControl",
      control: string,
      createdAt: string,
      id: string,
      isEnabled?: boolean | null,
      lastUpdated: string,
      updatedAt: string,
      updatedBy?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListUserActivitiesQueryVariables = {
  filter?: ModelUserActivityFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListUserActivitiesQuery = {
  listUserActivities?:  {
    __typename: "ModelUserActivityConnection",
    items:  Array< {
      __typename: "UserActivity",
      createdAt: string,
      deviceInfo?: string | null,
      duration?: number | null,
      endTime?: string | null,
      id: string,
      isActive?: boolean | null,
      owner?: string | null,
      sessionId: string,
      startTime: string,
      updatedAt: string,
      userAgent?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListUserProfilesQueryVariables = {
  filter?: ModelUserProfileFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListUserProfilesQuery = {
  listUserProfiles?:  {
    __typename: "ModelUserProfileConnection",
    items:  Array< {
      __typename: "UserProfile",
      countryPreferences?: Array< string | null > | null,
      createdAt: string,
      id: string,
      industryPreferences?: Array< string | null > | null,
      owner?: string | null,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListUserSubscriptionsQueryVariables = {
  filter?: ModelUserSubscriptionFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListUserSubscriptionsQuery = {
  listUserSubscriptions?:  {
    __typename: "ModelUserSubscriptionConnection",
    items:  Array< {
      __typename: "UserSubscription",
      createdAt: string,
      earnedFreeMonths?: number | null,
      email?: string | null,
      id: string,
      owner?: string | null,
      referralCodeUsed?: string | null,
      referrerId?: string | null,
      subscriptionStatus?: UserSubscriptionSubscriptionStatus | null,
      totalFreeMonths?: number | null,
      trialEndDate?: string | null,
      trialStartDate?: string | null,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type CreateArticleMutationVariables = {
  condition?: ModelArticleConditionInput | null,
  input: CreateArticleInput,
};

export type CreateArticleMutation = {
  createArticle?:  {
    __typename: "Article",
    articleType?: string | null,
    callToAction?: string | null,
    category?: ArticleCategory | null,
    companies?: string | null,
    countries?: string | null,
    createdAt?: string | null,
    id: string,
    industry?: string | null,
    language?: string | null,
    link?: string | null,
    priorityDuration?: number | null,
    priorityUntil?: string | null,
    source: string,
    sponsorLink?: string | null,
    summary?: string | null,
    timestamp?: string | null,
    title: string,
    ttl?: number | null,
    updatedAt: string,
  } | null,
};

export type CreateDeletedUserEmailMutationVariables = {
  condition?: ModelDeletedUserEmailConditionInput | null,
  input: CreateDeletedUserEmailInput,
};

export type CreateDeletedUserEmailMutation = {
  createDeletedUserEmail?:  {
    __typename: "DeletedUserEmail",
    createdAt: string,
    deletedAt: string,
    deletionReason?: string | null,
    email: string,
    id: string,
    originalUserId?: string | null,
    owner?: string | null,
    subscriptionStatus?: string | null,
    updatedAt: string,
  } | null,
};

export type CreateReferralMutationVariables = {
  condition?: ModelReferralConditionInput | null,
  input: CreateReferralInput,
};

export type CreateReferralMutation = {
  createReferral?:  {
    __typename: "Referral",
    completedAt?: string | null,
    createdAt: string,
    freeMonthsEarned?: number | null,
    id: string,
    owner?: string | null,
    referralCode: string,
    referredId: string,
    referrerId: string,
    status?: ReferralStatus | null,
    updatedAt: string,
  } | null,
};

export type CreateReferralCodeMutationVariables = {
  condition?: ModelReferralCodeConditionInput | null,
  input: CreateReferralCodeInput,
};

export type CreateReferralCodeMutation = {
  createReferralCode?:  {
    __typename: "ReferralCode",
    code: string,
    createdAt: string,
    id: string,
    isActive?: boolean | null,
    owner?: string | null,
    successfulReferrals?: number | null,
    totalReferrals?: number | null,
    updatedAt: string,
  } | null,
};

export type CreateSESCampaignContactMutationVariables = {
  condition?: ModelSESCampaignContactConditionInput | null,
  input: CreateSESCampaignContactInput,
};

export type CreateSESCampaignContactMutation = {
  createSESCampaignContact?:  {
    __typename: "SESCampaignContact",
    Company: string,
    Company_Sequence?: number | null,
    Error_Status?: string | null,
    FirstName: string,
    Language?: string | null,
    LastName: string,
    Send_Group_ID: number,
    Sent_Date?: string | null,
    Sent_Status?: string | null,
    Target_Send_Date: string,
    createdAt: string,
    email: string,
    id: string,
    updatedAt: string,
  } | null,
};

export type CreateSESCampaignControlMutationVariables = {
  condition?: ModelSESCampaignControlConditionInput | null,
  input: CreateSESCampaignControlInput,
};

export type CreateSESCampaignControlMutation = {
  createSESCampaignControl?:  {
    __typename: "SESCampaignControl",
    control: string,
    createdAt: string,
    id: string,
    isEnabled?: boolean | null,
    lastUpdated: string,
    updatedAt: string,
    updatedBy?: string | null,
  } | null,
};

export type CreateUserActivityMutationVariables = {
  condition?: ModelUserActivityConditionInput | null,
  input: CreateUserActivityInput,
};

export type CreateUserActivityMutation = {
  createUserActivity?:  {
    __typename: "UserActivity",
    createdAt: string,
    deviceInfo?: string | null,
    duration?: number | null,
    endTime?: string | null,
    id: string,
    isActive?: boolean | null,
    owner?: string | null,
    sessionId: string,
    startTime: string,
    updatedAt: string,
    userAgent?: string | null,
  } | null,
};

export type CreateUserProfileMutationVariables = {
  condition?: ModelUserProfileConditionInput | null,
  input: CreateUserProfileInput,
};

export type CreateUserProfileMutation = {
  createUserProfile?:  {
    __typename: "UserProfile",
    countryPreferences?: Array< string | null > | null,
    createdAt: string,
    id: string,
    industryPreferences?: Array< string | null > | null,
    owner?: string | null,
    updatedAt: string,
  } | null,
};

export type CreateUserSubscriptionMutationVariables = {
  condition?: ModelUserSubscriptionConditionInput | null,
  input: CreateUserSubscriptionInput,
};

export type CreateUserSubscriptionMutation = {
  createUserSubscription?:  {
    __typename: "UserSubscription",
    createdAt: string,
    earnedFreeMonths?: number | null,
    email?: string | null,
    id: string,
    owner?: string | null,
    referralCodeUsed?: string | null,
    referrerId?: string | null,
    subscriptionStatus?: UserSubscriptionSubscriptionStatus | null,
    totalFreeMonths?: number | null,
    trialEndDate?: string | null,
    trialStartDate?: string | null,
    updatedAt: string,
  } | null,
};

export type DeleteArticleMutationVariables = {
  condition?: ModelArticleConditionInput | null,
  input: DeleteArticleInput,
};

export type DeleteArticleMutation = {
  deleteArticle?:  {
    __typename: "Article",
    articleType?: string | null,
    callToAction?: string | null,
    category?: ArticleCategory | null,
    companies?: string | null,
    countries?: string | null,
    createdAt?: string | null,
    id: string,
    industry?: string | null,
    language?: string | null,
    link?: string | null,
    priorityDuration?: number | null,
    priorityUntil?: string | null,
    source: string,
    sponsorLink?: string | null,
    summary?: string | null,
    timestamp?: string | null,
    title: string,
    ttl?: number | null,
    updatedAt: string,
  } | null,
};

export type DeleteDeletedUserEmailMutationVariables = {
  condition?: ModelDeletedUserEmailConditionInput | null,
  input: DeleteDeletedUserEmailInput,
};

export type DeleteDeletedUserEmailMutation = {
  deleteDeletedUserEmail?:  {
    __typename: "DeletedUserEmail",
    createdAt: string,
    deletedAt: string,
    deletionReason?: string | null,
    email: string,
    id: string,
    originalUserId?: string | null,
    owner?: string | null,
    subscriptionStatus?: string | null,
    updatedAt: string,
  } | null,
};

export type DeleteReferralMutationVariables = {
  condition?: ModelReferralConditionInput | null,
  input: DeleteReferralInput,
};

export type DeleteReferralMutation = {
  deleteReferral?:  {
    __typename: "Referral",
    completedAt?: string | null,
    createdAt: string,
    freeMonthsEarned?: number | null,
    id: string,
    owner?: string | null,
    referralCode: string,
    referredId: string,
    referrerId: string,
    status?: ReferralStatus | null,
    updatedAt: string,
  } | null,
};

export type DeleteReferralCodeMutationVariables = {
  condition?: ModelReferralCodeConditionInput | null,
  input: DeleteReferralCodeInput,
};

export type DeleteReferralCodeMutation = {
  deleteReferralCode?:  {
    __typename: "ReferralCode",
    code: string,
    createdAt: string,
    id: string,
    isActive?: boolean | null,
    owner?: string | null,
    successfulReferrals?: number | null,
    totalReferrals?: number | null,
    updatedAt: string,
  } | null,
};

export type DeleteSESCampaignContactMutationVariables = {
  condition?: ModelSESCampaignContactConditionInput | null,
  input: DeleteSESCampaignContactInput,
};

export type DeleteSESCampaignContactMutation = {
  deleteSESCampaignContact?:  {
    __typename: "SESCampaignContact",
    Company: string,
    Company_Sequence?: number | null,
    Error_Status?: string | null,
    FirstName: string,
    Language?: string | null,
    LastName: string,
    Send_Group_ID: number,
    Sent_Date?: string | null,
    Sent_Status?: string | null,
    Target_Send_Date: string,
    createdAt: string,
    email: string,
    id: string,
    updatedAt: string,
  } | null,
};

export type DeleteSESCampaignControlMutationVariables = {
  condition?: ModelSESCampaignControlConditionInput | null,
  input: DeleteSESCampaignControlInput,
};

export type DeleteSESCampaignControlMutation = {
  deleteSESCampaignControl?:  {
    __typename: "SESCampaignControl",
    control: string,
    createdAt: string,
    id: string,
    isEnabled?: boolean | null,
    lastUpdated: string,
    updatedAt: string,
    updatedBy?: string | null,
  } | null,
};

export type DeleteUserActivityMutationVariables = {
  condition?: ModelUserActivityConditionInput | null,
  input: DeleteUserActivityInput,
};

export type DeleteUserActivityMutation = {
  deleteUserActivity?:  {
    __typename: "UserActivity",
    createdAt: string,
    deviceInfo?: string | null,
    duration?: number | null,
    endTime?: string | null,
    id: string,
    isActive?: boolean | null,
    owner?: string | null,
    sessionId: string,
    startTime: string,
    updatedAt: string,
    userAgent?: string | null,
  } | null,
};

export type DeleteUserProfileMutationVariables = {
  condition?: ModelUserProfileConditionInput | null,
  input: DeleteUserProfileInput,
};

export type DeleteUserProfileMutation = {
  deleteUserProfile?:  {
    __typename: "UserProfile",
    countryPreferences?: Array< string | null > | null,
    createdAt: string,
    id: string,
    industryPreferences?: Array< string | null > | null,
    owner?: string | null,
    updatedAt: string,
  } | null,
};

export type DeleteUserSubscriptionMutationVariables = {
  condition?: ModelUserSubscriptionConditionInput | null,
  input: DeleteUserSubscriptionInput,
};

export type DeleteUserSubscriptionMutation = {
  deleteUserSubscription?:  {
    __typename: "UserSubscription",
    createdAt: string,
    earnedFreeMonths?: number | null,
    email?: string | null,
    id: string,
    owner?: string | null,
    referralCodeUsed?: string | null,
    referrerId?: string | null,
    subscriptionStatus?: UserSubscriptionSubscriptionStatus | null,
    totalFreeMonths?: number | null,
    trialEndDate?: string | null,
    trialStartDate?: string | null,
    updatedAt: string,
  } | null,
};

export type UpdateArticleMutationVariables = {
  condition?: ModelArticleConditionInput | null,
  input: UpdateArticleInput,
};

export type UpdateArticleMutation = {
  updateArticle?:  {
    __typename: "Article",
    articleType?: string | null,
    callToAction?: string | null,
    category?: ArticleCategory | null,
    companies?: string | null,
    countries?: string | null,
    createdAt?: string | null,
    id: string,
    industry?: string | null,
    language?: string | null,
    link?: string | null,
    priorityDuration?: number | null,
    priorityUntil?: string | null,
    source: string,
    sponsorLink?: string | null,
    summary?: string | null,
    timestamp?: string | null,
    title: string,
    ttl?: number | null,
    updatedAt: string,
  } | null,
};

export type UpdateDeletedUserEmailMutationVariables = {
  condition?: ModelDeletedUserEmailConditionInput | null,
  input: UpdateDeletedUserEmailInput,
};

export type UpdateDeletedUserEmailMutation = {
  updateDeletedUserEmail?:  {
    __typename: "DeletedUserEmail",
    createdAt: string,
    deletedAt: string,
    deletionReason?: string | null,
    email: string,
    id: string,
    originalUserId?: string | null,
    owner?: string | null,
    subscriptionStatus?: string | null,
    updatedAt: string,
  } | null,
};

export type UpdateReferralMutationVariables = {
  condition?: ModelReferralConditionInput | null,
  input: UpdateReferralInput,
};

export type UpdateReferralMutation = {
  updateReferral?:  {
    __typename: "Referral",
    completedAt?: string | null,
    createdAt: string,
    freeMonthsEarned?: number | null,
    id: string,
    owner?: string | null,
    referralCode: string,
    referredId: string,
    referrerId: string,
    status?: ReferralStatus | null,
    updatedAt: string,
  } | null,
};

export type UpdateReferralCodeMutationVariables = {
  condition?: ModelReferralCodeConditionInput | null,
  input: UpdateReferralCodeInput,
};

export type UpdateReferralCodeMutation = {
  updateReferralCode?:  {
    __typename: "ReferralCode",
    code: string,
    createdAt: string,
    id: string,
    isActive?: boolean | null,
    owner?: string | null,
    successfulReferrals?: number | null,
    totalReferrals?: number | null,
    updatedAt: string,
  } | null,
};

export type UpdateSESCampaignContactMutationVariables = {
  condition?: ModelSESCampaignContactConditionInput | null,
  input: UpdateSESCampaignContactInput,
};

export type UpdateSESCampaignContactMutation = {
  updateSESCampaignContact?:  {
    __typename: "SESCampaignContact",
    Company: string,
    Company_Sequence?: number | null,
    Error_Status?: string | null,
    FirstName: string,
    Language?: string | null,
    LastName: string,
    Send_Group_ID: number,
    Sent_Date?: string | null,
    Sent_Status?: string | null,
    Target_Send_Date: string,
    createdAt: string,
    email: string,
    id: string,
    updatedAt: string,
  } | null,
};

export type UpdateSESCampaignControlMutationVariables = {
  condition?: ModelSESCampaignControlConditionInput | null,
  input: UpdateSESCampaignControlInput,
};

export type UpdateSESCampaignControlMutation = {
  updateSESCampaignControl?:  {
    __typename: "SESCampaignControl",
    control: string,
    createdAt: string,
    id: string,
    isEnabled?: boolean | null,
    lastUpdated: string,
    updatedAt: string,
    updatedBy?: string | null,
  } | null,
};

export type UpdateUserActivityMutationVariables = {
  condition?: ModelUserActivityConditionInput | null,
  input: UpdateUserActivityInput,
};

export type UpdateUserActivityMutation = {
  updateUserActivity?:  {
    __typename: "UserActivity",
    createdAt: string,
    deviceInfo?: string | null,
    duration?: number | null,
    endTime?: string | null,
    id: string,
    isActive?: boolean | null,
    owner?: string | null,
    sessionId: string,
    startTime: string,
    updatedAt: string,
    userAgent?: string | null,
  } | null,
};

export type UpdateUserProfileMutationVariables = {
  condition?: ModelUserProfileConditionInput | null,
  input: UpdateUserProfileInput,
};

export type UpdateUserProfileMutation = {
  updateUserProfile?:  {
    __typename: "UserProfile",
    countryPreferences?: Array< string | null > | null,
    createdAt: string,
    id: string,
    industryPreferences?: Array< string | null > | null,
    owner?: string | null,
    updatedAt: string,
  } | null,
};

export type UpdateUserSubscriptionMutationVariables = {
  condition?: ModelUserSubscriptionConditionInput | null,
  input: UpdateUserSubscriptionInput,
};

export type UpdateUserSubscriptionMutation = {
  updateUserSubscription?:  {
    __typename: "UserSubscription",
    createdAt: string,
    earnedFreeMonths?: number | null,
    email?: string | null,
    id: string,
    owner?: string | null,
    referralCodeUsed?: string | null,
    referrerId?: string | null,
    subscriptionStatus?: UserSubscriptionSubscriptionStatus | null,
    totalFreeMonths?: number | null,
    trialEndDate?: string | null,
    trialStartDate?: string | null,
    updatedAt: string,
  } | null,
};

export type UpgradeSubscriptionMutationVariables = {
  paymentMethodId?: string | null,
  planId: string,
  userId: string,
};

export type UpgradeSubscriptionMutation = {
  upgradeSubscription?: string | null,
};

export type OnCreateArticleSubscriptionVariables = {
  filter?: ModelSubscriptionArticleFilterInput | null,
};

export type OnCreateArticleSubscription = {
  onCreateArticle?:  {
    __typename: "Article",
    articleType?: string | null,
    callToAction?: string | null,
    category?: ArticleCategory | null,
    companies?: string | null,
    countries?: string | null,
    createdAt?: string | null,
    id: string,
    industry?: string | null,
    language?: string | null,
    link?: string | null,
    priorityDuration?: number | null,
    priorityUntil?: string | null,
    source: string,
    sponsorLink?: string | null,
    summary?: string | null,
    timestamp?: string | null,
    title: string,
    ttl?: number | null,
    updatedAt: string,
  } | null,
};

export type OnCreateDeletedUserEmailSubscriptionVariables = {
  filter?: ModelSubscriptionDeletedUserEmailFilterInput | null,
  owner?: string | null,
};

export type OnCreateDeletedUserEmailSubscription = {
  onCreateDeletedUserEmail?:  {
    __typename: "DeletedUserEmail",
    createdAt: string,
    deletedAt: string,
    deletionReason?: string | null,
    email: string,
    id: string,
    originalUserId?: string | null,
    owner?: string | null,
    subscriptionStatus?: string | null,
    updatedAt: string,
  } | null,
};

export type OnCreateReferralSubscriptionVariables = {
  filter?: ModelSubscriptionReferralFilterInput | null,
  owner?: string | null,
};

export type OnCreateReferralSubscription = {
  onCreateReferral?:  {
    __typename: "Referral",
    completedAt?: string | null,
    createdAt: string,
    freeMonthsEarned?: number | null,
    id: string,
    owner?: string | null,
    referralCode: string,
    referredId: string,
    referrerId: string,
    status?: ReferralStatus | null,
    updatedAt: string,
  } | null,
};

export type OnCreateReferralCodeSubscriptionVariables = {
  filter?: ModelSubscriptionReferralCodeFilterInput | null,
  owner?: string | null,
};

export type OnCreateReferralCodeSubscription = {
  onCreateReferralCode?:  {
    __typename: "ReferralCode",
    code: string,
    createdAt: string,
    id: string,
    isActive?: boolean | null,
    owner?: string | null,
    successfulReferrals?: number | null,
    totalReferrals?: number | null,
    updatedAt: string,
  } | null,
};

export type OnCreateSESCampaignContactSubscriptionVariables = {
  filter?: ModelSubscriptionSESCampaignContactFilterInput | null,
};

export type OnCreateSESCampaignContactSubscription = {
  onCreateSESCampaignContact?:  {
    __typename: "SESCampaignContact",
    Company: string,
    Company_Sequence?: number | null,
    Error_Status?: string | null,
    FirstName: string,
    Language?: string | null,
    LastName: string,
    Send_Group_ID: number,
    Sent_Date?: string | null,
    Sent_Status?: string | null,
    Target_Send_Date: string,
    createdAt: string,
    email: string,
    id: string,
    updatedAt: string,
  } | null,
};

export type OnCreateSESCampaignControlSubscriptionVariables = {
  filter?: ModelSubscriptionSESCampaignControlFilterInput | null,
};

export type OnCreateSESCampaignControlSubscription = {
  onCreateSESCampaignControl?:  {
    __typename: "SESCampaignControl",
    control: string,
    createdAt: string,
    id: string,
    isEnabled?: boolean | null,
    lastUpdated: string,
    updatedAt: string,
    updatedBy?: string | null,
  } | null,
};

export type OnCreateUserActivitySubscriptionVariables = {
  filter?: ModelSubscriptionUserActivityFilterInput | null,
  owner?: string | null,
};

export type OnCreateUserActivitySubscription = {
  onCreateUserActivity?:  {
    __typename: "UserActivity",
    createdAt: string,
    deviceInfo?: string | null,
    duration?: number | null,
    endTime?: string | null,
    id: string,
    isActive?: boolean | null,
    owner?: string | null,
    sessionId: string,
    startTime: string,
    updatedAt: string,
    userAgent?: string | null,
  } | null,
};

export type OnCreateUserProfileSubscriptionVariables = {
  filter?: ModelSubscriptionUserProfileFilterInput | null,
  owner?: string | null,
};

export type OnCreateUserProfileSubscription = {
  onCreateUserProfile?:  {
    __typename: "UserProfile",
    countryPreferences?: Array< string | null > | null,
    createdAt: string,
    id: string,
    industryPreferences?: Array< string | null > | null,
    owner?: string | null,
    updatedAt: string,
  } | null,
};

export type OnCreateUserSubscriptionSubscriptionVariables = {
  filter?: ModelSubscriptionUserSubscriptionFilterInput | null,
  owner?: string | null,
};

export type OnCreateUserSubscriptionSubscription = {
  onCreateUserSubscription?:  {
    __typename: "UserSubscription",
    createdAt: string,
    earnedFreeMonths?: number | null,
    email?: string | null,
    id: string,
    owner?: string | null,
    referralCodeUsed?: string | null,
    referrerId?: string | null,
    subscriptionStatus?: UserSubscriptionSubscriptionStatus | null,
    totalFreeMonths?: number | null,
    trialEndDate?: string | null,
    trialStartDate?: string | null,
    updatedAt: string,
  } | null,
};

export type OnDeleteArticleSubscriptionVariables = {
  filter?: ModelSubscriptionArticleFilterInput | null,
};

export type OnDeleteArticleSubscription = {
  onDeleteArticle?:  {
    __typename: "Article",
    articleType?: string | null,
    callToAction?: string | null,
    category?: ArticleCategory | null,
    companies?: string | null,
    countries?: string | null,
    createdAt?: string | null,
    id: string,
    industry?: string | null,
    language?: string | null,
    link?: string | null,
    priorityDuration?: number | null,
    priorityUntil?: string | null,
    source: string,
    sponsorLink?: string | null,
    summary?: string | null,
    timestamp?: string | null,
    title: string,
    ttl?: number | null,
    updatedAt: string,
  } | null,
};

export type OnDeleteDeletedUserEmailSubscriptionVariables = {
  filter?: ModelSubscriptionDeletedUserEmailFilterInput | null,
  owner?: string | null,
};

export type OnDeleteDeletedUserEmailSubscription = {
  onDeleteDeletedUserEmail?:  {
    __typename: "DeletedUserEmail",
    createdAt: string,
    deletedAt: string,
    deletionReason?: string | null,
    email: string,
    id: string,
    originalUserId?: string | null,
    owner?: string | null,
    subscriptionStatus?: string | null,
    updatedAt: string,
  } | null,
};

export type OnDeleteReferralSubscriptionVariables = {
  filter?: ModelSubscriptionReferralFilterInput | null,
  owner?: string | null,
};

export type OnDeleteReferralSubscription = {
  onDeleteReferral?:  {
    __typename: "Referral",
    completedAt?: string | null,
    createdAt: string,
    freeMonthsEarned?: number | null,
    id: string,
    owner?: string | null,
    referralCode: string,
    referredId: string,
    referrerId: string,
    status?: ReferralStatus | null,
    updatedAt: string,
  } | null,
};

export type OnDeleteReferralCodeSubscriptionVariables = {
  filter?: ModelSubscriptionReferralCodeFilterInput | null,
  owner?: string | null,
};

export type OnDeleteReferralCodeSubscription = {
  onDeleteReferralCode?:  {
    __typename: "ReferralCode",
    code: string,
    createdAt: string,
    id: string,
    isActive?: boolean | null,
    owner?: string | null,
    successfulReferrals?: number | null,
    totalReferrals?: number | null,
    updatedAt: string,
  } | null,
};

export type OnDeleteSESCampaignContactSubscriptionVariables = {
  filter?: ModelSubscriptionSESCampaignContactFilterInput | null,
};

export type OnDeleteSESCampaignContactSubscription = {
  onDeleteSESCampaignContact?:  {
    __typename: "SESCampaignContact",
    Company: string,
    Company_Sequence?: number | null,
    Error_Status?: string | null,
    FirstName: string,
    Language?: string | null,
    LastName: string,
    Send_Group_ID: number,
    Sent_Date?: string | null,
    Sent_Status?: string | null,
    Target_Send_Date: string,
    createdAt: string,
    email: string,
    id: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteSESCampaignControlSubscriptionVariables = {
  filter?: ModelSubscriptionSESCampaignControlFilterInput | null,
};

export type OnDeleteSESCampaignControlSubscription = {
  onDeleteSESCampaignControl?:  {
    __typename: "SESCampaignControl",
    control: string,
    createdAt: string,
    id: string,
    isEnabled?: boolean | null,
    lastUpdated: string,
    updatedAt: string,
    updatedBy?: string | null,
  } | null,
};

export type OnDeleteUserActivitySubscriptionVariables = {
  filter?: ModelSubscriptionUserActivityFilterInput | null,
  owner?: string | null,
};

export type OnDeleteUserActivitySubscription = {
  onDeleteUserActivity?:  {
    __typename: "UserActivity",
    createdAt: string,
    deviceInfo?: string | null,
    duration?: number | null,
    endTime?: string | null,
    id: string,
    isActive?: boolean | null,
    owner?: string | null,
    sessionId: string,
    startTime: string,
    updatedAt: string,
    userAgent?: string | null,
  } | null,
};

export type OnDeleteUserProfileSubscriptionVariables = {
  filter?: ModelSubscriptionUserProfileFilterInput | null,
  owner?: string | null,
};

export type OnDeleteUserProfileSubscription = {
  onDeleteUserProfile?:  {
    __typename: "UserProfile",
    countryPreferences?: Array< string | null > | null,
    createdAt: string,
    id: string,
    industryPreferences?: Array< string | null > | null,
    owner?: string | null,
    updatedAt: string,
  } | null,
};

export type OnDeleteUserSubscriptionSubscriptionVariables = {
  filter?: ModelSubscriptionUserSubscriptionFilterInput | null,
  owner?: string | null,
};

export type OnDeleteUserSubscriptionSubscription = {
  onDeleteUserSubscription?:  {
    __typename: "UserSubscription",
    createdAt: string,
    earnedFreeMonths?: number | null,
    email?: string | null,
    id: string,
    owner?: string | null,
    referralCodeUsed?: string | null,
    referrerId?: string | null,
    subscriptionStatus?: UserSubscriptionSubscriptionStatus | null,
    totalFreeMonths?: number | null,
    trialEndDate?: string | null,
    trialStartDate?: string | null,
    updatedAt: string,
  } | null,
};

export type OnUpdateArticleSubscriptionVariables = {
  filter?: ModelSubscriptionArticleFilterInput | null,
};

export type OnUpdateArticleSubscription = {
  onUpdateArticle?:  {
    __typename: "Article",
    articleType?: string | null,
    callToAction?: string | null,
    category?: ArticleCategory | null,
    companies?: string | null,
    countries?: string | null,
    createdAt?: string | null,
    id: string,
    industry?: string | null,
    language?: string | null,
    link?: string | null,
    priorityDuration?: number | null,
    priorityUntil?: string | null,
    source: string,
    sponsorLink?: string | null,
    summary?: string | null,
    timestamp?: string | null,
    title: string,
    ttl?: number | null,
    updatedAt: string,
  } | null,
};

export type OnUpdateDeletedUserEmailSubscriptionVariables = {
  filter?: ModelSubscriptionDeletedUserEmailFilterInput | null,
  owner?: string | null,
};

export type OnUpdateDeletedUserEmailSubscription = {
  onUpdateDeletedUserEmail?:  {
    __typename: "DeletedUserEmail",
    createdAt: string,
    deletedAt: string,
    deletionReason?: string | null,
    email: string,
    id: string,
    originalUserId?: string | null,
    owner?: string | null,
    subscriptionStatus?: string | null,
    updatedAt: string,
  } | null,
};

export type OnUpdateReferralSubscriptionVariables = {
  filter?: ModelSubscriptionReferralFilterInput | null,
  owner?: string | null,
};

export type OnUpdateReferralSubscription = {
  onUpdateReferral?:  {
    __typename: "Referral",
    completedAt?: string | null,
    createdAt: string,
    freeMonthsEarned?: number | null,
    id: string,
    owner?: string | null,
    referralCode: string,
    referredId: string,
    referrerId: string,
    status?: ReferralStatus | null,
    updatedAt: string,
  } | null,
};

export type OnUpdateReferralCodeSubscriptionVariables = {
  filter?: ModelSubscriptionReferralCodeFilterInput | null,
  owner?: string | null,
};

export type OnUpdateReferralCodeSubscription = {
  onUpdateReferralCode?:  {
    __typename: "ReferralCode",
    code: string,
    createdAt: string,
    id: string,
    isActive?: boolean | null,
    owner?: string | null,
    successfulReferrals?: number | null,
    totalReferrals?: number | null,
    updatedAt: string,
  } | null,
};

export type OnUpdateSESCampaignContactSubscriptionVariables = {
  filter?: ModelSubscriptionSESCampaignContactFilterInput | null,
};

export type OnUpdateSESCampaignContactSubscription = {
  onUpdateSESCampaignContact?:  {
    __typename: "SESCampaignContact",
    Company: string,
    Company_Sequence?: number | null,
    Error_Status?: string | null,
    FirstName: string,
    Language?: string | null,
    LastName: string,
    Send_Group_ID: number,
    Sent_Date?: string | null,
    Sent_Status?: string | null,
    Target_Send_Date: string,
    createdAt: string,
    email: string,
    id: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateSESCampaignControlSubscriptionVariables = {
  filter?: ModelSubscriptionSESCampaignControlFilterInput | null,
};

export type OnUpdateSESCampaignControlSubscription = {
  onUpdateSESCampaignControl?:  {
    __typename: "SESCampaignControl",
    control: string,
    createdAt: string,
    id: string,
    isEnabled?: boolean | null,
    lastUpdated: string,
    updatedAt: string,
    updatedBy?: string | null,
  } | null,
};

export type OnUpdateUserActivitySubscriptionVariables = {
  filter?: ModelSubscriptionUserActivityFilterInput | null,
  owner?: string | null,
};

export type OnUpdateUserActivitySubscription = {
  onUpdateUserActivity?:  {
    __typename: "UserActivity",
    createdAt: string,
    deviceInfo?: string | null,
    duration?: number | null,
    endTime?: string | null,
    id: string,
    isActive?: boolean | null,
    owner?: string | null,
    sessionId: string,
    startTime: string,
    updatedAt: string,
    userAgent?: string | null,
  } | null,
};

export type OnUpdateUserProfileSubscriptionVariables = {
  filter?: ModelSubscriptionUserProfileFilterInput | null,
  owner?: string | null,
};

export type OnUpdateUserProfileSubscription = {
  onUpdateUserProfile?:  {
    __typename: "UserProfile",
    countryPreferences?: Array< string | null > | null,
    createdAt: string,
    id: string,
    industryPreferences?: Array< string | null > | null,
    owner?: string | null,
    updatedAt: string,
  } | null,
};

export type OnUpdateUserSubscriptionSubscriptionVariables = {
  filter?: ModelSubscriptionUserSubscriptionFilterInput | null,
  owner?: string | null,
};

export type OnUpdateUserSubscriptionSubscription = {
  onUpdateUserSubscription?:  {
    __typename: "UserSubscription",
    createdAt: string,
    earnedFreeMonths?: number | null,
    email?: string | null,
    id: string,
    owner?: string | null,
    referralCodeUsed?: string | null,
    referrerId?: string | null,
    subscriptionStatus?: UserSubscriptionSubscriptionStatus | null,
    totalFreeMonths?: number | null,
    trialEndDate?: string | null,
    trialStartDate?: string | null,
    updatedAt: string,
  } | null,
};
