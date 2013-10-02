/**
 * @copyright   2006-2013, Miles Johnson - http://milesj.me
 * @license     http://opensource.org/licenses/mit-license.php
 * @link        http://milesj.me/code/javascript/joop
 */

(function() {
  'use strict';

  var _slice = Array.prototype.slice,
      _hasOwnProperty = Object.prototype.hasOwnProperty;

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
          if (check && !_hasOwnProperty.call(a, key)) {
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

  Function.extend({

    /**
     * Convert a value to a function.
     *
     * @param {*} value
     * @returns {Function}
     */
    from: function(value) {
      return (typeOf(value) === 'function') ? value : function() {
        return value;
      };
    }

  });

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
    },

    /**
     * Loop over every property in the object and call the defined function.
     *
     * @param {Object} object
     * @param {Function} func
     * @param {Object} bind
     */
    forEach: function(object, func, bind) {
      for (var key in object) {
        func.call(bind, object[key], key, object);
      }
    },

    /**
     * Loop over every own property that passes `hasOwnProperty()` in the object and call the defined function.
     *
     * @param {Object} object
     * @param {Function} func
     * @param {Object} bind
     */
    forOwn: function(object, func, bind) {
      for (var key in object) {
        if (_hasOwnProperty.call(object, key)) {
          func.call(bind, object[key], key, object);
        }
      }
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
    },

    /**
     * Convert a value to an array.
     *
     * @param {*} value
     * @returns {Array}
     */
    from: function toArray(value) {
      var type = typeOf(value);

      if (type === 'null') {
        return [];

      } else if (type === 'array') {
        return value;

      } else if (type === 'collection' || type === 'arguments') {
        return _slice.call(value);
      }

      return [value];
    }

  });

  /*------------------------------------ String ------------------------------------*/

  String.extend({

    /**
     * Convert a value to a string.
     *
     * @param {*} value
     * @returns {String}
     */
    from: function toString(value) {
      return (value + '');
    }

  });

  String.implement({

    /**
     * Convert a string to an integer.
     *
     * @param {Number} [base]
     * @returns {Number}
     */
    toInt: function toInt(base) {
      return parseInt(this, base || 10);
    },

    /**
     * Convert a string to a float.
     *
     * @returns {Number}
     */
    toFloat: function toFloat() {
      return parseFloat(this);
    }

  });

  /*------------------------------------ Number ------------------------------------*/

  Number.extend({

    /**
     * Convert a value to a number.
     *
     * @param {*} value
     * @returns {Number}
     */
    from: function toNumber(value) {
      var number = parseFloat(value);

      return isFinite(number) ? number : null;
    },

    /**
     * Generate a random number between 2 bounds.
     *
     * @param {Number} min
     * @param {Number} max
     * @returns {Number}
     */
    random: function randomNumber(min, max) {
      return Math.floor(Math.random() * ((max - min) + 1) + min);
    }

  });

  Number.implement({

    /**
     * Limit a number between 2 bounds.
     *
     * @param {Number} min
     * @param {Number} max
     * @returns {Number}
     */
    limit: function limitNumber(min, max) {
      return Math.min(max, Math.max(min, this));
    }

  });
  
  // Inherit Math methods
  ['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor', 'imul', 'log', 'max', 'min', 'pow', 'round', 'sin', 'sqrt', 'tan'].forEach(function(key) {
    Number.implement(key, function() {
      return Math[key].apply(null, [this].concat(Array.from(arguments)));
    });
  });

}).call(this);