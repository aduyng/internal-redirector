/*global _*/
define(function (require) {
    'use strict';
    var Super = require('views/base'),
        Nav = require('views/nav'),
        Boostrap = require('bootstrap'),
        B = require('bluebird'),
        Template = require("hbs!views/layout.tpl");

    var Layout = Super.extend({
        el: 'body'
    });

    Layout.prototype.initialize = function (options) {
        Super.prototype.initialize.call(this, options);

        if (!options.app) {
            throw new Error("app must be passed!");
        }

        this.app = options.app;
    };

    Layout.prototype.render = function () {
        var that = this;

        that.$el.html(Template({
            id: that.id
        }));

        that.mapControls();
        that.controls.container = $('#container');
        that.controls.mainContent = $('#main-content');


        that.nav = new Nav({
            el: that.controls.nav
        });
        that.nav.render();
        return B.resolve();

    };


    return Layout;
});