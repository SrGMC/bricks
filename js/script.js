/*
    Cache
 */
var cache = window.applicationCache;

// Attempt to update the user's cache. Currently not working
//cache.update();

// The fetch was successful, swap in the new cache.
cache.addEventListener('updateready', function(e) { cache.swapCache(); });
if (cache.status == cache.UPDATEREADY) { cache.swapCache(); }

/*
    Main
 */
//PC and IR
var PC = "00000000";
var RI = [];

//High and Low registers
var HI = "00000000";
var LO = "00000000";

//Memory
var memory = {
    "push": function(data, instruction){
                if(instruction){
                    memory[textEnd] = data;
                    textEnd = intToHex(hexToInt(textEnd) + 4);
                } else {
                    if(data.length === 8 || data.length === 16 || data.length === 32){
                        var temp = data.match(/.{1,8}/g);
                        for (var i = 0; i < temp.length; i++) {
                            memory[dataEnd] = temp[i];
                            dataEnd = intToHex(hexToInt(dataEnd) + 1);
                        }
                    } else {
                        throw "data in memory.push(data, instruction) has an incorrect length";
                    }
                }
            }
};
//Registers
var register = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,hexToBin("10000000"),hexToBin("7fffefff"),hexToBin("7fffefff"),0];
//Labels
var textlabels = [];
var datalabels = [];
//End directions
var textEnd = "00000000";
var dataEnd = "10000000";

//File data are stored here
var instructions = [];
var text = document.getElementById('history').innerHTML;

//Settings and controls
//Controls if code was succesfully parsed
var control;
//Controls the position that was last run. Used for updating the step by step code running
var last = PC;

//Clear code and registers
function clearCode(){
    instructions = [];
    datalabels = [];
    textlabels = [];
    textEnd = "00000000";
    dataEnd = "10000000";
    memory = {
        "push": function(data, instruction){
                    if(instruction){
                        memory[textEnd] = data;
                        textEnd = intToHex(hexToInt(textEnd) + 4);
                    } else {
                        if(data.length === 8 || data.length === 16 || data.length === 32){
                            var temp = data.match(/.{1,8}/g);
                            for (var i = 0; i < temp.length; i++) {
                                memory[dataEnd] = temp[i];
                                dataEnd = intToHex(hexToInt(dataEnd) + 1);
                            }
                        } else {
                            throw "data in memory.push(data, instruction) has an incorrect length";
                        }
                    }
                }
    };
    control = undefined;
    clearRegisters();
    if(document.getElementById('text').checked) {
        showText();
    } else if(document.getElementById('data').checked) {
        showData();
    }
}

//Clear registers
function clearRegisters(){
    register = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,hexToBin("10000000"),hexToBin("7fffefff"),hexToBin("7fffefff"),0];
    PC = "00000000";
    RI = "";
    HI = "00000000";
    LO = "00000000";
}

/*
    Base conversion
*/
//Integer
function intToBin(int){
    var lzero = int < 0;
    int = Math.abs(parseInt(int));
    if(lzero){
        return twosComplement(pad(int.toString(2), 32));
    }
    return pad(int.toString(2), 32);
}

function intToHex(int){
    var bin = intToBin(int);
    return binToHex(bin);
}

//Binary
function binToInt(bin, unsigned){
    if(!unsigned){
        if(bin.indexOf("1") === 0)
            return -parseInt(twosComplement(bin), 2);
        else
            return parseInt(bin, 2);
    } else {
        return parseInt(bin, 2);
    }
}

function binToHex(bin){
    return pad(parseInt(bin, 2).toString(16), 8);
}

function binTo(bin, option){
    if(option === 1){
        return binToInt(bin);
    } else if (option === 2){
        return "0x" + binToHex(bin);
    } else {
        return bin;
    }
}

//Hexadecimal
function hexToBin(hex){
    return pad(parseInt(hex, 16).toString(2), 32);
}

function hexToInt(hex, unsigned){
    var bin = hexToBin(hex);
    return binToInt(bin, unsigned);
}

/*
    Code processing and code running
 */

//Check if File API is supported
if (window.File && window.FileReader && window.FileList && window.Blob) {
  console.log("File API is supported");
} else {
  document.getElementById('history').innerHTML += '<br><span style="color: rgb(255,59,48);">Warning!: File API is not supported in this browser</span> <br>';
}

