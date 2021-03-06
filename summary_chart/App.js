Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    recommendationField: 'c_Recommendation',
    model: 'PortfolioItem/Feature',
    
    items: [
        {xtype:'container', itemId:'selector_box'},
        {xtype:'container',itemId:'display_box'}
    ],
    launch: function() {
        var field = this.recommendationField;
        var model = this.model;
        
        this._getValuesForField(model,field).then({
            scope: this,
            success: function(values) {
                this._makeChart(model,field,values);
            },
            failure: function(msg) {
                 Ext.Msg.alert(msg);
            }
        });

    },
    _getValuesForField: function(model,field) {
        var deferred = Ext.create('Deft.Deferred');
        
        Rally.data.ModelFactory.getModel({
            type: model,
            success: function(model) {
                model.getField(field).getAllowedValueStore().load({
                    callback: function(records, operation, success) {
                        var values = Ext.Array.map(records, function(record) {
                            return record.get('StringValue');
                        });
                        deferred.resolve(values);
                    }
                });
            },
            failure: function(msg) { deferred.reject(msg); }
        });  
        
        return deferred.promise;
    },
    _makeChart: function(model,field,values) {
        console.log(model,field,values);
        
        var container = this.down('#display_box');
        container.removeAll();
        
        container.add({
            xtype: 'rallychart',
            storeType: 'Rally.data.lookback.SnapshotStore',
            storeConfig: this._getStoreConfig(model,field),
            calculatorType: 'Rally.technicalservices.ProgressCalculator',
            calculatorConfig: {
                fieldName: field,
                fieldValues: values,
                granularity: 'hour',
                startDate: Rally.util.DateTime.add(new Date(), 'hour', -30)
            },
            chartConfig: this._getChartConfig(),
            chartColors: ['#000', '#F66349','#8DC63F','#F8B500']
        });
    },
    
    _getStoreConfig: function(model,field) {
        return { 
            find: {
                _TypeHierarchy: model
            },
            fetch: [field],
            hydrate: [field]
        };
    },
    
    _getChartConfig: function() {
        return {
            chart: {
                zoomType: 'xy'
            },
            title: {
                text: 'Learning Flow (Features)'
            },
            xAxis: {
                tickmarkPlacement: 'on',
                tickInterval: 1
            },
            yAxis: [
                {
                    title: {
                        text: ' '
                    }
                }
            ],
            plotOptions: {
                series: {
                    marker: {
                        enabled: false
                    }
                },
                area: {
                    stacking: 'normal'
                }
            }
        };
    }
    
});
