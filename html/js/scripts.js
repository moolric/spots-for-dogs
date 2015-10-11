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

        .run(['APP_CONFIG', 'COLOURS', '$state', '$rootScope', 'Logger', function (APP_CONFIG, COLOURS, $state, $rootScope, Logger) {
            // turn on debug logs
            Logger.debug = APP_CONFIG.debug;
        }])

        .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {

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
        }]);
})();

/* global angular */

(function () {
    'use strict';

    angular
        .module('spots')
        .controller('AppController', AppController);

    function AppController($scope, $state, Logger) {
        Logger.loaded('AppController');
    }
    AppController.$inject = ['$scope', '$state', 'Logger'];
})();

/* global angular */

(function () {
    'use strict';

    angular
        .module('spots')
        .controller('HomeController', HomeController);

    function HomeController($scope, $state, Logger) {
        Logger.loaded('HomeController');
    }
    HomeController.$inject = ['$scope', '$state', 'Logger'];
})();

/* global angular */

(function () {
    'use strict';

    angular
        .module('spots')
        .controller('LoginController', LoginController);

    function LoginController($scope, $state, Logger) {
        Logger.loaded('LoginController');
    }
    LoginController.$inject = ['$scope', '$state', 'Logger'];
})();

/* global angular */

(function () {
    'use strict';

    angular
        .module('spots')
        .controller('MenuController', MenuController);

    function MenuController($scope, $state, Logger) {
        Logger.loaded('MenuController');
    }
    MenuController.$inject = ['$scope', '$state', 'Logger'];
})();

/* global angular */

(function() {
    'use strict';

    angular.module('spots')
        .directive('noWidow', function() {
            return {
                restrict: 'A',
                replace: true,
                link: function($scope, elem, attr) {
                    var txt = elem.html(),
                        tag = elem[0].nodeName.toLowerCase(),
                        wordArray = txt.split(" ");

                    if (wordArray.length > 1) {
                        wordArray[wordArray.length - 2] += "&nbsp;" + wordArray[wordArray.length - 1];
                        wordArray.pop();
                    }

                    elem.html('<' + tag + '>' + wordArray.join(" ") + '</' + tag + '>');
                }
            };
        });
})();

/**
 * Communications service to allow easy communications between modules, controllers and directives.
 *
 * __Example usage__:
 *
 *      // STANDARD USAGE
 *      Coms.sendSignal('signal:foo', { 'id': getId() });
 *      Coms.onSignal('signal:foo', function (event, data) {
 *          console.log('id received: ' + data.id);
 *      }, $scope);
 *
 *      // DELAYED EVENT SENDING
 *      Coms.sendSignal('signal:foo', 'random string', 400);
 *      Coms.onSignal('signal:foo', function (event, data) {
 *          console.log('I received the ' + data + ' after a 400ms delay');
 *      }, $scope);
 *
 * @module      angular-coms
 *
 * @class       Coms
 * @constructor
 *
 * @requires    $rootScope
 * @requires    $timeout
 * @param       {angular.Provider} $rootScope       The root scope of the object that is shared across all elements
 * @param       {angular.Provider} $timeout         Angular interfact to the standard JS timeout function
 *
 * @return      {Object}
 */
(function () {
    angular
        .module('angular-coms', [])
        .factory('Coms', ['$rootScope', '$timeout', Coms]);

    function Coms($rootScope, $timeout) {
        'use strict';

        /**
         * The object passed around to listeners and dispatchers
         * @property msgBus
         * @type Object
         * @private
         */
        var _api = {
            sendSignal: sendSignal,
            onSignal: onSignal
        };

        return _api;

        /**
         * sendSignal dispatches an event carrying defined data. Data can be of any type.
         *
         * @method  sendSignal
         * @throws  Will throw an error if no msg is passed to identify the event
         * @param   {String} msg       The event string that identifies the event
         * @param   {Object} data      Optional data to be carried by the signal, can be of any type
         * @param   {Number} delay     The time to wait before sending the event (defaults to immediate)
         */
        function sendSignal(msg, data, delay) {
            msg = typeof msg === 'undefined' ? new Error('A message string is needed to identify the event') : msg;
            delay = typeof delay === 'undefined' ? -1 : delay;

            /**
             * The data object to be passed to any listeners
             * @property signalData
             * @type Object
             * @private
             */
            var signalData = typeof data === 'undefined' ? {} : data;

            // if a delay is needed before sending the signal
            if (delay > -1) {
                if (delay === 0) { // delay until the after the current $digest cycle
                    $rootScope.$evalAsync(function ($rootScope) {
                        $rootScope.$emit(msg, signalData);
                    });
                } else { // send after the designated delay in milliseconds
                    $timeout(function () {
                        $rootScope.$emit(msg, signalData);
                    }, delay, true);
                }
            } else { // send immediately
                $rootScope.$emit(msg, signalData);
            }
        }

        /**
         * onSignal is what can be listened to to receive dispatched events
         *
         * @method  onSignal
         * @param   {String} msg    The event string to listen to
         * @param   {Function} func The function to invoke when message is received
         * @param   {Object} scope  The scope of where the signal is listened from, this is included to allow easy cleanup and to avoid memory leaks
         */
        function onSignal(msg, func, scope) {
            /**
             * Holds the scope the signal is dispatched to for cleanup
             * @property unbind
             * @type Object
             * @private
             */
            var unbind = $rootScope.$on(msg, func);
            if (scope) {
                scope.$on('$destroy', unbind);
            }

            // return the unregister function to the listener for manual deregistering before the scope is destroyed
            return unbind;
        }
    }
})();

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

