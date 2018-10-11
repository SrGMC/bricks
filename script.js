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

var memory = {};
var register = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var labels = {};
var textEnd = PC;

const MAX_UINT = Math.pow(2, 32) - 1;
const MAX_SINT = Math.pow(2, 31) - 1;
const MIN_UINT = 0;
const MIN_SINT = -Math.pow(2, 31);

//File data are stored here
var instructions = [];
var index = 0; //Determines the next index to be used to store file data

//Web
display();
var t = setInterval(display, 500);

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
    document.getElementById('sidebar').innerHTML += "$ze: " + binTo(register[0] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$at: " + binTo(register[1] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$v0: " + binTo(register[2] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$v1: " + binTo(register[3] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$a0: " + binTo(register[4] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$a1: " + binTo(register[5] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$a2: " + binTo(register[6] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$a3: " + binTo(register[7] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$t0: " + binTo(register[8] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$t1: " + binTo(register[9] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$t2: " + binTo(register[10] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$t3: " + binTo(register[11] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$t4: " + binTo(register[12] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$t5: " + binTo(register[13] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$t6: " + binTo(register[14] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$t7: " + binTo(register[15] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$s0: " + binTo(register[16] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$s1: " + binTo(register[17] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$s2: " + binTo(register[18] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$s3: " + binTo(register[19] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$s4: " + binTo(register[20] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$s5: " + binTo(register[21] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$s6: " + binTo(register[22] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$s7: " + binTo(register[23] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$t8: " + binTo(register[24] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$t9: " + binTo(register[25] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$k0: " + binTo(register[26] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$k1: " + binTo(register[27] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$gp: " + binTo(register[28] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$sp: " + binTo(register[29] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$fp: " + binTo(register[30] + "", option) + '<br>';
    document.getElementById('sidebar').innerHTML += "$ra: " + binTo(register[31] + "", option) + '<br>';
}

function display(){
    var height = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
    var navh = document.getElementById('nav').offsetHeight;
    var inputh = document.getElementById('outputdiv').offsetHeight;
    document.getElementById('sidebar_main').style.height = (height - (navh + inputh) - 30) + "px";
    document.getElementById('history').style.height = (height - (navh + inputh) - 30) + "px";
    updateSidebar();
}

function clearCode(){
    document.getElementById("history").innerHTML = '<i>Welcome to Bricks!, an Open Source MIPS32 simulator.</i><br><br><span style="font-family:helvetica;">Open</span>  &nbsp;Press "Open" to open a new program.<br><img src="assets/run_tutorial.png" height="18px">  &nbsp;&nbsp; Press "Run" to run the whole program.<br><img src="assets/step_tutorial.png" height="18px">  &nbsp;&nbsp; Press "Step" to run the program line by line.<br><img src="assets/clear_tutorial.png" height="18px">  &nbsp;&nbsp; Press "Clear" to clear the registers.<br><img src="assets/clear_code_tutorial.png" height="20px">  &nbsp;&nbsp; Press "Reset" to clear the opened code.<br>';
    document.getElementById("output").innerHTML = "";
    instructions = [];
    index = 0;
}

function clearRegisters(){
    for (var i = 0; i < register.length; i++) {
        register[i] = 0;
    }
    PC = "00000000";
    RI = "";
    HI = "00000000";
    LO = "00000000";
    textEnd = PC;
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
    Code processing and code runner
 */

//Check if File API is supported
if (window.File && window.FileReader && window.FileList && window.Blob) {
  console.log("File API is supported");
} else {
  document.getElementById('history').innerHTML += '<br><span style="color: rgb(255,59,48);">Warning!: File API is not supported in this browser</span> <br>';
}

//Handle the file upload and opening
function handleFileSelect(evt) {
    //Check if there's already a file opened
    var confirmation;
    if(instructions.length === 0){
        document.getElementById("history").innerHTML = "";
    }
    if(instructions.length >= 1){
        confirmation = confirm("Files are already opened. Do you wish to overwrite them?");
    }

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
        //Clear the code window if the user overwrites
        if(confirmation){
            instructions = [];
            index = 0;
            document.getElementById("history").innerHTML = "";
        }

        //Store the data as an array, in lowercase
        instructions[index] = event.target.result.toLowerCase().split(/(?:\r\n|\r|\n)/g);
        //Parse and evaluate instructions
        parseFile();
        index++;
    };

    // Read file as text.
    reader.readAsText(f);
}

//Parsing and evaluation
function parseFile(){
    //Store PC temporarily. This is used if another file is loaded with an already loaded one
    var temp = PC;

    //Parse all the labels
    console.log("Parsing labels");
    var control = parseLabels(instructions[index]);
    console.log(control ? " passed" : " error");

    //Display the user if there's an error with a label
    if(!control[0] && control[1] === 0){
        document.getElementById("output").innerHTML += '<span style="color: rgb(255,59,48);"><strong>Line ' + (1 + control[2]) + "</strong>: " + instructions[index][control[2]] + " is using a reserved word as label. </span><br>";
    } else if(!control[0] && control[1] === 1){
        document.getElementById("output").innerHTML += '<span style="color: rgb(255,59,48);"><strong>Line ' + (1 + control[2]) + "</strong>: " + instructions[index][control[2]] + ". Label already exists. <br>";
    }

    //Evaluate all .text instructions
    for (var i = getCodeStart(instructions[index]); i < instructions[index].length && control; i++) {
        console.log("Evaluating instruction " + instructions[index][i]);
        if(parseText(instructions[index][i])){
            document.getElementById("history").innerHTML += instructions[index][i] + "<br>";
            console.log(" passed");
        } else {
            console.log(" error");
            document.getElementById("output").innerHTML += '<span style="color: rgb(255,59,48);"><strong>Line ' + (1 + i) + "</strong>: " + instructions[index][i] + " is not a valid instruction. </span><br>";
            break;
        }
    }
    //TODO: Evaluate .data instructions

    //Restore everything and store the end address of the code
    textEnd = intToHex(hexToInt(PC) - 4);
    PC = temp;
}

//Run
function run() {
    //Calculate the maximum instructions we can run
    var max = Math.min(hexToInt(10000000, true), hexToInt(textEnd, true));

    //Run each of them
    for (var i = hexToInt(PC); i < max; i += 4) {
        decode(memory[PC]);
        PC = intToHex(hexToInt(PC) + 4);
    }
}

//Step
function step() {
    //Calculate the maximum instructions we can run
    var max = Math.min(hexToInt(10000000, true), hexToInt(textEnd, true));

    //Run one if we have not reached the maximum
    if(hexToInt(PC) <= max){
        decode(memory[PC]);
        PC = intToHex(hexToInt(PC) + 4);
    } else {
        document.getElementById("output").innerHTML += '<span style="color: rgb(255, 204, 0);"><strong>Warning</strong>: Reached end of code. Stopping. <br>';
    }
}

/*
    Event Listeners
 */

document.getElementById('file').addEventListener('change', handleFileSelect, false);
