class GameLoopManager {
	constructor(userGame, gravity, solidifyPiece, handleTouchStart, handleTouchEnd, handleTouchMove, handleComputerArrows, resetClicked, togglePlayButton, xClicked) {
		this.userGame = userGame;
		this.gravityTick = null;
		this.currentIntervalMs = null;
		this.running = false;
		this.paused = false;
		this.gravity = gravity;
		this.solidifyPiece = solidifyPiece;
		this.inputAfterTouchDownCount = 0;
		this.inputAfterTouchDownLimit = 10;
		this.touchDownTimeout = null;
		this.touchDownPending = false;
		this.touchStartListener = null;
		this.touchEndListener = null;
		this.touchMoveListener = null;
		this.keyDownListener = null;
		this.handleTouchStart = handleTouchStart;
		this.handleTouchEnd = handleTouchEnd;
		this.handleTouchMove = handleTouchMove;
		this.handleComputerArrows = handleComputerArrows;
		this.resetClicked = resetClicked;
		this.togglePlayButton = togglePlayButton;
		this.xClicked = xClicked;
	}

	start(resetElement, pausePlayElement, xElement) {
		if (this.gravityTick) {
			clearInterval(this.gravityTick);
			this.gravityTick = null;
		}
		this.setGravitySpeed(this.userGame.getTimerLengthFromPieceDrops());
		this.running = true;
		this.paused = false;
		this.attachInputListeners();
		this.attachButtonListeners(resetElement, pausePlayElement, xElement);
	}

	stop(resetElement, pausePlayElement, xElement) {
		if (this.gravityTick) {
			clearInterval(this.gravityTick);
			this.gravityTick = null;
		}
		this.running = false;
		this.detachInputListeners();
		this.detachButtonListeners(resetElement, pausePlayElement, xElement);
	}

	pause() {
		if (!this.running || this.paused) {
			return;
		}
		clearInterval(this.gravityTick);
		this.detachInputListeners();
		this.paused = true;
	}

	resume() {
		if (!this.running || !this.paused) {
			return;
		}
		this.gravityTick = setInterval(() => this.gravity(this.userGame), this.userGame.getTimerLengthFromPieceDrops());
		this.attachInputListeners();
		this.paused = false;
	}

	reset() {
		this.stop();
		this.userGame.resetBoard();
		this.start();
	}

	setGravitySpeed(speedMs) {
		if (this.currentIntervalMs === speedMs && this.gravityTick !== null) return;

		clearInterval(this.gravityTick);
		this.gravityTick = null;
		this.currentIntervalMs = speedMs;

		this.gravityTick = setInterval(async () => {
			const gravityResult = this.gravity(this.userGame);
			if (gravityResult === "landed") {
				if (!this.touchDownPending) {
					this.touchDownPending = true;
					this.inputAfterTouchDownCount = 0;
					this.touchDownTimeout = setTimeout(async () => {
						if (this.userGame.isTouchingDown()) {
							await this.solidifyPiece(this.userGame);
						}
						this.touchDownPending = false;
						this.touchDownTimeout = null;
					}, 1000);
				}
			}
			// Recheck speed and reschedule loop if necessary
			if (!this.speedUpActive) {
				const newSpeed = this.userGame.getTimerLengthFromPieceDrops();
				if (newSpeed !== this.currentIntervalMs) {
					this.setGravitySpeed(newSpeed);
				}
			}
		}, speedMs);
	}

	clearTouchDownTimeout() {
		if (this.touchDownTimeout) {
			clearTimeout(this.touchDownTimeout);
			this.touchDownTimeout = null;
			this.touchDownPending = false;
		}
	}

	attachInputListeners() {
		document.addEventListener('touchstart', this.touchStartListener = (e) => this.handleTouchStart(e, this.userGame));
		document.addEventListener('touchend', this.touchEndListener = (e) => this.handleTouchEnd(e, this.userGame));
		document.addEventListener('touchmove', this.touchMoveListener = (e) => this.handleTouchMove(e, this.userGame));
		document.addEventListener('keydown', this.keyDownListener = (e) => this.handleComputerArrows(e, this.userGame));
	}

	detachInputListeners() {
		document.removeEventListener('touchstart', this.touchStartListener);
		document.removeEventListener('touchend', this.touchEndListener);
		document.removeEventListener('touchmove', this.touchMoveListener);
		document.removeEventListener('keydown', this.keyDownListener);
	}

	attachButtonListeners(resetElement, pausePlayElement, xElement) {
		resetElement.addEventListener('touchstart', (event) => this.resetClicked(event, this.userGame));
		resetElement.addEventListener('click', (event) => this.resetClicked(event, this.userGame));
		pausePlayElement.addEventListener('touchstart', (event) => this.togglePlayButton(event, this.userGame));
		pausePlayElement.addEventListener('click', (event) => this.togglePlayButton(event, this.userGame));
	}

	detachButtonListeners(resetElement, pausePlayElement, xElement) {
		let newReset = resetElement.cloneNode(true);
		resetElement.parentNode.replaceChild(newReset, resetElement);
		let newPausePlay = pausePlayElement.cloneNode(true);
		pausePlayElement.parentNode.replaceChild(newPausePlay, pausePlayElement);
	}
}

export default GameLoopManager;
