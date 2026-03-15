import ActivityLog from '../models/ActivityLog.js';

/**
 * Middleware to capture and log significant activity automatically.
 * Primarily for state-changing operations (POST, PUT, DELETE).
 */
export const activityLogger = async (req, res, next) => {
    // Only log significant or state-changing requests by default
    // We can expand this logic as needed
    const actionsToLog = {
        'POST': {
            '/api/users/login': 'LOGIN',
            '/api/users': 'REGISTER',
            '/api/orders': 'ORDER_CREATED',
            '/api/service/request': 'CONTACT_FORM_SUBMISSION'
        },
        'PUT': {
            '/api/users/profile': 'PROFILE_UPDATE',
            '/api/orders/:id/status': 'ORDER_STATUS_UPDATE',
            '/api/orders/:id/cancel': 'ORDER_STATUS_UPDATE'
        }
    };

    // Store the original end function to intercept the response
    const originalEnd = res.end;

    res.end = function (chunk, encoding) {
        res.end = originalEnd;
        res.end(chunk, encoding);

        // Only log if the request was successful
        if (res.statusCode >= 200 && res.statusCode < 300) {
            const method = req.method;
            const path = req.baseUrl + req.path;
            
            let action = null;

            // Simple exact match first
            if (actionsToLog[method] && actionsToLog[method][path]) {
                action = actionsToLog[method][path];
            } else {
                // Handle dynamic paths like /api/orders/123/status
                for (const [pattern, act] of Object.entries(actionsToLog[method] || {})) {
                    if (pattern.includes(':id')) {
                        const regex = new RegExp('^' + pattern.replace(':id', '[a-fA-F0-9]{24}') + '$');
                        if (regex.test(path)) {
                            action = act;
                            break;
                        }
                    }
                }
            }

            if (action) {
                ActivityLog.create({
                    user: req.user ? req.user._id : null,
                    action,
                    details: {
                        body: { ...req.body },
                        params: { ...req.params },
                        query: { ...req.query }
                    },
                    ip: req.ip || req.headers['x-forwarded-for'],
                    userAgent: req.headers['user-agent'],
                    path,
                    method
                }).catch(err => console.error('Logging Error:', err));
            }
        }
    };

    next();
};

/**
 * Helper to manually log events from controllers
 */
export const logEvent = async ({ user, action, details, req }) => {
    try {
        await ActivityLog.create({
            user: user || (req && req.user ? req.user._id : null),
            action,
            details,
            ip: req ? (req.ip || req.headers['x-forwarded-for']) : 'Internal',
            userAgent: req ? req.headers['user-agent'] : 'Server',
            path: req ? req.originalUrl : 'N/A',
            method: req ? req.method : 'N/A'
        });
    } catch (err) {
        console.error('Manual Logging Error:', err);
    }
};
