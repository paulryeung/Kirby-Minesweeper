//===== Constants and Variables =====
let width = 7;
let height = 7;
let numfields = width * height;
let bombs = 10;
let flagsUsed = 0;
let foodNumber = 5;

//set images and gif variables
let flagImg = "./images/kirby_eating_t.jpg";
let bombImg = "./images/bomb_t.jpg";
let grassImg = "./images/grass.jpg";
let kirbyFightGif = "./backgrounds/kirby_fight_transparent.gif";
let kirbyCrashGif = "./backgrounds/kirby_crash.gif";
let kirbyWinGif = "./backgrounds/kirby-celebrate.gif";
let viewSize = "8vw";

//set array for various click sounds
let clickSounds = [
  { link: "./sounds/eh.mp3", vol: 0.08 },
  { link: "./sounds/ha.mp3", vol: 0.1 },
  { link: "./sounds/poyo.mp3", vol: 0.52 },
  { link: "./sounds/hi.mp3", vol: 0.5 },
  { link: "./sounds/hut.mp3", vol: 0.3 },
  { link: "./sounds/transform.mp3", vol: 0.15 },
  { link: "./sounds/whoa.mp3", vol: 0.1 },
  { link: "./sounds/ya.mp3", vol: 0.2 },
  //inhale is only for planting flags
  { link: "./sounds/inhale.mp3", vol: 0.1 },
];
let clickIndex = 0;

//Initialize multipliers for sound effects cause too loud
const bgmVol = 0.3;
const bombVol = 0.12;
const deathVol = 0.12;
const victoryVol = 0.3;
let clickVol = 0.15;

//checkbox values toggling sound or music
let musicOn = 1;
let soundOn = 1;

//setup music sliders and checkboxes
const bgmSliderEl = document.getElementById("bgm-slider");
const soundSliderEl = document.getElementById("sound-slider");
const bgmCheckboxEl = document.getElementById("bgm-checkbox");
const soundCheckboxEl = document.getElementById("sound-checkbox");

//set up initial music and sound states
//background music initial volume
const bgmAudioEl = document.getElementById("bgm-fx");
bgmAudioEl.volume = (bgmSliderEl.value / 100) * bgmVol * musicOn;
const victoryAudioEl = document.getElementById("victory-fx");
victoryAudioEl.volume = (bgmSliderEl.value / 100) * victoryVol * musicOn;

//all other sounds initial volume
const bombAudioEl = document.getElementById("bomb-fx");
bombAudioEl.volume = (soundSliderEl.value / 100) * bombVol * soundOn;
const deathAudioEl = document.getElementById("death-fx");
deathAudioEl.volume = (soundSliderEl.value / 100) * deathVol * soundOn;
let clickAudioEl = document.getElementById("click-fx");
clickAudioEl.volume = (soundSliderEl.value / 100) * clickVol * soundOn;

//creates a timer you can set
const timer = (ms) => new Promise((res) => setTimeout(res, ms));

//game conditions
let gameEnd = false; //if true, clicking anywhere on the board should do nothing.
let victory = false;

//==== DOM Variables ====
let boardEl = document.querySelector(".board");
let retryEl = document.querySelector("#retrybutton");
let devEl = document.querySelector("#devbutton");
let announceEl = document.querySelector(".announcer");

let easygameEl = document.querySelector("#easygamebutton");
let normalgameEl = document.querySelector("#normalgamebutton");
let hardgameEl = document.querySelector("#hardgamebutton");

//Aesthetic DOM variable setup
let statusGif = document.querySelector(".statusgif");
statusGif.src = kirbyFightGif;
let bombsInPlayEl = document.querySelector("#spanbomb");
bombsInPlayEl.textContent = bombs;
let flagsUsedEl = document.querySelector("#spanflag");
flagsUsedEl.textContent = flagsUsed;
devEl.textContent = "Dev Mode: OFF";
devEl.setAttribute("state", "OFF");

//============FUNCTIONS =====================

//set up the correct grid viewing sizes
function setupGrid() {
  //suggested change in code:
  // boardEl.style.gridTemplateColumns = `repeat(${width}, minmax(50px, 3vw))`;
  // boardEl.style.gridTemplateRows = `repeat(${height}, minmax(50px, 3vw))`;
  boardEl.style.gridTemplateColumns = `repeat(${width}, 60px`;
  boardEl.style.gridTemplateRows = `repeat(${height}, 60px`;
}

