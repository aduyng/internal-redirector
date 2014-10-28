/*global _, _s*/
define(function (require) {
    'use strict';
    var Super = require('views/page'),
        B = require('bluebird'),
        Collection = require('collections/profiles'),
        BootstrapSwitch = require('bootstrapSwitch'),
        Template = require('hbs!./index.tpl');

    var Page = Super.extend({});

    Page.prototype.initialize = function (options) {
        //super(options)
        Super.prototype.initialize.call(this, options);
        this.collection = this.app.profiles;
    };

    Page.prototype.render = function () {
        var that = this;

        return B.resolve()
            .then(function () {
                var data = {
                    id: that.id,
                    data: that.collection.map(function (model) {
                        return _.extend(model.toJSON(), {});
                    })

                };

                that.$el.html(Template(data));

                that.mapControls();
                that.find(that.toClass('is-active')).bootstrapSwitch();
                that.find(that.toClass('is-cors-allowed')).bootstrapSwitch();

//                that.find(that.toClass('is-active')).on('switchChange.bootstrapSwitch', function(event, state) {
//                    console.log(state);
////                    that.model.save(that.serialize());
//                });

                var events = {};
                events['click ' + that.toId('new')] = 'newButtonClickHandler';
                events['switchChange.bootstrapSwitch ' + that.toClass('is-active')] = 'statusChangeHandler';
                events['switchChange.bootstrapSwitch ' + that.toClass('is-cors-allowed')] = 'corsChangeHandler';
                that.delegateEvents(events);
            })
            .finally(function () {
                that.ready();
            });
    };

    Page.prototype.statusChangeHandler = function(event, state) {
        var e = $(event.currentTarget);
        var model = this.collection.get(e.data('id'));
        model.save({
            isActive: state
        });
    };

    Page.prototype.corsChangeHandler = function(event, state) {
        var e = $(event.currentTarget);
        var model = this.collection.get(e.data('id'));
        model.save({
            isCorsAllowed: state
        });
    };

    Page.prototype.newButtonClickHandler = function (event) {
        event.preventDefault();

        var model = this.collection.create({
        });
        this.goTo('index/edit/id/' + model.id);
    };


    return Page;


});