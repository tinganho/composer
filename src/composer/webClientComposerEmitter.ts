
import { createTextWriter, forEach } from '../core';
import { sys } from '../sys';

export const enum ModuleKind {
    None,
    Amd,
    CommonJs,
}

export interface ComponentEmitInfo {
    className: string;
    importPath: string;
}

interface EmitTextWriter {
    write(s: string): void;
    writeLine(): void;
    increaseIndent(): void;
    decreaseIndent(): void;
    getText(): string;
    rawWrite(s: string): void;
    writeLiteral(s: string): void;
    getTextPos(): number;
    getLine(): number;
    getColumn(): number;
    getIndent(): number;
}

interface EmitClientComposerOptions {
    moduleKind: ModuleKind;
}

export interface PageEmitInfo {
    route: string;
    document: ComponentEmitInfo;
    layout: ComponentEmitInfo;
    contents: ContentEmitInfo[];
}

export interface ContentEmitInfo extends ComponentEmitInfo {

    /**
     * Region of the layout this content belongs to.
     */
    region: string;
}

export function emitComposer(
    appName: string,
    clientRouterPath: string,
    imports: ComponentEmitInfo[],
    pageInfos: PageEmitInfo[],
    writer: EmitTextWriter,
    opt: EmitClientComposerOptions) {

    let {write, writeLine, increaseIndent, decreaseIndent } = writer;

    writeClientComposer();
    return;

    function writeClientComposer(): void {
        if (opt.moduleKind === ModuleKind.Amd) {
            writeAmdStart();
            increaseIndent();
        }
        else {
            writeCommonJsImportList();
        }

        writeBindings();
        writeRoutingTable();
        writeRouterInit();
        if (opt.moduleKind === ModuleKind.Amd) {
            decreaseIndent();
            writeAmdEnd();
        }
    }

    function writeQuote(): void {
        write('\'');
    }

    function writeBindings(): void {
        write(`var ${appName} = {};`);
        writeLine();
        write(`window.${appName} = ${appName};`);
        writeLine();
        write(`${appName}.Component = { Document: {}, Layout: {}, Content: {} };`);
        writeLine();
        for (let pageInfo of pageInfos) {
            let document = pageInfo.document.className;
            write(`${appName}.Component.Document.${document} = ${document};`);
            writeLine();
            let layout = pageInfo.layout.className;
            write(`${appName}.Component.Layout.${layout} = ${layout};`);
            writeLine();

            for (let contentInfo of pageInfo.contents) {
                let content = contentInfo.className;
                write(`${appName}.Component.Content.${content} = ${content};`);
                writeLine();
            }
        }
        writeLine();
        writeLine();
    }

    function writeRoutingTable(): void {
        write(`${appName}.RoutingTable = [`);
        writeLine();
        increaseIndent();
        forEach(pageInfos, (pageInfo, index) => {
            write('{');
            writeLine();
            increaseIndent();
            write(`route: '${pageInfo.route}',`);
            writeLine();
            write(`document: `);
            writeComponentEmitInfo(pageInfo.document);
            write(',');
            writeLine();
            write(`layout: `);
            writeComponentEmitInfo(pageInfo.layout);
            write(',');
            writeLine();
            write('contents: [');
            writeLine();
            increaseIndent();
            forEach(pageInfo.contents, (content, index) => {
                writeComponentEmitInfo(content);
                if (index !== pageInfo.contents.length -1) {
                    write(',');
                }
                writeLine();
            });
            decreaseIndent();
            write(']');
            writeLine();
            decreaseIndent();
            write('}');
            if (index !== pageInfos.length -1) {
                write(',');
            }
            writeLine();
        });
        decreaseIndent();
        writeLine();
        write('];');
        writeLine();
    }

    function writeRouterInit() {
        write(`${appName}.Router = new Composer.Router('${appName}', ${appName}.RoutingTable, ${appName}.Component);`);
        writeLine();
    }

    function writeComponentEmitInfo(component: ComponentEmitInfo): void {
        write('{');
        increaseIndent();
        writeLine();
        write(`className: '${component.className}',`);
        writeLine();
        write(`importPath: '${component.importPath}'`);
        writeLine();
        decreaseIndent();
        write('}');
    }

    /**
     * Writes `define([...], function(...) {`.
     */
    function writeAmdStart(): void {
        write('define([');
        for (let i = 0; i<imports.length; i++) {
            writeQuote();
            write(imports[i].importPath);
            writeQuote();
            write(', ');
        }
        writeQuote();
        write(clientRouterPath);
        writeQuote();
        write('], function(');
        for (let i = 0; i<imports.length; i++) {
            write(imports[i].className);
            write(', ');
        }
        write('Composer');
        write(') {');
        writeLine();
    }

    function writeAmdEnd() {
        write('});');
        writeLine();
    }

    function writeCommonJsImportList(): void {
        for (let i of imports) {
            write(`var ${i.className} = require('${i.importPath}').${i.className};`);
            writeLine();
        }
        write(`var Composer = require('${clientRouterPath}');`);
        writeLine();
    }

    function writeVariableList(vars: string[]): void {
        for (let i in vars) {
            write(vars[i]);

            if(i !== vars.length - 1) {
                write(',');
            }
        }
    }
}