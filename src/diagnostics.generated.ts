
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
    Unknown_option_type_0_declared_in_your_command_line_options: {
        message: 'Unknown option type \'{0}\' declared in your command line options.',
        code:  1002,
    },
    You_have_not_defined_a_default_document_folder: {
        message: 'You have not defined a default document folder.',
        code:  1003,
    },
    You_have_not_defined_a_default_layout_folder: {
        message: 'You have not defined a default layout folder.',
        code:  1004,
    },
    You_have_not_defined_a_default_content_folder: {
        message: 'You have not defined a default content folder.',
        code:  1005,
    },
    Could_not_start_headless_web_browser: {
        message: 'Could not start headless web browser.',
        code:  2001,
    },
    Stop_the_server_by_exiting_the_session_CTRL_plus_C: {
        message: 'Stop the server by exiting the session (CTRL + C).',
        code:  9000,
    },
    Interactive_starts_the_server_until_you_manually_stops_it: {
        message: 'Interactive starts the server until you manually stops it.',
        code:  9001,
    },
}

export default Diagnostics;
