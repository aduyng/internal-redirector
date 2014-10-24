define(function (require) {
    'use strict';
    var Super = require('./base'),
        Model = require('models/enabled-tab');

    var Collection = Super.extend({

        model: Model
    });

    return Collection;
});