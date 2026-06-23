import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "./supabase";

export type Profile = {
  id: string;
  full_name: string;
  phone_last4: string;
  created_at: string;
  updated_at: string;
};

type IdentificationState = {
  profile: Profile | null;
  loading: boolean;
  identify: (fullName: string, phoneLast4: string) => Promise<Profile | null>;
  setProfile: (p: Profile) => void;
  clearIdentification: () => void;
};

const PROFILE_STORAGE_KEY = "vnexus.profile.v1";

const IdentificationContext = createContext<IdentificationState | null>(null);

export function IdentificationProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Profile;
        setProfileState(parsed);
      } catch {
        localStorage.removeItem(PROFILE_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const setProfile = (p: Profile) => {
    console.log("[IDENTIFY] profile definido manualmente:", p.id);
    setProfileState(p);
    if (typeof window !== "undefined") {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(p));
    }
  };

  const identify = async (fullName: string, phoneLast4: string): Promise<Profile | null> => {
    const trimmedName = fullName.trim();
    const trimmedPhone = phoneLast4.trim();

    if (!trimmedName || !trimmedPhone) {
      console.warn("[IDENTIFY] nome ou telefone vazio");
      return null;
    }

    console.log("[IDENTIFY] buscando profile:", trimmedName, trimmedPhone);

    const { data: existingList, error: lookupError } = await supabase
      .from("profiles")
      .select("*")
      .eq("full_name", trimmedName)
      .eq("phone_last4", trimmedPhone);

    if (lookupError) {
      console.error("[IDENTIFY] erro na busca:", lookupError.message);
      return null;
    }

    if (existingList && existingList.length > 0) {
      const existing = existingList[0] as Profile;
      console.log("[IDENTIFY] perfil encontrado:", existing.id);
      setProfileState(existing);
      if (typeof window !== "undefined") {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(existing));
      }
      return existing;
    }

    console.log("[IDENTIFY] perfil não encontrado, criando...");

    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({ full_name: trimmedName, phone_last4: trimmedPhone })
      .select()
      .single();

    if (insertError) {
      console.error("[IDENTIFY] erro ao criar perfil:", insertError.message);
      return null;
    }

    if (newProfile) {
      const p = newProfile as Profile;
      console.log("[IDENTIFY] perfil criado:", p.id);
      setProfileState(p);
      if (typeof window !== "undefined") {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(p));
      }
      return p;
    }

    console.warn("[IDENTIFY] perfil não foi criado (resposta vazia)");
    return null;
  };

  const clearIdentification = () => {
    setProfileState(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    }
  };

  return (
    <IdentificationContext.Provider
      value={{ profile, loading, identify, setProfile, clearIdentification }}
    >
      {children}
    </IdentificationContext.Provider>
  );
}

export function useIdentification() {
  const ctx = useContext(IdentificationContext);
  if (!ctx) throw new Error("useIdentification must be used within IdentificationProvider");
  return ctx;
}
