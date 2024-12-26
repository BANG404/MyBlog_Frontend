'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, getCurrentUser  } from '@/lib/api'
import { LoginRequest, UserInfo } from '@/lib/types'

type AuthContextType = {
  isLoggedIn: boolean
  user: UserInfo | null
  login: (credentials: LoginRequest) => Promise<boolean>
  logout: () => void
  updateUser: (info: Partial<UserInfo>) => void
  refreshUserInfo: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)

  // 初始化时检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      refreshUserInfo()
    }
  }, [])

  // 刷新用户信息
  const refreshUserInfo = async () => {
    try {
      const userInfo = await getCurrentUser()
      setUser(userInfo)
      setIsLoggedIn(true)
    } catch (error) {
      console.error('Failed to refresh user info:', error)
      handleLogout()
    }
  }

  const handleLogin = async (credentials: LoginRequest) => {
    try {
      const response = await apiLogin(credentials)
      if (response.token && response.userInfo) {
        setUser(response.userInfo)
        setIsLoggedIn(true)
        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setUser(null)
  }

  const updateUser = (info: Partial<UserInfo>) => {
    if (user) {
      setUser({ ...user, ...info })
    }
    
  }

  return (
    <AuthContext.Provider 
      value={{ 
        isLoggedIn, 
        user, 
        login: handleLogin, 
        logout: handleLogout,
        updateUser,
        refreshUserInfo
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

