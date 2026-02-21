import { v4 as uuidv4 } from 'uuid';

export type EventType = 'view' | 'click' | 'add_to_cart' | 'remove_from_cart' | 'checkout_start' | 'purchase' | 'search';

interface TrackEvent {
    eventType: EventType;
    productId: string;
    metadata?: Record<string, any>;
}

interface ItemPayload {
    item_id: string;
    item_type: string;
    attributes: Record<string, any>;
}

interface UserPayload {
    user_id: string;
    attributes: Record<string, any>;
}

import { validateKeyForContext } from './apiPolicy';

class RecoTracker {
    // Port 8001: Ingestion Service (lehnz-backend)
    private ingestionUrl = process.env.NEXT_PUBLIC_INGESTION_API_URL || "http://localhost:8001/api/v1";

    // Port 8000 (usually): Recommendation Engine
    private recommendationUrl = process.env.NEXT_PUBLIC_RECOMMENDATION_API_URL || "http://localhost:8000";

    // PUBLIC KEY: Safe for browser use. Starts with 'lehnz_pk_'
    private publishableKey = process.env.NEXT_PUBLIC_LEHNZ_PUBLISHABLE_KEY || '';

    // SECRET KEY: Only for server-side catalog sync. Starts with 'lehnz_sk_'
    private secretKey = process.env.LEHNZ_SECRET_KEY || '';

    private environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'dev';
    private domain = process.env.NEXT_PUBLIC_DOMAIN || 'ecommerce';

    /**
     * Generates authentication and context headers for API requests.
     *
     * SECURITY: Enforces strict key policy using validateKeyForContext.
     * In browser contexts, it explicitly prevents the usage of Secret Keys (sk_)
     * and fails safely by returning null/empty headers if a policy violation occurs.
     *
     * @private
     * @returns Headers object for axios/fetch
     */
    private getHeaders(isServerContext = false) {
        const key = isServerContext ? this.secretKey : this.publishableKey;
        const validation = validateKeyForContext(key, isServerContext);

        if (!validation.isValid) {
            console.error(`%c${validation.error}`, 'color: white; background: red; font-weight: bold; padding: 4px;');
            // Return dummy headers to prevent crashes while failing the request
            return {
                'Content-Type': 'application/json',
                'X-API-KEY': '',
                'X-Environment': this.environment,
                'X-Domain': this.domain,
            };
        }

        return {
            'Content-Type': 'application/json',
            'X-API-KEY': key,
            'X-Environment': this.environment,
            'X-Domain': this.domain,
        };
    }


    private getIdentity() {
        if (typeof window === 'undefined') return { userId: null, sessionId: null };

        let userId = localStorage.getItem('reco_user_id');
        let sessionId = sessionStorage.getItem('reco_session_id');

        if (!sessionId) {
            sessionId = uuidv4();
            sessionStorage.setItem('reco_session_id', sessionId);
        }

        return { userId, sessionId };
    }

    /**
     * track - SAFE CLIENT-SIDE TRACKING
     * Uses the Publishable Key to send events directly to the backend.
     * No proxy needed because the key is scoped only for events.
     */
    async track({ eventType, productId, metadata }: TrackEvent) {
        const { userId, sessionId } = this.getIdentity();

        if (!userId) {
            console.warn('⚡ [RecoTracker] Skipped: No userId found in localStorage.');
            return;
        }

        const payload = [
            {
                user_id: userId,
                item_id: productId,
                event_type: eventType,
                event_timestamp: new Date().toISOString(),
                context: {
                    session_id: sessionId,
                    page_url: typeof window !== 'undefined' ? window.location.href : '',
                },
                metadata: metadata || {},
            }
        ];

        console.log(`📡 [RecoTracker] Sending ${eventType} event...`, { productId, userId });

        try {
            const res = await fetch(`${this.ingestionUrl}/events/ingest`, {
                method: 'POST',
                headers: this.getHeaders(false),
                body: JSON.stringify(payload),
                keepalive: true,
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                console.error(`❌ [RecoTracker] Failed (${res.status}):`, errData);
            } else {
                console.log(`✅ [RecoTracker] ${eventType} tracked.`);
            }
            return res;
        } catch (err) {
            console.error('❌ [RecoTracker] Error:', err);
        }
    }

    /**
     * upsertItems - SERVER-SIDE ONLY
     * Uses the Secret Key for catalog management.
     */
    async upsertItems(items: ItemPayload[]) {
        try {
            return await fetch(`${this.ingestionUrl}/items/upsert`, {
                method: 'POST',
                headers: this.getHeaders(true),
                body: JSON.stringify(items),
            });
        } catch (err) {
            console.error('Upsert Items Failed:', err);
        }
    }

    /**
     * upsertUsers - SERVER-SIDE ONLY
     */
    async upsertUsers(users: UserPayload[]) {
        try {
            return await fetch(`${this.ingestionUrl}/users/upsert`, {
                method: 'POST',
                headers: this.getHeaders(true),
                body: JSON.stringify(users),
            });
        } catch (err) {
            console.error('Upsert Users Failed:', err);
        }
    }

    /**
     * trackBatch - SERVER-SIDE ONLY
     */
    async trackBatch(payload: { items?: ItemPayload[], users?: UserPayload[], events?: any[] }) {
        try {
            return await fetch(`${this.ingestionUrl}/ingest/batch`, {
                method: 'POST',
                headers: this.getHeaders(true),
                body: JSON.stringify(payload),
            });
        } catch (err) {
            console.error('Batch Ingestion Failed:', err);
        }
    }

    /**
     * getRecommendations - PUBLIC GET
     */
    async getRecommendations() {
        const { userId } = this.getIdentity();
        if (!userId) return null;

        try {
            const res = await fetch(`${this.recommendationUrl}/recommend?user_id=${userId}`, {
                method: 'GET',
                headers: this.getHeaders(false),
            });

            if (!res.ok) {
                console.warn('Failed to fetch recommendations:', res.statusText);
                return null;
            }

            return await res.json();
        } catch (err) {
            console.error('Error getting recommendations:', err);
            return null;
        }
    }
}

export const tracker = new RecoTracker();