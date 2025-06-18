/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type Article = {
  __typename: "Article",
  companies?: string | null,
  createdAt: string,
  id: string,
  industry?: string | null,
  link?: string | null,
  source: string,
  summary?: string | null,
  timestamp?: string | null,
  title: string,
  ttl?: number | null,
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

export type ModelArticleFilterInput = {
  and?: Array< ModelArticleFilterInput | null > | null,
  companies?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  id?: ModelIDInput | null,
  industry?: ModelStringInput | null,
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

export type ModelArticleConditionInput = {
  and?: Array< ModelArticleConditionInput | null > | null,
  companies?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  industry?: ModelStringInput | null,
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
  id?: string | null,
  industry?: string | null,
  link?: string | null,
  source: string,
  summary?: string | null,
  timestamp?: string | null,
  title: string,
  ttl?: number | null,
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
};

export type DeleteArticleInput = {
  id: string,
};

export type DeleteUserProfileInput = {
  id: string,
};

export type UpdateArticleInput = {
  companies?: string | null,
  id: string,
  industry?: string | null,
  link?: string | null,
  source?: string | null,
  summary?: string | null,
  timestamp?: string | null,
  title?: string | null,
  ttl?: number | null,
};

export type UpdateUserProfileInput = {
  countryPreferences?: Array< string | null > | null,
  id: string,
  industryPreferences?: Array< string | null > | null,
};

export type ModelSubscriptionArticleFilterInput = {
  and?: Array< ModelSubscriptionArticleFilterInput | null > | null,
  companies?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  industry?: ModelSubscriptionStringInput | null,
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

export type GetArticleQueryVariables = {
  id: string,
};

export type GetArticleQuery = {
  getArticle?:  {
    __typename: "Article",
    companies?: string | null,
    createdAt: string,
    id: string,
    industry?: string | null,
    link?: string | null,
    source: string,
    summary?: string | null,
    timestamp?: string | null,
    title: string,
    ttl?: number | null,
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
      createdAt: string,
      id: string,
      industry?: string | null,
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

export type CreateArticleMutationVariables = {
  condition?: ModelArticleConditionInput | null,
  input: CreateArticleInput,
};

export type CreateArticleMutation = {
  createArticle?:  {
    __typename: "Article",
    companies?: string | null,
    createdAt: string,
    id: string,
    industry?: string | null,
    link?: string | null,
    source: string,
    summary?: string | null,
    timestamp?: string | null,
    title: string,
    ttl?: number | null,
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

export type DeleteArticleMutationVariables = {
  condition?: ModelArticleConditionInput | null,
  input: DeleteArticleInput,
};

export type DeleteArticleMutation = {
  deleteArticle?:  {
    __typename: "Article",
    companies?: string | null,
    createdAt: string,
    id: string,
    industry?: string | null,
    link?: string | null,
    source: string,
    summary?: string | null,
    timestamp?: string | null,
    title: string,
    ttl?: number | null,
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

export type UpdateArticleMutationVariables = {
  condition?: ModelArticleConditionInput | null,
  input: UpdateArticleInput,
};

export type UpdateArticleMutation = {
  updateArticle?:  {
    __typename: "Article",
    companies?: string | null,
    createdAt: string,
    id: string,
    industry?: string | null,
    link?: string | null,
    source: string,
    summary?: string | null,
    timestamp?: string | null,
    title: string,
    ttl?: number | null,
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

export type OnCreateArticleSubscriptionVariables = {
  filter?: ModelSubscriptionArticleFilterInput | null,
};

export type OnCreateArticleSubscription = {
  onCreateArticle?:  {
    __typename: "Article",
    companies?: string | null,
    createdAt: string,
    id: string,
    industry?: string | null,
    link?: string | null,
    source: string,
    summary?: string | null,
    timestamp?: string | null,
    title: string,
    ttl?: number | null,
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

export type OnDeleteArticleSubscriptionVariables = {
  filter?: ModelSubscriptionArticleFilterInput | null,
};

export type OnDeleteArticleSubscription = {
  onDeleteArticle?:  {
    __typename: "Article",
    companies?: string | null,
    createdAt: string,
    id: string,
    industry?: string | null,
    link?: string | null,
    source: string,
    summary?: string | null,
    timestamp?: string | null,
    title: string,
    ttl?: number | null,
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

export type OnUpdateArticleSubscriptionVariables = {
  filter?: ModelSubscriptionArticleFilterInput | null,
};

export type OnUpdateArticleSubscription = {
  onUpdateArticle?:  {
    __typename: "Article",
    companies?: string | null,
    createdAt: string,
    id: string,
    industry?: string | null,
    link?: string | null,
    source: string,
    summary?: string | null,
    timestamp?: string | null,
    title: string,
    ttl?: number | null,
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
