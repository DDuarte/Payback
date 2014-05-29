angular.module('starter.controllers', [])

    .controller('AppCtrl', function ($scope, $state, $ionicSideMenuDelegate, $cookieStore, AuthService) {

        $scope.toggleLeft = function () {
            $ionicSideMenuDelegate.toggleLeft();
        };

        var user = $cookieStore.get('user');
        var access_token = $cookieStore.get('token');
        AuthService.login(user, access_token, $cookieStore);

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

    .controller('LoginCtrl', function ($scope, $state, $ionicLoading, Restangular, AuthService, AlertPopupService) {
        $scope.login = function () {
            $state.go('app.search');
        };

        $scope.localLogin = function (user) {
            $ionicLoading.show({
                template: 'Logging in...'
            });
            Restangular.all('login').all('local').post({
                id: user.id,
                password: CryptoJS.SHA256(user.password).toString(CryptoJS.enc.Hex)
            }).then(function (data) {
                AuthService.login(data.user, data.access_token);
                $ionicLoading.hide();
                $state.go('app.debts', { userId: data.user.id});
            }, function (response) {
                $ionicLoading.hide();
                AlertPopupService.createPopup("Error", response.data.error);
            });
        };

        $scope.facebookLogin = function () {
            OAuth.popup("facebook", function (err, res) {
                if (err) {
                    AlertPopupService.createPopup("Error", err);
                }
                else {
                    $ionicLoading.show({
                        template: 'Logging in...'
                    });
                    Restangular.all('login').all('facebook').post({
                        token: res.access_token
                    }).then(function(data) {
                        AuthService.login(data.user, data.access_token);
                        $ionicLoading.hide();
                        $state.go('app.debts', { userId: data.user.id});
                    },
                    function(response) {
                        $ionicLoading.hide();
                        AlertPopupService.createPopup("Error", response.data.error);
                    });
                }
            });
        };
    })

    .controller('SignupCtrl', function ($scope, $state, $ionicLoading, Restangular, AuthService, AlertPopupService) {

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
            $ionicLoading.show({
                template: 'Signing up new account...'
            });

            Restangular.all('signup').all('local').post({
                id: user.id,
                password: CryptoJS.SHA256(user.password).toString(CryptoJS.enc.Hex),
                email: user.email,
                currency: $scope.currency
            }).then(function (data) {
                AuthService.login(data.user, data.access_token);

                $ionicLoading.hide();
                $state.go('app.debts', { userId: data.user.id});
            }, function (response) {
                $ionicLoading.hide();
                AlertPopupService.createPopup("Error", response.data.error);
            });
        }

        $scope.facebookSignup = function () {

            OAuth.popup("facebook", function (err, res) {
                if (err) {
                    AlertPopupService.createPopup("Error", err);
                }
                else {
                    $ionicLoading.show({
                        template: 'Signing up new account...'
                    });

                    Restangular.all('signup').all('facebook').post({
                        token: res.access_token
                    }).then(function (data) {
                        AuthService.login(data.user, data.access_token);
                        $ionicLoading.hide();
                        $state.go('app.debts', { userId: data.user.id });
                    }, function(response) {
                        $ionicLoading.hide();
                        AlertPopupService.createPopup("Error", response.data.error);
                    });
                }
            });
        }
    })

    .controller('UserCtrl', function ($scope, $stateParams, Restangular) {
        $scope.user = Restangular.one('users', $stateParams.userId).get().$object;
    })

    .controller('DebtsCtrl', function ($scope, $stateParams, $ionicModal, $ionicPopup, Restangular, AuthService) {
        var dataStore = new DevExpress.data.ArrayStore({
            key: 'name',
            data: [
                { name: 'Credit', value: 0 },
                { name: 'Debit', value: 0 }
            ]
        });

        var dataSource = new DevExpress.data.DataSource(dataStore);

        $scope.chartOptions = {
            dataSource: dataSource,
            size: {
                height: 270
            },
            tooltip: {
                enabled: false
            },
            legend: {
                visible: false
            },
            series: [
                {
                    argumentField: 'name',
                    valueField: 'value',
                    label: {
                        visible: true,
                        connector: {
                            visible: false,
                            width: 0.5
                        },
                        position: 'inside',
                        radialOffset: -20,
                        customizeText: function(arg) {
                            return arg.argumentText + ": " + arg.valueText + " € ";
                        },
                        font: {
                            size: '15px'
                        }
                    },
                    border: {
                        width: 2,
                        visible: true
                    },
                    hoverStyle: {
                        border: {
                            width: 2,
                            visible: true
                        }
                    }
                }
            ]
        };

        Restangular.one('users', $stateParams.userId).one('debts').get().then(function(data) {
            $scope.debts = data;

            dataStore.update('Credit', { value: data.credit });
            dataStore.update('Debit', { value: data.debit });
            dataSource.load();
        });

        $ionicModal.fromTemplateUrl('templates/debtsFriendsModal.html', function (modal) {
            $scope.friendsModal = modal;
        }, {
            scope: $scope,  /// Give the modal access to the parent scope
            animation: 'slide-in-up',
            focusFirstInput: true
        });

        $scope.openFriendsModal = function () {
            $ionicPopup.show({
                title: 'Someone is owing you money?',
                scope: $scope,
                buttons: [
                    {
                        text: 'I owe money',
                        type: 'button-positive',
                        onTap: function(e) {
                            return true;
                        }
                    },
                    {
                        text: 'Someone owes me',
                        type: 'button-calm',
                        onTap: function(e) {
                            return false;
                        }
                    }
                ]
            }).then(function(res) {
                Restangular.one('users', $stateParams.userId).one('friends').get().then(function(data) {
                    $scope.friends = data.friends;
                });

                $scope.owingMoney = res;
                $scope.friendsModal.show();
            });
        };

        $scope.checkCheckedFriends = function () {
            if (!$scope.friends)
                return false;

            return _.some($scope.friends, function (f) {
                return f.isChecked;
            });
        };

        $scope.canRemoveIsChecked = function () {
            return $scope.countCheckedPayingFriends >= 2;
        };

        $scope.countCheckedPayingFriends = function () {
            if (!$scope.friends)
                return 0;

            return _.countBy($scope.friends, function (f) {
                return f.isChecked;
            }).true;
        };

        $scope.closeFriendsModal = function () {
            $scope.friendsModal.hide();
            $scope.friends = [];
        };

        $ionicModal.fromTemplateUrl('templates/debtsCreateModal.html', function (modal) {
            $scope.createDebtModal = modal;
        }, {
            scope: $scope,  /// Give the modal access to the parent scope
            animation: 'slide-in-right',
            focusFirstInput: true
        });

        $scope.openCreateDebtModal = function () {
            $scope.createDebtModal.show();
        };

        $scope.closeCreateDebtModal = function () {
            $scope.createDebtModal.hide();
        };

        $scope.commitDebts = function () {

            $scope.friends.forEach(function (friend) {
                if (!friend.isChecked)
                    return;

                Restangular.one('users', $stateParams.userId).one('debts').post({
                    // ...
                });
            });

            // ...

            Restangular.one('users', $stateParams.userId).one('debts').get().then(function(data) {
                $scope.debts = data;

                dataStore.update('Credit', { value: data.credit });
                dataStore.update('Debit', { value: data.debit });
                dataSource.load();
            });
        };

        // Cleanup the modal when we're done with it (avoid memory leaks)
        $scope.$on('$destroy', function () {
            $scope.debts = [];
            $scope.friends = [];
            $scope.friendsModal.remove();
            $scope.createDebtModal.remove();
        });
    })

    .controller('FriendsCtrl', function ($scope, $stateParams, $ionicModal, Restangular, AuthService, AlertPopupService) {
    
        if (AuthService.currentUser())
            $scope.currentUserId = AuthService.currentUser().id;

        $scope.isOwner = function (userId) {
            return $stateParams.userId === userId;
        };

        $scope.data = {
            showDelete: false,
            hasFriends: false
            
        };

        $scope.addingFriends = [];
        
        $scope.onFriendDelete = function (idx) {
            var friend = $scope.friends[idx];
            Restangular.one('users', $stateParams.userId).one('friends', friend.id).remove().then(
                function (data) {
                    $scope.friends.splice(idx, 1);
                    if ($scope.friends.length == 0) {
                        $scope.data.hasFriends = false;
                        $scope.data.showDelete = false;
                        }

                },
                function (response) {
                    AlertPopupService.createPopup('Error', response.error);
                });
        };

        $scope.isFriend = function (user) {
            return _.some($scope.friends, function (friend) {
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
            $scope.addingFriends
        };

        // Cleanup the modal when we're done with it (avoid memory leaks)
        $scope.$on('$destroy', function () {
            $scope.users = [];
            $scope.modal.remove();
        });

        $scope.addFriend = function (user) {
            if ($scope.addingFriends.indexOf(user) == -1) {
                $scope.addingFriends.push(user);
                Restangular.one('users', $stateParams.userId).all('friends').post({ id: user.id }).then(
                    function (data) {
                        $scope.addingFriends.splice($scope.addingFriends.indexOf(user),1);
                        $scope.friends.push(user);
                        $scope.data.hasFriends = true;
                    },
                    function (response) {
                        AlertPopupService.createPopup('Error', response.error);
                        $scope.addingFriends.splice($scope.addingFriends.indexOf(user),1);

                    });
            }
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

        Restangular.one('users', $stateParams.userId).one('friends').get().then(function (data) {
            $scope.friends = data.friends;

             $scope.data.hasFriends = $scope.friends.length > 0;
        });
    })

    .controller('MapCtrl', function ($scope, $ionicLoading, AlertPopupService) {

        $scope.map = {
            center: {
                latitude: 45,
                longitude: -73
            },
            zoom: 16,
            bounds: {},
            draggable: "true"
            //maps.MapTypeId.ROADMAP
        };

        function initialize() {
            var mapOptions = {
                center: new google.maps.LatLng(43.07493, -89.381388),
                zoom: 16,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(document.getElementById("map"),
                mapOptions);

            // Stop the side bar from dragging when mousedown/tapdown on the map
            google.maps.event.addDomListener(document.getElementById('map'), 'mousedown', function (e) {
                e.preventDefault();
                return false;
            });

            $scope.map = map;
        }

        $scope.centerOnMe = function () {
            if (!$scope.map) {
                return;
            }

            $scope.loading = $ionicLoading.show({
                content: 'Getting current location...',
                showBackdrop: false
            });

            navigator.geolocation.getCurrentPosition(function (pos) {
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
                    map: $scope.map
                });

                $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
                //$scope.loading.hide();
                $ionicLoading.hide();
            }, function (error) {
                $ionicLoading.hide();
                AlertPopupService.createPopup("Error", "Unable to get location" + error.message);
            });
        };

        initialize();
    })

    .controller('FriendCtrl', function ($scope, $stateParams) {

    });
