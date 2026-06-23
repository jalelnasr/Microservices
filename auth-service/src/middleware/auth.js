const jwt = require('jsonwebtoken');
const axios = require('axios');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const token = authHeader.substring(7);

        // Verify token with Keycloak
        const userInfoUrl = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`;
        
        const response = await axios.get(userInfoUrl, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        req.user = response.data;
        next();

    } catch (error) {
        console.error('Auth middleware error:', error.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;