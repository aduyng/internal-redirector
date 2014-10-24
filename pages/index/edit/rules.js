/*global _, _s*/
define(function (require) {
    'use strict';
    var Super = require('views/base'),
        _ = require('underscore'),
        B = require('bluebird'),
        Template = require('hbs!./rules.tpl');

    var View = Super.extend({});

    View.prototype.initialize = function (options) {
        //super(options)
        Super.prototype.initialize.call(this, options);

        this.profile = options.profile;
        this.rules = options.rules;
    };

    View.prototype.render = function () {
        var that = this;
        return B.resolve()
            .then(function () {
                that.__render();
                that.mapControls();

                var events = {};

                events['click ' + that.toId('new')] = 'newButtonClickHandler';
                events['click ' + that.toClass('remove')] = 'removeButtonClickHandler';
                events['change ' + that.toClass('pattern')] = 'patternChangeHandler';
                events['change ' + that.toClass('replacement')] = 'replacementChangeHandler';

                that.delegateEvents(events);
            });


    };

    View.prototype.replacementChangeHandler = function (event) {
        var that = this;
        var e = $(event.currentTarget);
        var model = that.rules.get(e.data('id'));
        model.save({replacement: e.val().trim()});
    };

    View.prototype.patternChangeHandler = function (event) {
        var that = this;
        var e = $(event.currentTarget);
        var model = that.rules.get(e.data('id'));
        model.save({pattern: e.val().trim()});
    };

    View.prototype.__render = function () {
        var that = this;

        that.$el.html(Template({
            id: that.id,
            data: _.map(that.rules.where({profileId: that.profile.id}), function (model) {
                return model.toJSON();
            })
        }));
    };

    View.prototype.newButtonClickHandler = function (event) {
        var that = this;

        that.rules.create({
            profileId: that.profile.id
        });
        that.__render();
    };

    View.prototype.removeButtonClickHandler = function (event) {
        var that = this;
        var e = $(event.currentTarget);
        var model = that.rules.get(e.data('id'));
        that.rules.remove(model);
        that.__render();
    };

    return View;


});