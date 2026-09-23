import { supabase } from './supabaseClient';

const requireSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  return supabase;
};

export const getCurrentAuthSession = async () => {
  const client = requireSupabase();
  const { data, error } = await client.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
};

export const getCurrentAuthUser = async () => {
  const client = requireSupabase();
  const { data, error } = await client.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
};

export const signInAdmin = async (email, password) => {
  const client = requireSupabase();

  const { data, error } = await client.auth.signInWithPassword({
    email: String(email || '').trim(),
    password: String(password || '')
  });

  if (error) {
    throw error;
  }

  return data;
};

export const signOutAuth = async () => {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();

  if (error) {
    throw error;
  }
};

export const subscribeToAuthChanges = (callback) => {
  const client = requireSupabase();

  const {
    data: { subscription }
  } = client.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return subscription;
};
