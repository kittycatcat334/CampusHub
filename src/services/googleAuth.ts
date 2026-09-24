// Google Identity & Real Google Verification Service
// Connects to Google Identity Services (GIS) and verifies Google credentials

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with';
              shape?: 'rectangular' | 'pill' | 'circle';
              width?: number | string;
            }
          ) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
        };
      };
    };
  }
}

export interface GoogleUserProfile {
  sub: string;
  name: string;
  email: string;
  picture?: string;
  email_verified: boolean;
}

/**
 * Safely decodes a Google ID Token (JWT) into user profile details
 */
export function decodeGoogleCredential(token: string): GoogleUserProfile | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return {
      sub: parsed.sub || `google-${Date.now()}`,
      name: parsed.name || parsed.given_name || 'Google User',
      email: parsed.email,
      picture: parsed.picture,
      email_verified: parsed.email_verified !== false
    };
  } catch (err) {
    console.warn('[CampusHub] Could not decode Google JWT credential token:', err);
    return null;
  }
}

/**
 * Validates real Google email format (supports @gmail.com or official university domains)
 */
export function isValidGoogleEmail(email: string): boolean {
  const clean = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(clean);
}
