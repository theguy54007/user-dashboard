// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import process from "process";

export const environment = {
  production: false,
  restfulHost: 'http://localhost:3000',
  fbClientId: process.env.FB_CLIENT_ID,
  googleClientId: '326670815247-7lk0s3jlnjc70r3um3je5r0oo168hq7e.apps.googleusercontent.com'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
