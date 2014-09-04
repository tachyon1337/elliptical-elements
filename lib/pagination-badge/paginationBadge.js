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