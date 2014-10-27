define(function (require) {
    'use strict';
    var Super = require('views/page'),
        B = require('bluebird'),
        Dialog = require('views/controls/dialog'),
        RulesView = require('./edit/rules'),
        Rules = require('collections/rules'),
        BootstapValidator = require('bootstrapValidator'),
        BootstrapSwitch = require('bootstrapSwitch'),
        Template = require('hbs!./edit.tpl');

    var Page = Super.extend({});

    Page.prototype.initialize = function (options) {
        //super(options)
        Super.prototype.initialize.call(this, options);

        if (options.params.id) {
            this.model = this.app.profiles.get(options.params.id);
        } else {
            this.model = this.app.profiles.create();
        }
    };

    Page.prototype.render = function () {
        var that = this;
        B.resolve()
            .then(function () {
                that.$el.html(Template({
                    id: that.id,
                    data: that.model.toJSON()
                }));

                that.mapControls();

                that.rules = new Rules(that.model.get('rules'));
                that.rulesView = new RulesView({
                    el: that.controls.rules,
                    rules: that.app.rules,
                    profile: that.model
                });

                that.rulesView.render();

                //enable validator
                that.controls.form.bootstrapValidator();

                //enable status
                that.controls.isActive.bootstrapSwitch();
                that.controls.isActive.on('switchChange.bootstrapSwitch', function(event, state) {
                    that.model.save(that.serialize());
                });

                var events = {};

                events['change ' + that.toId('name')] = 'nameChangeHandler';
                events['click ' + that.toId('back')] = 'backButtonClickHandler';
                events['click ' + that.toId('delete')] = 'deleteButtonClickHandler';

                that.delegateEvents(events);
            })
            .then(function () {
                that.ready();
            });

    };


    Page.prototype.deleteButtonClickHandler = function (event) {
        var that = this;

        var confirmDlg = new Dialog({
            body: 'Are you sure you want to delete this profile?',
            buttons: [
                {
                    id: 'yes',
                    label: "Yes. I'm sure.",
                    iconClass: 'icon-check',
                    buttonClass: 'btn-danger'
                },
                {
                    id: 'no',
                    label: 'Nope!',
                    iconClass: 'icon-remove',
                    buttonClass: 'btn-default',
                    autoClose: true
                }
            ]
        });
        confirmDlg.on('yes', function () {
            that.model.destroy();
            that.toast.success('Profile has been deleted successfully.');
            confirmDlg.close();
            that.back();
        });
    };

    Page.prototype.serialize = function(){
        var data = Super.prototype.serialize.call(this);
        data.isActive = this.controls.isActive.bootstrapSwitch('state');
        return data;
    };

    Page.prototype.nameChangeHandler = function (event) {
        var that = this;
        that.model.save(that.serialize());
    };


    return Page;


});