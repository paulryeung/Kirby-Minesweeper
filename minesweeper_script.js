//===== Constants and Variables =====
let width = 4;
let height = 4;
let numfields = width * height;
let bombs = 4;
let flagImg = "./images/redflag.jpg";
let bombImg = "./images/bomb.jpg";
let grassImg = "./images/grass.jpg";
let gameEnd = false; //if true, clicking anywhere on the board should do nothing.
let victory = false;
let viewSize = "8vw";

//==== DOM Variables ====
let boardEl = document.querySelector(".board");
let retryEl = document.querySelector(".retrybutton");
let announceEl = document.querySelector(".announcer");

let easygameEl = document.querySelector(".easygamebutton");
let normalgameEl = document.querySelector(".normalgamebutton");
let hardgameEl = document.querySelector(".hardgamebutton");

//============FUNCTIONS =====================

//set up the correct grid viewing sizes
function setupGrid() {
  //suggested change in code:
  boardEl.style.gridTemplateColumns = `repeat(${width}, minmax(50px, 3vw))`;
  boardEl.style.gridTemplateRows = `repeat(${height}, minmax(50px, 3vw))`;
}

//Scrambles an Array
function scrambleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

//creates a randomized array of bombs for distribution into board
function randomizeBombs() {
  let bombArray = [];
  let noBombArray = [];

  for (let b = 1; b <= bombs; b++) {
    bombArray.push("true");
  }

  for (let n = 1; n <= numfields - bombs; n++) {
    noBombArray.push("false");
  }
  let joinedArray = bombArray.concat(noBombArray);

  //scramble the big array TWICE before returning it.
  joinedArray = scrambleArray(joinedArray);
  joinedArray = scrambleArray(joinedArray);

  return joinedArray;
}

function generateBoard() {
  let randomBombArray = randomizeBombs(width, height, bombs);

  //set announcer to default
  announceEl.textContent = "Let's clear some bombs!";

  //console.log(randomBombArray);
  //creating the board
  for (let h = 0; h < height; h++) {
    for (let w = 0; w < width; w++) {
      let squareEl = document.createElement("div");

      //set some properties for the Square
      let newID = `s${h}${w}`;
      squareEl.setAttribute("class", "square");
      squareEl.setAttribute("id", newID);
      squareEl.setAttribute("state", "hidden");
      squareEl.setAttribute("bomb-count", "0");
      squareEl.setAttribute("correct-move", "false");
      squareEl.setAttribute("red-flagged", "false");

      //pop and set a bomb from the random Bomb array
      squareEl.setAttribute("has-bomb", randomBombArray.pop());
      //console.log(squareEl);
      //console.log(squareEl.getAttribute("correct-move"));

      //Setup images and number into the square (will be H1 number, or flag or bomb)
      //Numbers, textContent empty for now

      //Flag image, set to hidden
      let symbolEl = document.createElement("img");
      //default square element is grass
      symbolEl.src = grassImg;

      symbolEl.style.visibility = "visible";

      //append hidden symbol into the square
      squareEl.appendChild(symbolEl);

      //append the square into the board
      boardEl.appendChild(squareEl);
    }
  }
  //console.log(randomBombArray);
}

