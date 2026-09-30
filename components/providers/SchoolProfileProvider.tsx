"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  SchoolProfile,
  DEFAULT_SCHOOL_PROFILE,
  schoolProfileService,
} from "@/lib/services/schoolProfileService";

interface SchoolProfileContextType {
  schoolProfile: SchoolProfile;
  isLoading: boolean;
  updateProfile: (profile: SchoolProfile) => Promise<{ success: boolean; partial?: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const SchoolProfileContext = createContext<SchoolProfileContextType>({
  schoolProfile: DEFAULT_SCHOOL_PROFILE,
  isLoading: true,
  updateProfile: async () => ({ success: false }),
  refreshProfile: async () => {},
});

export function SchoolProfileProvider({ children }: { children: React.ReactNode }) {
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(DEFAULT_SCHOOL_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await schoolProfileService.getProfile();
      setSchoolProfile(data);
    } catch (err) {
      console.warn("Could not load school profile:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const updateProfile = async (newProfile: SchoolProfile) => {
    const res = await schoolProfileService.updateProfile(newProfile);
    if (res.success && res.data) {
      setSchoolProfile(res.data);
      return { success: true, partial: res.data.partial };
    }
    // Not saved: keep showing what is actually stored.
    return { success: false, error: res.error };
  };

  return (
    <SchoolProfileContext.Provider
      value={{
        schoolProfile,
        isLoading,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </SchoolProfileContext.Provider>
  );
}

export function useSchoolProfile() {
  const context = useContext(SchoolProfileContext);
  if (!context) {
    throw new Error("useSchoolProfile must be used within a SchoolProfileProvider");
  }
  return context;
}
