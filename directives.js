//TODO: Functions that checks the directives and modifies the instruction array
var dirText = "";
var dirByte = "";
var dirSpace = "";
var dirHalf = "";
var dirWord = "";

const directives = {
    ".asciiz": dirText,
    ".ascii": dirText,
    ".byte": dirByte,
    ".space": dirSpace,
    ".half": dirHalf,
    ".word": dirWord
};
