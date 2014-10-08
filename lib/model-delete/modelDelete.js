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
        root.returnExports = factory($);
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
