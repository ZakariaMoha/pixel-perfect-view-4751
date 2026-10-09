import { getSupabaseClient } from "./supabase/client";

export async function signInWithMagicLink(email: string) {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    throw new Error("Email is required.");
  }

  const { data, error } = await getSupabaseClient().auth.signInWithOtp({
    email: trimmedEmail,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await getSupabaseClient().auth.signOut();

  if (error) {
    throw error;
  }
}

export async function getSession() {
  const { data, error } = await getSupabaseClient().auth.getSession();

  if (error) {
    throw error;
  }

  return data;
}

export async function getUser() {
  const { data, error } = await getSupabaseClient().auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
}
