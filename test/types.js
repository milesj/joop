/**
 * @copyright   2006-2013, Miles Johnson - http://milesj.me
 * @license     http://opensource.org/licenses/mit-license.php
 * @link        http://milesj.me/code/javascript/joop
 */

describe('Types', function() {
  var expect = chai.expect;

  describe('typeOf', function() {
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
      expect(typeOf(document.createTextNode('text'))).to.equal('textnode');
    });
    it('node is whitespace', function() {
      expect(typeOf(document.createTextNode(''))).to.equal('whitespace');
    });
    it('nodes is collection', function() {
      expect(typeOf(document.querySelectorAll('div'))).to.equal('collection');
    });
  });

  describe('Function', function() {

    it('setter() should allow functions to accept objects', function() {
      var data = {},
        setter = function(key, value) {
          data[key] = value;
        }.setter();

      setter('foo', 'bar');

      expect(data).to.deep.equal({
        foo: 'bar'
      });

      setter({
        foo: 'baz',
        wtf: 123456
      });

      expect(data).to.deep.equal({
        foo: 'baz',
        wtf: 123456
      });
    });

    it('extend() should apply static members', function() {
      var obj = function() {};
      obj.extend('foo', 'bar');

      expect(obj.foo).to.equal('bar');
      expect(obj.prototype.foo).to.be.an('undefined');
      expect(obj.bar).to.be.an('undefined');
    });

    it('implement() should apply dynamic members (to prototype)', function() {
      var obj = function() {};
      obj.implement('foo', 'bar');

      expect(obj.prototype.foo).to.equal('bar');
      expect(obj.foo).to.be.an('undefined');
      expect(obj.prototype.bar).to.be.an('undefined');
    });

  });

});