/* global angular */

(function() {
    'use strict';

    angular
        .module('spots')
        .factory('User', ['$q', '$localStorage', 'ErrorHandler', 'Logger', User]);

    function User($q, $localStorage, ErrorHandler, Logger) {
        var _api = {

        };

        return _api;
    }
})();
