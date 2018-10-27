//Functions to check the operations
function isHex(hex){
    return (hex.indexOf("0x") === 0) ? true : false;
}

var insReg = function (reg){
    return getRegisterId(reg) !== -1;
};

var insLabel = function (label){
    if (isHex(label)) {
        return true;
    }
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
    "beq": {"check": [insReg, insReg, insLabel], "run": beq},
    "bge": {"check": [insReg, insReg, insLabel], "run": []},
    "bgeu": {"check": [insReg, insReg, insLabel], "run": []},
    "bgt": {"check": [insReg, insReg, insLabel], "run": []},
    "bgtu": {"check": [insReg, insReg, insLabel], "run": []},
    "ble": {"check": [insReg, insReg, insLabel], "run": []},
    "bleu": {"check": [insReg, insReg, insLabel], "run": []},
    "blt": {"check": [insReg, insReg, insLabel], "run": []},
    "bltu": {"check": [insReg, insReg, insLabel], "run": []},
    "bne": {"check": [insReg, insReg, insLabel], "run": []},

    "addi": {"check": [insReg, insReg, insInm16], "run": []},
    "addiu": {"check": [insReg, insReg, insInm16], "run": []},
    "ori": {"check": [insReg, insReg, insInm16], "run": []},
    "xori": {"check": [insReg, insReg, insInm16], "run": []},
    "andi": {"check": [insReg, insReg, insInm16], "run": []},
    "slti": {"check": [insReg, insReg, insInm16], "run": []},
    "sltui": {"check": [insReg, insReg, insInm16], "run": []},

    "sllv": {"check": [insReg, insReg, insReg], "run": []},
    "srav": {"check": [insReg, insReg, insReg], "run": []},
    "srlv": {"check": [insReg, insReg, insReg], "run": []},
    "rem": {"check": [insReg, insReg, insReg], "run": []},
    "remu": {"check": [insReg, insReg, insReg], "run": []},
    "add": {"check": [insReg, insReg, insReg], "run": []},
    "addu": {"check": [insReg, insReg, insReg], "run": []},
    "sub": {"check": [insReg, insReg, insReg], "run": []},
    "subu": {"check": [insReg, insReg, insReg], "run": []},
    "or": {"check": [insReg, insReg, insReg], "run": []},
    "xor": {"check": [insReg, insReg, insReg], "run": []},
    "and": {"check": [insReg, insReg, insReg], "run": []},
    "nor": {"check": [insReg, insReg, insReg], "run": []},
    "div": {"check": [insReg, insReg, insReg], "run": []},
    "divu": {"check": [insReg, insReg, insReg], "run": []},
    "mul": {"check": [insReg, insReg, insReg], "run": []},
    "mulo": {"check": [insReg, insReg, insReg], "run": []},
    "mulou": {"check": [insReg, insReg, insReg], "run": []},
    "rol": {"check": [insReg, insReg, insReg], "run": []},
    "ror": {"check": [insReg, insReg, insReg], "run": []},
    "seq": {"check": [insReg, insReg, insReg], "run": []},
    "sge": {"check": [insReg, insReg, insReg], "run": []},
    "sgeu": {"check": [insReg, insReg, insReg], "run": []},
    "sgt": {"check": [insReg, insReg, insReg], "run": []},
    "sgtu": {"check": [insReg, insReg, insReg], "run": []},
    "sle": {"check": [insReg, insReg, insReg], "run": []},
    "sleu": {"check": [insReg, insReg, insReg], "run": []},
    "slt": {"check": [insReg, insReg, insReg], "run": []},
    "sltu": {"check": [insReg, insReg, insReg], "run": []},
    "sne": {"check": [insReg, insReg, insReg], "run": []},

    "sll": {"check": [insReg, insReg, insInm5], "run": []},
    "sra": {"check": [insReg, insReg, insInm5], "run": []},
    "srl": {"check": [insReg, insReg, insInm5], "run": []},

    "la": {"check": [insReg, insDir], "run": []},
    "lb": {"check": [insReg, insDir], "run": []},
    "lbu": {"check": [insReg, insDir], "run": []},
    "lh": {"check": [insReg, insDir], "run": []},
    "lhu": {"check": [insReg, insDir], "run": []},
    "lw": {"check": [insReg, insDir], "run": []},
    "sb": {"check": [insReg, insDir], "run": []},
    "sh": {"check": [insReg, insDir], "run": []},
    "sw": {"check": [insReg, insDir], "run": []},

    "beqz": {"check": [insReg, insLabel], "run": []},
    "bgez": {"check": [insReg, insLabel], "run": []},
    "bgezal": {"check": [insReg, insLabel], "run": []},
    "bgtz": {"check": [insReg, insLabel], "run": []},
    "blez": {"check": [insReg, insLabel], "run": []},
    "bltzal": {"check": [insReg, insLabel], "run": []},
    "bltz": {"check": [insReg, insLabel], "run": []},
    "bnez": {"check": [insReg, insLabel], "run": []},

    "lui": {"check": [insReg, insInm16], "run": []},

    "li": {"check": [insReg, insInm32], "run": []},

    "move": {"check": [insReg, insReg], "run": []},
    "abs": {"check": [insReg, insReg], "run": []},
    "neg": {"check": [insReg, insReg], "run": []},
    "negu": {"check": [insReg, insReg], "run": []},
    "not": {"check": [insReg, insReg], "run": []},
    "mult": {"check": [insReg, insReg], "run": []},
    "multu": {"check": [insReg, insReg], "run": []},

    "b": {"check": [insLabel], "run": []},
    "j": {"check": [insLabel], "run": []},
    "jal": {"check": [insLabel], "run": []},

    "mfhi": {"check": [insReg], "run": []},
    "mflo": {"check": [insReg], "run": []},
    "mthi": {"check": [insReg], "run": []},
    "mtlo": {"check": [insReg], "run": []},
    "jalr": {"check": [insReg], "run": []},
    "jr": {"check": [insReg], "run": []}
};
