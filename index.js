/*
	Connect Arena code, done as a fun, personal project.
	Credits to Alan Cavalcant (alankmc) - 2017
	*/

// =================== HELPER FUNCTIONS =================
// el as in "element"
function el(str) {
	return document.getElementById(str);
};

function hideByIds(ids) {
	for (var i = 0; i < ids.length; i++) {
		document.getElementById(ids[i]).style.display = 'none';
	}
};

function showByIds(ids) {
	for (var i = 0; i < ids.length; i++) {
		document.getElementById(ids[i]).style.display = 'block';
	}
};

// Return negative number if incorrect
function getPositiveNum(str) {
	var num = parseInt(str, 10);
	if (str == "") {
		return 0;
	}
	if (isNaN(num)) {
		return -1;
	}
	return num;
};

function showPlayerExplanation(playerType, isShow, color) {
	var explainP = el("explainPlayer");
	var explanation = "";
	switch(playerType) {
		case 'human': 
			explanation = "Human Player! Click on the grid to set your Tic!";
			break;
		case 'random':
			explanation = "Random Tics across the board! If you lose, you're not bad - just reaaally unlucky."
			break;
		case 'scaredyCat':
			explanation = "Scaredy Cat is timid and smol, and will not try to win - but is very VERY scared of losing."
			break;
		case 'blackBeard':
			explanation = "ARRRGGG! The most aggressive of all the seven seas, Blackbeard simply wants to win, and is not scared of the embrace of death - or loss at tic tac toe, in this case.";
			break;
		case 'sharpSwordsman':
			explanation = "Trained in the art of battle, this cunning duelist will try at most to best you, all the while parrying your attacks."
			break;
		case 'cleverShieldsman':
			explanation = "Paragon of defense, Clever Shieldsman will constantly defend itself. But when it finds it's safe to strike, expect a smart counter-attack!";
			break;
		default:
			break;
	}
	explainP.style.color = color;
	explainP.innerHTML = explanation;

};

function hidePlayerExplanation() {
	el("explainPlayer").innerHTML = "";
};

function removeElement(arr, el) {
	const index = arr.indexOf(el);

	if (index !== -1) {
		arr.splice(index, 1);
	}
};

function removeDoubleElement(arr, el) {
	var found = false;
	for (var i = 0; i < arr.length; i++) {
		if (arr[i][0] == el[0] && arr[i][1] == el[1]) {
			found = true;
			break;
		}
	}
	if (found) {
		arr.splice(i, 1);
	}
};

function getMatrixMax(arr) {
	var max = -10;
	for (var i = 0; i < arr.length; i++) {
		for (var j = 0; j < arr[0].length;j++) {
			if (arr[i][j] > max) {
				max = arr[i][j];
			}
		}
	}
	
	return max;
};

function getMaxIndexes(arr) {
	var max = -10;
	var indexes = [];
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] > max) {
			indexes = [i];
		} else if (arr[i] == max) {
			indexes.push(i);
		}
	}

	return indexes;
};

function findIndexes(arr, value) {
	var indexes = [];
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] == value) {
			indexes.push(i);
		} 
	}

	return indexes;
};

function getArrMax(arr) {
	var max = arr[0];
	for (var i = 1; i < arr.length; i++) {
		if (arr[i] > max) {
			max = arr[i];
		}
	}
	return max;
};

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/*
async function sleep(ms, fn, ...args) {
    await timeout(ms);
    return fn(...args);
};
*/
// Global Params:
RESOURCES = {
	TICS: {
		BLANK:"images/blank3.png", 
		1:["images/x3.png"],
		2:["images/o3.png"],
		WIN: {
			1:["images/xWin.png"],
			2:["images/oWin.png"],
		},
		DISABLE: {
			1:["images/xDisable.png"],
			2:["images/oDisable.png"],
		},
	},
	GRID: {
		VERTICAL: {
			MID: ["images/barMidV.png"],
			END: ["images/barEndV.png"]
		},
		HORIZONTAL: {
			END: ["images/barEndH.png"],	
			MID: ["images/barMidH.png"]
		},
		
		CROSS: ["images/cross.png"]
	}
};
PLAYER_TIC = [1, 2];
EMPTY_TIC = 0;


