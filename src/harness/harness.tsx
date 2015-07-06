
/// <reference path='../../typings/mocha/mocha.d.ts'/>
/// <reference path='../../typings/express/express.d.ts'/>
/// <reference path='../../typings/sinon/sinon.d.ts'/>
/// <reference path='../../typings/react/react.d.ts'/>
/// <reference path='../../typings/react/react-jsx.d.ts'/>
/// <reference path='../../typings/nightmare/nightmare.d.ts'/>
/// <reference path='../../typings/chai/chai.d.ts'/>
/// <reference path='../../typings/morgan/morgan.d.ts'/>

import logger = require('morgan');
import cf from '../../conf/conf';
import * as composer from '../composer/composer';
import {sync as glob} from 'glob';
import * as path from 'path';
import express = require('express');
import * as sinon from 'sinon';
import * as React from 'react';
import * as http from 'http';
import {readFile} from 'fs';
import {expect} from 'chai';
import Nightmare = require('nightmare');

declare function require(path: string): any;
require('source-map-support').install();

interface Props {}

interface States {}


class Document<P, S, C extends composer.DocumentProps> extends React.Component<P, S> implements composer.Document<P, S, C> {
    public name = 'Default';
    
    constructor(public docProps: C) {
        super();
    }
    
    render() {
        return (
            <html lang="en">
                <head>
                    <link rel="stylesheet" href="/public/styles/styles.css"/>
                </head>
                <body>
                </body>
            </html>
        );
    }
}

interface LayoutRegions {
    TopBar: string;
    Body: string;
    Footer: string;
}

class Layout<P, S, C extends composer.Contents> extends React.Component<P, S> implements composer.Layout<P, S, C>  {
    public name = 'Body withTopBar withFooter';
    
    constructor(public contents: C) {
        super();
    }
}

let defaultConfigs: composer.DocumentProps = {
    confs: ['default']
}

let app: express.Express;

export default class Harness {
    runTests() {
        let files = glob('test/cases/*.ts', { cwd: path.join(__dirname, '../../../') });
        for (var file of files) {
            var fileName = path.basename(file);

            describe(fileName, () => {
                beforeEach(() => {
                    app = express();
                    app.use('/public', express.static('public'));
                    app.use(logger('dev'));
                    composer.init({
                        app,
                        clientConfPath: './client/*.js',
                        rootPath: __dirname
                    });
                });

                afterEach(() => {
                    app = null;
                });

                it('should be able to set pages', (done) => {
                    composer.setPages({
                        '/': function(page) {
                            page.onPlatform({ name: 'all', detect: () => true })
                                .hasDocument(Document, defaultConfigs)
                                .hasLayout(Layout, {
                                });
                        }
                    });

                    let server = http.createServer(app);
                    server.listen(cf.PORT, function(err: any) {
                        new Nightmare()
                            .viewport(900, 1200)
                            .goto(`http://${cf.HOST}:${cf.PORT}/`)
                            .wait()
                            .screenshot(`test/baselines/local/${fileName}.jpg`)
                            .run((err, nightmare) => {
                                server.close((err: any) => {
                                    done();
                                });
                            });
                    });
                });
            });
        }
    }
}
