"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type UserPreferences = {
  location_pref_str: string
  budget_pref: number
  amenities_pref: string[]
  property_type_pref_str: string
  travel_frequency_score: number
}

type PreferencesContextType = {
  preferences: UserPreferences | null
  setPreferences: (preferences: UserPreferences) => void
  hasCompletedOnboarding: boolean
  setHasCompletedOnboarding: (completed: boolean) => void
  clearPreferences: () => void
}

const defaultPreferences: UserPreferences = {
  location_pref_str: "",
  budget_pref: 1000000,
  amenities_pref: [],
  property_type_pref_str: "",
  travel_frequency_score: 0.5,
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferencesState] = useState<UserPreferences | null>(null)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false)

  // Load preferences from localStorage on mount
  useEffect(() => {
    const storedPreferences = localStorage.getItem("userPreferences")
    const onboardingCompleted = localStorage.getItem("onboardingCompleted")

    if (storedPreferences) {
      try {
        setPreferencesState(JSON.parse(storedPreferences))
      } catch (e) {
        console.error("Failed to parse stored preferences:", e)
        setPreferencesState(null)
      }
    }

    if (onboardingCompleted === "true") {
      setHasCompletedOnboarding(true)
    }
  }, [])

  // Save preferences to localStorage when they change
  useEffect(() => {
    if (preferences) {
      localStorage.setItem("userPreferences", JSON.stringify(preferences))
    }
  }, [preferences])

  // Save onboarding status to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("onboardingCompleted", hasCompletedOnboarding.toString())
  }, [hasCompletedOnboarding])

  const setPreferences = (newPreferences: UserPreferences) => {
    setPreferencesState(newPreferences)
  }

  const clearPreferences = () => {
    setPreferencesState(null)
    localStorage.removeItem("userPreferences")
    setHasCompletedOnboarding(false)
    localStorage.removeItem("onboardingCompleted")
  }

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        setPreferences,
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
        clearPreferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider")
  }
  return context
}
