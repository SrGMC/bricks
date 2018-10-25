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
//Variables
var PC = "00000000";
var RI = "";

var HI = "00000000";
var LO = "00000000";

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
var register = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,hexToBin("10000000"),hexToBin("7fffefff"),hexToBin("7fffefff"),0];
var textlabels = [];
var datalabels = [];
var textEnd = "00000000";
var dataEnd = "10000000";

var last = PC;

const MAX_UINT = Math.pow(2, 32) - 1;
const MAX_SINT = Math.pow(2, 31) - 1;
const MIN_UINT = 0;
const MIN_SINT = -Math.pow(2, 31);

//File data are stored here
var instructions = "";
var index = 0; //TODO: Determines the next index to be used to store file data
var text = document.getElementById('history').innerHTML;

//Settings array
//show whole code,
var settings = [true];
//Controls if code was succesfully parsed
var control;

//Web
display();
var t = setInterval(display, 500);

if (("standalone" in window.navigator) && !window.navigator.standalone){
    console.log("Full screen mode");
    document.getElementById('install').style.display = "initial";
}

function showModal(id){
    document.getElementById('modal_background').style.display = 'initial';
    document.getElementById(id).style.top = '10%';
    document.getElementById(id).style.bottom = '10%';
}

function hideModal(id){
    document.getElementById('modal_background').style.display = 'none';
    document.getElementById(id).style.top = '100%';
    document.getElementById(id).style.bottom = '-200%';
}

function updateSidebar(){
    var option = 1;
    if(document.getElementById('option-2').checked) {
        option = 2;
    } else if(document.getElementById('option-3').checked) {
        option = 3;
    }
    document.getElementById('sidebar').innerHTML  = "$PC: " + binTo(hexToBin(PC) + "", option) + "<br><br>";
    document.getElementById('sidebar').innerHTML += "$HI: " + binTo(hexToBin(HI) + "", option) + "<br>";
    document.getElementById('sidebar').innerHTML += "$LO: " + binTo(hexToBin(LO) + "", option) + "<br><br>";
    for (var i = 0; i < registerid.length; i++) {
        document.getElementById('sidebar').innerHTML += registerid[i][0] + ": " + binTo(register[i] + "", option) + '<br>';
    }
}

function display(){
    var height = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
    var navh = document.getElementById('nav').offsetHeight;
    var inputh = document.getElementById('outputdiv').offsetHeight;
    var controlh = document.getElementById('control').offsetHeight;
    document.getElementById('sidebar_main').style.height = (height - (navh + inputh) - 30) + "px";
    document.getElementById('history_main').style.height = (height - (navh + inputh) - 30) + "px";
    document.getElementById('sidebar').style.height = (height - (navh + inputh + controlh) - 30) + "px";
    document.getElementById('history').style.height = (height - (navh + inputh + controlh) - 30) + "px";
    updateSidebar();
}

function clearCode(){
    document.getElementById("history").innerHTML = '<i>Welcome to Bricks!, an Open Source MIPS32 simulator.</i><br><br><span style="font-family:helvetica;">Open</span>  &nbsp;Press "Open" to open a new program.<br><img src="assets/run_tutorial.png" height="18px">  &nbsp;&nbsp; Press "Run" to run the whole program.<br><img src="assets/step_tutorial.png" height="18px">  &nbsp;&nbsp; Press "Step" to run the program line by line.<br><img src="assets/clear_tutorial.png" height="18px">  &nbsp;&nbsp; Press "Clear" to clear the registers.<br><img src="assets/clear_code_tutorial.png" height="20px">  &nbsp;&nbsp; Press "Reset" to clear the opened code.<br><br><br>';
    document.getElementById("output").innerHTML = "";
    instructions = [];
    index = 0;
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
}

function clearRegisters(){
    register = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,hexToBin("10000000"),hexToBin("7fffefff"),hexToBin("7fffefff"),0];
    PC = "00000000";
    RI = "";
    HI = "00000000";
    LO = "00000000";
}

function getLabelName(hex){
    for (var i = 0; i < textlabels.length; i++) {
        if(textlabels[i][1] === hex){
            return textlabels[i][0] + "<br>";
        }
    }

    return "";
}

function showText(){
    if(control === undefined){
        document.getElementById("history").innerHTML = '<i>Welcome to Bricks!, an Open Source MIPS32 simulator.</i><br><br><span style="font-family:helvetica;">Open</span>  &nbsp;Press "Open" to open a new program.<br><img src="assets/run_tutorial.png" height="18px">  &nbsp;&nbsp; Press "Run" to run the whole program.<br><img src="assets/step_tutorial.png" height="18px">  &nbsp;&nbsp; Press "Step" to run the program line by line.<br><img src="assets/clear_tutorial.png" height="18px">  &nbsp;&nbsp; Press "Clear" to clear the registers.<br><img src="assets/clear_code_tutorial.png" height="20px">  &nbsp;&nbsp; Press "Reset" to clear the opened code.<br><br><br>';
    } else if(control){
        document.getElementById("history").innerHTML = "";
        for (var i = 0; i < hexToInt(textEnd); i += 4) {
            document.getElementById("history").innerHTML += '<span class="num">' + getLabelName(intToHex(i)) + (i/4 + 1) + '.</span><span class="code" id="l' + intToHex(i) + '">' + memory[intToHex(i)].join(" ") + "</span><br>";
        }
    } else {
        document.getElementById('history').innerHTML = '<br><span style="color: rgb(255,204,0);">An error has occurred while parsing the file. More information is available in the console window.</span> <br>';
    }
}

