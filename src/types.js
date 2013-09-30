/**
 * @copyright   2006-2013, Miles Johnson - http://milesj.me
 * @license     http://opensource.org/licenses/mit-license.php
 * @link        http://milesj.me/code/javascript/joop
 */

(function() {
  'use strict';

  /*------------------------------------ Function ------------------------------------*/

  var Func = Function.prototype;

  /**
   * Overload a getter method to accept an array that returns a set of data.
   *
   * @returns {Function}
   */
  Func.getter = function getter() {
    var self = this;

    return function overloadGetter(a) {
      var data = {};

      if (typeOf(a) === 'array') {
        for (var i = 0, l = a.length; i < l; i++) {
          data[a[i]] = self.call(this, a[i]);
        }
      } else {
        data = self.call(this, a);
      }

      return data;
    };
  };

  /**
   * Overload a setter method with key value arguments to accept an object of key values.
   *
   * @param {boolean} [check]  Verify has own property
   * @returns {Function}
   */
  Func.setter = function setter(check) {
    var self = this;

    return function overloadSetter(a, b) {
      if (typeOf(a) === 'object') {
        for (var key in a) {
          if (check && !a.hasOwnProperty(key)) {
            continue;
          }

          self.call(this, key, a[key]);
        }
      } else if (a) {
        self.call(this, a, b);
      }

      return this;
    };
  };

  /**
   * Overload a remover method by allowing an array of keys to be passed.
   *
   * @returns {Function}
   */
  Func.remover = function remover() {
    var self = this;

    return function overloadRemover(a) {
      if (typeOf(a) === 'array') {
        for (var i = 0, l = a.length; i < l; i++) {
          self.call(this, a[i]);
        }
      } else {
        self.call(this, a);
      }

      return this;
    };
  };

  /**
   * Extend the object with new members.
   * These members can be accessed statically.
   *
   * @param {String} key
   * @param {*} value
   * @returns {Function}
   */
  Func.extend = function extend(key, value) {
    this[key] = value;

    return this;
  }.setter();

  /**
   * Extend the object's prototype with new members.
   * These members can be accessed dynamically.
   *
   * @param {String} key
   * @param {*} value
   * @returns {Function}
   */
  Func.implement = function implement(key, value) {
    this.prototype[key] = value;

    return this;
  }.setter();

  /*------------------------------------ Object ------------------------------------*/

  Object.extend({

    /**
     * Deep clone an object and its properties.
     *
     * @param {Object} object
     * @returns {Object}
     */
    clone: function cloneObject(object) {
      var obj = {}, key, value, type;

      for (key in object) {
        if (!object.hasOwnProperty(key)) {
          continue;
        }

        value = object[key];
        type = typeOf(value);

        if (type === 'array') {
          obj[key] = Array.clone(value);
        } else if (type === 'object') {
          obj[key] = Object.clone(value);
        } else {
          obj[key] = value;
        }
      }

      return obj;
    }

  });

  /*------------------------------------ Array ------------------------------------*/

  Array.extend({

    /**
     * Deep clone an array and its items.
     *
     * @param {Array} array
     * @returns {Array}
     */
    clone: function cloneArray(array) {
      var arr = [], type;

      array.forEach(function(value) {
        type = typeOf(value);

        if (type === 'array') {
          arr.push(Array.clone(value));
        } else if (type === 'object') {
          arr.push(Object.clone(value));
        } else {
          arr.push(value);
        }
      });

      return arr;
    }

  });

  /*------------------------------------ String ------------------------------------*/

  String.implement({

    /**
     * Convert a string to an integer.
     *
     * @param {Number} [base]
     * @returns {Number}
     */
    toInt: function(base) {
      return parseInt(this, base || 10);
    },

    /**
     * Convert a string to a float.
     *
     * @returns {Number}
     */
    toFloat: function() {
      return parseFloat(this);
    }

  });

}).call(this);