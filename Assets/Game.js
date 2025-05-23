import * as tetriminoModule from './tetriminos.js';

class Game {
	// we don't want this to be externally accessible, use getTimerLengthFromPieceDrops()
	#timerLength = 250;

	constructor() {
		this.rows = 20;
		this.cols = 10;
		this.gameBoard = this.generateGameboard(20, 10);
		this.activeColor = 1;
		this.activePiece = [];
		this.shadowPiece = [];
		this.piecesDropped = 0;
		this.frames = [];
		this.score = 0;
	}

	generateGameboard(rows, columns) {
		return Array.from(Array(rows), () => new Array(columns).fill(0));
	}

	addPieceToBoard() {
		let piece = this.randomlyChoosePiece();
		this.activePiece = [];
		if (!this.isGameOver(piece)) {
			for (let col = 3; col < piece[0].length + 3; col++) {
				for (let row = 0; row < piece.length; row++) {
					this.gameBoard[row][col] = piece[row][col - 3];
					if (this.gameBoard[row][col] > 0) {
						this.activeColor = this.gameBoard[row][col];
						this.activePiece.push([row, col]);
					}
				}
			}
			this.piecesDropped++;
		} else {
			this.gameBoard = this.generateGameboard(20, 10);
			this.activePiece = [];
			this.addPieceToBoard();
			this.piecesDropped = 0;
			return -1;
		}
	}

