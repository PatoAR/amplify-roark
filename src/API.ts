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
  id?: string | null,
};

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
  and?: Array< ModelArticleConditionInput | null > | null,
  or?: Array< ModelArticleConditionInput | null > | null,
  not?: ModelArticleConditionInput | null,
  createdAt?: ModelStringInput | null,
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
  id: string,
  createdAt: string,
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
  id?: ModelIDInput | null,
  createdAt?: ModelStringInput | null,
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
  id?: ModelSubscriptionIDInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
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
    id: string,
    createdAt: string,
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
    id: string,
    createdAt: string,
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
    id: string,
    createdAt: string,
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
    id: string,
    createdAt: string,
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
      id: string,
      createdAt: string,
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
    id: string,
    createdAt: string,
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
    id: string,
    createdAt: string,
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
    id: string,
    createdAt: string,
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