function dataHex(pos){
    var result = binToHex(memory[intToHex(pos)]);
    return (result.indexOf("NaN") === -1) ? result.substring(6) : "&nbsp;&nbsp;";
}

function binToASCII(bin){
    if(pad(bin, 32) === pad("0", 32)){
        return ".";
    }
    if(!isASCII(String.fromCharCode(binToInt(pad(bin, 32))))){
        return ".";
    }
    return String.fromCharCode(binToInt(pad(bin, 32)));
}

function showData(){
    document.getElementById("history").innerHTML = "[ User data segment&nbsp; ]<br>";
    var offset = hexToInt("10000000");
    for (var i = 0; i < hexToInt(dataEnd)-offset; i += 8) {
        document.getElementById("history").innerHTML += "[" + intToHex(offset+i) + "]<br>&nbsp;&nbsp;" +
                                                        dataHex(offset+i) +
                                                        dataHex(offset+i+1) +
                                                        dataHex(offset+i+2) +
                                                        dataHex(offset+i+3) + "&nbsp;" +
                                                        dataHex(offset+i+4) +
                                                        dataHex(offset+i+5) +
                                                        dataHex(offset+i+6) +
                                                        dataHex(offset+i+7) + "&nbsp;&nbsp;";
        document.getElementById("history").innerHTML += binToASCII(memory[intToHex(offset+i)]) + "&nbsp;" +
                                                        ((dataHex(offset+i+1) === "&nbsp;&nbsp;") ? "." : binToASCII(memory[intToHex(offset+i+1)])) + "&nbsp;" +
                                                        ((dataHex(offset+i+2) === "&nbsp;&nbsp;") ? "." : binToASCII(memory[intToHex(offset+i+2)])) + "&nbsp;" +
                                                        ((dataHex(offset+i+3) === "&nbsp;&nbsp;") ? "." : binToASCII(memory[intToHex(offset+i+3)])) + "&nbsp;" +
                                                        ((dataHex(offset+i+4) === "&nbsp;&nbsp;") ? "." : binToASCII(memory[intToHex(offset+i+4)])) + "&nbsp;" +
                                                        ((dataHex(offset+i+5) === "&nbsp;&nbsp;") ? "." : binToASCII(memory[intToHex(offset+i+5)])) + "&nbsp;" +
                                                        ((dataHex(offset+i+6) === "&nbsp;&nbsp;") ? "." : binToASCII(memory[intToHex(offset+i+6)])) + "&nbsp;" +
                                                        ((dataHex(offset+i+7) === "&nbsp;&nbsp;") ? "." : binToASCII(memory[intToHex(offset+i+7)])) + "<br>";
    }
    document.getElementById("history").innerHTML += "<br><br>[ User stack segment ]<br>";
    offset = hexToInt("7fffefff");
    for (var i = 0; i < binToInt(register[29])-offset; i += 8) {
        document.getElementById("history").innerHTML += "[" + intToHex(offset+i) + "]<br>&nbsp;&nbsp;" +
                                                        dataHex(offset+i) +
                                                        dataHex(offset+i+1) +
                                                        dataHex(offset+i+2) +
                                                        dataHex(offset+i+3) + "&nbsp;" +
                                                        dataHex(offset+i+4) +
                                                        dataHex(offset+i+5) +
                                                        dataHex(offset+i+6) +
                                                        dataHex(offset+i+7) + "&nbsp;&nbsp;";
        document.getElementById("history").innerHTML += binToASCII(memory[intToHex(offset+i)]) + "&nbsp;" +
                                                        ((dataHex(offset+i+1) === "&nbsp;&nbsp;") ? "." : binToASCII(memory[intToHex(offset+i+1)])) + "&nbsp;" +
                                                        ((dataHex(offset+i+2) === "&nbsp;&nbsp;") ? "." : binToASCII(memory[intToHex(offset+i+2)])) + "&nbsp;" +
                                                        ((dataHex(offset+i+3) === "&nbsp;&nbsp;") ? "." : binToASCII(memory[intToHex(offset+i+3)])) + "&nbsp;" +
                                                        ((dataHex(offset+i+4) === "&nbsp;&nbsp;") ? "." : binToASCII(memory[intToHex(offset+i+4)])) + "&nbsp;" +
                                                        ((dataHex(offset+i+5) === "&nbsp;&nbsp;") ? "." : binToASCII(memory[intToHex(offset+i+5)])) + "&nbsp;" +
                                                        ((dataHex(offset+i+6) === "&nbsp;&nbsp;") ? "." : binToASCII(memory[intToHex(offset+i+6)])) + "&nbsp;" +
                                                        ((dataHex(offset+i+7) === "&nbsp;&nbsp;") ? "." : binToASCII(memory[intToHex(offset+i+7)])) + "<br>";
    }
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
        instructions = [];
        index = 0;
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
        index++;
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
