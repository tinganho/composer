
import HtmlRunner from './htmlRunner';

declare function require(path: string): any;
require('source-map-support').install();
require('es6-promise').polyfill();

new HtmlRunner(process.argv).runTests();