'use strict';

define(['./ctype', '../cast'], function(ctype, cast) {
var exports = {};

function CUnion(field) {
  this.field = field;
}
CUnion.prototype = Object.create(ctype.CType.prototype);
CUnion.prototype.cautproto = 'union';
CUnion.prototype.pack = function (cautBuffer) {
  var fieldIx, tfield, cfield, sum;

  for (fieldIx = 0; fieldIx < this.constructor.fields.length; fieldIx++) {
    cfield = this.constructor.fields[fieldIx];
    tfield = this.field[cfield.name];

    if (tfield !== undefined) {
      sum = cast.intToBytes(cautBuffer, cfield.index, this.constructor.tagWidth);
      if (tfield !== null) {
       sum += tfield.pack(cautBuffer);
      }
      return sum;
    }
  }

  throw new Error("No valid field in union.");
};
CUnion.prototype.toJS = function () {
  var name, obj = {};
  for (name in this.field) {
    if (this.field.hasOwnProperty(name)) {
      obj[name] = this.field[name].toJS();
      return obj;
    }
  }

  throw new Error("No valid field in union.");
};
exports.CUnion = CUnion;

function unpack(unionCtor, cautBuffer) {
  var fieldIx, cfield;
  var tag = cast.bytesToInt(cautBuffer, unionCtor.tagWidth);
  var obj = {};

  for (fieldIx = 0; fieldIx < unionCtor.fields.length; fieldIx++) {
    cfield = unionCtor.fields[fieldIx];
    if (tag === cfield.index) {
      if (undefined !== cfield.ref) {
        obj[cfield.name] = cfield.ref.unpack(cautBuffer);
      } else {
        obj[cfield.name] = null;
      }
      return new unionCtor(obj);
    }
  }

  throw new Error("Invalid union tag: " + tag.toString());
}

function mkUnion(f, typename, fields, tagWidth, hash, size) {
  ctype.mkCType(f, typename, 'union', hash, size);
  f.fields = fields;
  f.tagWidth = tagWidth;

  f.prototype = Object.create(CUnion.prototype);
  f.prototype.constructor = f;

  f.unpack = function (cautBuffer) {
    return unpack(f, cautBuffer);
  };
}
exports.mkUnion = mkUnion;

return exports;

});