
(global as any).inServer = true;
(global as any).inClient = false;

import ImageTestRunner from './imageTestRunner';

declare function require(path: string): any;
require('source-map-support').install();
require('es6-promise').polyfill();

new ImageTestRunner(process.argv).runTests();