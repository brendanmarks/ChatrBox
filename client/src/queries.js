import { gql } from '@apollo/client';

export const GET_USERS = gql`query Users {
    getUsers {
      username
    }
}`

export const GET_USER_CONVERSATIONS = gql`query GetUserConversations($username: String!) {
  getUserConversations(username: $username) {
      _id
      members
      messages {
        content
        sender
        datetime
      }
  }
}`

export const LOGIN = gql`query Login($username: String!, $password: String!) {
    login(username: $username, password: $password)
}`

