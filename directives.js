//TODO: Functions that checks the directives
function dirText(text, z){
    text = text.join(" ").replace('\"', "").replace('\"', "");
    if(!isASCII(text)){
        return 3;
    }
    for (var i = 0; i < text.length; i++) {
        memory.push(intToBin(text.charCodeAt(i)).substring(24), false);
    }
    if(z = true){
        //Add leading null
        memory.push("00000000", false);
    }
    return 0;
};
var dirASCIIZ = function(text){
    return dirText(text, true);
};
var dirASCII = function(text){
    return dirText(text, false);
};
var dirSpace = function(arr){
    var n = parseInt(arr[0]);
    if(n === undefined ||n === null) return 0;
    for (var i = 0; i < n; i++) {
        memory.push("00000000", false);
    }
    return 0;
};
var dirByte = function(arr){
    for (var i = 0; i < arr.length; i++) {
        temp = parseInt(arr[i]);
        if(isNaN(temp) || temp === undefined || temp === null) return 1;
        if(temp < MIN_BYTE || temp > MAX_BYTE){ return 1; }
        memory.push(intToBin(temp).substring(24), false);
    }
    return 0;
};
var dirHalf = function(arr){
    for (var i = 0; i < arr.length; i++) {
        temp = parseInt(arr[i]);
        if(isNaN(temp) || temp === undefined || temp === null) return 1;
        if(temp < MIN_16BIT || temp > MAX_16BIT){ return 1; }
        memory.push(intToBin(temp).substring(16), false);
    }
    return 0;
};
var dirWord = function(arr){
    for (var i = 0; i < arr.length; i++) {
        temp = parseInt(arr[i]);
        if(isNaN(temp) || temp === undefined || temp === null) return 1;
        if(temp < MIN_SINT || temp > MAX_SINT){ return 1; }
        memory.push(intToBin(temp), false);
    }
    return 0;
};

const directives = {
    ".asciiz": dirASCIIZ,
    ".ascii": dirASCII,
    ".byte": dirByte,
    ".space": dirSpace,
    ".half": dirHalf,
    ".word": dirWord
    //".float": dirFloat,
    //".double": dirDouble,
};
