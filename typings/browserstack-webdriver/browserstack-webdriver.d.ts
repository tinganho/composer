
/// <reference path='../es6-promise/es6-promise.d.ts'/>

declare module 'browserstack-webdriver' {

    interface BrowserstackCapabilities {

        /**
         * Browser you want to test.
         */
        'browser'?: string;

        /**
         * Browser version you want to test.
         */
        'browser_version'?: string;

        /**
         * Browser you want to test.
         */
        'browserName'?: string;

        /**
         * Required if you want to generate screenshots at various steps in your test.
         */
        'browserstack.debug'?: string;

        /**
         * Browserstack key.
         */
        'browserstack.key'?: string;

        /**
         * Use this capability to specify the IE webdriver version.
         */
        'browserstack.ie.driver'?: string;

        /**
         * Use this capability to enable the popups in IE.
         */
        'browserstack.ie.enablePopups'?: string;

        /**
         * Use this capability to disable flash on Internet Explorer.
         */
        'browserstack.ie.noFlash'?: string;

        /**
         * Required if you are testing against internal/local servers.
         */
        'browserstack.local'?: string;

        /**
         * Use this capability to set the Selenium WebDriver version in test scripts.
         */
        'browserstack.selenium_version'?: string;

        /**
         * Browserstack user.
         */
        'browserstack.user'?: string;

        /**
         * Allows the user to specify a name for a logical group of tests.
         */
        'build'?: string;

        /**
         * Specifies a particular mobile device for the test environment.
         */
        'device'?: string;

        /**
         * Set the screen orientation of mobile device.
         */
        'deviceOrientation'?: string;

        /**
         * Allows the user to specify an identifier for the test run.
         */
        'name'?: string;

        /**
         * Allows the user to specify a name for a logical group of builds.
         */
        'project'?: string;

        /**
         * Set the resolution of VM before beginning of your test.
         */
        'resolution'?: string;

        /**
         * OS you want to test.
         */
        'os'?: string;

        /**
         * OS version you want to test.
         */
        'os_version'?: string;

        /**
         * Auto-accept ssl certificates.
         */
        'acceptSslCerts'?: string;

        /**
         * Chrome options.
         */
        'chromeOptions'?: { [index: string]: string };

        /**
         * Encoded profile of your firefox settings.
         */
        'firefox_profile'?: string;
    }

    export interface Hash {
        id?: string;
        className?: string;
        js?: string;
        linkText?: string;
        name?: string;
        partialLinkText?: string;
        tagName?: string;
        xpath?: string;
    }

    export interface Capabilities extends BrowserstackCapabilities {

    }

    export interface Element {

    }

    class Locator {}

    type ElementQuery = Hash | Locator;

    class WebElement {
        public click(): Promise<void>;
        public sendKeys(keys: string): Promise<void>;
    }

    class Driver {
        public get(url: string): Promise<void>;
        public getTitle(): Promise<string>;
        public takeScreenshot(): Promise<string>;
        public findElement(query: ElementQuery): WebElement;
        public isElementPresent(query: ElementQuery): Promise<void>;
        public quit(): Promise<void>;
        public wait(fn: (...args: any[]) => Promise<any>, idleTime: number): Promise<void>;
    }

    export class Builder {
        public usingServer(url: string): Builder;
        public withCapabilities(capabilities: Capabilities): Builder;
        public build(): Driver;
    }

    class _By {
        name: (name: string) => Locator;
        id: (id: string) => Locator;
        className: (className: string) => Locator;
        css: (css: string) => Locator;
        linkText: (text: string) => Locator;
        js: (script: string, args: any) => Promise<any>;
        partialLinkText: (text: string) => Locator;
        tagName: (tagName: string) => Locator;
        xpath: (xpath: string) => Locator;
    }

    export var By: _By;
}