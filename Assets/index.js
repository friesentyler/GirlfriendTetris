import Game from './Game.js';
import * as tetriminoModule from './tetriminos.js';


// the main function loop where the updates happen
function main() {
	console.log("Game started!");
	const userGame = new Game();
	console.log(userGame.gameBoard);
	console.log(tetriminoModule.TTetrimino);
	userGame.addPieceToBoard(tetriminoModule.TTetrimino);
	console.log(userGame.gameBoard);
}

// first off I should make something that represents just the tetris logic by itself
// then I need separate logic for blitting the game to the html screen

// what needs to happen here?
// first I need to create arrays that represent the tetris blocks
// then I need to create a DOM manipulator function which will blit the tetriminos to the board

// the next thing that needs to happen is to create the gravity function


main();
