/*
    Decoder
 */

//TODO: Decode instruction
function decode(){
    IR = memory[PC];
    console.log("IR: " + IR);
    PC = intToHex(hexToInt(PC) + 4);

    var run = operations[IR[0]].run;

    var status = run(IR);

    return status;
}

var beq = function(params){
    var cop = params[0];
    var r1 = binToInt(register[getRegisterId(params[1])]);
    var r2 = binToInt(register[getRegisterId(params[2])]);
    var dir = params[3];

    if(isHex(dir)){
        dir = dir.replace("0x", "");
    } else {
        dir = getTextLabelDir(dir);
    }

    if(r1 === r2){
        PC = dir;
    }
    return true;
};

var bge = function(params){
    var cop = params[0];
    var r1 = binToInt(register[getRegisterId(params[1])]);
    var r2 = binToInt(register[getRegisterId(params[2])]);
    var dir = params[3];
    if(isHex(dir)){
        dir = dir.replace("0x", "");
    } else {
        dir = getTextLabelDir(dir);
    }

    if(r1 >= r2){
        PC = dir;
    }
    return true;
};

var bgeu = function(params){
    var cop = params[0];
    var r1 = binToInt(register[getRegisterId(params[1])]);
    var r2 = binToInt(register[getRegisterId(params[2])]);
    var dir = params[3];
    if(isHex(dir)){
        dir = dir.replace("0x", "");
    } else {
        dir = getTextLabelDir(dir);
    }

    if(Matg.abs(r1) >= Math.abs(r2)){
        PC = dir;
    }
    return true;
};
