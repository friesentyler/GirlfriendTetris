import * as tetriminoModule from './tetriminos.js';

class Game {

	constructor() {
		this.rows = 20;
		this.cols = 10;
		this.gameBoard = this.generateGameboard(20, 10);
		this.activePiece = [];
	}

	generateGameboard(rows, columns) {
		return Array.from(Array(rows), () => new Array(columns).fill(0));
	}

	addPieceToBoard() {
		let piece = this.randomlyChoosePiece();
		this.activePiece = [];
		for (let col = 3; col < piece[0].length + 3; col++) {
			for (let row = 0; row < piece.length; row++) {
				this.gameBoard[row][col] = piece[row][col - 3];
				if (this.gameBoard[row][col] == 1) {
					this.activePiece.push([row, col]);
				}
			}
		}
	}

	exertGravityOnBoard() {
		let hypotheticalPiece = this.activePiece.map((input) => {
			return [input[0] + 1, input[1]];
		});
		if (this.validGravityMove(hypotheticalPiece)) {
			// there is two loops to avoid overwriting updated squares (whether that be updated with 0 or 1)
			for (let i = 0; i < this.activePiece.length; i++) {
				this.gameBoard[this.activePiece[i][0]][this.activePiece[i][1]] = 0;
			}
			for (let i = 0; i < this.activePiece.length; i++) {
				this.gameBoard[this.activePiece[i][0] + 1][this.activePiece[i][1]] = 1;
				this.activePiece[i][0]++;
			}
		} else {
			// need to put random piece generation here
			console.log("Generate new piece!");
			this.addPieceToBoard();
			return 1;
		}
	}

	validGravityMove(pieceCoords) {
		// takes an Array of the new proposed piece coords to determine that there are no collisions
		// and that the piece is still remaining on the board
		let stringPieceCoords = JSON.stringify(pieceCoords);
		for (let i = 0; i < pieceCoords.length; i++) {
			// this checks the bounds of the board
			if (pieceCoords[i][0] >= this.rows || pieceCoords[i][0] < 0 || pieceCoords[i][1] < 0 || pieceCoords[i][1] >= this.cols) {
				return false;
			}
			// we need to only check the bottom facing blocks, which we do by converting the pieceCoords
			// to strings and then checking if there is a version of the coord that is one row greater
			let stringPieceCoord = JSON.stringify([pieceCoords[i][0] + 1, pieceCoords[i][1]]);
			if (stringPieceCoords.indexOf(stringPieceCoord) == -1) {
				// this checks for collisions
				if (this.gameBoard[pieceCoords[i][0]][pieceCoords[i][1]] == 1) {
					return false;
				}
			}
		}
		return true;
	}

	validLeftMove(pieceCoords) {
		let stringPieceCoords = JSON.stringify(pieceCoords);
		for (let i = 0; i < pieceCoords.length; i++) {
			// this checks the bounds of the board
			if (pieceCoords[i][0] >= this.rows || pieceCoords[i][0] < 0 || pieceCoords[i][1] < 0 || pieceCoords[i][1] >= this.cols) {
				return false;
			}
			// we need to only check the left facing blocks, which we do by converting the pieceCoords
			// to strings and then checking if there is a version of the coord that is one col less 
			let stringPieceCoord = JSON.stringify([pieceCoords[i][0], pieceCoords[i][1] - 1]);
			if (stringPieceCoords.indexOf(stringPieceCoord) == -1) {
				// this checks for collisions
				if (this.gameBoard[pieceCoords[i][0]][pieceCoords[i][1]] == 1) {
					return false;
				}
			}
		}
		return true;

	}

	validRightMove(pieceCoords) {
		let stringPieceCoords = JSON.stringify(pieceCoords);
		for (let i = 0; i < pieceCoords.length; i++) {
			// this checks the bounds of the board
			if (pieceCoords[i][0] >= this.rows || pieceCoords[i][0] < 0 || pieceCoords[i][1] < 0 || pieceCoords[i][1] >= this.cols) {
				return false;
			}
			// we need to only check the right facing blocks, which we do by converting the pieceCoords
			// to strings and then checking if there is a version of the coord that is one col more 
			let stringPieceCoord = JSON.stringify([pieceCoords[i][0], pieceCoords[i][1] + 1]);
			if (stringPieceCoords.indexOf(stringPieceCoord) == -1) {
				// this checks for collisions
				if (this.gameBoard[pieceCoords[i][0]][pieceCoords[i][1]] == 1) {
					return false;
				}
			}
		}
		return true;

	}

	validFlip(pieceCoords) {
		// ok I don't really like doing this since we modify the board state in the validFlip checker
		// but it seemed like the easiest most efficient way to do it. We do reset the board state back
		// to the original before finishing the function though, so in all reality it should be fine.
		let flag = true;
		for (let i = 0; i < this.activePiece.length; i++) {
			this.gameBoard[this.activePiece[i][0]][this.activePiece[i][1]] = 0;
		}
		for (let i = 0; i < pieceCoords.length; i++) {
			// this checks the bounds of the board and that the current blocks are not overlapping with existing ones
			if (pieceCoords[i][0] >= this.rows || pieceCoords[i][0] < 0 || pieceCoords[i][1] < 0 || pieceCoords[i][1] >= this.cols || this.gameBoard[pieceCoords[i][0]][pieceCoords[i][1]] === 1) {
				flag = false;
			}
		}
		for (let i = 0; i < this.activePiece.length; i++) {
			this.gameBoard[this.activePiece[i][0]][this.activePiece[i][1]] = 1;
		}
		return flag;
	}

