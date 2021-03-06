/**
 * @copyright   2006-2013, Miles Johnson - http://milesj.me
 * @license     http://opensource.org/licenses/mit-license.php
 * @link        http://milesj.me/code/javascript/joop
 */

describe('Element', function() {
  var expect = chai.expect,
      element;

  var inputTypes = {
    button: 'I are button',
    //checkbox: 1,
    //color: 'red',
    //date: null,
    //datetime: null,
    email: 'test@example.com',
    file: 'image.jpg',
    hidden: 'Cant see meee',
    image: 'image.jpg',
    //month: null,
    number: 1337,
    password: 'Its a secret!',
    //radio: null,
    //range: null,
    reset: 'I are reset',
    search: 'A search term',
    submit: 'And me submit',
    //tel: null,
    text: 'Basic text here'
    //time: null,
    //url: null,
    //week: null
  };

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

  describe('html()', function() {
    it('should return all children as text', function() {
      var d1 = document.createElement('div');
          d1.textContent = 'Child element 1';
      var d2 = document.createElement('div');
          d2.textContent = 'Child element 2';

      element.appendChild(d1);
      element.appendChild(document.createTextNode('Text node'));
      element.appendChild(d2);

      expect(element.html()).to.equal('<div>Child element 1</div>Text node<div>Child element 2</div>');
    });

    it('should set and get HTML', function() {
      element.html('foo <span><b>bar</b></span>');

      expect(element.html()).to.equal('foo <span><b>bar</b></span>');
    });

    it('should set HTML strings', function() {
      element.html('Lorem <b>ipsum</b> dolor sit amet');

      expect(element.innerHTML).to.equal('Lorem <b>ipsum</b> dolor sit amet');
    });

    it('should set HTML elements', function() {
      var d1 = document.createElement('div');
      d1.textContent = 'Child element';

      element.html(d1);

      expect(element.innerHTML).to.equal('<div>Child element</div>');
    });

    it('should set an empty string', function() {
      element.innerHTML = 'Lorem <b>ipsum</b> dolor sit amet';
      element.html('');

      expect(element.innerHTML).to.equal('');
    });
  });

  describe('text()', function() {
    it('should return text', function() {
      element.textContent = 'Lorem ipsum';

      expect(element.text()).to.equal('Lorem ipsum');
    });

    it('should not return HTML', function() {
      element.innerHTML = 'Lorem <b>ipsum</b> dolor sit amet';

      expect(element.text()).to.equal('Lorem ipsum dolor sit amet');
    });

    it('should return children text', function() {
      var d1 = document.createElement('div');
          d1.textContent = 'Child text node 1';
      var d2 = document.createElement('div');
          d2.textContent = 'Child text node 2';

      element.appendChild(d1);
      element.appendChild(document.createTextNode('Direct text node'));
      element.appendChild(d2);

      expect(element.text()).to.equal('Child text node 1Direct text nodeChild text node 2');
    });

    it('should set text', function() {
      element.text('Lorem ipsum');

      expect(element.text()).to.equal('Lorem ipsum');
    });

    it('should set strings', function() {
      element.textContent = 'Lorem ipsum';
      element.text('Dolor sit amet');

      expect(element.textContent).to.equal('Dolor sit amet');
    });

    it('should set text nodes', function() {
      element.textContent = 'Lorem ipsum';
      element.text(document.createTextNode('Dolor sit amet'));

      expect(element.textContent).to.equal('Dolor sit amet');
    });

    it('should set HTML as text', function() {
      element.textContent = 'Lorem ipsum';
      element.text('Dolor <b>sit</b> amet');

      expect(element.textContent).to.equal('Dolor <b>sit</b> amet');
    });

    it('should set an empty string', function() {
      element.textContent = 'Lorem ipsum';
      element.text('');

      expect(element.textContent).to.equal('');
    });
  });

  describe('getVal()', function() {
    for (var key in inputTypes) {
      it('should return input "' + key + '" value', function() {
        var input = document.createElement('input');
            input.setAttribute('type', key);
            input.setAttribute('name', key);
            input.value = inputTypes[key];

        element.appendChild(input);

        expect(input.getVal()).to.equal(inputTypes[key]);
      });
    }

    /*it('should return input "checkbox" value (single)', function() {
      var input = document.createElement('input');
          input.setAttribute('type', 'checkbox');
          input.setAttribute('name', 'checkbox');

      expect(input.getVal()).to.equal(false);
    });*/

    it('should return textarea value', function() {
      var input = document.createElement('textarea');
          input.value = 'This is a big textarea';

      element.appendChild(input);

      expect(input.getVal()).to.equal('This is a big textarea');
    });

    it('should return select value', function() {
      var input = document.createElement('select');
          input.innerHTML = '<option value="0">Zero</option><option value="1" selected>One</option><option value="2">Two</option>';

      element.appendChild(input);

      expect(input.getVal()).to.equal('1');

      input.selectedIndex = 0;

      expect(input.getVal()).to.equal('0');

      input.selectedIndex = 2;

      expect(input.getVal()).to.equal('2');
    });

    it('should return select value (optgroup)', function() {
      var input = document.createElement('select');

      var og1 = document.createElement('optgroup');
          og1.setAttribute('label', 'DC');

      var o1 = document.createElement('option');
          o1.setAttribute('value', 'batman');
          o1.textContent = 'Batman';

      var o2 = document.createElement('option');
          o2.setAttribute('value', 'superman');
          o2.textContent = 'Superman';

      og1.appendChild(o1);
      og1.appendChild(o2);

      var og2 = document.createElement('optgroup');
          og2.setAttribute('label', 'Marvel');

      var o3 = document.createElement('option');
          o3.setAttribute('value', 'spiderman');
          o3.textContent = 'Spiderman';

      var o4 = document.createElement('option');
          o4.setAttribute('value', 'ironman');
          o4.textContent = 'Ironman';

      og2.appendChild(o3);
      og2.appendChild(o4);
      input.appendChild(og1);
      input.appendChild(og2);
      element.appendChild(input);

      expect(input.getVal()).to.equal('batman');

      input.selectedIndex = 3;

      expect(input.getVal()).to.equal('ironman');

      input.selectedIndex = 1;

      expect(input.getVal()).to.equal('superman');
    });

    it('should return select values (multiple) and not disabled', function() {
      var input = document.createElement('select');
          input.setAttribute('multiple', 'multiple');
          input.innerHTML = '<option value="0">Zero</option><option value="1" selected>One</option><option value="2" selected>Two</option>';

      element.appendChild(input);

      expect(input.getVal()).to.deep.equal(['1', '2']);

      input[0].selected = true;

      expect(input.getVal()).to.deep.equal(['0', '1', '2']);

      input[2].disabled = true;

      expect(input.getVal()).to.deep.equal(['0', '1']);
    });

    it('should return select values (multiple optgroup) and not disabled', function() {
      var input = document.createElement('select');
          input.setAttribute('multiple', 'multiple');

      var og1 = document.createElement('optgroup');
          og1.setAttribute('label', 'DC');

      var o1 = document.createElement('option');
          o1.setAttribute('value', 'batman');
          o1.textContent = 'Batman';

      var o2 = document.createElement('option');
          o2.setAttribute('value', 'superman');
          o2.textContent = 'Superman';

      og1.appendChild(o1);
      og1.appendChild(o2);

      var og2 = document.createElement('optgroup');
          og2.setAttribute('label', 'Marvel');

      var o3 = document.createElement('option');
          o3.setAttribute('value', 'spiderman');
          o3.textContent = 'Spiderman';

      var o4 = document.createElement('option');
          o4.setAttribute('value', 'ironman');
          o4.textContent = 'Ironman';

      og2.appendChild(o3);
      og2.appendChild(o4);
      input.appendChild(og1);
      input.appendChild(og2);
      element.appendChild(input);

      expect(input.getVal()).to.deep.equal([]);

      input[0].selected = true;
      input[2].selected = true;

      expect(input.getVal()).to.deep.equal(['batman', 'spiderman']);

      og2.disabled = true;

      expect(input.getVal()).to.deep.equal(['batman']);
    });
  });

  describe('hide()', function() {
    it('should hide element', function() {
      element.hide();
      expect(element.css('display')).to.equal('none');
    });
  });

  describe('show()', function() {
    it('should show element', function() {
      element.show();
      expect(element.css('display')).to.equal(null);
    });
  });

  describe('toggle()', function() {
    it('should toggle display of element', function() {
      element.toggle();
      expect(element.css('display')).to.equal('none');

      element.toggle();
      expect(element.css('display')).to.equal(null);
    });
  });

  describe('css()', function() {
    it('should get and set styles', function() {
      element.css('display', 'block').css({
        float: 'none',
        position: 'static',
        width: function(value) {
          return 100 * 3;
        }
      });

      expect(element.css('display')).to.equal('block');
      expect(element.css(['float', 'position', 'width'])).to.deep.equal({
        float: 'none',
        position: 'static',
        width: '300px'
      });
    });

    it('should set and remove styles', function() {
      element.css('float', 'left');
      expect(element.css('float')).to.equal('left');

      element.css('float', null);
      expect(element.css('float')).to.equal(null);
    });
  });

  describe('getStyle()', function() {
    it('should return a style in any format', function() {
      element.style.border = '10px solid black';
      element.style.cssFloat = 'left';
      element.style.display = 'none';
      element.style.font = 'bold 12px/115% Arial, Tahoma, sans-serif';

      expect(element.getStyle('float')).to.equal('left'); // uses cssFloat
      expect(element.getStyle('font-size')).to.equal('12px'); // convert to camel
      expect(element.getStyle('border-width')).to.equal('10px'); // convert to camel
      expect(element.getStyle('fontFamily')).to.equal('Arial,Tahoma,sans-serif');
    });

    it('should return multiple styles', function() {
      element.style.border = '10px solid black';

      expect(element.getStyle(['border-width', 'border-style'])).to.deep.equal({
        'border-width': '10px',
        'border-style': 'solid'
      });
    });

    it('should return hooks', function() {
      element.style.margin = '3px 2px 1px';

      expect(element.getStyle('margin')).to.deep.equal({
        'margin-top': '3px',
        'margin-right': '2px',
        'margin-bottom': '1px',
        'margin-left': '2px'
      });

      element.style.padding = '4px';

      expect(element.getStyle('padding')).to.deep.equal({
        'padding-top': '4px',
        'padding-right': '4px',
        'padding-bottom': '4px',
        'padding-left': '4px'
      });
    });

    it('should return vendor prefixed styles', function() {
      element.style.MozBoxSizing = 'content-box';
      element.style.WebkitBoxSizing = 'content-box';
      element.style.OBoxSizing = 'content-box';
      element.style.msBoxSizing = 'content-box';

      expect(element.getStyle('box-sizing')).to.equal('content-box');
    });

    it('should always return a value for opacity', function() {
      expect(element.getStyle('opacity')).to.equal('1');

      element.style.opacity = 0;
      expect(element.getStyle('opacity')).to.equal('0');

      element.style.opacity = 0.3;
      expect(element.getStyle('opacity')).to.equal('0.3');
    });
  });

  describe('setStyle()', function() {
    it('should set a style', function() {
      element.setStyle('display', 'inline');

      expect(element.getStyle('display')).to.equal('inline');
    });

    it('should set multiple styles', function() {
      element.setStyle({
        backgroundPosition: '50% 50%',
        float: 'right',
        padding: '10px',
        'border-style': 'dashed'
      });

      expect(element.getStyle(['background-position', 'float', 'padding', 'border-style'])).to.deep.equal({
        'background-position': '50% 50%',
        'float': 'right',
        'padding': { // via hook
          'padding-top': '10px',
          'padding-right': '10px',
          'padding-bottom': '10px',
          'padding-left': '10px'
        },
        'border-style': 'dashed'
      });
    });

    it('should not set nulls or empty', function() {
      element.setStyle('float', 'right');
      element.setStyle('float', null);

      expect(element.getStyle('float')).to.equal('right');
    });

    it('should auto-pixel numbers or exclude protected', function() {
      element.setStyle({
        width: 125,
        height: '250px',
        opacity: 0.6,
        'z-index': 6
      });

      expect(element.getStyle(['width', 'height', 'opacity', 'z-index'])).to.deep.equal({
        width: '125px',
        height: '250px',
        opacity: '0.6',
        'z-index': '6'
      });
    });

    it('should resolve function values', function() {
      element.setStyle('width', 125);

      expect(element.getStyle('width')).to.equal('125px');

      // Don't set empty returns
      element.setStyle('width', function(value) {
        return null;
      });

      expect(element.getStyle('width')).to.equal('125px');

      element.setStyle('width', function(value) {
        return value.toInt() * 2;
      });

      expect(element.getStyle('width')).to.equal('250px');
    });

    it('should apply relative values with += and -=', function() {
      element.setStyle('width', '+=125');

      expect(element.getStyle('width')).to.equal('125px');

      element.setStyle('width', '+=250.50');

      expect(element.getStyle('width')).to.equal('375.5px');

      element.setStyle('width', '-=66.25');

      expect(element.getStyle('width')).to.equal('309.25px');

      element.setStyle('width', '-=foo');

      expect(element.getStyle('width')).to.equal('309.25px');
    });
  });

  describe('removeStyle()', function() {
    it('should remove a style', function() {
      element.style.width = '100px';
      element.removeStyle('width');

      expect(element.getStyle('width')).to.equal(null);
    });

    it('should remove a vendor style', function() {
      element.style.MozAnimationName = 'foobar';
      element.removeStyle('animation-name');

      expect(element.getStyle('animation-name')).to.equal(null);
    });

    it('should remove multiple styles', function() {
      element.style.width = '100px';
      element.style.height = '100px';
      element.removeStyle(['width', 'height']);

      expect(element.getStyle(['width', 'height'])).to.deep.equal({
        width: null,
        height: null
      });
    });
  });

  describe('addClass()', function() {
    it('should add class', function() {
      element.addClass('baz');

      expect(element.className).to.equal('foo bar baz');
    });

    it('should add multiple classes', function() {
      element.addClass('baz box');

      expect(element.className).to.equal('foo bar baz box');
    });

    it('should add multiple classes via array', function() {
      element.addClass(['baz', 'box']);

      expect(element.className).to.equal('foo bar baz box');
    });

    it('should not add class twice', function() {
      element.addClass('bar');

      expect(element.className).to.equal('foo bar');
    });
  });

  describe('removeClass()', function() {
    it('should remove class', function() {
      element.removeClass('bar');

      expect(element.className).to.equal('foo');
    });

    it('should remove multiple classes', function() {
      element.removeClass('foo bar');

      expect(element.className).to.equal('');
    });

    it('should removeClass multiple classes via array', function() {
      element.removeClass(['foo', 'bar']);

      expect(element.className).to.equal('');
    });
  });

  describe('hasClass()', function() {
    it('should check for classes', function() {
      expect(element.hasClass('foo')).to.be.true;
      expect(element.hasClass('baz')).to.be.false;
    });

    it('should return true if all classes exist', function() {
      expect(element.hasClass('foo bar')).to.be.true;
      expect(element.hasClass(['foo', 'bar'])).to.be.true;
      expect(element.hasClass(['foo', 'bar', 'baz'])).to.be.false;
    });
  });

  describe('swapClass()', function() {
    it('should replace one class with another', function() {
      element.swapClass('bar', 'baz');

      expect(element.className).to.equal('foo baz');

      element.swapClass('baz', 'baz');

      expect(element.className).to.equal('foo baz');

      element.swapClass('unknown', 'known');

      expect(element.className).to.equal('foo baz known');
    })
  });

  describe('toggleClass()', function() {
    it('should toggle a class on and off', function() {
      element.toggleClass('foo');

      expect(element.className).to.equal('bar');

      element.toggleClass('foo');

      expect(element.className).to.equal('bar foo');
    });
  });

  describe('innerHeight()', function() {
    it('should return height', function() {
      element.style.height = '666px';
      element.style.MozBoxSizing = 'content-box'; // TODO use non-mozilla

      expect(element.innerHeight()).to.equal(666);

      element.style.MozBoxSizing = 'border-box';

      expect(element.innerHeight()).to.equal(666);
    });
  });

  describe('height()', function() {
    it('should return height + padding + border', function() {
      element.style.height = '100px';
      element.style.padding = '15px';
      element.style.border = '5px solid black';
      element.style.MozBoxSizing = 'content-box'; // TODO use non-mozilla

      expect(element.height()).to.equal(140);

      element.style.MozBoxSizing = 'border-box';

      expect(element.height()).to.equal(140);
    });
  });

  describe('outerHeight()', function() {
    it('should return height + padding + border + margin', function() {
      element.style.height = '160px';
      element.style.padding = '6px';
      element.style.margin = '4px';
      element.style.border = '5px solid black';
      element.style.MozBoxSizing = 'content-box'; // TODO use non-mozilla

      expect(element.outerHeight()).to.equal(190);

      element.style.MozBoxSizing = 'border-box';

      expect(element.outerHeight()).to.equal(190);
    });
  });

  describe('innerWidth()', function() {
    it('should return width', function() {
      element.style.width = '666px';
      element.style.MozBoxSizing = 'content-box'; // TODO use non-mozilla

      expect(element.innerWidth()).to.equal(666);

      element.style.MozBoxSizing = 'border-box';

      expect(element.innerWidth()).to.equal(666);
    });
  });

  describe('width()', function() {
    it('should return width + padding + border', function() {
      element.style.width = '100px';
      element.style.padding = '15px';
      element.style.border = '5px solid black';
      element.style.MozBoxSizing = 'content-box'; // TODO use non-mozilla

      expect(element.width()).to.equal(140);

      element.style.MozBoxSizing = 'border-box';

      expect(element.width()).to.equal(140);
    });
  });

  describe('outerWidth()', function() {
    it('should return width + padding + border + margin', function() {
      element.style.width = '160px';
      element.style.padding = '6px';
      element.style.margin = '4px';
      element.style.border = '5px solid black';
      element.style.MozBoxSizing = 'content-box'; // TODO use non-mozilla

      expect(element.outerWidth()).to.equal(190);

      element.style.MozBoxSizing = 'border-box';

      expect(element.outerWidth()).to.equal(190);
    });
  });

  describe('dimensions()', function() {
    it('should return the default, inner or outer sizes', function() {
      element.style.width = '233px';
      element.style.height = '732px';
      element.style.padding = '11px';
      element.style.margin = '8px';
      element.style.border = '3px solid black';
      element.style.MozBoxSizing = 'content-box'; // TODO use non-mozilla

      expect(element.dimensions()).to.deep.equal({
        width: 261,
        height: 760
      });

      expect(element.dimensions('inner')).to.deep.equal({
        width: 233,
        height: 732
      });

      expect(element.dimensions('outer')).to.deep.equal({
        width: 277,
        height: 776
      });

      element.style.MozBoxSizing = 'border-box';

      expect(element.dimensions()).to.deep.equal({
        width: 261,
        height: 760
      });

      expect(element.dimensions('inner')).to.deep.equal({
        width: 233,
        height: 732
      });

      expect(element.dimensions('outer')).to.deep.equal({
        width: 277,
        height: 776
      });
    });
  });

});