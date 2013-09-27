/**
 * @copyright   2006-2013, Miles Johnson - http://milesj.me
 * @license     http://opensource.org/licenses/mit-license.php
 * @link        http://milesj.me/code/javascript/joop
 */

(function() {
  'use strict';

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

  function getComputedStyle(element) {
    return window.getComputedStyle(element, null);
  }

  function getSumOfStyles(element, keys) {
    var style = getComputedStyle(element),
      value = 0;

    for (var i = 0, l = keys.length; i < l; i++) {
      value += style[keys[i]];
    }

    return value;
  }

  /*------------------------------------ Hooks ------------------------------------*/

  function setBoolHook(key, value) {
    return (typeOf(value) !== 'boolean') ? (key === value) : value;
  }

  var booleans = 'checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped';

  var Hooks = {
    prop: {
      tag: {
        get: function getTagProp(key) {
          return (this.tagName || this.nodeName).toLowerCase();
        }
      }
    }
  };

  booleans.split('|').forEach(function(bool) {
    Hooks.prop[bool] = { set: setBoolHook };
  });

  /*------------------------------------ Element ------------------------------------*/

  Element.implement({

    /*------------------------------------ Attributes ------------------------------------*/

    attr: function attr(key, value) {
      return doGetOrSet(this, key, value, this.getAttr, this.setAttr, this.removeAttr);
    },

    getAttr: function getAttr(key) {
      return this.getAttribute(key);
    }.getter(),

    setAttr: function setAttr(key, value) {
      if (typeOf(value) === 'function') {
        value = value.call(this, this.getAttr(key)); // current attribute as argument
      }

      this.setAttribute(key, value);

      return this;
    }.setter(),

    removeAttr: function removeAttr(key) {
      this.removeAttribute(key);

      return this;
    }.remover(),

    /*------------------------------------ Properties ------------------------------------*/

    prop: function prop(key, value) {
      return doGetOrSet(this, key, value, this.getProp, this.setProp, this.removeProp);
    },

    getProp: function getProp(key) {
      if (Hooks.prop[key] && Hooks.prop[key].get) {
        return Hooks.prop[key].get.call(this, key);
      }

      // Props can be false so check for it
      if (typeof this[key] === 'undefined') {
        return null;
      }

      return this[key];
    }.getter(),

    setProp: function setProp(key, value) {
      if (typeOf(value) === 'function') {
        value = value.call(this, this.getProp(key)); // current prop as argument
      }

      if (Hooks.prop[key] && Hooks.prop[key].set) {
        value = Hooks.prop[key].set.call(this, key, value);
      }

      this[key] = value;

      return this;
    }.setter(),

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
      return doGetOrSet(this, key, value, this.getStyle, this.setStyle);
    },

    getStyle: function getStyle(key) {

    }.getter(),

    setStyle: function setStyle(key, value) {

    }.setter(),

    removeStyle: function removeStyle(key) {

    },

    /*------------------------------------ Classes ------------------------------------*/

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
    },

    /*------------------------------------ Dimensions ------------------------------------*/

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