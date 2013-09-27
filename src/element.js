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
      value += style[keys[i]].toInt();
    }

    return value;
  }

  /*------------------------------------ Hooks ------------------------------------*/

  function callGetHook(hooks, self, key, value) {
    if (hooks[key] && hooks[key].get) {
      return hooks[key].get.call(self, key);
    }

    return value;
  }

  function callSetHook(hooks, self, key, value) {
    if (hooks[key] && hooks[key].set) {
      value = hooks[key].set.call(self, key, value);
    }

    return value;
  }

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

      // Props can be false so check for it
      if (typeof this[key] === 'undefined' && !Hooks.prop[key]) {
        return null;
      }

      return callGetHook(Hooks.prop, this, key, this[key]);
    }.getter(),

    setProp: function setProp(key, value) {
      if (typeOf(value) === 'function') {
        value = value.call(this, this.getProp(key)); // current prop as argument
      }

      this[key] = callSetHook(Hooks.prop, this, key, value);

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
      if (typeOf(name) !== 'array') {
        name = name.split(' ');
      }

      for (var i = 0, l = name.length; i < l; i++) {
        this.classList.add(name[i]);
      }

      return this;
    },

    removeClass: function removeClass(name) {
      if (typeOf(name) !== 'array') {
        name = name.split(' ');
      }

      for (var i = 0, l = name.length; i < l; i++) {
        this.classList.remove(name[i]);
      }

      return this;
    },

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

    swapClass: function swapClass(remove, add) {
      return this.removeClass(remove).addClass(add);
    },

    toggleClass: function toggleClass(name) {
      this.classList.toggle(name);

      return this;
    },

    /*------------------------------------ Dimensions ------------------------------------*/

    // TODO validate box-sizing content-box vs border-box?
    // TODO validate number -> px conversions

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

    height: function height() {
      return getSumOfStyles(this, [
        'height',
        'paddingTop', 'paddingBottom',
        'borderTopWidth', 'borderBottomWidth'
      ]);
    },

    innerHeight: function innerHeight() {
      return getComputedStyle(this).height.toInt();
    },

    outerHeight: function outerHeight() {
      return this.height() + getSumOfStyles(this, ['marginTop', 'marginBottom']);
    },

    width: function width() {
      return getSumOfStyles(this, [
        'width',
        'paddingLeft', 'paddingRight',
        'borderLeftWidth', 'borderRightWidth'
      ]);
    },

    innerWidth: function innerWidth() {
      return getComputedStyle(this).width.toInt();
    },

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