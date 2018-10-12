/*
    Decoder
 */

//Constants
const MAX_5BIT = Math.pow(2, 5) - 1;
const MAX_16BIT = Math.pow(2, 15) - 1;
const MIN_16BIT = -Math.pow(2, 15);
const registerid = [["$zero", "$0"], ["$at", "$1"], ["$v0", "$2"], ["$v1", "$3"], ["$a0", "$4"], ["$a1", "$5"], ["$a2", "$6"], ["$a3", "$7"], ["$t0", "$8"], ["$t1", "$9"], ["$t2", "$10"], ["$t3", "$11"], ["$t4", "$12"], ["$t5", "$13"], ["$t6", "$14"], ["$t7", "$15"], ["$s0", "$16"], ["$s1", "$17"], ["$s2", "$18"], ["$s3", "$19"], ["$s4", "$20"], ["$s5", "$21"], ["$s6", "$22"], ["$s7", "$23"], ["$t8", "$24"], ["$t9", "$25"], ["$k0", "$26"], ["$k1", "$27"], ["$gp", "$28"], ["$sp", "$29"], ["$fp", "$30"], ["$ra", "$31"]];

// Instruction groups
const groups = [
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
        if(string.charCodeAt(i) >= 256){
            return false;
        }
    }
    return true;
}

//Parse all the labels
function parseLabels(code){
    //.text

    var PCindex = PC;
    var GPindex = register[getRegisterId("$gp")];
    for (var i = getCodeStart(code); i < code.length; i++) {
        console.log("Evaluating " + code[i] + " with addr 0x" + PCindex);
        //If it's a comment or .text, skip
        if(code[i].indexOf("#") === 0 || code[i].indexOf(".text") !== -1 || code[i] === " " || code[i] === ""){
            console.log("Continuing");
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
        var split = code[i].split(" ");
        label = label.replace(":", "");
        labels[label] = PCindex;
        //If label is alone, the next line has the same address as the label
        if(split.length === 1){
            PCindex = intToHex(hexToInt(PCindex));
        } else {
            PCindex = intToHex(hexToInt(PCindex) + 4);
        }
    }

    //TODO: parse .data labels
    for (var i = 0; i < getCodeStart(code); i++) {
        if(code[i].indexOf("#") === 0 || code[i].indexOf(".data") !== -1 || code[i] === " " || code[i] === ""){
            console.log("Continuing");
            continue;
        }
    }
    return true;
}

//Parse .data instruction
function parseData(instruction){
    var success = false;
    var i = 0;

    //Ignore labels
    var match = instruction.match(/(\w+):/g);
    if(match !== null){
        instruction = instruction.replace(match[0], "");
    }

    //Ignore and trim empty spaces
    instruction = instruction.replace(/\s{2,}/g, "");
    if(instruction === "" || instruction === " " || instruction === ".data"){
        return true;
    }

    //const directives = [".asciiz", ".ascii", ".byte", ".space", ".globl", ".half", ".word"];
    if(instruction.indexOf(".asciiz") !== -1){
        match = instruction.match(/\".+\"/g)[0].replace('"', '');
        if(!isASCII(match)){
            return false;
        }
        for (i = 0; i < match.length-1; i++) {
            memory[binToHex(register[28])] = intToBin(match.charCodeAt(i)).substring(24);
            register[28] = intToBin(binToInt(register[28]) + 1);
        }
        memory[binToHex(register[28])] = "00000000";
        register[28] = intToBin(binToInt(register[28]) + 1);
        return true;
    }
    if(instruction.indexOf(".ascii") !== -1){
        match = instruction.match(/\".+\"/g)[0].replace('"', '');
        if(!isASCII(match)){
            return false;
        }
        for (i = 0; i < match.length-1; i++) {
            memory[binToHex(register[28])] = intToBin(match.charCodeAt(i)).substring(24);
            register[28] = intToBin(binToInt(register[28]) + 1);
        }
        return true;
    }
    if(instruction.indexOf(".space") !== -1){
        var n = parseInt(instruction.replace(".space ", ""));
        console.log(n);
        for (i = 0; i < n; i++) {
            memory[binToHex(register[28])] = "000000";
            register[28] = intToBin(binToInt(register[28]) + 1);
        }
        return true;
    }

    return false;
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
        var result = [true, PC];
        memory[PC] = split;
        PC = intToHex(hexToInt(PC) + 4);
        return result;
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
    for (var i = 0; i < registerid.length; i++) {
        if(registerid[i][0] === register || registerid[i][1] === register){
            return i;
        }
    }
    return -1;
}
