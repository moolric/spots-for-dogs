/* global angular */

(function () {
    'use strict';

    angular
        .module('spots')
        .controller('AppController', AppController);

    function AppController($scope, $state, Logger) {
        Logger.loaded('AppController');
    }
})();