(function() {
    'use strict';

    angular
        .module('angular-logger-max', [])
        .factory('Logger', [Logger]);

    // check for the availablility of the variety of console functions and create holders if necessary
    (function() {
        // handles all the console methods to make the console persistent, mainly for IE
        if (window.console === undefined) {
            window.console = {};
        }

        // assign holder functions to any console method not available to avoid old browser errors
        (function() {
            var methods = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml", "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"],
                i = methods.length;
            for (; i--;) {
                if (!window.console[methods[i]]) {
                    window.console[methods[i]] = function() {};
                }
            }
        }());
    }());

    function Logger() {
        var _debug = false,
            _api = {
                log: log,
                error: error,
                warn: warn,
                info: info,
                data: data,
                shout: shout,
                loaded: loaded,
                track: track,
                get debug() {
                    return _debug;
                },
                set debug(val) {
                    _debug = val;
                }
            };

        return _api;

        function log(prepend, msg, fullStack, expand) {
            if (!_debug) return;

            _formatOutput('log', 'color: green', prepend, msg, _formatStackTrace(fullStack), expand);

            if (console.re) {
                console.re.log(prepend, (msg) ? msg : '<< END');
            }
        }

        function info(prepend, msg, fullStack, expand) {
            if (!_debug) return;

            _formatOutput('info', 'color: blue', prepend, msg, _formatStackTrace(fullStack), expand);

            if (console.re) {
                console.re.info(prepend, (msg) ? msg : '<< END');
            }
        }

        function warn(prepend, msg, fullStack, expand) {
            // always show warnings, debug or not
            _formatOutput('warn', 'color: orange', prepend, msg, _formatStackTrace(fullStack), expand);

            if (console.re) {
                console.warn(prepend, (msg) ? msg : '<< END');
            }
        }

        function error(prepend, msg, fullStack, expand) {
            // always show errors, debug or not
            _formatOutput('error', 'background-color: maroon; font-weight: bold; color: white', prepend, msg, _formatStackTrace(fullStack), expand);

            if (console.re) {
                console.re.error(prepend, (msg) ? msg : '<< END');
                console.re.trace();
            }
        }

        function data(prepend, msg, fullStack, expand) {
            if (!_debug) return;

            // for data, by default log them out as full objects
            expand = typeof expand === 'undefined' ? true : expand;

            _formatOutput('data', 'color: hotpink', prepend, msg, _formatStackTrace(fullStack), expand);

            if (console.re) {
                console.re.debug(prepend, (msg) ? msg : '<< END');
            }
        }

        function shout(prepend, msg, fullStack, expand) {
            if (!_debug) return;

            _formatOutput('shout', 'color: red; font-weight: bold; font-size: 125%;', prepend, msg, _formatStackTrace(fullStack), expand);

            if (console.re) {
                console.re.log(prepend, (msg) ? msg : '<< END');
            }
        }

        function loaded(prepend, msg, fullStack, expand) {
            if (!_debug) return;

            _formatOutput('loaded', 'color: purple', prepend, msg, _formatStackTrace(fullStack), expand);

            if (console.re) {
                console.re.log(prepend, (msg) ? msg : '<< END');
            }
        }

        function track(prepend, msg, fullStack, expand) {
            if (!_debug) return;

            _formatOutput('tracking', 'color: grey', prepend, msg, _formatStackTrace(fullStack), expand);

            if (console.re) {
                console.re.log(prepend, (msg) ? msg : '<< END');
            }
        }

        /**
         * Function to format the console outputs according to what types of things are passed
         * @param {String}  type        A string to indicate the type of log
         * @param {String}  styles      A string of css styles
         * @param {String}  prepend     Text to prepend the output with
         * @param {Mixed}   msg         What is to be outputted to the console
         * @param {Boolean} fullStack   Indicate whether the full stack trace should be shown (false by default)
         * @param {Boolean} expandObj   Indicate whether any object being logged should be expanded in string form (false by default)
         */
        function _formatOutput(type, styles, prepend, msg, fullStack, expandObj, remote) {
            var stackString = _trace();

            // pre-process type according to calling function
            var moduleType = fullStack.substring(fullStack.indexOf('.', 0) + 1, _xIndexOf('.', fullStack, 2));

            type = (_xIndexOf('.', fullStack, 2) > 0) ? ((stackString) ? '%c' : '') + '[#][' + type.toUpperCase() + '][' + _toTitleCase(moduleType) + '] ' : ((stackString) ? '%c' : '') + '[#][' + type.toUpperCase() + '] ';

            if (msg === undefined && typeof prepend !== 'object' && typeof prepend !== 'function') { // if a plain string
                if (stackString.length > 0) {
                    console.log(type, styles, prepend, fullStack);
                } else {
                    console.log(type, prepend, fullStack);
                }
            } else if (typeof prepend === 'object') { // if a single object with no prepending text
                if (expandObj) {
                    if (stackString.length > 0) {
                        console.log(type + JSON.stringify(prepend, null, '\t'), styles, fullStack);
                    } else {
                        console.log(type + JSON.stringify(prepend, null, '\t'));
                    }
                } else {
                    if (stackString.length > 0) {
                        console.log(type, styles, prepend, fullStack);
                    } else {
                        console.log(type, prepend, fullStack);
                    }
                }
            } else { // if prepend and msg exists
                if (typeof msg === 'object' && expandObj) { // if msg is an object and it needs to be automatically expanded
                    if (stackString.length > 0) {
                        console.log(type + prepend, styles, JSON.stringify(msg, null, '\t'), fullStack);
                    } else {
                        console.log(type + prepend, JSON.stringify(msg, null, '\t'), fullStack);
                    }
                } else { // log it out as per normal
                    if (stackString.length > 0) {
                        console.log(type + prepend, styles, msg, fullStack);
                    } else {
                        console.log(type + prepend, msg, fullStack);
                    }
                }
            }
        }

        // get the stack track from the output of a dummy error message so we can provide meaningful path information
        function _trace() {
            var err = new Error();
            return err.stack;
        }

        /**
         * Function to format the full or summary stack trace to the console
         * @param  {Boolean}    fullStack Indicate whether the full stack should be shown in the console or just the filename
         * @return {String}
         */
        function _formatStackTrace(fullStack) {
            fullStack = typeof fullStack === 'undefined' ? false : fullStack;

            if (!fullStack) {
                var lines = (_trace()) ? _trace().split('\n') : '',
                    i,
                    l;

                for (i = 0; i < lines.length; i++) {
                    var val = lines[i];
                    if (val.toString()
                        .indexOf('logger.js') === -1 && val.toString() !== 'Error') {
                        return ('____ [' + lines[4].substring(lines[4].lastIndexOf('/') + 1) + ']')
                            .replace(')', '');
                    }
                }
            }

            return (console.re) ? console.re.trace() : _trace();
        }

        /**
         * Function to return the 2nd, 3rd or nth instance of a needle in a string
         * @usage   var PicPath = "/somedirectory/pics/";
         *        	var AppPath = picpath.substring(0, xIndexOf('/', PicPath, 2) + 1);
         * @param  {Number} instance    the number instance to find
         * @param  {String} needle      the needle to search for
         * @param  {String} haystack    the string to search within
         * @return {Number}             the position in the string the nth instance of the needle was found in
         */
        function _xIndexOf(needle, haystack, instance) {
            var found,
                i;

            if (instance <= (haystack.split(needle).length - 1)) {
                found = haystack.indexOf(needle);
                if (instance > 1) {
                    for (i = 1; i < instance; i++) {
                        found = haystack.indexOf(needle, found + 1);
                    }
                }
                return found;
            } else {
                return 0;
            }
        }

        /**
         * Function to title case a string
         * @param  {String} str     the string to title case
         * @return {String}
         */
        function _toTitleCase(str) {
            return str.replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }
    }
})();

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
