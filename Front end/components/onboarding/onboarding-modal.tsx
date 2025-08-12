"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { usePreferences } from "@/contexts/preferences-context"
import { OnboardingStep1 } from "./onboarding-step1"
import { OnboardingStep2 } from "./onboarding-step2"
import { OnboardingStep3 } from "./onboarding-step3"
import { OnboardingStep4 } from "./onboarding-step4"
import ApiService from "@/lib/ApiService"
import type { UserPreferences } from "@/contexts/preferences-context"

export function OnboardingModal() {
  const { preferences, setPreferences, hasCompletedOnboarding, setHasCompletedOnboarding } = usePreferences()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<UserPreferences>({
    location_pref_str: "",
    budget_pref: 1000000,
    amenities_pref: [],
    property_type_pref_str: "HOTEL",
    travel_frequency_score: 0.5,
  })

  useEffect(() => {
    // Show the onboarding modal if the user hasn't completed it and isn't logged in
    if (!hasCompletedOnboarding && !ApiService.isAuthenticated()) {
      // Add a small delay to prevent the modal from showing immediately on page load
      const timer = setTimeout(() => {
        setOpen(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [hasCompletedOnboarding])

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSkip = () => {
    setHasCompletedOnboarding(true)
    setOpen(false)
  }

  const handleComplete = async () => {
    // Save the preferences
    setPreferences(formData)
    setHasCompletedOnboarding(true)
    setOpen(false)
  }

  const updateFormData = (data: Partial<UserPreferences>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {step === 1 && "Welcome to Travel Booking!"}
            {step === 2 && "What's your budget?"}
            {step === 3 && "What amenities do you prefer?"}
            {step === 4 && "What type of accommodation do you like?"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {step === 1 && <OnboardingStep1 formData={formData} updateFormData={updateFormData} />}
          {step === 2 && <OnboardingStep2 formData={formData} updateFormData={updateFormData} />}
          {step === 3 && <OnboardingStep3 formData={formData} updateFormData={updateFormData} />}
          {step === 4 && <OnboardingStep4 formData={formData} updateFormData={updateFormData} />}
        </div>

        <div className="flex justify-between mt-6">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
            <Button onClick={handleNext}>{step === 4 ? "Complete" : "Next"}</Button>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`h-2 w-2 rounded-full ${s === step ? "bg-primary" : "bg-gray-300"}`}></div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
