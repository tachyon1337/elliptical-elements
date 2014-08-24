/*
 * =============================================================
 * $.controller prototype extension
 * =============================================================
 * Dependencies:
 * elliptical-controller
 *
 * extends $.controller for services injection and configuration
 */


//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('elliptical-controller'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-controller'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory($);
    }
}(this, function ($) {

    /**
     * getter/setter for scope id prop
     * @type {Object}
     */
    $.controller.config={
        scope:Object.defineProperties({},{
            'id':{
                get:function(){
                    return $.Widget.prototype.options.idProp;
                },
                set:function(val){
                    $.Widget.prototype.options.idProp=val;
                }
            }
        })

    };

    /**
     * pass services to the controller prototype, $.controller.service(S1,S2,..SN);
     * invoke a service from the controller: var myService=this.service('serviceName');
     */
    $.controller.service=function(){
        var services=[];
        var args = [].slice.call(arguments);
        for(var i=0;i<args.length;i++){
            var name=(args[i]["@class"]);
            if(!name){
                if(args[i].constructor && args[i].constructor["@class"]){
                    name=args[i].constructor["@class"];
                }else{
                    name='Model';
                }
            }

            services.push({
                name:name,
                service:args[i]
            });

        }
        var options=$.Widget.prototype.options;
        (typeof options.services != 'undefined') ? options.services=options.services.concat(services) :  options.services=services;

    };

    var prototype_={
        /**
         * return a service by name(@class)
         * @param name {String}
         * @returns {Object}
         * @private
         */
        service:function(name){
            var obj_=null;
            var model=null;
            this.options.services.forEach(function(obj){
                if(obj.name===name){
                    obj_=obj.service;
                }else if(obj.name==='Model'){
                    model=obj.service.extend({},{}); //if model, extend it so that it each is a separate copy
                    model["@class"]=name;
                }
            });

            return (obj_) ? obj_ : model;
        },

        __onPreInit:function(){
            var context=this.options.context;
            if(context){
                this._data.authenticated=this.options.context.authenticated;
                this._data.membership=this.options.context.membership;
            }
        }

    };

    /* extend the controller UI Factory prototype */
    $.extend($.elliptical.controller.prototype,prototype_);

    return $;
}));



/*
 * =============================================================
 * elliptical.scroll
 * =============================================================
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('../controller/controller'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['../controller/controller'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory($);
    }
}(this, function ($) {

    $.controller("elliptical.scroll", {


        /*==========================================
         PRIVATE
         *===========================================*/

        _initController:function(){
            this._scrollEvent();
        },

        _onScroll: $.noop,

        /**
         * element events
         * @private
         */
        _scrollEvent: function(){
            var self = this;
            $(window).on('scroll', function (event) {
                var scrollY = window.pageYOffset;
                self._onScroll(scrollY);
            });
        },

        _onDestroy: function () {
            $(window).off('scroll');
        }



    });

    return $;


}));







