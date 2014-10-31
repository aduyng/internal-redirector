/*global _, _s*/
define(function (require) {
    'use strict';
    var Super = require('views/page'),
        B = require('bluebird'),
        NProgress = require('nprogress'),
        Collection = require('collections/profiles'),
        Model = require('models/profile'),
        Rule = require('models/rule'),
        BootstrapSwitch = require('bootstrapSwitch'),
        FileSaver = require('FileSaver'),
        Template = require('hbs!./index.tpl');

    var Page = Super.extend({});

    Page.prototype.initialize = function (options) {
        //super(options)
        Super.prototype.initialize.call(this, options);
        this.collection = this.app.profiles;
        this.rules = this.app.rules;
    };

    Page.prototype.render = function () {
        var that = this;

        return B.resolve()
            .then(function () {
                var data = {
                    id: that.id,
                    data: that.collection.map(function (model) {
                        return _.extend(model.toJSON(), {});
                    })

                };

                that.$el.html(Template(data));

                that.mapControls();
                that.find(that.toClass('is-active')).bootstrapSwitch();
                that.find(that.toClass('is-cors-allowed')).bootstrapSwitch();

//                that.find(that.toClass('is-active')).on('switchChange.bootstrapSwitch', function(event, state) {
//                    console.log(state);
////                    that.model.save(that.serialize());
//                });

                var events = {};
                events['click ' + that.toId('new')] = 'newButtonClickHandler';
                events['click ' + that.toClass('copy')] = 'copyButtonClickHandler';
                events['click ' + that.toId('select-all')] = 'selectAllCheckboxClickHandler';
                events['click ' + that.toClass('select-checkbox')] = 'selectCheckboxClickHandler';
                events['click ' + that.toId('export')] = 'exportButtonClickHandler';
                events['click ' + that.toId('import')] = 'importButtonClickHandler';
                events['change ' + that.toId('file')] = 'fileInputChangeHandler';
                events['switchChange.bootstrapSwitch ' + that.toClass('is-active')] = 'statusChangeHandler';
                events['switchChange.bootstrapSwitch ' + that.toClass('is-cors-allowed')] = 'corsChangeHandler';
                that.delegateEvents(events);
            })
            .finally(function () {
                that.ready();
            });
    };

    Page.prototype.statusChangeHandler = function (event, state) {
        var e = $(event.currentTarget);
        var model = this.collection.get(e.data('id'));
        model.save({
            isActive: state
        });
    };

    Page.prototype.corsChangeHandler = function (event, state) {
        var e = $(event.currentTarget);
        var model = this.collection.get(e.data('id'));
        model.save({
            isCorsAllowed: state
        });
    };
    Page.prototype.selectAllCheckboxClickHandler = function (event) {
//        event.preventDefault();
        var that = this;
        var checked = that.controls.selectAll.is(':checked');
        if (checked) {
            _.forEach(that.find(that.toClass('select-checkbox')), function (checkbox) {
                $(checkbox).attr('checked', 'checked');
            });
        } else {
            _.forEach(that.find(that.toClass('select-checkbox')), function (checkbox) {
                $(checkbox).removeAttr('checked');
            });
        }
        that.updateExportButton();
    };

    Page.prototype.selectCheckboxClickHandler = function (event) {
        var that = this;
        if (that.find(that.toClass('select-checkbox:checked')).size() === that.find(that.toClass('select-checkbox')).size()) {
            that.controls.selectAll.attr('checked', 'checked');
        } else {
            that.controls.selectAll.removeAttr('checked');
        }
        that.updateExportButton();
    };

    Page.prototype.updateExportButton = function () {
        var that = this;

        if (that.find(that.toClass('select-checkbox:checked')).size() > 0) {
            that.controls.export.removeAttr('disabled');
        } else {
            that.controls.export.attr('disabled', 'disabled');
        }
    };

    Page.prototype.newButtonClickHandler = function (event) {
        event.preventDefault();

        var model = this.collection.create({
        });
        this.goTo('index/edit/id/' + model.id);
    };

    Page.prototype.copyButtonClickHandler = function (event) {
        var that = this;
        event.preventDefault();
        var e = $(event.currentTarget);

        var model = that.collection.get(e.data('id'));
        var newModel = that.collection.create(_.extend(_.omit(model.toJSON(), 'id'), {name: 'Copy of ' + model.get('name')}));

        //copy all rules
        _.forEach(that.rules.where({
            profileId: model.id
        }), function (rule) {
            that.rules.create(_.extend(_.omit(rule.toJSON(), 'id'), {profileId: newModel.id}));
        });

        this.reload();
    };

    Page.prototype.exportButtonClickHandler = function (event) {
        var that = this;
        var data = _.map(that.find(that.toClass('select-checkbox:checked')), function (checkbox) {
            var chk = $(checkbox);
            var profile = that.collection.get(chk.data('id'));
            return _.extend(profile.pick('isCorsAllowed', 'name'), {rules: that.rules.reduce(function (memo, rule) {
                if (rule.get('profileId') === profile.id) {
                    memo.push(rule.pick('pattern', 'replacement'));
                }
                return memo;
            }, [])});
        });

        var blob = new Blob([JSON.stringify(data)], {type: "application/json;charset=utf-8"});
        saveAs(blob, "internal-redirector-" + (new Date().getTime()) + '.json');
    };

    Page.prototype.importButtonClickHandler = function (event) {
        var that = this;
        that.controls.file.trigger('click');
    };

    Page.prototype.fileInputChangeHandler = function (event) {
        var that = this;

        if (event.target.files.length > 0) {
            var file = event.target.files[0];
            B.resolve()
                .then(function () {
                    NProgress.start();
                })
                .then(function () {
                    return new B(function (resolve, reject) {
                        var reader = new FileReader();
                        reader.onload = (function (theFile) {
                            return function (e) {
                                resolve(e.target.result);
                            };
                        })(file);
                        reader.readAsText(file);
                    });
                })
                .then(function (content) {
                    var dataToImport;
                    try {
                        dataToImport = JSON.parse(content);
                        if (!_.isEmpty(dataToImport) && _.isArray(dataToImport)) {
                            _.forEach(dataToImport, function (p) {
                                if(p.name && !_.isEmpty(p.rules) && _.isArray(p.rules)){
                                    var profile = that.collection.create({
                                        name: p.name,
                                        isCorsAllowed: p.isCorsAllowed
                                    });
                                    _.forEach(p.rules, function(r){
                                        that.rules.create({
                                            profileId: profile.id,
                                            pattern: r.pattern,
                                            replacement: r.replacement
                                        });
                                    });
                                }
                            });
                        }
                        that.toast.success('File has been imported!');
                        that.reload();
                    } catch (e) {
                        that.toast.error('Invalid file data!');
                    }

                })

                .finally(function () {

                    NProgress.done();
                });

        }

    };
    return Page;


});