	isGameOver(piece) {
		let gameOver = false;
		for (let col = 3; col < piece[0].length + 3; col++) {
			for (let row = 0; row < piece.length; row++) {
				if (this.gameBoard[row][col] > 0 && piece[row][col - 3] !== 0) {
					gameOver = true;
				}
			}
		}
		return gameOver;
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
				this.gameBoard[this.activePiece[i][0] + 1][this.activePiece[i][1]] = 1 * this.activeColor;
				this.activePiece[i][0]++;
			}
		} else {

			console.log("Generate new piece!");
			return 1;
		}
	}

	exertGravityOnShadow() {
		let hypotheticalPiece = this.shadowPiece.map((input) => {
			return [input[0] + 1, input[1]];
		});
		if (this.validGravityMove(hypotheticalPiece)) {
			for (let i = 0; i < this.shadowPiece.length; i++) {
				this.shadowPiece[i][0]++;
			}
		} else {
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
				if (this.gameBoard[pieceCoords[i][0]][pieceCoords[i][1]] > 0) {
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
				if (this.gameBoard[pieceCoords[i][0]][pieceCoords[i][1]] > 0) {
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
				if (this.gameBoard[pieceCoords[i][0]][pieceCoords[i][1]] > 0) {
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
			if (pieceCoords[i][0] >= this.rows || pieceCoords[i][0] < 0 || pieceCoords[i][1] < 0 || pieceCoords[i][1] >= this.cols || this.gameBoard[pieceCoords[i][0]][pieceCoords[i][1]] > 0) {
				flag = false;
			}
		}
		for (let i = 0; i < this.activePiece.length; i++) {
			this.gameBoard[this.activePiece[i][0]][this.activePiece[i][1]] = 1 * this.activeColor;
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
				this.gameBoard[this.activePiece[i][0]][this.activePiece[i][1] - 1] = 1 * this.activeColor;
				this.activePiece[i][1]--;
			}
			return true;
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
				this.gameBoard[this.activePiece[i][0]][this.activePiece[i][1] + 1] = 1 * this.activeColor;
				this.activePiece[i][1]++;
			}
			return true;
		}
	}

	slamPiece() {
		while (this.exertGravityOnBoard() !== 1) {
			//console.log("slamming!");
		}
		this.clearLines();
		this.addPieceToBoard();
		this.score += 10;
		this.frames.push({ "score": 10, "timestamp": Date.now(), "lines_cleared": 0 });
	}

	clearLines() {
		let i = this.rows - 1;
		let rowsCleared = 0;
		while (i >= 0) {
			let isRowFull = this.gameBoard[i].reduce((accumulator, currentValue) => {
				return accumulator * currentValue;
			}, 1);
			if (isRowFull > 0) {
				this.gameBoard[i] = this.gameBoard[i].map(x => x = 0);
				this.shiftBoardDown(i);
				rowsCleared++;
			} else {
				i--;
			}
		}
		this.score += 50 * rowsCleared * rowsCleared;
		this.frames.push({ "score": rowsCleared * 50 * rowsCleared, "timestamp": Date.now(), "lines_cleared": rowsCleared });
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
		for (let i = 0; i < this.shadowPiece.length; i++) {
			if (this.gameBoard[this.shadowPiece[i][0]][this.shadowPiece[i][1]] <= 0) {
				this.gameBoard[this.shadowPiece[i][0]][this.shadowPiece[i][1]] = 0;
			}
		}
		this.shadowPiece = this.activePiece.map(block => block.slice());
		while (this.exertGravityOnShadow() !== 1) {
			//console.log("slamming shadow!");
		}
		for (let i = 0; i < this.shadowPiece.length; i++) {
			if (this.gameBoard[this.shadowPiece[i][0]][this.shadowPiece[i][1]] <= 0) {
				this.gameBoard[this.shadowPiece[i][0]][this.shadowPiece[i][1]] = -1;
			}
		}
	}

	shiftLeftIfOnRightEdge(hypotheticalFlip) {
		let result = hypotheticalFlip.map(row => row[1]);
		result = Math.max(...result);
		if (result > 9) {
			let shiftLeftBy = Math.abs(result - 9) * -1;
			hypotheticalFlip = hypotheticalFlip.map(row => [row[0], row[1] + shiftLeftBy])
		}
		return hypotheticalFlip;
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
			pieceMatrix[this.activePiece[i][0] - minRow][this.activePiece[i][1] - minCol] = 1 * this.activeColor;
		}
		// ok now that our pieceMatrix is filled we can do a little linear algebra trick
		// to rotate the piece 90 degrees we perform a diagonal flip and then a flip down the vertical
		pieceMatrix = pieceMatrix[0].map((_, i) => pieceMatrix.map(row => row[i]));
		pieceMatrix = pieceMatrix.map(row => row.reverse());
		// last we just check that this flip won't result in a collision or rotating off board
		let hypotheticalFlip = [];
		for (let i = 0; i < pieceMatrix.length; i++) {
			for (let j = 0; j < pieceMatrix[0].length; j++) {
				if (pieceMatrix[i][j] > 0) {
					hypotheticalFlip.push([i + minRow, j + minCol]);
				}
			}
		}

		// this handles the edge case where the piece won't flip if its on the right side of the board
		hypotheticalFlip = this.shiftLeftIfOnRightEdge(hypotheticalFlip);

		if (this.validFlip(hypotheticalFlip)) {
			for (let i = 0; i < this.activePiece.length; i++) {
				this.gameBoard[this.activePiece[i][0]][this.activePiece[i][1]] = 0;
			}
			this.activePiece = hypotheticalFlip;
			for (let i = 0; i < this.activePiece.length; i++) {
				this.gameBoard[this.activePiece[i][0]][this.activePiece[i][1]] = 1 * this.activeColor;
			}
			return true;
		} else {
			return -1;
		}
	}

	randomlyChoosePiece() {
		let tetriminos = [tetriminoModule.TTetrimino, tetriminoModule.LReverseTetrimino, tetriminoModule.LTetrimino, tetriminoModule.ITetrimino, tetriminoModule.STetrimino, tetriminoModule.ZTetrimino, tetriminoModule.OTetrimino];
		let min = Math.ceil(0);
		let max = Math.floor(tetriminos.length);
		let randomNumber = Math.floor(Math.random() * (max - min) + min);
		return tetriminos[randomNumber];
	}

	getTimerLengthFromPieceDrops() {
		let level = Math.floor(this.piecesDropped / 50);
		//console.log(`level: ${level} pieces dropped: ${this.piecesDropped} timer length: ${this.#timerLength - (0.1 * this.#timerLength * level)}`);
		return this.#timerLength - (0.1 * this.#timerLength * level);
	}

	shiftActivePieceUpOne() {
		for (let i = 0; i < this.activePiece.length; i++) {
			this.gameBoard[this.activePiece[i][0]][this.activePiece[i][1]] = 0;
		}
		for (let i = 0; i < this.activePiece.length; i++) {
			this.gameBoard[this.activePiece[i][0] - 1][this.activePiece[i][1]] = 1 * this.activeColor;
			this.activePiece[i][0]--;
		}
	}

	isTouchingDown() {
		const hypotheticalPiece = this.activePiece.map(([row, col]) => [row + 1, col]);
		return !this.validGravityMove(hypotheticalPiece);
	}
}

export default Game;
