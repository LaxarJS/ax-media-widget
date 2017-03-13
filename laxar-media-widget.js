/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as ng from 'angular';
import { object } from 'laxar';
import { actions, resources } from 'laxar-patterns';
import * as iframeResizeDirective from './iframe-resize-directive';
import * as iframeIntegrationDirective from './iframe-integration-directive';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const CLASS_SIZE_TO_CONTENT = 'ax-local-size-to-content';
const CLASS_SIZE_TO_CONTAINER = 'ax-local-size-to-container';

const TYPE_FALLBACK = 'fallback';
const TYPE_IMAGE = 'image';
const TYPE_WEBSITE = 'website';

const MEDIA_TYPE_BY_MIME_TYPE = {
   'image/png': TYPE_IMAGE,
   'image/jpeg': TYPE_IMAGE,
   'image/gif': TYPE_IMAGE,
   'application/xhtml+xml': TYPE_WEBSITE,
   'text/html': TYPE_WEBSITE,
   'application/pdf': TYPE_WEBSITE
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

Controller.$inject = [ '$scope', '$sce', 'axI18n', 'axLog' ];

function Controller( $scope, $sce, axI18n, log ) {

   $scope.i18n = axI18n;
   axI18n.whenLocaleChanged( updateLocalization );

   $scope.resources = {};
   $scope.model = {
      mediaType: null,
      showTitle: false,
      showCaption: false,
      isSameOrigin: false,
      layoutClass: CLASS_SIZE_TO_CONTAINER,
      integration: $scope.features.integration || { name: '' },
      fallback: {
         i18nHtmlText: $scope.features.fallback.i18nHtmlText
      }
   };

   let showMedia = !object.path( $scope.features, 'medium.onActions', [] ).length;
   actions.handlerFor( $scope ).registerActionsFromFeature( 'medium', () => {
      showMedia = true;
      updateModel();
   } );

   resources.handlerFor( $scope ).registerResourceFromFeature( 'medium', {
      onUpdateReplace: [ updateLocalization, updateModel ]
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function updateLocalization() {
      const medium = $scope.resources.medium;
      if( !medium || !showMedia ) {
         return;
      }
      if( medium.i18nName ) {
         medium.name = axI18n.localize( medium.i18nName );
      }
      if( medium.i18nDescription ) {
         medium.description = axI18n.localize( medium.i18nDescription );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function updateModel() {
      const medium = $scope.resources.medium;
      if( !medium || !showMedia ) {
         return;
      }

      if( !( medium.mimeType in MEDIA_TYPE_BY_MIME_TYPE ) ) {
         log.warn( 'Unsupported mimeType: [0]', medium.mimeType );
      }

      const model = $scope.model;

      // feature: medium
      model.mediaType = MEDIA_TYPE_BY_MIME_TYPE[ medium.mimeType ];
      model.showTitle = !!$scope.features.medium.showTitle && !!medium.name;
      model.showCaption = !!$scope.features.medium.showCaption && !!medium.description;

      // feature: layout
      const sizeToContentRequested = $scope.features.layout && $scope.features.layout.sizeToContent;
      const isImage = model.mediaType === TYPE_IMAGE;
      const isPdf = medium.mimeType === 'application/pdf';
      const sameOrigin = isSameOrigin( medium.location );
      const hasExplicitSize = medium.mediaInformation &&
                              medium.mediaInformation.pixelHeight !== null &&
                              medium.mediaInformation.pixelWidth !== null;

      let canBeMeasured = isImage;
      let problems = '';
      if( model.mediaType === TYPE_WEBSITE ) {
         canBeMeasured = sameOrigin;
         if( !sameOrigin ) {
            problems += '- Content is cross-domain.\n';
         }
         if( isPdf ) {
            canBeMeasured = false;
            problems += '- PDF-Content cannot be measured.\n';
         }
      }
      if( sizeToContentRequested && !canBeMeasured && !hasExplicitSize ) {
         problems += '- mediaInformation is missing';
         log.warn( `Cannot use sizeToContent: ${problems}`, $scope.id() );
      }

      if( isPdf ) {
         const platform = navigator.platform;
         if( platform === 'iPad' || platform === 'iPhone' || platform === 'iPod' ) {
            // There is no way to display a PDF of unknown height using an iframe on iOS (no scrolling).
            model.mediaType = TYPE_FALLBACK;
         }
      }

      model.layoutClass = ( sizeToContentRequested && (canBeMeasured || hasExplicitSize) ) ?
         CLASS_SIZE_TO_CONTENT :
         CLASS_SIZE_TO_CONTAINER;

      model.canBeMeasured = canBeMeasured;
      model.isSameOrigin = sameOrigin;

      // We trust every kind of urls from the resource
      if( typeof medium.location === 'string' ) {
         medium.location = $sce.trustAsResourceUrl( medium.location );
      }
   }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function parseUrl( url ) {
   // For MSIE <= 8: We cannot simply createElement('a')
   const div = document.createElement( 'div' );
   div.innerHTML = '<a></a>';
   div.firstChild.href = url;

   // For MSIE <= 8: force re-parsing URL
   // noinspection SillyAssignmentJS
   div.innerHTML = div.innerHTML;

   return div.firstChild;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function isSameOrigin( url ) {
   const frameLoc = parseUrl( url );
   const loc = window.location;

   // For MSIE <= 8: handle local paths correctly
   const isLocal = frameLoc.hostname === '' && frameLoc.port === '';
   return isLocal || (
      frameLoc.hostname === loc.hostname &&
      frameLoc.port === loc.port &&
      frameLoc.protocol === loc.protocol );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

// because of duplicate requests of IE in iframes. ngSrc is not working correctly here.
// See https://github.com/angular/angular.js/issues/9843
const axMediaSrcDirectiveName = 'axMediaSrc';
const axMediaSrcDirective = () => {
   return {
      priority: 99,
      restrict: 'A',
      link: ( scope, element, attr ) => {
         attr.$observe( axMediaSrcDirective, value => {
            if( value ) {
               attr.$set( 'src', value );
            }
         } );
      }
   };
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const name = ng.module( 'axMediaWidget', [] )
   .controller( 'AxMediaWidgetController', Controller )
   .directive( axMediaSrcDirectiveName, axMediaSrcDirective )
   .directive( iframeResizeDirective.name, iframeResizeDirective.create() )
   .directive( iframeIntegrationDirective.name, iframeIntegrationDirective.create() ).name;
