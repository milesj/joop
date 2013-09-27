/**
 * @copyright   2006-2013, Miles Johnson - http://milesj.me
 * @license     http://opensource.org/licenses/mit-license.php
 * @link        http://milesj.me/code/javascript/joop
 */

describe('Element', function() {
  var expect = chai.expect,
      element;

  beforeEach(function() {
    element = document.createElement('div');
    element.id = 'test-id';
    element.className = 'foo bar';
    element.setAttribute('data-id', 12345);
  });

  describe('attr()', function() {
    it('should get values', function() {
      expect(element.attr('id')).to.equal('test-id');
      expect(element.attr('href')).to.equal(null);
      expect(element.attr(['id', 'class'])).to.deep.equal({
        id: 'test-id',
        'class': 'foo bar'
      });
    });

    it('should set values', function() {
      element
        .attr('id', 'new-id')
        .attr({
          title: 'Joop!',
          'data-type': 'div'
        })
        .attr('class', function(old) {
          return old + ' baz';
        });

      expect(element.attr(['id', 'title', 'data-type', 'class'])).to.deep.equal({
        id: 'new-id',
        title: 'Joop!',
        'data-type': 'div',
        'class': 'foo bar baz'
      });
    });

    it('should remove values', function() {
      element.attr('id', null);

      expect(element.attr('id')).to.equal(null);
    });
  });

  describe('getAttr()', function() {
    it('should return a value or null if not found', function() {
      expect(element.getAttr('id')).to.equal('test-id');
      expect(element.getAttr('href')).to.equal(null);
    });

    it('should return multiple values', function() {
      expect(element.getAttr(['id', 'class'])).to.deep.equal({
        id: 'test-id',
        'class': 'foo bar'
      });
    });
  });

  describe('setAttr()', function() {
    it('should add or set a value', function() {
      expect(element.getAttr(['id', 'title'])).to.deep.equal({
        id: 'test-id',
        title: null
      });

      element.setAttr('id', 'new-id').setAttr('title', 'Joop');

      expect(element.getAttr(['id', 'title'])).to.deep.equal({
        id: 'new-id',
        title: 'Joop'
      });
    });

    it('should set multiple values', function() {
      element.setAttr({
        id: 'new-id',
        title: 'Joop'
      });

      expect(element.getAttr(['id', 'title'])).to.deep.equal({
        id: 'new-id',
        title: 'Joop'
      });
    });

    it('should resolve function values', function() {
      element.setAttr('id', function(old) {
        return old + '-append';
      });

      expect(element.getAttr('id')).to.equal('test-id-append');
    });
  });

  describe('removeAttr()', function() {
    it('should remove a single attribute', function() {
      element.removeAttr('id');

      expect(element.getAttr('id')).to.equal(null);
    });

    it('should remove multiple attributes', function() {
      element.removeAttr(['class', 'data-id']);

      expect(element.getAttr(['id', 'class', 'data-id'])).to.deep.equal({
        id: 'test-id',
        'class': null,
        'data-id': null
      });
    });
  });

  describe('prop()', function() {
    it('should get values', function() {
      expect(element.prop('hidden')).to.be.false;
      expect(element.prop('tag')).to.equal('div');
      expect(element.prop(['nodeType', 'nodeName'])).to.deep.equal({
        nodeType: 1,
        nodeName: 'DIV'
      });
    });

    it('should set values', function() {
      element
        .prop('foo', 'bar')
        .prop({
          checked: true,
          hidden: true
        })
        .prop('foo', function(old) {
          return old + '-baz';
        });

      expect(element.prop(['foo', 'checked', 'hidden'])).to.deep.equal({
        foo: 'bar-baz',
        checked: true,
        hidden: true
      });
    });

    it('should remove values', function() {
      element.prop('foo', 'bar').prop('foo', null);

      expect(element.prop('foo')).to.equal(null);
    });
  });

  describe('getProp()', function() {
    it('should return a value or null if not found', function() {
      expect(element.getProp('nodeType')).to.equal(1);
      expect(element.getProp('nodeFake')).to.equal(null);
    });

    it('should return multiple values', function() {
      expect(element.getProp(['nodeType', 'nodeName'])).to.deep.equal({
        nodeType: 1,
        nodeName: 'DIV'
      });
    });

    it('should return hooks', function() {
      expect(element.getProp('tag')).to.equal('div');
    });
  });

  describe('setProp()', function() {
    var input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = false;
        input.name = 'cb';

    it('should set a single value', function() {
      input.setProp('checked', true);

      expect(input.getProp('checked')).to.be.true;
    });

    it('should set multiple values', function() {
      input.setProp({
        checked: false,
        hidden: true
      });

      expect(input.getProp(['checked', 'hidden'])).to.deep.equal({
        checked: false,
        hidden: true
      });
    });

    it('should resolve function values', function() {
      element.setProp('foo', 'bar');
      element.setProp('foo', function(old) {
        return old + '-baz';
      });

      expect(element.getProp('foo')).to.equal('bar-baz');
    });

    it('should handle boolean props', function() {
      element.setProp('checked', false);
      expect(element.checked).to.be.false;

      element.setProp('checked', true);
      expect(element.checked).to.be.true;

      element.setProp('checked', 'checked');
      expect(element.checked).to.be.true;

      element.setProp('checked', '');
      expect(element.checked).to.be.false;
    });
  });

  describe('removeProp()', function() {
    it('should remove a single prop', function() {
      element.setProp('foo', 'bar');
      element.removeProp('foo');

      expect(element.getProp('foo')).to.equal(null);
    });

    it('should remove multiple props', function() {
      element.setProp({
        foo: 'bar',
        joop: true
      }); // add fakes

      expect(element.getProp('foo')).to.equal('bar');

      element.removeProp(['foo', 'joop']);

      expect(element.getProp(['foo', 'joop'])).to.deep.equal({
        foo: null,
        joop: null
      });
    });

    it('should not remove protected props', function() {
      element.removeProp('id');

      expect(element.getProp('id')).to.equal('test-id');
    });
  });
});