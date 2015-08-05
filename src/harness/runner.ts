
(global as any).inServer = true;
(global as any).inClient = false;

import ImageTestRunner from './imageTestRunner';
import { parseCommandLineOptions } from './commandLineParser';

declare function require(path: string): any;
require('source-map-support').install();
require('es6-promise').polyfill();

let options = parseCommandLineOptions(process.argv);
new ImageTestRunner(options).runTests();