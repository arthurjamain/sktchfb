/*global define*/

define( [

    'vendors/Backbone',
    'vendors/JQuery',
    'vendors/Underscore',
    'vendors/moment',

    'API',
    'editor'

], function ( Backbone, $, _, moment, API, editor ) {

  var views = { };


  var App = function (opt) {
    if ( typeof this.initialize === 'function' ) {
      this.initialize(opt || {});
    }
  };

  _.extend(App.prototype, Backbone.View.extend, Backbone.Events, {

    views       : { },
    data        : { editorCard: new Backbone.Model },
    widgets     : { },
    groups      : { },
    textFields  : { },
    router      : null,

    initialize: function (opt) {

      this.initRouter();
      this.initData();
      this.initViews();

      this.setEditorCard(new Card());

      Backbone.history.start();

      this.data.galleryCards.fetch();

    },

    initRouter: function () {
      this.router = new Backbone.Router();

      this.router.route(''            , this.showGallery.bind(this));
      this.router.route('gallery'     , this.showGallery.bind(this));
      this.router.route('gallery/:id' , this.showGalleryItem.bind(this));
      this.router.route('editor'      , this.showEmptyEditor.bind(this));
      this.router.route('editor/:id'  , this.showCard.bind(this));
      this.router.route('editor/new'  , this.showEmptyEditor.bind(this));
      //this.router.route('*'           , this.showView.bind(this, 'gallery'));
    },

    showView: function (id) {

      if ( this.currentView ) {
        this.currentView.hide();
      }
      this.views[id].show();
      this.currentView = this.views[id];
    },

    showGallery: function () {
      this.showView('gallery');
      this.views.gallery.toggleRenderer(true);
    },

    showGalleryItem: function (id) {
      this.showView('gallery');
      this.views.gallery.showItem(id);
      this.views.gallery.toggleRenderer(false);
    },

    showEmptyEditor: function () {
      this.showView('editor');
      this.setEditorCard();
    },

    showCard: function (id) {
      this.showView('editor');
      API.read('card/' + id, function (err, data) {
        if (err) {
          this.router.navigate('editor/new', {trigger: true})
        } else {
          this.setEditorCard(new Card(data));
        }
      }.bind(this));
    },

    initData: function () {

      this.data.galleryCards = new Cards();

    },

    setEditorCard: function (card) {

      var self = this;
      var newCard = !card;
      card = card || new Card;

      this.data.editorCard = card;
      this.data.editorCard.on('sync', function (method) {
        if (method === 'create') {
          self.router.navigate('editor/' + this.get('digest'), {trigger: false});
        }
      });

      this.data.editorCard.on('saveClicked'       , this.data.editorCard.save);
      this.data.editorCard.on('saveClicked'       , function () { this.widgets.save.$('button').text('Fork'); }.bind(this));
      this.data.editorCard.on('addFieldClicked'   , this.createTextField.bind(this));
      this.data.editorCard.on('uploadSelectEvent' , this.uploadImage.bind(this));


      if (this.views.card) {
        this.views.card.setModel(card);
        this.views.card.render();
      }

      this.initTextFields();

      _.each(this.widgets, function (el, i) {
        el.setModel(card);
        el.render();
      });

      var nameSize = (card.get('fieldsSizes') || {}).name;
      var nameColor = (card.get('fieldsColors') || {}).name;

      if (nameSize) {
        card.set('nameSize', nameSize);
      }
      if (nameColor) {
        card.set('nameColor', nameColor);
      }

      if (newCard) {
        this.widgets.save.$('button').text('Create');
      } else {
        this.widgets.save.$('button').text('Fork');
      }

    },

    initViews: function () {
      this.views.card = new CardView( { model : this.data.editorCard, el : $( '.card' ) } );
      this.views.gallery = new GalleryView( { collection : this.data.galleryCards, el : $( '.gallery' ) } );

      // Quick hack to access the .editor element easily
      this.views.editor = new Backbone.View( { el : $('.editor') } );
      this.views.editor.hide = this.views.card.hide.bind(this.views.editor);
      this.views.editor.show = this.views.card.show.bind(this.views.editor);

      // ———————————————————

      this.groups.meta = editor.createWidget( 'Group', {
        label : 'Meta Infos'
      } );
      this.groups.appearance = editor.createWidget( 'Group', {
        label : 'Card Appearance'
      } );
      this.groups.fields = editor.createWidget( 'Group', {
        label : 'Text Fields'
      } );

      // ———————————————————

      this.widgets.cardTitle = this.groups.meta.createWidget( 'Title', 'Text', {
        model : this.data.editorCard,
        name  : 'title'
      } );
      this.widgets.cardPermalink = this.groups.meta.createWidget( 'Permalink', 'Label', {
        model : this.data.editorCard,
        name  : 'permalink',
        escape: false
      } );
      this.widgets.save = this.groups.meta.createWidget( '', 'Button', {
        text  : 'Save',
        model : this.data.editorCard,
        event : 'saveClicked'
      } );

      // ————————————————————

      this.widgets.borderRadius = this.groups.appearance.createWidget( 'Border radius', 'NumberedSlider', {
        model : this.data.editorCard,
        name  : 'radius'
      } );

      this.widgets.backgroundImage = this.groups.appearance.createWidget( 'Background Image', 'FilePicker', {
        model : this.data.editorCard,
        text  : 'Upload'
      } );

      this.widgets.backgroundSize = this.groups.appearance.createWidget( 'Background Size', 'Select', {
        model : this.data.editorCard,
        name  : 'imageSize',
        text  : 'Upload'
      } );
      this.widgets.backgroundSize.addOption( new Backbone.Model({
        label : 'Original',
        value : 'original'
      } ) );
      this.widgets.backgroundSize.addOption( new Backbone.Model({
        label : 'Crop',
        value : 'cover'
      } ) );
      this.widgets.backgroundSize.addOption( new Backbone.Model({
        label : 'Contain',
        value : 'contain'
      } ) );

      this.widgets.color = this.groups.appearance.createWidget( '   Background Color', 'Color', {
        model : this.data.editorCard,
        name  : 'color'
      } );

      // ————————————————————


      this.groups.fieldName = this.groups.fields.createWidget( 'Group', {
        label : 'Name',
        opened: false
      } );

      this.widgets.addFieldButton = this.groups.fields.createWidget( 'Button', {
        text  : 'Add',
        model : this.data.editorCard,
        event : 'addFieldClicked'
      } );

      this.widgets.fieldNameText = this.groups.fieldName.createWidget( 'Text', 'Text', {
        model : this.data.editorCard,
        name  : 'name'
      } );

      this.widgets.fieldNameSize = this.groups.fieldName.createWidget( 'Text', 'NumberedSlider', {
        model : this.data.editorCard,
        name  : 'nameSize'
      } );

      this.widgets.fieldNameColor = this.groups.fieldName.createWidget( '   Color', 'Color', {
        model : this.data.editorCard,
        name  : 'nameColor'
      } );

      this.initTextFields();


      _.each(this.views, function (el) {
        el.render();
        el.hide();
      });
    },

    clearFields: function () {
      _.each(this.textFields, function (el, i) {
        el && el.group && el.group.remove();
        delete this.textFields[i];
      }.bind(this));
    },

    initTextFields: function () {

      var newFields = this.data.editorCard.get('fields') || {};

      this.clearFields();

      _.each(newFields, function (el, i) {

        var name = i;
        var value = el;
        var color = this.data.editorCard.get('fieldsColors')[name];
        var size = this.data.editorCard.get('fieldsSizes')[name];

        this.createTextField(name, value, color, size);

      }.bind(this))

    },



    createTextField: function (name, value, color, size) {

      var self = this;

      if (!name) {
        name = this.generateFieldName();
      }

      this.textFields[name] = {
        group: this.groups.fields.createWidget( 'Group', {
          label : value || name,
          opened: false
        })
      };

      var proxyModel = new Backbone.Model({
        name: name,
        text: value || name,
        size: size || 16,
        color: color || { r: 1, g: 1, b: 1 }
      });

      this.textFields[name].text = this.textFields[name].group.createWidget( 'Text', 'Text', {
        name: 'text',
        model: proxyModel
      });
      this.textFields[name].size = this.textFields[name].group.createWidget( 'Font Size', 'NumberedSlider', {
        name: 'size',
        model: proxyModel
      });
      this.textFields[name].color = this.textFields[name].group.createWidget( '   Color', 'Color', {
        name: 'color',
        model: proxyModel
      });
      this.textFields[name].remove = this.textFields[name].group.createWidget( 'Remove', 'Button', {
        name: 'remove',
        model: proxyModel,
        event: 'remove',
        text: 'GTFO'
      });

      var propagateToEditorModel = function () {
        console.log('proxy field change');

        var currentFields = self.data.editorCard.get('fields') || {};
        var currentColors = self.data.editorCard.get('fieldsColors') || {};
        var currentCoords = self.data.editorCard.get('fieldsCoordinates') || {};
        var currentSizes  = self.data.editorCard.get('fieldsSizes') || {};

        currentFields[name] = this.get('text');
        currentColors[name] = this.get('color');
        currentCoords[name] = this.get('coords');
        currentSizes[name] = this.get('size');

        self.data.editorCard.set('fields'             , currentFields);
        self.data.editorCard.set('fieldsColors'       , currentColors);
        self.data.editorCard.set('fieldsCoordinates'  , currentCoords);
        self.data.editorCard.set('fieldsSizes'        , currentSizes);

        self.data.editorCard.trigger('change:fields');

      };

      proxyModel.on('change:text', function (model, val) {
        self.textFields[model.get('name')].group.$('.header .label').text(val);
      });
      proxyModel.on('change:text' ,propagateToEditorModel);
      proxyModel.on('change:color', propagateToEditorModel);
      proxyModel.on('change:size' , propagateToEditorModel);
      proxyModel.on('remove', function () {
        var currentFields = self.data.editorCard.get('fields') || {};
        delete currentFields[name];
        self.data.editorCard.set('fields', currentFields);
        self.data.editorCard.trigger('change:fields');
        self.removeTextField(name);
      });

      var $b = this.widgets.addFieldButton.$el;
      $b.parent().append($b);

    },

    removeTextField: function (name) {
      if( this.textFields[name] && this.textFields[name].group ) {
        this.textFields[name].group.remove();
        delete this.textFields[name];
      }
    },

    generateFieldName: function () {

      var base = 'Field';
      var i = 1;

      while (this.textFields[base + '_' + i]) {
        i++;
      }

      return base + '_' + i;

    },

    /*
     * Uploadds to imgur anonymousy / effortlessly
     */
    uploadImage: function (image) {

      var self = this;
      var fd = new FormData();
      var xhr = new XMLHttpRequest();
      var clearClasses = window.setTimeout.bind(window, function () {
        self.widgets.backgroundImage.$el.removeClass('uploading success error');
      });

      this.widgets.backgroundImage.$el.addClass('uploading');

      fd.append("image", image);
      xhr.open("POST", "https://api.imgur.com/3/image.json");
      xhr.onload = function () {

        var response = JSON.parse(xhr.responseText);
        var link = response.data.link;

        this.data.editorCard.set('image', link);
        this.widgets.backgroundImage.$el.removeClass('uploading').addClass('success');
        clearClasses(2000);

      }.bind(this);

      xhr.onerror = function () {

        this.widgets.backgroundImage.$el.removeClass('uploading').addClass('error');
        clearClasses(2000);

      }

      xhr.setRequestHeader('Authorization', 'Client-ID 11d47ee73f469b9');
      xhr.send(fd);

    }

  });

  var Card = Backbone.Model.extend( {

    defaults : {
      radius        : 0,
      title         : '',
      name          : '',
      job           : '',
      color         : { r: '0', g: '0', b: '0' },
      nameColor     : { r: '1', g: '1', b: '1' },
      fieldsColors  : {},
      fields        : {}
    },

    initialize: function (opt) {

      this.on('change:nameColor', function () {

        var color = this.get('nameColor');
        var colors = this.get('fieldsColors') || {};

        if (color.r === 1 && color.g === 1 && color.b === 1) { return false; }

        colors.name = color;

        this.set('fieldsColors', colors);
        this.trigger('change:fieldsColors');

      });

      this.on('change:nameSize', function () {

        var size = this.get('nameSize');
        var sizes = this.get('fieldsSizes') || {};

        sizes.name = size;

        this.set('fieldsSizes', sizes);
        this.trigger('change:fieldsSizes');

      });

      this.on('change:digest', function (model, val) {

        var permalink = document.location.origin + '/#gallery/' + val;
        this.set('permalink', '<a href="' + permalink + '">' + permalink + '</a>');

      });

      if (opt && opt.digest) {

        var permalink = document.location.origin + '/#gallery/' + opt.digest;
        this.set('permalink', '<a href="' + permalink + '">' + permalink + '</a>');

      }

      Backbone.Model.prototype.initialize.call(this, opt);
    },

    save: function () {
      this.unset('id');
      this.unset('digest');
      this.unset('render');
      this.unset('resource_uri');
      //this.unset('created_at');
      this.unset('title');
      this.sync('create', this);
      // if (this.get('id')) {
      //   this.sync('update', this);
      // } else {
      //   this.sync('create', this);
      // }
    },

    sync: function (method, mod, options) {

      if (method === 'create') {

        API.create('card', mod, function (err, data) {

          if (err) {
            console.error(err);
            return;
          }

          console.log(data);

          this.set(data);
          this.trigger('sync', 'create');

        }.bind(this));
      } else if (method === 'update') {

        API.update('card/' + this.get('id'), this, function (err, data) {

          if (err) {
            console.error(err);
            return;
          }

          this.trigger('sync', 'update');

        }.bind(this));
      }
    }

  } );

  var Cards = Backbone.Collection.extend( {
    model: Card,
    sync: function (method, col, options) {
      API[method] ('card', col, function (err, data) {

        if (err) {
          console.error('Error while sending a [' + method +'] query to the API :');
          console.error(err);
          return;
        }

        if (method === 'read') {
          col.reset(data.objects);
        }

      } );
    }
  } );

  var CardView = Backbone.View.extend( {

    events : {
      // DND background
      'mousedown  .background' : 'startDraggingBackground',
      'mousemove  .background' : 'draggingBackground',
      'mouseup    .background' : 'stopDraggingBackground',

      // DND labels
      'mousedown  .field' : 'startDraggingField',
      'mousemove  .field' : 'draggingField',
      'mouseup    .field' : 'stopDraggingField'

    },

    setModel: function ( model ) {
      this.model.off();
      this.model = model;
      this.model.on( 'change:radius'            , this.onRadiusChange                 , this );
      this.model.on( 'change:color'             , this.onBackgroundChange             , this );
      this.model.on( 'change:image'             , this.onBackgroundChange             , this );
      this.model.on( 'change:imageCoordinates'  , this.onBackgroundCoordinatesChange  , this );
      this.model.on( 'change:name'              , this.onNameChange                   , this );
      this.model.on( 'change:imageSize'         , this.onBackgroundSizeChange         , this );
      this.model.on( 'change:fields'            , this.onFieldsChange                 , this );
      this.model.on( 'change:fieldsCoordinates' , this.onFieldsCoordinatesChange      , this );
      this.model.on( 'change:fieldsColors'      , this.onFieldsColorsChange           , this );
      this.model.on( 'change:fieldsSizes'       , this.onFieldsSizesChange            , this );

      this.resetFields();
    },

    render : function ( ) {
      this.onRadiusChange( );
      this.onNameChange( );
      this.onBackgroundChange( );
      this.onBackgroundSizeChange( );
      this.onBackgroundCoordinatesChange( );
      this.onFieldsChange( );
    },

    resetFields: function ( ) {
      this.$('.fields:not(.name)').remove();
    },

    onBackgroundChange : function ( ) {

      var color = this.model.get('color');
      var image = this.model.get('image');

      this.$el.css( 'background-color', 'rgba(' + Math.round(color.r * 255) + ', ' + Math.round(color.g * 255) + ', ' + Math.round(color.b * 255) + ', 1)');

      if (image && image.indexOf('http://') > -1) {
        this.$('.background').show();
        this.$('.background')[0].src = image;
      } else {
        this.$('.background').hide();
      }

    },

    onBackgroundSizeChange : function ( ) {

      var s = this.model.get('imageSize');
      var $b = this.$('.background');

      if (s === 'original') {
        $b.css('width', 'auto');
        $b.css('height', 'auto');
      } else if (s === 'cover') {
        $b.css('width', '100%');
        $b.css('height', 'auto');
      } else if (s === 'contain') {
        $b.css('width', 'auto');
        $b.css('height', '100%');
      }

      $b.css({ top: 0, left: 0 });

    },

    onFieldsChange : function ( ) {

      var template = _.template('<p data-field="<%= name %>" class="field <%= name %>"><%= value %></p>');
      var fields = this.model.get('fields');

      console.log('onFieldsChange');

      if (fields) {

        // Create / update
        _.each(fields, function (el, i) {

          if (this.$('.field.' + i).length) {
            this.$('.field.' + i).text(el)
          } else {
            this.$el.append(template({
              name: i,
              value: el
            }));
          }

        }.bind(this));

        // Delete
        this.$('.field').each(function (i, el) {
          var name = $(el).data('field');
          if (!fields[name] && name !== 'name') {
            el.remove();
          }
        });
      }

      this.onFieldsCoordinatesChange( );
      this.onFieldsColorsChange( );
      this.onFieldsSizesChange( );
    },

    onFieldsCoordinatesChange : function ( ) {
      var coords = this.model.get('fieldsCoordinates');
      _.each(coords, function (el, i) {
        if (el) {
          this.$('.field.' + i).css({
            top: el.top,
            left: el.left
          });
        }
      }.bind(this));
    },

    onFieldsSizesChange : function ( ) {
      var sizes = this.model.get('fieldsSizes');
      _.each(sizes, function (el, i) {
        this.$('.field.' + i).css('font-size', el);
      }.bind(this));
    },

    onFieldsColorsChange : function ( ) {
      var colors = this.model.get('fieldsColors') || {};

      _.each(colors, function (color, i) {
        this.$('.field.' + i).css({
          color: 'rgb(' + Math.round(color.r * 255) + ', ' + Math.round(color.g * 255) + ', ' + Math.round(color.b * 255) + ')'
        });
      }.bind(this));
    },

    onBackgroundCoordinatesChange : function ( ) {

      var coords = this.model.get('imageCoordinates');

      this.$('.background').css({
        top: coords ? coords.top : 0,
        left: coords ? coords.left : 0
      });

    },

    onRadiusChange : function ( ) {
      this.$el.css( 'border-radius', this.model.get( 'radius' ) );
    },

    onNameChange : function ( ) {

      this.$('.name').text(this.model.get( 'name' ) );

    },

    onJobChange : function ( ) {

      this.$('.job').text(this.model.get( 'job' ) );

    },

    hide: function ( ) {

      this.$el.addClass('hidden');

    },

    show: function ( ) {

      this.$el.removeClass('hidden');

    },

    startDraggingBackground: function (e) {

      this.isDraggingBackground = true;
      this.draggingBackgroundData = { x: e.pageX - this.$el.offset().left, y: e.pageY - this.$el.offset().top };

      e.preventDefault();
      return false;

    },

    stopDraggingBackground: function () {

      this.isDraggingBackground = false;

    },

    draggingBackground: function (e) {

      if (this.isDraggingBackground) {

        var $background = this.$('.background');
        var delta = {
          x: this.draggingBackgroundData.x - (e.pageX - this.$el.offset().left),
          y: this.draggingBackgroundData.y - (e.pageY - this.$el.offset().top)
        };
        var currentPosition = {
          top: parseInt($background.css('top'), 10) || 0,
          left: parseInt($background.css('left'), 10) || 0
        };

        this.draggingBackgroundData = { x: e.pageX - this.$el.offset().left, y: e.pageY - this.$el.offset().top };
        this.model.set('imageCoordinates', {
          top: currentPosition.top - delta.y,
          left: currentPosition.left - delta.x
        });

      }

    },

    startDraggingField: function (e) {

      this.isDraggingField = true;
      this.draggingFieldData = { x: e.pageX - this.$el.offset().left, y: e.pageY - this.$el.offset().top, dragged: e.target };

      e.preventDefault();
      return false;

    },

    stopDraggingField: function () {

      this.isDraggingField = false;
      this.draggingFieldData = null;

    },

    draggingField: function (e) {

      if (this.isDraggingField) {

        var $field = this.$(e.target);
        var delta = {
          x: this.draggingFieldData.x - (e.pageX - this.$el.offset().left),
          y: this.draggingFieldData.y - (e.pageY - this.$el.offset().top)
        };
        var currentPosition = {
          top: parseInt($field.css('top'), 10) || 0,
          left: parseInt($field.css('left'), 10) || 0
        };

        this.draggingFieldData.x = e.pageX - this.$el.offset().left;
        this.draggingFieldData.y = e.pageY - this.$el.offset().top;

        var coordinates = this.model.get('fieldsCoordinates') || {};
        var name = _.find($field[0].classList, function (val) { return val !== 'field' });

        coordinates[name] = {
          top: currentPosition.top - delta.y,
          left: currentPosition.left - delta.x
        };

        this.model.set('fieldsCoordinates', coordinates);
        this.model.trigger('change:fieldsCoordinates');

      }

    }

  } );

  var GalleryView = Backbone.View.extend( {

    events: {

      'click .renderer': 'closeRenderer'

    },

    initialize: function ( opt ) {
      Backbone.View.prototype.initialize.call(this, opt);
      this.collection.on('reset', this.render.bind(this));
    },

    hide: function () {
      this.$el.addClass('hidden');
    },

    show: function () {
      this.$el.removeClass('hidden');
    },

    closeRenderer: function (e) {
      if (e.target === this.$('.renderer')[0]) {
        document.location.hash = '#gallery';
      }
    },

    toggleRenderer: function (show) {
      this.$('.renderer').toggleClass('hidden', show);
    },

    showItem: function (id) {

      API.read('card/' + id, function (err, data) {
        if (!err) {
          var card = new Card(data);

          console.log();
          var html = _.template('<a href="#editor/<%=digest%>" class="edit"><div style="background-image: url(\'<%=render ? render.split(\'cards/\').pop() : \'\'%>\')" class="render"></div></a><div class="meta"><a class="back" href="#gallery">&larr; Retour</a><p class="title"><%= title %></p><p class="name">By <%= name %></p><p class="views"><%=views%></p><p class="date"><%=moment(created_at).fromNow()%></p></div>', card.toJSON())

          this.$('.renderer > div').html(html);

        }
      }.bind(this));

    },

    render: function () {

      var list = _.template('<ul><li class="create"><a href="#editor/new"></a></li><%= items %></ul>');
      var item = _.template('<li><a href="#gallery/<%= digest %>"><img width="550px" height="300px" src="<%=render ? render.split("cards/").pop() : ""%>" /><p class="views"><%=views%></p></a></li>');
      var items = '';

      this.collection.each(function (el, i) {
        items += item(el.toJSON());
      });

      this.$('.container').html(list({ items: items }));
      this.$('.container').css('height', window.innerHeight - this.$('header').outerHeight(true) - 50);

    }

  } );

  window.app = new App;

} );
