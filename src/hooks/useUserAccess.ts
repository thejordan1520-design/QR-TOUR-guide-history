import { useState, useEffect } from 'react'
import { userAccessService, UserAccessInfo } from '../services/userAccessService'

export interface UseUserAccessReturn {
  hasAudioAccess: boolean
  userInfo: UserAccessInfo | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook para verificar acceso a audios del usuario actual
 * @returns UseUserAccessReturn
 */
export function useUserAccess(): UseUserAccessReturn {
  const [hasAudioAccess, setHasAudioAccess] = useState<boolean>(false)
  const [userInfo, setUserInfo] = useState<UserAccessInfo | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const checkAccess = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const accessInfo = await userAccessService.getCurrentUserAccessInfo()
      
      if (accessInfo) {
        setUserInfo(accessInfo)
        setHasAudioAccess(accessInfo.hasAudioAccess)
      } else {
        setUserInfo(null)
        setHasAudioAccess(false)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      setHasAudioAccess(false)
      setUserInfo(null)
    } finally {
      setIsLoading(false)
    }
  }

  const refresh = async () => {
    await checkAccess()
  }

  useEffect(() => {
    checkAccess()
  }, [])

  return {
    hasAudioAccess,
    userInfo,
    isLoading,
    error,
    refresh
  }
}

/**
 * Hook para verificar acceso de un usuario específico por email
 * @param userEmail - Email del usuario a verificar
 * @returns UseUserAccessReturn
 */
export function useUserAccessByEmail(userEmail: string): UseUserAccessReturn {
  const [hasAudioAccess, setHasAudioAccess] = useState<boolean>(false)
  const [userInfo, setUserInfo] = useState<UserAccessInfo | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const checkAccess = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const accessInfo = await userAccessService.getUserAccessInfo(userEmail)
      
      if (accessInfo) {
        setUserInfo(accessInfo)
        setHasAudioAccess(accessInfo.hasAudioAccess)
      } else {
        setUserInfo(null)
        setHasAudioAccess(false)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      setHasAudioAccess(false)
      setUserInfo(null)
    } finally {
      setIsLoading(false)
    }
  }

  const refresh = async () => {
    await checkAccess()
  }

  useEffect(() => {
    if (userEmail) {
      checkAccess()
    }
  }, [userEmail])

  return {
    hasAudioAccess,
    userInfo,
    isLoading,
    error,
    refresh
  }
}

/**
 * Hook para obtener todos los usuarios con sus planes
 * @returns { users: UserAccessInfo[], isLoading: boolean, error: string | null, refresh: () => Promise<void> }
 */
export function useAllUsersAccess() {
  const [users, setUsers] = useState<UserAccessInfo[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const checkAllUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const allUsers = await userAccessService.getAllUsersWithPlans()
      setUsers(allUsers)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const refresh = async () => {
    await checkAllUsers()
  }

  useEffect(() => {
    checkAllUsers()
  }, [])

  return {
    users,
    isLoading,
    error,
    refresh
  }
}
