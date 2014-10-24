var baseUrl = chrome.extension.getURL('');

require = {
    baseUrl: baseUrl,
    paths: {
        underscore: 'libs/lodash.underscore.min',
        backbone: 'libs/backbone-min',
        jquery: 'libs/jquery-2.1.1.min',
        backboneLocalStorage: 'libs/backbone.localStorage-min',
        hbs: 'libs/require-handlebars-plugin/hbs',
        bootstrap: 'libs/bootstrap-3.2.0/js/bootstrap.min',
        bluebird: 'libs/bluebird',
        toastr: 'libs/toastr.min',
        nprogress: 'libs/nprogress',
        'underscore.string': 'libs/underscore.string.min',
        accounting: 'libs/accounting.min',
        bootstrapValidator: 'libs/bootstrapValidator.min'
    },
    hbs: {
        helpers: true,
        i18n: false,
        templateExtension: 'hbs',
        partialsUrl: ''
    },
    shim: {
        bootstrap: {
            deps: ['jquery']
        },
        bootstrapValidator: {
            deps: ['bootstrap'],
            exports: '$.fn.bootstrapValidator'
        },
        backbone: {
            deps: ['underscore',
                   'jquery'],
            exports: 'Backbone'
        },
        backboneLocalStorage: {
            deps: ['backbone']
        },
        nprogress: {
            deps: ['jquery'],
            exports: 'NProgress'
        },
        underscore: {
            exports: '_'
        }
    }
};