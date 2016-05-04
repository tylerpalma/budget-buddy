var $ = require('jquery');
var _ = require('lodash');

module.exports = function () {
    // var self = this;
    var index = (typeof i === "undefined") ? 1: i,
        PATH_REPLACER = "([^\/]+)",
        PATH_NAME_MATCHER = /:([\w\d]+)/g,
        QUERY_STRING_MATCHER = /\?([^#]*)?$/;

    function _isArray (obj) {
        return Object.prototype.toString.call(obj) === "[object Array]";
    }

    function _decode (str) {
        return decodeURIComponent((str || '').replace(/\+/g, ' '));
    }


    this.before = function (params, beforeParams) {
        // ...
    };

    this.doRoute = function (callback, uri_path, beforeParams) {
        // run the before filter
        this.before(uri_path, beforeParams);
        // run the callback
        callback(uri_path);
    };

    this.get = function(path, callback, beforeParams) {
        var uri_path = {}, param_names = [], path_match, uri;

        if (_.isArray(path)) {

            _.forEach(path, function (_path) {
                doMatch.call(this, _path);
            }, this);
        } else {
            doMatch.call(this, path);
        }

        function doMatch (path) {
            // if path is a string turn it into a regex

            if (path.constructor == String) {

                // Needs to be explicitly set because IE will maintain the
                // index unless NULL is returned, which means that with two
                // consecutive routes that contain params, the second set of
                // params will not be found and end up in splat instead of
                // params
                //
                // http://mzl.la/1fGBQ3J
                PATH_NAME_MATCHER.lastIndex = 0;

                // match user specified params
                while ((path_match = PATH_NAME_MATCHER.exec(path)) !== null) {
                    param_names.push(path_match[1]);
                }

                // replace with the path replacement
                // which we then use to find a match with the routes.
                // ### EXAMPLE
                //
                // /home/f00-bar-1 //=> /home/([^/]+)

                path = new RegExp(path.replace(PATH_NAME_MATCHER, PATH_REPLACER) + "$");

                if ((uri = window.location.pathname.match(path)) !== null) {

                    // apply values to the user-specified params
                    for (i=0; i<param_names.length; i++) {
                        uri_path[param_names[i]] = uri[i+1];
                    }

                    // apply the search objects
                    uri_path.search = this.parseQueryString(window.location.search);
                    uri_path.uri = window.location.pathname.replace("/", "");

                    // go
                    this.doRoute(callback, uri_path, beforeParams);
                } else {
                    return false;
                }
            } else if (path.constructor == RegExp) {

                // no need to assign path to a regex
                if ((uri = window.location.pathname.match(path)) !== null) {
                    uri_path.splat  = window.location.pathname.split("/").splice(1);
                    uri_path.search = this.parseQueryString(window.location.search);

                    // go
                    this.doRoute(callback, uri_path, beforeParams);
                } else {
                    return false;
                }
            }
        }
    };

    this.parseQueryString = function(path) {
        var params = {}, parts, pairs, pair, i;

        parts = path.match(QUERY_STRING_MATCHER);
        if (parts && parts[1]) {
            pairs = parts[1].split('&');
            for (i = 0; i < pairs.length; i++) {
                pair = pairs[i].split('=');
                params = _parseParamPair(params, _decode(pair[0]), _decode(pair[1] || ""));
            }
        }
        return params;
    };
};
