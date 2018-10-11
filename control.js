/*
    Decoder
 */

//Constants
const MAX_5BIT = Math.pow(2, 5) - 1;
const MAX_16BIT = Math.pow(2, 15) - 1;
const MIN_16BIT = -Math.pow(2, 15);

// Instruction groups
var groups = [
        //G1 : ins rs1 rs2 etiq
    ["beq", "bge", "bgeu", "bgt", "bgtu", "ble", "bleu", "blt", "bltu", "bne"],
        //G2 : ins rd rs1 inm16
    ["addi", "addiu", "ori", "xori", "andi", "slti", "sltui"],
        //G3 : ins rd rs1 rs2
    ["sllv", "srav", "srlv", "rem", "remu", "add", "addu", "sub", "subu", "or", "xor", "and", "nor", "div", "divu", "mul", "mulo", "mulou", "rol", "ror", "seq", "sge", "sgeu", "sgt", "sgtu", "sle", "sleu", "slt", "sltu", "sne"],
        //G4 : ins rd rs1 inm5
    ["sll", "sra", "srl"],
        //G5 : ins rd/f dir
    ["la", "lb", "lbu", "lh", "lhu", "lw", "sb", "sh", "sw"],
        //G6 : ins rs etiq
    ["beqz", "bgez", "bgezal", "bgtz", "blez", "bltzal", "bltz", "bnez"],
        //G7 : ins rd inm16
    ["lui"],
        //G8 : ins rd inm32
    ["li"],
        //G9 : ins rd rs
    ["move", "abs", "neg", "negu", "not", "div", "divu", "mult", "multu"],
        //G10: ins etiq
    ["b", "j", "jal"],
        //G11: ins rd/s
    ["mfhi", "mflo", "mthi", "mtlo", "jalr", "jr"]
];

function isHex(hex){
    return (hex.indexOf("0x") === 0) ? true : false;
}

function isReserved(word){
    for (var i = 0; i < groups.length; i++) {
        for (var j = 0; j < groups[i].length; j++) {
            if(groups[i][j] === word)
                return true;
        }
    }
    return false;
}

function labelExists(label){
    return labels[label] !== undefined;
}

//Get the starting line of the code
function getCodeStart(code){
    var index = 0;
    while(code[index].indexOf(".text") === -1 && index > code.length){
        index++;
    }
    return (index > code.length) ? 0 : index;
}

//Parse all the labels
function parseLabels(code){
    //.text

    var PCindex = PC;
    for (var i = getCodeStart(code); i < code.length; i++) {
        //If it's a comment, skip
        if(code[i].indexOf("#") === 0){
            continue;
        }

        //Get matches for labels (label:)
        var match = code[i].match(/(\w+):/g);
        var label;

        //(If) It's a match! (pun intended), store it. Otherwise, skip
        if(match !== null){
            label = match[0];
        } else {
            PCindex = intToHex(hexToInt(PCindex) + 4);
            continue;
        }
        //If it's a reserved word, throw an error. (Handled by script.js/parseFile())
        if(isReserved(label)){
            return [false, 0, i];
        }
        //If label is already used, throw an error. (Handled by script.js/parseFile())
        if(labelExists(label)){
            return [false, 1, i];
        }

        //Otherwise, store label and its address
        label = label.replace(":", "");
        labels[label] = PCindex;
        PCindex = intToHex(hexToInt(PCindex) + 4);
    }

    //TODO: parse .data labels

    return true;
}

