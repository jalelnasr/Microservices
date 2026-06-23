const express = require('express');
const axios = require('axios');
const keycloakConfig = require('../config/keycloak');
const logger = require('../utils/logger');

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                error: 'Username and password are required' 
            });
        }

        const tokenUrl = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;
        
        const params = new URLSearchParams();
        params.append('grant_type', 'password');
        params.append('client_id', process.env.KEYCLOAK_CLIENT_ID);
        params.append('client_secret', process.env.KEYCLOAK_CLIENT_SECRET);
        params.append('username', username);
        params.append('password', password);

        const response = await axios.post(tokenUrl, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token, refresh_token, expires_in } = response.data;

        logger.info(`User ${username} logged in successfully`);

        res.json({
            access_token,
            refresh_token,
            expires_in,
            token_type: 'Bearer'
        });

    } catch (error) {
        logger.error('Login error:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            return res.status(401).json({ 
                error: 'Invalid credentials' 
            });
        }

        res.status(500).json({ 
            error: 'Authentication failed' 
        });
    }
});

// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ 
                error: 'Username, email, and password are required' 
            });
        }

        // Check if user already exists
        const existingUser = await keycloakConfig.getUserByUsername(username);
        if (existingUser) {
            return res.status(409).json({ 
                error: 'User already exists' 
            });
        }

        const user = await keycloakConfig.createUser({
            username,
            email,
            password,
            firstName: firstName || '',
            lastName: lastName || ''
        });

        logger.info(`User ${username} registered successfully`);

        res.status(201).json({
            message: 'User registered successfully',
            userId: user.id
        });

    } catch (error) {
        logger.error('Registration error:', error.message);
        res.status(500).json({ 
            error: 'Registration failed',
            message: error.message 
        });
    }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token) {
            return res.status(400).json({ 
                error: 'Refresh token is required' 
            });
        }

        const tokenUrl = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;
        
        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('client_id', process.env.KEYCLOAK_CLIENT_ID);
        params.append('client_secret', process.env.KEYCLOAK_CLIENT_SECRET);
        params.append('refresh_token', refresh_token);

        const response = await axios.post(tokenUrl, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        res.json(response.data);

    } catch (error) {
        logger.error('Token refresh error:', error.response?.data || error.message);
        res.status(401).json({ 
            error: 'Token refresh failed' 
        });
    }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
    try {
        const { refresh_token } = req.body;

        if (refresh_token) {
            const logoutUrl = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/logout`;
            
            const params = new URLSearchParams();
            params.append('client_id', process.env.KEYCLOAK_CLIENT_ID);
            params.append('client_secret', process.env.KEYCLOAK_CLIENT_SECRET);
            params.append('refresh_token', refresh_token);

            await axios.post(logoutUrl, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        }

        res.json({ message: 'Logged out successfully' });

    } catch (error) {
        logger.error('Logout error:', error.message);
        res.json({ message: 'Logged out successfully' }); // Always return success for logout
    }
});

module.exports = router;