/**
 * @copyright   2006-2013, Miles Johnson - http://milesj.me
 * @license     http://opensource.org/licenses/mit-license.php
 * @link        http://milesj.me/code/javascript/joop
 */
(function(){"use strict";function a(a,b){var c="function"==typeof a,d="function"==typeof b;return c?!(d&&(b.$private||a.$protected)):d?!b.$private:!0}function b(a,b,c){return function(){this.$caller=a,this.$super=b;var d=c.apply(this,arguments);return delete this.$caller,delete this.$super,d}}function c(a){var b,c;for(b in a)c=a[b],"object"==typeof c&&"$parent"!==b&&(a[b]="[object Array]"===d.call(c)?[].concat(c):{})}var d=Object.prototype.toString,e=Function.prototype;e.protected=function(){return this.$protected=!0,this},e.private=function(){return this.$private=!0,this},e.memoize=function(){var a=this,b=null;return function(){return b?b:b=a.apply(this,arguments)}},e.deprecate=function(a){var b=this,c=!1;return function(){return!c&&console&&(console.warn("This method is deprecated. "+a+"\n"+new Error(a).stack),c=!0),b.apply(this,arguments)}},e.overload=function(a){var b=this;return function(c,d){if("object"==typeof c)for(var e in c)(!a||c.hasOwnProperty(e))&&b.call(this,e,c[e]);else c&&b.call(this,c,d);return this}},e.extend=function(b,c){return a(this[b],c)&&(this[b]=c),this}.overload(),e.implement=function(b,c){return a(this.prototype[b],c)&&(this.prototype[b]=c),this}.overload();var f=!1,g=function(){};g.implement("parent",function(){if(!this.$caller||!this.$super)throw new Error("The method parent() cannot be called in this context");return this.$super.apply(this,arguments)}.protected()),g.extend("create",function(a,d){function e(){c(this),this.init&&!f&&this.init.apply(this,arguments)}f=!0;var g=new this,h=new this;f=!1,g.$namespace&&(a=g.$namespace+"."+a),e.prototype=h,e.prototype.constructor=e;var i,j,k;for(j in d)if(d.hasOwnProperty(j)){if(i=e.prototype[j],k=d[j],i&&"function"==typeof i&&"function"==typeof k){if(i.$protected)continue;k=b(j,i,k)}e.implement(j,k)}return e.implement({$namespace:a,$parent:g}),e.create=this.create,e}),"undefined"!=typeof module&&module.exports?module.exports=g:this.Class=g}).call(this);