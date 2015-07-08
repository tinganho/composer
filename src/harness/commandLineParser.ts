
/// <reference path='../../typings/glob/glob.d.ts'/>

import glob = require('glob');
import {CharacterCodes, CompilerOptions, CommandLineOption} from './types';
import {Diagnostics, DiagnosticMessage} from './diagnostics.generated';
import {createCompilerDiagnostic, Debug, hasProperty, Map} from './core';

export interface ParsedCommandLine {
    options: CompilerOptions;
    fileNames: string[];
}

var optionDeclarations: CommandLineOption[] = [
    {
        name: 'help',
        shortName: 'h',
        type: 'string',
    },
    {
        name: 'tests',
        shortName: 't',
        type: 'string',
    },
];

export function parseCommandLineOptions(commandLine: string[]) {
    let options: CompilerOptions = {};
    let testFiles: string[];
    let errors: DiagnosticMessage[] = [];
    let shortOptionNames: Map<string> = {};
    let optionNameMap: Map<CommandLineOption> = {};

    optionDeclarations.forEach(option => {
        optionNameMap[option.name.toLowerCase()] = option;
        if (option.shortName) {
            shortOptionNames[option.shortName] = option.name;
        }
    });

    parseStrings(commandLine);

    return {
        options,
        errors,
    }

    function parseStrings(args: string[]) {
        let i = 0;
        while (i < args.length) {
            var s = args[i++];
            if (s.charCodeAt(0) === CharacterCodes.minus) {
                s = s.slice(s.charCodeAt(1) === CharacterCodes.minus ? 2 : 1).toLowerCase();

                // Try to translate short option names to their full equivalents.
                if (hasProperty(shortOptionNames, s)) {
                    s = shortOptionNames[s];
                }

                if (hasProperty(optionNameMap, s)) {
                    var opt = optionNameMap[s];

                    // Check to see if no argument was provided (e.g. '--help' is the last command-line argument).
                    if (!args[i] && opt.type !== 'boolean') {
                        errors.push(createCompilerDiagnostic(Diagnostics.Compiler_option_0_expects_an_argument, opt.name));
                    }

                    switch (opt.type) {
                        case 'number':
                            options[opt.name] = parseInt(args[i++]);
                            break;
                        case 'boolean':
                            options[opt.name] = true;
                            break;
                        case 'string':
                            options[opt.name] = args[i++] || '';
                            break;
                        default:
                            Debug.fail('Unknown option type defined in command line options.');
                    }
                }
                else {
                    errors.push(createCompilerDiagnostic(Diagnostics.Unknown_compiler_option_0, s));
                }
            }
        }
    }
}