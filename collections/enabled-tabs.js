define(function (require) {
    'use strict';
    var Super = require('./base'),
        Model = require('models/enabled-tab');

    var Collection = Super.extend({
        model: Model
    });

    Collection.prototype.findByTab = function (tab) {
        var that = this;
        return that.find(function (enabledTab) {
            return enabledTab.get('tabId') === tab.id && enabledTab.get('windowId') === tab.windowId;
        });
    };

    return Collection;
});