function assignBombCount() {
  for (let h = 0; h < height; h++) {
    for (let w = 0; w < width; w++) {
      let bombCount = 0;
      let stringID = "" + h + w;
      let numID = parseInt(stringID, 10);
      let curID = `s${h}${w}`;
      let checkID = 0;

      //declare 4 possible edge booleans
      let isLeftEdge = false;
      let isRightEdge = false;
      let isTopEdge = false;
      let isBottomEdge = false;

      //assign booleans to flag 4 possible edges
      //check if left edge
      if (numID % 10 === 0) {
        isLeftEdge = true;
      }
      //check if right edge
      if (numID % 10 === width - 1) {
        isRightEdge = true;
      }
      //check if top edge
      if (numID - 10 < 0) {
        isTopEdge = true;
      }
      //check if bottom edge
      if (numID + 10 >= height * 10) {
        isBottomEdge = true;
      }

      // console.log(
      //   `For Square ID ${numID}, Left Edge: ${isLeftEdge},  Right Edge: ${isRightEdge},  at Top: ${isTopEdge},  at Bottom: ${isBottomEdge}`
      // );

      //now check the 8 possible sides, starting with each row
      //check top left square
      if (isLeftEdge === false && isTopEdge === false) {
        checkID = numID - 11;
        stringCheckID = "";

        //fixes if number is less than 10 and adds extra 0 digit in stringID
        if (checkID < 10) {
          stringCheckID = "s0" + checkID;
        } else {
          stringCheckID = "s" + checkID;
        }

        let tempSquare = document.getElementById(stringCheckID);

        if (tempSquare.getAttribute("has-bomb") === "true") {
          bombCount++;
        }
      }

      //next check the top square and add
      if (isTopEdge === false) {
        checkID = numID - 10;
        stringCheckID = "";

        //fixes if number is less than 10 and adds extra 0 digit in stringID
        if (checkID < 10) {
          stringCheckID = "s0" + checkID;
        } else {
          stringCheckID = "s" + checkID;
        }

        let tempSquare = document.getElementById(stringCheckID);

        if (tempSquare.getAttribute("has-bomb") === "true") {
          bombCount++;
        }
      }

      //next check the top right square and add
      if (isRightEdge === false && isTopEdge === false) {
        checkID = numID - 9;
        stringCheckID = "";

        //fixes if number is less than 10 and adds extra 0 digit in stringID
        if (checkID < 10) {
          stringCheckID = "s0" + checkID;
        } else {
          stringCheckID = "s" + checkID;
        }

        let tempSquare = document.getElementById(stringCheckID);

        if (tempSquare.getAttribute("has-bomb") === "true") {
          bombCount++;
        }
      }

      //next check the direct left square and add
      if (isLeftEdge === false) {
        checkID = numID - 1;
        stringCheckID = "";

        //fixes if number is less than 10 and adds extra 0 digit in stringID
        if (checkID < 10) {
          stringCheckID = "s0" + checkID;
        } else {
          stringCheckID = "s" + checkID;
        }

        let tempSquare = document.getElementById(stringCheckID);

        if (tempSquare.getAttribute("has-bomb") === "true") {
          bombCount++;
        }
      }

      //next check the direct right square and add
      if (isRightEdge === false) {
        checkID = numID + 1;
        stringCheckID = "";

        //fixes if number is less than 10 and adds extra 0 digit in stringID
        if (checkID < 10) {
          stringCheckID = "s0" + checkID;
        } else {
          stringCheckID = "s" + checkID;
        }

        let tempSquare = document.getElementById(stringCheckID);

        if (tempSquare.getAttribute("has-bomb") === "true") {
          bombCount++;
        }
      }

      //next check the bottom left square and add
      if (isLeftEdge === false && isBottomEdge === false) {
        checkID = numID + 9;
        stringCheckID = "";

        //fixes if number is less than 10 and adds extra 0 digit in stringID
        if (checkID < 10) {
          stringCheckID = "s0" + checkID;
        } else {
          stringCheckID = "s" + checkID;
        }

        let tempSquare = document.getElementById(stringCheckID);

        if (tempSquare.getAttribute("has-bomb") === "true") {
          bombCount++;
        }
      }

      //next check the bottom square and add
      if (isBottomEdge === false) {
        checkID = numID + 10;
        stringCheckID = "";

        //fixes if number is less than 10 and adds extra 0 digit in stringID
        if (checkID < 10) {
          stringCheckID = "s0" + checkID;
        } else {
          stringCheckID = "s" + checkID;
        }

        let tempSquare = document.getElementById(stringCheckID);

        if (tempSquare.getAttribute("has-bomb") === "true") {
          bombCount++;
        }
      }

      //next check the bottom right square and add
      if (isRightEdge === false && isBottomEdge === false) {
        checkID = numID + 11;
        stringCheckID = "";

        //fixes if number is less than 10 and adds extra 0 digit in stringID
        if (checkID < 10) {
          stringCheckID = "s0" + checkID;
        } else {
          stringCheckID = "s" + checkID;
        }

        let tempSquare = document.getElementById(stringCheckID);

        if (tempSquare.getAttribute("has-bomb") === "true") {
          bombCount++;
        }
      }

      //Finally after 8 checks, set the bomb-count value
      let curSquare = document.getElementById(curID);
      curSquare.setAttribute("bomb-count", bombCount);
    }
  }
}

function checkGame() {
  //need to have all squares correct-move set to true
  let bombTripped = false;

  //counter for correct moves, victory achieved when count equals total squares
  let countCorrectMoves = 0;

  //check every square if correct-move is true; if any fail, immediately turn victory to false
  //forEach doesn't work well with this, so 2 for loops again
  for (let h = 0; h < height; h++) {
    for (let w = 0; w < width; w++) {
      let curID = `s${h}${w}`;
      let square = document.getElementById(curID);

      //check if you clicked on a bomb and end game immediately, break out of loop
      if (
        square.getAttribute("has-bomb") === "true" &&
        square.getAttribute("state") === "revealed"
      ) {
        bombTripped = true;
      }
      //
      else if (square.getAttribute("correct-move") === "true") {
        countCorrectMoves++;
      }
      //otherwise just check if victory conditions not achieved
      else if (square.getAttribute("correct-move") === "false") {
      }
    }
  }

  //if every square is correct declare victory!
  if (countCorrectMoves === numfields) {
    victory = true;
    endGame();
    //also check if bomb is tripped!
  } else if (bombTripped === true) {
    console.log("Explosion! You have been defeated.");
    victory = false;
    endGame();
  }
}