/*
	=================== BOARD =======================
*/

function Board(game) {
	this.BOARD_SIZE = [2, 2];
	this.board = [];
	this.boardElement = document.getElementById("boardDiv");
	this.numFilled = 0;
	this.game = game;
	this.elementBoard = [];

	/* Helpful Structures */
	// Contains all the empty cells
	// Simply a list of doubles [[0,0], [1,0], [2,0], ...] that are 
	// removed every time there's a move
	this.emptyCells = [];
	this.maxDangers = [];
	this.dangerMatrices = [];

	// Are you having fun, or are you getting board?
	this.getBoard = function () {
		return this.board;
	};

	this.getEmpties = function () {
		return this.emptyCells;
	};

	this.getThis = function() {
		return this;
	};

	this.getDangers = function() {
		return this.dangerMatrices;
	};

	this.getMaxDangers = function() {
		return this.maxDangers;
	};

	this.getBoardSize = function() {
		return this.BOARD_SIZE;
	};

	// Change tic colors to disable if not part of end game and 
	// win if part of end game
	this.dyeBoard = function(whoWon, winLength) {
		var key;
		// Paint everything as Disabled
		for (var i = 0; i < this.BOARD_SIZE[0]; i++) {
			for (var j = 0; j < this.BOARD_SIZE[1]; j++) {
				if (this.board[i][j] != EMPTY_TIC) {
					key = this.board[i][j].toString();
					this.elementBoard[i][j].src = RESOURCES.TICS.DISABLE[key];	
				}
			}
		}
		
		if (whoWon == 0) {
			return;
		}
		// Then paint the winnin streak as the color
		// Go through dangers to find the winnin streak
		var winnerDangers = this.maxDangers[whoWon % 2];
		var theseDangers = this.dangerMatrices[whoWon  % 2]
		var thisDanger;
		var wonTic;
		for (var dangerIndex = 0; dangerIndex < 4; dangerIndex++) {
			if (winnerDangers[dangerIndex] < winLength) {
				continue;
			}
			thisDanger = theseDangers[dangerIndex];
			for (var i = 0; i < thisDanger.length; i++) {
				for (var j = 0; j < thisDanger[0].length; j++) {
					if (thisDanger[i][j] >= winLength) {
						for (k = 0; k < winLength; k++) {
							if (dangerIndex == 0) {
								thisI = i;
								thisJ = j + k;
							} else if (dangerIndex == 1) {
								thisI = i + k;
								thisJ = j;
							} else if (dangerIndex == 2) {
								thisI = i + k;
								thisJ = j + k;
							} else if (dangerIndex == 3) {
								thisI = i + k;
								thisJ = j - k + winLength - 1;
							}
							

							wonTic = this.elementBoard[thisI][thisJ];
							wonTic.src = RESOURCES.TICS.WIN[whoWon.toString()];
							wonTic.classList.add("pulsing");
							// wonTic.classList.add("rotating");
						}
					}
				}
			}
		}

	};


	this.insertTic = function(player, row, col) {
		const winLength = this.game.getWinLength();
		this.board[row][col] = player;
		// var tic = el("boardCell_" + row + "_" + col);
		var tic = this.elementBoard[row][col];
		tic.src = RESOURCES.TICS[player][0];
		tic.classList.add("fullFlipTransform-active");
		/*** Empty Cells ***/
		removeDoubleElement(this.emptyCells, [row, col]);

		/*** Danger Matrices ***/
		const ownIndex = player - 1;
		const opIndex = (player) % 2;
		
		var ownMatrices = this.dangerMatrices[ownIndex];
		var opponentMatrices = this.dangerMatrices[opIndex];
		// Neutralize dangers when in own matrix
		// Increment danger in opponent matrix
		// Horizontal
		for (i = col - winLength + 1; i <= col; i++) {
			if (i < 0) {
				continue;
			}
			if (i > this.BOARD_SIZE[1] - winLength) {
				break;
			}
			
			if (opponentMatrices[0][row][i] != -1) {
				opponentMatrices[0][row][i] += 1;
			}

			ownMatrices[0][row][i] = -1;
		}
		// Vertical
		for (i = row - winLength + 1; i <= row; i++) {
			if (i < 0) {
				continue;
			}
			if (i > this.BOARD_SIZE[0] - winLength) {
				break;
			}
			if (opponentMatrices[1][i][col] != -1) {
				opponentMatrices[1][i][col] += 1;
			}
			ownMatrices[1][i][col] = -1;
		}
		// Diagonal down-right
		var j = col - winLength;
		for (i = row - winLength + 1; i <= row; i++) {
			j++;
			if (i < 0 || j < 0) {
				continue;
			}
			if (i > this.BOARD_SIZE[0] - winLength || 
				j > this.BOARD_SIZE[1] - winLength ) {
				break;
			}
			if (opponentMatrices[2][i][j] != -1) {
				opponentMatrices[2][i][j] += 1;
			}
			ownMatrices[2][i][j] = -1;
		}
		// Diagonal left-down
		j = col + winLength;
		for (i = row - winLength + 1; i <= row; i++) {
			j--;
			if (i < 0 || j >= this.BOARD_SIZE[1]) {
				continue;
			}
			if (i > this.BOARD_SIZE[0] - winLength || j < winLength - 1) {
				break;
			}
			if (opponentMatrices[3][i][j - winLength + 1] != -1) {
				opponentMatrices[3][i][j - winLength + 1] += 1;
			}
			ownMatrices[3][i][j - winLength + 1] = -1;
		}
		for (var i = 0; i < 4; i++) {
			this.maxDangers[ownIndex][i] = getMatrixMax(ownMatrices[i]);
			this.maxDangers[opIndex][i] = getMatrixMax(opponentMatrices[i]);	
		}
		
		this.numFilled++;
	};

	this.createBoardNodes = function() {
		this.numFilled = 0;
		this.elementBoard = [];
		var boardDiv = document.createElement("div");
		var game = this.game;

		boardDiv.id = "boardDiv";
		boardDiv.style["line-height"] = 0;
		var newElementLine;

		for (var i = 0; i < this.BOARD_SIZE[0]; i++) {
			newElementLine = [];
			for (var j = 0; j < this.BOARD_SIZE[1]; j++) {
				var thisBar = new Image();

				if (i == 0) {
					// First line, bar End must point upward
					thisBar.src = RESOURCES.GRID.VERTICAL.END[0];
				} else if ( i == this.BOARD_SIZE[0] - 1) {
					// Last line, bar End must point downward
					thisBar.src = RESOURCES.GRID.VERTICAL.END[0];
					thisBar.style.transform = "rotate(180deg)"; 
				} else {
					// Middle
					thisBar.src = RESOURCES.GRID.VERTICAL.MID[0];
				}
				// Tic Image
				var newImg = document.createElement("img");
				
				newImg.id = "boardCell_"+i+"_"+j;
				newImg.src = RESOURCES.TICS.BLANK;
				newImg.row = i;
				newImg.col = j;
				// Event listener that self defeats

				// Append images. First, bar
				if (j != 0) {
					boardDiv.appendChild(thisBar);
				}
				newElementLine.push(newImg);
				boardDiv.appendChild(newImg);
				newImg.classList.add("flipTransform");
				newImg.addEventListener("click", function blankListener() {
					
					game.clickedCell(this.row, this.col);
					removeEventListener("click", blankListener);
					
				}, false);
			}

			// Now, make horizontal bars
			if (i != this.BOARD_SIZE[0] - 1) {
				boardDiv.appendChild(document.createElement("br"));
				for (var j = 0; j < this.BOARD_SIZE[1]; j++) {
					var thisBar = new Image();
					var thisCross = new Image();
					thisCross.src = RESOURCES.GRID.CROSS[0];

					if (j == 0) {
						thisBar.src = RESOURCES.GRID.HORIZONTAL.END[0];
					} else if (j == this.BOARD_SIZE[1] - 1) {
						thisBar.src = RESOURCES.GRID.HORIZONTAL.END[0];
						thisBar.style.transform = "rotate(180deg)"; 
					} else {
						thisBar.src = RESOURCES.GRID.HORIZONTAL.MID[0];
					}

					if (j != 0) {
						boardDiv.appendChild(thisCross);
					}
					boardDiv.appendChild(thisBar);
				}
			}
			this.elementBoard.push(newElementLine);
			boardDiv.appendChild(document.createElement("br"));
		}

		el("boardCell").replaceChild(boardDiv, this.boardElement);
		
		this.boardElement = boardDiv;
	};

	// Returns the 1 for won, 0 for tie, -1 for not yet won
	this.lookForEnd = function(winLength) {	
		
		for (var playerIndex = 0; playerIndex < 2; playerIndex++) {
			for (var i = 0; i < 4; i++) {
				if (this.maxDangers[playerIndex][i] >= this.game.getWinLength()) {
					return playerIndex + 1;
				}
			}
		}

		if (this.numFilled == this.BOARD_SIZE[0] * this.BOARD_SIZE[1]) {
			return 0;
		}

		return -1;
	};

	this.resetBoard = function(numRows = this.BOARD_SIZE[0], numCols = this.BOARD_SIZE[1]) {
		this.board = [];
		this.BOARD_SIZE = [numRows, numCols]
		this.emptyCells = [];
		this.dangerMatrices = [];
		this.maxDangers = [];
		this.elementBoard = [];
		const winLength = this.game.getWinLength();
		
		// For each player, make the danger matrices
		for (var i = 0; i < 2; i++) {
			this.maxDangers.push([0, 0, 0, 0]);
			var thisPlayerDangerMatrices = [];
			var dangerMatrix = [];
			// Horizontal Windows
			for (var j = 0; j < numRows; j++) {
				dangerMatrix.push(new Array(numCols - winLength + 1).fill(0));
			}
			thisPlayerDangerMatrices.push(dangerMatrix);
			dangerMatrix = [];
			// Vertical Windows
			for (var j = 0; j < numRows - winLength + 1; j++) {
				dangerMatrix.push(new Array(numCols).fill(0));
			}
			thisPlayerDangerMatrices.push(dangerMatrix);
			// Diagonal Windows
			for (var k = 0; k < 2; k++) {
				dangerMatrix = [];
				for (var j = 0; j < numRows - winLength + 1; j++) {
					dangerMatrix.push(new Array(numCols - winLength + 1).fill(0));
				}
				thisPlayerDangerMatrices.push(dangerMatrix);
			}
			this.dangerMatrices.push(thisPlayerDangerMatrices);
		}

		
		for (var i = 0; i < numRows; i++) {
			// Fill board with zeros
			this.board.push(new Array(numCols).fill(0));

			// Make Empty Cells
			for (var j = 0; j < numCols; j++) {
				this.emptyCells.push([i, j]);
			}
		}
		
		this.createBoardNodes();
	};
}