/*
 * =============================================================
 * elliptical.slideNotification
 * =============================================================
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('../controller/controller'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['../controller/controller'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(this, function () {

    $.controller('elliptical.slideNotification',{
        options:{
            template:'ui-slide-notification',
            cssModalClass:null,
            animationIn:'bounceInDown',
            animationOut:'bounceOutUp',
            modalCssClass:null,
            modalZIndex:999,
            modalOpacity:.3,
            model:{}
        },


        _initElement:function(){
            this.__selector();
            this._attachElement();
            this._show();

        },

        _subscriptions:function(){
            this._subscribe('slide.notification.hide',this._hide.bind(this));
        },

        __selector:function(){
            var __customElements=this.options.$customElements;
            this._data.selector=(__customElements) ? 'ui-slide-Notification' : '.ui-slide-notification';
        },


        _attachElement:function(){
            var self=this;
            var container=$('<div></div>');
            this._data.container=container;
            var body=this.element;
            body.append(container);

        },

        _show:function(){
            var self=this;
            this._showModal(function(){
                self._renderElement();
            });
        },

        _renderElement:function(){
            var self=this;
            var container=this._data.container;
            this._render(container,{
                template:this.options.template,
                model:this.options.model

            },function(){
                self._data.element=container.find(self._data.selector);
                self._animate();
                var button= container.find('button');
                self._data.button=button;
                self._close();

            });
        },


        _showModal:function(callback){
            var opts={};
            if(this.options.modalCssClass){
                opts.cssClass=this.options.modalCssClass;
            }
            opts.opacity=this.options.modalOpacity;
            opts.zIndex=this.options.modalZIndex;
            this._setModal(this.element,opts,function(){
                callback();
            });
        },

        _animate:function(){
            var self=this;
            this._onEventTrigger('showing',{});
            var element=this._data.element;
            this._transitions(element,{
                preset:'bounceInDown'
            },function(){
                self._onEventTrigger('show',{});
            });
        },

        _close:function(){
            var self=this;
            var button=this._data.button;
            if(button){
                button.on('click',function(event){
                    self._hide();
                });
            }
        },

        _hide:function(){

            this._removeModal();
            var element=this._data.element;
            this._onEventTrigger('hiding',{});
            (!$.browser.msie) ? this.__transitionOut(element) : this._destroy();

        },

        __transitionOut:function(element){
            var self=this;
            var animationOut=this.options.animationOut;
            this._transitions(element,{
                preset:animationOut

            },function(){
                self.destroy();
            });
        },

        _unbindButtonEvent:function(){
            var button=this._data.button;
            if(button){
                button.off('click');
            }
        },

        _onDestroy:function(){
            this._unbindButtonEvent();
            var container=this._data.container;
            container.remove();
        },

        hide:function(){
            this._hide();
        }

    });

    return $;

}));

/*
 * =============================================================
 * elliptical.modelList
 * =============================================================
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('../controller/controller'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['../controller/controller'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory($);
    }
}(this, function ($) {

 $(function(){

     $.controller('elliptical.modelList','ui-model-list', {
         __setScope: function () {
             var context=this.options.context, //context attached by the route
                 scopeProp=this.options.scope,//context property to use as the scope
                 key=this.options.idProp;

             if(key===undefined){
                 this.options.key=this._data.scopeId;
             }
             if(scopeProp && context){
                 this.$scope[scopeProp]=context[scopeProp];
             }else{
                 this.$scope = {items:[]};
             }

         },

         _initController:function(){


         },

         __onActiveSubscribe:function(id){
             var models=this.__templateModels();
             models.removeClass('active');
             var node=this.__templateNode(id);
             node.addClass('active');
         },

         __onSyncSubscribe: function(result){
             if(!result || result===undefined){
                 return false;
             }
             var data=result.$scope;
             var self=this;
             var arr=data[Object.keys(data)[0]];
             arr.forEach(function(obj){
                 var result={};
                 result.added=[];
                 result.added.push(obj);
                 self.__onScopeChange(result);
             });
             this._onSyncSubscribe(data);
             return true;
         },

         _publishCount:function(){
             var length=this.__scopeLength();
             if(this.options.channel){
                 this._publish(this.options.channel + '.count',length);
             }else if(this.options.scope){
                 this._publish(this.options.scope + '.count',length);
             }
         },

         _publishRemove:function(){
             if(this.options.channel){
                 this._publish(this.options.channel + '.remove',{});
             }
         },


         _onScopeChange:function(result){
             this._publishCount();
             var model=this.options.service;
             var id=this.options.idProp;
             var key=this.options.modelKey;
             if(key!==undefined){
                 id=key;
             }
             var eventBlock=this.options.eventBlock;
             if(typeof model !== 'undefined' && !eventBlock){
                 var Model=this.service(model);
                 if(result.removed && result.removed.length){
                     result.removed.forEach(function(obj){
                         var params={};
                         params[id]=obj[id];
                         Model.delete(params);

                     });
                 }
             }
         }

     });

     return $
 });

}));


/*
 * =============================================================
 * elliptical.modelDelete
 * =============================================================
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('ellipsis-element'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['ellipsis-element'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(this, function ($) {
    $.element('elliptical.modelDelete','ui-model-delete',{
        options:{
            confirm:false,
            confirmText:'Are you sure you want to delete this item?',
            disabled:false
        },

        _initElement:function(){
            var __customElements=this.options.$customElements;
            this._data.selector=(__customElements) ? 'ui-model' : '[data-node="model"]';
        },

        _events:function(){
            var click=this._data.click;
            var self=this;

            this.element.on(click,function(event){
                if(!self.options.disabled){
                    self._remove();
                }
            });
        },

        _remove:function(){
            var confirm_=this.options.confirm;
            var confirmText=this.options.confirmText;
            var selector=this._data.selector;
            var model=this.element.parents(selector);
            var model_=model[0];
            if(confirm_){
                if(confirm(confirmText)){
                    try{
                        model_.remove(); //remove DOM node
                    }catch(ex){
                        model.remove();
                    }

                }
            }else{
                try{
                    model_.remove(); //remove DOM node
                }catch(ex){
                    model.remove();
                }

            }
        },

        _destroy:function(){
            var click=this._data.click;
            this.element.off(click);
        },

        disable:function(){
            this.options.disabled=true;
            this.element.addClass('disabled');
        },

        enable:function(){
            this.options.disabled=false;
            this.element.removeClass('disabled');
        }
    });

}));

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
            (this.options.schema) ? this._validate(data) : this.___onSubmit(data);

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
/*
 * =============================================================
 * elliptical.loginForm
 * =============================================================
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('../form/form'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['../form/form'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory($);
    }
}(this, function ($) {

 $(function(){

    $.form('elliptical.loginForm','ui-login-form',{

        _initForm:function(){
            this._getRedirectUrl();

        },

        _getRedirectUrl:function(){
            var Location=this.service('Location');
            var href=Location.href;
            var returnUrl=Location.url.queryString(href,'returnUrl');
            this._data.redirectUrl=(returnUrl && returnUrl !==undefined) ? returnUrl : this.options.redirect;
        },

        _onSubmit:function(data){
            var body=data.body;
            var formElement = this._data.form;
            var method = formElement.attr('method');
            var action = formElement.attr('action');
            var Validation=this.service('Validation');
            var schema=this.options.schema;
            (Validation && Validation.post) ? this._validate(Validation,body,schema,action,method) : this._login(body);

        },

        _validate:function(Validation,body,schema,action,method){
            var self=this;

            Validation.post(body,schema, function (err, form) {
                if (err) {
                    form.action = action;
                    form.method = method;
                    self._renderForm(form);
                } else {
                    self._login(body);
                }
            });
        },

        _login:function(form){
            var self=this;
            var Location=this.service('Location');
            var Membership=this.service('Membership');
            this._showLoader();
            Membership.login(form,function(err,data){
                setTimeout(function(){
                    self._hideLoader();
                    if(!err){
                        var redirectUrl=(data.redirectUrl && data.redirectUrl !==undefined) ? data.redirectUrl : self._data.redirectUrl;
                        Location.redirect(redirectUrl);
                    }else{
                        self._renderError({},'Invalid Login');
                    }

                },1000);

            });
        }
    });
 });

    return $;

}));









/*
 * =============================================================
 * elliptical.signupForm
 * =============================================================
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('../form/form'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['../form/form'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory($);
    }
}(this, function ($) {

 $(function(){

    $.form('elliptical.signupForm','ui-signup-form',{

        _initForm:function(){
            this._getRedirectUrl();
        },

        _getRedirectUrl:function(){
            this._data.redirectUrl=this.options.redirect;

        },

        _onSubmit:function(data){
            var body=data.body;
            var formElement = this._data.form;
            var method = formElement.attr('method');
            var action = formElement.attr('action');
            var Validation=this.service('Validation');
            var schema=this.options.schema;
            (Validation && Validation.post) ? this._validate(Validation,body,schema,action,method) : this._login(body);

        },

        _validate:function(Validation,body,schema,action,method){
            var self=this;
            Validation.post(body,schema, function (err, form) {
                if (err) {
                    form.action = action;
                    form.method = method;
                    form=self._mergeFormData(form);
                    self._renderForm(form);
                } else {
                    self._login(body);
                }
            });
        },

        _login:function(form){
            var self=this;
            var Location=this.service('Location');
            var Membership=this.service('Membership');
            this._showLoader();
            Membership.signUp(form,function(err,data){
                setTimeout(function(){
                    self._hideLoader();
                    if(!err){
                        var redirectUrl=(data.redirectUrl && data.redirectUrl !==undefined) ? data.redirectUrl : self._data.redirectUrl;
                        Location.redirect(redirectUrl);
                    }else{
                        self._renderError({},'Invalid Sign-Up');
                    }

                },1000);

            });
        }
    });
 });

    return $;

}));










/*
 * =============================================================
 * elliptical.autoCompleteBind
 * =============================================================

 * dependencies:
 * ellipsis-element
 * ellipsis-autocomplete
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('../controller/controller'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['../controller/controller'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory($);
    }
}(this, function ($) {

    $.controller('elliptical.autoCompleteBind',{

        options:{
            dataBind:false
        },

        _initController: $.noop,

        _onAutoCompleteBinding: $.noop,

        _onAutoCompleteSelected: $.noop,

        _events:function(){
            var self=this;
            this._event($(document),'autocomplete.binding',function(event,data){
                self._onAutoCompleteBinding(event,data);

            });

            this._event($(document),'autocomplete.selected',function(event,data){
                self._onAutoCompleteSelected(event,data);
            });

        }
    });

    return $;

}));

/*
 * =============================================================
 * elliptical.modelBadge  v0.9.1
 * =============================================================
 * Copyright (c) 2014 S.Francis, MIS Interactive
 * Licensed MIT
 *
 * Dependencies:
 * elliptical-controller
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('../controller/controller'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['../controller/controller'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory($);
    }
}(this, function ($) {

 $(function(){
     $.controller('elliptical.badge','ui-model-badge',  {

         _initController:function(){
             var count=this.element.text();
             if(typeof count !== 'undefined' || count!==''){
                 count=parseInt(count);
             }else{
                 count=0;
             }
             this._data.count=count;

         },

         _subscriptions:function(){
             var channel=this.options.channel + '.count';
             this._subscribe(channel,this._onCountInit.bind(this));
         },

         _onRemoveSubscribe:function(data){
             var count=this._data.count;
             count--;
             this._data.count=count;
             this.element.text(count);

         },

         _onAddSubscribe:function(data){
             var count=this._data.count;
             count++;
             this._data.count=count;
             this.element.text(count);
         },

         _onCountInit:function(count){
             this._data.count=parseInt(count);
         },

         _onChangeSubscribe: $.noop


     });

     return $;
 });


}));


/*
 * =============================================================
 * elliptical.paginationBadge
 * =============================================================
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('elliptical-pubsub'),require('../controller/controller'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['elliptical-pubsub','../controller/controller'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(this, function () {

    $.element('elliptical.modelPaginatedCount','ui-pagination-badge', $.elliptical.pubsub, {

        _initController: function () {
            //this._subscriptions();
        },

        _subscriptions: function () {
            var channel=this.options.channel;
            this._subscribe(channel + '.count',this._setLabel.bind(this));

        },

        _setLabel:function(data){
            this._data.count=data;
            this.element.text(data);
        },

        _setCount:function(){
            var count=this.data.count;
            count--;
            this._setLabel(count);
        }

    });

    return $;

}));
/*
 * =============================================================
 * elliptical.pluralize
 * =============================================================
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('../controller/controller'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['../controller/controller'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory($);
    }
}(this, function ($) {

 $(function(){
     $.controller('elliptical.pluralize','ui-pluralize',  {

         _initController:function(){


         },

         _onRemoveSubscribe:function(data){
             var count=this.options.count;
             var singular=this.options.singular;
             var plural=this.options.plural;
             count--;
             this.options.count=count;
             (count===1) ? this.element.text(singular) : this.element.text(plural);


         },

         _onAddSubscribe:function(data){
             var count=this.options.count;
             var singular=this.options.singular;
             var plural=this.options.plural;
             count++;
             this.options.count=count;
             (count===1) ? this.element.text(singular) : this.element.text(plural);
         },

         _onChangeSubscribe:function(data){
             var singular=this.options.singular;
             var plural=this.options.plural;
             this.options.count=data;
             (data===1) ? this.element.text(singular) : this.element.text(plural);
         }


     });

     return $;
 });


}));



/*
 * =============================================================
 * elliptical.selectList
 * =============================================================
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('../controller/controller'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['../controller/controller'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory($);
    }
}(this, function ($) {

    $(function(){
        $.controller('elliptical.selectList',{

            options:{
                dataBind:false
            },

            _onChange: $.noop,

            _events:function(){
                var self=this;
                this._event(this.element,'change',function(event){
                    var element=$(event.target);
                    var value=element.val();
                    self._onChange(value);

                });
            }


        });

        return $;
    });


}));




/*
 * =============================================================
 * elliptical.autosearch
 * =============================================================
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('../controller/controller'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['../controller/controller'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory($);
    }
}(this, function ($) {

    $.controller('elliptical.autosearch', $.elliptical.autoCompleteBind,{

        options:{
            dataBind:false
        },

        _initController:function(){
            //autosearch only active for desktop media
            if(!this._support.mq.touch){
                this._data.element=null;
                var input=this.element.find('input');
                this._data.input=input;
                this._initAutoSearch(input);
                this._data.message=this.options.message || 'Your search filter returned no results...';
                this._data.cssClass=this.options.cssClass || 'warning';
                this._data.paginationContext=this.options.paginationContext || 'pagination';
                this._data.paginationTemplate=this.options.paginationTemplate || 'ui-pagination';
                if(this._instantiated(input[0],'autocomplete')){
                    try{
                        input.autocomplete('destroy');
                    }catch(ex){

                    }
                }else{
                    this._onAutocompleteLoaded();
                }
            }
        },

        _onAutocompleteLoaded:function(){
            var input=this._data.input;
            this._event($(document),'autocomplete.loaded',function(event){
                try{
                    input.autocomplete('destroy');
                }catch(ex){

                }
            });

        },

        _onSyncSubscribe:function(data){
            if(!this._data.element){
                data.$filterQueue=0;
                this._data.element=data;
            }
        },

        _onInput:function(){
            var input=this._data.input;
            var self=this;
            input.keyup(function (event) {
                self._onChange(event);
            });
        },

        _onChange:function(event){
            var key = event.which;
            var self=this;
            console.log('search keyboard key: ' + key);

            //alpha-numeric or backspace
            if ((key >= 48 && key <= 90)||(key===8)) {
                setTimeout(function(){
                    self._filter();
                },100);
            }
        },

        _applyData:function(data){
            var $element=this._data.element;
            $element.options.eventBlock=true;
            $element.$filterQueue=$element.$filterQueue + 1;
            var $scope=this.$scope;
            $element.$empty();

            if(data && data.length){
                $element._killNotificationLabel();
                this._onScopeBind($scope,$element,data);

            }else{
                $element._notificationLabel({
                    cssClass:this._data.cssClass,
                    message:this._data.message
                });
            }
        },

        _updatePagination:function(pagination){
            var element=this._data.pagination;
            var opts={
                context:this._data.paginationContext,
                model:pagination,
                template:this._data.paginationTemplate
            };
            var self=this;
            this._render(element,opts,function(){

            });
        },

        _animate:function(element){
            this._transitions(element, {
                preset: 'fadeIn',
                duration: 750
            }, function () {

            });
        },

        _updateCount:function(count){
            var channel;
            if(this.options.channel){
                channel=this.options.channel + '.change';
                this._publish(channel,count);
            }
        },

        _filter: $.noop,

        _initAutoSearch: $.noop,

        _onScopeBind: $.noop
    });

    return $;

}));


/*
 * =============================================================
 * elliptical.veneer
 * =============================================================
 * Dependencies:
 * ellipsis-element
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('ellipsis-element'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['ellipsis-element'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory($);
    }
}(this, function ($) {

    if($.element.custom){
        $.element.registerElement('overlay-element');
    }

    $(function(){
        $.element('elliptical.veneer','ui-veneer',{

            options:{
                animationIn:'bounceInDown',
                modalCssClass:null,
                modalZIndex:10000,
                modalOpacity:.3,
                cssClass:null,
                scope:null
            },

            _initElement:function(){
                if(!this.options.template){
                    return; //template required
                }
                this._data.model={};
                this._getModel();
                this._attachElement();
                this._show();
            },

            _getModel:function(){
                var scope=this.options.scope;
                if(scope){
                    if($$ && $$.elliptical && $$.elliptical.context){
                        this._data.model=($$.elliptical.context[scope]) ? $$.elliptical.context[scope] : {};
                    }
                }
            },

            _attachElement:function(){
                var container=$('<overlay-element></overlay-element>');
                this._data.container=container;
                if(this.options.cssClass){
                    container.addClass(this.options.cssClass);
                }
                var body=$('body');
                body.append(container);

            },

            _show:function(){
                var self=this;
                this._showModal(function(){
                    self._renderElement();
                });
            },

            _renderElement:function(){
                var self=this;
                var container=this._data.container;

                this._render(container,{
                    template:this.options.template,
                    model:this._data.model

                },function(){
                    self._data.element=self._data.container.find('>*');
                    self._animate();
                });
            },

            _showModal:function(callback){
                var opts={};
                opts.opacity=this.options.modalOpacity;
                opts.zIndex=this.options.modalZIndex;
                this._setModal(this.element,opts,function(){
                    callback();
                });
            },

            _animate:function(){
                var element=this._data.element;
                this._transitions(element,{
                    preset:this.options.animationIn
                },function(){

                });
            },

            _onDestroy:function(){
                if(this._data.container){
                    this._data.container.remove();
                }
                this._removeModal();
            }

        });

        return $;
    });


}));



/*
 * =============================================================
 * elliptical.stickyReveal
 * =============================================================
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('../controller/controller'),require('../scroll/scroll'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['../controller/controller','../scroll/scroll'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(this, function () {

    if($.element.custom){
        $.element.registerElement('reveal-container');
    }

    $.controller("elliptical.stickyReveal",'ui-sticky-reveal', $.elliptical.scroll, {


        /*==========================================
         PRIVATE
         *===========================================*/
        options:{
            animationIn:'slideIn',
            animationOut:'slideOut',
            durationIn:500,
            durationOut:500,
            yOffset:60
        },

        _initController:function(){
            if(!this._support.mq.touch){
                this._data.$element=null;
                this._data.visible=false;
                this._getContainer();
                if(this.options.template && this.options.event !=='sync'){
                    var model=this._getModel();
                    this._renderElement(model);
                }
            }else{
                this._destroy();
            }


        },


        _getContainer:function(){
            this._data.container=(this.options.$customElements) ? this.element.find('reveal-container') : this.element.find('.reveal-container');
        },

        _onScroll:function(y){
            if(this._data.disabled){
                return;
            }
            var yOffset=this.options.yOffset;
            var visible=this._data.visible;
            if(y>yOffset && !visible){
                this._data.visible=true;
                this._show();
            }else if(y<yOffset && visible){
                this._data.visible=false;
                this._hide();
            }
        },

        _getModel:function(){
            var scope=this.options.scope;
            var model;
            if(scope){
                if($$ && $$.elliptical && $$.elliptical.context){
                    model=($$.elliptical.context[scope]) ? $$.elliptical.context[scope] : {};
                }
            }
            return model;
        },

        _onRenderElement: function($scope){
            this._renderElement($scope);
        },


        _renderElement:function(model){
            var self=this;
            var container=this._data.container;

            this._render(container,{
                template:this.options.template,
                model:model

            },function(){

            });

        },

        _show:function(){
            var element=this.element;

            this._transitions(element,{
                preset:this.options.animationIn,
                duration:this.options.durationIn
            },function(){

            });
        },

        _hide:function(){
            var element=this.element;
            this._transitions(element,{
                preset:this.options.animationOut,
                duration:this.options.durationOut
            },function(){


            });
        },

        _onSyncSubscribe:function($element){
            if(!this._support.mq.touch){
                this._data.$element=$element;
                var $scope=this.$scope;
                this._onRenderElement($scope);
            }

        },



        _onDestroy:function(){
            if(this.options.template && this._data.container){
                this._data.container.empty();
            }
            if(this._support.mq.touch){
                this._super();
            }

        }

    });

    return $;


}));







