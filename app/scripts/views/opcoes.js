/*global JST, App, Backbone*/

(function(global) {
  'use strict';

  global.App = global.App || {};
  global.App.Views = global.App.Views || {};
  
  var View = Backbone.View.extend({
    template: JST.opcoes,
    tagName: 'section',
    el : '.app',
    events: {
      'click [data-back]': 'voltarClick'
    },
    initialize: function () {
      if (this.model){
          this.listenTo(this.model, 'change', this.render);
      }
    },

    render: function () {
      this.$loading = $('.ktd-loader');
      console.log(this.model);
      this.$el.empty().append(this.template(this.model ? this.model : {}));
      return this;
    },
    voltarClick: function(){
      global.history.back();
    }
  });
  
  global.App.Views.Opcoes = View;
})(window);