/* ===================== GAME ===================== */

function Game() {
	this.board = null;
	this.playerSelect = null;
	this.WIN_LENGTH = 3;
	this.whoWon = 0;
	this.numberOfMoves = 0;
	// -1 for idle, 0 for game End, 1 and 2 for players
	this.currentState = -1;
	this.playerTypes = [null, null];
	this.robots = [null, null]
	this.robotMaker = null;


	this.getWinLength = function () {
		return this.WIN_LENGTH;
	};

	this.setPlayerSelect = function (playerSelect) {
		this.playerSelect = playerSelect;
	};

	this.toggleDivsDueToState = function() {
		switch(this.currentState) {
	    	// idle
	    	case -1:
	    	hideByIds(['playerTurn', 'gameEnd', 'playerControls', 'inGameControls']);
	    	showByIds(['startGameControls']);
	    	this.playerSelect.toggleSelect(true);
	    	break;
	    	// Game end
	    	case 0:
	    	hideByIds(['playerTurn', 'playerControls', 'inGameControls']);
	    	showByIds(['startGameControls', 'gameEnd']);
	    	this.playerSelect.toggleSelect(true);
	    	break;
    		// Player 1
    		case 1:
    		case 2:
    		hideByIds(['startGameControls', 'gameEnd']);
    		el("playerIcon").src = RESOURCES.TICS[this.currentState][0];
    		showByIds(['playerControls', 'playerTurn', 'inGameControls']);
    		this,playerSelect.toggleSelect(false);
    		break;
    		default:
    		break;
    	}
    };


	// Will begin looping through the game until it ends, in case there are only robots.
	// If there's a human, it will be cut short.
	this.signalNextMove = async function() {
		var robotChoice;
		
		while (this.currentState == 1 || this.currentState == 2) {

			if (this.playerTypes[this.currentState - 1] == 'human') {
				// it's a human. simply wait for the human to click something.
				break;
			}
			// It's a robot. Make a move.
			robotChoice = await this.robots[this.currentState - 1].makeMove(this.board.getThis());
			
			this.playerMove(this.currentState, robotChoice[0], robotChoice[1]);
		}

		return;
	};
	

	this.playerMove = function(player, row, col) {
		this.numberOfMoves++;
		this.board.insertTic(player, row, col);
		// this.board[row][col] = this.PLAYER_TIC[player - 1];

		var wonYet = this.board.lookForEnd(this.WIN_LENGTH);
		
		if (wonYet >= 0) {
			if (wonYet == 0) {
				this.whoWon = 0;
				el('gameEnd').innerHTML = "TIE!";
			} else {
				this.whoWon = this.currentState;
				el('gameEnd').innerHTML = "PLAYER " + this.whoWon + " WINS!";
				this.playerSelect.makeShake(this.whoWon);

			}
			this.board.dyeBoard(this.whoWon, this.WIN_LENGTH);

			this.currentState = 0;
		} else {
			this.currentState = (this.currentState == 1) ? 2 : 1;
			// if (this.currentState == 1) {
			//	this.currentState = 2;
			// } else {
			// 	this.currentState = 1;
			// }
			
		}
		
		this.toggleDivsDueToState();
	};

	this.clickedCell = function(row, col) {
		if (this.currentState == 0 || this.currentState == -1 || 
			// It's not your damn turn boy, sit down
			this.playerTypes[this.currentState - 1] != 'human') {
			return;
		}

		this.playerMove(this.currentState, row, col);
		this.signalNextMove();
	};


	this.newGame = function() {
		// Get Board sizes
		var numRows = getPositiveNum(el('boardInputRows').value);
		var numCols = getPositiveNum(el('boardInputCols').value);
		var winLength = getPositiveNum(el('boardInputLength').value);
		var botDelay = getPositiveNum(el('robotDelay').value);

		if (numRows >= 3 && 
			numCols >= 3 && 
			winLength >= 3 && 
			winLength <= Math.min(numRows, numCols) &&
			botDelay >= 0) {
			this.WIN_LENGTH = winLength;
			this.board.resetBoard(numRows, numCols);
			this.robotMaker.setDelay(botDelay);
		} else {
			showByIds(["wrongParams"]);
			return;
		}
		hideByIds(["wrongParams"]);
		
		// Make robots
		for (var i = 0; i < this.playerTypes.length; i++) {
			if (this.playerTypes[i] == 'human') {
				this.robots[i] = null;
			} else {
				this.robots[i] = this.robotMaker.make(this.playerTypes[i], i + 1);
			}
		}

		this.currentState = Math.floor(Math.random() * 2) + 1
		this.numberOfMoves = 0;
		this.playerSelect.stopShake();
		this.toggleDivsDueToState();
		this.signalNextMove();
	};

	this.resetGame = function() {
		this.board.resetBoard();
		this.currentState = -1;
		this.toggleDivsDueToState();
	};

	this.init = function() {
		for (var i = 0; i < this.playerTypes.length; i++) {
			if (this.playerTypes.length == null) {
				// Deu pau
				return;
			}
		}
		this.board = new Board(this);
		this.robotMaker = new RobotMaker(this);
		// this.playerSelect = new PlayerSelect(this);
		this.board.resetBoard();
		this.toggleDivsDueToState();
	};
	
	this.selectedPlayer = function(playerIndex, type) {
		this.playerTypes[playerIndex] = type;
	};
};

