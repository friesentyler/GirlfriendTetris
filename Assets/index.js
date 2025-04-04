import Game from './Game.js';
import * as tetriminoModule from './tetriminos.js';


// the main function loop where the updates happen
function main() {
	console.log("Game started!");
	const userGame = new Game();
	console.log(userGame.gameBoard);
	//console.log(tetriminoModule.TTetrimino);
	userGame.addPieceToBoard();
	// DELETE ME
	userGame.gameBoard[19] = [1, 1, 1, 1, 1, 1, 0, 1, 1, 1];
	blitScreen(userGame.gameBoard);
	let reset = document.querySelector('.reset-button');
	reset.addEventListener('click', (event) => {
		userGame.generatePieceOutline();
		userGame.exertGravityOnBoard();
		userGame.clearLines();
		blitScreen(userGame.gameBoard);
		console.log(userGame.gameBoard);
	});
	document.addEventListener('keydown', (event) => {
		console.log(event.code);
		if (event.code === "ArrowLeft") {
			event.preventDefault();
			userGame.movePieceLeft();
			userGame.generatePieceOutline();
			blitScreen(userGame.gameBoard);
		} else if (event.code === "ArrowRight") {
			event.preventDefault();
			userGame.movePieceRight();
			userGame.generatePieceOutline();
			blitScreen(userGame.gameBoard);
		} else if (event.code === "Space") {
			event.preventDefault();
			userGame.slamPiece();
			userGame.generatePieceOutline();
			blitScreen(userGame.gameBoard);
		} else if (event.code === "ArrowUp") {
			event.preventDefault();
			userGame.rotatePiece();
			userGame.generatePieceOutline();
			blitScreen(userGame.gameBoard);
		}
		console.log(userGame.gameBoard);
	});
}

function blitScreen(board) {
	for (let i = 0; i < board.length; i++) {
		for (let j = 0; j < board[0].length; j++) {
			let block = document.getElementById(`${i}-${j}`);
			if (board[i][j] === 1) {
				block.style.backgroundColor = 'hsl(0, 100%, 50%)';
			} else if (board[i][j] === -1) {
				block.style.backgroundColor = 'hsl(0, 100%, 5%)';
			} else {
				block.style.removeProperty('background-color');
			}
		}
	}
}

// first off I should make something that represents just the tetris logic by itself
// then I need separate logic for blitting the game to the html screen

// what needs to happen here?
// first I need to create arrays that represent the tetris blocks
// then I need to create a DOM manipulator function which will blit the tetriminos to the board

// the next thing that needs to happen is to create the gravity function


main();
