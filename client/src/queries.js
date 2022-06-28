import { gql } from '@apollo/client';

export const GET_USERS = gql`query Users {
    getUsers {
      username
    }
}`

export const LOGIN = gql`query Login($username: String!, $password: String!) {
    login(username: $username, password: $password)
}`

