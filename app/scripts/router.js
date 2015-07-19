(function(global) {
  var views = global.App.Views;

  var Router = Backbone.Router.extend({    
    initialize: function() {
    },

    routes: {
        ""                    : "homeRoute",
        "cpf-nao-encontrado"  : "cpfNaoEncontradoRoute",
        "step-2"              : "opcoesRoute"
    },

    homeRoute: function () {
      var home = new views.Home();
      this.setHomeCss(home, true);
      home.render();
    },
    opcoesRoute: function () {
      this.gaTrack('setp2', 'Step 2');
      var opcoes = new views.Opcoes({model: App.context});
      this.setHomeCss(opcoes);
      opcoes.render();
    },
    cpfNaoEncontradoRoute: function(){
      this.gaTrack('cpf-nao-encontrado', 'CPF não encontrado.');
      var opcoes = new views.Opcoes({model: App.context || App.emptyContext });
      this.setHomeCss(opcoes);
      opcoes.render();
    },

    gaTrack: function(path, title) {
      ga('set', { page: path, title: title });
      ga('send', 'pageview');
    },
    setHomeCss: function(view, flag){
      if (flag){
        view.$el.removeClass('internal');
        if (!view.$el.hasClass('home'))
          view.$el.addClass('home');
      }else{
        view.$el.removeClass('home');
        if (!view.$el.hasClass('internal'))
          view.$el.addClass('internal');
      }
    }
  });
  
  global.App.Router = Router;
})(window);