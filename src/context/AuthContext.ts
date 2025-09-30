import { createContext } from "react"
import type { CognitoUser } from "amazon-cognito-identity-js"

type AuthAttributes = Record<string, string>

export type AuthUser = {
  username: string
  email?: string
  attributes: AuthAttributes
  raw: CognitoUser
}

export type SignUpPayload = {
  email: string
  password: string
}

export type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signUp: (payload: SignUpPayload) => Promise<void>
  confirmSignUp: (username: string, code: string) => Promise<void>
  resendConfirmationCode: (username: string) => Promise<void>
  refreshUser: () => Promise<void>
  getToken: () => Promise<{ idToken: string; accessToken: string; refreshToken: string }>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