//
function endGame() {
  //set game state to ended so clicking does nothing
  gameEnd = true;

  //sets all squares to revealed so clicking does nothing
  for (let h = 0; h < height; h++) {
    for (let w = 0; w < width; w++) {
      let curID = `s${h}${w}`;
      let squareEl = document.getElementById(curID);

      //if the square has a bomb, change the image to reveal it
      if (squareEl.getAttribute("has-bomb") === "true") {
        squareEl.firstChild.src = bombImg;
      }

      squareEl.setAttribute("state", "revealed");
    }
  }

  //change announcer text based on victory or defeat
  if (victory === true) {
    announceEl.textContent = "VICTORY! Time to go home for some cake!";
  } else if (victory === false) {
    announceEl.textContent = "EXPLOSION! Time to try again!";
  }
}
//empty's the board by removing all child divs
function emptyBoard() {
  while (boardEl.firstChild) {
    boardEl.removeChild(boardEl.firstChild);
  }
}

function startGame() {
  //set necessary variables;
  gameEnd = false;
  victory = false;

  emptyBoard();
  setupGrid();
  generateBoard();
  assignBombCount();
}

//calls first time to generate game upon page load
startGame();

//===============EVENT LISTENERS!!=====================

//EVENTS IF YOU RIGHT CLICK
//prevents Chrome contextmenu from popping up on right click in board window, also acts as Right click action
boardEl.oncontextmenu = function (evt) {
  evt.preventDefault();

  //if game has ended, clicking does nothing and returns
  if (gameEnd === true) {
    return;
  }

  let clickedSquare = evt.target;
  let imageEl = clickedSquare.firstChild;

  //First check if you clicked on an image, like red flag or grass
  if (clickedSquare.tagName === "IMG") {
    //correct the variables
    imageEl = clickedSquare;
    clickedSquare = imageEl.parentElement;
  }

  //Check if STATE was hidden, or else do nothing
  if (clickedSquare.getAttribute("state") == "hidden") {
    //check if flag is visible, if so then switch back to grass
    if (clickedSquare.getAttribute("red-flagged") === "true") {
      //switch the image to grass

      clickedSquare.setAttribute("red-flagged", "false");
      imageEl.src = grassImg;
      clickedSquare.setAttribute("correct-move", "false");
    }
    //switch image to flag if not already
    else {
      imageEl.src = flagImg;
      clickedSquare.setAttribute("red-flagged", "true");
      //check if there is a bomb
      if (clickedSquare.getAttribute("has-bomb") === "true") {
        clickedSquare.setAttribute("correct-move", "true");
      }
    }
  }
  checkGame();
};

//EVENTS IF YOU LEFT CLICK
boardEl.addEventListener("click", function (evt) {
  //if game has ended, clicking does nothing and returns
  if (gameEnd === true) {
    return;
  }

  let clickedSquare = evt.target;
  let imageEl = clickedSquare.firstChild;

  //if left clicking an image, swap the two
  if (clickedSquare.tagName === "IMG") {
    //correct the variables
    imageEl = clickedSquare;
    clickedSquare = imageEl.parentElement;
  }

  //DON'T DO ANYTHING IF LEFT CLICKING A FLAG
  if (clickedSquare.getAttribute("red-flagged") === "true") {
    //do nothing
  }
  //ONLY DO ANYTHING IF THE SQUARE IS GRASS/NOT FLAGGED
  else if (clickedSquare.getAttribute("state") == "hidden") {
    //first set the square to be revealed
    clickedSquare.setAttribute("state", "revealed");

    //check if there's a bomb first lol
    if (clickedSquare.getAttribute("has-bomb") == "true") {
      imageEl.src = bombImg;
      imageEl.style.visibility = "visible";
    }
    //if the number is 0, simply hide the grass, do nothing or fan out special
    else if (clickedSquare.getAttribute("bomb-count") === "0") {
      clickedSquare.setAttribute("correct-move", "true");
      imageEl.style.visibility = "hidden";
    }
    //reveal an appropriate number, set the move to correct
    else {
      clickedSquare.setAttribute("correct-move", "true");
      let bombCount = clickedSquare.getAttribute("bomb-count");
      imageEl.src = `./images/${bombCount}.jpg`;
      imageEl.style.visibility = "visible";
    }
  }

  checkGame();
});

//RETRY BUTTON - will be left click only
retryEl.addEventListener("click", function (evt) {
  startGame();
});

//Buttons for different game difficulties
easygameEl.addEventListener("click", function (evt) {
  height = 4;
  width = 4;
  bombs = 4;
  numfields = width * height;
  viewSize = "8vw";
  startGame();
});

normalgameEl.addEventListener("click", function (evt) {
  height = 7;
  width = 7;
  bombs = 10;
  numfields = width * height;
  viewSize = "8vw";
  startGame();
});

hardgameEl.addEventListener("click", function (evt) {
  height = 10;
  width = 10;
  bombs = 30;
  numfields = width * height;
  viewSize = "5vw";
  startGame();
});
