/*
    Parser
 */

//Constants
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
    if(directives[instruction[0]] !== undefined){
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

function labelDataExists(label){
    for (var i = 0; i < datalabels.length; i++) {
        if(datalabels[i][0] === label){
            return true;
        }
    }
    return false;
}

function labelTextExists(label){
    for (var i = 0; i < textlabels.length; i++) {
        if(textlabels[i][0] === label){
            return true;
        }
    }
    return false;
}

function labelExists(label){
    return labelDataExists(label) || labelTextExists(label);
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
function parseData(line){
    var i = 0;

    //Get the components of the instruction
    temp = splitter(line);
    var label = temp[0];
    var instruction = temp[1];

    //Check the label and store it
    if(label !== -1){
        if(checkLabel(label)){
            datalabels.push([label, dataEnd]);
        } else {
            return 2;
        }
    }

    //Pass if .data
    if(instruction[0] === ".data"){
        return 0;
    }

    //Get the functions that check the instruction
    var check = directives[instruction[0]];

    return check(instruction[1]);
}

//Parse .text instruction.
//Returns: 0 - Succesfully parsed, 1 - Unrecognized, 2 - Incorrect label
function parseText(line){
    var i = 0;

    //Get the components of the instruction
    temp = splitter(line);
    var label = temp[0];
    var instruction = temp[1];

    //Check the label and store it
    if(label !== -1){
        if(checkLabel(label)){
            textlabels.push([label, textEnd]);
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
        memory.push(instruction, true);
        return 0;
    }

    //Get the functions that check the instruction
    var checks = operations[instruction[0]].check;
    for (i = 0; i < checks.length && checks !== undefined; i++) {
        if(checks[i](instruction[i+1])){
            success = true;
        } else {
            return 1;
        }
    }

    memory.push(instruction, true);
    return 0;
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