//takes a number and returns an id tag of "s+number" with 2 digits, can give nonsensical s+ negative numbers too
function convertNumToID(number) {
  //properly setup string id numbers
  if (number < 10) {
    return `s0${number}`;
  } else {
    return `s${number}`;
  }
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

  //set announcer and gif to default
  statusGif = kirbyFightGif;
  //announceEl.textContent = "LETS CLEAR SOME BOMBS!";
  announceEl.textContent = "CLICK ON BOARD FOR GAME & MUSIC START!";

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
      squareEl.setAttribute("food-img", "0");

      //pop and set a bomb from the random Bomb array
      squareEl.setAttribute("has-bomb", randomBombArray.pop());

      //if there is a bomb, assign a random non-zero food number
      if (squareEl.getAttribute("has-bomb") === "true") {
        let randFoodNum = Math.floor(Math.random() * foodNumber + 1);
        squareEl.setAttribute("food-img", randFoodNum);
      }

      //Setup images and number into the square (will be H1 number, or flag or bomb)

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

//Cascading empty field, only calls this recursive function when empty square is clicked.
function cascadeReveal(stringID) {
  //first reveal the current square as empty
  let curID = stringID;
  let checkID = "";
  let checkSquare = "";
  let curSquare = document.getElementById(curID);
  curSquare.setAttribute("state", "revealed");
  curSquare.setAttribute("correct-move", "true");
  curSquare.firstChild.style.visibility = "hidden";

  //slice the number out
  let stringNumID = stringID.slice(1, 3);
  let numID = parseInt(stringNumID, 10);

  //define 4 edges again
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

  //======check Top Left Square=====

  if (isLeftEdge === false && isTopEdge === false) {
    let checkNumID = numID - 11;
    checkID = convertNumToID(checkNumID);
    checkSquare = document.getElementById(checkID);

    //3 Possible bases cases for recursion + 1 Recursion, MAKE SURE 4 IF ELSE STATEMENTS EACH
    //if square is null, then do nothing!
    if (checkSquare == null) {
      //do nothing and move on
    }
    //next check if next square is revealed or flagged, don't do anything either
    else if (
      checkSquare.getAttribute("state") === "revealed" ||
      checkSquare.getAttribute("red-flagged") === "true"
    ) {
      //do nothing and move on
    }
    //now check if it's a number square, since it exists, is hidden and not flagged yet, simply reveal
    else if (checkSquare.getAttribute("bomb-count") != 0) {
      checkSquare.setAttribute("state", "revealed");
      checkSquare.setAttribute("correct-move", "true");

      let bombCount = checkSquare.getAttribute("bomb-count");
      checkSquare.firstChild.src = `./images/${bombCount}.jpg`;
      checkSquare.firstChild.style.visibility = "visible";
    }
    //no other possibility than another empty square, go in and cascade.
    else {
      cascadeReveal(checkID);
    }
  }

  //======check Top Square============
  if (isTopEdge === false) {
    checkNumID = numID - 10;
    checkID = convertNumToID(checkNumID);
    checkSquare = document.getElementById(checkID);

    //3 Possible bases cases for recursion!
    //if square is null, then do nothing!
    if (checkSquare == null) {
      //do nothing and move on
    }
    //next check if next square is revealed or flagged, don't do anything either
    else if (
      checkSquare.getAttribute("state") === "revealed" ||
      checkSquare.getAttribute("red-flagged") === "true"
    ) {
      //do nothing and move on
    }
    //now check if it's a number square, since it exists, is hidden and not flagged yet, simply reveal
    else if (checkSquare.getAttribute("bomb-count") != 0) {
      checkSquare.setAttribute("state", "revealed");
      checkSquare.setAttribute("correct-move", "true");

      let bombCount = checkSquare.getAttribute("bomb-count");
      checkSquare.firstChild.src = `./images/${bombCount}.jpg`;
      checkSquare.firstChild.style.visibility = "visible";
    }
    //no other possibility than another empty square, go in and cascade.
    else {
      cascadeReveal(checkID);
    }
  }
  //======check Top Right Square============
  if (isRightEdge === false && isTopEdge === false) {
    checkNumID = numID - 9;
    checkID = convertNumToID(checkNumID);
    checkSquare = document.getElementById(checkID);

    //3 Possible bases cases for recursion!
    //if square is null, then do nothing!
    if (checkSquare == null) {
      //do nothing and move on
    }
    //next check if next square is revealed or flagged, don't do anything either
    else if (
      checkSquare.getAttribute("state") === "revealed" ||
      checkSquare.getAttribute("red-flagged") === "true"
    ) {
      //do nothing and move on
    }
    //now check if it's a number square, since it exists, is hidden and not flagged yet, simply reveal
    else if (checkSquare.getAttribute("bomb-count") != 0) {
      checkSquare.setAttribute("state", "revealed");
      checkSquare.setAttribute("correct-move", "true");

      let bombCount = checkSquare.getAttribute("bomb-count");
      checkSquare.firstChild.src = `./images/${bombCount}.jpg`;
      checkSquare.firstChild.style.visibility = "visible";
    }
    //no other possibility than another empty square, go in and cascade.
    else {
      cascadeReveal(checkID);
    }
  }
  //======check Left Square============
  if (isLeftEdge === false) {
    checkNumID = numID - 1;
    checkID = convertNumToID(checkNumID);
    checkSquare = document.getElementById(checkID);

    //3 Possible bases cases for recursion!
    //if square is null, then do nothing!
    if (checkSquare == null) {
      //do nothing and move on
    }
    //next check if next square is revealed or flagged, don't do anything either
    else if (
      checkSquare.getAttribute("state") === "revealed" ||
      checkSquare.getAttribute("red-flagged") === "true"
    ) {
      //do nothing and move on
    }
    //now check if it's a number square, since it exists, is hidden and not flagged yet, simply reveal
    else if (checkSquare.getAttribute("bomb-count") != 0) {
      checkSquare.setAttribute("state", "revealed");
      checkSquare.setAttribute("correct-move", "true");

      let bombCount = checkSquare.getAttribute("bomb-count");
      checkSquare.firstChild.src = `./images/${bombCount}.jpg`;
      checkSquare.firstChild.style.visibility = "visible";
    }
    //no other possibility than another empty square, go in and cascade.
    else {
      cascadeReveal(checkID);
    }
  }
  //======check Right Square============
  if (isRightEdge === false) {
    checkNumID = numID + 1;
    checkID = convertNumToID(checkNumID);
    checkSquare = document.getElementById(checkID);

    //3 Possible bases cases for recursion!
    //if square is null, then do nothing!
    if (checkSquare == null) {
      //do nothing and move on
    }
    //next check if next square is revealed or flagged, don't do anything either
    else if (
      checkSquare.getAttribute("state") === "revealed" ||
      checkSquare.getAttribute("red-flagged") === "true"
    ) {
      //do nothing and move on
    }
    //now check if it's a number square, since it exists, is hidden and not flagged yet, simply reveal
    else if (checkSquare.getAttribute("bomb-count") != 0) {
      checkSquare.setAttribute("state", "revealed");
      checkSquare.setAttribute("correct-move", "true");

      let bombCount = checkSquare.getAttribute("bomb-count");
      checkSquare.firstChild.src = `./images/${bombCount}.jpg`;
      checkSquare.firstChild.style.visibility = "visible";
    }
    //no other possibility than another empty square, go in and cascade.
    else {
      cascadeReveal(checkID);
    }
  }
  //======check Bottom Left Square============
  if (isLeftEdge === false && isBottomEdge === false) {
    checkNumID = numID + 9;
    checkID = convertNumToID(checkNumID);
    checkSquare = document.getElementById(checkID);

    //3 Possible bases cases for recursion!
    //if square is null, then do nothing!
    if (checkSquare == null) {
      //do nothing and move on
    }
    //next check if next square is revealed or flagged, don't do anything either
    else if (
      checkSquare.getAttribute("state") === "revealed" ||
      checkSquare.getAttribute("red-flagged") === "true"
    ) {
      //do nothing and move on
    }
    //now check if it's a number square, since it exists, is hidden and not flagged yet, simply reveal
    else if (checkSquare.getAttribute("bomb-count") != 0) {
      checkSquare.setAttribute("state", "revealed");
      checkSquare.setAttribute("correct-move", "true");

      let bombCount = checkSquare.getAttribute("bomb-count");
      checkSquare.firstChild.src = `./images/${bombCount}.jpg`;
      checkSquare.firstChild.style.visibility = "visible";
    }
    //no other possibility than another empty square, go in and cascade.
    else {
      cascadeReveal(checkID);
    }
  }

  //======check Bottom Square============
  if (isBottomEdge === false) {
    checkNumID = numID + 10;
    checkID = convertNumToID(checkNumID);
    checkSquare = document.getElementById(checkID);

    //3 Possible bases cases for recursion!
    //if square is null, then do nothing!
    if (checkSquare == null) {
      //do nothing and move on
    }
    //next check if next square is revealed or flagged, don't do anything either
    else if (
      checkSquare.getAttribute("state") === "revealed" ||
      checkSquare.getAttribute("red-flagged") === "true"
    ) {
      //do nothing and move on
    }
    //now check if it's a number square, since it exists, is hidden and not flagged yet, simply reveal
    else if (checkSquare.getAttribute("bomb-count") != 0) {
      checkSquare.setAttribute("state", "revealed");
      checkSquare.setAttribute("correct-move", "true");

      let bombCount = checkSquare.getAttribute("bomb-count");
      checkSquare.firstChild.src = `./images/${bombCount}.jpg`;
      checkSquare.firstChild.style.visibility = "visible";
    }
    //no other possibility than another empty square, go in and cascade.
    else {
      cascadeReveal(checkID);
    }
  }
  //======check Bottom Right Square============
  if (isRightEdge === false && isBottomEdge === false) {
    checkNumID = numID + 11;
    checkID = convertNumToID(checkNumID);
    checkSquare = document.getElementById(checkID);

    //3 Possible bases cases for recursion!
    //if square is null, then do nothing!
    if (checkSquare == null) {
      //do nothing and move on
    }
    //next check if next square is revealed or flagged, don't do anything either
    else if (
      checkSquare.getAttribute("state") === "revealed" ||
      checkSquare.getAttribute("red-flagged") === "true"
    ) {
      //do nothing and move on
    }
    //now check if it's a number square, since it exists, is hidden and not flagged yet, simply reveal
    else if (checkSquare.getAttribute("bomb-count") != 0) {
      checkSquare.setAttribute("state", "revealed");
      checkSquare.setAttribute("correct-move", "true");

      let bombCount = checkSquare.getAttribute("bomb-count");
      checkSquare.firstChild.src = `./images/${bombCount}.jpg`;
      checkSquare.firstChild.style.visibility = "visible";
    }
    //no other possibility than another empty square, go in and cascade.
    else {
      cascadeReveal(checkID);
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
    victory = false;
    endGame();
  }
}

//
function endGame() {
  //set game state to ended so clicking does nothing
  gameEnd = true;

  //stop and reset all music and sounds
  bgmAudioEl.pause();

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

  let statusGif2 = document.querySelector(".statusgif");
  //change announcer text based on victory or defeat
  if (victory === true) {
    statusGif2.src = kirbyWinGif;
    announceEl.textContent = "VICTORY! TIME TO CELEBRATE!";
    victoryAudioEl.play();

    //online time you reset bgm audio
    bgmAudioEl.currentTime = 0;

    //transform bombs into food
    transformFood();
  } else if (victory === false) {
    //play bomb and kirby death sound
    bombAudioEl.play();
    deathAudioEl.play();

    statusGif2.src = kirbyCrashGif;
    announceEl.textContent = "EXPLOSION! OOF, TRY AGAIN!";
  }
}

//if victory, turn bomb icons into food in a sequence
async function transformFood() {
  console.log("made it here!");
  for (let h = 0; h < height; h++) {
    for (let w = 0; w < width; w++) {
      let curID = `s${h}${w}`;
      let squareEl = document.getElementById(curID);

      //break out of async loops and function if game has started again
      if (gameEnd === false) {
        break;
      }
      //if the square has a bomb, change the image food item
      else if (squareEl.getAttribute("has-bomb") === "true") {
        let foodNum = squareEl.getAttribute("food-img");
        squareEl.firstChild.src = `./images/food${foodNum}.jpg`;

        //set the timer to half a second delay
        await timer(500);
      }
    }
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
  flagsUsed = 0;
  flagsUsedEl.textContent = flagsUsed;

  gameEnd = false;
  victory = false;

  devEl.textContent = "Dev Mode: OFF";
  devEl.setAttribute("state", "OFF");

  //stop but don't reset background music
  bgmAudioEl.pause();
  //stop and reset all sounds effects; bombs, death, actions
  bombAudioEl.pause();
  deathAudioEl.pause();
  victoryAudioEl.pause();
  clickAudioEl.pause();
  bombAudioEl.currentTime = 0;
  deathAudioEl.currentTime = 0;
  victoryAudioEl.currentTime = 0;
  clickAudioEl.currentTime = 0;

  emptyBoard();
  setupGrid();
  generateBoard();
  assignBombCount();
}

//calls first time to generate game upon page load
startGame();

//===============EVENT LISTENERS!!=====================

//===========CLICK EVENT LISTENERS===============
//EVENTS IF YOU RIGHT CLICK
//prevents Chrome contextmenu from popping up on right click in board window, also acts as Right click action
boardEl.oncontextmenu = function (evt) {
  evt.preventDefault();

  //if game has ended, clicking does nothing and returns
  if (gameEnd === true) {
    return;
  } else if (bgmAudioEl.paused == true) {
    //set the text to clearing bombs, gogo
    announceEl.textContent = "LETS CLEAR SOME BOMBS!";
    bgmAudioEl.play();
  }

  //check if music is playing, this works as first click anyways

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
    //check if flag is visible, if so then switch img to grass and decrease flag usage counter
    if (clickedSquare.getAttribute("red-flagged") === "true") {
      //flip the correct move and red-flagged triggers
      clickedSquare.setAttribute("red-flagged", "false");
      imageEl.src = grassImg;
      clickedSquare.setAttribute("correct-move", "false");
      flagsUsed--;
      flagsUsedEl.textContent = flagsUsed;

      //stop any sound effects, especially to disable flag
      clickAudioEl.pause();
    }
    //switch image to flag if not already and increase flag usage counter
    else {
      imageEl.src = flagImg;
      clickedSquare.setAttribute("red-flagged", "true");
      flagsUsed++;
      flagsUsedEl.textContent = flagsUsed;
      //check if there is a bomb
      if (clickedSquare.getAttribute("has-bomb") === "true") {
        clickedSquare.setAttribute("correct-move", "true");
      }
      //play a sound for planting flag, indexed between 3 and 4
      clickIndex = Math.floor(Math.random() * 2) + 3;
      //stop current sound effect,
      clickAudioEl.pause();
      //use the inhale sound index
      clickAudioEl.src = clickSounds[8].link;
      clickVol = clickSounds[8].vol;
      clickAudioEl.volume = (soundSliderEl.value / 100) * clickVol * soundOn;
      clickAudioEl.play();
    }
  }
  checkGame();
};

//EVENTS IF YOU LEFT CLICK
boardEl.addEventListener("click", function (evt) {
  //if game has ended, clicking does nothing and returns
  console.log("Start of game is game paused?", bgmAudioEl.paused);
  if (gameEnd === true) {
    return;
  } else if (bgmAudioEl.paused == true) {
    //set the text to clearing bombs, gogo
    announceEl.textContent = "LETS CLEAR SOME BOMBS!";
    bgmAudioEl.play();
  }
  //else run if bgm paused (whether load or starting new game)

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
      //clickedSquare.setAttribute("correct-move", "true");
      //imageEl.style.visibility = "hidden";

      //play a sound before cascade starts indexed between 0 and 7
      clickIndex = Math.floor(Math.random() * 8);
      //stop current sound effect,
      clickAudioEl.pause();
      //adjust with new index and then play
      clickAudioEl.src = clickSounds[clickIndex].link;
      clickVol = clickSounds[clickIndex].vol;
      clickAudioEl.volume = (soundSliderEl.value / 100) * clickVol * soundOn;
      clickAudioEl.play();

      let stringID = clickedSquare.getAttribute("id");
      cascadeReveal(stringID);
    }
    //reveal an appropriate number, set the move to correct
    else {
      clickedSquare.setAttribute("correct-move", "true");
      let bombCount = clickedSquare.getAttribute("bomb-count");
      imageEl.src = `./images/${bombCount}.jpg`;
      imageEl.style.visibility = "visible";

      //play a sound before here too indexed between 0 and 7
      clickIndex = Math.floor(Math.random() * 8);
      //stop current sound effect,
      clickAudioEl.pause();
      //adjust with new index and then play
      clickAudioEl.src = clickSounds[clickIndex].link;
      clickVol = clickSounds[clickIndex].vol;
      clickAudioEl.volume = (soundSliderEl.value / 100) * clickVol * soundOn;
      clickAudioEl.play();
    }
  }

  checkGame();
});

