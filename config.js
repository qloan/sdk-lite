var config = module.exports;

/****************
Application ports
****************/

config.awsConfig = {
    region:      'us-west-2',
    sslEnabled:  true,
    apiVersions: {
        dynamodb : '2012-08-10',
        sqs      : '2012-11-05',
        ses      : '2010-12-01'
    }
};

config.ports = {
    "FAKE-SERVICES"    : 8639
};

config.getAppPort = function() {
    return (config.app && config.app.name && config.ports[config.app.name]) ? config.ports[config.app.name] : config.ports['FAKE-SERVICES'];
};