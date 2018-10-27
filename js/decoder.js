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
    var o = 1;
    var r1 = getRegisterId(params[o+0]);
    var r2 = getRegisterId(params[o+1]);
    if(!labelTextExists(params[o+2])){
        return false;
    }
    var dir;
    if(isHex(params[o+2])){
        dir = params[o+2].replace("0x", "");
    } else {
        dir = getLabelDir(params[o+2]);
    }

    if(register[r1] === register[r2]){
        PC = dir;
    }
    return true;
};
