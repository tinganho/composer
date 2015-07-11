
import { DiagnosticMessage } from '../diagnostics.generated';
import { Map } from '../types';

export { DiagnosticMessage };

export * from '../types';

export interface CommandLineOption {
    name: string;
    type: string | Map<number>;
    isFilePath?: boolean;
    shortName?: string;
    error?: DiagnosticMessage;
    experimental?: boolean;
}

export interface CommandLineOptions {
    tests?: string;
    interactive?: boolean;
    help?: boolean;

    [option: string]: string | number | boolean;
}