/*global _, _s*/
define(function (require) {
    'use strict';
    var Super = require('views/page'),
        B = require('bluebird'),
        Collection = require('collections/profiles'),
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

                var events = {};
                events['click ' + that.toId('new')] = 'newButtonClickHandler';
                that.delegateEvents(events);
            })
            .finally(function () {
                that.ready();
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