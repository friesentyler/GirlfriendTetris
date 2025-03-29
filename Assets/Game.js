
class Game {

	constructor() {
		this.gameBoard = this.generateGameboard(20, 10);
	}

	generateGameboard(rows, columns) {
		return Array.from(Array(rows), () => new Array(columns).fill(0));
	}

	addPieceToBoard(piece) {
		for (let i = 3; i <= 5; i++) {
			for (let j = 0; j <= 2; j++) {
				this.gameBoard[j][i] = piece[j][i - 3];
			}
		}
	}

}

export default Game;
