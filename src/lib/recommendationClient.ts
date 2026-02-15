export type EventType = 'view' | 'click' | 'add_to_cart' | 'remove_from_cart' | 'checkout_start' | 'purchase';

interface TrackEvent {
    eventType: EventType;
    productId: string; // Made required for better ML data
    metadata?: Record<string, any>;
}

class RecoTracker {
    private tenantId = process.env.NEXT_PUBLIC_TENANT_ID!;
    private apiUrl = process.env.NEXT_PUBLIC_RECOMMENDATION_API_URL!;

    private getIdentity() {
        if (typeof window === 'undefined') return { userId: null, sessionId: null };
        return {
            userId: localStorage.getItem('reco_user_id'),
            sessionId: localStorage.getItem('reco_session_id'),
        };
    }

    // 1. The Handshake (Now using Headers for Tenant ID)
    // async handshake() {
    //     if (typeof window === 'undefined' || localStorage.getItem('reco_user_id')) return;

    //     try {
    //         const res = await fetch(`${this.apiUrl}/handshake`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'x-tenant-id': this.tenantId // CRITICAL: Match backend middleware
    //             }
    //         });

    //         const response = await res.json();

    //         if (response.success) {
    //             // Mapping backend trackingId to frontend user_id for the ML pipeline
    //             localStorage.setItem('reco_user_id', response.data.trackingId);
    //             localStorage.setItem('reco_session_id', response.data.sessionId);
    //         }
    //     } catch (err) {
    //         console.error('Reco Handshake Failed:', err);
    //     }
    // }

    // 2. The Event Sender (Strict Schema for Kafka/Spark)
    async track({ eventType, productId, metadata }: TrackEvent) {
        const { userId, sessionId } = this.getIdentity();

        if (!userId) return;

        const payload = {
            user_id: userId,        // Matches OpenAPI spec
            item_id: productId,     // Matches OpenAPI spec
            event_type: eventType,
            event_timestamp: new Date().toISOString(),
            context: {
                session_id: sessionId,
                page_url: window.location.href,
                // Backend will fill in IP, OS, and Browser automatically from headers
            },
            metadata: metadata || {},
        };

        return fetch(`${this.apiUrl}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-tenant-id': this.tenantId
            },
            body: JSON.stringify(payload),
            keepalive: true,
        });
    }

    // 3. Fetch Recommendations
    async getRecommendations() {
        const { userId } = this.getIdentity();

        console.log(userId)
        if (!userId) return null;

        // TODO: Remove this when we have a better way to get the tenant ID from the headers
        const tenantId = process.env.NEXT_PUBLIC_TENANT_ID
        console.log("tenantId", tenantId)
        try {
            const res = await fetch(`${this.apiUrl}/recommend?user_id=${userId}&tenant_id=${tenantId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': this.tenantId
                },

            });

            if (!res.ok) {
                console.warn('Failed to fetch recommendations:', res.statusText);
                return null;
            }

            console.log("res", res)
            return await res.json();
        } catch (err) {
            console.error('Error getting recommendations:', err);
            return null;
        }
    }
}

export const tracker = new RecoTracker();