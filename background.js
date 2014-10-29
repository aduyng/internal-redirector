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
        this.numberOfRedirectedRequests = -1;
    };

    App.prototype.getRedirectUrl = function (url) {
        var that = this;
        var newUrl = url;
        //get all active profiles
        var profileIds = _.map(that.profiles.where({isActive: true}), function (profile) {
            return profile.id;
        });

        //get all rules
        var rules = that.rules.filter(function (rule) {
            return _.contains(profileIds, rule.get('profileId')) && !_.isEmpty(rule.get('pattern')) && !_.isEmpty(rule.get('replacement'));
        });
        _.every(rules, function (rule) {
            try {
                var regex = new RegExp(rule.get('pattern'));
                if (regex.test(url)) {
                    newUrl = url.replace(regex, rule.get('replacement'));
                    return false;
                }
            } catch (e) {
                //console.log(e);
            }
            return true;
        });
        return newUrl;
    };

    App.prototype.run = function () {
        var that = this;
        var f = function (tabId) {
            var model = that.enabledTabs.find(function (enabledTab) {
                return enabledTab.get('tabId') === tabId;
            });

            if (!model) {
                model = that.enabledTabs.add({
                    tabId: tabId
                });
                model.on('change:numberOfRedirectedRequests', _.throttle(function () {
                    that.updateBadgeText(model);
                }, {leading: false}));
            } else {
                that.enabledTabs.remove(model);
            }
            that.installRedirector(tabId);
            that.updateBrowserAction(tabId);
        };

        chrome.browserAction.onClicked.addListener(function (tab) {
            chrome.windows.get(tab.windowId, function (w) {
                if (w.type === "normal") {
                    f(tab.id);
                } else {
                    that.updateBrowserAction(tab.id);
                }
            });
        });

        chrome.tabs.onActivated.addListener(function (activeInfo) {
            that.updateBrowserAction(activeInfo.tabId);
        });
        chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
            switch (changeInfo.status) {
            case 'loading':
                var model = that.enabledTabs.find(function (enabledTab) {
                    return enabledTab.get('tabId') === tabId;
                });

                if (model) {
                    model.set('numberOfRedirectedRequests', 0);
                }
                break;

            }
        });
    };


    App.prototype.updateBrowserAction = function (tabId) {
        var that = this;
        var model = that.enabledTabs.find(function (enabledTab) {
            return enabledTab.get('tabId') === tabId;
        });
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

    App.prototype.installRedirector = function (tabId) {
        var that = this;
        if (!that.bindedOnBeforeRequest) {
            that.bindedOnBeforeRequest = that.onBeforeRequest.bind(that);
        }
        if (!that.bindedOnHeadersReceived) {
            that.bindedOnHeadersReceived = that.onHeadersReceived.bind(that);
        }
        if (that.enabledTabs.length > 0 && !that.get('isListenerInstalled')) {
            //console.log('listeners installed');
            chrome.webRequest.onBeforeRequest.addListener(
                that.bindedOnBeforeRequest,
                // filters
                {
                    urls: ["http://*/*",
                           "https://*/*"]
                },
                // extraInfoSpec
                ["blocking"]
            );

            chrome.webRequest.onHeadersReceived.addListener(
                that.bindedOnHeadersReceived,
                // filters
                {
                    urls: ["http://*/*",
                           "https://*/*"]
                },
                // extraInfoSpec
                ["blocking",
                 "responseHeaders"]
            );

            that.set('isListenerInstalled', true);
        } else {
            chrome.webRequest.onBeforeRequest.removeListener(that.bindedOnBeforeRequest);
            chrome.webRequest.onHeadersReceived.removeListener(that.bindedOnHeadersReceived);
            //console.log('listeners removed');
            that.set('isListenerInstalled', false);
        }
    };

    App.prototype.onBeforeRequest = function (info) {
        var that = this;
        var enabledTab = that.enabledTabs.find(function (tab) {
            return tab.get('tabId') === info.tabId;
        });

        //if the tabId is not in the list of enabled tabs, then simply ignore
        if (!enabledTab) {
            return {};
        }

        var redirectUrl = that.getRedirectUrl(info.url);

        if (info.url !== redirectUrl) {
//            if (info.url.match(/\.tpl$/)) {
//                console.log('redirected', info.url, redirectUrl);
//            }
            enabledTab.set('numberOfRedirectedRequests', (enabledTab.get('numberOfRedirectedRequests') || 0) + 1);
            return {redirectUrl: redirectUrl};
        }
        return {};
    };

    App.prototype.onHeadersReceived = function (info) {
        var that = this;
        //if the tabId is not in the list of enabled tabs, then simply ignore
        if (!that.enabledTabs.find(function (tab) {
            return tab.get('tabId') === info.tabId;
        })) {
            return {};
        }

        var isCorsAllowed = that.profiles.find(function (profile) {
            return profile.get('isActive') && profile.get('isCorsAllowed');
        });

        if (isCorsAllowed) {
//            console.log(info.url);
            var responseHeaders = info.responseHeaders || [];
            responseHeaders.push({
                name: 'Access-Control-Allow-Origin',
                value: '*'});
            return {responseHeaders: responseHeaders};
        }
        return {};
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

//    Object.defineProperty(App.prototype, 'isEnabled', {
//        get: function () {
//            return this.get('isEnabled');
//        }
//    });

    return App;
});