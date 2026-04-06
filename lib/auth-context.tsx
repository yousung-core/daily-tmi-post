"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "./supabase-browser";
import type { User } from "@supabase/supabase-js";
import type { UserProfile, UserProfileRow } from "./types";

type OAuthProvider = "google" | "kakao" | "naver";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  isLoading: true,
  signInWithOAuth: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

function toUserProfile(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    nickname: row.nickname,
    avatarUrl: row.avatar_url ?? undefined,
    provider: row.provider,
    isBanned: row.is_banned,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) {
        const userProfile = toUserProfile(data as UserProfileRow);
        if (userProfile.isBanned) {
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          return;
        }
        setProfile(userProfile);
      }
    },
    [supabase]
  );

  useEffect(() => {
    const initialize = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (currentUser) {
        setUser(currentUser);
        await fetchProfile(currentUser.id);
      }
      setIsLoading(false);
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const signInWithOAuth = async (provider: OAuthProvider) => {
    const redirectTo = `${window.location.origin}/api/auth/callback`;
    // Naver는 Supabase 내장 프로바이더가 아니므로 custom OIDC 사용
    const supabaseProvider =
      provider === "naver" ? ("custom:naver" as const) : provider;
    await supabase.auth.signInWithOAuth({
      provider: supabaseProvider,
      options: { redirectTo },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.refresh();
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, isLoading, signInWithOAuth, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
