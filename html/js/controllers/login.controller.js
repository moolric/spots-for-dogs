/* global angular */

(function () {
    'use strict';

    angular
        .module('spots')
        .controller('LoginController', LoginController);

    function LoginController($scope, $state, Logger) {
        Logger.loaded('LoginController');
    }
})();
