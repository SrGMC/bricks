.data

msg: .asciiz "Introduce un numero"


.text

.globl main

main:
li $v0 4
la $a0 msg
syscall
li $v0 5 #para que introduzca un número
syscall

move $t0 $v0   # $t0 = N
li $t1 0   # int i = 1 (for)

for:
	bgt $t1 $t0 fin
	addi $t1 $t1 1  # j++
resetA:
	li $t2 1  #$t2 = a
while:
	bgt $t2 $t1 for
	li $v0 1
	move $a0 $t2
	syscall
	addi $t2 $t2 1
	b while
fin:
	jr $ra


