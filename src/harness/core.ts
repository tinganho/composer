
export interface Map<T> {
    [index: string]: T;
}

let hasOwnProperty = Object.prototype.hasOwnProperty;
export function hasProperty<T>(map: Map<T>, key: string): boolean {
    return hasOwnProperty.call(map, key);
}

export interface Diagnostic {
    messageText: string;
    code: number;
}