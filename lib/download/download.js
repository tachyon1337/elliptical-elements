/*
 * =============================================================
 * elliptical.download
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

    $.controller("elliptical.download", {


        /*==========================================
         PRIVATE
         *===========================================*/

        _download:function(url,opts){
            var self=this;
            var delay=opts.delay;
            if(!this._support.device.touch){
                if(typeof opts !=='undefined'){
                    var cssClass=(opts.cssClass===undefined) ? 'info' : opts.cssClass;
                    var msg=(opts.msg===undefined) ? 'Downloading File' : opts.msg;
                    var terminate=opts.terminate;
                    if(terminate===undefined){
                        terminate=true;
                    }

                    this._notify(cssClass,msg,terminate);

                    if(delay===undefined){
                        delay=100;
                    }
                }

                if(delay===undefined){
                    delay=100;
                }

                setTimeout(function(){
                    self.__download(url);
                },delay);

            }else{
                //touch
                window.open(url);
            }

        },

        __download:function(url){
            if($.browser.webkit){
                var link = document.createElement('a');
                link.href = url;

                if (link.download !== undefined) {
                    link.download = url;
                }

                if (document.createEvent) {
                    var event = document.createEvent('MouseEvents');
                    event.initEvent('click', true, true);
                    link.dispatchEvent(event);
                    return true;
                }
                if (url.indexOf('?') === -1) {
                    url += '?download';
                }

                window.open(url, '_self');
            }else{
                if (url.indexOf('?') === -1) {
                    url += '?download';
                }

                window.open(url);
            }


            return true;
        }

    });

    return $;


}));






