import { useCallback } from "react"
import { useAuth } from "@/context/useAuth"

const API_URL = import.meta.env.VITE_API_URL

export function useApi() {
  const { getToken } = useAuth()

  const callApi = useCallback(
    async (path: string, options: RequestInit = {}) => {
      if (!API_URL) {
        throw new Error("API URL is not set")
      }
      const {idToken} = await getToken()
      const response = await fetch(`${API_URL}${path}`, {
        method: options.method ?? "GET",
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
      })

      if (!response.ok) {
        const message = await response.text().catch(() => "")
        throw new Error(message || `API error: ${response.status}`)
      }

      if (response.status === 204) {
        return null
      }

      try {
        return await response.json()
      } catch {
        return null
      }
    },
    [ getToken]
  )

  return { callApi }
}
