
/// <reference path='../component/component.d.ts' />

import React = require('../component/component');
import { Component } from '../component/component';

interface P extends Props { }
interface S { }
interface E extends Elements { }

function getMountNode() {
    return document.getElementById('test');
}

export function getMountedDOMHTMLString(frag: DocumentFragment): string {
    let testMount = getMountNode();
    testMount.innerHTML = '';
    testMount.appendChild(frag);
    return testMount.innerHTML;;
}

export function prepareHTML(HTML: string): void {
    let testMount = getMountNode();
    testMount.innerHTML = HTML;
}