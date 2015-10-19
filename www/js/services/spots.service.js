/* global angular */

(function() {
    'use strict';

    angular
        .module('spots-services', [])
        .factory('Spotlight', ['$http', '$q', 'Logger', 'ErrorHandler', Spotlight])
        .factory('ErrorHandler', [ 'Logger', ErrorHandler]);

    function Spotlight($http, $q, Logger, ErrorHandler) {
        var _endpoint = 'http://api.spotsfordogs.com/',
            _api = {
                getSpot: getSpot,
                putSpot: putSpot,
                getAll: getAll
            };

        return _api;

        function getSpot(spotID) {
            var deferred = $q.defer();

            Logger.shout('Getting ' + _endpoint + ' spot');

            deferred.notify('Getting ' + _endpoint + ' spot');

            $http.get(_endpoint + '/spots/spot/' + spotID, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            })
                .then(function successResponse(response) {
                    console.log(response);
                    if (ErrorHandler.check(response)) {
                        deferred.resolve(response.data);
                    } else {
                        deferred.reject(ErrorHandler.lastError);
                    }
                }, function errorResponse(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        }

        function putSpot(spot) {
            var deferred = $q.defer();

            Logger.shout('Putting ' + _endpoint + ' spot');

            deferred.notify('Putting ' + _endpoint + ' spot');

            $http.put(_endpoint + 'spots/spot/' + spot.spot_id, spot)
                .then(function successResponse(response) {
                    Logger.data(test);
                    console.log(response);
                    if (ErrorHandler.check(response)) {
                        deferred.resolve(response.data);
                    } else {
                        deferred.reject(ErrorHandler.lastError);
                    }
                }, function errorResponse(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        }


        function getAll(thing) {
            var deferred = $q.defer();

            Logger.shout('Getting ' + _endpoint + thing);

            deferred.notify('Getting ' + _endpoint + thing);

            $http.get(_endpoint + thing + '/all', {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            })
                .then(function successResponse(response) {
                    console.log(response);
                    if (ErrorHandler.check(response)) {
                        deferred.resolve(response.data);
                    } else {
                        deferred.reject(ErrorHandler.lastError);
                    }
                }, function errorResponse(response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        }

    }

    function ErrorHandler(Logger) {
        var _lastError,
            _response,
            _api = {
                check: check,
                get lastError() {
                    return _lastError;
                }
            };

        _resetLastError();

        return _api;

        function check(response) {
            response = typeof response === 'undefined' ? null : response;

            _resetLastError();

            _response = response;

            if (_response) {
                return _checkResponse();
            } else {
                return false;
            }
        }

        function _checkResponse() {
            var responseCode;

            if (_response === null) {
                Logger.error('No response available to check for errors was passed. Aborting.');

                _setLastError(null, 'No response available');

                return false;
            } else if (_response && _response.data && _response.data.code === null) {
                Logger.error('A response was found, but it contained no response code to process.');

                _setLastError(null, _response.data.message || 'No response message found');

                return false;
            }

            responseCode = parseInt(_response.data.code);

            // there was an error (< 0 for server error, >0 for user error)
            if ((responseCode && responseCode !== 200) || _response.data.data === null) {
                _setLastError(responseCode, _response.data.message || 'No response message found');
                return false;
            }

            Logger.log('Response looks valid: ', _response.data);

            return true;
        }

        function _resetLastError() {
            _lastError = {
                errCode: null,
                errMessage: null
            };
        }

        /**
         * Function to set the last error response
         * @param {Number} code the error code returned from the lne api
         * @param {String} msg  the error message returned from the lne api
         */
        function _setLastError(code, msg) {
            _lastError = {
                errCode: parseInt(code),
                errMessage: msg
            };
        }
    }
})();