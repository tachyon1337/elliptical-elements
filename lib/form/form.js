/*
 * =============================================================
 * elliptical.form prototype extension
 * =============================================================
 * Copyright (c) 2014 S.Francis, MIS Interactive
 * Licensed MIT
 *
 * Dependencies:
 * elliptical-form
 *
 * extends the elliptical form factory
 *
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('elliptical-form'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-form'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory($);
    }
}(this, function ($) {

    var prototype_ = {

        __setScope: $.noop,

        /**
         * init
         * @private
         */
        _initController: function () {
            this._data.data = null;
            this._data.notificationElement = null;
            this._setFormElement();
            this.__setFormScope();
            this._initForm();

        },

        __setFormScope:function(){
            var scopeProp = this.options.scope;
            var cxt=this.options.context;
            if(!cxt){
                cxt=$$.elliptical.context;
            }
            if (scopeProp && typeof scopeProp !== 'undefined') {
                var formContext=this.__cloneObject(cxt[scopeProp]);
                this.$scope = formContext;
            }

        },

        _initForm: function(){

        },

        /**
         * events: bind _onValidate to the submitEvent delegate
         *         bind _onReset to DOM reset event
         * @private
         */
        _events: function () {
            //this._event($(document), this.options.submitEvent, this._onValidate.bind(this));
            //this._event($(document), this.options.resetEvent, this._onReset.bind(this));
            $(document).on(this.options.submitEvent,this._onValidate.bind(this));
            $(document).on(this.options.resetEvent,this._onReset.bind(this));
            this._onEvents();
        },

        /**
         *  bind _onReset published reset event(can be called, .e.g., from the slide notification panel)
         * @private
         */
        _subscriptions:function(){
            this._subscribe(this.options.resetSubscription,this._onReset.bind(this));
            this._onSubscriptions();
        },

        _onEvents: $.noop,

        _onSubscriptions: $.noop,


        /**
         * intermediate form validation:
         * if schema declared, pass to Validation service, otherwise, pass on to submit mediator
         * @param event {Object}
         * @param data {Object}
         * @private
         */
        _onValidate: function (event, data) {
            if(this.__verifyFormElement(data.element)){
                (this.options.schema) ? this._validate(data) : this.___onSubmit(data);
            }
        },

        /**
         * verify submitting form element is in the component node tree
         * @param target {Object} element
         * @private
         */
        __verifyFormElement:function(target){
            var thisForm=this._form();
            if(thisForm[0]){
                return (thisForm[0]===target);
            }else{
                return false;
            }

        },

        /**
         * calls internal method to reset form
         * @param event {Object}
         * @param data {Object}
         * @private
         */
        _onReset: function (event, data) {
            this._reset();
            this._killNotification();
        },

        /**
         * submit mediator method:
         * if service is declared, internally submit, otherwise pass off to dev _onSubmit
         * @param data {Object}
         * @private
         */
        ___onSubmit:function(data){
            (this.options.service) ? this.__onSubmit(data) : this._onSubmit(data);
        },

        /**
         * if Validation service has been injected, passes to validation, otherwise passes to internal __onSubmit
         * @param data {Object}
         * @private
         */
        _validate: function (data) {
            var Validation = this.service('Validation');
            var body = data.body;
            var schema = this.options.schema;
            var formElement = this._data.form;
            var method = formElement.attr('method');
            var action = formElement.attr('action');
            if (Validation !== undefined) {
                this._callValidation(Validation, data, body, method, action, schema);
            } else {
                this.___onSubmit(data);
            }

        },

        /**
         * uses the validate method of the Validation service to validate
         * @param Validation {Object/Function}
         * @param data {Object}
         * @param body {Object}
         * @param method {String}
         * @param action {String}
         * @param schema {String}
         * @private
         */
        _callValidation: function (Validation, data, body, method, action, schema) {
            var self = this;
            body=this._onBeforeValidate(body);
            Validation.post(body,schema, function (err, form) {
                if (err) {
                    form.action = action;
                    form.method = method;
                    self._onError(err, form);
                    self._renderError(form);
                } else {
                    self.___onSubmit(data);
                }
            });
        },

        _onSubmit: $.noop,

        _onSuccess: $.noop,

        _onError: $.noop,

        _onBeforeSubmit:function(data){
            return data;
        },

        _onBeforeValidate:function(body){
            return body;
        },


        /**
         * internal method to submit form to service
         * @param data {Object}
         * @private
         */
        __onSubmit: function (data) {
            //show notification message
            this._notify('info', this.options.processingMsg, false);
            var body = this._onBeforeSubmit(data.body);
            var self = this;
            var model = this.options.service;
            if (model) {
                var formElement = this._data.form;
                var method = formElement.attr('method').toLowerCase();
                var Model = this.service(model);
                Model[method](body, function (err, result) {
                    if (!err) {
                        //trigger success event
                        self._triggerEvent(self.options.successEvent,result);
                        //dev handled _onSuccess
                        self._onSuccess(result);
                        //render success form
                        self._renderSuccess(result);
                        //show notification status
                        self._sendNotification(err, result);
                    } else {
                        //trigger failure event
                        self._triggerEvent(self.options.failureEvent,err);
                        self._sendNotification(err, null);
                        //dev handled _onError
                        self._onError(err, data);
                        //render error form
                        self._renderError({});
                    }
                });
            } else {
                var err_ = {};
                err_.statusCode = 400;
                err_.message = 'Model undefined';
                this._onError(err_, data);
                this._renderError({});
            }
        },

        /**
         * render success form-->pass $scope to re-render form
         * @param data {Object}
         * @private
         */
        _renderSuccess: function (data) {
            var Validation = this.service('Validation');
            data = Validation.onSuccess(data);
            var mergedData = this._mergeFormData(data);
            this._renderForm(mergedData);

        },



        /**
         * render error form-->merge validation onError method with $scope to re-render form
         * @param data {Object}
         * @param msg {String}
         * @private
         */
        _renderError: function (data,msg) {
            var Validation = this.service('Validation');
            data = Validation.onError(data,msg);
            var mergedData = this._mergeFormData(data);
            this._renderForm(mergedData);
        },

        /**
         * merges a data object with the current $scope
         * @param data {Object}
         * @returns {Object}
         * @private
         */
        _mergeFormData: function (data) {
            return $.extend({}, this.$scope, data);
        },

        /**
         * renders form
         * @param form
         * @private
         */
        _renderForm: function (form) {
            var self=this;
            this.$render(form, function(){
                self.__rebindTemplate();
            });
        },


        /**
         * set the form element
         * @private
         */
        _setFormElement: function () {
            var form = this.element.find('form');
            this._data.form = form;

        },

        /**
         * display notification
         * @param err {Object}
         * @param data {Object}
         * @param delay {Number}
         * @private
         */
        _sendNotification: function (err, data,delay) {
            var self=this;
            if(delay===undefined){
                delay=1000;
            }
            var opts = {};
            opts.terminate = true;
            opts.data = data;
            if (!err) {
                opts.slideIn = true;
            } else {
                opts.cssClass = 'error';
                (typeof err.message === 'string') ? opts.message = err.message : opts.message = 'Submission Error...';
            }
            setTimeout(function(){
                self._notification($('body'), opts);
            },delay);

        },

        /**
         * instantiates a notification element
         * @param element {Object}
         * @param opts {Object}
         * @param callback {Function}
         * @private
         */
        _notification: function (element, opts, callback) {
            //save ref to the notification element
            this._data.notificationElement = element;
            var self = this;
            if (typeof opts === 'function') {
                callback === opts;
                opts = {};
            } else if (!opts) {
                opts = {};
            }

            opts.slideIn = opts.slideIn || false;


            if (opts.slideIn) {
                opts.terminateTimeout = opts.terminateTimeout || 100;
                opts.cssModalClass = opts.cssModalClass || 'forms';

                setTimeout(function () {
                    /* destroy notification widget */
                    if (element.data('ellipsisNotification')) {
                        element.notification('destroy');
                    }
                    opts.model = self._getNotificationModel();
                    opts.context = 'model';
                    /* show slide notification */
                    element.slideNotification(opts);

                }, opts.terminateTimeout);

                if (callback) {
                    callback();
                }

            } else {

                opts.terminateTimeout = opts.terminateTimeout || 1000;
                opts.inline = opts.inline || false;
                opts.terminateDelay = opts.terminateDelay || 1000;
                opts.cssClass = opts.cssClass || 'info';
                opts.message = opts.message || 'processing...';
                opts.terminate = opts.terminate || false;

                element.notification(opts);
                element.notification('show');

                if (callback) {
                    callback();
                }
            }
        },

        /**
         * constructs a notification model for notifications
         * @returns {Object}
         * @private
         */
        _getNotificationModel: function () {
            var model = {};
            var formElement = this._data.form;
            var method = formElement.attr('method');
            var action = formElement.attr('action');
            //reset
            if (method && method.toLowerCase() === 'post') {
                model.reset = true;
            }
            //previous location
            model.referrer = {
                url: document.referrer
            };

            //redirect
            if (this.options.redirect) {
                model.redirect = {
                    url: this.options.redirect
                };
                if (this.options.redirectLabel) {
                    model.redirect.label = this.options.redirectLabel;
                }
            }

            return model;

        },

        _killNotifier:function(){
            var element=$('body');
            if (element.data('ellipsisNotification')) {
                element.notification('destroy');
            }
        },

        /**
         * destroy slide notification element
         * @private
         */
        _killNotification:function(){
            var element=this._data.notificationElement;
            if(element[0]){
                element.slideNotification('hide');
            }
        },

        /**
         * internal scope change handler
         * @param result {Object}
         * @private
         */
        __$scopePropsChange:function(result){
            var self=this;
            var element=this.element;
            var label=element.find('.ui-semantic-label');
            if(label[0] && label.hasClass('error')){
                label.removeClass('error').removeClass('visible').addClass('hidden');
            }
            result.changed.forEach(function(obj){
                if(obj){
                    var changed=self._objectChange(obj);
                    if(changed){
                        for(var key in changed){
                            if (changed.hasOwnProperty(key)) {
                                var input=element.find('input[name="' + key + '"]');
                                if(input[0] && input.hasClass('error')){
                                    input.removeClass('error');
                                }
                            }
                        }
                    }
                }

            });


            var changed_=this._objectChange;
            if(result.changed && result.changed.length){
                result.changed.forEach(function(obj){
                    var changed=changed_(obj);
                    self._$scopePropsChange(changed);
                });
            }

        },


        /**
         * reset form
         * @private
         */
        _reset: function () {
            this.__disposeTemplate();
            //var model = this.options.context;
            //var context = this.options.scope;
            var model=this._scopedContextModel();
            var self=this;
            this.$render(model, function(){
                self.__setFormScope();
                self.__resetObservable();
                self.__rebindTemplate();

            });
        },

        _onDestroy: function(){
            $(document).off(this.options.submitEvent);
            $(document).off(this.options.resetEvent);
        },


        /**
         * display notification
         * @param element {Object}
         * @param opts {Object}
         * @param callback {Function}
         * @public
         */
        notification: function (element, opts, callback) {
            this._notification(element, opts, callback);
        },


        /**
         * reset form
         * @public
         */
        reset: function () {
            this._reset();
        },

        /**
         * render form
         * @param data {Object}
         * @public
         */
        renderForm: function (data) {
            this._renderForm(data);
        }
    };

    /**
     * options
     * @private
     */
    var options_ = {
        submitEvent: 'elliptical.onDocumentSubmit',
        successEvent:'elliptical.onSubmitSuccess',
        failureEvent:'elliptical.onSubmitFailure',
        resetEvent:'elliptical.onFormReset',
        resetSubscription:'elliptical.form.reset',
        schemas: null,
        schemaValidation: null,
        resetModel: {
            submitLabel: {
                cssDisplay: 'hidden',
                message: '&nbsp;'
            }
        },
        processingMsg: 'Processing...',
        redirectLabel: null,
        redirect: null
    };

    /* extend the form Factory prototype */
    $.extend($.elliptical.form.prototype, prototype_);



    /* extend options */
    $.extend($.elliptical.form.prototype.options, options_);

    return $;

}));