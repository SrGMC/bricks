/*
    ALU
 */

//Constants
const MAX_UINT = Math.pow(2, 32) - 1;
const MAX_SINT = Math.pow(2, 31) - 1;
const MIN_UINT = 0;
const MIN_SINT = -Math.pow(2, 31);
const MAX_5BIT = Math.pow(2, 5) - 1;
const MAX_16BIT = Math.pow(2, 15) - 1;
const MIN_16BIT = -Math.pow(2, 15);
const MAX_BYTE = Math.pow(2, 7) - 1;
const MIN_BYTE = -Math.pow(2, 7);

//AND
function and(src1, src2){
    src1 = src1.split("");
    src2 = src2.split("");
    var result = "";
    for (var i = 0; i < 32; i++) {
        result[i] += (src1[i] === "1" && src2[i] === "1") ? 1 : 0;
    }
    return result.join("");
}

//NAND
function nand(src1, src2){
    return not(and(src1, src2));
}

//OR
function or(src1, src2){
    src1 = src1.split("");
    src2 = src2.split("");
    var result = "";
    for (var i = 0; i < src1.length; i++) {
        result[i] = (src1[i] === "0" && src2[i] === "0") ? 0 : 1;
    }
    return result.join("");
}

//NOR
function nor(src1, src2){
    return not(or(src1, src2));
}

//NOT
function not(src){
    src = src.split("");
    for (var i = 0; i < src.length; i++) {
        src[i] = (src[i] === "1") ? "0" : "1";
    }
    return src.join("");
}

//XOR
function xor(src1, src2){
    src1 = src1.split("");
    src2 = src2.split("");
    var result = "";
    for (var i = 0; i < src1.length; i++) {
        result[i] = (src1[i] === src2[i] ) ? 0 : 1;
    }
    return result.join("");
}

//XNOR
function xnor(src1, src2){
    return not(xor(src1, src2));
}

//PADDING
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

//ADITION
function add(src1, src2){
    src1 = src1.split("");
    src2 = src2.split("");
    var result = [];
    var carry = 0;
    for (var i = 31; i >= 0; i--) {
        var aux = parseInt(src1[i]) + parseInt(src2[i]) + carry;
        if(aux % 2 === 0 && aux !== 0){
            result[i] = "0";
            carry = 1;
        } else if (aux % 3 === 0 && aux !== 0){
            result[i] = "1";
            carry = 1;
        } else {
            result[i] = aux + "";
            carry = 0;
        }
    }
    return [result.join(""), carry];
}

//TWO'S COMPLEMENT
function twosComplement(src){
    return add(not(src), pad("1", 32))[0];
}

//SHIFT LEFT
function shiftLeft(src, n){
    var result = src;
    if(n === undefined || n === 1){
        result = result.substring(1) + "0";
    } else {
        for (var i = 0; i < n; i++) {
            result = result.substring(1) + "0";
        }
    }
    return result;
}

//SHIFT RIGHT
function shiftRight(src, n, unsigned){
    var padding = "0";
    var result = src;
    if(unsigned === undefined || unsigned === true){
        padding = "0";
    } else if(!unsigned){
        if(string.indexOf("1") === 0){
            padding = "1";
        }
    }

    if(n === undefined || n === 1){
        result = padding + result.substring(0, 31);
    } else {
        for (var i = 0; i < n; i++) {
            result = padding + result.substring(0, 31);
        }
    }
    return result;
}

//ROTATE LEFT
function rotateLeft(src, n){
    var result = src;
    if(n === undefined || n === 1){
        result = result.substring(1) + result.substring(0, 1);
    } else {
        for (var i = 0; i <= n; i++) {
            result = result.substring(1) + result.substring(0, 1);
        }
    }
    return result;
}

//ROTATE RIGHT
function rotateRight(src, n){
    var result = src;

    if(n === undefined || n === 1){
        result = result.substring(31) + result.substring(0, 31);
    } else {
        for (var i = 0; i < n; i++) {
            result = result.substring(31) + result.substring(0, 31);
        }
    }
    return result;
}
