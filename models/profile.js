define(function (require) {
    'use strict';
    var Super = require('./base');

    var Model = Super.extend({
        defaults: {
            name: 'New Profile',
            rules: []
        }
    });


    return Model;
});