class GenerateSudoku {

    gen_unsolved_sudoku(board, filled) {

        let emp = 81 - filled
        let i = 0

        while (i < emp) {
            let l = this.shuffle(0, 8)
            let ran_r = l.pop()

            l = this.shuffle(0, 8)
            let ran_c = l.pop()

            if (board[ran_r][ran_c] === 0) {
                continue
            }

            let val = board[ran_r][ran_c]
            board[ran_r][ran_c] = 0
            i++
        }

    }

    isValid(board, k, i, j) {
        let c = k
        for (let m = 0; m < 9; m++) {

            if (m != j && board[i][m] === c) {
                return false
            }
        }

        for (let m = 0; m < 9; m++) {
            if (m != i && board[m][j] === c) {
                return false
            }
        }

        let sub_i = 3 * (parseInt(i / 3))
        let sub_j = 3 * (parseInt(j / 3))
        for (let m = 0; m < 3; m++) {
            for (let n = 0; n < 3; n++) {
                if (board[sub_i + m][sub_j + n] == c) {
                    return false
                }
            }
        }
        return true
    }

    solve(board, i, j) {
        let ni = 0
        let nj = 0

        if (i === 9) {
            return true
        }

        if (j === 8) {
            ni = i + 1
            nj = 0
        }

        else {
            nj = j + 1
            ni = i
        }

        if (board[i][j] === 0) {
            for (let k = 1; k <= 9; k++) {
                if (this.isValid(board, k, i, j)) {
                    let c = k
                    board[i][j] = c
                    if (this.solve(board, ni, nj)) {
                        return true
                    }
                    board[i][j] = 0
                }
            }
        } else {
            if (this.solve(board, ni, nj)) {
                return true
            }
        }
        return false
    }

    shuffle(a, b) {
        // let array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        let array = []

        for (let i = a; i <= b; i++) {
            array.push(i)
        }

        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array
    }

    gen_diag(board) {
        let numbers = this.shuffle(1, 9)
        for (let i = 0; i < 9; i++) {
            board[i][i] = numbers[i]
        }
    }

    generateBoard() {
        let numRows = 9;
        let numCols = 9;
        let matrix = [];

        for (let i = 0; i < numRows; i++) {
            matrix[i] = [];
            for (let j = 0; j < numCols; j++) {
                matrix[i][j] = 0;
            }
        }
        return matrix
    }

    call(choice) {
        let board = this.generateBoard()
        let solution = this.generateBoard()
        this.gen_diag(board)
        this.solve(board, 0, 0)

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                solution[i][j] = board[i][j]
            }
        }

        if (choice === 1) {
            this.gen_unsolved_sudoku(board, 43)
        }

        else if (choice === 2) {
            this.gen_unsolved_sudoku(board, 38)
        }

        else {
            this.gen_unsolved_sudoku(board, 31)
        }

        
        let boardString = ""
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                let num = board[i][j]
                if (board[i][j] !== 0)
                    boardString += num.toString()
                else
                    boardString += "-"

            }
            boardString += " "
        }

        let solutionString = ""
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                let num = solution[i][j]
                solutionString += num.toString()
            }
            solutionString += " "
        }

        let sudokuData = { board: boardString, solution: solutionString }
        return sudokuData
    }
}

module.exports = {
    GenerateSudoku
}

