/*global JST, App, Backbone*/

(function(global) {
  'use strict';

  global.App = global.App || {};
  global.App.Views = global.App.Views || {};
  
  var View = Backbone.View.extend({
    template: JST.home,
    tagName: 'section',
    el : '.app',
    events: {
      'click button': 'buttonClick',
      'keyup .inpt-cpf': 'cpfKeyUp',
      'keyup .inpt-captcha': 'captchaKeyUp'
    },
    initialize: function () {
      if (this.model){
          this.listenTo(this.model, 'change', this.render);
      }
    },

    render: function () {
      this.$loading = $('.ktd-loader');
      this.$el.empty().append(this.template(this.model ? this.model : {}));
      this.$cpf = $('.inpt-cpf');
      this.$captcha = $('.inpt-captcha');
      this.$cpf.focus();
      return this;
    },
    cpfKeyUp: function(e){
      if(e.keyCode != 13){
        this.$cpf.removeClass('invalid');        
      }
    },
    captchaKeyUp: function(e) {
      if(e.keyCode != 13){
        this.$captcha.removeClass('invalid');        
      }
    },
    buttonClick: function(){
      var cpf = (this.$cpf.val()||'').replace(/\D/g, '');
      var valid = this.validaCPF(cpf);

      if (!valid){
        this.$cpf.addClass('invalid');
      }else{
        this.$cpf.removeClass('invalid');
      }

      if(this.$captcha.val() == ''){
        this.$captcha.addClass('invalid');
        return;
      }else{
        this.$captcha.removeClass('invalid');
      }

      if (valid) {
        this.$loading.removeClass('hidden');
        kitado.debtor({cpf: cpf}, function(err, data){
          this.$loading.addClass('hidden');
          if(err){
            console.log(err);
          };
          var next = 'step-2';
          if (_.isEmpty(data) || _.isEmpty(data.id)){
            next = 'cpf-nao-encontrado';
          }
          global.App.context = _.extend(data, Backbone.Events);
          global.App.router.navigate(next, { trigger: true});
        }.bind(this));
      }
    },
    validaCPF: function(cpf){
      var numeros, digitos, soma, i, resultado, digitos_iguais;
      digitos_iguais = 1;
      if (cpf.length < 11)
            return false;
      for (i = 0; i < cpf.length - 1; i++)
            if (cpf.charAt(i) != cpf.charAt(i + 1))
                  {
                  digitos_iguais = 0;
                  break;
                  }
      if (!digitos_iguais)
            {
            numeros = cpf.substring(0,9);
            digitos = cpf.substring(9);
            soma = 0;
            for (i = 10; i > 1; i--)
                  soma += numeros.charAt(10 - i) * i;
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(0))
                  return false;
            numeros = cpf.substring(0,10);
            soma = 0;
            for (i = 11; i > 1; i--)
                  soma += numeros.charAt(11 - i) * i;
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(1))
                  return false;
            return true;
            }
      else
          return false;
    }
  });
  
  global.App.Views.Home = View;
})(window);