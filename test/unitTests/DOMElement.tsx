
/// <reference path='../../src/component/component.d.ts' />
/// <reference path='../../typings/mocha/mocha.d.ts' />
/// <reference path='../../typings/chai/chai.d.ts' />

import React = require('../../src/component/element');
import { ComposerDOMElement } from '../../src/component/DOMElement';
import { prepareHTML } from '../../src/harness/componentHarness';
import { expect } from 'chai';

describe('DOM Elements', () => {
    beforeEach(() => {
        let testElement = document.getElementById('test');
        testElement.innerHTML = '';
    });

    it('getHTML', () => {
        let testHelper = new ComposerDOMElement(document.getElementById('test'));
        let testObject = new ComposerDOMElement(document.createElement('div'));
        testObject.id = 'a';
        testHelper.append(testObject);
        expect(testHelper.getHTML()).to.equal('<div id="a"></div>');
    });

    it('getText', () => {
        let testHelper = new ComposerDOMElement(document.getElementById('test'));
        let testObject = new ComposerDOMElement(document.createElement('div'));
        testObject.id = 'a';
        testObject.nativeElement.innerHTML = 'a'
        testHelper.append(testObject);
        expect(testHelper.getText()).to.equal('a');
    });

    it('findOne', () => {
        let testHelper = new ComposerDOMElement(document.getElementById('test'));
        let testObject = new ComposerDOMElement(document.createElement('div'));
        testObject.id = 'a';
        testHelper.append(testObject);
        expect(testHelper.findOne('#a').id).to.equal('a');
    });

    it('findAll', () => {
        let testHelper = new ComposerDOMElement(document.getElementById('test'));
        let testObject = new ComposerDOMElement(document.createElement('div'));
        testObject.id = 'a';
        testObject.addClass('c');
        testHelper.append(testObject);
        expect(testHelper.findAll('.c')[0].id).to.equal('a');
    });

    it('setAttribute/getAttribute', () => {
        let testHelper = new ComposerDOMElement(document.getElementById('test'));
        let testObject = new ComposerDOMElement(document.createElement('div'));
        testObject.setAttribute('a', 'a');
        expect(testObject.getAttribute('a')).to.equal('a');
    });

    it('before', () => {
        let testHelper = new ComposerDOMElement(document.getElementById('test'));
        let testObject = new ComposerDOMElement(document.createElement('div'));
        testObject.id = 'a';
        testHelper.before(testObject);
        expect(document.getElementById('a').nextSibling.isEqualNode(testHelper.nativeElement)).to.be.true;
    });

    it('after', () => {
        let testHelper = new ComposerDOMElement(document.getElementById('test'));
        let testObject = new ComposerDOMElement(document.createElement('div'));
        testObject.id = 'a';
        testHelper.after(testObject);
        expect(testHelper.nativeElement.nextSibling.isEqualNode(testObject.nativeElement)).to.be.true;
    });

    it('prepend', () => {
        let testHelper = new ComposerDOMElement(document.getElementById('test'));
        let testObject = new ComposerDOMElement(document.createElement('div'));
        testObject.id = 'a';
        testHelper.nativeElement.innerHTML = '<div id="b"></div>';
        testHelper.prepend(testObject);
        expect(testHelper.nativeElement.firstChild.isEqualNode(testObject.nativeElement)).to.be.true;
    });

    it('append', () => {
        let testHelper = new ComposerDOMElement(document.getElementById('test'));
        let testObject = new ComposerDOMElement(document.createElement('div'));
        testObject.id = 'a';
        testHelper.nativeElement.innerHTML = '<div id="b"></div>';
        testHelper.append(testObject);
        expect(testHelper.nativeElement.lastChild.isEqualNode(testObject.nativeElement)).to.be.true;
    });

    it('hide', () => {
        let testObject = new ComposerDOMElement(document.createElement('div'));
        testObject.hide()
        expect(testObject.nativeElement.style.display).to.equal('none');
    });

    it('remove', () => {
        let testHelper = new ComposerDOMElement(document.getElementById('test'));
        let testObject = new ComposerDOMElement(document.createElement('div'));
        testHelper.append(testObject);
        testObject.remove();
        expect(testHelper.getHTML()).to.equal('');
    });

    it('addClass', () => {
        let testHelper = new ComposerDOMElement(document.getElementById('test'));
        let testObject = new ComposerDOMElement(document.createElement('div'));
        testHelper.append(testObject);
        testObject.addClass('a');
        expect(testObject.nativeElement.className).to.equal('a');
    });

    it('removeClass', () => {
        let testHelper = new ComposerDOMElement(document.getElementById('test'));
        let testObject = new ComposerDOMElement(document.createElement('div'));
        testHelper.append(testObject);
        testObject.addClass('a');
        testObject.removeClass('a');
        expect(testObject.nativeElement.className).to.equal('');
    });

    it('getClasses', () => {
        let testHelper = new ComposerDOMElement(document.getElementById('test'));
        let testObject = new ComposerDOMElement(document.createElement('div'));
        testHelper.append(testObject);
        testObject.addClass('a').addClass('b');
        expect(testObject.getClasses()).to.deep.equal(['a', 'b']);
    });
});