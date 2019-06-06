/*
    Parser
 */

var memory = [];
var labels = {};

//Constants
const registers = {
    0: "$zero", 
    1: "$at", 
    2: "$v0", 
    3: "$v1", 
    4: "$a0", 
    5: "$a1", 
    6: "$a2", 
    7: "$a3", 
    8: "$t0", 
    9: "$t1", 
    10: "$t2", 
    11: "$t3", 
    12: "$t4", 
    13: "$t5", 
    14: "$t6", 
    15: "$t7", 
    16: "$s0", 
    17: "$s1", 
    18: "$s2", 
    19: "$s3", 
    20: "$s4", 
    21: "$s5", 
    22: "$s6", 
    23: "$s7", 
    24: "$t8", 
    25: "$t9", 
    26: "$k0", 
    27: "$k1", 
    28: "$gp", 
    29: "$sp", 
    30: "$fp", 
    31: "$ra"
};

const instructions = {
    "r-type": { // R-Type
        "SLL":   [0, 0],
        "SRL":   [0, 2],
        "SRA":   [0, 3],
        "ADD":   [0, 32],
        "ADDU":  [0, 33],
        "AND":   [0, 34],
        "DIV":   [0, 26],
        "DIVU":  [0, 27],
        "JR":    [0, 8],
        "MFHI":  [0, 16],
        "MTHI":  [0, 17],
        "MFLO":  [0, 18],
        "MTLO":  [0, 19],
        "MULT":  [0, 24],
        "MULTU": [0, 25],
        "NOR":   [0, 39],
        "XOR":   [0, 38],
        "OR":    [0, 37],
        "SLT":   [0, 42],
        "SLTU":  [0, 43],
        "SUB":   [0, 34],
        "SUBU":  [0, 35]
    },
    "i-type": { //I-type
        "ADDI":   8,
        "ADDIU":  9,
        "SLTI":   10,
        "SLTIU":  11,
        "ANDI":   12,
        "ORI":    13,
        "XORI":   14,
        "LUI":    15
    }
};

const regex = {
    "i-type-hex": /([a-zA-Z]{2,7}) (\$[a-zA-Z0-9]{2,4}) (\$[a-zA-Z0-9]{2,4}) (0[xX][0-9a-fA-F]{1,4})/,
    "i-type-dec": /([a-zA-Z]{2,7}) (\$[a-zA-Z0-9]{2,4}) (\$[a-zA-Z0-9]{2,4}) ([0-9]{1,5})/,
    "i-type-char": /([a-zA-Z]{2,7}) (\$[a-zA-Z0-9]{2,4}) (\$[a-zA-Z0-9]{2,4}) ('.')/,
    //"r-type-shift": /([a-zA-Z]{2,7}) (\$[a-zA-Z0-9]{2,4}) (\$[a-zA-Z0-9]{2,4}) ([0-9]{1,5})/,
    "r-type-triple": /([a-zA-Z]{2,7}) (\$[a-zA-Z0-9]{2,4}) (\$[a-zA-Z0-9]{2,4}) (\$[a-zA-Z0-9]{2,4})/,
    "r-type-double": /([a-zA-Z]{2,7}) (\$[a-zA-Z0-9]{2,4}) (\$[a-zA-Z0-9]{2,4})[^ 0-9a-zA-Z$]/,
    "r-type-single": /([a-zA-Z]{2,7}) (\$[a-zA-Z0-9]{2,4})[^ 0-9a-zA-Z$]/
};

/*
 * Get the mnemonic name of the register (including $)
 * i: Number of the register (with or without preceding $)
 * returns: register mnemonic name
 */
function getRegisterMnemonic(i){
    if (typeof(i) === 'string'){
        i = i.replace("$", "");
    }
    if (registers[i] === undefined) {
        throw "Invalid register " + i;
    }
    return registers[i].toUpperCase();
}

/*
 * Get the register id from the mnemonic name
 * i: Register mnemonic
 * dollaSign: true or false. Appends a $ before the id
 * returns: register id
 */
function getRegisterId(register, dollarSign){
    var keys = Object.keys(registers);
    for (var i = keys.length - 1; i >= 0; i--) {
        var key = keys[i];
        if(registers[key].toUpperCase() === register.toUpperCase() || 
          ("$" + keys[i]).toUpperCase() === register.toUpperCase()){
            return dollarSign ? "$" + key : key;
        }
    }

    throw "Invalid register " + register;
}

