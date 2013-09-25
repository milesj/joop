/**
 * @copyright   2006-2013, Miles Johnson - http://milesj.me
 * @license     http://opensource.org/licenses/mit-license.php
 * @link        http://milesj.me/code/javascript/joop
 */

(function() {
  'use strict';

  process.env.NODE_ENV = 'testing';

  var expect = require('chai').expect;

  var Class = require('../src/class');

  var Animal = Class.create('Animal', {
    name: '',
    attributes: {},
    traits: ['Beast'],
    init: function(name) {
      this.name = name || '';
    },
    eat: function() {
      return this.$namespace + ':eat';
    },
    sleep: function() {
      return this.$namespace + ':sleep';
    }.protected(),
    growl: function() {
      return 'growl';
    },
    die: function() {
      return 'oops';
    }.private()
  });

  var Cat = Animal.create('Cat', {
    type: '',
    attributes: {
      nocturnal: true
    },
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

    it('namespace is inherited through the chain', function() {
      expect(new Animal().$namespace).to.equal('Animal');
      expect(new Cat().$namespace).to.equal('Animal.Cat');
      expect(new Lion().$namespace).to.equal('Animal.Cat.Lion');
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

    it('parent references the correct class', function() {
      var c = new Cat(), l = new Lion();

      expect(c.$parent.$namespace).to.equal('Animal');
      expect(l.$parent.$namespace).to.equal('Animal.Cat');
      expect(l.$parent.$parent.$namespace).to.equal('Animal');
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
      expect(b.attributes.nocturnal).to.be.an('undefined');
    });

  });

  describe('Function', function() {

  });

}).call(this);