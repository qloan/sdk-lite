module.exports = function(cfg) {
    var config = require('./config');

    if(typeof cfg === 'object') {
        config.app = cfg;
    }

    var sdk = {
        config : config,
        log    : require('./logging'),
        util   : require('./util')
    };

    return sdk;
};
