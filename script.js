//keeps track of the curretn state of board occupied by humanPlayer, AiPlayer
// it stores a combination of X, O and numbers (these indicate unplayed spots)
var origBoard;
const huPlayer = 'O';
const AiPlayer = 'X';
const winCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [6, 4, 2]
]

const cells = document.querySelectorAll(".cell");
startGame();

function startGame() {
    // need to clear background 
    document.querySelector(".endgame").style.display = "none";
    origBoard = Array.from(Array(9).keys());
    //clear x o
    for( var i = 0 ; i < cells.length ; i++) {
        cells[i].innerText = '';
        cells[i].style.removeProperty('background-color');
        cells[i].addEventListener('click', turnClick, false);
    }
}

 
function turnClick(square) {
// turn function will be used for displaying the 0 and x (occupation in the board)

    // cannot click on clicked place
    // .target get element that triggered a specific event
    if(typeof origBoard[square.target.id]  == 'number') {
        // if the cell is empty only then play
        turn(square.target.id, huPlayer);
        //best spot returns the optimal index of the element to be played for AI to win
        if(!checkTie()) turn(bestSpot(), AiPlayer); // check for a tie and if not proceed with AI player's  turn
    }
}

function turn(squareId, player) {
    origBoard[squareId] = player;
    document.getElementById(squareId).innerText = player;
    //squareId is the id = "" in the elements 
    let gameWon = checkWin(origBoard, player); // game won object contains the index of the winning combo and the player that won, else NULL
    if(gameWon) gameOver(gameWon);
}

function checkWin(board, player) {
    // not referencing the but passing a copy 
    // find every index player played in
    //reduce : array, combining function, start value
    // if array has at least 1 element we can skip the start value(the first element is considered as the  accumulator)(aka accumulator variable) and the reduction begins from second element
    // array board
    // combining arrow function
    // start value []
    let plays = board.reduce((a, e, i) => (e === player) ? a.concat(i) : a, []);    
    // play stores all the indices that player has played in 
    let gameWon = null;
    for(let [index, win] of winCombos.entries()) {
        // for  every winning combo it checks if  the player has played in all three required spots and if true gamewon is returned 
        if(win.every(elem => plays.indexOf(elem) > -1)) {
            gameWon = {index: index, player: player};
            break;
        }
    }
    return gameWon;
}

function gameOver(gameWon) {
    //highlight squares of win combo
    for( let index of winCombos[gameWon.index]) {
        document.getElementById(index).style.backgroundColor = gameWon.player == huPlayer ? "slateblue":"red";
    }
    //user can't click more as game over
    for(var i = 0 ; i < cells.length ; i++) {
        cells[i].removeEventListener('click', turnClick, false);
    }

    declareWinner(gameWon.player == huPlayer ? "You win!" : "You lose !");
}

function declareWinner(who) {
    document.querySelector(".endgame").style.display = "block";
    document.querySelector(".endgame .text").innerText = who;
}

function emptySquares() {
    //  filter every square of the origBoard based on whether the content is of type 'number'
    //filter creates a NEW array for returning it , it is PURE and does not modify the array it is given
    return origBoard.filter(s => typeof s == 'number');
}

function bestSpot() { 
    return minimax(origBoard, AiPlayer).index;
}

function checkTie() {
    if(emptySquares().length == 0) {
        for(var i  = 0; i < cells.length ; i++) {
            cells[i].style.backgroundColor = "green";
            cells[i].removeEventListener('click', turnClick, false);
        }
        declareWinner("Tie Game!");
        return true;
    }
    return false;
}

function minimax(newBoard, player) {
    var availSpots = emptySquares();
    if(checkWin(newBoard, huPlayer)) {
        return {score: -10};
    } else if(checkWin(newBoard, AiPlayer)) {
        return {score: 10};
    } else if(availSpots.length === 0) {
        return {score: 0};
    }

    // moves stores the index and the score that is obtained if that spot is played
    var moves = [];
    for(var i = 0 ; i < availSpots.length ; i++) {
        var move = {};
        move.index = newBoard[availSpots[i]];
        newBoard[availSpots[i]] = player;

        if(player == AiPlayer) {
            var result = minimax(newBoard, huPlayer);
            move.score = result.score;
        }
        else {
            var result = minimax(newBoard, AiPlayer);
            move.score = result.score;
        }

        newBoard[availSpots[i]] = move.index;

        moves.push(move);
    }

    var bestMove;
    if(player === AiPlayer) {
        //for ai player the highest score is chosen 
        var bestScore = -10000;
        for(var i = 0 ; i < moves.length ; i++) {
            if(moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        } 
    }
    else {
        // for human player lowest score is chosen
        var bestScore = 10000;
        for(var i = 0 ; i < moves.length ; i++) {
            if(moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        } 
    }

    return moves[bestMove];
}
