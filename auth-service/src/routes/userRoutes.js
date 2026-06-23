const express = require('express');
const keycloakConfig = require('../config/keycloak');
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await keycloakConfig.getUserByUsername(req.user.preferred_username);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            enabled: user.enabled,
            emailVerified: user.emailVerified
        });

    } catch (error) {
        logger.error('Get profile error:', error.message);
        res.status(500).json({ error: 'Failed to get user profile' });
    }
});

// Update user roles (Admin only)
router.put('/:userId/roles', authMiddleware, async (req, res) => {
    try {
        // Check if user has admin role
        const userRoles = req.user.realm_access?.roles || [];
        if (!userRoles.includes('ADMIN')) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { userId } = req.params;
        const { roles } = req.body;

        if (!Array.isArray(roles)) {
            return res.status(400).json({ error: 'Roles must be an array' });
        }

        await keycloakConfig.updateUserRoles(userId, roles);

        logger.info(`User roles updated for userId: ${userId}`);
        res.json({ message: 'User roles updated successfully' });

    } catch (error) {
        logger.error('Update roles error:', error.message);
        res.status(500).json({ error: 'Failed to update user roles' });
    }
});

module.exports = router;