/**
 * @copyright   2006-2013, Miles Johnson - http://milesj.me
 * @license     http://opensource.org/licenses/mit-license.php
 * @link        http://milesj.me/code/javascript/joop
 */

(function() {
  'use strict';

  var joop = {

    /** Current version */
    version: '0.0.0',

    /** Current build */
    build: '',

    /** Getter and setter hooks */
    hooks: {
      attr: {},
      prop: {},
      style: {}
    }

  };

  /** Referenced functions */
  var _toString = Object.prototype.toString;

  /**
   * Determine the item type and return it as a string.
   *
   * @param {*} item
   * @returns {String}
   */
  function typeOf(item) {
    var type = (typeof item);

    if (item === null || type === 'undefined') {
      return 'null';

    } else if (type === 'object') {
      if (item.nodeName) {
        if (item.nodeType === 1) {
          return 'element';

        } else if (item.nodeType === 3) {
          return (/\S/.test(item.nodeValue)) ? 'text' : 'whitespace';
        }

      } else if (typeof item.length === 'number' && type !== 'string') {
        if ('callee' in item) {
          return 'arguments';

        } else if ('item' in item) {
          return 'collection';
        }
      }

      return _toString.call(item).replace(/\[object ([a-zA-Z]+)\]/, function(a, b) {
        return b.toLowerCase();
      });
    }

    if (type === 'number' && !isFinite(item)) {
      return 'null'; // nan
    }

    return type;
  }

  /**
   * Verify that item is an instance of a specific object.
   *
   * @param {Object} item
   * @param {Object} object
   * @returns {boolean}
   */
  function instanceOf(item, object) {
    if (typeOf(item) === 'null') {
      return false;
    }

    if (object.prototype.isPrototypeOf(item)) {
      return true;
    }

    return (item instanceof object);
  }

  /**
   * Check if a variable is defined.
   *
   * @param {*} item
   * @returns {boolean}
   */
  function isDefined(item) {
    return (typeof item !== 'undefined');
  }

  this.joop = joop;
  this.typeOf = typeOf;
  this.instanceOf = instanceOf;
  this.isDefined = isDefined;

}).call(this);