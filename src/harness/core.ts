
import { DiagnosticMessage } from '../diagnostics.generated';
import { Map } from '../types';

import 'terminal-colors';

let hasOwnProperty = Object.prototype.hasOwnProperty;
export function hasProperty<T>(map: Map<T>, key: string): boolean {
    return hasOwnProperty.call(map, key);
}

export function includes<T>(arr: T[], search: T): boolean {
    return arr.indexOf(search) !== -1;
}

function formatStringFromArgs(text: string, args: { [index: number]: any; }, baseIndex?: number): string {
    baseIndex = baseIndex || 0;

    return text.replace(/\{(\d+)\}/g, (match, index?) => args[+index + baseIndex]);
}

export function createDiagnostic(diagnostic: DiagnosticMessage, ...args: any[]): DiagnosticMessage;
export function createDiagnostic(diagnostic: DiagnosticMessage): DiagnosticMessage {
    let text = diagnostic.message;

    if (arguments.length > 1) {
        text = formatStringFromArgs(text, arguments, 1);
    }

    return {
        message: text,
        code: diagnostic.code
    }
}
