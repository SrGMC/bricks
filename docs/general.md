# Types of instructions
## R-type
0. ADD
1. ADDU
2. SUB
3. SUBU
4. MUL
5. MULT
6. MULU
7. MULTU
8. DIV
9. DIVU
10. SLT
11. SLTU
12. AND
13. OR
14. NOR
15. XOR
16. CLO
17. CLZ
18. SLLV
19. SRLV
20. SLL
21. SRL
22. SRA
23. MFHI
24. MFLO
25. MTHI
26. MTLO
27. MOVN
28. MOVZ

## I-type
0. ADDI
1. ADDIU
2. ANDI
3. LB
4. LBU
5. LH
6. LHU
7. LW
8. LWL
9. LWR
10. ORI
11. SLTI
12. SLTIU
13. SW
14. SB
15. SH
16. SWL
17. SWR
18. XORI
19. LUI
20. BEQ
21. BGTZ
22. BLEZ
23. BLTZ
24. BNE

## J-type
0. BGEZ
1. BGEZAL
2. BLTZAL
3. J
4. JAL
5. JALR
6. JR
7. NOOP
8. SYSCALL

# Line types

```mips
label:
# comment
instruction

label: instruction
label: # comment
label: instruction # comment
```
