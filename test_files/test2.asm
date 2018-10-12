.data
    .asciiz "123"
    .space 4
.text
main:
    li $t0 0xFFFFFFFF

    main2: jr $ra