function parseContents(){

}

// TODO
function parseInstr(instruction){
    var binary = 0;

    // Remove trailing whitespace and convert to uppercase
    instruction = instruction.replace(/^\s+|\s+$/g,'');
    instruction = instruction.toUpperCase();

    // Match instruction with instruction types and labels
    var label = /[a-zA-Z]+:/g.exec(instruction);
    instruction = matchInstruction(instruction);

    if(instruction === null) throw "Invalid instruction";

    var type = instruction[0];
    var parts = instruction[1];

    // Check if OP codes and instructions are valid
    var opcode;
    var ins;
    if (type.includes("i-type")) {
        opcode = instructions["i-type"][parts[1]];
    } else if (type.includes("r-type")) {
        opcode = instructions["r-type"][parts[1]];
    }
    if(opcode === undefined) throw "Invalid instruction";

    if (type.includes("i-type")){ // I-Type instructions
        var immediate = 0; 
        switch (type){
            case "i-type-dec":  immediate = parts[4]; break;
            case "i-type-hex":  immediate = parseInt(parts[4], 16); break;
            case "i-type-char": immediate = parts[4].charCodeAt(1); break;
        }
        if (immediate > 65535) throw "Invalid instruction";

        binary = opcode << 26 | 
                (getRegisterId(parts[2], false) << 21) | 
                (getRegisterId(parts[3], false) << 16) | 
                immediate;

    } else if (type === "r-type-shift"){  // R-Type shift instructions
        if (parts[4] > 31) { return null; }

        binary = opcode[0] << 26 | 
                (getRegisterId(parts[2], false) << 16) | 
                (getRegisterId(parts[3], false) << 11) | 
                parts[4] << 6 |
                opcode[1];

    } else if (type === "r-type-triple"){ // R-Type instructions
        binary = opcode[0] << 26 | 
                (getRegisterId(parts[2], false) << 21) | 
                (getRegisterId(parts[3], false) << 16) |
                (getRegisterId(parts[4], false) << 11) |  
                opcode[1];
    }  else if (type === "r-type-double"){
        binary = opcode[0] << 26 | 
                (getRegisterId(parts[2], false) << 21) | 
                (getRegisterId(parts[3], false) << 16) |
                opcode[1];
    }  else if (type === "r-type-single"){
        binary = opcode[0] << 26 | 
                (getRegisterId(parts[2], false) << 21) | 
                opcode[1];
    }

    return [label, binary];
}

/*
 * Match an instruction against a regex
 * instruction: instruction to match all regexes against
 * returns: [instruction type, instruction split in parts]
 */
function matchInstruction(instruction){
    if (instruction.includes("SLL") || 
        instruction.includes("SRL") || 
        instruction.includes("SRA")) {

        return ["r-type-shift", regex["i-type-dec"].exec(instruction)];
    }
    var keys = Object.keys(regex);
    for (var i = 0; i < keys.length; i++) {
        var parts = regex[keys[i]].exec(instruction);
        if (parts !== null) {
            return [keys[i], parts];
        }
    }
    return null;
}


function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

console.log(pad((parseInstr("ADD $t0 $t0 $a0")[1] >>> 0).toString(2), 32, 0));
console.log(pad((parseInstr("ADDI $t0 $t0 0")[1] >>> 0).toString(2), 32, 0));
console.log(pad((parseInstr("ADDI $t0 $t0 1")[1] >>> 0).toString(2), 32, 0));
console.log(pad((parseInstr("ADDI $t0 $t0 5")[1] >>> 0).toString(2), 32, 0));
console.log(pad((parseInstr("ADDI $t0 $t0 65535")[1] >>> 0).toString(2), 32, 0));
console.log(pad((parseInstr("ADDI $t0 $t0 0xFF")[1] >>> 0).toString(2), 32, 0));
console.log(pad((parseInstr("SRL $t0 $t0 5")[1] >>> 0).toString(2), 32, 0));
console.log(pad((parseInstr("ADDI $t0 $t0 $a0")[1] >>> 0).toString(2), 32, 0));