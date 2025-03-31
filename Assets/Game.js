
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

	addPieceToBoard(piece) {
		this.activePiece = [];
		for (let col = 3; col <= 5; col++) {
			for (let row = 0; row <= 2; row++) {
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
	}

	clearLines() {
		// needs to run after every tick to check if there are lines to be cleared
	}
}

export default Game;
