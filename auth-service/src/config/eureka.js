const Eureka = require('eureka-js-client').Eureka;

const port = Number(process.env.PORT || 8083);
const hostName = process.env.EUREKA_INSTANCE_HOSTNAME || 'auth-service';

const eurekaClient = new Eureka({
    instance: {
        app: 'AUTH-SERVICE',
        hostName,
        ipAddr: '127.0.0.1',
        statusPageUrl: `http://${hostName}:${port}/health`,
        healthCheckUrl: `http://${hostName}:${port}/health`,
        port: {
            '$': port,
            '@enabled': 'true',
        },
        vipAddress: 'auth-service',
        dataCenterInfo: {
            '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
            name: 'MyOwn',
        },
    },
    eureka: {
        host: 'eureka-server',
        port: 8761,
        servicePath: '/eureka/apps/',
        maxRetries: 10,
        requestRetryDelay: 5000,
    },
});

module.exports = eurekaClient;
