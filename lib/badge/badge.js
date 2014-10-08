/*
 * =============================================================
 * elliptical.modelBadge
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