/* ================ PLAYER SELECT ==================== */

function PlayerSelect(game) {
	this.nodes = [];
	this.NUM_NODES = 0;
	this.game = game;
	this.mugs = [];
	this.playerTypes = [null, null];

	this.makeShake = function (player) {
		
		this.mugs[player - 1].classList.add("shaking");
	};

	this.stopShake = function() {
		this.mugs[0].classList.remove("shaking");
		this.mugs[1].classList.remove("shaking");
	}

	this.selectedPlayer = function (player, type) {
		
		// Does this make it faster?
		// Like... even super marginally...?
		// ....probably not
		if (this.playerTypes[player - 1] == type) {
			return;
		}
		this.mugs[player - 1].classList.remove("shaking")
		this.mugs[player - 1].classList.toggle("fullFlipTransform-active");
		var source = (player == 1) ? 
			"images/mugshots/" + type + "_mug.png" : 
			"images/mugshots/flip/" + type + "_mug.png";
		this.mugs[player - 1].src = source;
		this.playerTypes[player - 1] = type;
		this.game.selectedPlayer(player - 1, type);
	};

	this.toggleSelect = function(isShow) {

		var disp = isShow ? "block" : "none";
		for (var i = 0; i < this.NUM_NODES; i++) {
			this.nodes[i].style.display = disp;
		}
	};

	this.init = function() {
		this.nodes = document.getElementsByClassName("playerSelect");
		this.NUM_NODES = this.nodes.length;
		this.mugs = [el("player1Mug"), el("player2Mug")];

		this.selectedPlayer(1, 'human');
		this.selectedPlayer(2, 'human');
		
	};
};

