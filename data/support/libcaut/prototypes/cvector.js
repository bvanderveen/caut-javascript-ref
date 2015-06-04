'use strict';

define(['./ctype', '../cast'], function(ctype, cast) {

var exports = {};

function CVector(elements) {
  if (elements.length > CVector.elemMaxLength) {
    throw new Error("Unexpected number of elements. Expected less than " + this.constructor.elemMaxLength.toString() +
                    " but got " + elements.length.toString());
  }

  this.elements = elements;
}
CVector.prototype = Object.create(ctype.CType.prototype);
CVector.prototype.cautproto = 'vector';
CVector.prototype.pack = function (cautBuffer) {
  var sum = cast.intToBytes(cautBuffer, this.elements.length, this.constructor.lengthWidth);

  var i;
  for (i = 0; i < this.elements.length; i++) {
    sum += this.elements[i].pack(cautBuffer);
  }

  return sum;
};
CVector.prototype.toJS = function () {
  var jsElems = [];

  var i;
  for (i = 0; i < this.elements.length; i++) {
    jsElems.push(this.elements[i].toJS());
  }

  return jsElems;
};
exports.CVector = CVector;

function unpack(vectorCtor, cautBuffer) {
  var elemLength = cast.bytesToInt(cautBuffer, vectorCtor.lengthWidth);

  if (elemLength > vectorCtor.elemMaxLength) {
    throw new Error("Unexpected vector length: " + elemLength.toString());
  }

  var i, elems = [];

  for (i = 0; i < elemLength; i++) {
    elems.push(vectorCtor.elemType.unpack(cautBuffer));
  }

  return new vectorCtor(elems);
}

function mkVector(f, typename, elemType, elemMaxLength, lengthWidth, hash, size) {
  ctype.mkCType(f, typename, 'vector', hash, size);
  f.elemType = elemType;
  f.elemMaxLength = elemMaxLength;
  f.lengthWidth = lengthWidth;

  f.prototype = Object.create(CVector.prototype);
  f.prototype.constructor = f;

  f.unpack = function (cautBuffer) {
    return unpack(f, cautBuffer);
  };
}
exports.mkVector = mkVector;

return exports; 

});