//Parse .text instruction
function parseText(instruction){
    var success = false;
    var i = 0;

    //Ignore labels
    var match = instruction.match(/(\w+):/g);
    if(match !== null){
        instruction = instruction.replace(match[0], "");
    }

    //Ignore empty spaces, comments and .text keyword
    instruction = instruction.replace(/(#(\w+.+)|#(\s+\w+.+))/g, "");
    if(instruction === "" || instruction === " " || instruction === ".text"){
        return true;
    }

    //Aprove if instruction is syscall
    if(instruction === "syscall"){
        memory[PC] = ["syscall"];
        PC = intToHex(hexToInt(PC) + 4);
        return true;
    }

    //Strip empty spaces and commas
    instruction = instruction.replace(",", "");
    var split = instruction.split(" ").filter(function (el) { return el !== ""; });
    console.log(split);

    //Check if instructions are valid. Then store them in memory. INT, HEX and LABELS are stored in binary
    //G1 ins rs1 rs2 etiq
    for (i = 0; i < groups[0].length && !success; i++) {
        if((split[0] === groups[0][i]) && getRegisterId(split[1] !== -1) && getRegisterId(split[2] !== -1) && labelExists(split[3])){
            split[3] = hexToBin(labels[split[3]]);
            success = true;
        }
    }
    //G2 ins rd rs1 inm16
    for (i = 0; i < groups[1].length  && !success; i++) {
        if((split[0] === groups[1][i]) && getRegisterId(split[1] !== -1) && getRegisterId(split[2] !== -1)){
            if(split[3].indexOf("0x") === 0 && MIN_16BIT <= hexToInt(split[3]) && hexToInt(split[3]) <= MAX_16BIT){
                split[3] = hexToBin(split[3]);
                success = true;
            } else if(MIN_16BIT <= split[3] && split[3] <= MAX_16BIT){
                split[3] = intToBin(split[3]);
                success = true;
            }
        }
    }
    //G3 ins rd rs1 rs2
    for (i = 0; i < groups[2].length && !success; i++) {
        if((split[0] === groups[2][i]) && getRegisterId(split[1] !== -1) && getRegisterId(split[2] !== -1) && getRegisterId(split[3] !== -1)){
            success = true;
        }
    }
    //G4 ins rd rs1 inm5
    for (i = 0; i < groups[3].length && !success; i++) {
        if((split[0] === groups[3][i]) && getRegisterId(split[1] !== -1) && getRegisterId(split[2] !== -1)){
            if(split[3].indexOf("0x") === 0 && 0 <= hexToInt(split[3]) && hexToInt(split[3]) <= MAX_5BIT){
                split[3] = hexToBin(split[3]);
                success = true;
            } else if(0 <= split[3] && split[3] <= MAX_5BIT){
                split[3] = intToBin(split[3]);
                success = true;
            }
        }
    }
    //G5 ins rd dir
    for (i = 0; i < groups[4].length && !success; i++) {
        if((split[0] === groups[4][i]) && getRegisterId(split[1] !== -1)){
            if(split[2].indexOf("0x") !== -1){
                split[2] = hexToBin(split[2]);
                success = true;
            } else if (labelExists(split[2])) {
                split[2] = hexToBin(labels[split[2]]);
                success = true;
            }
        }
    }
    //G6 ins rs etiq
    for (i = 0; i < groups[5].length && !success; i++) {
        if((split[0] === groups[5][i]) && getRegisterId(split[1] !== -1) &&  labelExists(split[2])){
            if(split[2].indexOf("0x") !== -1){
                split[2] = hexToBin(split[2]);
                success = true;
            } else if (labelExists(split[2])) {
                split[2] = hexToBin(labels[split[2]]);
                success = true;
            }
        }
    }
    //G7 ins rd inm16
    for (i = 0; i < groups[6].length && !success; i++) {
        if((split[0] === groups[6][i]) && getRegisterId(split[1] !== -1)){
            if(split[2].indexOf("0x") === 0 && MIN_16BIT <= hexToInt(split[2]) && hexToInt(split[2]) <= MAX_16BIT){
                split[2] = hexToBin(split[2]);
                success = true;
            } else if(MIN_16BIT <= split[2] && split[2] <= MAX_16BIT){
                split[2] = intToBin(split[2]);
                success = true;
            }
        }
    }
    //G8 ins rd inm32
    for (i = 0; i < groups[7].length && !success; i++) {
        if((split[0] === groups[7][i]) && getRegisterId(split[1] !== -1)){
            if(split[2].indexOf("0x") === 0 && MIN_SINT <= hexToInt(split[2]) && hexToInt(split[2]) <= MAX_SINT){
                split[2] = hexToBin(split[2]);
                success = true;
            } else if(MIN_SINT <= split[2] && split[2] <= MAX_SINT){
                split[2] = intToBin(split[2]);
                success = true;
            }
        }
    }
    //G9 ins rd rs
    for (i = 0; i < groups[8].length && !success; i++) {
        if((split[0] === groups[8][i]) && getRegisterId(split[1] !== -1) && getRegisterId(split[2] !== -1)){
            success = true;
        }
    }
    //G10 ins etiqueta
    for (i = 0; i < groups[9].length && !success; i++) {
        if((split[0] === groups[9][i])){
            if(split[1].indexOf("0x") !== -1){
                split[1] = hexToBin(split[1]);
                success = true;
            } else if (labelExists(split[1])) {
                split[1] = hexToBin(labels[split[1]]);
                success = true;
            }
        }
    }
    //G11 ins rd
    for (i = 0; i < groups[10].length && !success; i++) {
        if((split[0] === groups[10][i]) && getRegisterId(split[1] !== -1)){
            success = true;
        }
    }

    //Add instruction into memory
    if(success){
        memory[PC] = split;
        PC = intToHex(hexToInt(PC) + 4);
        return true;
    } else {
        return false;
    }
}

//TODO: Parse .data instructions

//TODO: Decode instruction
function decode(instruction){

}

//Register index
function getRegisterId(register){
    if(register === "$zero" || register === "$0"){ return 0; }
    else if(register === "$at" || register === "$1"){ return 1; }
    else if(register === "$v0" || register === "$2"){ return 2; }
    else if(register === "$v1" || register === "$3"){ return 3; }
    else if(register === "$a0" || register === "$4"){ return 4; }
    else if(register === "$a1" || register === "$5"){ return 5; }
    else if(register === "$a2" || register === "$6"){ return 6; }
    else if(register === "$a3" || register === "$7"){ return 7; }
    else if(register === "$t0" || register === "$8"){ return 8; }
    else if(register === "$t1" || register === "$9"){ return 9; }
    else if(register === "$t2" || register === "$10"){ return 10; }
    else if(register === "$t3" || register === "$11"){ return 11; }
    else if(register === "$t4" || register === "$12"){ return 12; }
    else if(register === "$t5" || register === "$13"){ return 13; }
    else if(register === "$t6" || register === "$14"){ return 14; }
    else if(register === "$t7" || register === "$15"){ return 15; }
    else if(register === "$s0" || register === "$16"){ return 16; }
    else if(register === "$s1" || register === "$17"){ return 17; }
    else if(register === "$s2" || register === "$18"){ return 18; }
    else if(register === "$s3" || register === "$19"){ return 19; }
    else if(register === "$s4" || register === "$20"){ return 20; }
    else if(register === "$s5" || register === "$21"){ return 21; }
    else if(register === "$s6" || register === "$22"){ return 22; }
    else if(register === "$s7" || register === "$23"){ return 23; }
    else if(register === "$t8" || register === "$24"){ return 24; }
    else if(register === "$t9" || register === "$25"){ return 25; }
    else if(register === "$k0" || register === "$26"){ return 26; }
    else if(register === "$k1" || register === "$27"){ return 27; }
    else if(register === "$gp" || register === "$28"){ return 28; }
    else if(register === "$sp" || register === "$29"){ return 29; }
    else if(register === "$fp" || register === "$30"){ return 30; }
    else if(register === "$ra" || register === "$31"){ return 31; }
    else { return -1; }
}
