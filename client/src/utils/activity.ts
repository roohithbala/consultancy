import { API } from '../config/api';

/**
 * Utility to log user activities/events to the backend.
 * This is used for client-side events like 3D model interactions,
 * product views, etc.
 */
export const logActivity = async (action: string, details: any = {}) => {
    try {
        // We don't wait for this to complete as it's non-critical
        fetch(`${API}/activity/log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action,
                details: {
                    ...details,
                    url: window.location.href,
                    timestamp: new Date().toISOString()
                },
            }),
        }).catch(err => console.warn('Activity logging failed', err));
    } catch (e) {
        // Silently fail to not interrupt user experience
    }
};
