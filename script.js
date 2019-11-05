var registers = {
    "PC": 0;
    "IR": [];
    "HI": 0;
    "LO": 0;
     0: 0,  1: 0,  2: 0,  3: 0, 
     4: 0,  5: 0,  6: 0,  7: 0, 
     8: 0,  9: 0, 10: 0, 11: 0, 
    12: 0, 13: 0, 14: 0, 15: 0, 
    16: 0, 17: 0, 18: 0, 19: 0, 
    20: 0, 21: 0, 22: 0, 23: 0, 
    24: 0, 25: 0, 26: 0, 27: 0, 
    28: 268435456, 29: 2147479551, 30: 2147479551, 31: 0
};

const regName = [
    "$zero","$at", "$v0", "$v1", 
    "$a0",  "$a1", "$a2", "$a3", 
    "$t0", "$t1", "$t2", "$t3", 
    "$t4", "$t5", "$t6", "$t7", 
    "$s0", "$s1", "$s2", "$s3", 
    "$s4", "$s5", "$s6", "$s7", 
    "$t8", "$t9", "$k0", "$k1", 
    "$gp", "$sp", "$fp", "$ra"
];

var instructions {
	"ADD": {
		"parse": parseRTypeTriple,
		"exec": function(arg) {
			registers[arg[0]] = registers[arg[1]] + registers[arg[2]];
		}
	},
	"ADDI": {
		"parse": null,
		"exec": function(arg) {
			registers[arg[0]] = registers[arg[1]] + arg[2];
		}
	}
}

/*
 * Main function to clean instructions
 * instruction: instruction string
 */

function clean(instruction){
    // Remove commas and trailing whitespace, then convert to uppercase
    instruction = instruction.replace(/^\s+|\s+$/g,'');
    instruction = instruction.replace(',', '');
    instruction = instruction.toUpperCase();

    // Get comments and remove them
    var comment = instruction.match(/(#.+)/g)[0];
    instruction = instruction.replace(comment, '');

    return {"label": null, "comment": comment, "instruction": instruction}
}

/*
 * Get the instruction operation
 */

function getOp(instruction) {
	var op = instruction.match(/([a-zA-Z]{2,7})/g);
	if (op === null) { throw "Invalid instruction" };
	return op[0];
}

/*
 * Get the index of the register
 * reg: Register (with preceding $)
 * returns: register index
 */
function getRegisterIndex(reg){
	reg = reg.replace('$', '');
	for (var i = 0; i < regName.length; i++) {
		if (regName[i] === reg) {
			return i;
		}
	}
    return null;
}

function parseRTypeTriple(instruction) {
	var res = /([a-zA-Z]{2,7}) (\$[a-zA-Z0-9]{2,4}) (\$[a-zA-Z0-9]{2,4}) (\$[a-zA-Z0-9]{2,4})/g.exec(instruction);
	if (res === null) throw "Invalid instruction";
	return [getRegisterIndex(res[2]), getRegisterIndex(res[3]), getRegisterIndex(res[4])]
}

function parse(instruction) {
	try {
		instruction = clean(instruction);
		op = getOp(instruction);
	catch (e) {
		return false;
	}

	if (instructions[op] === undefined) { throw "Unknown instruction" }
	
	try {
		instructions[op].parse();
	catch (e) {
		return false;
	}

	return true;	
}

function run(instruction) {
	try {
		instruction = clean(instruction);
		op = getOp(instruction);
	catch (e) {
		return false;
	}

	if (instructions[op] === undefined) { throw "Unknown instruction" }
	
	try {
		var arg = instructions[op].parse();
		instructions[op].exec(arg);
	catch (e) {
		return false;
	}

	return true;
}
