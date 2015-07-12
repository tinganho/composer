
import { createTextWriter } from '../core';
import { sys } from '../sys';

export const enum ModuleKind {
    Amd,
    CommonJs,
}

export interface ComponentEmitInfo {
    className: string;
    importPath: string;

    /**
     * The current route of page.
     */
    route: string;
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

export function emitComposer(imports: ComponentEmitInfo[], pageInfos: PageEmitInfo[], writer: EmitTextWriter, opt: EmitClientComposerOptions) {
    let {write, writeLine, increaseIndent} = writer;

    writeClientComposer();
    return;

    function writeClientComposer(): void {
        if (opt.moduleKind === ModuleKind.Amd) {
            writeStartOfAmd(imports);
        }
        else {
            writeCommonJsImportList(imports);
        }
    }

    function writeQuote(): void {
        write('\'');
    }

    /**
     * Writes `define([...], function(...) {`.
     */
    function writeStartOfAmd(imports: ComponentEmitInfo[]): void {
        write('define([');
        for (let i in imports) {
            writeQuote();
            write(imports[i].importPath);
            writeQuote();
            if(i !== imports.length - 1) {
                write(',');
            }
        }
        write('], function(');
        for (let i in imports) {
            write(imports[i].className);
            if(i !== imports.length - 1) {
                write(',');
            }
        }
        write(') {');
    }

    function writeCommonJsImportList(imports: ComponentEmitInfo[]): void {
        for (let i of imports) {
            write(`var ${i.className} = require('${i.importPath}');`);
            writeLine();
        }
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