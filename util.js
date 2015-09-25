var util = {
    buildErr: function(statusCode, mesg, req, err, other) {
        var response = {};
        if (other) {
            response = other;
        }
        response.mesg = mesg;

        var out = {
            statusCode: statusCode,
            response: response,
            url     : req ? req.url : '',
            method  : req ? req.method : '',
            body    : req ? req.body : '',
            origErr : err
        };

        return out;
    },

    getObjKey: function(obj, k, defaultVal) {
        if(typeof k  === 'string') {
            k = k.split('.');
        }

        var p = k[0];

        if(typeof obj  === 'undefined') {
            return defaultVal;
        }
        if(k.length > 1) {
            return util.getObjKey(obj[p], k.slice(1), defaultVal);
        }else {
            return (obj.hasOwnProperty(p)) ? obj[p] : defaultVal;
        }
    },

    objectEmpty: function(obj) {
        for (var prop in obj) {
            return false;
        }
        return true;
    },

    deepmerge: function(target, src, allowUndefined) {
        var array = Array.isArray(src);
        var dst = array && [] || {};

        if (array) {
            target = target || [];
            dst = dst.concat(target);
            src.forEach(function(e, i) {
                if (typeof dst[i] === 'undefined') {
                    dst[i] = e;
                } else if (typeof e === 'object') {
                    dst[i] = util.deepmerge(target[i], e, allowUndefined);
                } else {
                    if (target.indexOf(e) === -1) {
                        dst.push(e);
                    }
                }
            });
        } else {
            if (target && typeof target === 'object') {
                Object.keys(target).forEach(function (key) {
                    dst[key] = target[key];
                })
            }
            Object.keys(src).forEach(function (key) {
                if (typeof src[key] !== 'object' || !src[key]) {
                    dst[key] = src[key];
                }
                else {
                    if (!target[key] || Object.prototype.toString.call(src[key]) === '[object Date]') {
                        dst[key] = src[key];
                    } else {
                        dst[key] = util.deepmerge(target[key], src[key], allowUndefined);
                    }
                }

                //If value on destination object is empty, delete it
                if (typeof(dst[key]) === 'undefined' && !allowUndefined) {
                    delete dst[key];
                }
            });
        }

        return dst;
    },

    clone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    checkValidHost: function(req, res, next) {
        var host = false;

        if (req.headers.hasOwnProperty('x-forwarded-host')) {
            host = req.headers['x-forwarded-host'];
        } else if (req.headers.hasOwnProperty('origin')) {
            host = req.headers['origin'];
        }

        if (host !== false) {
            var headerElements = util.trimUrlByPattern(host, config.acceptableHeaders);
            if (headerElements !== false) {
                req.headers['x-shortened-host'] = headerElements.baseUrl;
                req.headers['x-shortened-ui-dir'] = headerElements.baseUrl + headerElements.uiDir;
                return next();
            } else {
                return next();
                // Removing this because it's dangerous
                // return next(util.buildErr(400, 'Host not accepted.', req, null));
            }
        } else {
            next();
        }
    }
};

module.exports = util;
