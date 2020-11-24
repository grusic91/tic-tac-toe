// what is currently on a board
//let origBoard;
// what is the order of plays
let movesHistory = [];
const X = 'x';
const CIRCLE = 'circle';
const WINNING_COMBINATION = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

let allCellElements = document.querySelectorAll('[cell-element]');

const restartButton = document.getElementById('restartButton');
const startButton = document.getElementById('start');
const undoButton = document.getElementById('undoButton');

let gmaeplayText = document.querySelector('[gmaeplay-text]');
let ingameControllerButtons = document.querySelector('[ingmae-controll-buttons]'); 
let decisionButtonContainer = document.getElementById('decision-button-container');
let winnigMsgElement = document.getElementById('winningMessage');

let circleTurn = false;
let currentOnTurn;
let opponent;
let mode = 'computer';
let gameOver = false;
let origBoard = [...allCellElements].map(el => parseInt(el.id));

buttonsActivate();
setGameplyMode();

startButton.addEventListener('click', () => handleStartButton(mode));
restartButton.addEventListener('click', resetClassesBeforeStart);
undoButton.addEventListener('click', () => handleUndoMove(movesHistory));

function startGame() {    
    resetClassesBeforeStart();
    // empty originBord before first move!   
    origBoard = Array.from(Array(9).keys());    
    circleTurn = false;
    // Handle events for each cell 
    allCellElements.forEach(cell => {
        // Add click handler for each cell 
        cell.addEventListener('click', handleClickOnCell, { once: true });
    });
    // sets hover class to board depending on whose turn is
    setHoverClass();  
}

/* handleClickOnCell()
    * check the chosen players mode friend/computer
    * check whose turn is
    * place a mark to track users plays
    * check for win
    * check for draw
    * switch turns between players
*/
function handleClickOnCell(event) {
    let cell = event.target;
    
    currentOnTurn = circleTurn ? CIRCLE : X;
    
    placeMark(cell, currentOnTurn); 

    // check if have a winner Game is over!
    if (checkForWin(currentOnTurn)) {     
        return endGame(false);
    } else if (isDraw()) {
        return endGame(true);
    }    
    switchTurns();
    setHoverClass();   
}

function endGame(draw) {    
    let winnigMsgTextEl = document.querySelector('[winning-msg-text]');

    if (draw) {
        winnigMsgTextEl.innerHTML = 'Draw!';
    } else {
        currentOnTurn = circleTurn ? CIRCLE : X;
        winnigMsgTextEl.innerHTML = `${circleTurn ? "O's" : "X's"} win!`;
        // set background collor for the winner combination!
        let arrOfWinners = Array.from(document.getElementsByClassName(`cell ${currentOnTurn}`));
        arrOfWinners.forEach(element => {
            element.style.backgroundColor = 'yellow';
        });                
    }
    winnigMsgElement.classList.add('show');
    decisionButtonContainer.classList.add('show');
    ingameControllerButtons.classList.remove("show");
    gmaeplayText.innerHTML = `Play against: <strong>${mode.toUpperCase()}</strong>`;
    gameOver = true;
    return gameOver;
}

function isDraw() {
    return [...allCellElements].every(cell => {
        return cell.classList.contains(X) || cell.classList.contains(CIRCLE);
    });
}

/* This function can be invoked with player or AI player */
function placeMark(cell, curPlayer) {
    cell.classList.add(curPlayer);
    origBoard[cell.id] = curPlayer; 
    //saves id for tracking moves    
    movesHistory.push(cell.id);
    undoButton.disabled = false; 
}

function switchTurns() {
    if (mode === 'friend') {
        circleTurn = !circleTurn;
    } else if(movesHistory.length <= 8) { 
        /* AI GAME */  
        placeMark(bestAiMove(origBoard), CIRCLE);          
        // check if with placment circle won!
        if (checkForWin(CIRCLE)) {
            circleTurn = true;
            endGame(false);
        } else if (isDraw()) {
            endGame(true);
        }  
    }       
}

/* Sets styles to cell on a board with simbol of current player */
function setHoverClass() {
    const board = document.getElementById('board');
    board.classList.remove(X);
    board.classList.remove(CIRCLE);
    if (circleTurn) {
        board.classList.add(CIRCLE);
    } else {
        board.classList.add(X);
    }
}

function checkForWin(currentOnTurn) {
    return WINNING_COMBINATION.some(combination => {
        return combination.every(index => {
            return allCellElements[index].classList.contains(currentOnTurn);
        });
    });
}

function setGameplyMode() {
    const computer = document.getElementById("computer");
    computer.addEventListener('click', handleOpponentSelection);

    const friend = document.getElementById("friend");
    friend.addEventListener('click', handleOpponentSelection);

    function handleOpponentSelection(event) {  
        mode = event.target.name;
        gmaeplayText.innerHTML = `Play against: <strong>${mode.toUpperCase()}</strong>`;
    }    
}

function resetClassesBeforeStart() {    
    // Reset Before start Game
    let arrOfWinners = Array.from(document.getElementsByClassName(`cell ${currentOnTurn}`));
    arrOfWinners.forEach(element => {
        element.style.backgroundColor = '';
    });
    
    allCellElements.forEach(cell => {
        // before starting remove all classes and event listener from previouse game
        cell.classList.remove(X);
        cell.classList.remove(CIRCLE);
        cell.removeEventListener('click', handleClickOnCell);
    });
    movesHistory = [];
    circleTurn = false;
    winnigMsgElement.classList.remove('show');
    setHoverClass();    
    // append active class to button on mode you finished
    document.getElementById(mode).classList.add('active');
}

