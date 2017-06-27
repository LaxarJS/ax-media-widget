/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as axMocks from 'laxar-mocks';
import * as ax from 'laxar';
import 'angular';
import 'angular-mocks';

describe( 'A laxar-media-widget ', () => {

   let widgetScope;
   let testEventBus;

   const image1 = { mimeType: 'image/png', location: 'http://www.example.com/image1.png' };
   const image2 = { mimeType: 'image/jpeg', location: 'http://www.example.com/image2.jpg' };
   const image3 = {
      mimeType: 'image/jpeg', location: 'http://www.example.com/image3.jpg',
      name: 'Entitlement is Optional', description: 'A fascinating specimen.'
   };
   const image4 = {
      mimeType: 'image/png', location: 'http://www.example.com/image1.png',
      name: 'Entitlement is Optional', description: 'A fascinating specimen.'
   };
   const websiteBlank = { mimeType: 'text/html', location: 'about:blank' };
   const website1 = { mimeType: 'text/html', location: 'http://www.laxarjs.org/' };
   const website2 = { mimeType: 'application/xhtml+xml', location: 'http://www.example.com/page2' };
   const website3 = {
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
   const website4 = { mimeType: 'application/pdf', location: 'http://www.example.com/file.pdf' };

   beforeEach( axMocks.setupForWidget() );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createSetup( widgetConfiguration ) {

      beforeEach( () => {
         axMocks.widget.configure( widgetConfiguration );
      } );

      beforeEach( axMocks.widget.load );

      beforeEach( () => {
         axMocks.widget.render();

         widgetScope = axMocks.widget.$scope;
         testEventBus = axMocks.eventBus;
         axMocks.triggerStartupEvents( {
            didChangeLocale: {
               default: {
                  locale: 'default',
                  languageTag: 'en_US'
               }
            }
         } );
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   afterEach( axMocks.tearDown );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with configured media feature', () => {

      describe( 'and configured resource', () => {

         createSetup( { medium: { resource: 'theMedia' } } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'displays media content in a suitable HTML element (R1.1)', () => {
            testEventBus.publish( 'didReplace.theMedia', { resource: 'theMedia', data: websiteBlank } );
            testEventBus.flush();
            expect( document.querySelector( 'iframe' ) ).toBeDefined();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'acts as resource slave in Master/Slave pattern (R1.2)', () => {
            // we call toString on the location, because it is always wrapped in a
            // sceTrustedValueWrapper

            replace( 'theMedia', image1 );
            expect( widgetScope.resources.medium.location.toString() ).toEqual( image1.location );
            expect( widgetScope.model.mediaType ).toEqual( 'image' );

            update( 'theMedia', [ { op: 'replace', path: '/location', value: website2.location } ] );
            update( 'theMedia', [ { op: 'replace', path: '/mimeType', value: website2.mimeType } ] );
            expect( widgetScope.resources.medium.location.toString() ).toEqual( website2.location );
            expect( widgetScope.model.mediaType ).toEqual( 'website' );

            update( 'theMedia', [ { op: 'replace', path: '/location', value: website1.location } ] );
            expect( widgetScope.resources.medium.location.toString() ).toEqual( website1.location );
            expect( widgetScope.resources.medium.mimeType ).toEqual( website2.mimeType );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'loads from the configured media location (R1.3)', () => {
            // we call toString on the location, because it is always wrapped in a
            // sceTrustedValueWrapper

            replace( 'theMedia', image1 );
            expect( widgetScope.resources.medium.location.toString() ).toEqual( image1.location );
            update( 'theMedia', [
               { op: 'replace', path: '/mimeType', value: website1.mimeType },
               { op: 'replace', path: '/location', value: website1.location }
            ] );
            expect( widgetScope.resources.medium.location.toString() ).toEqual( website1.location );
            update( 'theMedia', [
               { op: 'replace', path: '/mimeType', value: image2.mimeType },
               { op: 'replace', path: '/location', value: image2.location }
            ] );
            expect( widgetScope.resources.medium.location.toString() ).toEqual( image2.location );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'interprets the media type correctly (R1.4)', () => {
            replace( 'theMedia', image1 );
            expect( widgetScope.model.mediaType ).toEqual( 'image' );
            update( 'theMedia', [ { op: 'replace', path: '/mimeType', value: 'image/jpeg' } ] );
            expect( widgetScope.model.mediaType ).toEqual( 'image' );
            update( 'theMedia', [ { op: 'replace', path: '/mimeType', value: 'image/gif' } ] );
            expect( widgetScope.model.mediaType ).toEqual( 'image' );

            replace( 'theMedia', website1 );
            expect( widgetScope.model.mediaType ).toEqual( 'website' );
            replace( 'theMedia', website2 );
            expect( widgetScope.model.mediaType ).toEqual( 'website' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'and configured resource and showTitle is true', () => {

         createSetup( { medium: { resource: 'theMedia', showTitle: true } } );

         it( 'shows a title if desired and possible (R1.5)', () => {
            replace( 'theMedia', image3 );
            expect( widgetScope.model.showTitle ).toEqual( true );
            replace( 'theMedia', image1 );
            expect( widgetScope.model.showTitle ).toEqual( false );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'and configured resource and showTitle is false', () => {

         createSetup( { medium: { resource: 'theMedia', showTitle: false } } );

         it( 'shows no title if not desired (R1.5)', () => {
            replace( 'theMedia', image3 );
            expect( widgetScope.model.showTitle ).toEqual( false );
            replace( 'theMedia', image1 );
            expect( widgetScope.model.showTitle ).toEqual( false );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'and configured resource and showCaption is true', () => {

         createSetup( { medium: { resource: 'theMedia', showCaption: true } } );

         it( 'shows a caption if desired and possible (R1.6)', () => {
            replace( 'theMedia', image3 );
            expect( widgetScope.model.showCaption ).toEqual( true );
            replace( 'theMedia', image1 );
            expect( widgetScope.model.showCaption ).toEqual( false );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'and configured resource and showCaption is false', () => {

         createSetup( { medium: { resource: 'theMedia', showCaption: false } } );

         it( 'shows no caption if not desired (R1.6)', () => {
            replace( 'theMedia', image3 );
            expect( widgetScope.model.showCaption ).toEqual( false );
            replace( 'theMedia', image1 );
            expect( widgetScope.model.showCaption ).toEqual( false );
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'and configured resource and configured actions', () => {

         createSetup( { medium: { resource: 'theMedia', showTitle: true, onActions: [ 'showMedia' ] } } );

         it( 'waits for any of the configured actions (R1.7)', () => {
            replace( 'theMedia', image4 );
            expect( widgetScope.model.mediaType ).toEqual( null );
            expect( widgetScope.model.showTitle ).toEqual( false );

            testEventBus.publish( 'takeActionRequest.showMedia', { action: 'showMedia' } );
            testEventBus.flush();

            expect( widgetScope.model.mediaType ).toEqual( 'image' );
            expect( widgetScope.model.showTitle ).toEqual( true );
         } );

      } );
   } );


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with a configured feature layout: size-to-container', () => {

      createSetup( { medium: { resource: 'theMedia', showCaption: false } } );

      it( 'does not use any fixed size (R2.1)', () => {
         replace( 'theMedia', website2 );
         expect( widgetScope.resources.medium.mediaInformation ).toBeUndefined();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // R2.2 is the default behaviour of the browsers
   // R2.2, R2.3: No complex ui tests for simple CSS and HTML markup.

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with a configured feature layout: size-to-content', () => {

      createSetup( {
         medium: { resource: 'theMedia', showCaption: false },
         layout: { sizeToContent: true }
      } );

      it( 'respects the required content size (R2.4)', () => {
         replace( 'theMedia', website3 );
         expect( widgetScope.resources.medium.mediaInformation.pixelWidth ).toEqual( 42 );
         expect( widgetScope.resources.medium.mediaInformation.pixelHeight ).toEqual( 815 );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // R2.2, R2.3, R2.5, R2.6: No complex ui tests for simple CSS and HTML markup.

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // eslint-disable-next-line max-len
   describe( 'with a configured feature layout \'size-to-content\' and the surveying of the embedded site is not possible and the resource doesn\'t include mediaInformation', () => {

      createSetup( {
         medium: { resource: 'theMedia', showCaption: false },
         layout: { sizeToContent: true }
      } );

      it( 'logs a warning and changes to layout size-to-container (R2.7)', () => {
         replace( 'theMedia', website4 );
         testEventBus.flush();
         expect( axMocks.widget.axLog.warn ).toHaveBeenCalled();
      } );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with a configured feature integration', () => {

      createSetup( {
         medium: { resource: 'theMedia', showCaption: false },
         integration: { name: 'myFrameName' }
      } );

      it( 'sets the requested window name (R3.1)', () => {
         replace( 'theMedia', website3 );
         expect( widgetScope.model.integration.name ).toEqual( 'myFrameName' );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with a configured feature fallback', () => {
      const linkText = 'link to media';

      createSetup( {
         medium: { resource: 'theMedia', showCaption: false },
         fallback: { i18nHtmlText: linkText }
      } );

      it( 'displays a link to the media content with the configured text (R4.1, R4.2, R4.3)', () => {
         replace( 'theMedia', ax.object.deepClone( website1 ) );
         expect( widgetScope.model.fallback ).toBeDefined();
         expect( widgetScope.model.fallback.i18nHtmlText ).toEqual( linkText );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with a configured feature i18n', () => {

      createSetup( {
         medium: { resource: 'theMedia', showCaption: false },
         integration: { name: 'myFrameName' }
      } );

      it( 'keeps up with changes to its configured locale (R5.1)', () => {
         replace( 'theMedia', ax.object.deepClone( website3 ) );
         expect( widgetScope.resources.medium.name ).toEqual( website3.i18nName.en_US );
         expect( widgetScope.resources.medium.description ).toEqual( website3.i18nDescription.en_US );

         testEventBus.publish( 'didChangeLocale.default', {
            locale: 'default',
            languageTag: 'en_US'
         } );
         testEventBus.flush();
         expect( widgetScope.resources.medium.name ).toEqual( website3.i18nName.en_US );
         expect( widgetScope.resources.medium.description ).toEqual( website3.i18nDescription.en_US );

         replace( 'theMedia', ax.object.deepClone( image3 ) );
         expect( widgetScope.resources.medium.name ).toEqual( image3.name );
         expect( widgetScope.resources.medium.description ).toEqual( image3.description );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function replace( resource, data ) {
      testEventBus.publish( `didReplace.${resource}`, { resource, data } );
      testEventBus.flush();
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function update( resource, patches ) {
      testEventBus.publish( `didUpdate.${resource}`, { resource, patches } );
      testEventBus.flush();
   }

} );
