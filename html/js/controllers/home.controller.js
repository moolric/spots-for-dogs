/* global angular */

(function () {
    'use strict';

    angular
        .module('spots')
        .controller('HomeController', HomeController);

    function HomeController($scope, $state, Logger) {
        Logger.loaded('HomeController');
    }
})();
