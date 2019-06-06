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
	"ADDI": 8,
	"ADDIU": 9,
	"SLTI": 10,
	"SLTIU": 11,
	"ANDI": 12,
	"ORI": 13,
	"XORI": 14,
	"LUI": 15
};

const regex = {
	"i-type-dec": /([a-zA-Z]{2,7}) (\$.{2,4}) (\$.{2,4}) ([0-9]{1,5})/g,
	"i-type-hex": /([a-zA-Z]{2,7}) (\$.{2,4}) (\$.{2,4}) (0x[0-9a-fA-F]{1,4})/g,
	"i-type-char": /([a-zA-Z]{2,7}) (\$.{2,4}) (\$.{2,4}) ('.')/g
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
	return registers[i];
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
		if(registers[key] === register || ("$" + keys[i]) === "register"){
			return dollarSign ? "$" + key : key;
		}
	}

	return -1;
}

function parseContents(){

}

// TODO
function parseInstr(instruction){
	var binary = 0;
	// Step 1: Split instruction in parts
	// Remove trailing whitespace
	instruction = instruction.replace(/^\s+|\s+$/g,'');

	// Labels           /[a-zA-Z]+:/g
	// I-Type with dec  /([a-zA-Z]{2,7}) (\$.{2,4}) (\$.{2,4}) ([0-9]{1,5})/g
	// I-Type with hex  /([a-zA-Z]{2,7}) (\$.{2,4}) (\$.{2,4}) (0x[0-9a-fA-F]{1,4})/g
	// I-Type with char /([a-zA-Z]{2,7}) (\$.{2,4}) (\$.{2,4}) ('.')/g
	label = /[a-zA-Z]+:/g.exec(instruction);
	instruction = matchInstruction(instruction);
	
	if(instruction === null) return null;

	type = instruction[0];
	parts = instruction[1];

	// Step 2: Parse each part
	if (type === "i-type-dec"){
		if (parts[4] > 65535) { return null; }
		binary = instructions[parts[1].toUpperCase()] << 26 | 
			(getRegisterId(parts[2], false) << 21) | 
			(getRegisterId(parts[3], false) << 16) | 
			parts[4];
	} else if (type === "i-type-hex"){
		if (parseInt(parts[4], 16) > 65535) { return null; }
		binary = instructions[parts[1].toUpperCase()] << 26 | 
			(getRegisterId(parts[2], false) << 21) | 
			(getRegisterId(parts[3], false) << 16) | 
			parseInt(parts[4], 16);
	} else if (type === "i-type-char"){
		if (parts[4].charCodeAt(1) > 65535) { return null; }
		binary = instructions[parts[1].toUpperCase()] << 26 | 
			(getRegisterId(parts[2], false) << 21) | 
			(getRegisterId(parts[3], false) << 16) | 
			parts[4].charCodeAt(1);
	}

	// Step 4: Return number
	return [label, binary];
}

/*
 * Match an instruction against a regex
 * instruction: instruction to match all regexes against
 * returns: [instruction type, instruction split in parts]
 */
function matchInstruction(instruction){
	var keys = Object.keys(regex);
	for (var i = 0; i < keys.length; i++) {
		parts = regex[keys[i]].exec(instruction);
		if (parts !== null) {
			return [keys[i], parts];
		}
	}
	return null;
}

//PADDING
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}