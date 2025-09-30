import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react"
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserSession,
} from "amazon-cognito-identity-js"

import { userPool } from "@/services/cognito"
import { AuthContext, type AuthContextValue, type AuthUser, type SignUpPayload } from "./AuthContext"

const collectAttributes = (cognitoUser: CognitoUser) =>
  new Promise<Record<string, string>>((resolve, reject) => {
    cognitoUser.getUserAttributes((err, attributes) => {
      if (err) {
        reject(err)
        return
      }

      const mapped = Object.fromEntries(
        (attributes ?? []).map((attribute: CognitoUserAttribute) => [attribute.getName(), attribute.getValue()])
      )

      resolve(mapped)
    })
  })

const requireSession = (cognitoUser: CognitoUser) =>
  new Promise<CognitoUserSession>((resolve, reject) => {
    cognitoUser.getSession((err:Error | null, session:CognitoUserSession|null) => {
      if (err || !session) {
        reject(err ?? new Error("Session unavailable"))
        return
      }

      resolve(session)
    })
  })

const mapToAuthUser = async (cognitoUser: CognitoUser): Promise<AuthUser> => {
  const attributes = await collectAttributes(cognitoUser)

  return {
    username: cognitoUser.getUsername(),
    email: attributes.email,
    attributes,
    raw: cognitoUser,
  }
}

type AuthProviderProps = {
  children: ReactNode
}

const isPoolConfigured = () => Boolean(userPool?.getClientId?.() && userPool?.getUserPoolId?.())

const createCognitoUser = (username: string) => new CognitoUser({ Username: username, Pool: userPool })

const createEmailAttribute = (email: string) => new CognitoUserAttribute({ Name: "email", Value: email })

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadUser = useCallback(async () => {
    if (!isPoolConfigured()) {
      console.warn("Cognito user pool configuration is missing. Authentication features are disabled.")
      setUser(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      const currentUser = userPool.getCurrentUser()
      if (!currentUser) {
        setUser(null)
        return
      }

      const session = await requireSession(currentUser)
      if (!session.isValid()) {
        currentUser.signOut()
        setUser(null)
        return
      }

      const authUser = await mapToAuthUser(currentUser)
      setUser(authUser)
    } catch (error) {
      console.warn("Failed to load Cognito session", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadUser()
  }, [loadUser])

  const getToken = useCallback(async () => {
    if (!isPoolConfigured()) {
      throw new Error("Cognito user pool is not configured.")
    }
  
    const currentUser = userPool.getCurrentUser()
    if (!currentUser) {
      throw new Error("No current user")
    }
  
    const session = await requireSession(currentUser)
  
    // you can return access or id token depending on your API Gateway authorizer
    return {
      idToken: session.getIdToken().getJwtToken(),
      accessToken: session.getAccessToken().getJwtToken(),
      refreshToken: session.getRefreshToken().getToken(),
    }
  }, [])
  

  const signIn = useCallback(async (username: string, password: string) => {
    if (!isPoolConfigured()) {
      throw new Error("Cognito user pool is not configured.")
    }

    const authenticationDetails = new AuthenticationDetails({ Username: username, Password: password })
    const cognitoUser = createCognitoUser(username)

    await new Promise<void>((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: async () => {
          try {
            const authUser = await mapToAuthUser(cognitoUser)
            setUser(authUser)
            resolve()
          } catch (error) {
            reject(error)
          }
        },
        onFailure: reject,
        newPasswordRequired: () => {
          reject(new Error("NEW_PASSWORD_REQUIRED"))
        },
      })
    })
  }, [])

  const signUp = useCallback(async ({ email, password }: SignUpPayload) => {
    if (!isPoolConfigured()) {
      throw new Error("Cognito user pool is not configured.")
    }

    await new Promise<void>((resolve, reject) => {
      userPool.signUp(email, password, [createEmailAttribute(email)], [], (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }, [])

  const confirmSignUp = useCallback(async (username: string, code: string) => {
    if (!isPoolConfigured()) {
      throw new Error("Cognito user pool is not configured.")
    }

    const cognitoUser = createCognitoUser(username)

    await new Promise<void>((resolve, reject) => {
      cognitoUser.confirmRegistration(code, true, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }, [])

  const resendConfirmationCode = useCallback(async (username: string) => {
    if (!isPoolConfigured()) {
      throw new Error("Cognito user pool is not configured.")
    }

    const cognitoUser = createCognitoUser(username)

    await new Promise<void>((resolve, reject) => {
      cognitoUser.resendConfirmationCode((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }, [])

  const signOut = useCallback(async () => {
    if (!isPoolConfigured()) {
      setUser(null)
      return
    }

    const currentUser = userPool.getCurrentUser()
    if (currentUser) {
      currentUser.signOut()
    }
    setUser(null)
  }, [])

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      isLoading,
      signIn,
      signOut,
      signUp,
      confirmSignUp,
      resendConfirmationCode,
      refreshUser: loadUser,
      getToken
    }),
    [user, isLoading, signIn, signOut, signUp, confirmSignUp, resendConfirmationCode, loadUser,getToken]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
