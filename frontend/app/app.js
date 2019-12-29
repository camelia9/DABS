console.error = function(){};

angular.module('Dabs', [
    'ngMaterial',
    'ui.router',
    'ngCookies',
    'chart.js'

])
    .constant('config', {
        "backend_url": "http://localhost:3000"
    })
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', '$mdThemingProvider',
        function myAppConfig($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $mdThemingProvider) {


            $mdThemingProvider.theme('default')
                .primaryPalette('indigo')

                .accentPalette('orange');

            $locationProvider.html5Mode(true);


            $urlRouterProvider.otherwise("/");


            $stateProvider
                .state("login", {
                    url: "/",
                    templateUrl: "app/login/login.html",
                    controller: "LoginCtrl as LC",
                    resolve: {
                        isNotAuth: ["$q", "$http", "$cookies", "$state", "config",   function($q, $http, $cookies, $state, config){

                            var deffered = $q.defer();

                            var url = config.backend_url + "/getUserByIp";

                            $http.post(url, {})
                                .then(function (response) {

                                    var result = response.data;

                                    if (!result.user_token) {
                                        deffered.resolve();
                                    }

                                    deffered.reject();

                                    $cookies.put("user_token", result.user_token);

                                    return $state.go("home", {
                                        user_token: result.user_token
                                    });


                                }, function (err) {

                                    deffered.resolve();
                                });

                            return deffered.promise;



                        }]
                    }
                })
                .state("signup", {
                    url: "/signup",
                    templateUrl: "app/signup/signup.html",
                    controller: "SignUpCtrl as SC",
                })
                .state("home", {
                    url: "/:user/home",
                    templateUrl: "app/home/home.html",
                    controller: "HomeCtrl as HC"
                })
                .state("home.recommend", {
                    url: "^/:user/recommend",
                    templateUrl: "app/recommend/recommend.html",
                    controller: "RecommendCtrl as RC"
                })
                .state("home.try", {
                    url: '^/:user/try',
                    templateUrl: 'app/try/try.html',
                    controller: 'TryCtrl as TC'

                });

            $httpProvider.defaults.headers.common = {};//TO BE REMOVED
            $httpProvider.defaults.headers.post = {};
            $httpProvider.defaults.headers.put = {};
            $httpProvider.defaults.headers.patch = {};
        }])


    .controller('AppCtrl', ['$scope', '$location', '$cookies', '$window', '$http', '$rootScope', '$mdSidenav', "$state", "config", function AppCtrl($scope, $location, $cookies, $window, $http, $rootScope, $mdSidenav, $state, config) {

        $rootScope.$on('$stateChangeStart',
            function (event, toState, toParams, fromState, fromParams, options) {
                var cookie_usr = $cookies.get('user');
                console.log(fromState.name + "-" + toState.name);
                if (fromState.name !== "login") {
                    console.log("fromState not login");
                    if (cookie_usr) {
                        if (toParams.user === cookie_usr) {
                            return;
                        }
                        event.preventDefault();
                        console.log("has cookie");
                        if (toState.name === "login" || toState.name === "") {//could remove toState.name, but this function would be run again
                            console.log("going to home");
                            return $state.go("home", {
                                user: cookie_usr
                            });
                        }

                        return $state.go(toState.name, {
                            user: cookie_usr
                        });

                    }
                    else {
                        console.log("no cookie");
                        console.log(fromState.name);
                        if (toState.name === "login") {
                            return;
                        }
                        var url = config.backend_url + "/getUserByIp";
                        event.preventDefault();
                        $http.post(url, {})
                            .then(function (response) {

                                var result = response.data;

                                if (!result.user) {
                                    return $state.go("login");
                                }

                                $cookies.put("user", result.user);

                                return $state.go(toState.name, {
                                    user: result.user
                                });


                            }, function (err) {
                            });
                    }
                }

            });


    }]);
