/* global angular */

(function() {
    'use strict';

    angular
        .module('spots')
        .factory('spotlight', ['$q', '$localStorage', 'ErrorHandler', 'Logger', Spotlight]);

    function Spotlight($q, $localStorage, ErrorHandler, Logger) {
        var _api = {

        };

        return _api;
    }
})();