	movePieceLeft() {
		let hypotheticalPiece = this.activePiece.map((input) => {
			return [input[0], input[1] - 1];
		});
		if (this.validLeftMove(hypotheticalPiece)) {
			for (let i = 0; i < this.activePiece.length; i++) {
				this.gameBoard[this.activePiece[i][0]][this.activePiece[i][1]] = 0;
			}
			for (let i = 0; i < this.activePiece.length; i++) {
				this.gameBoard[this.activePiece[i][0]][this.activePiece[i][1] - 1] = 1;
				this.activePiece[i][1]--;
			}
		}
	}

	movePieceRight() {
		let hypotheticalPiece = this.activePiece.map((input) => {
			return [input[0], input[1] + 1];
		});
		if (this.validRightMove(hypotheticalPiece)) {
			for (let i = 0; i < this.activePiece.length; i++) {
				this.gameBoard[this.activePiece[i][0]][this.activePiece[i][1]] = 0;
			}
			for (let i = 0; i < this.activePiece.length; i++) {
				this.gameBoard[this.activePiece[i][0]][this.activePiece[i][1] + 1] = 1;
				this.activePiece[i][1]++;
			}
		}
	}

	slamPiece() {
		while (this.exertGravityOnBoard() !== 1) {
			console.log("slamming!");
		}
		this.clearLines();
	}

	clearLines() {
		for (let i = this.rows - 1; i >= 0; i--) {
			let isRowFull = this.gameBoard[i].reduce((accumulator, currentValue) => {
				return accumulator * currentValue;
			}, 1);
			if (isRowFull === 1) {
				this.gameBoard[i] = this.gameBoard[i].map(x => x = 0);
				this.shiftBoardDown(i);
			}
		}
	}

	shiftBoardDown(row) {
		if (row === 0) {
			return;
		} else {
			let tempRow = this.gameBoard[row - 1].map(x => x);
			this.gameBoard[row - 1] = this.gameBoard[row].map(x => x = 0);
			this.gameBoard[row] = tempRow;
			return this.shiftBoardDown(row - 1);
		}
	}

	generatePieceOutline() {
	}

	rotatePiece() {
		// finding coords so that we don't go out of bounds when filling our piece matrix
		let minRow = Infinity, minCol = Infinity;
		let maxRow = -Infinity, maxCol = -Infinity;
		for (let i = 0; i < this.activePiece.length; i++) {
			minRow = Math.min(minRow, this.activePiece[i][0]);
			minCol = Math.min(minCol, this.activePiece[i][1]);
			maxRow = Math.max(maxRow, this.activePiece[i][0]);
			maxCol = Math.max(maxCol, this.activePiece[i][1]);
		}
		let pieceMatrix = Array.from(Array(maxRow - minRow + 1), () => new Array(maxCol - minCol + 1).fill(0));
		for (let i = 0; i < this.activePiece.length; i++) {
			pieceMatrix[this.activePiece[i][0] - minRow][this.activePiece[i][1] - minCol] = 1;
		}
		// ok now that our pieceMatrix is filled we can do a little linear algebra trick
		// to rotate the piece 90 degrees we perform a diagonal flip and then a flip down the vertical
		pieceMatrix = pieceMatrix[0].map((_, i) => pieceMatrix.map(row => row[i]));
		pieceMatrix = pieceMatrix.map(row => row.reverse());
		// last we just check that this flip won't result in a collision or rotating off board
		let hypotheticalFlip = [];
		for (let i = 0; i < pieceMatrix.length; i++) {
			for (let j = 0; j < pieceMatrix[0].length; j++) {
				if (pieceMatrix[i][j] == 1) {
					// The -1 on the column is important, it gets rid of an artifact from the rotation
					// (a translation over to the right by +1) I am honestly not sure why this happens
					hypotheticalFlip.push([i + minRow, j + minCol]);
				}
			}
		}
		if (this.validFlip(hypotheticalFlip)) {
			for (let i = 0; i < this.activePiece.length; i++) {
				this.gameBoard[this.activePiece[i][0]][this.activePiece[i][1]] = 0;
			}
			this.activePiece = hypotheticalFlip;
			for (let i = 0; i < this.activePiece.length; i++) {
				this.gameBoard[this.activePiece[i][0]][this.activePiece[i][1]] = 1;
			}
		}
	}

	randomlyChoosePiece() {
		let tetriminos = [tetriminoModule.TTetrimino, tetriminoModule.LReverseTetrimino, tetriminoModule.LTetrimino, tetriminoModule.ITetrimino];
		let min = Math.ceil(0);
		let max = Math.floor(tetriminos.length);
		let randomNumber = Math.floor(Math.random() * (max - min) + min);
		return tetriminos[randomNumber];
	}
}

export default Game;
