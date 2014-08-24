

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
