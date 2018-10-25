.data
    test1: .ascii "Test1"
    test2: .asciiz "Test2"
    test3: .byte -1, 1
    test4: .half -1, 1
    test5: .word -1, 1
    test6: .space 3

# Test
.text
main: beq $t0 $t0 main #Test
bge $t0 $t0 main
bgeu $t0 $t0 main
bgt $t0 $t0 main
bgtu $t0 $t0 main
ble $t0 $t0 main
bleu $t0 $t0 main
blt $t0 $t0 main
bltu $t0 $t0 main
bne $t0 $t0 main
addi $t0 $t0 16
addiu $t0 $t0 16
ori $t0 $t0 16
run: xori $t0 $t0 16
run2: andi $t0 $t0 16
slti $t0 $t0 16
sltui $t0 $t0 16
sllv $t0 $t0 $t0
srav $t0 $t0 $t0
srlv $t0 $t0 $t0
rem $t0 $t0 $t0
remu $t0 $t0 $t0
add $t0 $t0 $t0
addu $t0 $t0 $t0
sub $t0 $t0 $t0
subu $t0 $t0 $t0
or $t0 $t0 $t0
xor $t0 $t0 $t0
and $t0 $t0 $t0
nor $t0 $t0 $t0
div $t0 $t0 $t0
divu $t0 $t0 $t0
mul $t0 $t0 $t0
mulo $t0 $t0 $t0
mulou $t0 $t0 $t0
rol $t0 $t0 $t0
ror $t0 $t0 $t0
seq $t0 $t0 $t0
sge $t0 $t0 $t0
sgeu $t0 $t0 $t0
sgt $t0 $t0 $t0
sgtu $t0 $t0 $t0
sle $t0 $t0 $t0
sleu $t0 $t0 $t0
slt $t0 $t0 $t0
sltu $t0 $t0 $t0
sne $t0 $t0 $t0
sll $t0 $t0 5
sra $t0 $t0 5
srl $t0 $t0 5
la $t0 test1($t0)
lb $t0 4($t0)
lbu $t0 test2($t0)
lh $t0 test4
lhu $t0 test5
lw $t0 test6
sb $t0 0x10000000
sh $t0 0x10000000
sw $t0 0x10000000
beqz $t0 main
bgez $t0 main
bgezal $t0 main
bgtz $t0 main
blez $t0 main
bltzal $t0 main
bltz $t0 main
bnez $t0 main
lui $t0 16
li $t0 16
move $t0 $t0
abs $t0 $t0
neg $t0 $t0
negu $t0 $t0
not $t0 $t0
mult $t0 $t0
multu $t0 $t0
b 0x00000000
j main
jal main
mfhi $t0
mflo $t0
mthi $t0
mtlo $t0
jalr $t0
jr $t0
