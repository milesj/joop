/**
 * @copyright   2006-2013, Miles Johnson - http://milesj.me
 * @license     http://opensource.org/licenses/mit-license.php
 * @link        http://milesj.me/code/javascript/joop
 */

(function() {
  'use strict';

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
    var key, value, type;

    for (key in object) {
      value = object[key];
      type = typeOf(value);

      if (type === 'array') {
        object[key] = Array.clone(value);
      } else if (type === 'object') {
        object[key] = Object.clone(value);
      }
    }
  }

  /**
   * Inherit static members from one object into another.
   *
   * @param {Object} object
   * @param {Object} props
   */
  function extendMembers(object, props) {
    for (var key in props) {
      if (!props.hasOwnProperty(key)) {
        continue;
      }

      object.extend(key, props[key]);
    }
  }

  /**
   * Inherit dynamic members from one object into another.
   * Take into account visibility modifiers.
   *
   * @param {Object} object
   * @param {Object} props
   */
  function implementMembers(object, props) {
    var origin, key, value, isStatic, type;

    for (key in props) {
      if (!props.hasOwnProperty(key)) {
        continue;
      }

      value = props[key];
      type = typeOf(value);
      isStatic = (type === 'function' && value.$static);
      origin = isStatic ? object[key] : object.prototype[key];

      // Wrap methods to allow for parent() calls
      if (origin && !isStatic && (typeof origin === 'function' && type === 'function')) {
        if (origin.$protected) {
          continue;
        }

        value = wrapMethod(key, origin, value);
      }

      // Extend the object if visibility allows it
      if (visibilityCheck(origin, value)) {
        if (isStatic) {
          object.extend(key, value);
        } else {
          object.implement(key, value);
        }
      }
    }
  }

  /*------------------------------------ Methods ------------------------------------*/

  Function.implement({

    /**
     * Mark a function as static.
     * Static methods can be called without an instance.
     *
     * @returns {Function}
     */
    static: function isStatic() {
      this.$static = true;

      return this;
    },

    /**
     * Mark a function as protected.
     * Protected methods cannot be overwritten in classes.
     *
     * @returns {Function}
     */
    protect: function isProtected() {
      this.$protected = true;

      return this;
    },

    /**
     * Mark a function as private.
     * Private methods will not be inherited by classes.
     *
     * @returns {Function}
     */
    private: function isPrivate() {
      this.$private = true;

      return this;
    },

    /**
     * Provides a way to type hint function arguments.
     * Any argument that does not match the type will throw an error.
     * Use of nulls can be used for skipping arguments or accepting no value.
     * Also accepts classes and namespaces.
     *
     * @param {Array} types
     * @returns {Function}
     */
    hint: function typeHint(types) {
      var self = this;

      return function hint() {
        /*jshint newcap:false */

        var arg, argType, type, error, errorType;

        for (var i = 0, l = types.length; i < l; i++) {
          arg = arguments[i];
          type = types[i];
          error = false;
          argType = typeOf(arg);
          errorType = type;

          if (argType === 'null' || type === null || arg === null) {
            continue;
          }

          switch (type) {
            case 'arr':
            case 'array':     error = (argType !== 'array'); break;
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
            case 'regexp':    error = (argType !== 'regexp'); break;
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
    },

    /**
     * Cache the result of the function and return that value for all subsequent calls.
     * Based on the memoization pattern. Currently no way to clear the cache.
     *
     * @returns {Function}
     */
    memoize: function memoizer() {
      var self = this, cache = null;

      return function memoize() {
        if (cache) {
          return cache;
        }

        return cache = self.apply(this, arguments);
      };
    },

    /**
     * Mark a function as deprecated. When the method is called, log a warning.
     * Deprecated methods will not halt the interpreter.
     *
     * @param {String} message
     * @returns {Function}
     */
    deprecate: function deprecater(message) {
      var self = this, warned = false;

      return function deprecate() {
        if (!warned && isDefined(console)) {
          console.warn('This method is deprecated. ' + message + '\n' + new Error(message).stack);
          warned = true;
        }

        return self.apply(this, arguments);
      }.extend('$deprecated', message);
    }

  });

  /*------------------------------------ Classes ------------------------------------*/

  /** Flag for class initialization checks */
  var initializing = false;

  /** Base class object that all classes should extend */
  var Class = function() {};

  Class.implement({

    /**
     * Implements the parent() method allowing for child to parent method calls.
     *
     * @returns {*}
     */
    parent: function parent() {
      if (!this.$caller || !this.$super) {
        throw new Error('The method parent() cannot be called in this context');
      }

      return this.$super.apply(this, arguments);
    }.protect(),

    /**
     * Return the fully qualified class name that includes the namespace.
     *
     * @returns {String}
     */
    className: function className() {
      return (this.$namespace ? this.$namespace + '.' : '') + this.$class;
    }.protect()

  });

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
    extendMembers(Class, this); // static
    implementMembers(Class, props); // dynamic

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

  this.Class = Class;
}).call(this);