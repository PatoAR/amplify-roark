/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
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
    createdAt
    id
    industry
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
export const deleteArticle = /* GraphQL */ `mutation DeleteArticle(
  $condition: ModelArticleConditionInput
  $input: DeleteArticleInput!
) {
  deleteArticle(condition: $condition, input: $input) {
    companies
    createdAt
    id
    industry
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
export const updateArticle = /* GraphQL */ `mutation UpdateArticle(
  $condition: ModelArticleConditionInput
  $input: UpdateArticleInput!
) {
  updateArticle(condition: $condition, input: $input) {
    companies
    createdAt
    id
    industry
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
