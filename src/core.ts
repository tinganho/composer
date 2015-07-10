
import {CharacterCodes, EmitTextWriter} from './types';

export function computeLineStarts(text: string): number[] {
    let result: number[] = new Array();
    let pos = 0;
    let lineStart = 0;
    while (pos < text.length) {
       let ch = text.charCodeAt(pos++);
       switch (ch) {
            case CharacterCodes.carriageReturn:
                if (text.charCodeAt(pos) === CharacterCodes.lineFeed) {
                    pos++;
                }
            case CharacterCodes.lineFeed:
                result.push(lineStart);
                lineStart = pos;
                break;
            default:
                if (ch > CharacterCodes.maxAsciiCharacter && isLineBreak(ch)) {
                    result.push(lineStart);
                    lineStart = pos;
                }
                break;
        }
    }
    result.push(lineStart);
    return result;
}

export function isLineBreak(ch: number): boolean {
    // ES5 7.3:
    // The ECMAScript line terminator characters are listed in Table 3.
    //     Table 3: Line Terminator Characters
    //     Code Unit Value     Name                    Formal Name
    //     \u000A              Line Feed               <LF>
    //     \u000D              Carriage Return         <CR>
    //     \u2028              Line separator          <LS>
    //     \u2029              Paragraph separator     <PS>
    // Only the characters in Table 3 are treated as line terminators. Other new line or line
    // breaking characters are treated as white space but not as line terminators.

    return ch === CharacterCodes.lineFeed ||
        ch === CharacterCodes.carriageReturn ||
        ch === CharacterCodes.lineSeparator ||
        ch === CharacterCodes.paragraphSeparator;
}

/**
 * Returns the last element of an array if non-empty, undefined otherwise.
 */
export function lastOrUndefined<T>(array: T[]): T {
    if (array.length === 0) {
        return undefined;
    }

    return array[array.length - 1];
}

let indentStrings: string[] = ["", "    "];
export function getIndentString(level: number) {
    if (indentStrings[level] === undefined) {
        indentStrings[level] = getIndentString(level - 1) + indentStrings[1];
    }
    return indentStrings[level];
}

export function getIndentSize() {
    return indentStrings[1].length;
}

export function createTextWriter(newLine: String): EmitTextWriter {
    let output = "";
    let indent = 0;
    let lineStart = true;
    let lineCount = 0;
    let linePos = 0;

    function write(s: string) {
        if (s && s.length) {
            if (lineStart) {
                output += getIndentString(indent);
                lineStart = false;
            }
            output += s;
        }
    }

    function rawWrite(s: string) {
        if (s !== undefined) {
            if (lineStart) {
                lineStart = false;
            }
            output += s;
        }
    }

    function writeLiteral(s: string) {
        if (s && s.length) {
            write(s);
            let lineStartsOfS = computeLineStarts(s);
            if (lineStartsOfS.length > 1) {
                lineCount = lineCount + lineStartsOfS.length - 1;
                linePos = output.length - s.length + lastOrUndefined(lineStartsOfS);
            }
        }
    }

    function writeLine() {
        if (!lineStart) {
            output += newLine;
            lineCount++;
            linePos = output.length;
            lineStart = true;
        }
    }

    return {
        write,
        rawWrite,
        writeLiteral,
        writeLine,
        increaseIndent: () => indent++,
        decreaseIndent: () => indent--,
        getIndent: () => indent,
        getTextPos: () => output.length,
        getLine: () => lineCount + 1,
        getColumn: () => lineStart ? indent * getIndentSize() + 1 : output.length - linePos + 1,
        getText: () => output,
    };
}
