
/// <reference path='./react.d.ts' />

declare module 'react-dom/server' {
    export { renderToString, renderToStaticMarkup } from 'react';
}