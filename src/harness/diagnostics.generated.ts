
export interface DiagnosticMessage {
    message: string;
    code: number;
}

export var Diagnostics = {
    Compiler_option_0_expects_an_argument: {
        message: 'Compiler option {0} expects an argument.',
        code:  1000,
    },
    Unknown_compiler_option_0: {
        message: 'Unknown_compiler_option_0',
        code:  1001,
    },
}

export default Diagnostics;
