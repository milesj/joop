/**
 * @copyright   2006-2013, Miles Johnson - http://milesj.me
 * @license     http://opensource.org/licenses/mit-license.php
 * @link        http://milesj.me/code/javascript/joop
 */

(function() {
  'use strict';

  var hooks = joop.hooks;

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
   * Handles the detection and execution of getter hooks.
   *
   * @param {Object} hook
   * @param {Element} self
   * @param {String} key
   * @param {*} value
   * @returns {*}
   */
  function doGetHook(hook, self, key, value) {
    if (hook && hook.get) {
      return hook.get.call(self, key);
    }

    return value;
  }

  /**
   * Handles the detection and execution of setter hooks.
   *
   * @param {Object} hook
   * @param {Element} self
   * @param {String} key
   * @param {*} value
   * @param {*} original
   * @returns {*}
   */
  function doSetHook(hook, self, key, value, original) {
    if (hook && hook.set) {
      value = hook.set.call(self, key, value);
    }

    if (typeOf(value) === 'function') {
      value = value.call(self, original);
    }

    return value;
  }

  /*------------------------------------ Attributes ------------------------------------*/

  Element.implement({

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
      this.setAttribute(key, doSetHook(hooks.attr[key], this, key, value, this.getAttr(key)));

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
    }.remover()
  });

  /*------------------------------------ Properties ------------------------------------*/

  // Property hooks
  hooks.prop.tag = {
    get: function getTagProp(key) {
      return (this.tagName || this.nodeName).toLowerCase();
    }
  };

  // DOM properties considered boolean only
  var booleans = 'checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped';

  // Add setter hooks for boolean properties
  booleans.split('|').forEach(function(bool) {
    hooks.prop[bool] = { set: setBoolProp };
  });

  /**
   * Helper function used to cast boolean properties to a boolean value.
   * Example: prop('checked', 'checked') === true
   *
   * @param {String} key
   * @param {*} value
   * @returns {boolean}
   */
  function setBoolProp(key, value) {
    return (typeOf(value) !== 'boolean') ? (key === value) : value;
  }

  Element.implement({

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
      if (typeof this[key] === 'undefined' && !hooks.prop[key]) {
        return null;
      }

      return doGetHook(hooks.prop[key], this, key, this[key]);
    }.getter(),

    /**
     * Set the value of a DOM property.
     *
     * @param {String|Object} key
     * @param {*} [value]
     * @returns {Element}
     */
    setProp: function setProp(key, value) {
      this[key] = doSetHook(hooks.prop[key], this, key, value, this.getProp(key));

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
    }.remover()
  });

  /*------------------------------------ Utility ------------------------------------*/

  Element.implement({

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

    /**
     * Helper function to either execute a get or set command.
     *
     * @param {*} [value]
     * @returns {String|Element}
     */
    text: function text(value) {
      return isDefined(value) ? this.setText(value) : this.getText();
    },

    /**
     * Return the text from the current element and all child elements.
     *
     * @returns {String}
     */
    getText: function getText() {
      return this.textContent;
    },

    /**
     * Set the inner content as text. Will convert strings to text nodes.
     *
     * @param {String} text
     * @returns {Element}
     */
    setText: function setText(text) {
      if (typeOf(text) !== 'text') {
        text = document.createTextNode(text);
      }

      this.empty().appendChild(text);

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

    /**
     * Hide an element by setting its display to none.
     *
     * @returns {Element}
     */
    hide: function hide() {
      this.style.display = 'none';

      return this;
    },

    /**
     * Show an element by setting its display to the default.
     *
     * @returns {Element}
     */
    show: function show() {
      this.style.display = '';

      return this;
    },

    /**
     * Toggle the display of an element.
     *
     * @returns {Element}
     */
    toggle: function toggle() {
      if (this.style.display === 'none') {
        this.show();
      } else {
        this.hide();
      }

      return this;
    }

  });

  /*------------------------------------ Styles ------------------------------------*/

  // Style hooks
  hooks.style.margin = {
    get: function getMarginStyle(key) {
      return this.getStyle(['margin-top', 'margin-right', 'margin-bottom', 'margin-left']);
    }
  };

  hooks.style.padding = {
    get: function getPaddingStyle(key) {
      return this.getStyle(['padding-top', 'padding-right', 'padding-bottom', 'padding-left']);
    }
  };

  hooks.style.opacity = {
    get: function getOpacityStyle(key) {
      return this.style.opacity || '1';
    }
  };

  // Possible vendor prefixes for props
  var vendorPrefixes = ['Moz', 'Webkit', 'ms', 'O'], // Moz needs to come first
      vendorPrefixLookup = {};

  // Relative number regex pattern: http://stackoverflow.com/a/10256077
  var regexRelNumbers = /^([+-])=([+-]?\d+(\.\d+)?)$/i;

  // Props that shouldn't append "px"
  // Credit to the jQuery team
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
   * Convert dashed form to camel case.
   * Example: background-color -> backgroundColor
   *
   * @param {String} key
   * @returns {String}
   */
  function convertCssProperty(key) {
    if (key === 'float') {
      return 'cssFloat';
    }

    if (key.indexOf('-')) {
      key = key.replace(/-([a-z0-9])/ig, function(value, letter) {
        return letter.toUpperCase();
      });
    }

    return key;
  }

  /**
   * Apply a vendor prefix to certain CSS style properties.
   * Determine which props require a prefix by checking the styles object.
   *
   * @param {Object} styles
   * @param {String} key
   * @returns {String}
   */
  function applyVendorPrefix(styles, key) {
    if (styles[key]) {
      return key;
    } else if (vendorPrefixLookup[key]) {
      return vendorPrefixLookup[key];
    }

    var capKey = key.charAt(0).toUpperCase() + key.slice(1),
        vendorKey;

    for (var i = 0, p; p = vendorPrefixes[i]; i++) {
      vendorKey = p + capKey;

      if (styles[vendorKey]) {
        vendorPrefixLookup[key] = vendorKey;
        return vendorKey;
      }
    }

    return key;
  }

  Element.implement({

    /**
     * Universal getter, setter and remover for CSS styles.
     *
     * @param {String|Array|Object} key
     * @param {*} [value]
     * @returns {Element}
     */
    css: function css(key, value) {
      return doGetOrSet(this, key, value, this.getStyle, this.setStyle, this.removeStyle);
    },

    /**
     * Get the value of a style. Apply a vendor prefix if necessary.
     *
     * @param {String} key
     * @returns {String}
     */
    getStyle: function getStyle(key) {
      var originKey = convertCssProperty(key),
          vendorKey = applyVendorPrefix(this.style, originKey);

      return doGetHook(hooks.style[vendorKey] || hooks.style[originKey], this, vendorKey, this.style[vendorKey] || null);
    }.getter(),

    /**
     * Set the style for an element. Apply a vendor prefix if necessary.
     * Do not set styles for null or undefined values.
     * Auto-apply "px" to numeric values.
     *
     * @param {String} key
     * @param {*} value
     * @returns {Element}
     */
    setStyle: function setStyle(key, value) {
      var originKey = convertCssProperty(key),
          vendorKey = applyVendorPrefix(this.style, originKey),
          originalValue = this.getStyle(key);

      value = doSetHook(hooks.style[vendorKey] || hooks.style[originKey], this, vendorKey, value, originalValue);

      var type = typeOf(value),
          match;

      // Don't allow null or NaN values
      if (type === 'null') {
        return this;
      }

      // Apply relative values += and -=
      if (type === 'string' && (match = regexRelNumbers.exec(value))) {
        originalValue = originalValue ? originalValue.toFloat() : 0;
        type = 'number';

        if (match[1] === '+') {
          value = originalValue + match[2].toFloat();
        } else {
          value = originalValue - match[2].toFloat();
        }
      }

      // Auto pixel numbers
      if (type === 'number' && !pixellessNumbers[vendorKey]) {
        value += 'px';
      }

      this.style[vendorKey] = value;

      return this;
    }.setter(),

    /**
     * Remove an element style. Will not remove inherited CSS styles.
     *
     * @param {String|Array} key
     * @returns {Element}
     */
    removeStyle: function removeStyle(key) {
      this.style[applyVendorPrefix(this.style, convertCssProperty(key))] = '';

      return this;
    }.remover()

  });

  /*------------------------------------ Classes ------------------------------------*/

  Element.implement({

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
     * @returns {boolean}
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
    }
  });

  /*------------------------------------ Dimensions ------------------------------------*/

  // TODO validate box-sizing content-box vs border-box?

  Element.implement({

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
    }
  });

  /*------------------------------------ Position ------------------------------------*/

  Element.implement({

    position: function position() {

    },

    coordinates: function coordinates() {

    }

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
  });

  /*------------------------------------ Elements ------------------------------------*/

  Element.implement({

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
      while (this.firstChild) {
        this.removeChild(this.firstChild);
      }

      return this;
    }

  });

}).call(this);