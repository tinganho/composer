
import Harness from './harness';

declare function require(path: string): any;
require('source-map-support').install();

new Harness(process.argv).runTests();