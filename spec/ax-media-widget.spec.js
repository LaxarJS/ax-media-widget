/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../ax-media-widget',
   'laxar/laxar_testing',
   'angular-mocks',
   'jquery',
   'text!laxar-path-widgets/laxarjs/ax-media-widget/default.theme/ax-media-widget.html'
], function( controller, ax, ngMocks, $, widgetMarkup ) {
   'use strict';

   describe( 'An AxMediaWidget ', function() {

      var testBed;
      var $widget;
      var resourceId = 'theMedia';

      var image1 = { mimeType: 'image/png', location: 'http://www.example.com/image1.png' };
      var image2 = { mimeType: 'image/jpeg', location: 'http://www.example.com/image2.jpg' };
      var image3 = { mimeType: 'image/jpeg', location: 'http://www.example.com/image3.jpg',
                     name: 'Entitlement is Optional', description: 'A fascinating specimen.' };
      var image4 = { mimeType: 'image/png', location: 'http://www.example.com/image1.png',
                     name: 'Entitlement is Optional', description: 'A fascinating specimen.'};
      var websiteBlank = { mimeType: 'text/html', location: 'about:blank' };
      var website1 = { mimeType: 'text/html', location: 'http://www.laxarjs.org/' };
      var website2 = { mimeType: 'application/xhtml+xml', location: 'http://www.example.com/page2' };
      var website3 = {
         mimeType: 'application/xhtml+xml',
         location: 'http://www.example.com/page3',
         mediaInformation: {
            pixelWidth: 42,
            pixelHeight: 815
         },
         i18nName: {
            de_DE: 'Meine Beispielwebseite',
            en_US: 'My Example Web Page'
         },
         i18nDescription: {
            de_DE: 'Meine Seite ist die allerbeste Seite',
            en_US: 'My website is, like, the best website *ever*'
         }
      };
      var website4 = { mimeType: 'application/pdf', location: 'http://www.example.com/file.pdf' };

      describe( 'with configured media feature', function() {

         it( 'displays media content in a suitable HTML element (R1.1)', function() {
            setup( { medium: { resource: resourceId } } );
            ngMocks.inject( function( $compile ) {
               $( '#container' ).remove();
               $widget = $( '<div id="container"></div>' ).html( widgetMarkup );
               $compile( $widget )( testBed.scope );
               $widget.appendTo( 'body' );
            } );
            replace( resourceId, websiteBlank );
            expect( $( 'iframe' ) ).toBeDefined();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////


         it( 'acts as resource slave in Master/Slave pattern (R1.2)', function() {
            // we call toString on the location, because it is always wrapped in a
            // sceTrustedValueWrapper

            setup( { medium: { resource: resourceId } } );
            replace( resourceId, image1 );
            expect( testBed.scope.resources.medium.location.toString() ).toEqual( image1.location );
            expect( testBed.scope.model.mediaType ).toEqual( 'image' );

            update( resourceId, [ { op:'replace', path: '/location', value: website2.location } ] );
            update( resourceId, [ { op:'replace', path: '/mimeType', value: website2.mimeType } ] );
            expect( testBed.scope.resources.medium.location.toString() ).toEqual( website2.location );
            expect( testBed.scope.model.mediaType ).toEqual( 'website' );

            update( resourceId, [ { op:'replace', path: '/location', value: website1.location } ] );
            expect( testBed.scope.resources.medium.location.toString() ).toEqual( website1.location );
            expect( testBed.scope.resources.medium.mimeType ).toEqual( website2.mimeType );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'loads from the configured media location (R1.3)', function() {
            // we call toString on the location, because it is always wrapped in a
            // sceTrustedValueWrapper

            setup( { medium: { resource: resourceId } } );
            replace( resourceId, image1 );
            expect( testBed.scope.resources.medium.location.toString() ).toEqual( image1.location );
            update( resourceId, [
               { op: 'replace', path: '/mimeType', value: website1.mimeType },
               { op: 'replace', path: '/location', value: website1.location }
            ] );
            expect( testBed.scope.resources.medium.location.toString() ).toEqual( website1.location );
            update( resourceId, [
               { op: 'replace', path: '/mimeType', value: image2.mimeType },
               { op: 'replace', path: '/location', value: image2.location }
            ] );
            expect( testBed.scope.resources.medium.location.toString() ).toEqual( image2.location );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'interprets the media type correctly (R1.4)', function() {
            setup( { medium: { resource: 'theMedia' } } );
            replace( resourceId, image1 );
            expect( testBed.scope.model.mediaType ).toEqual( 'image' );
            update( resourceId, [ { op:'replace', path: '/mimeType', value: 'image/jpeg' } ] );
            expect( testBed.scope.model.mediaType ).toEqual( 'image' );
            update( resourceId, [ { op:'replace', path: '/mimeType', value: 'image/gif' } ] );
            expect( testBed.scope.model.mediaType ).toEqual( 'image' );

            replace( resourceId, website1 );
            expect( testBed.scope.model.mediaType ).toEqual( 'website' );
            replace( resourceId, website2 );
            expect( testBed.scope.model.mediaType ).toEqual( 'website' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'shows a title if desired and possible (R1.5)', function() {
            setup( { medium: { resource: 'theMedia', showTitle: true } } );
            replace( resourceId, image3 );
            expect( testBed.scope.model.showTitle ).toEqual( true );
            replace( resourceId, image1 );
            expect( testBed.scope.model.showTitle ).toEqual( false );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'shows no title if not desired (R1.5)', function() {
            setup( { medium: { resource: 'theMedia', showTitle: false } } );
            replace( resourceId, image3 );
            expect( testBed.scope.model.showTitle ).toEqual( false );
            replace( resourceId, image1 );
            expect( testBed.scope.model.showTitle ).toEqual( false );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'shows a caption if desired and possible (R1.6)', function() {
            setup( { medium: { resource: 'theMedia', showCaption: true } } );
            replace( resourceId, image3 );
            expect( testBed.scope.model.showCaption ).toEqual( true );
            replace( resourceId, image1 );
            expect( testBed.scope.model.showCaption ).toEqual( false );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'shows no caption if not desired (R1.6)', function() {
            setup( { medium: { resource: 'theMedia', showCaption: false } } );
            replace( resourceId, image3 );
            expect( testBed.scope.model.showCaption ).toEqual( false );
            replace( resourceId, image1 );
            expect( testBed.scope.model.showCaption ).toEqual( false );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'waits for any of the configured actions (R1.7)', function() {
            setup( { medium: { resource: resourceId, showTitle: true, onActions: [ 'showMedia' ] } } );
            replace( resourceId, image4 );
            expect( testBed.scope.model.mediaType ).toEqual( null );
            expect( testBed.scope.model.showTitle ).toEqual( false );
            testBed.eventBusMock.publish( 'takeActionRequest.showMedia', {
               action: 'showMedia'
            } );
            jasmine.Clock.tick( 0 );
            expect( testBed.scope.model.mediaType ).toEqual( 'image' );
            expect( testBed.scope.model.showTitle ).toEqual( true );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'allows to configure individual onActions as string (for backwards compatibility)(R1.7)', function() {
            setup( { medium: { resource: resourceId, showTitle: true, onActions: 'showMedia' } } );
            replace( resourceId, image4 );
            expect( testBed.scope.model.mediaType ).toEqual( null );
            expect( testBed.scope.model.showTitle ).toEqual( false );
            testBed.eventBusMock.publish( 'takeActionRequest.showMedia', {
               action: 'showMedia'
            } );
            jasmine.Clock.tick( 0 );
            expect( testBed.scope.model.mediaType ).toEqual( 'image' );
            expect( testBed.scope.model.showTitle ).toEqual( true );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

      } );

      afterEach( function() {
         testBed.tearDown();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with a configured feature layout: size-to-container', function() {

         it( 'does not use any fixed size (R2.1)', function() {
            setup( { medium: { resource: 'theMedia', showCaption: false } } );
            replace( resourceId, website2 );
            expect( testBed.scope.resources.medium.mediaInformation ).toBeUndefined();
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      // R2.2 is the default behaviour of the browsers
      // R2.2, R2.3: No complex ui tests for simple CSS and HTML markup.

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with a configured feature layout: size-to-content', function() {

         it( 'respects the required content size (R2.4)', function() {
            setup( {
               medium: { resource: 'theMedia', showCaption: false },
               layout: { sizeToContent: true }
            } );
            replace( resourceId, website3 );
            expect( testBed.scope.resources.medium.mediaInformation.pixelWidth ).toEqual( 42 );
            expect( testBed.scope.resources.medium.mediaInformation.pixelHeight ).toEqual( 815 );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      // R2.2, R2.3, R2.5, R2.6: No complex ui tests for simple CSS and HTML markup.

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with a configured feature layout \'size-to-content\' and the surveying of the embedded site is not possible and the resource doesn\'t include mediaInformation', function() {

         it( 'logs a warning and changes to layout size-to-container (R2.7)', function() {
            spyOn( ax.log, 'warn' );
            setup( {
               medium: { resource: 'theMedia', showCaption: false },
               layout: { sizeToContent: true }
            } );
            replace( resourceId, website4 );

            jasmine.Clock.tick( 0 );
            expect( ax.log.warn ).toHaveBeenCalled();
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with a configured feature integration', function() {

         it( 'sets the requested window name (R3.1)', function() {
            setup( {
               medium: { resource: 'theMedia', showCaption: false },
               integration: { name: 'myFrameName' }
            } );
            replace( resourceId, website3 );
            expect( testBed.scope.model.integration.name ).toEqual( 'myFrameName' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with a configured feature fallback', function() {

         it( 'displays a link to the media content with the configured text (R4.1, R4.2, R4.3)', function() {
            var linkText = 'link to media';
            setup( {
               medium: { resource: 'theMedia', showCaption: false },
               fallback: { i18nHtmlText: linkText }
            } );
            replace( resourceId, ax.object.deepClone( website1 ) );

            expect( testBed.scope.model.fallback ).toBeDefined();
            expect( testBed.scope.model.fallback.i18nHtmlText ).toEqual( linkText );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with a configured feature i18n', function() {

         it( 'keeps up with changes to its configured locale (R5.1)', function() {
            setup( {
               medium: { resource: 'theMedia', showCaption: false },
               integration: { name: 'myFrameName' }
            } );
            replace( resourceId, ax.object.deepClone( website3 ) );
            expect( testBed.scope.resources.medium.name ).toEqual( website3.i18nName.en_US );
            expect( testBed.scope.resources.medium.description ).toEqual( website3.i18nDescription.en_US );

            testBed.eventBusMock.publish( 'didChangeLocale.default', {
               locale: 'default',
               languageTag: 'en_US'
            } );
            jasmine.Clock.tick( 0 );
            expect( testBed.scope.resources.medium.name ).toEqual( website3.i18nName.en_US );
            expect( testBed.scope.resources.medium.description ).toEqual( website3.i18nDescription.en_US );

            replace( resourceId, ax.object.deepClone( image3 ) );
            expect( testBed.scope.resources.medium.name ).toEqual( image3.name );
            expect( testBed.scope.resources.medium.description ).toEqual( image3.description );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function replace( resourceId, medium ) {
         testBed.eventBusMock.publish( 'didReplace.' + resourceId, { resource: 'theMedia', data: medium } );
         jasmine.Clock.tick( 0 );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function update( resourceId, patches ) {
         testBed.eventBusMock.publish( 'didUpdate.' + resourceId, {
            resource: resourceId,
            patches: patches
         } );
         jasmine.Clock.tick( 0 );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function setup( features ) {
         testBed = ax.testing.portalMocksAngular.createControllerTestBed( 'laxarjs/ax-media-widget' );
         testBed.featuresMock = features;
         testBed.useWidgetJson();
         testBed.setup();
         testBed.eventBusMock.publish( 'didChangeLocale.default', {
            locale: 'default',
            languageTag: 'en_US'
         } );
         jasmine.Clock.tick( 0 );
      }

   } );
} );
