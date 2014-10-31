define(function (require) {
    'use strict';

    var Backbone = require('backbone'),
        Super = Backbone.Model,
        _ = require('underscore'),
        Profiles = require('collections/profiles'),
        Rules = require('collections/rules'),
        EnabledTabs = require('collections/enabled-tabs'),
        App = Backbone.Model.extend({

        });

    App.prototype.initialize = function (options) {
        Super.prototype.initialize.call(this, options);

        this.profiles = new Profiles();
        this.profiles.fetch();

        this.rules = new Rules();
        this.rules.fetch();

        this.enabledTabs = new EnabledTabs();
    };

    App.prototype.run = function () {
        var that = this;
        var f = function (tab) {
            var model = that.enabledTabs.findByTab(tab);

            if (!model) {
                model = that.enabledTabs.add({
                    tabId: tab.id,
                    windowId: tab.windowId
                });
                model.chrome = chrome;
                model.profiles = that.profiles;
                model.rules = that.rules;

                model.on('change:numberOfRedirectedRequests', _.throttle(function () {
                    that.updateBadgeText(model);
                }, {leading: false}));

                model.installRedirector();
            } else {
                that.enabledTabs.remove(model);
                model.uninstallRedirector();
            }
            that.updateBrowserAction(tab);
        };

        chrome.browserAction.onClicked.addListener(function (tab) {
            chrome.windows.get(tab.windowId, function (w) {
                if (w.type === "normal") {
                    f(tab);
                } else {
                    that.updateBrowserAction(tab);
                }
            });
        });

        chrome.tabs.onActivated.addListener(function (activeInfo) {
            that.updateBrowserAction(activeInfo.tabId);
        });
        chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
            switch (changeInfo.status) {
            case 'loading':
                var model = that.enabledTabs.findByTab(tab);

                if (model) {
                    model.set('numberOfRedirectedRequests', 0);
                }
                break;

            }
        });

        //get the current tab

    };


    App.prototype.updateBrowserAction = function (tab) {
        var that = this;
        var model = that.enabledTabs.findByTab(tab);
        if (model) {
            chrome.browserAction.setIcon({
                path: "images/19-enabled.png"
            });
            that.updateBadgeText(model);
        } else {
            chrome.browserAction.setIcon({
                path: "images/19-disabled.png"
            });

            chrome.browserAction.setBadgeText({
                text: ''
            });
        }
    };

    App.prototype.updateBadgeText = function (enabledTab) {
        chrome.browserAction.setBadgeText({
            text: enabledTab.get('numberOfRedirectedRequests') !== undefined ? enabledTab.get('numberOfRedirectedRequests').toString() : ''
        });
    };



    Object.defineProperty(App.prototype, 'resourceTypes', {
        get: function () {
            return this.get('resourceTypes');
        },
        set: function (val) {
            this.set('resourceTypes', val);
            return this;
        }
    });

    Object.defineProperty(App.prototype, 'profiles', {
        get: function () {
            return this.get('profiles');
        },
        set: function (val) {
            this.set('profiles', val);
            return this;
        }
    });

    return App;
});