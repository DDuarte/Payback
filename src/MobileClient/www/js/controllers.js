angular.module('starter.controllers', [])

    .controller('AppCtrl', function ($scope, $state, $ionicSideMenuDelegate, AuthService) {

        $scope.toggleLeft = function () {
            $ionicSideMenuDelegate.toggleLeft();
        };

        // watch for any changes in the loggedIn status
        $scope.$watch( AuthService.isLoggedIn, function ( isLoggedIn ) {
            $scope.isLoggedIn = isLoggedIn;
            $scope.currentUser = AuthService.currentUser();

            if (!$scope.isLoggedIn) {
                $state.go('login');
            }
        });

        $scope.logout = function() {
            AuthService.logout();
            $state.go('login');
        }
    })

    .controller('LoginCtrl', function ($scope, $state, Restangular, AuthService) {
        $scope.login = function () {
            $state.go('app.search');
        };

        $scope.localLogin = function(user) {

            Restangular.all('login').all('local').post({
                id: user.id,
                password: CryptoJS.SHA256(user.password).toString(CryptoJS.enc.Hex)
            }).then(function (data) {
                console.log(data);
                AuthService.login(data.user.id, data.user.email, data.access_token);
                $state.go('app.search');
            }, function (response) {
                console.log("Error: " + response.toLocaleString());
                $scope.error = response;
            });

        }
    })

    .controller('SignupCtrl', function($scope, $state, Restangular, AuthService) {

        $scope.currencies = [
            "AUD", "BGN", "BRL", "CAD",
            "CHF", "CNY", "CZK", "DKK",
            "EUR", "GBP", "HKD", "HRK",
            "HUF", "IDR", "ILS", "INR",
            "JPY", "KRW", "LTL", "MXN",
            "MYR", "NOK", "NZD", "PHP",
            "PLN", "RON", "RUB", "SEK",
            "SGD", "THB", "TRY", "USD",
            "ZAR"
        ];

        $scope.currency = $scope.currencies[$scope.currencies.indexOf("EUR")];

        $scope.signup = function (user) {
            Restangular.all('signup').all('local').post({
                id: user.id,
                password: CryptoJS.SHA256(user.password).toString(CryptoJS.enc.Hex),
                email: user.email,
                currency: $scope.currency
            }).then(function (data) {
                AuthService.login(data.user.id, data.user.email, data.access_token);
                $state.go('app.search');
            }, function (response) {
                $scope.error = response;
            });
        }
    })

    .controller('SearchCtrl', function($scope, $state, Restangular) {
        $scope.searchUsers = function(textSearch) {

            if (textSearch.length === 0) {
                $scope.users = [];
                return;
            }

            Restangular.one('users').get({"search": textSearch}).then(function(data) {
                $scope.users = data.users;
            });
        }
    })

    .controller('UserCtrl', function($scope, $state, $stateParams, Restangular) {
        $scope.user = Restangular.one('users', $stateParams.userId).get().$object;
    })

    .controller('FriendsCtrl', function ($scope, $stateParams, Restangular) {

        $scope.data = {
            showDelete: false
        };

        $scope.onFriendDelete = function(idx) {
            $scope.friends.splice(idx, 1);
        };

        $scope.friends = [
            { id: 'Reggae',  avatar_url: 'http://www.gravatar.com/avatar/00000000000000000000000000000000?d=mm&f=y' },
            { id: 'Chill',   avatar_url: 'http://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon&f=y' },
            { id: 'Dubstep', avatar_url: 'http://www.gravatar.com/avatar/00000000000000000000000000000000?d=monsterid&f=y' },
            { id: 'Indie',   avatar_url: 'http://www.gravatar.com/avatar/00000000000000000000000000000000?d=wavatar&f=y' },
            { id: 'Rap',     avatar_url: 'http://www.gravatar.com/avatar/00000000000000000000000000000000?d=retro&f=y' },
            { id: 'Cowbell', avatar_url: 'http://www.gravatar.com/avatar/00000000000000000000000000000000?d=blank&f=y' }
        ];

        //$scope.friends = Restangular.one('users', $stateParams.userId).one('friends').get().$object.friends;
    })

    .controller('FriendCtrl', function ($scope, $stateParams) {

    });
