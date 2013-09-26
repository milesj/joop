/**
 * @copyright   2006-2013, Miles Johnson - http://milesj.me
 * @license     http://opensource.org/licenses/mit-license.php
 * @link        http://milesj.me/code/javascript/joop
 */

describe('Class', function() {
  var expect = chai.expect;

  // Setup test classes
  var Animal = Class.create('Animal', {
    name: '',
    attributes: {},
    traits: ['Beast'],
    init: function(name) {
      this.name = name || '';
    },
    eat: function() {
      return this.className() + ':eat';
    },
    sleep: function() {
      return this.className() + ':sleep';
    }.protect(),
    growl: function() {
      return 'growl';
    },
    die: function() {
      return 'oops';
    }.private(),
    factory: function() {
      return new Animal();
    }.static()
  });

  var Dog = Animal.create('Dog', {
    factory: function() {
      return new Dog();
    }.static()
  });

  var Cat = Animal.create('Cat', {
    type: '',
    attributes: {
      nocturnal: true
    },
    mom: null,
    dad: null,
    init: function(name, type) {
      this.parent(name);
      this.type = type || '';
    },
    growl: function() {
      return 'meow';
    },
    sleep: function() {
      return 'zzz';
    }
  });

  var Lion = Cat.create('Lion', {
    growl: function() {
      return this.parent() + ':roar';
    },
    hunt: function() {
      return 'hunt';
    }.private()
  });

  describe('Class', function() {

    it('class name is defined', function() {
      expect(new Animal().$class).to.equal('Animal');
      expect(new Cat().$class).to.equal('Cat');
      expect(new Lion().$class).to.equal('Lion');
    });

    it('namespace is inherited through the chain', function() {
      expect(new Animal().$namespace).to.equal('');
      expect(new Cat().$namespace).to.equal('Animal');
      expect(new Lion().$namespace).to.equal('Animal.Cat');
    });

    it('instanceof comparison checks should work', function() {
      var a = new Animal(), c = new Cat(), l = new Lion();

      expect(a instanceof Class).to.be.true;
      expect(c instanceof Animal).to.be.true;
      expect(c instanceof Cat).to.be.true;
      expect(l instanceof Lion).to.be.true;

      expect(c instanceof Lion).to.be.false;
    });

    it('isPrototypeOf comparison checks should work', function() {
      var a = new Animal(), c = new Cat(), l = new Lion();

      expect(Class.prototype.isPrototypeOf(a)).to.be.true;
      expect(Animal.prototype.isPrototypeOf(c)).to.be.true;
      expect(Cat.prototype.isPrototypeOf(c)).to.be.true;
      expect(Lion.prototype.isPrototypeOf(l)).to.be.true;

      expect(Lion.prototype.isPrototypeOf(c)).to.be.false;
    });

    it('init method should be called on instantiation', function() {
      var l = new Lion('Simba', 'King');

      expect(l.name).to.equal('Simba');
      expect(l.type).to.equal('King');
    });

    it('parent methods should be inherited', function() {
      var c = new Cat(), l = new Lion();

      expect(c.eat()).to.equal('Animal.Cat:eat');
      expect(l.eat()).to.equal('Animal.Cat.Lion:eat');
    });

    it('protected methods should not be overwritten', function() {
      var c = new Cat(), l = new Lion();

      expect(c.sleep()).to.equal('Animal.Cat:sleep');
      expect(l.sleep()).to.equal('Animal.Cat.Lion:sleep');
    });

    it('private methods should not be inherited', function() {
      expect(new Lion().hunt).to.be.an('undefined');
    });

    it('parent calls should execute the previous method', function() {
      expect(new Lion().growl()).to.equal('meow:roar');
    });

    it('multiple instances should not reference each other', function() {
      var a = new Cat('Cinda'), b = new Cat('Quano');

      expect(a.name).to.equal('Cinda');
      expect(b.name).to.equal('Quano');

      a.foo = 'bar';

      expect(a.foo).to.equal('bar');
      expect(b.foo).to.be.an('undefined');

      b.bar = 'foo';

      expect(a.bar).to.be.an('undefined');
      expect(b.bar).to.equal('foo');
    });

    it('inherited arrays and objects should break references', function() {
      var a = new Cat(), b = new Cat();

      a.traits.push('Mammal');

      expect(a.traits).to.deep.equal(['Beast', 'Mammal']);
      expect(b.traits).to.deep.equal(['Beast']);

      a.attributes.nocturnal = false;

      expect(a.attributes.nocturnal).to.be.false;
      expect(b.attributes.nocturnal).to.be.true;
    });

    it('static methods should be inherited', function() {
      expect(Animal.factory()).to.be.instanceof(Animal);
      expect(Cat.factory()).to.be.instanceof(Animal);
    });

    it('static methods should be overwritable', function() {
      expect(Dog.factory()).to.be.instanceof(Animal);
      expect(Dog.factory()).to.be.instanceof(Dog);
    });

  });

  describe('Function', function() {

    it('memoize() should cache the result and return it', function() {
      var cache = function() {
        return Math.random();
      }.memoize();

      var result = cache();

      expect(cache()).to.equal(result);
      expect(cache()).to.equal(result);
      expect(cache()).to.equal(result);
    });

    it('deprecate() should log warnings', function() {
      var func = function() {};

      expect(func.$deprecated).to.be.an('undefined');

      func = func.deprecate('Oops!');

      expect(func.$deprecated).to.equal('Oops!');
    });

    it('hint() should support class interfaces', function() {
      var func = function(int) {
        return;
      }.hint([Cat]);

      expect(function() {
        func(new Cat());
      }).to.not.throw(Error);

      expect(function() {
        func(new Dog());
      }).to.throw(Error);
    });

    it('hint() should support class namespaces', function() {
      var func = function(int) {
        return;
      }.hint(['Animal.Dog']);

      expect(function() {
        func(new Dog());
      }).to.not.throw(Error);

      expect(function() {
        func(new Cat());
      }).to.throw(Error);
    });

    it('hint() should support native types also', function() {
      var func = function(string, number, bool, skip, array, obj, regex) {
        return;
      }.hint(['string', 'number', 'bool', null, 'array', 'object', 'regexp']);

      expect(function() {
        func('foo', 123, true, 'bar', [1], {}, /foo/i);
      }).to.not.throw(Error);

      expect(function() {
        // don't check undefined
        func();
      }).to.not.throw(Error);

      expect(function() {
        // allow nulls to be used
        func('bar', null, false, 'uncheckedValue', 'notArray');
      }).to.throw(Error);
    });

    it('static() should be available statically', function() {
      var a = new Animal();

      expect(Animal.factory).to.be.an('function');
      expect(Animal.prototype.factory).to.be.an('undefined');
      expect(a.factory).to.be.an('undefined');
    });

  });

});