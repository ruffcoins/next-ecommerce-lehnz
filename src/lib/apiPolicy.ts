/**
 * API Security Policy Constants
 * 
 * Centralizes the rules for API key usage and path visibility across the client.
 * This ensures that security logic is maintainable and consistent.
 */

export const API_KEY_PREFIXES = {
    PUBLISHABLE: 'lehnz_pk_',
    SECRET: 'lehnz_sk_',
} as const;

export const PUBLIC_API_PATHS = [
    '/events/ingest',
    '/recommend'
];

/**
 * Validates if the given key is safe for the current execution context.
 * 
 * PERFORMANCE: Fast string prefix checks.
 */
export const validateKeyForContext = (key: string | null, isServer: boolean): { isValid: boolean; error?: string } => {
    if (!key) return { isValid: false, error: 'API Key is missing' };

    const isSecretKey = key.startsWith(API_KEY_PREFIXES.SECRET);
    const isBrowser = typeof window !== 'undefined';

    // Rule 1: Never allow Secret Keys in the browser
    if (isBrowser && isSecretKey) {
        return {
            isValid: false,
            error: '[SECURITY] Secret Key (sk_) detected in browser! This key must never be exposed.'
        };
    }

    // Rule 2: Warn if Publishable Key is used in server context (uncommon but allowed for some tasks)
    if (isServer && key.startsWith(API_KEY_PREFIXES.PUBLISHABLE)) {
        // We allow it but it might have limited scopes
        return { isValid: true };
    }

    return { isValid: true };
};
