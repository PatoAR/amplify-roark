/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type Article = {
  __typename: "Article",
  companies?: string | null,
  countries?: string | null,
  createdAt: string,
  id: string,
  industry?: string | null,
  language?: string | null,
  link?: string | null,
  source: string,
  summary?: string | null,
  timestamp?: string | null,
  title: string,
  ttl?: number | null,
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


export type ModelArticleFilterInput = {
  and?: Array< ModelArticleFilterInput | null > | null,
  companies?: ModelStringInput | null,
  countries?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  id?: ModelIDInput | null,
  industry?: ModelStringInput | null,
  language?: ModelStringInput | null,
  link?: ModelStringInput | null,
  not?: ModelArticleFilterInput | null,
  or?: Array< ModelArticleFilterInput | null > | null,
  source?: ModelStringInput | null,
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

export type ModelArticleConnection = {
  __typename: "ModelArticleConnection",
  items:  Array<Article | null >,
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
  companies?: ModelStringInput | null,
  countries?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  industry?: ModelStringInput | null,
  language?: ModelStringInput | null,
  link?: ModelStringInput | null,
  not?: ModelArticleConditionInput | null,
  or?: Array< ModelArticleConditionInput | null > | null,
  source?: ModelStringInput | null,
  summary?: ModelStringInput | null,
  timestamp?: ModelStringInput | null,
  title?: ModelStringInput | null,
  ttl?: ModelIntInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateArticleInput = {
  companies?: string | null,
  countries?: string | null,
  id?: string | null,
  industry?: string | null,
  language?: string | null,
  link?: string | null,
  source: string,
  summary?: string | null,
  timestamp?: string | null,
  title: string,
  ttl?: number | null,
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

export type DeleteReferralInput = {
  id: string,
};

export type DeleteReferralCodeInput = {
  id: string,
};

export type DeleteUserProfileInput = {
  id: string,
};

export type DeleteUserSubscriptionInput = {
  id: string,
};

export type UpdateArticleInput = {
  companies?: string | null,
  countries?: string | null,
  id: string,
  industry?: string | null,
  language?: string | null,
  link?: string | null,
  source?: string | null,
  summary?: string | null,
  timestamp?: string | null,
  title?: string | null,
  ttl?: number | null,
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

export type UpdateUserProfileInput = {
  countryPreferences?: Array< string | null > | null,
  id: string,
  industryPreferences?: Array< string | null > | null,
  owner?: string | null,
};

export type UpdateUserSubscriptionInput = {
  earnedFreeMonths?: number | null,
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
  companies?: ModelSubscriptionStringInput | null,
  countries?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  industry?: ModelSubscriptionStringInput | null,
  language?: ModelSubscriptionStringInput | null,
  link?: ModelSubscriptionStringInput | null,
  or?: Array< ModelSubscriptionArticleFilterInput | null > | null,
  source?: ModelSubscriptionStringInput | null,
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
    companies?: string | null,
    countries?: string | null,
    createdAt: string,
    id: string,
    industry?: string | null,
    language?: string | null,
    link?: string | null,
    source: string,
    summary?: string | null,
    timestamp?: string | null,
    title: string,
    ttl?: number | null,
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
      companies?: string | null,
      countries?: string | null,
      createdAt: string,
      id: string,
      industry?: string | null,
      language?: string | null,
      link?: string | null,
      source: string,
      summary?: string | null,
      timestamp?: string | null,
      title: string,
      ttl?: number | null,
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
    companies?: string | null,
    countries?: string | null,
    createdAt: string,
    id: string,
    industry?: string | null,
    language?: string | null,
    link?: string | null,
    source: string,
    summary?: string | null,
    timestamp?: string | null,
    title: string,
    ttl?: number | null,
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
    companies?: string | null,
    countries?: string | null,
    createdAt: string,
    id: string,
    industry?: string | null,
    language?: string | null,
    link?: string | null,
    source: string,
    summary?: string | null,
    timestamp?: string | null,
    title: string,
    ttl?: number | null,
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
    companies?: string | null,
    countries?: string | null,
    createdAt: string,
    id: string,
    industry?: string | null,
    language?: string | null,
    link?: string | null,
    source: string,
    summary?: string | null,
    timestamp?: string | null,
    title: string,
    ttl?: number | null,
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

export type OnCreateArticleSubscriptionVariables = {
  filter?: ModelSubscriptionArticleFilterInput | null,
};

export type OnCreateArticleSubscription = {
  onCreateArticle?:  {
    __typename: "Article",
    companies?: string | null,
    countries?: string | null,
    createdAt: string,
    id: string,
    industry?: string | null,
    language?: string | null,
    link?: string | null,
    source: string,
    summary?: string | null,
    timestamp?: string | null,
    title: string,
    ttl?: number | null,
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
    companies?: string | null,
    countries?: string | null,
    createdAt: string,
    id: string,
    industry?: string | null,
    language?: string | null,
    link?: string | null,
    source: string,
    summary?: string | null,
    timestamp?: string | null,
    title: string,
    ttl?: number | null,
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
    companies?: string | null,
    countries?: string | null,
    createdAt: string,
    id: string,
    industry?: string | null,
    language?: string | null,
    link?: string | null,
    source: string,
    summary?: string | null,
    timestamp?: string | null,
    title: string,
    ttl?: number | null,
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
