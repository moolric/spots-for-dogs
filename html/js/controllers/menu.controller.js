/* global angular */

(function () {
    'use strict';

    angular
        .module('spots')
        .controller('MenuController', MenuController);

    function MenuController($scope, $state, Logger) {
        Logger.loaded('MenuController');
    }
})();
