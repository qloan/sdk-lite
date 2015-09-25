var config = module.exports;

/****************
Application ports
****************/

config.ports = {
    "FAKE-SERVICES"    : 8639
};

config.getAppPort = function() {
    return (config.app && config.app.name && config.ports[config.app.name]) ? config.ports[config.app.name] : config.ports['FAKE-SERVICES'];
};