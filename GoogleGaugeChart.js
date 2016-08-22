/**
 * @ngdoc function
 * @name Google Annotation Chart
 * @author Yianni Ververis
 * @email yianni.ververis@qlik.com
 * @description
 * Google Gauge Chart as found
 * https://developers.google.com/chart/interactive/docs/gallery/gauge
 */

define( [
	"qlik", 
	"https://www.gstatic.com/charts/loader.js"
	], function ( qlik ) {
		"use strict";
		return {
			initialProperties: {
				qHyperCubeDef: {
					qDimensions: [],
					qMeasures: [],
					qInitialDataFetch: [{
						qWidth: 2,
						qHeight: 900
					}]
				}
			},
			definition: {
				type: "items",
				component: "accordion",
				items: {
					// dimensions: {
					// 	uses: "dimensions",
					// 	min: 1,
					// 	max: 1
					// },
					measures: {
						uses: "measures",
						min: 2,
						max: 2
					},
					// sorting: {
					// 	uses: "sorting"
					// },
					settings : {
						uses : "settings",
						items: {
							Chart: {
								type: "items",
								label: "Google Gauge Settings (Coming up!)",
								items: {
								}
							}
						}
					}
				}
			},

			support: {
				snapshot: true,
				export: true,
				exportData: true
			},
			
			app: qlik.currApp(this),

			paint: function ($element,layout) {
				var vars = {
					v: '1.0.1',
					id: layout.qInfo.qId,
					height: $element.height(),
					width: $element.width(),
				}
				this.$scope.element = $element;

				vars.css = '\n\
					#' + vars.id + ' {\n\
						height: ' + vars.height + 'px; \n\
						text-align: center; \n\
					}\n\
				';
				$("<style>").html(vars.css).appendTo("head");

				console.info('%c Google Gauge Chart ' + vars.v + ': ', 'color: red', '#' + vars.id + ' Loaded!');

				//needed for export
				return qlik.Promise.resolve();
			},
			
			// define HTML template
			template: '\
				<div qv-extension class="google-gauge-chart" id="{{id}}">\n\
					<div id="{{id}}_gauge"></div>\n\
				</div>',

			// Controller for binding
			controller: ['$scope','$rootScope', function($scope,$rootScope){
				var vars = {
					title: $scope.$parent.layout.qHyperCube.qMeasureInfo[0].qFallbackTitle,
					options: {
						current: $scope.$parent.layout.qHyperCube.qDataPages[0].qMatrix[0][0].qNum,
						total: $scope.$parent.layout.qHyperCube.qDataPages[0].qMatrix[0][1].qNum,
						minorTicks: 5,
					},
				}
				$scope.id = $scope.$parent.layout.qInfo.qId;
				vars.options.redFrom = vars.options.total - Math.round(vars.options.total*0.1);
				vars.options.yellowFrom = vars.options.total - Math.round(vars.options.total*0.3);
				$scope.chart = null;
				$scope.data = null;
				if (typeof google.visualization === 'undefined') {
					google.charts.load('current', {'packages':['gauge']});
				}
				google.charts.setOnLoadCallback(drawChart);
				function drawChart() {                
					$scope.data = google.visualization.arrayToDataTable([
						['Label', 'Value'],
						// [vars.title, vars.options.current],
						['', vars.options.current],
					]);
					$scope.options = {
						max: vars.options.total,
						width: $scope.element.width(), height: $scope.element.height(),
						redFrom: vars.options.redFrom, redTo: vars.options.total,
						yellowFrom: vars.options.yellowFrom, yellowTo: vars.options.redFrom,
						minorTicks: vars.options.minorTicks
					};
					$scope.chart = new google.visualization.Gauge(document.getElementById($scope.id+'_gauge'));
					
					$scope.chart.draw($scope.data, $scope.options);
				}
				$scope.$watch('$parent.layout.qHyperCube.qDataPages[0].qMatrix[0][0].qNum', function(newValue, oldValue) {
					if ($scope.data) {
						$scope.data.setValue(0, 1, newValue);
						$scope.chart.draw($scope.data, $scope.options);
					}
				});
			}]
		};

	} );
