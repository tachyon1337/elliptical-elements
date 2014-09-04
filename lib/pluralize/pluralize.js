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