function buttonsActivate () {
    const decisionBtnContainer = document.getElementById("decision-button-container");
    
    // Get all buttons with class="btn" inside the container
    let btns = decisionBtnContainer.getElementsByClassName("btn");

    // Loop through the buttons and add the active class to the current/clicked button
    for (let i = 0; i < btns.length; i++) {
        btns[i].addEventListener("click", function() {
            let current = document.getElementsByClassName("active");
            // If there's no active class
            if (current.length > 0) {
                current[0].className = current[0].className.replace(" active", "");
            }
            // Add the active class to the current/clicked button
            this.className += " active";
        });
    }
}

function handleStartButton(mode) {
    /* when user clicks start button */
    gmaeplayText.innerHTML = `You vs <strong>${mode.toUpperCase()}</strong>`;
    startGame(mode);
    decisionButtonContainer.classList.remove('show');
    // remove later from here
    ingameControllerButtons.classList.add("show");
    undoButton.disabled = true;    
}

function handleUndoMove(movesHistory) {
    if (mode === 'friend') {
    // disable clicking back if there are no elements on board
        if (movesHistory.length <= 1) {
            undoButton.disabled = true;
        }
        // get last move id from history sequence of moves
        let lastMovesId = movesHistory.slice(-1)[0];
        // get last assigned cell
        let cell = document.getElementById(lastMovesId);
        let currentClassOnTurn = cell && cell.classList.contains(X) ? X : CIRCLE;
        if (currentClassOnTurn === X) {
            circleTurn = false;
        } else {
            circleTurn = true;
        }
        
        // remove mark from last assigned cell
        removeMark(cell, currentClassOnTurn)

        // remove circle or x from a board    
        origBoard[lastMovesId] = parseInt(lastMovesId);

        // remove last element from History
        movesHistory.pop();
        // update hover effect
        setHoverClass();
    } else {
       /* MODE == COMPUTER */
       // disable clicking back if there are no elements on board
       if (movesHistory.length <= 2) {
            undoButton.disabled = true;
        }
        // get last and second last move id from history sequence of moves
        let lastMovesId = movesHistory.slice(-1)[0];
        let secondLastId = movesHistory.slice(-2)[0];
        // get last assigned cell
        let cell1 = document.getElementById(lastMovesId);
        let cell2 = document.getElementById(secondLastId);
        
        // remove mark from last assigned cell
        removeMark(cell1, CIRCLE);
        removeMark(cell2, X);

        // remove circle or x from a board    
        origBoard[lastMovesId] = parseInt(lastMovesId);
        origBoard[secondLastId] = parseInt(secondLastId);

        // remove 2 elements from back of movesHistory
        movesHistory.pop();
        movesHistory.pop();
        // update hover effect
        setHoverClass();        
    }    
}

function removeMark(cell, currentOnTurn) {    
    cell.classList.remove(currentOnTurn);
    cell.addEventListener('click', handleClickOnCell, { once: true });
}

function bestAiMove(origBoard) {
    // return index of best move
    let AI_CELL_ID = minmax(origBoard, CIRCLE, 0).index;
    let aiSelectedCell = document.getElementById(AI_CELL_ID); 
    aiSelectedCell.removeEventListener('click', handleClickOnCell);
    return aiSelectedCell;
}

function minmax (board, player, depth) {
    // check how it will be if we pass in also player
    isGameOver(board);   
    let availSpots = [...board].filter(cell => {
        return cell !='x' && cell !='circle';        
    });
    
    if (checkForNewBoardWin(X, board)){
        // if player wins
        return {score: depth - 10 }
    } else if (checkForNewBoardWin(CIRCLE, board)) {
        // if AI - Computer wins
        return {score: 10 - depth }
    } else if (availSpots.length === 0) {
        // if tie
        return {score: 0}
    }

    // collect spots
    let values = [];
    for (let i = 0; i < availSpots.length; i++) {
        let value = {}
        // set index number of
        value.index = board[availSpots[i]];
        board[availSpots[i]] = player; 

        if (player == CIRCLE) {
            let result = minmax(board, X, depth + 1);
            value.score = result.score;
        } else {
            let result = minmax(board, CIRCLE, depth + 1);
            value.score = result.score;
        }
        board[availSpots[i]] = value.index;
        values.push(value);
    }

    let bestMove;
    if (player == CIRCLE) {
        let bestScore = -Infinity;
        for(let i = 0; i < values.length; i++) {
            if (values[i].score > bestScore) {
                bestScore = values[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = +Infinity;
        for(let i = 0; i < values.length; i++) {
            if (values[i].score < bestScore) {
                bestScore = values[i].score;
                bestMove = i;
            }
        }
    }
    return values[bestMove];
}

function isGameOver(board) {  
    let newBoard = [...board];    
    // check if have a winner Game is over!
    if (checkForNewBoardWin(X, newBoard)) {
        return X;
    } else if (checkForNewBoardWin(CIRCLE, newBoard)) {  
        return CIRCLE;
    } else if (isDrawAI(newBoard)) { 
        return null;
    } else {
        return false;
    }
}

function checkForNewBoardWin(currentOnTurn, newBoard) {
    return WINNING_COMBINATION.some(combination => {
        return combination.every(index => {
            return newBoard[index] === currentOnTurn;
        });
    });
}

function isDrawAI(aiBoard) {
    return [...aiBoard].every(cell => {
        return cell === X || cell === CIRCLE;
    });
}
