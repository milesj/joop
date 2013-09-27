/**
 * @copyright   2006-2013, Miles Johnson - http://milesj.me
 * @license     http://opensource.org/licenses/mit-license.php
 * @link        http://milesj.me/code/javascript/joop
 */

(function() {
  'use strict';

  function doGetOrSet(element, key, value, getter, setter) {
    var keyType = typeOf(key),
        valueType = typeOf(value);

    // set('key', 'value')
    // set({ key: 'value' })
    if (valueType !== 'null' || keyType === 'object') {
      return setter.call(element, key, value);
    }

    // get('key')
    // get(['key1', 'key2'])
    return getter.call(element, key);
  }

  function resolveValue(element, value) {
    return (typeOf(value) === 'function') ? value.call(element) : value;
  }

  function getComputedStyle(element) {
    return window.getComputedStyle(element, null);
  }

  /*------------------------------------ Attributes ------------------------------------*/

  Element.implement({

    attr: function attr(key, value) {
      return doGetOrSet(this, key, value, this.getAttr, this.setAttr);
    },

    getAttr: function getAttr(key) {
      return this.getAttribute(key);
    }.getter(),

    setAttr: function setAttr(key, value) {
      this.setAttribute(key, resolveValue(value));

      return this;
    }.setter(),

    removeAttr: function removeAttr(key) {
      this.removeAttribute(key);

      return this;
    }

  });

  /*------------------------------------ Properties ------------------------------------*/

  Element.implement({

    prop: function prop(key, value) {
      return doGetOrSet(this, key, value, this.getProp, this.setProp);
    },

    getProp: function getProp(key) {
      return this[key] || null;
    }.getter(),

    setProp: function setProp(key, value) {
      return this[key] = resolveValue(value);
    }.setter(),

    removeProp: function removeProp(key) {
      try {
        delete this[key];
      } catch (e) {}

      return this;
    }

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
    }

  });

  /*------------------------------------ Styles ------------------------------------*/

  Element.implement({

    css: function css(key, value) {
      return doGetOrSet(this, key, value, this.getStyle, this.setStyle);
    },

    getStyle: function getStyle(key) {

    }.getter(),

    setStyle: function setStyle(key, value) {

    }.setter(),

    removeStyle: function removeStyle(key) {

    }

  });

  /*------------------------------------ Classes ------------------------------------*/

  Element.implement({

    addClass: function addClass(name) {
      this.classList.add(name);

      return this;
    },

    removeClass: function removeClass(name) {
      this.classList.remove(name);

      return this;
    },

    hasClass: function hasClass(name) {
      return this.classList.contains(name);
    },

    swapClass: function swapClass(remove, add) {
      return this.removeClass(remove).addClass(add);
    },

    toggleClass: function toggleClass(name) {
      this.classList.toggle(name);

      return this;
    }

  });

  /*------------------------------------ Dimensions ------------------------------------*/

  function getSumOfStyles(element, keys) {
    var style = getComputedStyle(element),
        value = 0;

    for (var i = 0, l = keys.length; i < l; i++) {
      value += style[keys[i]];
    }

    return value;
  }

  Element.implement({

    dimensions: function() {
      return {
        width: this.width(),
        height: this.height()
      };
    },

    height: function height() {
      return getSumOfStyles(this, [
        'height',
        'padding-top', 'padding-bottom',
        'border-top', 'border-bottom'
      ]);
    },

    innerHeight: function innerHeight() {
      return getComputedStyle(this).height;
    },

    outerHeight: function outerHeight() {
      return this.height() + getSumOfStyles(this, ['margin-top', 'margin-bottom']);
    },

    width: function width() {
      return getSumOfStyles(this, [
        'width',
        'padding-left', 'padding-right',
        'border-left', 'border-right'
      ]);
    },

    innerWidth: function innerWidth() {
      return getComputedStyle(this).width;
    },

    outerWidth: function outerWidth() {
      return this.width() + getSumOfStyles(this, ['margin-left', 'margin-right']);
    }

  });

  /*------------------------------------ Position ------------------------------------*/

  Element.implement({

    position: function position() {

    },

    coordinates: function coordinates() {

    },

    top: function top() {

    },

    left: function left() {

    },

    scroll: function offset() {

    },

    scrollTop: function scrollTop() {

    },

    scrollLeft: function scrollLeft() {

    }

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

    }

  });

}).call(this);