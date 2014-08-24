
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