//RETRY BUTTON - will be left click only
retryEl.addEventListener("click", function (evt) {
  let statusGif2 = document.querySelector(".statusgif");
  statusGif2.src = kirbyFightGif;
  bombsInPlayEl.textContent = bombs;
  startGame();
});

//Buttons for different game difficulties
easygameEl.addEventListener("click", function (evt) {
  height = 4;
  width = 4;
  bombs = 4;

  numfields = width * height;
  viewSize = "8vw";
  let statusGif2 = document.querySelector(".statusgif");
  statusGif2.src = kirbyFightGif;
  bombsInPlayEl.textContent = bombs;
  startGame();
});

normalgameEl.addEventListener("click", function (evt) {
  height = 7;
  width = 7;
  bombs = 10;
  numfields = width * height;
  viewSize = "8vw";
  let statusGif2 = document.querySelector(".statusgif");
  statusGif2.src = kirbyFightGif;
  bombsInPlayEl.textContent = bombs;
  startGame();
});

hardgameEl.addEventListener("click", function (evt) {
  height = 10;
  width = 10;
  bombs = 25;
  numfields = width * height;
  viewSize = "5vw";
  let statusGif2 = document.querySelector(".statusgif");
  statusGif2.src = kirbyFightGif;
  bombsInPlayEl.textContent = bombs;
  startGame();
});

