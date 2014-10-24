//
////region the following options will be moved to chrome local profiles
//var options = {
//    redirectTypes: ["stylesheet",
//                    "script",
//                    "image",
//                    "xmlhttprequest"],
//    matchingUrls: ["https://*.sabresonicweb.com/*.tpl",
//                   "https://*.sabresonicweb.com/*.js"],
//    developmentMode: false
//};
////endregion
//
//
//function getRedirectUrl(url) {
//    'use strict';
//
//    var redirectUrl = url.replace(/^.+\/responsive\//i, chrome.extension.getURL('resources/responsive/'));
//    if (!options.developmentMode) {
//        redirectUrl = redirectUrl.replace('/build/', '/');
//    }
//    return redirectUrl;
//}
//
//chrome.webRequest.onBeforeRequest.addListener(
//    function (info) {
//        var redirectUrl = getRedirectUrl(info.url);
//        return {redirectUrl: redirectUrl};
//    },
//    // filters
//    {
//        urls: options.matchingUrls,
//        types: options.redirectTypes
//    },
//    // extraInfoSpec
//    ["blocking"]);

define(function (require) {
    'use strict';

    var Backbone = require('backbone'),
        Super = Backbone.Model,
        Profiles = require('collections/profiles'),
        Rules = require('collections/rules'),
        Collection = require('collections/base'),
        App = Backbone.Model.extend({

        });

    App.prototype.initialize = function (options) {
        Super.prototype.initialize.call(this, options);

        this.resourceTypes = new Collection();
        this.resourceTypes.add({
            id: 'stylesheet',
            name: 'Stylesheet'
        });
        this.resourceTypes.add({
            id: 'script',
            name: 'Script'
        });

        this.resourceTypes.add({
            id: 'image',
            name: 'Image'
        });

        this.resourceTypes.add({
            id: 'xmlhttprequest',
            name: 'XMLHttpRequest'
        });

        this.resourceTypes.add({
            id: 'object',
            name: 'Object'
        });

        this.profiles = new Profiles();
        this.profiles.fetch();

        this.rules = new Rules();
        this.rules.fetch();
    };

    App.prototype.getRedirectUrl = function (url) {
        var that = this;
        var newUrl = url;
        //get all active profiles
        var profileIds = that.profiles.pluck('id');
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
            }
            return true;
        });
        return newUrl;
    };

    App.prototype.run = function () {
        var that = this;
        that.on('change:isEnabled', that.onIsEnabledChange.bind(that));
        that.onIsEnabledChange();
        chrome.browserAction.onClicked.addListener(function (tab) {
            that.isEnabled = !that.isEnabled;
        });

    };
    App.prototype.onIsEnabledChange = function () {
        var that = this;
        if (!that.bindedOnBeforeRequest) {
            that.bindedOnBeforeRequest = that.onBeforeRequest.bind(that);
        }
        if (that.isEnabled) {
//            console.log('enabled');
            chrome.browserAction.setIcon({
                path: "images/19-enabled.png"
            });


            chrome.webRequest.onBeforeRequest.addListener(
                that.bindedOnBeforeRequest,
                // filters
                {
                    urls: ["<all_urls>"]
                },
                // extraInfoSpec
                ["blocking"]
            );
        } else {
//            console.log('disabled');
            chrome.browserAction.setIcon({
                path: "images/19-disabled.png"
            });
            chrome.webRequest.onBeforeRequest.removeListener(that.bindedOnBeforeRequest);
        }
    };

    App.prototype.onBeforeRequest = function (info) {
        var that = this;

        var redirectUrl = that.getRedirectUrl(info.url);
//        console.log(info.url, redirectUrl);
        return {redirectUrl: redirectUrl};
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

    Object.defineProperty(App.prototype, 'isEnabled', {
        get: function () {
            return this.get('isEnabled');
        },
        set: function (val) {
            this.set('isEnabled', val);
            return this;
        }
    });

    return App;
});