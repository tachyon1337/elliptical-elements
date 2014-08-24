
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