//dev mode/cheat button, changes images to be 95% so you can see underneath a bit.
devEl.addEventListener("click", function (evt) {
  let allSquareEl = document.querySelectorAll(".square");

  //if off, toggle it ON
  if (evt.target.getAttribute("state") === "OFF") {
    evt.target.setAttribute("state", "ON");
    evt.target.textContent = "Dev Mode: ON";

    allSquareEl.forEach(function (square) {
      square.firstChild.style.maxWidth = "95%";
      if (square.getAttribute("has-bomb") === "true") {
        square.style.backgroundColor = "orange";
      }
    });
  } else if (evt.target.getAttribute("state") === "ON") {
    evt.target.setAttribute("state", "OFF");
    evt.target.textContent = "Dev Mode: OFF";

    allSquareEl.forEach(function (square) {
      square.firstChild.style.maxWidth = "100%";
      square.style.backgroundColor = "green";
    });
  }
});

//======= ALL SOUND RELATED EVENT LISTENERS =======
//================================================
//Event listener for music slider to control bgm volume or sound
bgmSliderEl.addEventListener("change", function (evt) {
  //change background music
  bgmAudioEl.volume = (bgmSliderEl.value / 100) * bgmVol * musicOn;
  victoryAudioEl.volume = (bgmSliderEl.value / 100) * victoryVol * musicOn;
});

