/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
export const name = 'axMediaWidgetIframeIntegration';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function create() {
   return [ () => {
      return {
         restrict: 'A',
         scope: true,
         link: ( scope, element, attrs ) => {
            const [ iframe ] = element;
            const scopeProperty = attrs[ name ];

            scope.$watch( scopeProperty, () => {
               const windowName = scope.$eval( scopeProperty );
               iframe.setAttribute( 'name', windowName );
               if( iframe.contentWindow ) {
                  iframe.contentWindow.name = windowName;
               }
               else {
                  element.on( 'load', () => {
                     iframe.contentWindow.name = windowName;
                  } );
               }
            } );
         }
      };
   } ];
}
