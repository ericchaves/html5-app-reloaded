this.App = {};

$(document).on('click', 'a[href]', function(e) {
  e.preventDefault();
  return Backbone.history.navigate($(this).attr('href').substr(1), true);
});

$.ajaxSetup({
  dataType: 'json',
  beforeSend: function(xhr) {
    /*
    var currentUser;
    if (currentUser = App.session.currentUser()) {
      return xhr.setRequestHeader('Authorization', currentUser.get('authentication_token'));
    }
    */
  }
});

$(document).ready(function() {
  App.router = new App.Router();
  App.emptyContext = _.extend({}, Backbone.Events);
  Backbone.history.start({pushState: true});
});