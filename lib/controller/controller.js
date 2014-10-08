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


