/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 * @author gullfaxi171 / http://gullfaxi.fr
 */
/*global THREE, console */

// This set of controls performs orbiting, dollying (zooming), and panning. It maintains
// the "up" direction as +Y, unlike the TrackballControls. Touch on tablet and phones is
// supported.
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finter swipe
//
// This is a drop-in replacement for (most) TrackballControls used in examples.
// That is, include this js file and wherever you see:
//    	controls = new THREE.TrackballControls( camera );
//      controls.target.z = 150;
// Simple substitute "OrbitControls" and the control should work as-is.


// Gullfaxi fix : replace element by element[0] to work with angular EVERYWHERE
THREE.OrbitControls = function ( object, domElement ) {

    this.object = object;
    this.domElement = ( domElement !== undefined ) ? domElement : document;

    // API

    // Set to false to disable this control
    this.enabled = true;

    // "target" sets the location of focus, where the control orbits around
    // and where it pans with respect to.
    this.target = new THREE.Vector3();
    // center is old, deprecated; use "target" instead
    this.center = this.target;

    // This option actually enables dollying in and out; left as "zoom" for
    // backwards compatibility
    this.noZoom = false;
    this.zoomSpeed = 1.0;
    // Limits to how far you can dolly in and out
    this.minDistance = 0;
    this.maxDistance = Infinity;

    // Set to true to disable this control
    this.noRotate = false;
    this.rotateSpeed = 1.0;

    // Set to true to disable this control
    this.noPan = false;
    this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

    // Set to true to automatically rotate around the target
    this.autoRotate = false;
    this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI; // radians

    // Set to true to disable use of the keys
    this.noKeys = false;
    // The four arrow keys
    this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

    ////////////
    // internals

    var scope = this;

    var EPS = 0.000001;

    var rotateStart = new THREE.Vector2();
    var rotateEnd = new THREE.Vector2();
    var rotateDelta = new THREE.Vector2();

    var panStart = new THREE.Vector2();
    var panEnd = new THREE.Vector2();
    var panDelta = new THREE.Vector2();

    var dollyStart = new THREE.Vector2();
    var dollyEnd = new THREE.Vector2();
    var dollyDelta = new THREE.Vector2();

    var phiDelta = 0;
    var thetaDelta = 0;
    var scale = 1;
    var pan = new THREE.Vector3();

    var lastPosition = new THREE.Vector3();

    var STATE = { NONE : -1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };
    var state = STATE.NONE;

    // add timer to control auto restart of the autoRotate
    var timer;

    // events

    var changeEvent = { type: 'change' };


    this.rotateLeft = function ( angle ) {

        if ( angle === undefined ) {

            angle = getAutoRotationAngle();

        }

        thetaDelta += angle;

    };

    this.rotateUp = function ( angle ) {

        if ( angle === undefined ) {

            angle = getAutoRotationAngle();

        }

        phiDelta += angle;

    };

    // pass in distance in world space to move left
    this.panLeft = function ( distance ) {

        var panOffset = new THREE.Vector3();
        var te = this.object.matrix.elements;
        // get X column of matrix
        panOffset.set( te[0], te[1], te[2] );
        panOffset.multiplyScalar(-distance);

        pan.add( panOffset );

    };

    // pass in distance in world space to move up
    this.panUp = function ( distance ) {

        var panOffset = new THREE.Vector3();
        var te = this.object.matrix.elements;
        // get Y column of matrix
        panOffset.set( te[4], te[5], te[6] );
        panOffset.multiplyScalar(distance);

        pan.add( panOffset );
    };

    // main entry point; pass in Vector2 of change desired in pixel space,
    // right and down are positive
    this.pan = function ( delta ) {

        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

        if ( scope.object.fov !== undefined ) {

            // perspective
            var position = scope.object.position;
            var offset = position.clone().sub( scope.target );
            var targetDistance = offset.length();

            // half of the fov is center to top of screen
            targetDistance *= Math.tan( (scope.object.fov/2) * Math.PI / 180.0 );



            // we actually don't use screenWidth, since perspective camera is fixed to screen height
            scope.panLeft( 2 * delta.x * targetDistance / element[0].clientHeight );
            scope.panUp( 2 * delta.y * targetDistance / element[0].clientHeight );

        } else if ( scope.object.top !== undefined ) {

            // orthographic
            scope.panLeft( delta.x * (scope.object.right - scope.object.left) / element[0].clientWidth );
            scope.panUp( delta.y * (scope.object.top - scope.object.bottom) / element[0].clientHeight );

        } else {

            // camera neither orthographic or perspective - warn user
            console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );

        }

    };

    this.dollyIn = function ( dollyScale ) {

        if ( dollyScale === undefined ) {

            dollyScale = getZoomScale();

        }

        scale /= dollyScale;

    };

    this.dollyOut = function ( dollyScale ) {

        if ( dollyScale === undefined ) {

            dollyScale = getZoomScale();

        }

        scale *= dollyScale;

    };

    this.update = function () {

        var position = this.object.position;
        var offset = position.clone().sub( this.target );

        // angle from z-axis around y-axis

        var theta = Math.atan2( offset.x, offset.z );

        // angle from y-axis

        var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

        if ( this.autoRotate ) {

            this.rotateLeft( getAutoRotationAngle() );

        }

        theta += thetaDelta;
        phi += phiDelta;

        // restrict phi to be between desired limits
        phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

        // restrict phi to be betwee EPS and PI-EPS
        phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

        var radius = offset.length() * scale;

        // restrict radius to be between desired limits
        radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );

        // move target to panned location
        this.target.add( pan );

        offset.x = radius * Math.sin( phi ) * Math.sin( theta );
        offset.y = radius * Math.cos( phi );
        offset.z = radius * Math.sin( phi ) * Math.cos( theta );

        position.copy( this.target ).add( offset );

        this.object.lookAt( this.target );

        thetaDelta = 0;
        phiDelta = 0;
        scale = 1;
        pan.set(0,0,0);

        if ( lastPosition.distanceTo( this.object.position ) > 0 ) {

            this.dispatchEvent( changeEvent );

            lastPosition.copy( this.object.position );

        }

    };


    function getAutoRotationAngle() {

        return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

    }

    function getZoomScale() {

        return Math.pow( 0.95, scope.zoomSpeed );

    }


    // Gullfaxi : 2 functions to start the autorotate and restart it later, with a delay
    function stopAutoRotate() {
        scope.autoRotateSpeed = 0;
    }

    function restartAutoRotateWithDelay ( delay ) {

        // clear the previous timer if it is already running
        clearTimeout(timer);

        // start a new timer
        timer = setTimeout(function() {
            scope.autoRotateSpeed = -0.5;
        }, delay);
    }

    function onMouseDown( event ) {

        // Gullfaxi fix : stopping the autorotate
        stopAutoRotate();

        if ( scope.enabled === false ) { return; }
        event.preventDefault();

        if ( event.button === 0 ) {
            if ( scope.noRotate === true ) { return; }

            state = STATE.ROTATE;

            rotateStart.set( event.clientX, event.clientY );

        } else if ( event.button === 1 ) {
            if ( scope.noZoom === true ) { return; }

            state = STATE.DOLLY;

            dollyStart.set( event.clientX, event.clientY );

        } else if ( event.button === 2 ) {
            if ( scope.noPan === true ) { return; }

            state = STATE.PAN;

            panStart.set( event.clientX, event.clientY );

        }

        // Greggman fix: https://github.com/greggman/three.js/commit/fde9f9917d6d8381f06bf22cdff766029d1761be
        // Gullfaxi fix : replace addElementListener by bind() to work with angular
        scope.domElement.bind( 'mousemove', onMouseMove);
        scope.domElement.bind( 'mouseup', onMouseUp);

    }

    function onMouseMove( event ) {

        if ( scope.enabled === false ) return;

        event.preventDefault();

        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

        if ( state === STATE.ROTATE ) {

            if ( scope.noRotate === true ) return;

            rotateEnd.set( event.clientX, event.clientY );
            rotateDelta.subVectors( rotateEnd, rotateStart );

            // rotating across whole screen goes 360 degrees around
            scope.rotateLeft( 2 * Math.PI * rotateDelta.x / element[0].clientWidth * scope.rotateSpeed );
            // rotating up and down along whole screen attempts to go 360, but limited to 180
            scope.rotateUp( 2 * Math.PI * rotateDelta.y / element[0].clientHeight * scope.rotateSpeed );

            rotateStart.copy( rotateEnd );

        } else if ( state === STATE.DOLLY ) {

            if ( scope.noZoom === true ) return;

            dollyEnd.set( event.clientX, event.clientY );
            dollyDelta.subVectors( dollyEnd, dollyStart );

            if ( dollyDelta.y > 0 ) {

                scope.dollyIn();

            } else {

                scope.dollyOut();

            }

            dollyStart.copy( dollyEnd );

        } else if ( state === STATE.PAN ) {

            if ( scope.noPan === true ) return;

            panEnd.set( event.clientX, event.clientY );
            panDelta.subVectors( panEnd, panStart );

            scope.pan( panDelta );

            panStart.copy( panEnd );

        }

        // Greggman fix: https://github.com/greggman/three.js/commit/fde9f9917d6d8381f06bf22cdff766029d1761be
        scope.update();

    }

    function onMouseUp( /* event */ ) {

        // Gullfaxi fix : restarting the autorotate after 5sec
        restartAutoRotateWithDelay(5500);

        if ( scope.enabled === false ) return;

        // Greggman fix: https://github.com/greggman/three.js/commit/fde9f9917d6d8381f06bf22cdff766029d1761be
        // Gullfaxi fix : replace removeElementListener by unbind() to work with angular
        scope.domElement.unbind('mousemove');
        scope.domElement.unbind('mouseup');

        state = STATE.NONE;

    }

    function onMouseWheel( event ) {

        if ( scope.enabled === false || scope.noZoom === true ) return;

        var delta = 0;

        if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

            delta = event.wheelDelta;

        } else if ( event.detail ) { // Firefox

            delta = - event.detail;

        }

        if ( delta > 0 ) {

            scope.dollyOut();

        } else {

            scope.dollyIn();

        }

    }

    function onKeyDown( event ) {

        if ( scope.enabled === false ) { return; }
        if ( scope.noKeys === true ) { return; }
        if ( scope.noPan === true ) { return; }

        // pan a pixel - I guess for precise positioning?
        // Greggman fix: https://github.com/greggman/three.js/commit/fde9f9917d6d8381f06bf22cdff766029d1761be
        var needUpdate = false;

        switch ( event.keyCode ) {

            case scope.keys.UP:
                scope.pan( new THREE.Vector2( 0, scope.keyPanSpeed ) );
                needUpdate = true;
                break;
            case scope.keys.BOTTOM:
                scope.pan( new THREE.Vector2( 0, -scope.keyPanSpeed ) );
                needUpdate = true;
                break;
            case scope.keys.LEFT:
                scope.pan( new THREE.Vector2( scope.keyPanSpeed, 0 ) );
                needUpdate = true;
                break;
            case scope.keys.RIGHT:
                scope.pan( new THREE.Vector2( -scope.keyPanSpeed, 0 ) );
                needUpdate = true;
                break;
        }

        // Greggman fix: https://github.com/greggman/three.js/commit/fde9f9917d6d8381f06bf22cdff766029d1761be
        if ( needUpdate ) {

            scope.update();

        }

    }

    function touchstart( event ) {

        // Gullfaxi fix : stop autorotate while moving
        stopAutoRotate();

        if ( scope.enabled === false ) { return; }

        switch ( event.touches.length ) {

            case 1:	// one-fingered touch: rotate
                if ( scope.noRotate === true ) { return; }

                state = STATE.TOUCH_ROTATE;

                rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                break;

            case 2:	// two-fingered touch: dolly
                if ( scope.noZoom === true ) { return; }

                state = STATE.TOUCH_DOLLY;

                var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                var distance = Math.sqrt( dx * dx + dy * dy );
                dollyStart.set( 0, distance );
                break;

            case 3: // three-fingered touch: pan
                if ( scope.noPan === true ) { return; }

                state = STATE.TOUCH_PAN;

                panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                break;

            default:
                state = STATE.NONE;

        }
    }

    function touchmove( event ) {

        if ( scope.enabled === false ) { return; }

        event.preventDefault();
        event.stopPropagation();

        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

        switch ( event.touches.length ) {

            case 1: // one-fingered touch: rotate
                if ( scope.noRotate === true ) { return; }
                if ( state !== STATE.TOUCH_ROTATE ) { return; }

                rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                rotateDelta.subVectors( rotateEnd, rotateStart );

                // rotating across whole screen goes 360 degrees around
                scope.rotateLeft( 2 * Math.PI * rotateDelta.x / element[0].clientWidth * scope.rotateSpeed );
                // rotating up and down along whole screen attempts to go 360, but limited to 180
                scope.rotateUp( 2 * Math.PI * rotateDelta.y / element[0].clientHeight * scope.rotateSpeed );

                rotateStart.copy( rotateEnd );
                break;

            case 2: // two-fingered touch: dolly
                if ( scope.noZoom === true ) { return; }
                if ( state !== STATE.TOUCH_DOLLY ) { return; }

                var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                var distance = Math.sqrt( dx * dx + dy * dy );

                dollyEnd.set( 0, distance );
                dollyDelta.subVectors( dollyEnd, dollyStart );

                if ( dollyDelta.y > 0 ) {

                    scope.dollyOut();

                } else {

                    scope.dollyIn();

                }

                dollyStart.copy( dollyEnd );
                break;

            case 3: // three-fingered touch: pan
                if ( scope.noPan === true ) { return; }
                if ( state !== STATE.TOUCH_PAN ) { return; }

                panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                panDelta.subVectors( panEnd, panStart );

                scope.pan( panDelta );

                panStart.copy( panEnd );
                break;

            default:
                state = STATE.NONE;

        }

    }

    function touchend( /* event */ ) {

        // Gullfaxi fix : restarting the autorotate after 5sec
        restartAutoRotateWithDelay(5500);

        if ( scope.enabled === false ) { return; }

        state = STATE.NONE;
    }

    // Gullfaxi fix : replace addElementListener by bind() to work with angular
    this.domElement.bind( 'contextmenu', function ( event ) { event.preventDefault(); });
    this.domElement.bind( 'mousedown', onMouseDown);
    this.domElement.bind( 'mousewheel', onMouseWheel);
    this.domElement.bind( 'DOMMouseScroll', onMouseWheel); // firefox

    this.domElement.bind( 'keydown', onKeyDown);

    this.domElement.bind( 'touchstart', touchstart);
    this.domElement.bind( 'touchend', touchend);
    this.domElement.bind( 'touchmove', touchmove);

};

THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
/**
 * @author alteredq / http://alteredqualia.com/
 * @author mr.doob / http://mrdoob.com/
 */

var Detector = {

    canvas: !! window.CanvasRenderingContext2D,
    webgl: ( function () { try { var canvas = document.createElement( 'canvas' ); return !! window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ); } catch( e ) { return false; } } )(),
    workers: !! window.Worker,
    fileapi: window.File && window.FileReader && window.FileList && window.Blob,

    getWebGLErrorMessage: function () {

        var element = document.createElement( 'div' );
        element.id = 'webgl-error-message';
        element.style.fontFamily = 'monospace';
        element.style.fontSize = '13px';
        element.style.fontWeight = 'normal';
        element.style.textAlign = 'center';
        element.style.background = '#fff';
        element.style.color = '#000';
        element.style.padding = '1.5em';
        element.style.width = '400px';
        element.style.margin = '5em auto 0';

        if ( ! this.webgl ) {

            element.innerHTML = window.WebGLRenderingContext ? [
                'Your graphics card does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br />',
                'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'
            ].join( '\n' ) : [
                'Your browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br/>',
                'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'
            ].join( '\n' );

        }

        return element;

    },

    addGetWebGLMessage: function ( parameters ) {

        var parent, id, element;

        parameters = parameters || {};

        parent = parameters.parent !== undefined ? parameters.parent : document.body;
        id = parameters.id !== undefined ? parameters.id : 'oldie';

        element = Detector.getWebGLErrorMessage();
        element.id = id;

        parent.appendChild( element );

    }

};
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
var ngPhotosphere;
(function (ngPhotosphere) {
    (function (Control) {
        Control[Control["all"] = 0] = "all";
        Control[Control["wheel"] = 1] = "wheel";
        Control[Control["pointer"] = 2] = "pointer";
        Control[Control["none"] = 3] = "none";
    })(ngPhotosphere.Control || (ngPhotosphere.Control = {}));
    var Control = ngPhotosphere.Control;
    var params = (function () {
        function params(width, height, speed, resolution, controls) {
            var vm = this;
            vm.setWidth(width);
            vm.setHeight(height);
            vm.setSpeed(speed);
            vm.setResolution(resolution);
            vm.setControls(controls);
        }
        params.prototype.setWidth = function (width) {
            var vm = this;
            if (typeof width !== "undefined" && !isNaN(width)) {
                vm.width = width;
            }
            else {
                vm.width = params.DEFAULT_WIDTH;
            }
        };
        params.prototype.setHeight = function (height) {
            var vm = this;
            if (typeof height !== "undefined" && !isNaN(height)) {
                vm.height = height;
            }
            else {
                vm.height = params.DEFAULT_HEIGHT;
            }
        };
        params.prototype.setSpeed = function (speed) {
            var vm = this;
            if (typeof speed !== "undefined" && !isNaN(speed)) {
                vm.speed = Math.min(Math.max(speed, params.MIN_SPEED), params.MAX_SPEED);
            }
            else {
                vm.speed = params.DEFAULT_SPEED;
            }
        };
        params.prototype.setResolution = function (resolution) {
            var vm = this;
            if (typeof resolution !== "undefined" && !isNaN(resolution)) {
                vm.resolution = Math.min(Math.max(resolution, params.MIN_RESOLUTION), params.MAX_RESOLUTION);
            }
            else {
                vm.resolution = params.DEFAULT_RESOLUTION;
            }
        };
        params.prototype.setControls = function (controls) {
            var vm = this;
            if (typeof controls !== "undefined") {
                vm.controls = controls;
            }
            else {
                vm.controls = params.DEFAULT_CONTROLS;
            }
        };
        params.DEFAULT_WIDTH = 640;
        params.DEFAULT_HEIGHT = 480;
        params.DEFAULT_SPEED = 0;
        params.MIN_SPEED = 0;
        params.MAX_SPEED = 20;
        params.DEFAULT_RESOLUTION = 30;
        params.MAX_RESOLUTION = 80;
        params.MIN_RESOLUTION = 10;
        params.DEFAULT_CONTROLS = Control.all;
        return params;
    })();
    ngPhotosphere.params = params;
    var Directive = (function () {
        function Directive() {
        }
        return Directive;
    })();
    var ngScopeElement = (function (_super) {
        __extends(ngScopeElement, _super);
        function ngScopeElement() {
            _super.call(this);
            var vm = this;
            var directive = {};
            directive.restrict = "A";
            directive.compile = function compile(tElement, tAttrs, transclude) {
                return {
                    pre: function preLink(scope, iElement, iAttrs, controller) {
                        scope[iAttrs.ngScopeElement] = iElement;
                    }
                };
            };
            vm.directive = directive;
        }
        ngScopeElement.IID = "ngScopeElement";
        ngScopeElement.$inject = [];
        return ngScopeElement;
    })(Directive);
    ngPhotosphere.ngScopeElement = ngScopeElement;
    var photosphere = (function (_super) {
        __extends(photosphere, _super);
        function photosphere($window) {
            _super.call(this);
            this.fullscreen = false;
            var vm = this;
            vm.id = Math.round(10000 * Math.random());
            var css = '<style> ul{list-style-type:none;margin:0;padding:0;overflow:hidden}li{float:left}a:link,a:visited{display:block;width:120px;font-weight:700;color:#FFF;background-color:#98bf21;text-align:center;padding:4px;text-decoration:none}a:active,a:hover{background-color:#7A991A}</style>';
            var navbar = '<ul> <li><a href="" ng-click="fullscreen()">See fullscreen</a></li> </ul>';
            vm.template = css + '<div ng-scope-element="' + vm.id + '">' + navbar + '</div>';
            vm.fullscreen = false;
            var directive = {};
            directive.priority = 0;
            directive.restrict = "EA";
            directive.template = vm.template;
            directive.scope = {
                src: '@',
                height: '=?',
                width: '=?',
                speed: '=?',
                resolution: '=?',
                controls: '=?'
            };
            directive.link = function (scope, element, attrs) {
                var params = new ngPhotosphere.params(parseInt(attrs.width, 10), parseInt(attrs.height, 10), parseInt(attrs.speed, 10), parseInt(attrs.resolution, 10), ngPhotosphere.Control[attrs.controls]);
                var rotateSpeed = -0.5 * params.speed;
                var windowWidth = $window.innerWidth;
                var windowHeight = $window.innerHeight;
                var webglEl = scope[vm.id];
                var scene = new THREE.Scene();
                var camera = new THREE.PerspectiveCamera(75, params.width / params.height, 1, 1000);
                camera.position.x = 0.1;
                camera.fov = 1.0;
                var renderer = Detector.webgl ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
                renderer.setSize(params.width, params.height);
                var geometry = new THREE.SphereGeometry(100, params.resolution, params.resolution);
                THREE.ImageUtils.crossOrigin = 'use-credential';
                var mesh = new THREE.MeshBasicMaterial({
                    map: THREE.ImageUtils.loadTexture(attrs.src)
                });
                var sphere = new THREE.Mesh(geometry, mesh);
                sphere.scale.x = -1;
                scene.add(sphere);
                var controls = new THREE.OrbitControls(camera, webglEl);
                if (params.controls === Control.wheel || params.controls === Control.none) {
                    controls.enabled = false;
                }
                controls.noPan = true;
                controls.noZoom = true;
                controls.autoRotate = true;
                controls.autoRotateSpeed = rotateSpeed;
                webglEl.append(renderer.domElement);
                render();
                function render() {
                    if (vm.fullscreen) {
                        updateSize();
                    }
                    controls.update();
                    requestAnimationFrame(render);
                    renderer.render(scene, camera);
                }
                function updateCamera(w, h) {
                    camera.aspect = w / h;
                    camera.fov = Math.max(40, Math.min(100, camera.fov));
                    camera.updateProjectionMatrix();
                }
                function updateSize() {
                    if (windowWidth !== $window.innerWidth || windowHeight !== $window.innerHeight) {
                        windowWidth = $window.innerWidth;
                        windowHeight = $window.innerHeight;
                        updateCamera(windowWidth, windowHeight);
                        renderer.setSize(windowWidth, windowHeight);
                    }
                }
                scope.fullscreen = function () {
                    if (vm.fullscreen) {
                        updateCamera(params.width, params.height);
                        renderer.setSize(params.width, params.height);
                        webglEl[0].style.position = '';
                        document.documentElement.style.overflow = 'auto';
                    }
                    else {
                        updateCamera(params.width, params.height);
                        renderer.setSize(windowWidth, windowHeight - 28);
                        webglEl[0].style.position = 'absolute';
                        webglEl[0].style.left = '0px';
                        webglEl[0].style.top = '0px';
                        window.scrollTo(0, 0);
                        document.documentElement.style.overflow = 'hidden';
                    }
                    vm.fullscreen = vm.fullscreen ? false : true;
                };
                function onMouseWheel(event) {
                    event.preventDefault();
                    if (event.wheelDeltaY) {
                        camera.fov -= event.wheelDeltaY * 0.05;
                    }
                    else if (event.wheelDelta) {
                        camera.fov -= event.wheelDelta * 0.05;
                    }
                    else if (event.detail) {
                        camera.fov += event.detail * 1.0;
                    }
                    camera.fov = Math.max(40, Math.min(100, camera.fov));
                    camera.updateProjectionMatrix();
                }
                if (params.controls === Control.all || params.controls === Control.wheel) {
                    webglEl.bind('mousewheel', onMouseWheel);
                    webglEl.bind('DOMMouseScroll', onMouseWheel);
                }
            };
            vm.directive = directive;
        }
        photosphere.IID = "photosphere";
        photosphere.$inject = ["$window"];
        return photosphere;
    })(Directive);
    ngPhotosphere.photosphere = photosphere;
})(ngPhotosphere || (ngPhotosphere = {}));
angular.module("photosphere", []);
angular.module("photosphere").directive(ngPhotosphere.ngScopeElement.IID, function () { return new ngPhotosphere.ngScopeElement().directive; });
angular.module("photosphere").directive(ngPhotosphere.photosphere.IID, function ($window) { return new ngPhotosphere.photosphere($window).directive; });