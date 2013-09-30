/**
 * @copyright   2006-2013, Miles Johnson - http://milesj.me
 * @license     http://opensource.org/licenses/mit-license.php
 * @link        http://milesj.me/code/javascript/joop
 */

describe('Types', function() {
  var expect = chai.expect;

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