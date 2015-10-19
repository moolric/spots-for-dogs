/**
 * Spots for Dogs
 *
 * @author: Kim Ulrick
 * @copyright 2015 Kim Ulrick
 * {@link http://spotsfordogs.com}
 */

/* global angular */
(function () {
    'use strict';

    // load the required modules
    angular.module('spots', ['ui.router', 'angular-coms', 'angular-logger-max', 'snazzy-maps', 'ngStorage', 'ngAnimate', 'ngSanitize', 'uiGmapgoogle-maps', 'spots-services', 'wu.masonry'])

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

        .config(function ($stateProvider, $urlRouterProvider, $locationProvider, uiGmapGoogleMapApiProvider) {

            uiGmapGoogleMapApiProvider.configure({
                // @todo add google maps key
                v: '3.17',
                libraries: 'weather,geometry,visualization'
            });

            $locationProvider.html5Mode(true);

            $stateProvider



                .state('spots', {
                    url: "/spots",
                    views: {
                        'content': {
                            templateUrl: "templates/spots.html",
                            controller: 'SpotsController'
                        }
                    }
                })

                .state('spot', {
                    url: "/spot/:spotID",
                    views: {
                        'content': {
                            templateUrl: "templates/spot.html",
                            controller: 'SpotController'
                        }
                    }
                });

            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/spots');
        });
})();
