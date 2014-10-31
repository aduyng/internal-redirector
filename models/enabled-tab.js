define(function (require) {
    'use strict';
    var Super = require('./base');

    var Model = Super.extend({
    });

    Model.prototype.installRedirector = function () {
        var that = this;
        var filters = {
            urls: ["http://*/*",
                   "https://*/*"],
            tabId: that.get('tabId'),
            windowId: that.get('windowId')
        };

        if (!that.bindedOnBeforeRequest) {
            that.bindedOnBeforeRequest = that.onBeforeRequest.bind(that);
        }
        if (!that.bindedOnHeadersReceived) {
            that.bindedOnHeadersReceived = that.onHeadersReceived.bind(that);
        }
        that.activeProfiles = that.profiles.where({isActive: true});
        if (that.activeProfiles.length === 0) {
            return false;
        }
        var profileIds = _.map(that.activeProfiles, function (profile) {
            return profile.id;
        });

        //get all rules
        that.matchedRules = that.rules.filter(function (rule) {
            return _.contains(profileIds, rule.get('profileId')) && !_.isEmpty(rule.get('pattern')) && !_.isEmpty(rule.get('replacement'));
        });
        if (that.matchedRules.length === 0) {
            return false;
        }

        if (!that.get('isOnBeforeRequestInstalled')) {
            that.chrome.webRequest.onBeforeRequest.addListener(
                that.bindedOnBeforeRequest,
                // filters
                filters,
                // extraInfoSpec
                ["blocking"]
            );

            that.set('isOnBeforeRequestInstalled', true);
            //console.log('OnBeforeRequestInstalled');
        }

        if (!that.get('isOnHeadersReceivedInstalled')) {
            var isCorsAllowed = _.find(that.activeProfiles, function (profile) {
                return profile.get('isCorsAllowed');
            });

            if (isCorsAllowed) {
                that.chrome.webRequest.onHeadersReceived.addListener(
                    that.bindedOnHeadersReceived,
                    // filters
                    filters,
                    // extraInfoSpec
                    ["blocking",
                     "responseHeaders"]
                );
            }
            that.set('isOnHeadersReceivedInstalled', true);
            //console.log('OnHeadersReceivedInstalled');
        }
        return true;
    };

    Model.prototype.uninstallRedirector = function () {
        var that = this;
        if (that.get('isOnBeforeRequestInstalled')) {
            that.chrome.webRequest.onBeforeRequest.removeListener(that.bindedOnBeforeRequest);
            that.set('isOnBeforeRequestInstalled', false);
            //console.log('OnBeforeRequest uninstalled');
        }
        if (that.get('isOnHeadersReceivedInstalled')) {
            that.chrome.webRequest.onHeadersReceived.removeListener(that.bindedOnHeadersReceived);
            that.set('isOnHeadersReceivedInstalled', false);
            //console.log('onHeadersReceived uninstalled');
        }
    };


    Model.prototype.onBeforeRequest = function (info) {
        var that = this;
        var redirectUrl = that.getRedirectUrl(info.url);

        if (info.url !== redirectUrl) {
            that.set('numberOfRedirectedRequests', (that.get('numberOfRedirectedRequests') || 0) + 1);
            return {redirectUrl: redirectUrl};
        }
        return {};
    };

    Model.prototype.onHeadersReceived = function (info) {
        var that = this;

        var isCorsAllowed = that.profiles.find(function (profile) {
            return profile.get('isActive') && profile.get('isCorsAllowed');
        });

        if (isCorsAllowed) {
//            //console.log(info.url);
            var responseHeaders = info.responseHeaders || [];
            responseHeaders.push({
                name: 'Access-Control-Allow-Origin',
                value: '*'});
            return {responseHeaders: responseHeaders};
        }
        return {};
    };

    Model.prototype.getRedirectUrl = function (url) {
        var that = this;
        var newUrl = url;

        _.every(that.matchedRules, function (rule) {
            try {
                var regex = new RegExp(rule.get('pattern'));
                newUrl = url.replace(regex, rule.get('replacement'));
                return newUrl === url;
            } catch (e) {
                //console.log(e);
            }
            return true;
        });
        return newUrl;
    };
    return Model;
});