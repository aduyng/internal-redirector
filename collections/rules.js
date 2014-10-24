define(function (require) {
    'use strict';
    var Super = require('./base'),
        Backbone = require('backbone'),
        BackboneLocalStorage = require('backboneLocalStorage'),
        Model = require('models/rule');

    var Collection = Super.extend({
        localStorage: new Backbone.LocalStorage("Rules"),
        model: Model
    });

    return Collection;
});