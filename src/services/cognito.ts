import { CognitoUserPool } from "amazon-cognito-identity-js"

const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID

if (!userPoolId || !clientId) {
  console.warn("Cognito user pool configuration is missing. Authentication will not function correctly.")
}

export const userPool = new CognitoUserPool({
  UserPoolId: userPoolId ?? "",
  ClientId: clientId ?? "",
})
