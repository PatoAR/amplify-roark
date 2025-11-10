/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateArticleInput = {
  timestamp?: string | null,
  source: string,
  title: string,
  industry?: string | null,
  summary?: string | null,
  link?: string | null,
  companies?: string | null,
  countries?: string | null,
  language?: string | null,
  ttl?: number | null,
  category?: ArticleCategory | null,
  priorityDuration?: number | null,
  callToAction?: string | null,
  sponsorLink?: string | null,
  priorityUntil?: string | null,
  createdAt?: string | null,
  id?: string | null,
};

export enum ArticleCategory {
  NEWS = "NEWS",
  STATISTICS = "STATISTICS",
  SPONSORED = "SPONSORED",
}


export type ModelArticleConditionInput = {
  timestamp?: ModelStringInput | null,
  source?: ModelStringInput | null,
  title?: ModelStringInput | null,
  industry?: ModelStringInput | null,
  summary?: ModelStringInput | null,
  link?: ModelStringInput | null,
  companies?: ModelStringInput | null,
  countries?: ModelStringInput | null,
  language?: ModelStringInput | null,
  ttl?: ModelIntInput | null,
  category?: ModelArticleCategoryInput | null,
  priorityDuration?: ModelIntInput | null,
  callToAction?: ModelStringInput | null,
  sponsorLink?: ModelStringInput | null,
  priorityUntil?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  and?: Array< ModelArticleConditionInput | null > | null,
  or?: Array< ModelArticleConditionInput | null > | null,
  not?: ModelArticleConditionInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type ModelArticleCategoryInput = {
  eq?: ArticleCategory | null,
  ne?: ArticleCategory | null,
};

export type Article = {
  __typename: "Article",
  timestamp?: string | null,
  source: string,
  title: string,
  industry?: string | null,
  summary?: string | null,
  link?: string | null,
  companies?: string | null,
  countries?: string | null,
  language?: string | null,
  ttl?: number | null,
  category?: ArticleCategory | null,
  priorityDuration?: number | null,
  callToAction?: string | null,
  sponsorLink?: string | null,
  priorityUntil?: string | null,
  createdAt?: string | null,
  id: string,
  updatedAt: string,
};

export type UpdateArticleInput = {
  timestamp?: string | null,
  source?: string | null,
  title?: string | null,
  industry?: string | null,
  summary?: string | null,
  link?: string | null,
  companies?: string | null,
  countries?: string | null,
  language?: string | null,
  ttl?: number | null,
  category?: ArticleCategory | null,
  priorityDuration?: number | null,
  callToAction?: string | null,
  sponsorLink?: string | null,
  priorityUntil?: string | null,
  createdAt?: string | null,
  id: string,
};

export type DeleteArticleInput = {
  id: string,
};

export type CreateUserProfileInput = {
  owner?: string | null,
  industryPreferences?: Array< string | null > | null,
  countryPreferences?: Array< string | null > | null,
  id?: string | null,
};

export type ModelUserProfileConditionInput = {
  owner?: ModelStringInput | null,
  industryPreferences?: ModelStringInput | null,
  countryPreferences?: ModelStringInput | null,
  and?: Array< ModelUserProfileConditionInput | null > | null,
  or?: Array< ModelUserProfileConditionInput | null > | null,
  not?: ModelUserProfileConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type UserProfile = {
  __typename: "UserProfile",
  owner?: string | null,
  industryPreferences?: Array< string | null > | null,
  countryPreferences?: Array< string | null > | null,
  id: string,
  createdAt: string,
  updatedAt: string,
};

export type UpdateUserProfileInput = {
  owner?: string | null,
  industryPreferences?: Array< string | null > | null,
  countryPreferences?: Array< string | null > | null,
  id: string,
};

export type DeleteUserProfileInput = {
  id: string,
};

export type CreateReferralCodeInput = {
  owner?: string | null,
  code: string,
  isActive?: boolean | null,
  totalReferrals?: number | null,
  successfulReferrals?: number | null,
  id?: string | null,
};

export type ModelReferralCodeConditionInput = {
  owner?: ModelStringInput | null,
  code?: ModelStringInput | null,
  isActive?: ModelBooleanInput | null,
  totalReferrals?: ModelIntInput | null,
  successfulReferrals?: ModelIntInput | null,
  and?: Array< ModelReferralCodeConditionInput | null > | null,
  or?: Array< ModelReferralCodeConditionInput | null > | null,
  not?: ModelReferralCodeConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type ReferralCode = {
  __typename: "ReferralCode",
  owner?: string | null,
  code: string,
  isActive?: boolean | null,
  totalReferrals?: number | null,
  successfulReferrals?: number | null,
  id: string,
  createdAt: string,
  updatedAt: string,
};

export type UpdateReferralCodeInput = {
  owner?: string | null,
  code?: string | null,
  isActive?: boolean | null,
  totalReferrals?: number | null,
  successfulReferrals?: number | null,
  id: string,
};

export type DeleteReferralCodeInput = {
  id: string,
};

export type CreateReferralInput = {
  referrerId: string,
  referredId: string,
  referralCode: string,
  status?: ReferralStatus | null,
  completedAt?: string | null,
  freeMonthsEarned?: number | null,
  id?: string | null,
};

export enum ReferralStatus {
  pending = "pending",
  completed = "completed",
  expired = "expired",
}


export type ModelReferralConditionInput = {
  referrerId?: ModelStringInput | null,
  referredId?: ModelStringInput | null,
  referralCode?: ModelStringInput | null,
  status?: ModelReferralStatusInput | null,
  completedAt?: ModelStringInput | null,
  freeMonthsEarned?: ModelIntInput | null,
  and?: Array< ModelReferralConditionInput | null > | null,
  or?: Array< ModelReferralConditionInput | null > | null,
  not?: ModelReferralConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  owner?: ModelStringInput | null,
};

export type ModelReferralStatusInput = {
  eq?: ReferralStatus | null,
  ne?: ReferralStatus | null,
};

export type Referral = {
  __typename: "Referral",
  referrerId: string,
  referredId: string,
  referralCode: string,
  status?: ReferralStatus | null,
  completedAt?: string | null,
  freeMonthsEarned?: number | null,
  id: string,
  createdAt: string,
  updatedAt: string,
  owner?: string | null,
};

export type UpdateReferralInput = {
  referrerId?: string | null,
  referredId?: string | null,
  referralCode?: string | null,
  status?: ReferralStatus | null,
  completedAt?: string | null,
  freeMonthsEarned?: number | null,
  id: string,
};

export type DeleteReferralInput = {
  id: string,
};

export type CreateUserSubscriptionInput = {
  owner?: string | null,
  subscriptionStatus?: UserSubscriptionSubscriptionStatus | null,
  trialStartDate?: string | null,
  trialEndDate?: string | null,
  totalFreeMonths?: number | null,
  earnedFreeMonths?: number | null,
  referralCodeUsed?: string | null,
  referrerId?: string | null,
  id?: string | null,
};

export enum UserSubscriptionSubscriptionStatus {
  free_trial = "free_trial",
  active = "active",
  expired = "expired",
  cancelled = "cancelled",
}


export type ModelUserSubscriptionConditionInput = {
  owner?: ModelStringInput | null,
  subscriptionStatus?: ModelUserSubscriptionSubscriptionStatusInput | null,
  trialStartDate?: ModelStringInput | null,
  trialEndDate?: ModelStringInput | null,
  totalFreeMonths?: ModelIntInput | null,
  earnedFreeMonths?: ModelIntInput | null,
  referralCodeUsed?: ModelStringInput | null,
  referrerId?: ModelStringInput | null,
  and?: Array< ModelUserSubscriptionConditionInput | null > | null,
  or?: Array< ModelUserSubscriptionConditionInput | null > | null,
  not?: ModelUserSubscriptionConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelUserSubscriptionSubscriptionStatusInput = {
  eq?: UserSubscriptionSubscriptionStatus | null,
  ne?: UserSubscriptionSubscriptionStatus | null,
};

export type UserSubscription = {
  __typename: "UserSubscription",
  owner?: string | null,
  subscriptionStatus?: UserSubscriptionSubscriptionStatus | null,
  trialStartDate?: string | null,
  trialEndDate?: string | null,
  totalFreeMonths?: number | null,
  earnedFreeMonths?: number | null,
  referralCodeUsed?: string | null,
  referrerId?: string | null,
  id: string,
  createdAt: string,
  updatedAt: string,
};

export type UpdateUserSubscriptionInput = {
  owner?: string | null,
  subscriptionStatus?: UserSubscriptionSubscriptionStatus | null,
  trialStartDate?: string | null,
  trialEndDate?: string | null,
  totalFreeMonths?: number | null,
  earnedFreeMonths?: number | null,
  referralCodeUsed?: string | null,
  referrerId?: string | null,
  id: string,
};

export type DeleteUserSubscriptionInput = {
  id: string,
};

export type CreateUserActivityInput = {
  owner?: string | null,
  sessionId: string,
  startTime: string,
  endTime?: string | null,
  duration?: number | null,
  deviceInfo?: string | null,
  userAgent?: string | null,
  isActive?: boolean | null,
  id?: string | null,
};

export type ModelUserActivityConditionInput = {
  owner?: ModelStringInput | null,
  sessionId?: ModelStringInput | null,
  startTime?: ModelStringInput | null,
  endTime?: ModelStringInput | null,
  duration?: ModelIntInput | null,
  deviceInfo?: ModelStringInput | null,
  userAgent?: ModelStringInput | null,
  isActive?: ModelBooleanInput | null,
  and?: Array< ModelUserActivityConditionInput | null > | null,
  or?: Array< ModelUserActivityConditionInput | null > | null,
  not?: ModelUserActivityConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type UserActivity = {
  __typename: "UserActivity",
  owner?: string | null,
  sessionId: string,
  startTime: string,
  endTime?: string | null,
  duration?: number | null,
  deviceInfo?: string | null,
  userAgent?: string | null,
  isActive?: boolean | null,
  id: string,
  createdAt: string,
  updatedAt: string,
};

export type UpdateUserActivityInput = {
  owner?: string | null,
  sessionId?: string | null,
  startTime?: string | null,
  endTime?: string | null,
  duration?: number | null,
  deviceInfo?: string | null,
  userAgent?: string | null,
  isActive?: boolean | null,
  id: string,
};

export type DeleteUserActivityInput = {
  id: string,
};

export type CreateDeletedUserEmailInput = {
  email: string,
  deletedAt: string,
  originalUserId?: string | null,
  subscriptionStatus?: string | null,
  deletionReason?: string | null,
  id?: string | null,
};

export type ModelDeletedUserEmailConditionInput = {
  email?: ModelStringInput | null,
  deletedAt?: ModelStringInput | null,
  originalUserId?: ModelStringInput | null,
  subscriptionStatus?: ModelStringInput | null,
  deletionReason?: ModelStringInput | null,
  and?: Array< ModelDeletedUserEmailConditionInput | null > | null,
  or?: Array< ModelDeletedUserEmailConditionInput | null > | null,
  not?: ModelDeletedUserEmailConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  owner?: ModelStringInput | null,
};

export type DeletedUserEmail = {
  __typename: "DeletedUserEmail",
  email: string,
  deletedAt: string,
  originalUserId?: string | null,
  subscriptionStatus?: string | null,
  deletionReason?: string | null,
  id: string,
  createdAt: string,
  updatedAt: string,
  owner?: string | null,
};

export type UpdateDeletedUserEmailInput = {
  email?: string | null,
  deletedAt?: string | null,
  originalUserId?: string | null,
  subscriptionStatus?: string | null,
  deletionReason?: string | null,
  id: string,
};

export type DeleteDeletedUserEmailInput = {
  id: string,
};

export type ModelArticleFilterInput = {
  timestamp?: ModelStringInput | null,
  source?: ModelStringInput | null,
  title?: ModelStringInput | null,
  industry?: ModelStringInput | null,
  summary?: ModelStringInput | null,
  link?: ModelStringInput | null,
  companies?: ModelStringInput | null,
  countries?: ModelStringInput | null,
  language?: ModelStringInput | null,
  ttl?: ModelIntInput | null,
  category?: ModelArticleCategoryInput | null,
  priorityDuration?: ModelIntInput | null,
  callToAction?: ModelStringInput | null,
  sponsorLink?: ModelStringInput | null,
  priorityUntil?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  id?: ModelIDInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelArticleFilterInput | null > | null,
  or?: Array< ModelArticleFilterInput | null > | null,
  not?: ModelArticleFilterInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelArticleConnection = {
  __typename: "ModelArticleConnection",
  items:  Array<Article | null >,
  nextToken?: string | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelUserProfileFilterInput = {
  owner?: ModelStringInput | null,
  industryPreferences?: ModelStringInput | null,
  countryPreferences?: ModelStringInput | null,
  id?: ModelIDInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelUserProfileFilterInput | null > | null,
  or?: Array< ModelUserProfileFilterInput | null > | null,
  not?: ModelUserProfileFilterInput | null,
};

export type ModelUserProfileConnection = {
  __typename: "ModelUserProfileConnection",
  items:  Array<UserProfile | null >,
  nextToken?: string | null,
};

export type ModelReferralCodeFilterInput = {
  owner?: ModelStringInput | null,
  code?: ModelStringInput | null,
  isActive?: ModelBooleanInput | null,
  totalReferrals?: ModelIntInput | null,
  successfulReferrals?: ModelIntInput | null,
  id?: ModelIDInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelReferralCodeFilterInput | null > | null,
  or?: Array< ModelReferralCodeFilterInput | null > | null,
  not?: ModelReferralCodeFilterInput | null,
};

export type ModelReferralCodeConnection = {
  __typename: "ModelReferralCodeConnection",
  items:  Array<ReferralCode | null >,
  nextToken?: string | null,
};

export type ModelReferralFilterInput = {
  referrerId?: ModelStringInput | null,
  referredId?: ModelStringInput | null,
  referralCode?: ModelStringInput | null,
  status?: ModelReferralStatusInput | null,
  completedAt?: ModelStringInput | null,
  freeMonthsEarned?: ModelIntInput | null,
  id?: ModelIDInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelReferralFilterInput | null > | null,
  or?: Array< ModelReferralFilterInput | null > | null,
  not?: ModelReferralFilterInput | null,
  owner?: ModelStringInput | null,
};

export type ModelReferralConnection = {
  __typename: "ModelReferralConnection",
  items:  Array<Referral | null >,
  nextToken?: string | null,
};

export type ModelUserSubscriptionFilterInput = {
  owner?: ModelStringInput | null,
  subscriptionStatus?: ModelUserSubscriptionSubscriptionStatusInput | null,
  trialStartDate?: ModelStringInput | null,
  trialEndDate?: ModelStringInput | null,
  totalFreeMonths?: ModelIntInput | null,
  earnedFreeMonths?: ModelIntInput | null,
  referralCodeUsed?: ModelStringInput | null,
  referrerId?: ModelStringInput | null,
  id?: ModelIDInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelUserSubscriptionFilterInput | null > | null,
  or?: Array< ModelUserSubscriptionFilterInput | null > | null,
  not?: ModelUserSubscriptionFilterInput | null,
};

export type ModelUserSubscriptionConnection = {
  __typename: "ModelUserSubscriptionConnection",
  items:  Array<UserSubscription | null >,
  nextToken?: string | null,
};

export type ModelUserActivityFilterInput = {
  owner?: ModelStringInput | null,
  sessionId?: ModelStringInput | null,
  startTime?: ModelStringInput | null,
  endTime?: ModelStringInput | null,
  duration?: ModelIntInput | null,
  deviceInfo?: ModelStringInput | null,
  userAgent?: ModelStringInput | null,
  isActive?: ModelBooleanInput | null,
  id?: ModelIDInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelUserActivityFilterInput | null > | null,
  or?: Array< ModelUserActivityFilterInput | null > | null,
  not?: ModelUserActivityFilterInput | null,
};

export type ModelUserActivityConnection = {
  __typename: "ModelUserActivityConnection",
  items:  Array<UserActivity | null >,
  nextToken?: string | null,
};

export type ModelDeletedUserEmailFilterInput = {
  email?: ModelStringInput | null,
  deletedAt?: ModelStringInput | null,
  originalUserId?: ModelStringInput | null,
  subscriptionStatus?: ModelStringInput | null,
  deletionReason?: ModelStringInput | null,
  id?: ModelIDInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelDeletedUserEmailFilterInput | null > | null,
  or?: Array< ModelDeletedUserEmailFilterInput | null > | null,
  not?: ModelDeletedUserEmailFilterInput | null,
  owner?: ModelStringInput | null,
};

export type ModelDeletedUserEmailConnection = {
  __typename: "ModelDeletedUserEmailConnection",
  items:  Array<DeletedUserEmail | null >,
  nextToken?: string | null,
};

export type ModelSubscriptionArticleFilterInput = {
  timestamp?: ModelSubscriptionStringInput | null,
  source?: ModelSubscriptionStringInput | null,
  title?: ModelSubscriptionStringInput | null,
  industry?: ModelSubscriptionStringInput | null,
  summary?: ModelSubscriptionStringInput | null,
  link?: ModelSubscriptionStringInput | null,
  companies?: ModelSubscriptionStringInput | null,
  countries?: ModelSubscriptionStringInput | null,
  language?: ModelSubscriptionStringInput | null,
  ttl?: ModelSubscriptionIntInput | null,
  category?: ModelSubscriptionStringInput | null,
  priorityDuration?: ModelSubscriptionIntInput | null,
  callToAction?: ModelSubscriptionStringInput | null,
  sponsorLink?: ModelSubscriptionStringInput | null,
  priorityUntil?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionArticleFilterInput | null > | null,
  or?: Array< ModelSubscriptionArticleFilterInput | null > | null,
};

export type ModelSubscriptionStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  in?: Array< number | null > | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionUserProfileFilterInput = {
  industryPreferences?: ModelSubscriptionStringInput | null,
  countryPreferences?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionUserProfileFilterInput | null > | null,
  or?: Array< ModelSubscriptionUserProfileFilterInput | null > | null,
  owner?: ModelStringInput | null,
};

export type ModelSubscriptionReferralCodeFilterInput = {
  code?: ModelSubscriptionStringInput | null,
  isActive?: ModelSubscriptionBooleanInput | null,
  totalReferrals?: ModelSubscriptionIntInput | null,
  successfulReferrals?: ModelSubscriptionIntInput | null,
  id?: ModelSubscriptionIDInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionReferralCodeFilterInput | null > | null,
  or?: Array< ModelSubscriptionReferralCodeFilterInput | null > | null,
  owner?: ModelStringInput | null,
};

export type ModelSubscriptionBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
};

export type ModelSubscriptionReferralFilterInput = {
  referrerId?: ModelSubscriptionStringInput | null,
  referredId?: ModelSubscriptionStringInput | null,
  referralCode?: ModelSubscriptionStringInput | null,
  status?: ModelSubscriptionStringInput | null,
  completedAt?: ModelSubscriptionStringInput | null,
  freeMonthsEarned?: ModelSubscriptionIntInput | null,
  id?: ModelSubscriptionIDInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionReferralFilterInput | null > | null,
  or?: Array< ModelSubscriptionReferralFilterInput | null > | null,
  owner?: ModelStringInput | null,
};

export type ModelSubscriptionUserSubscriptionFilterInput = {
  subscriptionStatus?: ModelSubscriptionStringInput | null,
  trialStartDate?: ModelSubscriptionStringInput | null,
  trialEndDate?: ModelSubscriptionStringInput | null,
  totalFreeMonths?: ModelSubscriptionIntInput | null,
  earnedFreeMonths?: ModelSubscriptionIntInput | null,
  referralCodeUsed?: ModelSubscriptionStringInput | null,
  referrerId?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionUserSubscriptionFilterInput | null > | null,
  or?: Array< ModelSubscriptionUserSubscriptionFilterInput | null > | null,
  owner?: ModelStringInput | null,
};

export type ModelSubscriptionUserActivityFilterInput = {
  sessionId?: ModelSubscriptionStringInput | null,
  startTime?: ModelSubscriptionStringInput | null,
  endTime?: ModelSubscriptionStringInput | null,
  duration?: ModelSubscriptionIntInput | null,
  deviceInfo?: ModelSubscriptionStringInput | null,
  userAgent?: ModelSubscriptionStringInput | null,
  isActive?: ModelSubscriptionBooleanInput | null,
  id?: ModelSubscriptionIDInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionUserActivityFilterInput | null > | null,
  or?: Array< ModelSubscriptionUserActivityFilterInput | null > | null,
  owner?: ModelStringInput | null,
};

export type ModelSubscriptionDeletedUserEmailFilterInput = {
  email?: ModelSubscriptionStringInput | null,
  deletedAt?: ModelSubscriptionStringInput | null,
  originalUserId?: ModelSubscriptionStringInput | null,
  subscriptionStatus?: ModelSubscriptionStringInput | null,
  deletionReason?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionDeletedUserEmailFilterInput | null > | null,
  or?: Array< ModelSubscriptionDeletedUserEmailFilterInput | null > | null,
  owner?: ModelStringInput | null,
};

export type CreateArticleMutationVariables = {
  input: CreateArticleInput,
  condition?: ModelArticleConditionInput | null,
};

export type CreateArticleMutation = {
  createArticle?:  {
    __typename: "Article",
    timestamp?: string | null,
    source: string,
    title: string,
    industry?: string | null,
    summary?: string | null,
    link?: string | null,
    companies?: string | null,
    countries?: string | null,
    language?: string | null,
    ttl?: number | null,
    category?: ArticleCategory | null,
    priorityDuration?: number | null,
    callToAction?: string | null,
    sponsorLink?: string | null,
    priorityUntil?: string | null,
    createdAt?: string | null,
    id: string,
    updatedAt: string,
  } | null,
};

export type UpdateArticleMutationVariables = {
  input: UpdateArticleInput,
  condition?: ModelArticleConditionInput | null,
};

export type UpdateArticleMutation = {
  updateArticle?:  {
    __typename: "Article",
    timestamp?: string | null,
    source: string,
    title: string,
    industry?: string | null,
    summary?: string | null,
    link?: string | null,
    companies?: string | null,
    countries?: string | null,
    language?: string | null,
    ttl?: number | null,
    category?: ArticleCategory | null,
    priorityDuration?: number | null,
    callToAction?: string | null,
    sponsorLink?: string | null,
    priorityUntil?: string | null,
    createdAt?: string | null,
    id: string,
    updatedAt: string,
  } | null,
};

export type DeleteArticleMutationVariables = {
  input: DeleteArticleInput,
  condition?: ModelArticleConditionInput | null,
};

export type DeleteArticleMutation = {
  deleteArticle?:  {
    __typename: "Article",
    timestamp?: string | null,
    source: string,
    title: string,
    industry?: string | null,
    summary?: string | null,
    link?: string | null,
    companies?: string | null,
    countries?: string | null,
    language?: string | null,
    ttl?: number | null,
    category?: ArticleCategory | null,
    priorityDuration?: number | null,
    callToAction?: string | null,
    sponsorLink?: string | null,
    priorityUntil?: string | null,
    createdAt?: string | null,
    id: string,
    updatedAt: string,
  } | null,
};

export type CreateUserProfileMutationVariables = {
  input: CreateUserProfileInput,
  condition?: ModelUserProfileConditionInput | null,
};

export type CreateUserProfileMutation = {
  createUserProfile?:  {
    __typename: "UserProfile",
    owner?: string | null,
    industryPreferences?: Array< string | null > | null,
    countryPreferences?: Array< string | null > | null,
    id: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateUserProfileMutationVariables = {
  input: UpdateUserProfileInput,
  condition?: ModelUserProfileConditionInput | null,
};

export type UpdateUserProfileMutation = {
  updateUserProfile?:  {
    __typename: "UserProfile",
    owner?: string | null,
    industryPreferences?: Array< string | null > | null,
    countryPreferences?: Array< string | null > | null,
    id: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteUserProfileMutationVariables = {
  input: DeleteUserProfileInput,
  condition?: ModelUserProfileConditionInput | null,
};

export type DeleteUserProfileMutation = {
  deleteUserProfile?:  {
    __typename: "UserProfile",
    owner?: string | null,
    industryPreferences?: Array< string | null > | null,
    countryPreferences?: Array< string | null > | null,
    id: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateReferralCodeMutationVariables = {
  input: CreateReferralCodeInput,
  condition?: ModelReferralCodeConditionInput | null,
};

export type CreateReferralCodeMutation = {
  createReferralCode?:  {
    __typename: "ReferralCode",
    owner?: string | null,
    code: string,
    isActive?: boolean | null,
    totalReferrals?: number | null,
    successfulReferrals?: number | null,
    id: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateReferralCodeMutationVariables = {
  input: UpdateReferralCodeInput,
  condition?: ModelReferralCodeConditionInput | null,
};

export type UpdateReferralCodeMutation = {
  updateReferralCode?:  {
    __typename: "ReferralCode",
    owner?: string | null,
    code: string,
    isActive?: boolean | null,
    totalReferrals?: number | null,
    successfulReferrals?: number | null,
    id: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteReferralCodeMutationVariables = {
  input: DeleteReferralCodeInput,
  condition?: ModelReferralCodeConditionInput | null,
};

export type DeleteReferralCodeMutation = {
  deleteReferralCode?:  {
    __typename: "ReferralCode",
    owner?: string | null,
    code: string,
    isActive?: boolean | null,
    totalReferrals?: number | null,
    successfulReferrals?: number | null,
    id: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateReferralMutationVariables = {
  input: CreateReferralInput,
  condition?: ModelReferralConditionInput | null,
};

export type CreateReferralMutation = {
  createReferral?:  {
    __typename: "Referral",
    referrerId: string,
    referredId: string,
    referralCode: string,
    status?: ReferralStatus | null,
    completedAt?: string | null,
    freeMonthsEarned?: number | null,
    id: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type UpdateReferralMutationVariables = {
  input: UpdateReferralInput,
  condition?: ModelReferralConditionInput | null,
};

export type UpdateReferralMutation = {
  updateReferral?:  {
    __typename: "Referral",
    referrerId: string,
    referredId: string,
    referralCode: string,
    status?: ReferralStatus | null,
    completedAt?: string | null,
    freeMonthsEarned?: number | null,
    id: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type DeleteReferralMutationVariables = {
  input: DeleteReferralInput,
  condition?: ModelReferralConditionInput | null,
};

export type DeleteReferralMutation = {
  deleteReferral?:  {
    __typename: "Referral",
    referrerId: string,
    referredId: string,
    referralCode: string,
    status?: ReferralStatus | null,
    completedAt?: string | null,
    freeMonthsEarned?: number | null,
    id: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type CreateUserSubscriptionMutationVariables = {
  input: CreateUserSubscriptionInput,
  condition?: ModelUserSubscriptionConditionInput | null,
};

export type CreateUserSubscriptionMutation = {
  createUserSubscription?:  {
    __typename: "UserSubscription",
    owner?: string | null,
    subscriptionStatus?: UserSubscriptionSubscriptionStatus | null,
    trialStartDate?: string | null,
    trialEndDate?: string | null,
    totalFreeMonths?: number | null,
    earnedFreeMonths?: number | null,
    referralCodeUsed?: string | null,
    referrerId?: string | null,
    id: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateUserSubscriptionMutationVariables = {
  input: UpdateUserSubscriptionInput,
  condition?: ModelUserSubscriptionConditionInput | null,
};

export type UpdateUserSubscriptionMutation = {
  updateUserSubscription?:  {
    __typename: "UserSubscription",
    owner?: string | null,
    subscriptionStatus?: UserSubscriptionSubscriptionStatus | null,
    trialStartDate?: string | null,
    trialEndDate?: string | null,
    totalFreeMonths?: number | null,
    earnedFreeMonths?: number | null,
    referralCodeUsed?: string | null,
    referrerId?: string | null,
    id: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteUserSubscriptionMutationVariables = {
  input: DeleteUserSubscriptionInput,
  condition?: ModelUserSubscriptionConditionInput | null,
};

export type DeleteUserSubscriptionMutation = {
  deleteUserSubscription?:  {
    __typename: "UserSubscription",
    owner?: string | null,
    subscriptionStatus?: UserSubscriptionSubscriptionStatus | null,
    trialStartDate?: string | null,
    trialEndDate?: string | null,
    totalFreeMonths?: number | null,
    earnedFreeMonths?: number | null,
    referralCodeUsed?: string | null,
    referrerId?: string | null,
    id: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateUserActivityMutationVariables = {
  input: CreateUserActivityInput,
  condition?: ModelUserActivityConditionInput | null,
};

export type CreateUserActivityMutation = {
  createUserActivity?:  {
    __typename: "UserActivity",
    owner?: string | null,
    sessionId: string,
    startTime: string,
    endTime?: string | null,
    duration?: number | null,
    deviceInfo?: string | null,
    userAgent?: string | null,
    isActive?: boolean | null,
    id: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateUserActivityMutationVariables = {
  input: UpdateUserActivityInput,
  condition?: ModelUserActivityConditionInput | null,
};

export type UpdateUserActivityMutation = {
  updateUserActivity?:  {
    __typename: "UserActivity",
    owner?: string | null,
    sessionId: string,
    startTime: string,
    endTime?: string | null,
    duration?: number | null,
    deviceInfo?: string | null,
    userAgent?: string | null,
    isActive?: boolean | null,
    id: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteUserActivityMutationVariables = {
  input: DeleteUserActivityInput,
  condition?: ModelUserActivityConditionInput | null,
};

export type DeleteUserActivityMutation = {
  deleteUserActivity?:  {
    __typename: "UserActivity",
    owner?: string | null,
    sessionId: string,
    startTime: string,
    endTime?: string | null,
    duration?: number | null,
    deviceInfo?: string | null,
    userAgent?: string | null,
    isActive?: boolean | null,
    id: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateDeletedUserEmailMutationVariables = {
  input: CreateDeletedUserEmailInput,
  condition?: ModelDeletedUserEmailConditionInput | null,
};

export type CreateDeletedUserEmailMutation = {
  createDeletedUserEmail?:  {
    __typename: "DeletedUserEmail",
    email: string,
    deletedAt: string,
    originalUserId?: string | null,
    subscriptionStatus?: string | null,
    deletionReason?: string | null,
    id: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type UpdateDeletedUserEmailMutationVariables = {
  input: UpdateDeletedUserEmailInput,
  condition?: ModelDeletedUserEmailConditionInput | null,
};

export type UpdateDeletedUserEmailMutation = {
  updateDeletedUserEmail?:  {
    __typename: "DeletedUserEmail",
    email: string,
    deletedAt: string,
    originalUserId?: string | null,
    subscriptionStatus?: string | null,
    deletionReason?: string | null,
    id: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type DeleteDeletedUserEmailMutationVariables = {
  input: DeleteDeletedUserEmailInput,
  condition?: ModelDeletedUserEmailConditionInput | null,
};

export type DeleteDeletedUserEmailMutation = {
  deleteDeletedUserEmail?:  {
    __typename: "DeletedUserEmail",
    email: string,
    deletedAt: string,
    originalUserId?: string | null,
    subscriptionStatus?: string | null,
    deletionReason?: string | null,
    id: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type GetArticleQueryVariables = {
  id: string,
};

export type GetArticleQuery = {
  getArticle?:  {
    __typename: "Article",
    timestamp?: string | null,
    source: string,
    title: string,
    industry?: string | null,
    summary?: string | null,
    link?: string | null,
    companies?: string | null,
    countries?: string | null,
    language?: string | null,
    ttl?: number | null,
    category?: ArticleCategory | null,
    priorityDuration?: number | null,
    callToAction?: string | null,
    sponsorLink?: string | null,
    priorityUntil?: string | null,
    createdAt?: string | null,
    id: string,
    updatedAt: string,
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
      timestamp?: string | null,
      source: string,
      title: string,
      industry?: string | null,
      summary?: string | null,
      link?: string | null,
      companies?: string | null,
      countries?: string | null,
      language?: string | null,
      ttl?: number | null,
      category?: ArticleCategory | null,
      priorityDuration?: number | null,
      callToAction?: string | null,
      sponsorLink?: string | null,
      priorityUntil?: string | null,
      createdAt?: string | null,
      id: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListArticleByCreatedAtQueryVariables = {
  createdAt: string,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelArticleFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListArticleByCreatedAtQuery = {
  listArticleByCreatedAt?:  {
    __typename: "ModelArticleConnection",
    items:  Array< {
      __typename: "Article",
      timestamp?: string | null,
      source: string,
      title: string,
      industry?: string | null,
      summary?: string | null,
      link?: string | null,
      companies?: string | null,
      countries?: string | null,
      language?: string | null,
      ttl?: number | null,
      category?: ArticleCategory | null,
      priorityDuration?: number | null,
      callToAction?: string | null,
      sponsorLink?: string | null,
      priorityUntil?: string | null,
      createdAt?: string | null,
      id: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetUserProfileQueryVariables = {
  id: string,
};

export type GetUserProfileQuery = {
  getUserProfile?:  {
    __typename: "UserProfile",
    owner?: string | null,
    industryPreferences?: Array< string | null > | null,
    countryPreferences?: Array< string | null > | null,
    id: string,
    createdAt: string,
    updatedAt: string,
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
      owner?: string | null,
      industryPreferences?: Array< string | null > | null,
      countryPreferences?: Array< string | null > | null,
      id: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetReferralCodeQueryVariables = {
  id: string,
};

export type GetReferralCodeQuery = {
  getReferralCode?:  {
    __typename: "ReferralCode",
    owner?: string | null,
    code: string,
    isActive?: boolean | null,
    totalReferrals?: number | null,
    successfulReferrals?: number | null,
    id: string,
    createdAt: string,
    updatedAt: string,
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
      owner?: string | null,
      code: string,
      isActive?: boolean | null,
      totalReferrals?: number | null,
      successfulReferrals?: number | null,
      id: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetReferralQueryVariables = {
  id: string,
};

export type GetReferralQuery = {
  getReferral?:  {
    __typename: "Referral",
    referrerId: string,
    referredId: string,
    referralCode: string,
    status?: ReferralStatus | null,
    completedAt?: string | null,
    freeMonthsEarned?: number | null,
    id: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
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
      referrerId: string,
      referredId: string,
      referralCode: string,
      status?: ReferralStatus | null,
      completedAt?: string | null,
      freeMonthsEarned?: number | null,
      id: string,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetUserSubscriptionQueryVariables = {
  id: string,
};

export type GetUserSubscriptionQuery = {
  getUserSubscription?:  {
    __typename: "UserSubscription",
    owner?: string | null,
    subscriptionStatus?: UserSubscriptionSubscriptionStatus | null,
    trialStartDate?: string | null,
    trialEndDate?: string | null,
    totalFreeMonths?: number | null,
    earnedFreeMonths?: number | null,
    referralCodeUsed?: string | null,
    referrerId?: string | null,
    id: string,
    createdAt: string,
    updatedAt: string,
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
      owner?: string | null,
      subscriptionStatus?: UserSubscriptionSubscriptionStatus | null,
      trialStartDate?: string | null,
      trialEndDate?: string | null,
      totalFreeMonths?: number | null,
      earnedFreeMonths?: number | null,
      referralCodeUsed?: string | null,
      referrerId?: string | null,
      id: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetUserActivityQueryVariables = {
  id: string,
};

export type GetUserActivityQuery = {
  getUserActivity?:  {
    __typename: "UserActivity",
    owner?: string | null,
    sessionId: string,
    startTime: string,
    endTime?: string | null,
    duration?: number | null,
    deviceInfo?: string | null,
    userAgent?: string | null,
    isActive?: boolean | null,
    id: string,
    createdAt: string,
    updatedAt: string,
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
      owner?: string | null,
      sessionId: string,
      startTime: string,
      endTime?: string | null,
      duration?: number | null,
      deviceInfo?: string | null,
      userAgent?: string | null,
      isActive?: boolean | null,
      id: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetDeletedUserEmailQueryVariables = {
  id: string,
};

export type GetDeletedUserEmailQuery = {
  getDeletedUserEmail?:  {
    __typename: "DeletedUserEmail",
    email: string,
    deletedAt: string,
    originalUserId?: string | null,
    subscriptionStatus?: string | null,
    deletionReason?: string | null,
    id: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
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
      email: string,
      deletedAt: string,
      originalUserId?: string | null,
      subscriptionStatus?: string | null,
      deletionReason?: string | null,
      id: string,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateArticleSubscriptionVariables = {
  filter?: ModelSubscriptionArticleFilterInput | null,
};

export type OnCreateArticleSubscription = {
  onCreateArticle?:  {
    __typename: "Article",
    timestamp?: string | null,
    source: string,
    title: string,
    industry?: string | null,
    summary?: string | null,
    link?: string | null,
    companies?: string | null,
    countries?: string | null,
    language?: string | null,
    ttl?: number | null,
    category?: ArticleCategory | null,
    priorityDuration?: number | null,
    callToAction?: string | null,
    sponsorLink?: string | null,
    priorityUntil?: string | null,
    createdAt?: string | null,
    id: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateArticleSubscriptionVariables = {
  filter?: ModelSubscriptionArticleFilterInput | null,
};

export type OnUpdateArticleSubscription = {
  onUpdateArticle?:  {
    __typename: "Article",
    timestamp?: string | null,
    source: string,
    title: string,
    industry?: string | null,
    summary?: string | null,
    link?: string | null,
    companies?: string | null,
    countries?: string | null,
    language?: string | null,
    ttl?: number | null,
    category?: ArticleCategory | null,
    priorityDuration?: number | null,
    callToAction?: string | null,
    sponsorLink?: string | null,
    priorityUntil?: string | null,
    createdAt?: string | null,
    id: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteArticleSubscriptionVariables = {
  filter?: ModelSubscriptionArticleFilterInput | null,
};

export type OnDeleteArticleSubscription = {
  onDeleteArticle?:  {
    __typename: "Article",
    timestamp?: string | null,
    source: string,
    title: string,
    industry?: string | null,
    summary?: string | null,
    link?: string | null,
    companies?: string | null,
    countries?: string | null,
    language?: string | null,
    ttl?: number | null,
    category?: ArticleCategory | null,
    priorityDuration?: number | null,
    callToAction?: string | null,
    sponsorLink?: string | null,
    priorityUntil?: string | null,
    createdAt?: string | null,
    id: string,
    updatedAt: string,
  } | null,
};

export type OnCreateUserProfileSubscriptionVariables = {
  filter?: ModelSubscriptionUserProfileFilterInput | null,
  owner?: string | null,
};

export type OnCreateUserProfileSubscription = {
  onCreateUserProfile?:  {
    __typename: "UserProfile",
    owner?: string | null,
    industryPreferences?: Array< string | null > | null,
    countryPreferences?: Array< string | null > | null,
    id: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateUserProfileSubscriptionVariables = {
  filter?: ModelSubscriptionUserProfileFilterInput | null,
  owner?: string | null,
};

export type OnUpdateUserProfileSubscription = {
  onUpdateUserProfile?:  {
    __typename: "UserProfile",
    owner?: string | null,
    industryPreferences?: Array< string | null > | null,
    countryPreferences?: Array< string | null > | null,
    id: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteUserProfileSubscriptionVariables = {
  filter?: ModelSubscriptionUserProfileFilterInput | null,
  owner?: string | null,
};

export type OnDeleteUserProfileSubscription = {
  onDeleteUserProfile?:  {
    __typename: "UserProfile",
    owner?: string | null,
    industryPreferences?: Array< string | null > | null,
    countryPreferences?: Array< string | null > | null,
    id: string,
    createdAt: string,
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
    owner?: string | null,
    code: string,
    isActive?: boolean | null,
    totalReferrals?: number | null,
    successfulReferrals?: number | null,
    id: string,
    createdAt: string,
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
    owner?: string | null,
    code: string,
    isActive?: boolean | null,
    totalReferrals?: number | null,
    successfulReferrals?: number | null,
    id: string,
    createdAt: string,
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
    owner?: string | null,
    code: string,
    isActive?: boolean | null,
    totalReferrals?: number | null,
    successfulReferrals?: number | null,
    id: string,
    createdAt: string,
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
    referrerId: string,
    referredId: string,
    referralCode: string,
    status?: ReferralStatus | null,
    completedAt?: string | null,
    freeMonthsEarned?: number | null,
    id: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnUpdateReferralSubscriptionVariables = {
  filter?: ModelSubscriptionReferralFilterInput | null,
  owner?: string | null,
};

export type OnUpdateReferralSubscription = {
  onUpdateReferral?:  {
    __typename: "Referral",
    referrerId: string,
    referredId: string,
    referralCode: string,
    status?: ReferralStatus | null,
    completedAt?: string | null,
    freeMonthsEarned?: number | null,
    id: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnDeleteReferralSubscriptionVariables = {
  filter?: ModelSubscriptionReferralFilterInput | null,
  owner?: string | null,
};

export type OnDeleteReferralSubscription = {
  onDeleteReferral?:  {
    __typename: "Referral",
    referrerId: string,
    referredId: string,
    referralCode: string,
    status?: ReferralStatus | null,
    completedAt?: string | null,
    freeMonthsEarned?: number | null,
    id: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnCreateUserSubscriptionSubscriptionVariables = {
  filter?: ModelSubscriptionUserSubscriptionFilterInput | null,
  owner?: string | null,
};

export type OnCreateUserSubscriptionSubscription = {
  onCreateUserSubscription?:  {
    __typename: "UserSubscription",
    owner?: string | null,
    subscriptionStatus?: UserSubscriptionSubscriptionStatus | null,
    trialStartDate?: string | null,
    trialEndDate?: string | null,
    totalFreeMonths?: number | null,
    earnedFreeMonths?: number | null,
    referralCodeUsed?: string | null,
    referrerId?: string | null,
    id: string,
    createdAt: string,
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
    owner?: string | null,
    subscriptionStatus?: UserSubscriptionSubscriptionStatus | null,
    trialStartDate?: string | null,
    trialEndDate?: string | null,
    totalFreeMonths?: number | null,
    earnedFreeMonths?: number | null,
    referralCodeUsed?: string | null,
    referrerId?: string | null,
    id: string,
    createdAt: string,
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
    owner?: string | null,
    subscriptionStatus?: UserSubscriptionSubscriptionStatus | null,
    trialStartDate?: string | null,
    trialEndDate?: string | null,
    totalFreeMonths?: number | null,
    earnedFreeMonths?: number | null,
    referralCodeUsed?: string | null,
    referrerId?: string | null,
    id: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateUserActivitySubscriptionVariables = {
  filter?: ModelSubscriptionUserActivityFilterInput | null,
  owner?: string | null,
};

export type OnCreateUserActivitySubscription = {
  onCreateUserActivity?:  {
    __typename: "UserActivity",
    owner?: string | null,
    sessionId: string,
    startTime: string,
    endTime?: string | null,
    duration?: number | null,
    deviceInfo?: string | null,
    userAgent?: string | null,
    isActive?: boolean | null,
    id: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateUserActivitySubscriptionVariables = {
  filter?: ModelSubscriptionUserActivityFilterInput | null,
  owner?: string | null,
};

export type OnUpdateUserActivitySubscription = {
  onUpdateUserActivity?:  {
    __typename: "UserActivity",
    owner?: string | null,
    sessionId: string,
    startTime: string,
    endTime?: string | null,
    duration?: number | null,
    deviceInfo?: string | null,
    userAgent?: string | null,
    isActive?: boolean | null,
    id: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteUserActivitySubscriptionVariables = {
  filter?: ModelSubscriptionUserActivityFilterInput | null,
  owner?: string | null,
};

export type OnDeleteUserActivitySubscription = {
  onDeleteUserActivity?:  {
    __typename: "UserActivity",
    owner?: string | null,
    sessionId: string,
    startTime: string,
    endTime?: string | null,
    duration?: number | null,
    deviceInfo?: string | null,
    userAgent?: string | null,
    isActive?: boolean | null,
    id: string,
    createdAt: string,
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
    email: string,
    deletedAt: string,
    originalUserId?: string | null,
    subscriptionStatus?: string | null,
    deletionReason?: string | null,
    id: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnUpdateDeletedUserEmailSubscriptionVariables = {
  filter?: ModelSubscriptionDeletedUserEmailFilterInput | null,
  owner?: string | null,
};

export type OnUpdateDeletedUserEmailSubscription = {
  onUpdateDeletedUserEmail?:  {
    __typename: "DeletedUserEmail",
    email: string,
    deletedAt: string,
    originalUserId?: string | null,
    subscriptionStatus?: string | null,
    deletionReason?: string | null,
    id: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnDeleteDeletedUserEmailSubscriptionVariables = {
  filter?: ModelSubscriptionDeletedUserEmailFilterInput | null,
  owner?: string | null,
};

export type OnDeleteDeletedUserEmailSubscription = {
  onDeleteDeletedUserEmail?:  {
    __typename: "DeletedUserEmail",
    email: string,
    deletedAt: string,
    originalUserId?: string | null,
    subscriptionStatus?: string | null,
    deletionReason?: string | null,
    id: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};
