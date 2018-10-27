/*
    Display
 */
//Update display every 500 ms
display();
var t = setInterval(display, 500);

//Show "Install" button if it is not an installed webapp
if (("standalone" in window.navigator) && !window.navigator.standalone){
    console.log("Full screen mode");
    document.getElementById('install').style.display = "initial";
}

//Modal controls
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

//Update the sidebar values
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

//Update the display
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

//Returns the label for a given hexadecimal value
//Returns: label name + <br>. If it does not exists it returns an empty string
function getLabelName(hex){
    for (var i = 0; i < textlabels.length; i++) {
        if(textlabels[i][1] === hex){
            return textlabels[i][0] + "<br>";
        }
    }

    return "";
}
function getLabelDir(label){
    for (var i = 0; i < textlabels.length; i++) {
        if(textlabels[i][0] === label){
            return textlabels[i][1];
        }
    }

    return -1;
}

//Returns the hexadecimal value of the given position in memory
function dataHex(pos){
    var result = binToHex(memory[intToHex(pos)]);
    return (result.indexOf("NaN") === -1) ? result.substring(6) : "&nbsp;&nbsp;";
}

//Returns the ASCII character
function binToASCII(bin){
    if(pad(bin, 32) === pad("0", 32)){
        return ".";
    }
    if(!isASCII(String.fromCharCode(binToInt(pad(bin, 32))))){
        return ".";
    }
    return String.fromCharCode(binToInt(pad(bin, 32)));
}

//Shows the .text segment of the file
function showText(){
    if(control === undefined){
        document.getElementById("history").innerHTML = '<i>Welcome to Bricks!, an Open Source MIPS32 simulator.</i><br><br><span style="font-family:helvetica;">Open</span>  &nbsp;Press "Open" to open a new program.<br><img src="assets/run_tutorial.png" height="18px">  &nbsp;&nbsp; Press "Run" to run the whole program.<br><img src="assets/step_tutorial.png" height="18px">  &nbsp;&nbsp; Press "Step" to run the program line by line.<br><img src="assets/clear_tutorial.png" height="18px">  &nbsp;&nbsp; Press "Clear" to clear the registers.<br><img src="assets/clear_code_tutorial.png" height="20px">  &nbsp;&nbsp; Press "Reset" to clear the opened code.<br><br><br>';
    } else if(control){
        document.getElementById("history").innerHTML = "";
        for (var i = 0; i < hexToInt(textEnd); i += 4) {
            document.getElementById("history").innerHTML += '<span class="num">' + getLabelName(intToHex(i)) + (i/4 + 1) + '.</span><span class="code" id="l' + intToHex(i) + '">' + memory[intToHex(i)].join(" ") + "</span><br>";
        }
    } else {
        document.getElementById('history').innerHTML = '<br><span style="color: rgb(255,59,48);">An error has occurred. More information is available in the console window down below.</span> <br>';
    }
}

//Shows the .data segment in memory of the file
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