/*
 * =============================================================
 * elliptical.download
 * =============================================================
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('../controller/controller'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['../controller/controller'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory($);
    }
}(this, function ($) {

    $.controller("elliptical.download", {


        /*==========================================
         PRIVATE
         *===========================================*/

        _download:function(url,opts){
            var self=this;
            var delay=opts.delay;
            if(!this._support.device.touch){
                if(typeof opts !=='undefined'){
                    var cssClass=(opts.cssClass===undefined) ? 'info' : opts.cssClass;
                    var msg=(opts.msg===undefined) ? 'Downloading File' : opts.msg;
                    var terminate=opts.terminate;
                    if(terminate===undefined){
                        terminate=true;
                    }

                    this._notify(cssClass,msg,terminate);

                    if(delay===undefined){
                        delay=100;
                    }
                }

                if(delay===undefined){
                    delay=100;
                }

                setTimeout(function(){
                    self.__download(url);
                },delay);

            }else{
                //touch
                window.open(url);
            }

        },

        __download:function(url){
            if($.browser.webkit){
                var link = document.createElement('a');
                link.href = url;

                if (link.download !== undefined) {
                    link.download = url;
                }

                if (document.createEvent) {
                    var event = document.createEvent('MouseEvents');
                    event.initEvent('click', true, true);
                    link.dispatchEvent(event);
                    return true;
                }
                if (url.indexOf('?') === -1) {
                    url += '?download';
                }

                window.open(url, '_self');
            }else{
                if (url.indexOf('?') === -1) {
                    url += '?download';
                }

                window.open(url);
            }


            return true;
        }

    });

    return $;


}));






