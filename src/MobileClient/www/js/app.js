// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('PaybackApp', ['ionic', 'starter.controllers', 'restangular', 'ngStorage'])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .service('AlertPopupService', ['$ionicPopup', function ($ionicPopup) {

        this.createPopup = function (headerMessage, bodyMessage, okAction) {
            $ionicPopup.alert({
                title: headerMessage,
                content: bodyMessage
            }).then(function (res) {
                if (okAction)
                    okAction();
            });
        }
    }])

    // singleton, this service can be injected into any route in order to check the current user session information
    .provider('AuthService', function AuthServiceProvider() {

        var currentUser;

        function token() {
            if (currentUser && currentUser.access_token)
                return currentUser.access_token;
            else
                return null;
        }

        function CurrentUser() {
            this.login = function (id, email, access_token) {

                if (id && access_token) {
                    currentUser = {};
                    currentUser.id = id;
                    currentUser.email = email;
                    currentUser.access_token = access_token;
                }

            };

            this.logout = function () {
                currentUser = null;
            };

            this.isLoggedIn = function () {
                return currentUser != null;
            };

            this.currentUser = function () {
                return currentUser;
            };

            this.token = token;
        }

        this.$get = function() {
            return new CurrentUser();
        }
    })

    .config(function ($stateProvider, $urlRouterProvider, RestangularProvider, AuthServiceProvider) {

        // base API Url
        RestangularProvider.setBaseUrl('http://localhost:1337');
        //RestangularProvider.setDefaultHeaders({"x-access-token": $sessionStorage.access_token});

        RestangularProvider.addFullRequestInterceptor(function (element, operation, what, url, headers, queryParameters) {
            return {
                headers: _.extend(headers, {'x-access-token': AuthServiceProvider.$get().token()})
            }
        });

        // configure states
        $stateProvider

            .state('login', {
                url: "/login",
                templateUrl: "templates/login.html",
                controller: "LoginCtrl"
            })

            .state('signup', {
                url: "/signup",
                templateUrl: "templates/signup.html",
                controller: "SignupCtrl"
            })

            .state('app', {
                url: "/app",
                abstract: true,
                templateUrl: "templates/menu.html",
                controller: 'AppCtrl'
            })

            .state('app.user', {
                url: "/users/:userId",
                views: {
                    'app': {
                        templateUrl: "templates/user.html",
                        controller: "UserCtrl"
                    }
                }
            })

            .state('app.search', {
                url: "/search",
                views: {
                    'app': {
                        templateUrl: "templates/search.html",
                        controller: "SearchCtrl"
                    }
                }
            })

            .state('app.browse', {
                url: "/browse",
                views: {
                    'app': {
                        templateUrl: "templates/browse.html"
                    }
                }
            })

            .state('app.friends', {
                url: "/users/:userId/friends",
                views: {
                    'app': {
                        templateUrl: "templates/friends.html",
                        controller: 'FriendsCtrl'
                    }
                }
            })

            .state('app.single', {
                url: "/friends/:friendId",
                views: {
                    'app': {
                        templateUrl: "templates/friend.html",
                        controller: 'FriendCtrl'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/login');
    });

