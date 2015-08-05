
/// <reference path='../../../typings/platform/platform.d.ts' />
/// <reference path='../../../src/component/component.d.ts' />

import * as React from '../../../src/component/element';
import { ComposerLayout, Link } from '../../../src/component/layerComponents';

interface Regions extends Props {
    TopBar: new(props: any, children: any) => ComposerContent<any, any, any>;
    Body: new(props: any, children: any) => ComposerContent<any, any, any>;
}

export class Layout extends ComposerLayout<Regions, {}, Elements> {
    public id = 'composer-layout';

    public render() {
        return (
            <div id='Layout'>
                <header class='TopBarRegion'>
                    {this.props.TopBar}
                </header>
                <div id='BodyRegion'>
                    {this.props.Body}
                </div>
            </div>
        );
    }
}