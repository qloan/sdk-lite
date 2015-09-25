var bunyan         = require('bunyan');
var createCWStream = require('bunyan-cloudwatch');
var expressLogger  = require('express-bunyan-logger');
var config         = require('./config');

var cwStream;
var loadedAppName;

var logger = {
    createCWStream: function(groupName, streamName) {
        if(cwStream) {
            return;
        }
        var stream = createCWStream({
            logGroupName  : groupName,
            logStreamName : streamName,
            region        : config.awsConfig.region
        });

        cwStream = {
            stream : stream,
            type   : 'raw'
        };
    },

    createExpressLogger: function(obj) {
        if(!obj) {
            obj = logger.createConfig();
        }

        //Disable verbose route logging when in dev environment
        if(logger.getEnv() == 'dev') {
            obj.excludes = "*";
        }

        return expressLogger(obj);
    },

    createLogger: function(obj) {
        if(!obj) {
            obj = logger.createConfig();
        }
        return bunyan.createLogger(obj);
    },

    createConfig: function(cfg) {
        var appName;

        if(config.app && config.app.name) {
            appName = config.app.name;
        }

        if(!appName) {
            console.warn("Logger::createConfig - No appName set. Setting to 'unknown'");
            appName = 'unknown';
        }

        if (process.env.HOSTNAME && logger.getEnv() != 'dev') {
            appName += "-" + process.env.HOSTNAME;
        }

        if(!loadedAppName) {
            loadedAppName = appName;
            console.log("Logger::createConfig - Setting appName to '" + appName + "'");
        }

        var retObj = {
            name    : appName,
            streams : []
        };

        cfg = cfg || {};

        //don't write to cloudwatch stream if disabled via config or running via jenkins
        if(!cfg.disableCloudwatch) {
            if(logger.getEnv() != 'jenkins') {
                logger.createCWStream(process.env.ENV_NAME, appName);
                retObj.streams.push(cwStream);
            }else {
                console.warn("Logger::createConfig - No ENV_NAME set or invalid ENV_NAME. Can't write to cloudwatch.");
            }
        }

        //don't write to stdout if disabled via config
        if(!cfg.disableStdout) {
            retObj.streams.push({
                stream: process.stdout
            });
        }

        return retObj;
    },

    getEnv: function() {
        var retVal;
        if(!process.env.ENV_NAME) {
            return retVal;
        }

        if(/^dev\-/.test(process.env.ENV_NAME)) {
            retVal = 'dev';
        }else if(/^jenkins\-/.test(process.env.ENV_NAME)) {
            retVal = 'jenkins';
        }
        return retVal;
    }
};

module.exports = logger;
