/*
 * =============================================================
 * elliptical.signupForm
 * =============================================================
 *
 */

//umd pattern

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('../form/form'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['../form/form'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory($);
    }
}(this, function ($) {

 $(function(){

    $.form('elliptical.signupForm','ui-signup-form',{

        _initForm:function(){
            this._getRedirectUrl();
        },

        _getRedirectUrl:function(){
            this._data.redirectUrl=this.options.redirect;

        },

        _onSubmit:function(data){
            var body=data.body;
            var formElement = this._data.form;
            var method = formElement.attr('method');
            var action = formElement.attr('action');
            var Validation=this.service('Validation');
            var schema=this.options.schema;
            (Validation && Validation.post) ? this._validate(Validation,body,schema,action,method) : this._login(body);

        },

        _validate:function(Validation,body,schema,action,method){
            var self=this;
            Validation.post(body,schema, function (err, form) {
                if (err) {
                    form.action = action;
                    form.method = method;
                    form=self._mergeFormData(form);
                    self._renderForm(form);
                } else {
                    self._login(body);
                }
            });
        },

        _login:function(form){
            var self=this;
            var Location=this.service('Location');
            var Membership=this.service('Membership');
            this._showLoader();
            Membership.signUp(form,function(err,data){
                setTimeout(function(){
                    self._hideLoader();
                    if(!err){
                        var redirectUrl=(data.redirectUrl && data.redirectUrl !==undefined) ? data.redirectUrl : self._data.redirectUrl;
                        Location.redirect(redirectUrl);
                    }else{
                        self._renderError({},'Invalid Sign-Up');
                    }

                },1000);

            });
        }
    });
 });

    return $;

}));








