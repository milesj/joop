/**
 * @copyright   2006-2013, Miles Johnson - http://milesj.me
 * @license     http://opensource.org/licenses/mit-license.php
 * @link        http://milesj.me/code/javascript/joop
 */

describe('Core', function() {
  var expect = chai.expect;

  describe('typeOf()', function() {
    it('String is string', function() {
      expect(typeOf('string')).to.equal('string');
    });
    it('Number is number', function() {
      expect(typeOf(123)).to.equal('number');
    });
    it('Array is array', function() {
      expect(typeOf([])).to.equal('array');
    });
    it('Object is object', function() {
      expect(typeOf({})).to.equal('object');
    });
    it('Boolean is boolean', function() {
      expect(typeOf(true)).to.equal('boolean');
      expect(typeOf(false)).to.equal('boolean');
    });
    it('Function is function', function() {
      expect(typeOf(function(){})).to.equal('function');
    });
    it('null is null', function() {
      expect(typeOf(null)).to.equal('null');
    });
    it('undefined is null', function() {
      expect(typeOf()).to.equal('null');
      expect(typeOf(undefined)).to.equal('null');
    });
    it('NaN is null', function() {
      expect(typeOf(NaN)).to.equal('null');
    });
    it('RegExp is regexp', function() {
      expect(typeOf(new RegExp('^$'))).to.equal('regexp');
      expect(typeOf(/^$/)).to.equal('regexp');
    });
    it('arguments is arguments', function() {
      expect(typeOf(arguments)).to.equal('arguments');
    });
    it('node is element', function() {
      expect(typeOf(document.createElement('div'))).to.equal('element');
    });
    it('node is textnode', function() {
      expect(typeOf(document.createTextNode('text'))).to.equal('text');
    });
    it('node is whitespace', function() {
      expect(typeOf(document.createTextNode(''))).to.equal('whitespace');
    });
    it('nodes is collection', function() {
      expect(typeOf(document.querySelectorAll('div'))).to.equal('collection');
    });
  });

  describe('isDefined()', function() {
    it('should be defined', function() {
      var foo = 1;
      expect(isDefined(foo)).to.be.true;
    });

    it('should be undefined', function() {
      var bar;
      expect(isDefined(bar)).to.be.false;
    });
  });

});