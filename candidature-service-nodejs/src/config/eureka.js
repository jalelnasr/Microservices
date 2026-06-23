const Eureka = require('eureka-js-client').Eureka;

const eurekaClient = new Eureka({
  instance: {
    app: 'CANDIDATURE-SERVICE',
    hostName: 'candidature-service',
    ipAddr: '127.0.0.1',
    statusPageUrl: `http://candidature-service:8082/info`,
    healthCheckUrl: `http://candidature-service:8082/health`,
    port: {
      '$': 8082,
      '@enabled': true,
    },
    vipAddress: 'candidature-service',
    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn',
    },
  },
  eureka: {
    host: process.env.EUREKA_HOST || 'eureka-server',
    port: process.env.EUREKA_PORT || 8761,
    servicePath: '/eureka/apps/',
    maxRetries: 10,
    requestRetryDelay: 2000,
  },
});

const startEureka = () => {
  eurekaClient.start((error) => {
    if (error) {
      console.error('❌ Eureka registration failed:', error);
    } else {
      console.log('✅ Successfully registered with Eureka');
    }
  });
};

module.exports = { eurekaClient, startEureka };
