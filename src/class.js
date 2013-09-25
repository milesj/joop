/**
 * @copyright   2006-2013, Miles Johnson - http://milesj.me
 * @license     http://opensource.org/licenses/mit-license.php
 * @link        http://milesj.me/code/javascript/joop
 */

/**
 * Thanks to the MooTools team, John Resig, and the many other class inheritance systems for the idea.
 */
(function() {
  'use strict';

  var _toString = Object.prototype.toString;

  /**
   * Determine whether to allow function overrides by checking private and protected visibility.
   *
   * @param {Function} oldValue
   * @param {Function} newValue
   * @returns {boolean}
   */
  function visibilityCheck(oldValue, newValue) {
    var isOldFunc = (typeof oldValue === 'function'),
      isNewFunc = (typeof newValue === 'function');

    // Original member doesn't exist or is not a function
    // Do not allow private functions
    if (!isOldFunc) {
      if (isNewFunc) {
        return !newValue.$private;
      }

      return true;
    }

    // If overriding member is a private function, don't copy it over
    // Or if the original member is protected, don't overwrite it
    return !(isNewFunc && (newValue.$private || oldValue.$protected));
  }

  /**
   * Allows parent to child function calls when a function gets overwritten.
   * Applies the parent method as a super reference which can be triggered within the child method through parent().
   *
   * @param {String} name
   * @param {Function} origin
   * @param {Function} method
   * @returns {Function}
   */
  function wrapMethod(name, origin, method) {
    return function wrap() {
      // Set the super method to call when parent() is called
      this.$caller = name;
      this.$super = origin;

      // Call the current method
      var ret = method.apply(this, arguments);

      // Reset the parent() state
      delete this.$caller;
      delete this.$super;

      return ret;
    };
  }

  /**
   * Reset the properties of a class so that array and object references are broken.
   *
   * @param {Object} self
   */
  function resetMembers(self) {
    var key, value;

    for (key in self) {
      value = self[key];

      if (typeof value !== 'object' || key === '$parent') {
        continue;
      }

      if (_toString.call(value) === '[object Array]') {
        self[key] = [].concat(value);

      } else {
        self[key] = {};
      }
    }
  }

  /** Reference the Function prototype */
  var Func = Function.prototype;

  /**
   * Mark a function as protected.
   * Protected methods cannot be overwritten in classes.
   *
   * @returns {Function}
   */
  Func.protect = function() {
    this.$protected = true;

    return this;
  };

  /**
   * Mark a function as private.
   * Private methods will not be inherited by children in classes.
   *
   * @returns {Function}
   */
  Func.private = function() {
    this.$private = true;

    return this;
  };

  /**
   * Cache the result of the function and return that value for all subsequent calls.
   * Based on the memoization pattern. Currently no way to clear the cache.
   *
   * @returns {Function}
   */
  Func.memoize = function() {
    var self = this, cache = null;

    return function memoize() {
      if (cache) {
        return cache;
      }

      return cache = self.apply(this, arguments);
    };
  };

  /**
   * Mark a function as deprecated. When the method is called, log a warning.
   * Deprecated methods will not halt the interpreter.
   *
   * @param {String} message
   * @returns {Function}
   */
  Func.deprecate = function(message) {
    var self = this, warned = false;

    return function deprecate() {
      if (!warned && console) {
        console.warn('This method is deprecated. ' + message + '\n' + new Error(message).stack);
        warned = true;
      }

      return self.apply(this, arguments);
    }.extend('$deprecated', message);
  };

  /**
   * Overload a method with key value arguments to accept an object of key values.
   *
   * @param {boolean} [check]  Verify has own property
   * @returns {Function}
   */
  Func.overload = function(check) {
    var self = this;

    return function overload(a, b) {
      if (typeof a === 'object') {
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
   * Extend the object with new members. These members can be accessed statically.
   * Apply visibility checks to functions.
   *
   * @param {String} key
   * @param {*} value
   * @returns {Function}
   */
  Func.extend = function(key, value) {
    if (visibilityCheck(this[key], value)) {
      this[key] = value;
    }

    return this;
  }.overload();

  /**
   * Extend the object's prototype with new members. These members can be accessed dynamically.
   * Apply visibility checks to functions.
   *
   * @param {String} key
   * @param {*} value
   * @returns {Function}
   */
  Func.implement = function(key, value) {
    if (visibilityCheck(this.prototype[key], value)) {
      this.prototype[key] = value;
    }

    return this;
  }.overload();

  /** Flag for class initialization checks */
  var initializing = false;

  /** Base class object that all classes should extend */
  var Class = function() {};

  /**
   * Implements the parent() method allowing for child to parent method calls.
   *
   * @returns {*}
   */
  Class.implement('parent', function parent() {
    if (!this.$caller || !this.$super) {
      throw new Error('The method parent() cannot be called in this context');
    }

    return this.$super.apply(this, arguments);
  }.protect());

  /**
   * Implements the static create() method which allows for creating child classes from the current class.
   *
   * @param {String} namespace
   * @param {Object} props
   * @returns {Class}
   */
  Class.extend('create', function create(namespace, props) {
    /*jshint newcap:false */

    initializing = true;
    var parent = new this(),
        proto = new this();
    initializing = false;

    if (parent.$namespace) {
      namespace = parent.$namespace + '.' + namespace;
    }

    // Skeleton class to handle construct and init
    function Class() {
      resetMembers(this);

      if (this.init && !initializing) {
        this.init.apply(this, arguments);
      }
    }

    // Inherit parent members
    Class.prototype = proto;

    // Reset the constructor
    Class.prototype.constructor = Class;

    // Apply new members
    var origin, key, value;

    for (key in props) {
      if (!props.hasOwnProperty(key)) {
        continue;
      }

      origin = Class.prototype[key];
      value = props[key];

      // Wrap methods to allow for parent() calls
      if (origin && (typeof origin === 'function' && typeof value === 'function')) {
        if (origin.$protected) {
          continue;
        }

        value = wrapMethod(key, origin, value);
      }

      Class.implement(key, value);
    }

    // Reference origins
    Class.implement({
      $namespace: namespace,
      $parent: parent
    });

    // Reference static create method
    Class.create = this.create;

    return Class;
  });

  // Make available
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Class;
  } else {
    this.Class = Class;
  }
}).call(this);