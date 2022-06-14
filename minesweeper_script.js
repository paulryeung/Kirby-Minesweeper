//===== Constants and Variables =====
let width = 3;
let height = 3;
let numfields = width * height;
let bombs = 3;
let flagImg = "./images/redflag.jpg";
let bombImg = "./images/bomb.jpg";
let gameEnd = false; //if true, clicking anywhere on the board should do nothing.
let victory = false;

//==== CSS FOR THE GRID ====
let boardEl = document.querySelector(".board");

//setup the CSS for correct viewing and squares
let gridCol = "";
let gridRow = "";
for (let w = 0; w < width; w++) {
  gridCol = gridCol + "10vh ";
}
for (let h = 0; h < height; h++) {
  gridRow = gridRow + "10vh ";
}
//console.log(`grid columns settings now looks like: ${gridCol}`);
//console.log(`grid rows settings now looks like: ${gridRow}`);

boardEl.style.gridTemplateColumns = gridCol;
boardEl.style.gridTemplateRows = gridRow;

//============Functions =====================

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

      //pop and set a bomb from the random Bomb array
      squareEl.setAttribute("has-bomb", randomBombArray.pop());
      //console.log(squareEl);
      //console.log(squareEl.getAttribute("correct-move"));

      //Setup images and number into the square (will be H1 number, or flag or bomb)
      //Numbers, textContent empty for now

      //Flag image, set to hidden
      let symbolEl = document.createElement("img");
      //default hidden element is flag
      symbolEl.src = "./images/redflag.jpg";
      //symbolEl.src = "./images/7.jpg";
      symbolEl.style.visibility = "hidden";

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
      console.log(`Entering square ${curID}`);

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
    console.log("You have achieved victory!");
    endGame();
    //also check if bomb is tripped!
  } else if (bombTripped === true) {
    console.log("Explosion! You have been defeated.");
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
      let square = document.getElementById(curID);

      square.setAttribute("state", "revealed");
    }
  }
}

//calls generate board function
generateBoard();

assignBombCount();

//EVENT LISTENERS!!

//prevents Chrome contextmenu from popping up on right click in board window, also acts as Right click action
boardEl.oncontextmenu = function (evt) {
  evt.preventDefault();

  //if game has ended, clicking does nothing and returns
  if (gameEnd === true) {
    return;
  }

  let clickedSquare = evt.target;
  let imageEl = clickedSquare.firstChild;

  //First check if you clicked on an existing red flag image (imageEl = null)
  if (clickedSquare.tagName === "IMG") {
    //correct the variables
    imageEl = clickedSquare;
    clickedSquare = imageEl.parentElement;
  }

  //Check if it was hidden, or else do nothing
  if (clickedSquare.getAttribute("state") == "hidden") {
    //check if flag is visible, if so then turn it off
    if (imageEl.style.visibility === "visible") {
      //hide the flag again and toggle correct move to be false
      imageEl.style.visibility = "hidden";
      clickedSquare.setAttribute("correct-move", "false");
    }
    //turn on the flag if it's not already on
    else {
      imageEl.style.visibility = "visible";

      //check if there is a bomb
      if (clickedSquare.getAttribute("has-bomb") === "true") {
        clickedSquare.setAttribute("correct-move", "true");
      }
    }
  }

  console.log(clickedSquare);
  console.log(imageEl);
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

  //ONLY DO ANYTHING IF THE SQUARE WAS HIDDEN TO BEGIN WITH
  if (clickedSquare.getAttribute("state") == "hidden") {
    //first set the square to be revealed
    clickedSquare.setAttribute("state", "revealed");

    //check if there's a bomb first lol
    if (clickedSquare.getAttribute("has-bomb") == "true") {
      imageEl.src = bombImg;
      imageEl.style.visibility = "visible";
    }
    //if the number is 0, only set move to be correct, do nothing or fan out special
    else if (clickedSquare.getAttribute("bomb-count") === "0") {
      clickedSquare.setAttribute("correct-move", "true");
      console.log("do nothing!");
    }
    //reveal an appropriate number, set the move to correct
    else {
      clickedSquare.setAttribute("correct-move", "true");
      let bombCount = clickedSquare.getAttribute("bomb-count");
      imageEl.src = `./images/${bombCount}.jpg`;
      imageEl.style.visibility = "visible";
    }
  }

  console.log(clickedSquare);
  console.log(imageEl);
  checkGame();
});
