define( [

    'vendors/Backbone',
    'vendors/JQuery',
    'vendors/Underscore',

    'apis/editor/widgets/Widget'

], function ( Backbone, $, _, Widget ) {

    'use strict';

    return Widget.extend( {

        el: [ '<div class="widget number-widget">',
            '          <div class="widget-wrapper">',
            '              <input class="value" />',
            '          </div>',
            '      </div>'
        ].join( '' ),

        events: _.extend( {}, Widget.prototype.events, {
            'change .value:input': 'changeEvent',
            'keydown .value:input': 'keydownEvent'
        } ),

        initialize: function ( options ) {

            options = _.defaults( options || {}, {

                model: new Backbone.Model(),
                name: 'value',

                // used to override the value displayed
                // used for custom scale
                renderValue: null,
                inputValue: null

            } );

            Widget.prototype.initialize.call( this, options );

        },

        render: function () {

            var $valueElement = this.$( '.value' );

            var value = this.get();

            if ( $valueElement.is( ':input' ) ) {
                $valueElement.val( value );
            } else {
                $valueElement.text( value );
            }

        },

        changeEvent: function ( e ) {

            var value = $( e.currentTarget ).val();
            // This force the update
            this.set( !value );
            this.change( value );

        }
      
    } );

} );
