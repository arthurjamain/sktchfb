/*global define*/

define( [

    'vendors/Backbone',
    'vendors/JQuery',
    'vendors/Underscore',

    'API',
    'editor'

], function ( Backbone, $, _, API, editor ) {

  var Card = Backbone.Model.extend( {
    
    defaults : {
      radius : 10
    }
    
  } );
  
  var Router = Backbone.Router.extend( {
    
  } );

  var CardView = Backbone.View.extend( {

    initialize : function ( ) {
      this.model.on( 'change:radius', this.onRadiusChange, this );
    },

    render : function ( ) {
      this.onRadiusChange( );
    },

    onRadiusChange : function ( ) {
      this.$el.css( 'border-radius', this.model.get( 'radius' ) );
    }

  } );

  // --- --- --- --- --- --- --- --- ---

  var card = new Card( );
  var cardView = new CardView( { model : card, el : $( '.card' ) } );
  
  cardView.render( );

  console.log(API.get('card'));
  
  // --- --- --- --- --- --- --- --- ---
  
  var appearance = editor.createWidget( 'Group', {
    label : 'Card Appearance'
  } );

  appearance.createWidget( 'Border radius', 'NumberedSlider', {
    model : card,
    name  : 'radius'
  } );
} );
