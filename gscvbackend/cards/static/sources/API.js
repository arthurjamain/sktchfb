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

    read: function(resource, data, cb) {

      if (!cb) { cb = data || function () { console.log(arguments); }; }

      this.query( {
        type: 'GET',
        resource: resource,
        querystring: '&order_by=-views',
        data: (data && data.toJSON) ? data.toJSON() : data
      }, cb );

    },
    create: function(resource, data, cb) {

      this.query( {
        type: 'POST',
        resource: resource,
        data: JSON.stringify(data)
      }, cb );

    },
    update: function(resource, data, cb) {

      if (data) {

        if (data.toJSON) {
          data = data.toJSON();
        }

      }

      this.query( {
        type: 'PUT',
        resource: resource,
        data: JSON.stringify(data)
      }, cb );
    },
    delete: function(resource, id, cb) {

      this.query( {
        type: 'DELETE',
        resource: resource + '/' + id,
      }, cb );
    },

    query   : function (opt, cb) {
      $.ajax(_.extend({
        querystring : '',
        url         : this.baseUrl + opt.resource + '/?format=' + this.format + (opt.querystring || ''),
        contentType : 'application/json',
        success     : function (data, status, xhr) {

          ['color', 'imageCoordinates', 'fieldsCoordinates', 'fieldsColors', 'fields', 'fieldsSizes' ].forEach(function (prop) {
            if (data && data[prop] && typeof data[prop] === 'string') {

              data[prop] = data[prop].replace(/\\u([\d\w]{4})/gi, function(match, grp) {
                return String.fromCharCode(parseInt(grp, 16));
              });
              data[prop] = unescape(data[prop]);
              data[prop] = data[prop].replace(/u/g, '');
              data[prop] = data[prop].replace(/\'/g, '"');

              data[prop] = JSON.parse(data[prop]);
            }
          }.bind(this));

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