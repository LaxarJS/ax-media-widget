/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
export const name = 'axMediaWidgetIframeResize';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const MEASURE_INTERVAL_MS = 250;

export function create() {
   return [ '$window', $window => {
      return {
         restrict: 'A',
         scope: true,
         link: ( scope, element ) => {

            let interval = null;
            const [ iframe ] = element;

            if( scope.model.layoutClass === 'ax-local-size-to-content' ) {
               scope.$watch( 'resources.medium', updateDisplayStyle, true );
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function updateDisplayStyle() {
               cleanUp();
               if( scope.model.layoutClass === 'ax-local-size-to-content' &&
                   scope.model.mediaType === 'website' ) {
                  setUp();
               }
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function cleanUp() {
               iframe.setAttribute( 'scrolling', 'auto' );
               if( interval !== null ) {
                  $window.clearInterval( interval );
               }
               resetPixelDimensions( iframe );
            }

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function setUp() {
               function refit() {
                  if( !resizeToFit( iframe ) ) {
                     // iframe has gone away
                     $window.clearInterval( interval );
                  }
               }

               const information = scope.resources.medium.mediaInformation;
               const mediaSizeAvailable = information && information.pixelWidth && information.pixelHeight;

               if( mediaSizeAvailable ) {
                  const pixelWidth = information.pixelWidth;
                  const pixelHeight = information.pixelHeight;
                  setPixelDimensions( iframe, pixelWidth, pixelHeight );
               }
               else if( scope.model.isSameOrigin && scope.model.canBeMeasured ) {
                  iframe.setAttribute( 'scrolling', 'no' );
                  interval = $window.setInterval( refit, MEASURE_INTERVAL_MS );
                  scope.$on( '$destroy', cleanUp );
               }
            }

         }
      };
   } ];
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function resizeToFit( iframe ) {
   if( !iframe ) {
      // Indicate that the iframe is not there (anymore): Cancel the timeout.
      return false;
   }

   const body = iframe.contentDocument && iframe.contentDocument.body;
   if( !body || !body.scrollHeight ) {
      // not ready yet, but keep trying.
      return true;
   }

   const html = iframe.contentDocument.documentElement;
   setPixelDimensions( iframe, html.offsetWidth, html.offsetHeight );
   return true;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function setPixelDimensions( iframe, width, height ) {
   if( width ) {
      iframe.style.width = `${width}px`;
   }
   if( height ) {
      iframe.style.height = `${height}px`;
   }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function resetPixelDimensions( iframe ) {
   delete iframe.style.minWidth;
   delete iframe.style.minHeight;
}
