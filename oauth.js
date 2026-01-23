define(['N/util', './cryptojs'], function(util, cryptojs) {
    function OAuth(opts) {
        if (!(this instanceof OAuth)) {
            return new OAuth(opts);
        }

        opts = opts || {};

        if (!opts.consumer) {
            throw new Error('consumer option is required');
        }

        this.consumer = opts.consumer;
        this.nonce_length = opts.nonce_length || 32;
        this.version = opts.version || '1.0';
        this.realm = opts.realm || '';
        this.parameter_seperator = opts.parameter_seperator || ', ';

        this.last_ampersand = typeof opts.last_ampersand === 'undefined' ? true : opts.last_ampersand;
        this.signature_method = opts.signature_method || 'PLAINTEXT';

        if (this.signature_method === 'PLAINTEXT' && !opts.hash_function) {
            opts.hash_function = function(base_string, key) {
                return key;
            };
        }

        if (!opts.hash_function) {
            throw new Error('hash_function option is required');
        }

        this.hash_function = opts.hash_function;
    }

    OAuth.prototype.authorize = function(request, token) {
        var oauth_data = {
            oauth_consumer_key: this.consumer.key,
            oauth_nonce: this.getNonce(),
            oauth_signature_method: this.signature_method,
            oauth_timestamp: this.getTimeStamp(),
            oauth_version: this.version
        };

        token = token || {};

        if (token.key) {
            oauth_data.oauth_token = token.key;
        }

        request.data = request.data || {};

        oauth_data.oauth_signature = this.getSignature(request, token.secret, oauth_data);

        return oauth_data;
    };

    OAuth.prototype.getSignature = function(request, token_secret, oauth_data) {
        return this.hash_function(this.getBaseString(request, oauth_data), this.getSigningKey(token_secret));
    };

    OAuth.prototype.getBaseString = function(request, oauth_data) {
        return request.method.toUpperCase() + '&' + this.percentEncode(this.getBaseUrl(request.url)) + '&' + this.percentEncode(this.getParameterString(request, oauth_data));
    };

    OAuth.prototype.getParameterString = function(request, oauth_data) {
        var base_string_data = this.sortObject(this.percentEncodeData(this.mergeObject(oauth_data, this.mergeObject(request.data, this.deParamUrl(request.url)))));
        var data_str = '';

        for (var key in base_string_data) {
            var value = base_string_data[key];
            if (value && Array.isArray(value)) {
                value.sort();
                value.forEach((function(item, i) {
                    data_str += key + '=' + item;
                    if (i < value.length - 1) {
                        data_str += "&";
                    }
                }).bind(this));
            } else {
                data_str += key + '=' + value + '&';
            }
        }

        return data_str.slice(0, -1);
    };

    OAuth.prototype.getSigningKey = function(token_secret) {
        token_secret = token_secret || '';
        if (!this.last_ampersand && !token_secret) {
            return this.percentEncode(this.consumer.secret);
        }
        return this.percentEncode(this.consumer.secret) + '&' + this.percentEncode(token_secret);
    };

    OAuth.prototype.getBaseUrl = function(url) {
        return url.split('?')[0];
    };

    OAuth.prototype.deParam = function(string) {
        var arr = string.split('&');
        var data = {};

        for (var i = 0; i < arr.length; i++) {
            var item = arr[i].split('=');
            item[1] = item[1] || '';
            data[item[0]] = decodeURIComponent(item[1]);
        }

        return data;
    };

    OAuth.prototype.deParamUrl = function(url) {
        var tmp = url.split('?');
        return tmp.length === 1 ? {} : this.deParam(tmp[1]);
    };

    OAuth.prototype.percentEncode = function(str) {
        return encodeURIComponent(str)
            .replace(/\!/g, "%21")
            .replace(/\*/g, "%2A")
            .replace(/\'/g, "%27")
            .replace(/\(/g, "%28")
            .replace(/\)/g, "%29");
    };

    OAuth.prototype.percentEncodeData = function(data) {
        var result = {};
        for (var key in data) {
            var value = data[key];
            if (value && Array.isArray(value)) {
                var newValue = [];
                value.forEach((function(val) {
                    newValue.push(this.percentEncode(val));
                }).bind(this));
                value = newValue;
            } else {
                value = this.percentEncode(value);
            }
            result[this.percentEncode(key)] = value;
        }
        return result;
    };

    OAuth.prototype.toHeader = function(oauth_data) {
        oauth_data = this.sortObject(oauth_data);
        var header_value = 'OAuth ';

        if (this.realm) {
            header_value += this.percentEncode('realm') + '="' + this.percentEncode(this.realm) + '"' + this.parameter_seperator;
        }

        for (var key in oauth_data) {
            if (key.indexOf('oauth_') === -1) continue;
            header_value += this.percentEncode(key) + '="' + this.percentEncode(oauth_data[key]) + '"' + this.parameter_seperator;
        }

        return {
            Authorization: header_value.slice(0, -this.parameter_seperator.length)
        };
    };

    OAuth.prototype.getNonce = function() {
        var word_characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var result = '';
        for (var i = 0; i < this.nonce_length; i++) {
            result += word_characters[Math.floor(Math.random() * word_characters.length)];
        }
        return result;
    };

    OAuth.prototype.getTimeStamp = function() {
        return Math.floor(new Date().getTime() / 1000);
    };

    OAuth.prototype.mergeObject = function(obj1, obj2) {
        obj1 = obj1 || {};
        obj2 = obj2 || {};
        var merged_obj = obj1;
        for (var key in obj2) {
            merged_obj[key] = obj2[key];
        }
        return merged_obj;
    };

    OAuth.prototype.sortObject = function(data) {
        var keys = Object.keys(data);
        var result = {};
        keys.sort();
        for (var i = 0; i < keys.length; i++) {
            result[keys[i]] = data[keys[i]];
        }
        return result;
    };

    function getQueryParams(url) {
        if (typeof url !== 'string') throw TypeError("getQueryParams requires a String argument.");
        var paramObj = {};
        if (url.indexOf('?') === -1) return paramObj;
        url = url.split('#')[0];
        var queryString = url.split('?')[1];
        var params = queryString.split('&');
        for (var i in params) {
            var paramString = params[i];
            var keyValuePair = paramString.split('=');
            var key = keyValuePair[0];
            var value = keyValuePair[1];
            if (key in paramObj) {
                if (typeof paramObj[key] === 'string') {
                    paramObj[key] = [paramObj[key]];
                }
                paramObj[key].push(value);
            } else {
                paramObj[key] = value;
            }
        }
        return paramObj;
    }

    function hash_function_sha1(base_string, key) {
        return cryptojs.HmacSHA1(base_string, key).toString(cryptojs.enc.Base64);
    }

    function hash_function_sha256(base_string, key) {
        return cryptojs.HmacSHA256(base_string, key).toString(cryptojs.enc.Base64);
    }

    function getHeaders(options, authInstance) {
        var data = (options.method.toUpperCase() === 'GET') ? getQueryParams(options.url) : {};
        var requestData = {
            url: options.url,
            method: options.method,
            data: data
        };
        var token = {
            key: options.tokenKey,
            secret: options.tokenSecret
        };
        return authInstance.toHeader(authInstance.authorize(requestData, token));
    }

    return {
        getHeaders: getHeaders,
        OAuth: OAuth,
        sha1: hash_function_sha1,
        sha256: hash_function_sha256
    };
});