/* global angular */

(function () {
    'use strict';

    angular
        .module('spots')
        .controller('AppController', AppController);

    function AppController($scope, $state, Logger, $rootScope, $anchorScroll) {
        Logger.loaded('AppController');

        $scope.titlePrefix = "Spots for Dogs";
        $scope.$on('$stateChangeSuccess', function (event, current, previous) {
            $anchorScroll();
            if ($state.current.title) {
                $scope.title = $scope.titlePrefix + " &mdash; " + $state.current.title;
            } else {
                $scope.title = $scope.titlePrefix;
            }
        });

    }
})();