/* ================= ROBOT MAKER ===================== */

function RobotMaker(game, delay = 500) {
	this.move;
	this.game = game;
	this.DELAY = delay;

	this.setDelay = function (delay) {
		this.DELAY = delay;
	};

	// Scaredy Cat simply really does not want to lose
	this.scaredyCatMove = function (boardObj) {
		var opDangers = boardObj.getDangers()[this.myState - 1];
		var opMaxDangers = boardObj.getMaxDangers()[this.myState - 1];

		var maxDangerValue = getArrMax(opMaxDangers);
		var chooseFrom = [];

		// If no danger at all, simply put in random place
		if (maxDangerValue <= 0) {
			const empties = boardObj.getEmpties();
			var pickCoordinate = Math.floor((empties.length * Math.random()));
			return empties[pickCoordinate];
		}
		
		var dangerousSpots = this.getDangerousSpots(boardObj, opDangers, opMaxDangers, maxDangerValue);
		var pickCoordinate = Math.floor((dangerousSpots.length * Math.random()));
		return dangerousSpots[pickCoordinate];
	};

	// Blackbeard does not care about losing - just winning
	this.blackBeardMove = function(boardObj) {
		var myDangers = boardObj.getDangers()[this.opState - 1];
		var myMaxDangers = boardObj.getMaxDangers()[this.opState - 1];

		var maxDangerValue = getArrMax(myMaxDangers);
		var chooseFrom = [];

		// If no danger at all, simply put in random place
		if (maxDangerValue <= 0) {
			const empties = boardObj.getEmpties();
			var pickCoordinate = Math.floor((empties.length * Math.random()));
			return empties[pickCoordinate];
		}
		
		var dangerousSpots = this.getDangerousSpots(boardObj, myDangers, myMaxDangers, maxDangerValue);
		var pickCoordinate = Math.floor((dangerousSpots.length * Math.random()));
		return dangerousSpots[pickCoordinate];
	};

	// Sharp Swordsman will attack first, but defend when in peril
	this.sharpSwordsmanMove = function(boardObj) {
		var myMaxDangers = boardObj.getMaxDangers()[this.opState - 1];
		var opMaxDangers = boardObj.getMaxDangers()[this.myState - 1];
		var myDangers = boardObj.getDangers()[this.opState - 1];
		var opDangers = boardObj.getDangers()[this.myState - 1];

		var myMax = getArrMax(myMaxDangers);
		var opMax = getArrMax(opMaxDangers);

		// No danger and nothing to do!
		if (Math.max(myMax, opMax) <= 0) {
			const empties = boardObj.getEmpties();
			var pickCoordinate = Math.floor((empties.length * Math.random()));
			return empties[pickCoordinate];
		}

		// If super close to winning, do the final stab!
		if (myMax == this.game.WIN_LENGTH - 1) {
			// Attack
			var dangerousSpots = this.getDangerousSpots(boardObj, myDangers, myMaxDangers, myMax);
			var pickCoordinate = Math.floor((dangerousSpots.length * Math.random()));
			return dangerousSpots[pickCoordinate];
		}

		// Will only defend if close to losing
		if (opMax > Math.floor(this.game.WIN_LENGTH * 0.5)) {
			// Defend
			var dangerousSpots = this.getDangerousSpots(boardObj, opDangers, opMaxDangers, opMax);
			var pickCoordinate = Math.floor((dangerousSpots.length * Math.random()));
			return dangerousSpots[pickCoordinate];
		} else {
			// Attack
			var dangerousSpots = this.getDangerousSpots(boardObj, myDangers, myMaxDangers, myMax);
			var pickCoordinate = Math.floor((dangerousSpots.length * Math.random()));
			return dangerousSpots[pickCoordinate];
		}

	};

	this.cleverShieldsmanMove = function(boardObj) {
		var myMaxDangers = boardObj.getMaxDangers()[this.opState - 1];
		var opMaxDangers = boardObj.getMaxDangers()[this.myState - 1];
		var myDangers = boardObj.getDangers()[this.opState - 1];
		var opDangers = boardObj.getDangers()[this.myState - 1];

		var myMax = getArrMax(myMaxDangers);
		var opMax = getArrMax(opMaxDangers);

		// No danger and nothing to do!
		if (Math.max(myMax, opMax) <= 0) {
			const empties = boardObj.getEmpties();
			var pickCoordinate = Math.floor((empties.length * Math.random()));
			return empties[pickCoordinate];
		}

		// If super close to winning, do the final stab!
		if (myMax == this.game.WIN_LENGTH - 1) {
			// Attack
			var dangerousSpots = this.getDangerousSpots(boardObj, myDangers, myMaxDangers, myMax);
			var pickCoordinate = Math.floor((dangerousSpots.length * Math.random()));
			return dangerousSpots[pickCoordinate];
		}

		// Will only attack if op is far from winning
		if (myMax > opMax && opMax < Math.max(this.game.WIN_LENGTH - 3, 1)) {
			// Attack
			var dangerousSpots = this.getDangerousSpots(boardObj, myDangers, myMaxDangers, myMax);
			var pickCoordinate = Math.floor((dangerousSpots.length * Math.random()));
			return dangerousSpots[pickCoordinate];
		} else {
			// Defend
			var dangerousSpots = this.getDangerousSpots(boardObj, opDangers, opMaxDangers, opMax);
			var pickCoordinate = Math.floor((dangerousSpots.length * Math.random()));
			return dangerousSpots[pickCoordinate];
		}
	};

	// Random simply put in tics in random places
	this.randomMove = function (boardObj) {
		const empties = boardObj.getEmpties();

		var pickCoordinate = Math.floor((empties.length * Math.random()));
		
		return empties[pickCoordinate];
	};

	this.neuralNetworkMove = function(botType) {
		// Neural network will be inside robot
		var nn = this.neuralNetwork;

	}

	this.make = function(botType, myState) {
		var newBot = null;

		switch(botType) {
			case 'random':
				newBot = new Robot(game, 'random', this.randomMove, myState, this.DELAY);
				break;
			case 'scaredyCat':
				newBot = new Robot(game, 'scaredyCat', this.scaredyCatMove, myState, this.DELAY);
				break;
			case 'blackBeard':
				newBot = new Robot(game, 'blackBeard', this.blackBeardMove, myState, this.DELAY);
				break;
			case 'sharpSwordsman':
				newBot = new Robot(game, 'sharpSwordsman', this.sharpSwordsmanMove, myState, this.DELAY);
				break;
			case 'cleverShieldsman':
				newBot = new Robot(game, 'cleverShieldsman', this.cleverShieldsmanMove, myState, this.DELAY);
				break;
			case 'neuralNetwork':
				break;
			default:
				break;
		}

		return newBot;
	};

}

