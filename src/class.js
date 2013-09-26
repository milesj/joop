/**
 * @copyright   2006-2013, Miles Johnson - http://milesj.me
 * @license     http://opensource.org/licenses/mit-license.php
 * @link        http://milesj.me/code/javascript/joop
 */

/**
 * Thanks to the MooTools team, John Resig,
 * and the many other class inheritance systems for the idea.
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
   * Reset the members of a class so that array and object references are broken.
   *
   * @param {Object} object
   */
  function resetMembers(object) {
    var key, value;

    for (key in object) {
      value = object[key];

      if (typeof value !== 'object') {
        continue;
      }

      if (_toString.call(value) === '[object Array]') {
        object[key] = [].concat(value);

      } else {
        object[key] = {}; // TODO, clone or merge?
      }
    }
  }

  /**
   * Inherit members (props and methods) from one object into another.
   * Take into account visibility modifiers.
   *
   * @param {Object} object
   * @param {Object} props
   * @param {boolean} proto
   */
  function inheritMembers(object, props, proto) {
    var origin, key, value;

    for (key in props) {
      if (!props.hasOwnProperty(key)) {
        continue;
      }

      origin = proto ? object.prototype[key] : object[key];
      value = props[key];

      // Wrap methods to allow for parent() calls
      if (origin && (typeof origin === 'function' && typeof value === 'function')) {
        if (origin.$protected) {
          continue;
        }

        // Do not wrap static methods
        if (!value.$static) {
          value = wrapMethod(key, origin, value);
        }
      }

      if (proto) {
        object.implement(key, value);
      } else {
        object.extend(key, value);
      }
    }
  }

  /** Reference the Function prototype */
  var Func = Function.prototype;

  /**
   * Mark a function as static.
   * Static methods can be called without an instance.
   *
   * @returns {Function}
   */
  Func.static = function() {
    this.$static = true;

    return this;
  };

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
   * Private methods will not be inherited by classes.
   *
   * @returns {Function}
   */
  Func.private = function() {
    this.$private = true;

    return this;
  };

  /**
   * Provides a way to type hint function arguments.
   * Any argument that does not match the type will throw an error.
   * Use of nulls can be used for skipping arguments or accepting no value.
   * Also accepts classes and namespaces.
   *
   * @param {Array} types
   * @returns {Function}
   */
  Func.hint = function(types) {
    var self = this;

    return function hint() {
      /*jshint newcap:false */

      var arg, argType, type, error, errorType;

      for (var i = 0, l = types.length; i < l; i++) {
        arg = arguments[i];
        type = types[i];
        error = false;

        if (typeof arg === 'undefined' || type === null || arg === null) {
          continue;
        }

        argType = (typeof arg);
        errorType = type;

        switch (type) {
          case 'arr':
          case 'array':     error = (_toString.call(arg) !== '[object Array]'); break;
          case 'obj':
          case 'object':    error = (argType !== 'object'); break;
          case 'str':
          case 'string':    error = (argType !== 'string'); break;
          case 'int':
          case 'integer':
          case 'num':
          case 'number':    error = (argType !== 'number'); break;
          case 'bool':
          case 'boolean':   error = (argType !== 'boolean'); break;
          case 'fn':
          case 'func':
          case 'function':  error = (argType !== 'function'); break;
          case 'regex':
          case 'regexp':    error = (_toString.call(arg) !== '[object RegExp]'); break;
          default:
            // Allows type hints for "Name.Space.Class"
            if (typeof type === 'string') {
              error = (arg.className() !== type);

            // Allows direct linking to class interface object
            } else {
              error = !type.prototype.isPrototypeOf(arg);
              errorType = new type().className();
            }
          break;
        }

        // Throw an error
        if (error) {
          throw new Error('Argument ' + i + ' must be of type ' + errorType);
        }
      }

      return self.apply(this, arguments);
    }.extend('$hints', types);
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
    if (typeof value === 'function' && value.$static) {
      return this.extend(key, value);
    }

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
   * Return the fully qualified class name that includes the namespace.
   *
   * @returns {String}
   */
  Class.implement('className', function() {
    return (this.$namespace ? this.$namespace + '.' : '') + this.$class;
  }.protect());

  /**
   * Implements the static create() method which allows for creating child classes from the current class.
   *
   * @param {String} namespace
   * @param {Object} props
   * @returns {Class}
   */
  Class.extend('create', function create(name, props) {
    /*jshint newcap:false */

    initializing = true;
    var parent = new this();
    initializing = false;

    // Skeleton class to handle construct and init
    function Class() {
      resetMembers(this);

      if (this.init && !initializing) {
        this.init.apply(this, arguments);
      }
    }

    // Inherit parent members
    Class.prototype = parent;

    // Reset the constructor
    Class.prototype.constructor = Class;

    // Apply new members
    inheritMembers(Class, this); // static
    inheritMembers(Class, props, true); // dynamic

    // Reference origins
    var namespace = [];

    if (parent.$namespace) {
      namespace.push(parent.$namespace);
    }

    if (parent.$class) {
      namespace.push(parent.$class);
    }

    Class.implement({
      $namespace: namespace.join('.'),
      $class: name
    });

    return Class;
  });

  // Make available
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Class;

  } else {
    this.Class = Class;
  }

}).call(this);