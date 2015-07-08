
export interface Map<T> {
    [index: string]: T;
}

export interface Diagnostic {
    messageText: string;
    code: number;
}

export interface DiagnosticMessage {
    key: string;
    code: number;
}