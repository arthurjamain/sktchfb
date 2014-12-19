/*global define*/

define( [

    'vendors/Backbone',
    'vendors/JQuery',
    'vendors/Underscore',

    'API',
    'editor'

], function ( Backbone, $, _, API, editor ) {

  var views = { };
  
  
  var App = function (opt) {
    if ( typeof this.initialize === 'function' ) {
      this.initialize(opt || {});
    }
  };
  
  _.extend(App.prototype, Backbone.View.extend, Backbone.Events, {
    
    views : { },
    data : { },
    widgets : { },
    groups : { },
    router : null,
    
    initialize: function (opt) {
      
      this.initRouter();
      this.initData();
      this.initViews();
      
      Backbone.history.start();
      
      this.data.galleryCards.fetch();
      
    },
    
    initRouter: function () {
      this.router = new Backbone.Router();
      
      this.router.route(''            , this.showView.bind(this, 'gallery'));
      this.router.route('gallery'     , this.showView.bind(this, 'gallery'));
      this.router.route('editor'      , this.showEmptyEditor.bind(this));
      this.router.route('editor/new'  , this.showEmptyEditor.bind(this));
      this.router.route('editor/:id'  , this.showCard.bind(this));
      //this.router.route('*'           , this.showView.bind(this, 'gallery'));
    },
    
    showView: function (id) {
      
      if ( this.currentView ) {
        this.currentView.hide();
      }
      this.views[id].show();
      this.currentView = this.views[id];
    },
    
    showEmptyEditor: function () {
      this.showView('editor');
      this.setEditorCard(new Card);
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
      
      this.setEditorCard(new Card());
      this.data.galleryCards = new Cards();
      
    },
    
    setEditorCard: function (card) {
      
      var self = this;

      this.data.editorCard = card;
      this.data.editorCard.on('sync', function (method) {
        if (method === 'create') {
          self.router.navigate('editor/' + this.get('id'), {trigger: false});
        }
      });
      
      this.data.editorCard.on('saveClicked'       , this.data.editorCard.save);
      this.data.editorCard.on('uploadSelectEvent' , this.uploadImage.bind(this));
      
      if (this.views.card) {
        this.views.card.setModel(card);
        this.views.card.render();
      }
      
      _.each(this.widgets, function (el, i) {
        el.setModel(card);
        el.render();
      });
      
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
      
      this.widgets.cardId = this.groups.meta.createWidget( 'ID', 'Label', {
        model : this.data.editorCard,
        name  : 'id'
      } );
      this.widgets.cardTitle = this.groups.meta.createWidget( 'Title', 'Text', {
        model : this.data.editorCard,
        name  : 'title'
      } );
      this.widgets.cardIsPublic = this.groups.meta.createWidget( 'Public', 'ToggleSwitch', {
        model : this.data.editorCard,
        name  : 'public'
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
      
      this.widgets.color = this.groups.appearance.createWidget( 'Color', 'Color', {
        model : this.data.editorCard,
        name  : 'color'
      } );
      
      // ————————————————————
      
      this.widgets.name = this.groups.fields.createWidget( 'Name', 'Text', {
        model : this.data.editorCard,
        name  : 'name'
      } );
      this.widgets.job = this.groups.fields.createWidget( 'Job', 'Text', {
        model : this.data.editorCard,
        name  : 'job'
      } );
      this.widgets.save = this.groups.fields.createWidget( '', 'Button', {
        text  : 'Save',
        model : this.data.editorCard,
        event : 'saveClicked'
      } );

      _.each(this.views, function (el) {
        el.render();
        el.hide();
      });
    },
    
    
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
      radius: 0,
      title: '',
      name: '',
      job: '',
      color: { r: '0', g: '0', b: '0' }
    },
    
    initialize: function (opt) {
      
      [ 'color', 'imageCoordinates' ].forEach(function (prop) {
        if (opt && opt[prop] && typeof opt[prop] === 'string') {
          opt[prop] = opt[prop].replace(/u/g, '');
          opt[prop] = opt[prop].replace(/\'/g, '"');
          opt[prop] = JSON.parse(opt[prop]);
          console.log(prop, opt[prop]);
          this.set(prop, opt[prop]);
        }
      }.bind(this));

      Backbone.Model.prototype.initialize.call(this, opt);
    },
    
    save: function () {
      if (this.get('id')) {
        this.sync('update', this);
      } else {
        this.sync('create', this);
      }
    },
    
    sync: function (method, mod, options) {
      
      if (method === 'create') {
      
        API.create('card', mod, function (err, data) {
        
          if (err) {
            console.error(err);
            return; 
          }

          this.set('id', data.id);
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
      'mousedown  .background' : 'startDraggingBackground',
      'mousemove  .background' : 'draggingBackground',
      'mouseup    .background' : 'stopDraggingBackground'
    },
    
    setModel: function ( model ) {
      this.model.off();
      this.model = model;
      this.model.on( 'change:radius'            , this.onRadiusChange                 , this );
      this.model.on( 'change:color'             , this.onBackgroundChange             , this );
      this.model.on( 'change:image'             , this.onBackgroundChange             , this );
      this.model.on( 'change:imageCoordinates'  , this.onBackgroundCoordinatesChange  , this );
      this.model.on( 'change:name'              , this.onNameChange                   , this );
      this.model.on( 'change:job'               , this.onJobChange                    , this );
      this.model.on( 'change:imageSize'         , this.onBackgroundSizeChange         , this );
    },
    
    render : function ( ) {
      this.onRadiusChange( );
      this.onBackgroundChange( );
      this.onBackgroundCoordinatesChange( );
      this.onNameChange( );
      this.onJobChange( );
      this.onBackgroundSizeChange( );
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
    
    hide: function () {
      this.$el.addClass('hidden');
    },
    
    show: function () {
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
      
    }

  } );
  
  var GalleryView = Backbone.View.extend( {
    
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
    
    render: function () {
      
      var list = _.template('<ul><li class="create"><a href="#editor/new"></a></li><%= items %>');
      var item = _.template('<li><a href="#editor/<%= id %>"><header><span><%= name %></span></header></a></li>');
      var items = '';
      
      this.collection.each(function (el, i) {
        items += item(el.toJSON());
      });
      
      this.$('.container').html(list({ items: items }));
      
    }
    
  } );
  
  window.app = new App;
  
} );
