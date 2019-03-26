/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import {PolymerElement} from '../../@polymer/polymer/polymer-element.js';
import {mixinBehaviors} from '../../@polymer/polymer/lib/legacy/class.js';
import {IronValidatableBehavior} from '../../@polymer/iron-validatable-behavior/iron-validatable-behavior.js';
import {EventsTargetMixin} from '../../@advanced-rest-client/events-target-mixin/events-target-mixin.js';
import {html} from '../../@polymer/polymer/lib/utils/html-tag.js';
import {UrlParser} from '../../@advanced-rest-client/url-parser/url-parser.js';
import '../../@polymer/paper-icon-button/paper-icon-button.js';
import '../../@polymer/paper-input/paper-input.js';
import '../../@polymer/paper-button/paper-button.js';
import '../../@advanced-rest-client/paper-autocomplete/paper-autocomplete.js';
import '../../@advanced-rest-client/arc-icons/arc-icons.js';
import '../../@polymer/iron-collapse/iron-collapse.js';
import '../../@polymer/iron-form-element-behavior/iron-form-element-behavior.js';
import '../../@polymer/iron-flex-layout/iron-flex-layout.js';
import './url-detailed-editor.js';

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
 *
 * @polymer
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 * @polymerBehavior Polymer.IronValidatableBehavior
 * @appliesMixin EventsTargetMixin
 */
