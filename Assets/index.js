import Game from './Game.js';
import * as tetriminoModule from './tetriminos.js';


// the main function loop where the updates happen
function main() {
	console.log("Game started!");
	const userGame = new Game();
	console.log(userGame.gameBoard);
	userGame.addPieceToBoard();
	blitScreen(userGame.gameBoard);
	let reset = document.querySelector('.reset-button');
	reset.addEventListener('click', (event) => {
		userGame.generatePieceOutline();
		userGame.exertGravityOnBoard();
		blitScreen(userGame.gameBoard);
	});
	setInterval(function() {
		userGame.generatePieceOutline();
		userGame.exertGravityOnBoard();
		blitScreen(userGame.gameBoard);
	}, 1000);

	document.addEventListener('touchstart', function(event) {
		touchstartX = event.changedTouches[0].screenX;
		touchstartY = event.changedTouches[0].screenY;
	}, false);

	document.addEventListener('touchend', function(event) {
		touchendX = event.changedTouches[0].screenX;
		touchendY = event.changedTouches[0].screenY;
		handleGesture();
	}, false);

	function handleGesture() {
		let xDirection = touchendX - touchstartX;
		let yDirection = touchendY - touchstartY;
		console.log(xDirection, yDirection);
		if (Math.abs(xDirection) >= Math.abs(yDirection)) {

			if (touchendX < touchstartX) {
				userGame.movePieceLeft();
				userGame.generatePieceOutline();
				blitScreen(userGame.gameBoard);
			} else if (touchendX > touchstartX) {
				userGame.movePieceRight();
				userGame.generatePieceOutline();
				blitScreen(userGame.gameBoard);
			}
		} else if (Math.abs(xDirection) < Math.abs(yDirection)) {
			if (touchendY < touchstartY) {
				console.log('swipe up');
			} else if (touchendY > touchstartY) {
				userGame.slamPiece();
				userGame.generatePieceOutline();
				blitScreen(userGame.gameBoard);
			}
		}
		if (touchendY === touchstartY) {
			userGame.rotatePiece();
			userGame.generatePieceOutline();
			blitScreen(userGame.gameBoard);
		}
	}

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
	});
}

function blitScreen(board) {
	for (let i = 0; i < board.length; i++) {
		for (let j = 0; j < board[0].length; j++) {
			let block = document.getElementById(`${i}-${j}`);
			if (board[i][j] === 1) {
				block.style.backgroundColor = 'hsl(0, 100%, 50%)';
			} else if (board[i][j] === 2) {
				block.style.backgroundColor = 'hsl(245, 100%, 50%)';
			} else if (board[i][j] === 3) {
				block.style.backgroundColor = 'hsl(120, 100%, 50%)';
			} else if (board[i][j] === 4) {
				block.style.backgroundColor = 'hsl(50, 100%, 50%)';
			} else if (board[i][j] === 5) {
				block.style.backgroundColor = 'hsl(320, 100%, 50%)';
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

var touchstartX = 0;
var touchstartY = 0;
var touchendX = 0;
var touchendY = 0;

main();