soundSliderEl.addEventListener("change", function (evt) {
  //change all sound effects, bomb, death, clicks
  bombAudioEl.volume = (soundSliderEl.value / 100) * bombVol * soundOn;
  deathAudioEl.volume = (soundSliderEl.value / 100) * deathVol * soundOn;
  clickAudioEl.volume = (soundSliderEl.value / 100) * clickVol * soundOn;
});

//Event listeners for smooth dragging live volume change
bgmSliderEl.addEventListener("input", function (evt) {
  //update the volume
  bgmAudioEl.volume = (bgmSliderEl.value / 100) * bgmVol * musicOn;
  victoryAudioEl.volume = (bgmSliderEl.value / 100) * victoryVol * musicOn;
});

soundSliderEl.addEventListener("input", function (evt) {
  //change all sound effects, bomb, death, clicks
  bombAudioEl.volume = (soundSliderEl.value / 100) * bombVol * soundOn;
  deathAudioEl.volume = (soundSliderEl.value / 100) * deathVol * soundOn;
  clickAudioEl.volume = (soundSliderEl.value / 100) * clickVol * soundOn;
});

//Event Listener for music and sound checkboxes
bgmCheckboxEl.addEventListener("change", function (evt) {
  if (evt.target.checked) {
    musicOn = 1;
  } else {
    musicOn = 0;
  }
  //update the bgm and victory theme volume
  bgmAudioEl.volume = (bgmSliderEl.value / 100) * bgmVol * musicOn;
  victoryAudioEl.volume = (bgmSliderEl.value / 100) * victoryVol * musicOn;
});

soundCheckboxEl.addEventListener("change", function (evt) {
  if (evt.target.checked) {
    soundOn = 1;
  } else {
    soundOn = 0;
  }
  //update the volume on various sounds
  bombAudioEl.volume = (soundSliderEl.value / 100) * bombVol * soundOn;
  deathAudioEl.volume = (soundSliderEl.value / 100) * deathVol * soundOn;
  clickAudioEl.volume = (soundSliderEl.value / 100) * clickVol * soundOn;
});