//Handle the file upload and opening
function handleFileSelect(evt) {
    //Uploaded files list
    var files = evt.target.files; // FileList object

    //Display the user that we are loading the file
    var f = files[0];
    document.getElementById('output').innerHTML += "Opening: " + '<strong>' + escape(f.name) + '</strong> - ' +
                  f.size + ' bytes<br>';

    //Create a reader
    var reader = new FileReader();

    //Get file data
    reader.onload = function(event) {
        //Clear code and memory
        clearCode();
        clearRegisters();

        //Store the data as an array, replacing trailing whitespace and comments
        instructions = event.target.result.split(/(?:\r\n|\r|\n)/g);
        for (var i = 0; i < instructions.length; i++) {
            instructions[i] = instructions[i].replace(/\s{2,}/g, "");
            instructions[i] = instructions[i].replace(/\t{1,}/g, "");
            instructions[i] = instructions[i].replace(/#.+/g, "");
        }
        instructions = instructions.filter(function(v){return v !== ''});

        //Join in the same line, labels that are separated from instructions
        for (var i = 0; i < instructions.length; i++) {
            var temp = splitter(instructions[i]);
            if(temp[0] !== -1 && temp[1] === -1){
                instructions[i] = temp[0] + ": " + instructions[i+1];
                instructions[i+1] = "";
                i++;
            }
        }
        instructions = instructions.filter(function(v){return v !== ''});

        //Parse and evaluate instructions
        parseFile();
        showText();
    };

    // Read file as text.
    reader.readAsText(f);
}

//Parsing and evaluation
function parseFile(){
    var status = -1;
    console.log("Evaluating .data directives");
    for (var i = 0; i < getCodeStart(instructions); i++) {
        status = parseData(instructions[i]);
        if(status === 1){
            document.getElementById("output").innerHTML += '<span style="color: rgb(255,59,48);"><i>parseData()</i> <strong>Line ' + (1 + i) + "</strong>: " + instructions[i] + " is not a valid instruction. </span><br>";
            control = false;
        } else if(status === 2){
            document.getElementById("output").innerHTML += '<span style="color: rgb(255,59,48);"><i>parseData()</i> <strong>Line ' + (1 + i) + "</strong>: " + instructions[i] + " is using an incorrect label. </span><br>";
            control = false;
        } else if(status === 3){
            document.getElementById("output").innerHTML += '<span style="color: rgb(255,59,48);"><i>parseData()</i> <strong>Line ' + (1 + i) + "</strong>: " + instructions[i] + " is using non-ASCII characters </span><br>";
            control = false;
        }
    }

    status = -1;
    console.log("Evaluating .text instructions");
    var codeStart = getCodeStart(instructions);
    for (var i = codeStart; i < instructions.length; i++) {
        status = parseText(instructions[i]);
        if(status === 1){
            document.getElementById("output").innerHTML += '<span style="color: rgb(255,59,48);"><i>parseData()</i> <strong>Line ' + (1 + i + codeStart) + "</strong>: " + instructions[i] + " is not a valid instruction. </span><br>";
            control = false;
        } else if(status === 2){
            document.getElementById("output").innerHTML += '<span style="color: rgb(255,59,48);"><i>parseData()</i> <strong>Line ' + (1 + i + codeStart) + "</strong>: " + instructions[i] + " is using an incorrect label. </span><br>";
            control = false;
        }
    }
    document.getElementById("history").innerHTML += "\n";
    if(control === undefined){
        control = true;
    }
}

//Run
function run() {
    if(control){
        //Calculate the maximum instructions we can run
        var max = Math.min(hexToInt("0fffffff", true), hexToInt(textEnd, true));

        //Remove the run class
        document.getElementById("l" + last).classList.remove("run");

        //Run each of them
        for (var i = hexToInt(PC); i <= max; i += 4) {
            decode(memory[PC]);
            PC = intToHex(hexToInt(PC) + 4);
        }
    }
}

//Step
function step() {
    if(control){
        //Calculate the maximum instructions we can run
        var max = Math.min(hexToInt("0fffffff", true), hexToInt(textEnd, true));

        //Run one if we have not reached the maximum
        if(hexToInt(PC) <= max){

            //Highlight currently running instruction
            document.getElementById("l" + last).classList.remove("run");
            document.getElementById("l" + PC).classList.add("run");
            last = PC;

            decode(memory[PC]);
            PC = intToHex(hexToInt(PC) + 4);
        } else {
            document.getElementById("l" + last).classList.remove("run");
            document.getElementById("output").innerHTML += '<span style="color: rgb(255, 204, 0);"><strong>Warning</strong>: Reached end of code. Stopping. <br>';
        }
    }
}

/*
    Event Listeners
 */

document.getElementById('file').addEventListener('change', handleFileSelect, false);

/*
    Debug
 */
function debug(){
    memkeys = Object.keys(memory);
    console.log("Total memory size: " + (memkeys.length-1));
    console.log("Memory dump:");
    for (var i = 0; i < memkeys.length; i++) {
        if(memkeys[i] !== "push"){
            console.log("\t" + memkeys[i] + ": " + memory[memkeys[i]]);
        }
    }
    console.log("Total label: " + (textlabels.length+datalabels.length));
    console.log("Label dump:");
    for (var i = 0; i < textlabels.length; i++) {
        console.log("\t" + textlabels[i][1] + ": " + textlabels[i][0]);
    }
    for (var i = 0; i < datalabels.length; i++) {
        console.log("\t" + datalabels[i][1] + ": " + datalabels[i][0]);
    }
}
