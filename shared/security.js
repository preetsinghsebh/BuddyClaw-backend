import rateLimit from 'express-rate-limit';

/**
 * Common Rate Limiter for API endpoints
 * Limits each IP to 100 requests per 15 minutes.
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Stricter Rate Limiter for auth/sensitive endpoints
 */
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: { error: 'Too many auth attempts, please try again in an hour' },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Internal Security Middleware
 * Checks for a shared INTERNAL_SECRET in the headers.
 */
export const verifyInternalToken = (req, res, next) => {
    const secret = process.env.INTERNAL_SECRET;
    // If no secret is set in environment, we allow in dev, but warn
    if (!secret) {
        if (process.env.NODE_ENV === 'production') {
            return res.status(500).json({ error: 'INTERNAL_SECRET not configured on server' });
        }
        return next();
    }

    const token = req.headers['x-internal-token'] || req.headers['authorization']?.split(' ')[1];
    if (token !== secret) {
        return res.status(401).json({ error: 'Unauthorized: Invalid internal token' });
    }
    next();
};

/**
 * Webhook Secret Verification
 * Checks the X-Telegram-Bot-Api-Secret-Token header.
 */
export const verifyWebhookHeader = (secretToken) => (req, res, next) => {
    if (!secretToken) return next(); // Not configured
    
    const receivedToken = req.headers['x-telegram-bot-api-secret-token'];
    if (receivedToken !== secretToken) {
        console.warn(`[Security] Unauthorized Webhook request from IP: ${req.ip}`);
        return res.status(401).json({ error: 'Unauthorized Webhook' });
    }
    next();
};
