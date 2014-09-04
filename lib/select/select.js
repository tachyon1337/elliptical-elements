
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

