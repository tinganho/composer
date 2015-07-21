
export var cf = {

    /**
     * Port of your web application.
     *
     * @type number
     */
    PORT: 3000,

    /**
     * Default page timeout in seconds.
     *
     * @type string
     */
    HOST: 'localhost',

    /**
     * Dimensions for View port of test page.
     *
     * @type { HEIGHT: number,  WIDTH: number }
     */
    SCREEN_RESOLUTION: {
        WIDTH: 1024,
        HEIGHT: 768,
    },

    /**
     * Default app name.
     *
     * @type string
     */
    DEFAULT_APP_NAME: 'App',

    /**
     * Default page timeout in seconds.
     *
     * @type number
     */
    DEFAULT_PAGE_TIMEOUT: 30,

    /**
     * Default new line for output files.
     *
     * @type string
     */
    DEFAULT_NEW_LINE: '\n',

    /**
     * Default browserstack username.
     *
     * @type string
     */
    DEFAULT_BROWSERSTACK_USER: 'tinganho1',

    /**
     * Default browserstack key.
     *
     * @type string
     */
    DEFAULT_BROWSERSTACK_KEY: '7GZGJmC8yz4LBmo1xfSe',

    /**
     * Default selenium server.
     *
     * @type string
     */
    DEFAULT_SELENIUM_SERVER: 'http://hub.browserstack.com/wd/hub',

    /**
     * Specify the idle time for your webdriver tests.
     *
     * @type string
     */
    WEBDRIVER_IDLE_TIME: 60000,
}

export default cf;