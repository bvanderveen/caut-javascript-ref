var assert = require('assert');

/*globals ArrayBuffer, Uint8Array */
var bi = require('./libcaut/prototypes/cbuiltin.js');
var syn = require('./libcaut/prototypes/csynonym.js');
var arr = require('./libcaut/prototypes/carray.js');
var cb = require('./libcaut/buffer.js');

var data = new ArrayBuffer(8);
var view = new Uint8Array(data);
var i; for (i = 0; i < data.byteLength; i++) {
  view[i] = i + 10;
}

/**
 * Can we define a U8?
 */
function U8(buffer) { bi.CBuiltIn.call(this, buffer); }
bi.mkU8(U8, [1,2,3], {min: 1, max: 1});

(function () {
  /* Test we can define a U8. */
  var u8 = new U8(data);
  assert.equal(10, u8.toJS());

  var buffer = new cb.CautBuffer();
  u8.pack(buffer);
  assert.equal(1, buffer.allData().byteLength);
  assert.equal(10, buffer.allData()[0]);

  assert.equal(10, U8.unpack(buffer).toJS());
}());

/**
 * Can we define a U32?
 */
function U32(buffer) { bi.CBuiltIn.call(this, buffer); }
bi.mkU32(U32, [1,2,3], {min: 4, max: 4});

(function () {
  /* Test we can define a U32. */
  var u32 = new U32(data);
  assert.equal(218893066, u32.toJS());

  var buffer = new cb.CautBuffer();
  u32.pack(buffer);
  var ad = buffer.allData();
  assert.equal(4, ad.byteLength);
  assert.equal(10, ad[0]);
  assert.equal(11, ad[1]);
  assert.equal(12, ad[2]);
  assert.equal(13, ad[3]);

  assert.equal(218893066, U32.unpack(buffer).toJS());
}());

/**
 * Can we define a synonym?
 */
function AnU32(value) { syn.CSynonym.call(this, value); }
syn.mkSyn(AnU32, 'an_u8', U32, [1,2,3], {min:4, max:4});

(function () {
  /* Test we can define a Synonym */
  var anu32 = new AnU32(new U32(data));
  assert.equal(218893066, anu32.toJS());

  var buffer = new cb.CautBuffer();
  anu32.pack(buffer);
  var ad = buffer.allData();
  assert.equal(4, ad.byteLength);
  assert.equal(10, ad[0]);
  assert.equal(11, ad[1]);
  assert.equal(12, ad[2]);
  assert.equal(13, ad[3]);

  assert.equal(218893066, AnU32.unpack(buffer).toJS());
}());

/**
 * Can we define an array?
 */
function ArrU8(elems) { arr.CArray.call(this, elems); }
arr.mkArray(ArrU8, 'arr_u8', U8, 5, [1,2,3], {min: 5, max: 5});

(function () {
  var buffer = new cb.CautBuffer();
  buffer.addU8Array(view);

  var arru8 = ArrU8.unpack(buffer);
  var js = arru8.toJS();
  assert.equal(10, js[0]);
  assert.equal(11, js[1]);
  assert.equal(12, js[2]);
  assert.equal(13, js[3]);
  assert.equal(14, js[4]);

  var pb = new cb.CautBuffer();
  arru8.pack(pb);

  var ad = pb.allData();
  assert.equal(5, ad.length);
  assert.equal(10, ad[0]);
  assert.equal(11, ad[1]);
  assert.equal(12, ad[2]);
  assert.equal(13, ad[3]);
  assert.equal(14, ad[4]);
}());