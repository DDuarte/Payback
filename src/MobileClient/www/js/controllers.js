angular.module('starter.controllers', [])

    .controller('AppCtrl', function ($scope, $state, $ionicSideMenuDelegate, AuthService) {

        $scope.toggleLeft = function () {
            $ionicSideMenuDelegate.toggleLeft();
        };

        // watch for any changes in the loggedIn status
        $scope.$watch(AuthService.isLoggedIn, function (isLoggedIn) {
            $scope.isLoggedIn = isLoggedIn;
            $scope.currentUser = AuthService.currentUser();

            if (!$scope.isLoggedIn) {
                $state.go('login');
            }
        });

        $scope.logout = function () {
            AuthService.logout();
            $state.go('login');
        }
    })

    .controller('LoginCtrl', function ($scope, $state, Restangular, AuthService, AlertPopupService) {
        $scope.login = function () {
            $state.go('app.search');
        };

        $scope.localLogin = function (user) {

            Restangular.all('login').all('local').post({
                id: user.id,
                password: CryptoJS.SHA256(user.password).toString(CryptoJS.enc.Hex)
            }).then(function (data) {
                AuthService.login(data.user, data.access_token);
                $state.go('app.search');
            }, function (response) {
                AlertPopupService.createPopup("Error", response.data.error);
            });

        }
    })

    .controller('SignupCtrl', function ($scope, $state, Restangular, AuthService, AlertPopupService) {

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
                AuthService.login(data.user, data.access_token);
                $state.go('app.search');
            }, function (response) {
                AlertPopupService.createPopup("Error", response.data.error);
            });
        }
    })

    .controller('SearchCtrl', function ($scope, $state, Restangular) {
        $scope.searchUsers = function (textSearch) {

            if (textSearch.length === 0) {
                $scope.users = [];
                return;
            }

            Restangular.one('users').get({"search": textSearch}).then(function (data) {
                $scope.users = data.users;
            });
        }
    })

    .controller('UserCtrl', function ($scope, $state, $stateParams, Restangular) {
        $scope.user = Restangular.one('users', $stateParams.userId).get().$object;
    })

    .controller('FriendsCtrl', function ($scope, $stateParams, $ionicModal, $ionicPopup, Restangular, AuthService, AlertPopupService) {

        $scope.currentUserId = AuthService.currentUser().id;
        $scope.isOwner = function(userId) {
            return $stateParams.userId === userId;
        };

        $scope.data = {
            showDelete: false
        };

        $scope.onFriendDelete = function (idx) {
            var friend = $scope.friends[idx];
            Restangular.one('users', $stateParams.userId).one('friends', friend.id).remove().then(
                function (data) {
                    $scope.friends.splice(idx, 1);
                },
                function (response) {
                    AlertPopupService.createPopup("Error", response.error);
                });
        };

        $scope.isFriend = function(user) {
            return _.some($scope.friends, function(friend) {
                return user.id === friend.id;
            });
        };

        $ionicModal.fromTemplateUrl('templates/searchModal.html', function (modal) {
            $scope.modal = modal;
        }, {
            scope: $scope,  /// Give the modal access to the parent scope
            animation: 'slide-in-up',
            focusFirstInput: true
        });

        $scope.openModal = function () {
            $scope.modal.show();
        };
        $scope.closeModal = function () {
            $scope.modal.hide();
            $scope.users = [];
        };

        //Cleanup the modal when we're done with it (avoid memory leaks)
        $scope.$on('$destroy', function () {
            $scope.users = [];
            $scope.modal.remove();
        });

        $scope.addFriend = function (user) {
            Restangular.one('users', $stateParams.userId).all('friends').post({ id: user.id }).then(
                function (data) {
                    $scope.friends.push(user);
                },
                function (response) {
                    AlertPopupService.createPopup("Error", response.error);
                });
        };

        $scope.searchUsers = function (textSearch) {

            if (textSearch.length === 0) {
                $scope.users = [];
                return;
            }

            Restangular.one('users').get({"search": textSearch}).then(function (data) {
                $scope.users = data.users;
            });
        };

        Restangular.one('users', $stateParams.userId).one('friends').get().then(function(data) {
            $scope.friends = data.friends;
        });
    })

    .controller('FriendCtrl', function ($scope, $stateParams) {

    });
