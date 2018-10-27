//Functions to check the operations
function isHex(hex){
    return (hex.indexOf("0x") === 0) ? true : false;
}

var insReg = function (reg){
    return getRegisterId(reg) !== -1;
};

var insLabel = function (label){
    return !isReserved(label);
};

var insInm16 = function (inm16){
    if(isHex(inm16)){
        inm16 = hexToInt(inm16, false);
    }
    return (MIN_16BIT <= inm16 && inm16 <= MAX_16BIT);
};

var insInm32 = function (inm32){
    if(isHex(inm32)){
        inm32 = hexToInt(inm32);
    }
    return (MIN_SINT <= inm32 && inm32 <= MAX_SINT);
};

var insInm5 = function (inm5){
    if(isHex(inm5)){
        inm5 = hexToInt(inm5);
    }
    return (0 <= inm5 && inm5 <= MAX_5BIT);
};

var insDir = function (dir){
    return checkDir(dir) !== -1;
};

const operations = {
    "beq": [insReg, insReg, insLabel],
    "bge": [insReg, insReg, insLabel],
    "bgeu": [insReg, insReg, insLabel],
    "bgt": [insReg, insReg, insLabel],
    "bgtu": [insReg, insReg, insLabel],
    "ble": [insReg, insReg, insLabel],
    "bleu": [insReg, insReg, insLabel],
    "blt": [insReg, insReg, insLabel],
    "bltu": [insReg, insReg, insLabel],
    "bne": [insReg, insReg, insLabel],

    "addi": [insReg, insReg, insInm16],
    "addiu": [insReg, insReg, insInm16],
    "ori": [insReg, insReg, insInm16],
    "xori": [insReg, insReg, insInm16],
    "andi": [insReg, insReg, insInm16],
    "slti": [insReg, insReg, insInm16],
    "sltui": [insReg, insReg, insInm16],

    "sllv": [insReg, insReg, insReg],
    "srav": [insReg, insReg, insReg],
    "srlv": [insReg, insReg, insReg],
    "rem": [insReg, insReg, insReg],
    "remu": [insReg, insReg, insReg],
    "add": [insReg, insReg, insReg],
    "addu": [insReg, insReg, insReg],
    "sub": [insReg, insReg, insReg],
    "subu": [insReg, insReg, insReg],
    "or": [insReg, insReg, insReg],
    "xor": [insReg, insReg, insReg],
    "and": [insReg, insReg, insReg],
    "nor": [insReg, insReg, insReg],
    "div": [insReg, insReg, insReg],
    "divu": [insReg, insReg, insReg],
    "mul": [insReg, insReg, insReg],
    "mulo": [insReg, insReg, insReg],
    "mulou": [insReg, insReg, insReg],
    "rol": [insReg, insReg, insReg],
    "ror": [insReg, insReg, insReg],
    "seq": [insReg, insReg, insReg],
    "sge": [insReg, insReg, insReg],
    "sgeu": [insReg, insReg, insReg],
    "sgt": [insReg, insReg, insReg],
    "sgtu": [insReg, insReg, insReg],
    "sle": [insReg, insReg, insReg],
    "sleu": [insReg, insReg, insReg],
    "slt": [insReg, insReg, insReg],
    "sltu": [insReg, insReg, insReg],
    "sne": [insReg, insReg, insReg],

    "sll": [insReg, insReg, insInm5],
    "sra": [insReg, insReg, insInm5],
    "srl": [insReg, insReg, insInm5],

    "la": [insReg, insDir],
    "lb": [insReg, insDir],
    "lbu": [insReg, insDir],
    "lh": [insReg, insDir],
    "lhu": [insReg, insDir],
    "lw": [insReg, insDir],
    "sb": [insReg, insDir],
    "sh": [insReg, insDir],
    "sw": [insReg, insDir],

    "beqz": [insReg, insLabel],
    "bgez": [insReg, insLabel],
    "bgezal": [insReg, insLabel],
    "bgtz": [insReg, insLabel],
    "blez": [insReg, insLabel],
    "bltzal": [insReg, insLabel],
    "bltz": [insReg, insLabel],
    "bnez": [insReg, insLabel],

    "lui": [insReg, insInm16],

    "li": [insReg, insInm32],

    "move": [insReg, insReg],
    "abs": [insReg, insReg],
    "neg": [insReg, insReg],
    "negu": [insReg, insReg],
    "not": [insReg, insReg],
    "mult": [insReg, insReg],
    "multu": [insReg, insReg],

    "b": [insLabel],
    "j": [insLabel],
    "jal": [insLabel],

    "mfhi": [insReg],
    "mflo": [insReg],
    "mthi": [insReg],
    "mtlo": [insReg],
    "jalr": [insReg],
    "jr": [insReg]
};
