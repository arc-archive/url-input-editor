/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   url-input-editor.js
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

declare namespace UiElements {

  /**
   * The request URL editor
   *
   * The editor renders a simple editor view with an input field. The input
   * uses `paper-autocomplete` element to render URL suggestions.
   *
   * When setting `detailsOpened` property to `true` it renders detailed editor.
   * The editor allows to edit host, path, query parameetrs and hash
   * separatelly.
   *
   * ### Example
   *
   * ```html
   * <url-input-editor
   *  url="{{requestURL}}"
   *  on-send-request="_sendAction"
   *  on-url-value-changed="_handleNewUrl"></url-input-editor>
   * ```
   *
   * ### Styling
   *
   * `<url-input-editor>` provides the following custom properties and mixins
   * for styling:
   *
   * Custom property | Description | Default
   * ----------------|-------------|----------
   * `--url-input-editor` | Mixin applied to the element | `{}`
   *
   * Use paper elements mixin to style this element.
   */
  class UrlInputEditor extends
    EventsTargetMixin(
    Object) {

    /**
     * Current URL value.
     */
    value: string|null|undefined;

    /**
     * True if detailed editor is opened.
     */
    detailsOpened: boolean|null|undefined;

    /**
     * Default protocol for the URL if it's missing.
     */
    defaultProtocol: string|null|undefined;

    /**
     * Input target for the `paper-autocomplete` element.
     */
    _autocompleteTarget: HTMLElement|null|undefined;

    /**
     * True when a suggestion box for the URL is opened.
     */
    suggesionsOpened: boolean|null|undefined;

    /**
     * Controlled by the collapse element flad used to animate detail panel.
     */
    colapseTransitioning: boolean|null|undefined;

    /**
     * List of query parameters model.
     * It is passed to detailed editor to build query parameters form.
     * If not set then it is computed from current URL.
     *
     * Model for query parameters is:
     * - name {String} param name
     * - value {String} param value
     * - enabled {Boolean} is param included into the `value`
     */
    queryParameters: any[]|null|undefined;

    /**
     * When set the editor is in read only mode.
     */
    readonly: boolean|null|undefined;

    /**
     * When set it renders "narrow" layout.
     */
    narrow: boolean|null|undefined;
    _detailedValue: string|null|undefined;
    _attachListeners(node: any): void;
    _detachListeners(node: any): void;

    /**
     * A handler that is called on input
     */
    _onValueChanged(value: String|null): void;
    _detailedValueChanged(_detailedValue: any, detailsOpened: any): void;

    /**
     * A handler for the `url-value-changed` event.
     * If this element is not the source of the event then it will update the `value` property.
     * It's to be used besides the Polymer's data binding system.
     */
    _extValueChangedHandler(e: CustomEvent|null): void;

    /**
     * Opens detailed view.
     */
    toggle(): void;

    /**
     * HTTP encode query parameters
     */
    encodeParameters(): void;

    /**
     * HTTP decode query parameters
     */
    decodeParameters(): void;

    /**
     * Dispatches analytics event with "event" type.
     *
     * @param label A label to use with GA event
     */
    _dispatchAnalyticsEvent(label: String|null): CustomEvent|null;

    /**
     * HTTP encode or decode query parameters depending on [type].
     */
    _decodeEncode(type: String|null): void;

    /**
     * Processes query parameters and path value by `processFn`.
     * The function has to be available on this instance.
     *
     * @param parser Instance of UrlParser
     * @param processFn Function name to call on each parameter
     */
    _processUrlParams(parser: UrlParser|null, processFn: String|null): void;

    /**
     * Ensures the URL has protocol value when detailed editor closes.
     */
    _detailsOpenedChanged(detailsOpened: Boolean|null): void;

    /**
     * Handler for autocomplete element query event.
     * Dispatches `url-history-query` to query history model for data.
     */
    _autocompleteQuery(e: CustomEvent|null): Promise<any>|null;

    /**
     * Dispatches `url-history-query` custom event.
     *
     * @param q URL query
     */
    _dispatchUrlQuery(q: String|null): CustomEvent|null;

    /**
     * Ensures that the URL has a protocol.
     * The detault protocol is defined in `defaultProtocol` property.
     * The protocol is inserted into the URL value only if the value is not a
     * path and it's not a variable.
     *
     * @returns It updates the `url` property.
     */
    _ensureUrlHasProtocol(): undefined;

    /**
     * Ensures that protocol is set before user input.
     */
    _mainFocus(e: Event|null): void;
    _keyDownHandler(e: any): void;

    /**
     * A handler called when the user press "enter" in any of the form fields.
     * This will send a `send` event.
     */
    _onEnter(): void;

    /**
     * Returns a string where all characters that are not valid for a URL
     * component have been escaped. The escaping of a character is done by
     * converting it into its UTF-8 encoding and then encoding each of the
     * resulting bytes as a %xx hexadecimal escape sequence.
     * <p>
     * Note: this method will convert any the space character into its escape
     * short form, '+' rather than %20. It should therefore only be used for
     * query-string parts.
     *
     * <p>
     * The following character sets are <em>not</em> escaped by this method:
     * <ul>
     * <li>ASCII digits or letters</li>
     * <li>ASCII punctuation characters:
     *
     * <pre>- _ . ! ~ * ' ( )</pre>
     * </li>
     * </ul>
     * </p>
     *
     * <p>
     * Notice that this method <em>does</em> encode the URL component delimiter
     * characters:<blockquote>
     *
     * <pre>
     * ; / ? : &amp; = + $ , #
     * </pre>
     *
     * </blockquote>
     * </p>
     *
     * @param str A string containing invalid URL characters
     * @returns a string with all invalid URL characters escaped
     */
    encodeQueryString(str: String|null): String|null;

    /**
     * Returns a string where all URL component escape sequences have been
     * converted back to their original character representations.
     *
     * Note: this method will convert the space character escape short form, '+',
     * into a space. It should therefore only be used for query-string parts.
     *
     * @param str string containing encoded URL component sequences
     * @returns string with no encoded URL component encoded sequences
     */
    decodeQueryString(str: String|null): String|null;

    /**
     * A trick to instantly replace main URL input with host field and back
     * without animation jumping when transitioning.
     * Sets / removes `sized` class name from the collapse element. This class
     * sets minimum height for the element so the host field will be visible
     * instantly in place of dissapearing main URL.
     */
    _colapseTransitioning(value: Boolean|null, oldValue: Boolean|null): void;

    /**
     * Validates the element.
     */
    _getValidity(): Boolean|null;

    /**
     * Computes class name for the toggle button
     *
     * @param opened Current sate of the editor.
     */
    _computeToggleClass(opened: Boolean|null): String|null;
  }
}

declare global {

  interface HTMLElementTagNameMap {
    "url-input-editor": UiElements.UrlInputEditor;
  }
}

export {};
