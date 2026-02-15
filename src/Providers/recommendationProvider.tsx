// components/RecoProvider.tsx
'use client';

import { useEffect } from 'react';
import { tracker } from '@/lib/recommendationClient';

export default function RecommendationProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Perform handshake on initial load
        // tracker.handshake().then((data) => {
        //     console.log('Recommendation Engine Initialized:', data);
        // });
    }, []);

    return <>{children}</>;
}