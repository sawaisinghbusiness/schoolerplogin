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
  /** The profile loaded and has been saved with a school name: official documents may print. */
  ready: boolean;
  /** Why it is not ready: the server failed, or the profile was never saved. */
  notReadyReason: string | null;
  updateProfile: (profile: SchoolProfile) => Promise<{ success: boolean; partial?: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const SchoolProfileContext = createContext<SchoolProfileContextType>({
  schoolProfile: DEFAULT_SCHOOL_PROFILE,
  isLoading: true,
  ready: false,
  notReadyReason: null,
  updateProfile: async () => ({ success: false }),
  refreshProfile: async () => {},
});

export function SchoolProfileProvider({ children }: { children: React.ReactNode }) {
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(DEFAULT_SCHOOL_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    try {
      const { saved: isSaved, setupNeeded: _setup, loadError: failed, ...data } = await schoolProfileService.getProfile();
      setSchoolProfile(data);
      setSaved(!!isSaved);
      setLoadError(failed || null);
    } catch (err) {
      console.warn("Could not load school profile:", err);
      setLoadError("Could not load the school details.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // The browser tab carries the name from ERP Settings ("St. Paul School | SchoolDesk ERP").
  useEffect(() => {
    if (!isLoading && schoolProfile.school_name) document.title = `${schoolProfile.school_name} | SchoolDesk ERP`;
  }, [isLoading, schoolProfile.school_name]);

  const updateProfile = async (newProfile: SchoolProfile) => {
    const res = await schoolProfileService.updateProfile(newProfile);
    if (res.success && res.data) {
      setSchoolProfile(res.data);
      setSaved(true);
      setLoadError(null);
      return { success: true, partial: res.data.partial };
    }
    // Not saved: keep showing what is actually stored.
    return { success: false, error: res.error };
  };

  const ready = !isLoading && !loadError && saved && !!schoolProfile.school_name.trim();
  const notReadyReason = isLoading || ready ? null : loadError ? `${loadError} Official documents are held back so they never print with missing or wrong school details.` : "The school details have not been saved yet. Fill in Settings > School (name, affiliation number, school code, address) before printing official documents.";

  return (
    <SchoolProfileContext.Provider
      value={{
        schoolProfile,
        isLoading,
        ready,
        notReadyReason,
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
