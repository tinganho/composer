
export interface DiagnosticMessage {
    message: string;
    code: number;
}

export var Diagnostics = {
    Compiler_option_0_expects_an_argument: {
        message: 'Compiler option \'{0}\' expects an argument.',
        code:  1000,
    },
    Unknown_command_line_options_0: {
        message: 'Unknown command line options \'{0}\'.',
        code:  1001,
    },
    Could_not_start_headless_web_browser: {
        message: 'Could not start headless web browser.',
        code:  2001,
    },
    Interactive_starts_the_server_until_you_manually_stops_it: {
        message: 'Interactive starts the server until you manually stops it.',
        code:  9000,
    },
}

export default Diagnostics;
