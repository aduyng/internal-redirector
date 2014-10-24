define(function (require) {
    'use strict';

    var Backbone = require('backbone'),
        Super = Backbone.Model,
        Layout = require('./views/layout'),
        Router = require('./router'),
        B = require('bluebird'),
        App = Backbone.Model.extend({
            background: chrome.extension.getBackgroundPage().app
        });

    App.prototype.initialize = function (options) {
        Super.prototype.initialize.call(this, options);

        this.profiles = this.background.profiles;
        this.rules = this.background.rules;

    };

    App.prototype.initRouter = function () {
        this.router = new Router({
            app: this
        });
        return B.resolve();
    };

    App.prototype.initLayout = function () {
        this.layout = new Layout({
            app: this
        });

        return B.resolve();
    };
    App.prototype.run = function () {
        var that = this;

        return B.all([
            this.initLayout(),
            this.initRouter()
        ]).then(function () {
            return that.layout.render();
        }).then(function () {
            return that.router.start();
        });
    };


    Object.defineProperty(App.prototype, 'router', {
        get: function () {
            return this.get('router');
        },
        set: function (val) {
            this.set('router', val);
        }
    });

    Object.defineProperty(App.prototype, 'layout', {
        get: function () {
            return this.get('layout');
        },
        set: function (val) {
            this.set('layout', val);
        }
    });


    return App;
});