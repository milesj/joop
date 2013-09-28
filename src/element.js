/**
 * @copyright   2006-2013, Miles Johnson - http://milesj.me
 * @license     http://opensource.org/licenses/mit-license.php
 * @link        http://milesj.me/code/javascript/joop
 */

(function() {
  'use strict';

  // Possible vendor prefixes for props
  var vendorPrefixes = ['Webkit', 'Moz', 'ms', 'O'],
      vendorPrefixLookup = {};

  // Props that shouldn't append "px"
  var pixellessNumbers = {
    columnCount: true,
    fillOpacity: true,
    fontWeight: true,
    lineHeight: true,
    opacity: true,
    orphans: true,
    widows: true,
    zIndex: true,
    zoom: true
  };

  // DOM properties considered boolean only
  var booleans = 'checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped';

  // Mapping of getter and setter hooks
  var Hooks = {

    // Properties
    prop: {
      tag: {
        get: function getTagProp(key) {
          return (this.tagName || this.nodeName).toLowerCase();
        }
      }
    },

    // CSS styles
    style: {
      margin: {
        get: function getMarginStyle(key) {
          return this.getStyle(['margin-top', 'margin-right', 'margin-bottom', 'margin-left']);
        }
      },
      padding: {
        get: function getPaddingStyle(key) {
          return this.getStyle(['padding-top', 'padding-right', 'padding-bottom', 'padding-left']);
        }
      }
    }
  };

  // Add setter hooks for boolean properties
  booleans.split('|').forEach(function(bool) {
    Hooks.prop[bool] = { set: setBoolHook };
  });

  /**
   * Universal function that handles the getting, setting and removing of data.
   * The type of action is determined by the following:
   *
   *  Remover
   *    - If the key is a string and the value is a literal null
   *  Setter
   *    - If the key is a string and the value is defined (single set)
   *    - If the key is an object (multiple set)
   *  Getter
   *    - If the key is a string and the value is empty (single get)
   *    - If the key is an array (multiple get)
   *
   * @param {Element} self
   * @param {String|Array|Object} key
   * @param {*} value
   * @param {Function} [getter]
   * @param {Function} [setter]
   * @param {Function} [remover]
   * @returns {*}
   */
  function doGetOrSet(self, key, value, getter, setter, remover) {
    var keyType = typeOf(key),
        valueType = typeOf(value);

    // remove('key')
    if (remover && value === null && keyType === 'string') {
      return remover.call(self, key);
    }

    // set('key', 'value')
    // set({ key: 'value' })
    if (setter && (valueType !== 'null' || keyType === 'object')) {
      return setter.call(self, key, value);
    }

    // get('key')
    // get(['key1', 'key2'])
    if (getter && valueType === 'null') {
      return getter.call(self, key);
    }

    return self;
  }

  /**
   * Helper function for grabbing an elements computed styles.
   *
   * @param {Element} element
   * @returns {*}
   */
  function getComputedStyle(element) {
    return window.getComputedStyle(element, null);
  }

  /**
   * Get the sum of multiple styles. This will cast each value to a number.
   *
   * @param {Element} element
   * @param {Array} keys
   * @returns {Number}
   */
  function getSumOfStyles(element, keys) {
    var style = getComputedStyle(element),
        value = 0;

    for (var i = 0, l = keys.length; i < l; i++) {
      value += style[keys[i]].toInt();
    }

    return value;
  }

  /**
   * Convert dashed form to camelcase. Prepend vendor prefix if necessary.
   * Example: background-color -> backgroundColor
   *
   * @param {Element} element
   * @param {String} key
   * @returns {String}
   */
  function convertCssProperty(element, key) {
    if (key === 'float') {
      return 'cssFloat';
    }

    var styles = element.style;

    if (key.indexOf('-')) {
      key = key.replace(/-([a-z0-9])/ig, function(value, letter) {
        return letter.toUpperCase();
      });
    }

    // Used cached lookup
    if (key in styles) {
      return key;
    } else if (vendorPrefixLookup[key]) {
      return vendorPrefixLookup[key];
    }

    // Prepend vendor prefix
    var capKey = key.charAt(0).toUpperCase() + key.slice(1),
        vendorKey;

    for (var i = 0, p; p = vendorPrefixes[i]; i++) {
      vendorKey = p + capKey;

      if (vendorKey in styles) {
        vendorPrefixLookup[key] = vendorKey;
        return vendorKey;
      }
    }

    return key;
  }

  /**
   * Handles the detection and execution of getter hooks.
   *
   * @param {Object} hooks
   * @param {Element} self
   * @param {String} key
   * @param {*} value
   * @returns {*}
   */
  function callGetHook(hooks, self, key, value) {
    if (hooks[key] && hooks[key].get) {
      return hooks[key].get.call(self, key);
    }

    return value;
  }

  /**
   * Handles the detection and execution of setter hooks.
   *
   * @param {Object} hooks
   * @param {Element} self
   * @param {String} key
   * @param {*} value
   * @returns {*}
   */
  function callSetHook(hooks, self, key, value) {
    if (hooks[key] && hooks[key].set) {
      value = hooks[key].set.call(self, key, value);
    }

    return value;
  }

  /**
   * Helper function used to cast boolean properties to a boolean value.
   * Example: prop('checked', 'checked') === true
   *
   * @param {String} key
   * @param {*} value
   * @returns {boolean}
   */
  function setBoolHook(key, value) {
    return (typeOf(value) !== 'boolean') ? (key === value) : value;
  }

  Element.implement({

    /*------------------------------------ Attributes ------------------------------------*/

    /**
     * Universal getter, setter and remover for HTML attributes.
     *
     * @param {String|Array|Object} key
     * @param {*} [value]
     * @returns {Element}
     */
    attr: function attr(key, value) {
      return doGetOrSet(this, key, value, this.getAttr, this.setAttr, this.removeAttr);
    },

    /**
     * Get the value of an HTML attribute.
     *
     * @param {String|Array} key
     * @returns {String}
     */
    getAttr: function getAttr(key) {
      return this.getAttribute(key);
    }.getter(),

    /**
     * Set the value of an HTML attribute.
     *
     * @param {String|Object} key
     * @param {*} [value]
     * @returns {Element}
     */
    setAttr: function setAttr(key, value) {
      if (typeOf(value) === 'function') {
        value = value.call(this, this.getAttr(key)); // current attribute as argument
      }

      this.setAttribute(key, value);

      return this;
    }.setter(),

    /**
     * Remove an HTML attribute.
     *
     * @param {String|Array} key
     * @returns {Element}
     */
    removeAttr: function removeAttr(key) {
      this.removeAttribute(key);

      return this;
    }.remover(),

    /*------------------------------------ Properties ------------------------------------*/

    /**
     * Universal getter, setter and remover for DOM properties.
     *
     * @param {String|Array|Object} key
     * @param {*} [value]
     * @returns {Element}
     */
    prop: function prop(key, value) {
      return doGetOrSet(this, key, value, this.getProp, this.setProp, this.removeProp);
    },

    /**
     * Get the value of a DOM property.
     *
     * @param {String|Array} key
     * @returns {*}
     */
    getProp: function getProp(key) {
      if (typeof this[key] === 'undefined' && !Hooks.prop[key]) {
        return null;
      }

      return callGetHook(Hooks.prop, this, key, this[key]);
    }.getter(),

    /**
     * Set the value of a DOM property.
     *
     * @param {String|Object} key
     * @param {*} [value]
     * @returns {Element}
     */
    setProp: function setProp(key, value) {
      if (typeOf(value) === 'function') {
        value = value.call(this, this.getProp(key)); // current prop as argument
      }

      this[key] = callSetHook(Hooks.prop, this, key, value);

      return this;
    }.setter(),

    /**
     * Remove a DOM property. Will not remove native props.
     *
     * @param {String|Array} key
     * @returns {Element}
     */
    removeProp: function removeProp(key) {
      try {
        delete this[key];
      } catch (e) {}

      return this;
    }.remover(),

    /*------------------------------------ Utility ------------------------------------*/

    html: function html(value) {
      return (typeOf(value) === 'null') ? this.getHtml() : this.setHtml(value);
    },

    getHtml: function getHtml() {
      return this.innerHTML;
    },

    setHtml: function setHtml(html) {
      this.innerHTML = html;

      return this;
    },

    text: function text(value) {
      return (typeOf(value) === 'null') ? this.getText() : this.setText(value);
    },

    getText: function getText() {
      return this.innerText;
    },

    setText: function setText(text) {
      this.innerText = text;

      return this;
    },

    val: function val(value) {
      return (typeOf(value) === 'null') ? this.getVal() : this.setVal(value);
    },

    getVal: function getVal() {
      return this.value;
    },

    setVal: function setVal(value) {
      this.value = value;

      return this;
    },

    /*------------------------------------ Styles ------------------------------------*/

    css: function css(key, value) {
      return doGetOrSet(this, key, value, this.getStyle, this.setStyle, this.removeStyle);
    },

    getStyle: function getStyle(key) {
      key = convertCssProperty(this, key);

      return callGetHook(Hooks.style, this, key, this.style[key] || null);
    }.getter(),

    setStyle: function setStyle(key, value) {
      key = convertCssProperty(this, key);

      if (typeOf(value) === 'function') {
        value = value.call(this, this.getStyle(key)); // current style as argument
      }

      value = callSetHook(Hooks.style, this, key, value);

      var type = typeOf(value);

      // Dont allow null or NaN values
      if (type === 'null') {
        return this;
      }

      // Auto pixel numbers
      if (type === 'number' && !pixellessNumbers[key]) {
        value += 'px';
      }

      this.style[key] = value;

      return this;
    }.setter(),

    removeStyle: function removeStyle(key) {
      this.style[convertCssProperty(this, key)] = '';

      return this;
    }.remover(),

    /*------------------------------------ Classes ------------------------------------*/

    /**
     * Add a single or multiple classes.
     *
     * @param {String|Array} name
     * @returns {Element}
     */
    addClass: function addClass(name) {
      if (typeOf(name) !== 'array') {
        name = name.split(' ');
      }

      for (var i = 0, l = name.length; i < l; i++) {
        this.classList.add(name[i]);
      }

      return this;
    },

    /**
     * Remove a single or multiple classes.
     *
     * @param {String|Array} name
     * @returns {Element}
     */
    removeClass: function removeClass(name) {
      if (typeOf(name) !== 'array') {
        name = name.split(' ');
      }

      for (var i = 0, l = name.length; i < l; i++) {
        this.classList.remove(name[i]);
      }

      return this;
    },

    /**
     * Check for the existence of single or multiple classes.
     *
     * @param {String|Array} name
     * @returns {Element}
     */
    hasClass: function hasClass(name) {
      if (typeOf(name) !== 'array') {
        name = name.split(' ');
      }

      for (var i = 0, l = name.length; i < l; i++) {
        if (!this.classList.contains(name[i])) {
          return false;
        }
      }

      return true;
    },

    /**
     * Replace one class with another.
     *
     * @param {String} remove
     * @param {String} add
     * @returns {Element}
     */
    swapClass: function swapClass(remove, add) {
      return this.removeClass(remove).addClass(add);
    },

    /**
     * Toggle a class on and off.
     *
     * @param {String} name
     * @returns {Element}
     */
    toggleClass: function toggleClass(name) {
      this.classList.toggle(name);

      return this;
    },

    /*------------------------------------ Dimensions ------------------------------------*/

    // TODO validate box-sizing content-box vs border-box?
    // TODO validate number -> px conversions

    /**
     * Return the width and height of an element.
     * Can pass an optional argument for the size.
     *
     * @param {String} [size]
     * @returns {{width: Number, height: Number}}
     */
    dimensions: function dimensions(size) {
      var width, height;

      if (size === 'inner') {
        width = this.innerWidth();
        height = this.innerHeight();

      } else if (size === 'outer') {
        width = this.outerWidth();
        height = this.outerHeight();

      } else {
        width = this.width();
        height = this.height();
      }

      return { width: width, height: height };
    },

    /**
     * Return the height of the element including padding and border.
     * Disregards the border-box style.
     *
     * @returns {Number}
     */
    height: function height() {
      return getSumOfStyles(this, [
        'height',
        'paddingTop', 'paddingBottom',
        'borderTopWidth', 'borderBottomWidth'
      ]);
    },

    /**
     * Return the height of the element with no padding and border.
     * Disregards the border-box style.
     *
     * @returns {Number}
     */
    innerHeight: function innerHeight() {
      return getComputedStyle(this).height.toInt();
    },

    /**
     * Return the height of the element including padding, border and margin.
     * Disregards the border-box style.
     *
     * @returns {Number}
     */
    outerHeight: function outerHeight() {
      return this.height() + getSumOfStyles(this, ['marginTop', 'marginBottom']);
    },

    /**
     * Return the width of the element including padding and border.
     * Disregards the border-box style.
     *
     * @returns {Number}
     */
    width: function width() {
      return getSumOfStyles(this, [
        'width',
        'paddingLeft', 'paddingRight',
        'borderLeftWidth', 'borderRightWidth'
      ]);
    },

    /**
     * Return the width of the element with no padding and border.
     * Disregards the border-box style.
     *
     * @returns {Number}
     */
    innerWidth: function innerWidth() {
      return getComputedStyle(this).width.toInt();
    },

    /**
     * Return the width of the element including padding, border and margin.
     * Disregards the border-box style.
     *
     * @returns {Number}
     */
    outerWidth: function outerWidth() {
      return this.width() + getSumOfStyles(this, ['marginLeft', 'marginRight']);
    },

    /*------------------------------------ Position ------------------------------------*/

    position: function position() {

    },

    coordinates: function coordinates() {

    },

    /*top: function top() {

    },

    left: function left() {

    },

    scroll: function offset() {

    },

    scrollTop: function scrollTop() {

    },

    scrollLeft: function scrollLeft() {

    },*/

    /*------------------------------------ Elements ------------------------------------*/

    append: function append(element) {

    },

    appendTo: function appendTo(context) {

    },

    prepend: function prepend(element) {

    },

    prependTo: function prependTo(context) {

    },

    after: function after() {

    },

    before: function before() {

    },

    insertAfter: function insertAfter() {

    },

    insertBefore: function insertBefore() {

    },

    remove: function() {

    },

    empty: function() {

    }

  });

}).call(this);