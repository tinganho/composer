
export interface DiagnosticMessage {
    message: string;
    category: string;
}

export var Diagnostics = {
    Compiler_option_0_expects_an_argument: {
        message: 'Compiler option \'{0}\' expects an argument.',
        category: 'error',
    },
    Unknown_command_line_options_0: {
        message: 'Unknown command line options \'{0}\'.',
        category: 'error',
    },
    Unknown_option_type_0_declared_in_your_command_line_options: {
        message: 'Unknown option type \'{0}\' declared in your command line options.',
        category: 'error',
    },
    You_have_not_defined_a_default_document_folder: {
        message: 'You have not defined a default document folder.',
        category: 'error',
    },
    You_have_not_defined_a_default_layout_folder: {
        message: 'You have not defined a default layout folder.',
        category: 'error',
    },
    You_have_not_defined_a_default_content_folder: {
        message: 'You have not defined a default content folder.',
        category: 'error',
    },
    Could_not_start_headless_web_browser: {
        message: 'Could not start headless web browser.',
        category: 'error',
    },
    Cannot_call_emitWebClientComposer_before_setPages: {
        message: 'Cannot call \'.emitWebClientComposer()\' before \'.setPages(...)\'.',
        category: 'error',
    },
    You_must_define_a_platform_with_onPlatform_method_before_you_call_hasDocument: {
        message: 'You must define a platform with \'.onPlatform(...)\' method before you call \'hasDocument(...)\'.',
        category: 'error',
    },
    Only_one_instance_of_Composer_is_allowed: {
        message: 'Only one instance of Composer is allowed.',
        category: 'error',
    },
    Could_not_get_folder_name_from_0: {
        message: 'Could not get folder name from {0}.',
        category: 'error',
    },
    Stop_the_server_by_exiting_the_session_CTRL_plus_C: {
        message: 'Stop the server by exiting the session (CTRL + C).',
        category: 'message',
    },
    Interactive_starts_the_server_until_you_manually_stops_it: {
        message: 'Interactive starts the server until you manually stops it.',
        category: 'message',
    },
}

export default Diagnostics;
