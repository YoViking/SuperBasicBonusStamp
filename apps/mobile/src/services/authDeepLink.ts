import * as Linking from 'expo-linking';
import { supabase } from '../db/supabase';

export interface AuthUrlResult {
  handled: boolean;
  success?: boolean;
  error?: string;
  type?: string;
}

/**
 * Returns the deep link URL to use as emailRedirectTo in Supabase Auth calls.
 * In Expo Go, this produces an exp:// URL.
 * In standalone / production builds, it produces a bonusstamp:// URL.
 */
export function getAuthRedirectUrl(): string {
  try {
    return Linking.createURL('/');
  } catch (err) {
    return 'bonusstamp://';
  }
}

/**
 * Extracts key-value parameters from both query parameters (?foo=bar) and
 * hash fragments (#foo=bar).
 */
export function extractUrlParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (!url) return params;

  try {
    const queryIndex = url.indexOf('?');
    const hashIndex = url.indexOf('#');

    // Parse query parameters if present
    if (queryIndex !== -1) {
      const end = hashIndex !== -1 && hashIndex > queryIndex ? hashIndex : url.length;
      const queryString = url.substring(queryIndex + 1, end);
      queryString.split('&').forEach((part) => {
        const [k, v] = part.split('=');
        if (k) {
          try {
            params[decodeURIComponent(k)] = decodeURIComponent(v || '');
          } catch {
            params[k] = v || '';
          }
        }
      });
    }

    // Parse hash fragments if present
    if (hashIndex !== -1) {
      const hashString = url.substring(hashIndex + 1);
      hashString.split('&').forEach((part) => {
        const [k, v] = part.split('=');
        if (k) {
          try {
            params[decodeURIComponent(k)] = decodeURIComponent(v || '');
          } catch {
            params[k] = v || '';
          }
        }
      });
    }
  } catch (e) {
    // Graceful fallback
  }

  return params;
}

/**
 * Inspects an incoming deep link URL and, if it contains Supabase authentication
 * tokens or codes, establishes the Supabase session.
 */
export async function handleAuthUrl(url: string): Promise<AuthUrlResult> {
  if (!url) {
    return { handled: false };
  }

  const params = extractUrlParams(url);

  // Check for error parameters returned from Supabase
  if (params.error || params.error_description) {
    const errorMsg =
      params.error_description || params.error || 'Authentication error from link';
    return {
      handled: true,
      success: false,
      error: errorMsg.replace(/\+/g, ' '),
    };
  }

  // 1. PKCE flow: code in query parameter
  if (params.code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
      if (error) {
        return {
          handled: true,
          success: false,
          error: error.message,
        };
      }
      return {
        handled: true,
        success: Boolean(data.session),
        type: params.type,
      };
    } catch (err: any) {
      return {
        handled: true,
        success: false,
        error: err?.message || 'Kunde inte slutföra inloggningen med koden.',
      };
    }
  }

  // 2. Implicit flow: access_token and refresh_token in hash fragment
  if (params.access_token && params.refresh_token) {
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      });
      if (error) {
        return {
          handled: true,
          success: false,
          error: error.message,
        };
      }
      return {
        handled: true,
        success: Boolean(data.session),
        type: params.type,
      };
    } catch (err: any) {
      return {
        handled: true,
        success: false,
        error: err?.message || 'Kunde inte sätta session från länken.',
      };
    }
  }

  return { handled: false };
}