/* ===================== ROBOT ================== */

function Robot(game, botType, makeMoveCallback, myState, delay, neuralNetwork = null) {
	this.game = game;
	this.botType = botType;
	this.DELAY = delay;
	this.makeMoveCallback = makeMoveCallback;
	this.myState = myState;
	this.opState = (myState == 1) ? 2 : 1;
	this.neuralNetwork = neuralNetwork;

	this.getDangerousSpots = function (boardObj, dangerMatrices, maxDangers, maxDangerValue) {
		
		var dangerousSpots = [];
		var winLength = this.game.getWinLength();
		var board = boardObj.getBoard();
		var thisDanger;
		var thisI;
		var thisJ;

		for (var dangerIndex = 0; dangerIndex < maxDangers.length; dangerIndex++) {
			if (maxDangers[dangerIndex] < maxDangerValue) {
				continue;
			}

			thisDanger = dangerMatrices[dangerIndex];
			for (var i = 0; i < thisDanger.length; i++) {
				for (var j = 0; j < thisDanger[0].length; j++) {
					if (thisDanger[i][j] == maxDangerValue) {
						for (k = 0; k < winLength; k++) {
							if (dangerIndex == 0) {
								thisI = i;
								thisJ = j + k;
							} else if (dangerIndex == 1) {
								thisI = i + k;
								thisJ = j;
							} else if (dangerIndex == 2) {
								thisI = i + k;
								thisJ = j + k;
							} else if (dangerIndex == 3) {
								thisI = i + k;
								thisJ = j - k + winLength - 1;
							}
							
							if (board[thisI][thisJ] == EMPTY_TIC) {
								dangerousSpots.push([thisI, thisJ]);
							}
						}
					}
				}
			}
		}

		return dangerousSpots;
	};

	this.makeMove = async function (boardObj) {
		if (this.DELAY > 10) {
			await timeout(this.DELAY);
		}
		
		return this.makeMoveCallback(boardObj);
		  
				
	};
};

/* ================== Global Init ================= */
game = new Game();
playerSelect = new PlayerSelect(game);
game.setPlayerSelect(playerSelect);
game.init(playerSelect);
playerSelect.init();

/* -------------- Test ----------------- */
/*
NEURAL_NETWORK = {
	BOARD_SIZE: [],
	WIN_LENGTH: bla,
	NEURON_SIZES: [board area, level1, level2, level3,...],
	
}
















*/