class UrlInputEditor extends
  EventsTargetMixin(
    mixinBehaviors([IronValidatableBehavior], PolymerElement)) {
  static get template() {
    return html`
    <style>
    :host {
      @apply --layout-vertical;
      position: relative;
      @apply --url-input-editor;
    }

    .main-input,
    .editor {
      @apply --layout-flex;
    }

    paper-autocomplete {
      bottom: 0;
    }

    .toggle-button {
      @apply --toggle-button;
      margin-top: 16px;
      transform: rotateZ(0deg);
      transition: transform 0.3s ease-in-out;
    }

    .toggle-button.opened {
      transform: rotateZ(-180deg);
    }

    .toggle-button:hover {
      @apply --toggle-button-hover;
    }

    iron-collapse.sized {
      min-height: 48px;
    }

    [hidden] {
      display: none !important;
    }

    .container {
      @apply --layout-horizontal;
    }
    </style>
    <div class="container">
      <div class="editor">
        <paper-input
          label="Request URL"
          readonly="[[readonly]]"
          value="{{value}}"
          class="main-input"
          required=""
          auto-validate=""
          error-message="An URL is required."
          on-blur="_ensureUrlHasProtocol"
          on-focus="_mainFocus"
          hidden="[[detailsOpened]]"></paper-input>
        <paper-autocomplete
          loader=""
          open-on-focus=""
          target="[[_autocompleteTarget]]"
          on-query="_autocompleteQuery"
          opened="{{suggesionsOpened}}"></paper-autocomplete>
        <iron-collapse id="collapse"
          opened="[[detailsOpened]]"
          transitioning="{{colapseTransitioning}}">
          <url-detailed-editor
            value="{{_detailedValue}}"
            query-parameters="{{queryParameters}}"
            on-url-encode="encodeParameters"
            on-url-decode="decodeParameters"
            readonly="[[readonly]]"
            narrow="[[narrow]]"></url-detailed-editor>
        </iron-collapse>
      </div>
      <paper-icon-button
        class\$="toggle-button [[_computeToggleClass(detailsOpened)]]"
        icon="arc:keyboard-arrow-down"
        on-click="toggle"
        title="Toggle detailed editor"></paper-icon-button>
    </div>
`;
  }

  static get is() {
    return 'url-input-editor';
  }
  static get properties() {
    return {
      // Current URL value.
      value: {
        type: String,
        notify: true,
        observer: '_onValueChanged'
      },
      /**
       * True if detailed editor is opened.
       */
      detailsOpened: {
        type: Boolean,
        observer: '_detailsOpenedChanged',
        notify: true
      },
      /**
       * Default protocol for the URL if it's missing.
       */
      defaultProtocol: {
        type: String,
        value: 'http'
      },
      /**
       * Input target for the `paper-autocomplete` element.
       */
      _autocompleteTarget: HTMLElement,
      // True when a suggestion box for the URL is opened.
      suggesionsOpened: {
        type: Boolean,
        notify: true
      },
      // Controlled by the collapse element flad used to animate detail panel.
      colapseTransitioning: {
        type: Boolean,
        observer: '_colapseTransitioning'
      },
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
      queryParameters: {
        type: Array,
        // notify: true
      },
      /**
       * When set the editor is in read only mode.
       */
      readonly: Boolean,
      /**
       * When set it renders "narrow" layout.
       */
      narrow: {type: Boolean, reflectToAttribute: true},
      _detailedValue: String
    };
  }

  static get observers() {
    return [
      '_detailedValueChanged(_detailedValue, detailsOpened)'
    ];
  }

  constructor() {
    super();
    this._extValueChangedHandler = this._extValueChangedHandler.bind(this);
    this._keyDownHandler = this._keyDownHandler.bind(this);
  }

  _attachListeners(node) {
    this._autocompleteTarget = this.shadowRoot.querySelector('.main-input');
    node.addEventListener('url-value-changed', this._extValueChangedHandler);
    this.addEventListener('keydown', this._keyDownHandler);
  }

  _detachListeners(node) {
    this._autocompleteTarget = undefined;
    node.removeEventListener('url-value-changed', this._extValueChangedHandler);
    this.removeEventListener('keydown', this._keyDownHandler);
  }

  /**
   * A handler that is called on input
   *
   * @param {String} value
   */
  _onValueChanged(value) {
    if (this._preventValueChangeEvent || this.readonly) {
      return;
    }
    if (this._detailedValue !== value) {
      this._detailedValue = value;
    }
    this.dispatchEvent(new CustomEvent('url-value-changed', {
      bubbles: true,
      composed: true,
      detail: {
        value,
        queryParameters: this.queryParameters
      }
    }));
  }

  _detailedValueChanged(_detailedValue, detailsOpened) {
    if (!detailsOpened) {
      return;
    }
    this.value = _detailedValue;
  }

  /**
   * A handler for the `url-value-changed` event.
   * If this element is not the source of the event then it will update the `value` property.
   * It's to be used besides the Polymer's data binding system.
   *
   * @param {CustomEvent} e
   */
  _extValueChangedHandler(e) {
    if (e.composedPath()[0] === this || this.readonly) {
      return;
    }
    const {value} = e.detail;
    if (this.value !== value) {
      this._preventValueChangeEvent = true;
      this.set('value', value);
      this._preventValueChangeEvent = false;
    }
  }

  /**
   * Opens detailed view.
   */
  toggle() {
    this.detailsOpened = !this.detailsOpened;
  }

  /**
   * HTTP encode query parameters
   */
  encodeParameters() {
    if (this.readonly) {
      return;
    }
    this._decodeEncode('encode');
    this._dispatchAnalyticsEvent('Encode parameters');
  }

  /**
   * HTTP decode query parameters
   */
  decodeParameters() {
    if (this.readonly) {
      return;
    }
    this._decodeEncode('decode');
    this._dispatchAnalyticsEvent('Decode parameters');
  }
  /**
   * Dispatches analytics event with "event" type.
   * @param {String} label A label to use with GA event
   * @return {CustomEvent}
   */
  _dispatchAnalyticsEvent(label) {
    const e = new CustomEvent('send-analytics', {
      bubbles: true,
      composed: true,
      detail: {
        type: 'event',
        category: 'Request view',
        action: 'URL editor',
        label
      }
    });
    this.dispatchEvent(e);
    return e;
  }
  /**
   * HTTP encode or decode query parameters depending on [type].
   *
   * @param {String} type
   */
  _decodeEncode(type) {
    const url = this.value;
    if (!url) {
      return;
    }
    const parser = new UrlParser(url);
    if (type === 'decode') {
      this._processUrlParams(parser, 'decodeQueryString');
    } else {
      this._processUrlParams(parser, 'encodeQueryString');
    }
    this.set('value', parser.value);
  }
  /**
   * Processes query parameters and path value by `processFn`.
   * The function has to be available on this instance.
   * @param {UrlParser} parser Instance of UrlParser
   * @param {String} processFn Function name to call on each parameter
   */
  _processUrlParams(parser, processFn) {
    const decoded = parser.searchParams.map((item) => {
      const key = this[processFn](item[0]);
      const value = this[processFn](item[1]);
      return [key, value];
    });
    parser.searchParams = decoded;
    const path = parser.path;
    if (path && path.length) {
      const parts = path.split('/');
      let tmp = '/';
      for (let i = 0, len = parts.length; i < len; i++) {
        let part = parts[i];
        if (!part) {
          continue;
        }
        part = this[processFn](part);
        tmp += part;
        if (i + 1 !== len) {
          tmp += '/';
        }
      }
      parser.path = tmp;
    }
  }
  /**
   * Ensures the URL has protocol value when detailed editor closes.
   * @param {Boolean} detailsOpened
   */
  _detailsOpenedChanged(detailsOpened) {
    if (detailsOpened) {
      return;
    }
    this._ensureUrlHasProtocol();
  }
  /**
   * Handler for autocomplete element query event.
   * Dispatches `url-history-query` to query history model for data.
   * @param {CustomEvent} e
   * @return {Promise}
   */
  _autocompleteQuery(e) {
    e.preventDefault();
    e.stopPropagation();
    const autocomplete = e.target;
    if (!e.detail.value) {
      autocomplete.source = [];
      return Promise.resolve();
    }
    const ev = this._dispatchUrlQuery(e.detail.value);
    if (!ev.detail.result) {
      console.warn('"url-history-query" event not handled');
      return Promise.resolve();
    }
    return ev.detail.result
    .then((result) => {
      result = result.map((item) => item.url);
      autocomplete.source = result;
    })
    .catch(() => {
      autocomplete.source = [];
    });
  }
  /**
   * Dispatches `url-history-query` custom event.
   * @param {String} q URL query
   * @return {CustomEvent}
   */
  _dispatchUrlQuery(q) {
    const e = new CustomEvent('url-history-query', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        q
      }
    });
    this.dispatchEvent(e);
    return e;
  }
  /**
   * Ensures that the URL has a protocol.
   * The detault protocol is defined in `defaultProtocol` property.
   * The protocol is inserted into the URL value only if the value is not a
   * path and it's not a variable.
   *
   * @return {undefined} It updates the `url` property.
   */
  _ensureUrlHasProtocol() {
    if (this.readonly) {
      return;
    }
    let url = this.value || '';
    if (url.indexOf('http') !== 0) {
      if (url[0] !== '/' && url[0] !== '$' && url[0] !== '{') {
        url = this.defaultProtocol + '://' + url;
        this.set('value', url);
      }
    }
  }
  /**
   * Ensures that protocol is set before user input.
   *
   * @param {Event} e
   */
  _mainFocus(e) {
    if (!this.value && !this.readonly) {
      this.value = this.defaultProtocol + '://';
      e.target.inputElement.inputElement.setSelectionRange(0, this.value.length);
    }
  }

  _keyDownHandler(e) {
    const target = e.composedPath()[0];
    if (!target || target.nodeName !== 'INPUT') {
      return;
    }
    if ((e.code && (e.code === 'Enter' || e.code === 'NumpadEnter')) || (e.keyCode && e.keyCode === 13)) {
      this._onEnter();
    }
  }
  /**
   * A handler called when the user press "enter" in any of the form fields.
   * This will send a `send` event.
   */
  _onEnter() {
    if (this.suggesionsOpened) {
      return;
    }
    this.dispatchEvent(new CustomEvent('send-request', {
      bubbles: true,
      composed: true
    }));
  }
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
   * @param {String} str A string containing invalid URL characters
   * @return {String} a string with all invalid URL characters escaped
   */
  encodeQueryString(str) {
    if (!str) {
      return str;
    }
    return encodeURIComponent(str).replace(/%20/g, '+');
  }
  /**
   * Returns a string where all URL component escape sequences have been
   * converted back to their original character representations.
   *
   * Note: this method will convert the space character escape short form, '+',
   * into a space. It should therefore only be used for query-string parts.
   *
   * @param {String} str string containing encoded URL component sequences
   * @return {String} string with no encoded URL component encoded sequences
   */
  decodeQueryString(str) {
    if (!str) {
      return str;
    }
    return decodeURIComponent(str.replace(/\+/g, '%20'));
  }
  /**
   * A trick to instantly replace main URL input with host field and back
   * without animation jumping when transitioning.
   * Sets / removes `sized` class name from the collapse element. This class
   * sets minimum height for the element so the host field will be visible
   * instantly in place of dissapearing main URL.
   *
   * @param {Boolean} value
   * @param {Boolean} oldValue
   */
  _colapseTransitioning(value, oldValue) {
    if (oldValue === undefined) {
      return;
    }
    if (value && this.detailsOpened) {
      this.$.collapse.classList.add('sized');
    } else if (value && !this.detailsOpened) {
      this.$.collapse.classList.remove('sized');
    }
  }
  /**
   * Validates the element.
   * @return {Boolean}
   */
  _getValidity() {
    let element;
    if (this.detailsOpened) {
      element = this.shadowRoot.querySelector('url-detailed-editor');
    } else {
      element = this.shadowRoot.querySelector('.main-input');
    }
    if (!element) {
      return true;
    }
    return element.validate();
  }
  /**
   * Computes class name for the toggle button
   * @param {Boolean} opened Current sate of the editor.
   * @return {String}
   */
  _computeToggleClass(opened) {
    return opened ? 'opened' : '';
  }
  /**
   * Fired when the URL value change.
   * Note that this event is fired before validation occur and therefore
   * the URL may be invalid.
   *
   * @event url-value-changed
   * @param {String} value The URL.
   * @param {Array<Object>} queryParameters Optional query parameters model.
   */
  /**
   * Fired when the user use the "entrer" key in any of the fields.
   *
   * @event send-request
   */
  /**
   * Fired when autocomplete element request data.
   * This event is to be handled by `url-history-saver` element but it can be
   * handled by any element that intercepts this event.
   *
   * @event url-history-query
   * @param {String} q A query filter.
   */
}
window.customElements.define(UrlInputEditor.is, UrlInputEditor);
