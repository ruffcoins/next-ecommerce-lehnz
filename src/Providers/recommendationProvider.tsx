import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';

export default function RecommendationProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();

    useEffect(() => {
        const currentId = localStorage.getItem('reco_user_id');

        if (session?.user?.id) {
            // User Logged In: Update ID to matching user ID
            if (currentId !== session.user.id) {
                localStorage.setItem('reco_user_id', session.user.id);
            }
        } else if (!currentId || !currentId.startsWith('anon_')) {
            // User Logged Out / No Session: Generate/Reset to Anonymous ID
            localStorage.setItem('reco_user_id', `anon_${uuidv4()}`);
        }
    }, [session]);


    return <>{children}</>;
}