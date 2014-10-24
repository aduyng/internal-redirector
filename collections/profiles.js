define(function (require) {
    'use strict';
    var Super = require('./base'),
        Backbone = require('backbone'),
        BackboneLocalStorage = require('backboneLocalStorage'),
        Model = require('models/profile');

    var Collection = Super.extend({
        localStorage: new Backbone.LocalStorage("Profiles"),
        model: Model
    });

    return Collection;
});