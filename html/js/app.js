/**
 * Spots for DOgs
 *
 * @author: Kim Ulrick
 * @copyright 2015 Kim Ulrick
 * {@link http://kimulrick.com}
 */

(function () {
    'use strict';

    // load the required modules
    angular.module('spots', ['ui.router', 'angular-coms', 'angular-logger-max', 'ngStorage'])

        .constant('APP_CONFIG', {
            'debug': true
        })

        .constant('APP_EVENTS', {})

        .constant('COLOURS', {
            'primary': '#003663',
            'secondary': '#149bc4',
            'muted': '#999d9f',
            'bg': '#f5f6f5',
            'menu': '#323c49',
            'text': '#323c49',
            'status': '#113d61'
        })

        .constant('USER_TYPE', {
            'patient': 'patient',
            'referrer': 'referrer'
        })

        .run(function (APP_CONFIG, COLOURS, $state, $rootScope, Logger) {
            // turn on debug logs
            Logger.debug = APP_CONFIG.debug;
        })

        .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {

            $stateProvider

                .state('home', {
                    url: '/',
                    templateUrl: 'templates/home.html',
                    controller: 'HomeController'
                })

                .state('login', {
                    url: "/login",
                    templateUrl: "templates/login.html",
                    controller: 'LoginController'
                })


            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/');
            $locationProvider.html5Mode(true);
        });
})();
