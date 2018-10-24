/*
    Decoder
 */

//Constants
const MAX_5BIT = Math.pow(2, 5) - 1;
const MAX_16BIT = Math.pow(2, 15) - 1;
const MIN_16BIT = -Math.pow(2, 15);
const MAX_BYTE = Math.pow(2, 7) - 1;
const MIN_BYTE = -Math.pow(2, 7);

const registerid = [["$zero", "$0"], ["$at", "$1"], ["$v0", "$2"], ["$v1","$3"],
["$a0", "$4"], ["$a1", "$5"], ["$a2", "$6"], ["$a3", "$7"], ["$t0","$8"],
["$t1", "$9"], ["$t2", "$10"], ["$t3", "$11"], ["$t4", "$12"], ["$t5","$13"],
["$t6", "$14"], ["$t7", "$15"], ["$s0", "$16"], ["$s1", "$17"], ["$s2","$18"],
["$s3", "$19"], ["$s4", "$20"], ["$s5", "$21"], ["$s6", "$22"], ["$s7","$23"],
["$t8", "$24"], ["$t9", "$25"], ["$k0", "$26"], ["$k1", "$27"], ["$gp","$28"],
["$sp", "$29"], ["$fp", "$30"], ["$ra", "$31"]];

// Instructions
const groups = [
        //G1 : ins rs1 rs2 etiq
    ["beq", "bge", "bgeu", "bgt", "bgtu", "ble", "bleu", "blt", "bltu", "bne"],
        //G2 : ins rd rs1 inm16
    ["addi", "addiu", "ori", "xori", "andi", "slti", "sltui"],
        //G3 : ins rd rs1 rs2
    ["sllv", "srav", "srlv", "rem", "remu", "add", "addu", "sub", "subu", "or", "xor", "and", "nor", "div", "divu", "mul", "mulo", "mulou", "rol",
    "ror", "seq", "sge", "sgeu", "sgt", "sgtu", "sle", "sleu", "slt", "sltu", "sne"],
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

//Get the starting line of the code
function getCodeStart(code){
    var index = 0;
    for (var i = 0; i < code.length; i++) {
        if(code[i].indexOf(".text") !== -1){
            index = i;
            break;
        }
    }
    return index;
}

//Checks that the string is ASCII
function isASCII(string){
    for (var i = 0; i < string.length; i++) {
        if(string.charCodeAt(i) > 128){
            return false;
        }
    }
    return true;
}

//Splits the given line into an array. The first item is the label, (if there's one),
//and the second one is the splitted instruction (if there's one)
function splitter(line){
    //Get label
    var label = line.match(/(\w+):/g);
    label = (label !== null) ? label[0].replace(":", "") : -1;

    //Get the instruction, split it and remove empty whitespaces
    var instruction = line.match(/(?!(\w+:))[^:\s].+/g);
    instruction = (instruction !== null) ? instruction[0].replace(/,/g, " ").split(" ").filter(function(v){return v!==''}) : -1;

    return [label, instruction];
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
    for (var i = 0; i < textlabels.length; i++) {
        if(textlabels[i][0] === label){
            return true;
        }
    }
    for (var i = 0; i < datalabels.length; i++) {
        if(datalabels[i][0] === label){
            return true;
        }
    }
    return false;
}

function checkLabel(label){
    if(isReserved(label) || labelExists(label)){
        return false;
    }
    return true;
}

//Parse .data instruction
//TODO: Clean up
function parseData(line){
    var i = 0;
    var temp;
    var text;

    //Get the components of the instruction
    temp = splitter(line);
    var label = temp[0];
    var instruction = temp[1];

    //Check the label and store it
    if(label !== -1){
        if(checkLabel(label)){
            datalabels.push([label, binToHex(register[28])]);
        } else {
            return 2;
        }
    }

    //const directives = [".asciiz", ".ascii", ".byte", ".space", ".half", ".word"];
    if(instruction[0] === ".data"){
        return 0;
    } else if(instruction[0] === ".asciiz"){
        text = instruction.slice(1).join(" ").replace('\"', "").replace('\"', "");
        if(!isASCII(text)){
            return 3;
        }
        for (i = 0; i < text.length; i++) {
            memory[binToHex(register[28])] = intToBin(text.charCodeAt(i)).substring(24);
            register[28] = intToBin(binToInt(register[28]) + 1);
        }
        //Add leading null
        memory[binToHex(register[28])] = "00000000";
        register[28] = intToBin(binToInt(register[28]) + 1);
        return 0;
    } else if(instruction[0] === ".ascii"){
        text = instruction.slice(1).join(" ").replace('\"', "").replace('\"', "");
        if(!isASCII(text)){
            return 3;
        }
        for (i = 0; i < text.length; i++) {
            memory[binToHex(register[28])] = intToBin(text.charCodeAt(i)).substring(24);
            register[28] = intToBin(binToInt(register[28]) + 1);
        }
        return 0;
    } else if(instruction[0] === ".space"){
        var n = parseInt(instruction[1]);
        if(n === undefined ||n === null) return 0;
        for (i = 0; i < n; i++) {
            memory[binToHex(register[28])] = "00000000";
            register[28] = intToBin(binToInt(register[28]) + 1);
        }
        return 0;
    } else if(instruction[0] === ".byte"){
        for (i = 1; i < instruction.length; i++) {
            temp = parseInt(instruction[i]);
            if(isNaN(temp) || temp === undefined || temp === null) temp = 0;
            if(temp < MIN_BYTE || temp > MAX_BYTE){ return 0; }
            memory[binToHex(register[28])] = intToBin(temp).substring(24);
            register[28] = intToBin(binToInt(register[28]) + 1);
        }
        return 0;
    } else if(instruction[0] === ".half"){
        for (i = 1; i < instruction.length; i++) {
            temp = parseInt(instruction[i]);
            if(isNaN(temp) || temp === undefined || temp === null) temp = 0;
            if(temp < MIN_16BIT || temp > MAX_16BIT){ return 0; }
            temp = intToBin(temp);
            temp = [temp.match(/.{1,8}/g)[2], temp.match(/.{1,8}/g)[3]];
            memory[binToHex(register[28])] = temp[0];
            register[28] = intToBin(binToInt(register[28]) + 1);
            memory[binToHex(register[28])] = temp[1];
            register[28] = intToBin(binToInt(register[28]) + 1);
        }
        return 0;
    } else if(instruction[0] === ".word"){
        for (i = 1; i < instruction.length; i++) {
            temp = parseInt(instruction[i]);
            if(isNaN(temp) || temp === undefined || temp === null) temp = 0;
            if(temp < MIN_SINT || temp > MAX_SINT){ return 0; }
            temp = intToBin(temp).match(/.{1,8}/g);
            for (var j = 0; j < temp.length; j++) {
                memory[binToHex(register[28])] = temp[j];
                register[28] = intToBin(binToInt(register[28]) + 1);
            }
        }
        return 0;
    }

    return 1;
}

//Parse .text instruction
//TODO: Clean up
function parseText(line){
    var success = false;
    var i = 0;

    //Get the components of the instruction
    temp = splitter(line);
    var label = temp[0];
    var instruction = temp[1];

    //Check the label and store it
    if(label !== -1){
        if(checkLabel(label)){
            textlabels.push([label, PC]);
        } else {
            return 2;
        }
    }

    //Pass if .text
    if(instruction[0] === ".text"){
        return 0;
    }

    //Pass if instruction is syscall
    if(instruction[0] === "syscall"){
        success = true;
    }

    //Check if instructions are valid. Then store them in memory. INT, HEX and LABELS are stored in binary
    //G1 ins rs1 rs2 etiq
    for (i = 0; i < groups[0].length && !success; i++) {
        if((instruction[0] === groups[0][i]) && getRegisterId(instruction[1] !== -1) && getRegisterId(instruction[2] !== -1) && labelExists(instruction[3])){
            instruction[3] = hexToBin(textlabels[instruction[3]]);
            success = true;
        }
    }
    //G2 ins rd rs1 inm16
    for (i = 0; i < groups[1].length  && !success; i++) {
        if((instruction[0] === groups[1][i]) && getRegisterId(instruction[1] !== -1) && getRegisterId(instruction[2] !== -1) && instruction[3] !== undefined){
            if(instruction[3].indexOf("0x") === 0 && MIN_16BIT <= hexToInt(instruction[3]) && hexToInt(instruction[3]) <= MAX_16BIT){
                instruction[3] = hexToBin(instruction[3]);
                success = true;
            } else if(MIN_16BIT <= instruction[3] && instruction[3] <= MAX_16BIT){
                instruction[3] = intToBin(instruction[3]);
                success = true;
            }
        }
    }
    //G3 ins rd rs1 rs2
    for (i = 0; i < groups[2].length && !success; i++) {
        if((instruction[0] === groups[2][i]) && getRegisterId(instruction[1] !== -1) && getRegisterId(instruction[2] !== -1) && getRegisterId(instruction[3] !== -1)){
            success = true;
        }
    }
    //G4 ins rd rs1 inm5
    for (i = 0; i < groups[3].length && !success; i++) {
        if((instruction[0] === groups[3][i]) && getRegisterId(instruction[1] !== -1) && getRegisterId(instruction[2] !== -1)){
            if(instruction[3].indexOf("0x") === 0 && 0 <= hexToInt(instruction[3]) && hexToInt(instruction[3]) <= MAX_5BIT){
                instruction[3] = hexToBin(instruction[3]);
                success = true;
            } else if(0 <= instruction[3] && instruction[3] <= MAX_5BIT){
                instruction[3] = intToBin(instruction[3]);
                success = true;
            }
        }
    }
    //G5 ins rd dir
    for (i = 0; i < groups[4].length && !success; i++) {
        if((instruction[0] === groups[4][i]) && getRegisterId(instruction[1] !== -1)){
            if(instruction[2].indexOf("0x") !== -1){
                instruction[2] = hexToBin(instruction[2]);
                success = true;
            } else if (labelExists(instruction[2])) {
                success = true;
            } else if(instruction[2].indexOf("($") !== -1){ // valor($r), dir($r)
                if(getRegisterId(instruction[2].substring(instruction[2].indexOf("(")+1, instruction[2].length-1)) != -1){
                    if((instruction[2].substring(instruction[2].indexOf("("), instruction[2].length).length >= 4 &&
                       instruction[2].substring(instruction[2].indexOf("("), instruction[2].length).length <= 7) ||
                       labelExists(instruction[2].substring(0, instruction[2].indexOf("(")))               ||
                       !isNaN(parseInt(instruction[2]))){
                        success = true;
                    }
                }
            }
        }
    }
    //G6 ins rs etiq
    for (i = 0; i < groups[5].length && !success; i++) {
        if((instruction[0] === groups[5][i]) && getRegisterId(instruction[1] !== -1) &&  labelExists(instruction[2])){
            if(instruction[2].indexOf("0x") !== -1){
                instruction[2] = hexToBin(instruction[2]);
                success = true;
            } else if (labelExists(instruction[2])) {
                instruction[2] = hexToBin(textlabels[instruction[2]]);
                success = true;
            }
        }
    }
    //G7 ins rd inm16
    for (i = 0; i < groups[6].length && !success; i++) {
        if((instruction[0] === groups[6][i]) && getRegisterId(instruction[1] !== -1)){
            if(instruction[2].indexOf("0x") === 0 && MIN_16BIT <= hexToInt(instruction[2]) && hexToInt(instruction[2]) <= MAX_16BIT){
                instruction[2] = hexToBin(instruction[2]);
                success = true;
            } else if(MIN_16BIT <= instruction[2] && instruction[2] <= MAX_16BIT){
                instruction[2] = intToBin(instruction[2]);
                success = true;
            }
        }
    }
    //G8 ins rd inm32
    for (i = 0; i < groups[7].length && !success; i++) {
        if((instruction[0] === groups[7][i]) && getRegisterId(instruction[1] !== -1)){
            if(instruction[2].indexOf("0x") === 0 && MIN_SINT <= hexToInt(instruction[2]) && hexToInt(instruction[2]) <= MAX_SINT){
                instruction[2] = hexToBin(instruction[2]);
                success = true;
            } else if(MIN_SINT <= instruction[2] && instruction[2] <= MAX_SINT){
                instruction[2] = intToBin(instruction[2]);
                success = true;
            }
        }
    }
    //G9 ins rd rs
    for (i = 0; i < groups[8].length && !success; i++) {
        if((instruction[0] === groups[8][i]) && getRegisterId(instruction[1] !== -1) && getRegisterId(instruction[2] !== -1)){
            success = true;
        }
    }
    //G10 ins etiqueta
    for (i = 0; i < groups[9].length && !success; i++) {
        if((instruction[0] === groups[9][i])){
            if(instruction[1].indexOf("0x") !== -1){
                instruction[1] = hexToBin(instruction[1]);
                success = true;
            } else if (labelExists(instruction[1])) {
                instruction[1] = hexToBin(textlabels[instruction[1]]);
                success = true;
            }
        }
    }
    //G11 ins rd
    for (i = 0; i < groups[10].length && !success; i++) {
        if((instruction[0] === groups[10][i]) && getRegisterId(instruction[1] !== -1)){
            success = true;
        }
    }

    //Add instruction into memory
    if(success){
        memory[PC] = instruction;
        PC = intToHex(hexToInt(PC) + 4);
        return 0;
    } else {
        return 1;
    }
}

//Register index
function getRegisterId(register){
    for (var i = 0; i < registerid.length; i++) {
        if(registerid[i][0] === register || registerid[i][1] === register){
            return i;
        }
    }
    return -1;
}
