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
