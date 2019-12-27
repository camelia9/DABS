angular.module('Dabs')

    .controller('HomeCtrl', ['$scope', '$cookies', '$http', '$window', '$stateParams', '$location', 'config', '$mdToast', function HomeController($scope, $cookies, $http, $window, $stateParams, $location, config, $mdToast) {
        Chart.defaults.global.colors = [];
        Chart.defaults.global.colors.push('#777d4d', '#c18814');
        this.expanded = false;
        var self = this;

        this.user = $stateParams.user;
        console.log(this.user);


        this.toggleMe = function () {
            this.expanded = !this.expanded;
        };

        this.showSimpleToast = function (text) {

            $mdToast.show(
                $mdToast.simple()
                    .textContent(text)
            );
        };

        //call to backend, inactivate session
        this.logout = function () {
            var url = config.backend_url + "/exit";
            $http.get(url)
                .then(function (resp) {
                    $cookies.remove('user');
                    $location.path('/');
                    $location.replace();
                    $window.location.reload();
                }, function (err) {
                    self.showSimpleToast(err.data.message);
                });

        };

        this.getLineChartData = function () {

            self.lineLabels = [];
            self.lineSeries = [];
            self.lineData = [];
            self.lineSeries.push('Number of visitors');
            var currentTimestamp = Date.now();
            self.lineLabels[6] = moment(currentTimestamp).format('dddd');
            for (i = 1; i <= 6; i++) {
                self.lineLabels[6 - i] = moment(currentTimestamp).subtract(i, 'days').format('dddd');
            }

            var url = config.backend_url + '/numberOfVisitors';

            var req = {
                "data": [7, 6, 5, 4, 3, 2, 1]
            };

            $http.post(url, req, {
                headers: {
                    "content-type": "application/json"
                }
            })
                .then(function (resp) {
                    self.lineData.push(resp.data);
                }, function (err) {
                    console.error("Loading data went wrong")
                });

            self.onGraphicClick = function (points, evt) {
                console.log(points, evt);
            };
            self.lineDatasetOverride = [{yAxisID: 'y-axis-1'}];
            self.lineOptions = {
                scales: {
                    yAxes: [
                        {
                            id: 'y-axis-1',
                            type: 'linear',
                            display: true,
                            position: 'left'
                        }
                    ]
                }
            };
        };

        // this.getLineChartData();

        this.getBarChartData = function () {
            self.chartData = [];
            self.chartLabels = [];

            var url = config.backend_url + '/richCostumers';

            $http.get(url)
                .then(function (resp) {
                    if(resp && resp.data && resp.data.length > 0){
                        self.smt = [];
                        for(var i = 0; i <resp.data.length; i++) {
                            self.chartLabels.push(resp.data[i].user);
                            self.smt.push(resp.data[i].payment);
                        }
                        self.chartData.push(self.smt);
                    }else{
                        console.error("Loading data went wrong")
                    }
                }, function (err) {
                    console.error("Loading data went wrong")
                });
            self.chartSeries = ['Number of money spent'];

        };

        // this.getBarChartData();

        this.items = [];

        this.getPictures = function () {
            var url = config.backend_url + '/recommendation';
            $http.get(url)
                .then(function (resp) {
                    self.items = resp.data;
                }, function (err) {
                    self.showSimpleToast("Data could not be retrieved");
                });
        };
        // this.getPictures();

    }]);

