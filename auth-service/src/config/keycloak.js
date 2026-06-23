const axios = require('axios');

class KeycloakConfig {
    constructor() {
        this.baseUrl = process.env.KEYCLOAK_URL || 'http://keycloak:8180';
        this.realm = process.env.KEYCLOAK_REALM || 'microservices-realm';
        this.clientId = process.env.KEYCLOAK_CLIENT_ID || 'auth-service-client';
        this.clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
        this.adminToken = null;
    }

    async getAdminToken() {
        try {
            const response = await axios.post(
                `${this.baseUrl}/realms/master/protocol/openid-connect/token`,
                new URLSearchParams({
                    grant_type: 'password',
                    client_id: 'admin-cli',
                    username: process.env.KEYCLOAK_ADMIN_USER || 'admin',
                    password: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin'
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );
            this.adminToken = response.data.access_token;
            console.log('Keycloak admin token obtained successfully');
            return this.adminToken;
        } catch (error) {
            console.error('Keycloak authentication failed:', error.message);
            throw error;
        }
    }

    async createUser(userData) {
        try {
            const token = await this.getAdminToken();
            
            const response = await axios.post(
                `${this.baseUrl}/admin/realms/${this.realm}/users`,
                {
                    username: userData.username,
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    enabled: true,
                    emailVerified: true,
                    credentials: [{
                        type: 'password',
                        value: userData.password,
                        temporary: false
                    }]
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            throw new Error(`Failed to create user: ${error.message}`);
        }
    }

    async getUserByUsername(username) {
        try {
            const token = await this.getAdminToken();
            const response = await axios.get(
                `${this.baseUrl}/admin/realms/${this.realm}/users?username=${username}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data[0] || null;
        } catch (error) {
            throw new Error(`Failed to get user: ${error.message}`);
        }
    }

    async updateUserRoles(userId, roleNames) {
        try {
            const token = await this.getAdminToken();
            
            // Get available roles
            const rolesResponse = await axios.get(
                `${this.baseUrl}/admin/realms/${this.realm}/roles`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            const rolesToAssign = rolesResponse.data.filter(role => 
                roleNames.includes(role.name)
            );
            
            // Assign roles
            await axios.post(
                `${this.baseUrl}/admin/realms/${this.realm}/users/${userId}/role-mappings/realm`,
                rolesToAssign,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return true;
        } catch (error) {
            throw new Error(`Failed to update user roles: ${error.message}`);
        }
    }
}

module.exports = new KeycloakConfig();