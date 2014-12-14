/*global define*/

define( [

  'vendors/JQuery',
  'vendors/Underscore'

], function ( $, _ ) {
  
  var API = function (opt) {
    _.extend(this, opt || {}, {
      baseUrl : '/api/',
      format  : 'json'
    });
  }
  
  _.extend(API.prototype, {
    
    
    get     : function(resource, data, cb) {
      
      if (!cb) { cb = data || function () { console.log(arguments); }; }
      
      this.query( {
        type: 'GET',
        resource: resource,
        data: data
      }, cb );
      
    },
    post    : function(resource, data, cb) {
      
      this.query( {
        type: 'POST',
        resource: resource,
        data: JSON.stringify(data)
      }, cb );
      
    },
    
    query   : function (opt, cb) {
      $.ajax(_.extend({
        url       : this.baseUrl + opt.resource + '/?format=' + this.format,
        contentType: 'application/json',
        success   : function (data, status, xhr) {
          return cb && cb(null, data, status, xhr);
        },
        error     : function (xhr, status, error) {
          return cb && cb({
            status: status,
            error: error,
            body: xhr.responseText
          });
        }
      }, opt));
    }
  });
  
  return new API();
  
});