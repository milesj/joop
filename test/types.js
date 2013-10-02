/**
 * @copyright   2006-2013, Miles Johnson - http://milesj.me
 * @license     http://opensource.org/licenses/mit-license.php
 * @link        http://milesj.me/code/javascript/joop
 */

describe('Types', function() {
  var expect = chai.expect;

  describe('Function', function() {
    describe('getter()', function() {
      it('should allow functions to accept arrays', function() {
        var data = {
          foo: 'bar',
          wtf: 123456
        };
        var getter = function(key) {
          return data[key] || null;
        }.getter();

        expect(getter('foo')).to.equal('bar');
        expect(getter(['foo', 'wtf', 'key'])).to.deep.equal({
          foo: 'bar',
          wtf: 123456,
          key: null
        });
      });
    });

    describe('setter()', function() {
      it('should allow functions to accept objects', function() {
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
    });

    describe('remover()', function() {
      it('should allow functions to accept arrays', function() {
        var data = {
          foo: 'bar',
          wtf: 123456,
          key: 'value'
        };
        var remover = function(key) {
          delete data[key];
        }.getter();

        remover('foo');
        expect(data).to.deep.equal({
          wtf: 123456,
          key: 'value'
        });

        remover(['wtf', 'key']);
        expect(data).to.deep.equal({});
      });
    });

    describe('extend()', function() {
      it('should apply static members', function() {
        var obj = function() {};
        obj.extend('foo', 'bar');

        expect(obj.foo).to.equal('bar');
        expect(obj.prototype.foo).to.be.an('undefined');
        expect(obj.bar).to.be.an('undefined');
      });
    });

    describe('implement()', function() {
      it('should apply dynamic members (to prototype)', function() {
        var obj = function() {};
        obj.implement('foo', 'bar');

        expect(obj.prototype.foo).to.equal('bar');
        expect(obj.foo).to.be.an('undefined');
        expect(obj.prototype.bar).to.be.an('undefined');
      });
    });

    describe('from()', function() {
      it('should return a function', function() {
        expect(Function.from(1)).to.be.an('function');
        expect(Function.from('abc')).to.be.an('function');
        expect(Function.from(true)).to.be.an('function');
        expect(Function.from(['foo'])).to.be.an('function');
      });

      it('should return the same function', function() {
        var fn = function(a, b) { return a; };

        expect(Function.from(fn)).to.equal(fn);
      });

      it('should return a function that returns the initial value', function() {
        expect(Function.from(1)()).to.equal(1);
        expect(Function.from('abc')()).to.equal('abc');
        expect(Function.from(true)()).to.be.true;
        expect(Function.from(['foo'])()).to.deep.equal(['foo']);
      });
    });
  });

  describe('Object', function() {
    describe('clone()', function() {
      it('should clone keys and values', function() {
        var obj = { foo: 'bar' };

        expect(Object.clone(obj)).to.deep.equal({ foo: 'bar' });
      });

      it('should break references', function() {
        var obj = { foo: 'bar' },
            clone = Object.clone(obj);

        obj.foo = 'baz';

        expect(clone).to.deep.equal({ foo: 'bar' });
      });

      it('should clone nested arrays and objects', function() {
        var obj = {
          foo: 'bar',
          arr: [1, 2, 3, 4, 5],
          obj: {
            bar: 'baz'
          }
        };

        expect(Object.clone(obj)).to.deep.equal({
          foo: 'bar',
          arr: [1, 2, 3, 4, 5],
          obj: {
            bar: 'baz'
          }
        });
      });
    });

    describe('forEach()', function() {
      it('should loop over every property', function() {
        var func = function() {},
            output = '';

        func.foo = 'bar';

        Object.forEach(func, function(value, key) {
          output += key + ',';
        });

        expect(output).to.equal('foo,getter,setter,remover,extend,implement,static,protect,private,hint,memoize,deprecate,');
      });
    });

    describe('forOwn()', function() {
      it('should loop over own property', function() {
        var func = function() {},
          output = '';

        func.foo = 'bar';

        Object.forOwn(func, function(value, key) {
          output += key + ',';
        });

        expect(output).to.equal('foo,');
      });
    });
  });

  describe('Array', function() {
    describe('clone()', function() {
      it('should clone keys and values', function() {
        var arr = [1, 2, 3];

        expect(Array.clone(arr)).to.deep.equal([1, 2, 3]);
      });

      it('should break references', function() {
        var arr = [1, 2, 3],
            clone = Array.clone(arr);

        arr.push(4);

        expect(clone).to.deep.equal([1, 2, 3]);
      });

      it('should clone nested arrays and objects', function() {
        var arr = [1, 2, { foo: 'bar' }, [3, 4, 5]];

        expect(Array.clone(arr)).to.deep.equal([1, 2, { foo: 'bar' }, [3, 4, 5]]);
      });
    });

    describe('from()', function() {
      it('should return an array', function() {
        expect(Array.from(1)).to.deep.equal([1]);
        expect(Array.from('abc')).to.deep.equal(['abc']);
        expect(Array.from(true)).to.deep.equal([true]);
        expect(Array.from(['foo'])).to.deep.equal(['foo']);
      });

      it('should return the same array', function() {
        var array = [1, 2, 3];

        expect(Array.from(array)).to.equal(array);
      });

      it('should transform an undefined or null into an empty array', function() {
        expect(Array.from(null)).to.deep.equal([]);
        expect(Array.from(undefined)).to.deep.equal([]);
      });

      it('should return a copy of arguments or the arguments if it is of type array', function() {
        var args, type, copy = (function(){
            type = typeOf(arguments);
            args = arguments;

          return Array.from(arguments);
        })(1, 2);

        expect((type === 'array') ? (copy === args) : (copy !== args)).to.be.true;
      });

      it('should return an array for an Elements collection', function() {
        var div1 = document.createElement('div');
        var div2 = document.createElement('div');
        var div3 = document.createElement('div');

        div1.appendChild(div2);
        div1.appendChild(div3);

        var array = Array.from(div1.getElementsByTagName('*'));

        expect(array).to.be.an('array');
      });

      it('should return an array for an options collection', function() {
        var div = document.createElement('div');
            div.innerHTML = '<select><option>a</option></select>';

        var select = div.firstChild;
        var array = Array.from(select.options);

        expect(array).to.be.an('array');
      });
    });
  });
  
  describe('String', function() {
    describe('from()', function() {
      it('should return a string', function() {
        expect(String.from('string')).to.be.a('string');
        expect(String.from(1)).to.be.a('string');
        expect(String.from(new Date())).to.be.a('string');
        expect(String.from(function(){})).to.be.a('string');
      });
    });

    describe('toInt()', function() {
      it('should return a number', function() {
        expect('15'.toInt()).to.equal(15);
        expect('66px'.toInt()).to.equal(66);
        expect('993.94'.toInt()).to.equal(993);
        expect('foobar'.toInt()).to.be.nan;
      });
    });

    describe('toFloat()', function() {
      it('should return a float', function() {
        expect('15'.toFloat()).to.equal(15);
        expect('13.37'.toFloat()).to.equal(13.37);
        expect('666.392px'.toFloat()).to.equal(666.392);
        expect('foobar'.toFloat()).to.be.nan;
      });
    });
  });

  describe('Number', function() {
    it('should inherit Math methods', function() {
      var functions = {
        abs: { test: [-1], title: 'absolute' },
        acos: { test: [0], title: 'arc cosine' },
        asin: { test: [0.5], title: 'arc sine' },
        atan: { test: [0.5], title: 'arc tangent' },
        atan2: { test: [0.1, 0.5], title: 'arc tangent' },
        ceil: { test: [0.6], title: 'number closest to and not less than the' },
        cos: { test: [30], title: 'cosine' },
        exp: { test: [2], title: 'exponent' },
        floor: { test: [2.4], title: 'integer closet to and not greater than' },
        log: { test: [2], title: 'log' },
        max: { test: [5, 3], title: 'maximum' },
        min: { test: [-4, 2], title: 'minimum' },
        pow: { test: [2, 2], title: 'power' },
        sin: { test: [0.5], title: 'sine' },
        sqrt: { test: [4], title: 'square root' },
        tan: { test: [0.3], title: 'tangent' }
      };

      Object.forEach(functions, function(value, key) {
        var a = value.test[0],
          b = value.test[1];

        expect(a[key](b)).to.equal(Math[key].apply(null, value.test));
      });
    });

    describe('from()', function() {
      it('should return a number or null', function() {
        expect(Number.from(1)).to.equal(1);
        expect(Number.from('abc')).to.equal(null);
        expect(Number.from(true)).to.equal(null);
        expect(Number.from(['foo'])).to.equal(null);
      });
      it('should return the number representation of a string', function() {
        expect(Number.from('10px')).to.equal(10);
        expect(Number.from('10em')).to.equal(10);
      });
    });

    describe('random()', function() {
      it('should be between two number', function() {
        var rand = Number.random(0, 100);

        expect(rand).to.be.a('number');
        expect(rand).to.be.above(0);
        expect(rand).to.be.below(100);
      });
    });

    describe('limit()', function() {
      it('should limit a number between 2 bounds', function() {
        expect((15).limit(5, 10)).to.equal(10);
        expect((3).limit(5, 10)).to.equal(5);
      });
    })
  });
  
});