/* global angular */

(function() {
    'use strict';

    angular
        .module('spots')
        .factory('ErrorHandler', ['$q', '$localStorage', 'Logger', ErrorHandler]);

    function ErrorHandler($q, $localStorage, Logger) {
        var _api = {

        };

        return _api;
    }
})();
