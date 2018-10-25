/*
    Parser
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

//Splits the given line into an array.
//Returns: Array: [0] - Label (-1 if there isn't one), [1] - Instruction array (-1 if there isn't one)
function splitter(line){
    //Get label
    var label = line.match(/(\w+):/g);
    label = (label !== null) ? label[0].replace(":", "") : -1;

    //Get the instruction, split it and remove empty whitespaces
    var instruction = line.match(/(?!(\w+:))[^:\s].+/g);
    instruction = (instruction !== null) ? instruction[0].replace(/,/g, " ").split(" ").filter(function(v){return v!==''}) : -1;
    if(directives[instruction[0]] !== null){
        var array = [];
        for (var i = 1; i < instruction.length; i++) {
            array.push(instruction[i]);
        }
        instruction.splice(1);
        instruction.push(array);
    }

    return [label, instruction];
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

//Checks that the string is ASCII
function isASCII(string){
    for (var i = 0; i < string.length; i++) {
        if(string.charCodeAt(i) > 128){
            return false;
        }
    }
    return true;
}

function isReserved(word){
    return operations[word] !== undefined;
}

function checkLabel(label){
    if(isReserved(label) || labelExists(label)){
        return false;
    }
    return true;
}

//Returns the addressing type.
//Returns: -1 if it's not recognized, 0 for hex, 1 for value($reg), 2 for label($reg), 3 for label
function checkDir(dir){
    if(isHex(dir)){
        dir = dir.replace("0x", "");
        return ((hexToInt(10000000) <= hexToInt(dir)) && (hexToInt(dir) <= hexToInt(dataEnd))) ? 0 : -1;
    } else if(dir.indexOf("(") !== -1) {
        var reg = insReg(dir.substring(dir.indexOf("$"), dir.length-1));
        var value = parseInt(dir);
        if(value === null || value === undefined || isNaN(value)){
            value = false;
            var label = dir.substring(0, dir.indexOf("("));
            for (var i = 0; i < datalabels.length; i++) {
                if(datalabels[i][0] === label){
                    value = true;
                }
            }
            return (value && reg) ? 2 : -1;
        } else {
            return (typeof value === 'number' && reg) ? 1 : -1;
        }

    } else {
        for (var i = 0; i < datalabels.length; i++) {
            if(datalabels[i][0] === dir){
                return 3;
            }
        }
        return -1;
    }
}

//Parse .data instruction
//Returns: 0 - Succesfully parsed, 1 - Unrecognized, 2 - Incorrect label, 3 - Unrecognized characters
//TODO: Clean up
//TODO: Get check from directives object. Run the check with the instruction to modify it. Add it to memory
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

//Parse .text instruction.
//Returns: 0 - Succesfully parsed, 1 - Unrecognized, 2 - Incorrect label
function parseText(line){
    var success = true;
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

    //Get the functions that check the instruction
    var checks = operations[instruction[0]];
    for (i = 0; i < checks.length && success && checks !== undefined; i++) {
        if(checks[i](instruction[i+1])){
            success = true;
        } else {
            success = false;
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
