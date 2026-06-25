/* global $, sessionStorage */

$(document).ready(runProgram); // wait for the HTML / CSS elements of the page to fully load, then execute runProgram()

function runProgram() {
  ////////////////////////////////////////////////////////////////////////////////
  //////////////////////////// SETUP /////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  // Constant Variables
  var walker = {
    x: 0,
    y: 0,
    speedX: 5,
    speedY: 0,
  };
  var keyPressCount = 0;
  var keyHoldMilliseconds = 0;
  var runTimeMilliseconds = 0;
  var distanceTraveled = 0;
  var walkerClickCount = 0;
  var totalWalkerClicks = 0;
  var wallHitCount = 0;
  var dvdWallHitCount = 0;
  var dvdActiveMilliseconds = 0;
  var dvdMode = false;
  var randomMode = false;
  var changeOnWallHitMode = false;
  var dvdSpeed = 2;
  var isTouchingWall = false;
  var collisionStatus = "None";
  var lastKeyPressedName = "None";
  var fps = 0;
  var frameTime = 0;
  var mouseX = 0;
  var mouseY = 0;
  var activeKeys = {};
  var lastFrameTime = Date.now();
  var FRAME_RATE = 60;
  var FRAMES_PER_SECOND_INTERVAL = 1000 / FRAME_RATE;
  const KEY = {
    ENTER: 13,
    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,
  };
  // Game Item Objects

  // one-time setup
  var interval = setInterval(newFrame, FRAMES_PER_SECOND_INTERVAL); // execute newFrame every 0.0166 seconds (60 Frames per second)

  /* 
  This section is where you set up event listeners for user input.
  For example, if you wanted to handle a click event on the document, you would replace 'eventType' with 'click', and if you wanted to execute a function named 'handleClick', you would replace 'handleEvent' with 'handleClick'.

  Note: You can have multiple event listeners for different types of events.
  */
  $(document).on("keydown", handleKeyDown);
  $(document).on("keyup", handleKeyUp);
  $("#random-button").on("click", function () {
    randomMode = !randomMode;
    dvdMode = false;
    if (randomMode) {
      setRandomModeVelocity();
      $(this).text("Random mode active");
    } else {
      walker.speedX = 0;
      walker.speedY = 0;
      $(this).text("Start random move");
    }
    $("#dvd-button").text("Start DVD move");
    $("#change-button").text("Change color on wall hit");
  });
  $("#change-button").on("click", function () {
    changeOnWallHitMode = !changeOnWallHitMode;
    $(this).text(
      changeOnWallHitMode ? "Color change active" : "Change color on wall hit",
    );
    if (!dvdMode && !randomMode) {
      $("#dvd-button").text("Start DVD move");
      $("#random-button").text("Start random move");
    }
  });
  $(document).on("click", function (event) {
    if ($(event.target).closest("#dvd-controls").length > 0) {
      return;
    }

    totalWalkerClicks += 1;
    $("#total-walker-click-value").text(totalWalkerClicks);

    if ($(event.target).closest("#walker").length > 0) {
      var randomColor = getRandomColor();
      $("#walker").css("background-color", randomColor);
      walkerClickCount += 1;
      $("#walker-click-value").text(walkerClickCount);
    }
  });
  $("#dvd-speed-slider").on("input change", function () {
    dvdSpeed = Number(this.value);
    $("#dvd-speed-value").text(dvdSpeed + "x");
    if (dvdMode) {
      if (walker.speedX !== 0) {
        walker.speedX = Math.sign(walker.speedX) * dvdSpeed;
      }
      if (walker.speedY !== 0) {
        walker.speedY = Math.sign(walker.speedY) * dvdSpeed;
      }
    } else if (randomMode) {
      if (walker.speedX !== 0 || walker.speedY !== 0) {
        var currentAngle = Math.atan2(walker.speedY, walker.speedX);
        walker.speedX = Math.cos(currentAngle) * dvdSpeed;
        walker.speedY = Math.sin(currentAngle) * dvdSpeed;
      }
    }
  });
  $("#dvd-button").on("click", function () {
    dvdMode = !dvdMode;
    randomMode = false;
    if (dvdMode) {
      walker.speedX = Math.random() < 0.5 ? -dvdSpeed : dvdSpeed;
      walker.speedY = Math.random() < 0.5 ? -dvdSpeed : dvdSpeed;
      $(this).text("DVD mode active");
    } else {
      walker.speedX = 0;
      walker.speedY = 0;
      $(this).text("Start DVD move");
    }
    $("#random-button").text("Start random move");
    $("#change-button").text("Change color on wall hit");
  });
  $("body").css("background-color", getRandomColor());
  $("#walker").css("background-color", getRandomColor());
  $(document).on("mousemove", function (event) {
    mouseX = event.pageX;
    mouseY = event.pageY;
    $("#mouse-value").text(mouseX + ", " + mouseY);
  });

  function getRandomColor() {
    return "#000000".replace(/0/g, function () {
      return (~~(Math.random() * 16)).toString(16);
    });
  }

  function changeWalkerAppearance() {
    $("#walker").css("background-color", getRandomColor());
  }

  function setRandomModeVelocity() {
    var angle = Math.random() * Math.PI * 2;
    walker.speedX = Math.cos(angle) * dvdSpeed;
    walker.speedY = Math.sin(angle) * dvdSpeed;
  }

  ////////////////////////////////////////////////////////////////////////////////
  ///////////////////////// CORE LOGIC ///////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  /* 
  On each "tick" of the timer, a new frame is dynamically drawn using JavaScript
  by calling this function and executing the code inside.
  */
  function newFrame() {
    var now = Date.now();
    var delta = now - lastFrameTime;
    lastFrameTime = now;

    updateRunTime(delta);
    updateDvdActiveTime(delta);
    updateDateTime();
    updateFps(delta);
    updateKeyHoldTime(delta);

    var prevX = walker.x;
    var prevY = walker.y;
    repositionGameItem();
    wallCollision();
    distanceTraveled += Math.sqrt(
      Math.pow(walker.x - prevX, 2) + Math.pow(walker.y - prevY, 2),
    );
    redrawGameItem();
    updateDebugDisplays();
    // console.log(walker.x, walker.y);
  }

  /* 
  This section is where you set up the event handlers for user input.
  For example, if you wanted to make an event handler for a click event, you should rename this function to 'handleClick', then write the code that should execute when the click event occurs.
  
  Note: You can have multiple event handlers for different types of events.
  */
  function handleKeyDown(event) {
    var isManualMovementKey =
      event.which === KEY.LEFT ||
      event.which === KEY.RIGHT ||
      event.which === KEY.UP ||
      event.which === KEY.DOWN ||
      event.which === KEY.A ||
      event.which === KEY.D;

    if (isManualMovementKey) {
      event.preventDefault();
    }

    if (!activeKeys[event.which]) {
      activeKeys[event.which] = true;
      keyPressCount += 1;
      $("#counter-value").text(keyPressCount);
    }

    lastKeyPressedName = getKeyName(event.which);
    $("#last-key-value").text(lastKeyPressedName);

    if (event.which === KEY.SPACE) {
      console.log("Space key pressed");
      // Handle spacebar press
    }
    if (event.which === KEY.ENTER) {
      console.log("Enter key pressed");
      // Handle enter key press
    }
    if (event.which === KEY.LEFT) {
      walker.speedX = -5;
      console.log("Left key pressed");
      // Handle left arrow key press
    }
    if (event.which === KEY.RIGHT) {
      walker.speedX = 5;
      console.log("Right key pressed");
      // Handle right arrow key press
    }
    if (event.which === KEY.UP) {
      walker.speedY = -5;
      console.log("Up key pressed");
      // Handle up arrow key press
    }
    if (event.which === KEY.DOWN) {
      walker.speedY = 5;
      console.log("Down key pressed");
      // Handle down arrow key press
    }
    if (event.which === KEY.A) {
      walker.speedX = -5;
      console.log("A key pressed");
      // Handle A key press
    }
    if (event.which === KEY.B) {
      console.log("B key pressed");
      // Handle B key press
    }
    if (event.which === KEY.C) {
      console.log("C key pressed");
      // Handle C key press
    }
    if (event.which === KEY.D) {
      walker.speedX = 5;
      console.log("D key pressed");
      // Handle D key press
    }
    if (event.which === KEY.E) {
      console.log("E key pressed");
      // Handle E key press
    }
    if (event.which === KEY.F) {
      console.log("F key pressed");
      // Handle F key press
    }
    if (event.which === KEY.G) {
      console.log("G key pressed");
      // Handle G key press
    }
    if (event.which === KEY.H) {
      console.log("H key pressed");
      // Handle H key press
    }
    if (event.which === KEY.I) {
      console.log("I key pressed");
      // Handle I key press
    }
    if (event.which === KEY.J) {
      console.log("J key pressed");
      // Handle J key press
    }
    if (event.which === KEY.K) {
      console.log("K key pressed");
      // Handle K key press
    }
    if (event.which === KEY.L) {
      console.log("L key pressed");
      // Handle L key press
    }
    if (event.which === KEY.M) {
      console.log("M key pressed");
      // Handle M key press
    }
    if (event.which === KEY.N) {
      console.log("N key pressed");
      // Handle N key press
    }
    if (event.which === KEY.O) {
      console.log("O key pressed");
      // Handle O key press
    }
    if (event.which === KEY.P) {
      console.log("P key pressed");
      // Handle P key press
    }
    if (event.which === KEY.Q) {
      console.log("Q key pressed");
      // Handle Q key press
    }
    if (event.which === KEY.R) {
      console.log("R key pressed");
      // Handle R key press
    }
    if (event.which === KEY.S) {
      walker.speedY = 5;
      console.log("S key pressed");
      // Handle S key press
    }
    if (event.which === KEY.T) {
      console.log("T key pressed");
      // Handle T key press
    }
    if (event.which === KEY.U) {
      console.log("U key pressed");
      // Handle U key press
    }
    if (event.which === KEY.V) {
      console.log("V key pressed");
      // Handle V key press
    }
    if (event.which === KEY.W) {
      walker.speedY = -5;
      console.log("W key pressed");
      // Handle W key press
    }
    if (event.which === KEY.X) {
      console.log("X key pressed");
      // Handle X key press
    }
    if (event.which === KEY.Y) {
      console.log("Y key pressed");
      // Handle Y key press
    }
    if (event.which === KEY.Z) {
      console.log("Z key pressed");
      // Handle Z key press
    }

    countWallHitIfAtWall(event.which);
    console.log(event.which);
  }

  function countWallHitIfAtWall(keyCode) {
    var boardWidth = $("#board").width();
    var boardHeight = $("#board").height();
    var walkerWidth = $("#walker").width();
    var walkerHeight = $("#walker").height();

    var hittingLeftWall =
      walker.x <= 0 && (keyCode === KEY.LEFT || keyCode === KEY.A);
    var hittingRightWall =
      walker.x >= boardWidth - walkerWidth &&
      (keyCode === KEY.RIGHT || keyCode === KEY.D);
    var hittingTopWall =
      walker.y <= 0 && (keyCode === KEY.UP || keyCode === KEY.W);
    var hittingBottomWall =
      walker.y >= boardHeight - walkerHeight &&
      (keyCode === KEY.DOWN || keyCode === KEY.S);

    if (
      hittingLeftWall ||
      hittingRightWall ||
      hittingTopWall ||
      hittingBottomWall
    ) {
      wallHitCount += 1;
      $("#wall-hit-value").text(wallHitCount);
    }
  }

  function handleKeyUp(event) {
    activeKeys[event.which] = false;

    // Handle key up events
    if (event.which === KEY.LEFT || event.which === KEY.RIGHT) {
      walker.speedX = 0;
    }
    if (event.which === KEY.UP || event.which === KEY.DOWN) {
      walker.speedY = 0;
    }
  }

  function hasAnyKeyDown() {
    for (var keyCode in activeKeys) {
      if (activeKeys[keyCode]) {
        return true;
      }
    }
    return false;
  }

  function updateRunTime(delta) {
    runTimeMilliseconds += delta;
    $("#runtime-value").text(formatHoldTime(runTimeMilliseconds));
  }

  function updateDateTime() {
    var now = new Date();
    $("#date-time").text(now.toLocaleString());
  }

  function updateKeyHoldTime(delta) {
    if (hasAnyKeyDown()) {
      keyHoldMilliseconds += delta;
      $("#hold-value").text(formatHoldTime(keyHoldMilliseconds));
    }
  }

  function updateDvdActiveTime(delta) {
    if (dvdMode) {
      dvdActiveMilliseconds += delta;
      $("#dvd-time-value").text(formatHoldTime(dvdActiveMilliseconds));
    }
  }

  function updateFps(delta) {
    frameTime = delta;
    fps = delta > 0 ? Math.round(1000 / delta) : 0;
    $("#fps-value").text(fps);
    $("#frame-time-value").text(frameTime + "ms");
  }

  function updateDebugDisplays() {
    $("#position-value").text(walker.x + ", " + walker.y);
    $("#velocity-value").text(walker.speedX + ", " + walker.speedY);
    $("#direction-value").text(getDirection());
    $("#active-keys-value").text(getActiveKeyNames());
    $("#collision-value").text(collisionStatus);
    $("#distance-value").text(Math.floor(distanceTraveled) + "px");
    $("#last-key-value").text(lastKeyPressedName);
  }

  function getKeyName(keyCode) {
    switch (keyCode) {
      case KEY.ENTER:
        return "Enter";
      case KEY.SPACE:
        return "Space";
      case KEY.LEFT:
        return "Left";
      case KEY.UP:
        return "Up";
      case KEY.RIGHT:
        return "Right";
      case KEY.DOWN:
        return "Down";
      case KEY.A:
        return "A";
      case KEY.B:
        return "B";
      case KEY.C:
        return "C";
      case KEY.D:
        return "D";
      case KEY.E:
        return "E";
      case KEY.F:
        return "F";
      case KEY.G:
        return "G";
      case KEY.H:
        return "H";
      case KEY.I:
        return "I";
      case KEY.J:
        return "J";
      case KEY.K:
        return "K";
      case KEY.L:
        return "L";
      case KEY.M:
        return "M";
      case KEY.N:
        return "N";
      case KEY.O:
        return "O";
      case KEY.P:
        return "P";
      case KEY.Q:
        return "Q";
      case KEY.R:
        return "R";
      case KEY.S:
        return "S";
      case KEY.T:
        return "T";
      case KEY.U:
        return "U";
      case KEY.V:
        return "V";
      case KEY.W:
        return "W";
      case KEY.X:
        return "X";
      case KEY.Y:
        return "Y";
      case KEY.Z:
        return "Z";
      default:
        return String.fromCharCode(keyCode) || "Unknown";
    }
  }

  function getActiveKeyNames() {
    var keys = [];
    for (var keyCode in activeKeys) {
      if (activeKeys[keyCode]) {
        keys.push(getKeyName(Number(keyCode)));
      }
    }
    return keys.length > 0 ? keys.join(", ") : "None";
  }

  function getDirection() {
    var directions = [];
    if (walker.speedY < 0) {
      directions.push("Up");
    }
    if (walker.speedY > 0) {
      directions.push("Down");
    }
    if (walker.speedX < 0) {
      directions.push("Left");
    }
    if (walker.speedX > 0) {
      directions.push("Right");
    }
    return directions.length > 0 ? directions.join("/") : "None";
  }

  function formatHoldTime(milliseconds) {
    var totalMilliseconds = Math.floor(milliseconds);
    var ms = totalMilliseconds % 1000;
    var totalSeconds = Math.floor(totalMilliseconds / 1000);
    var seconds = totalSeconds % 60;
    var totalMinutes = Math.floor(totalSeconds / 60);
    var minutes = totalMinutes % 60;
    var totalHours = Math.floor(totalMinutes / 60);
    var hours = totalHours % 24;
    var totalDays = Math.floor(totalHours / 24);
    var days = totalDays % 30;
    var totalMonths = Math.floor(totalDays / 30);
    var months = totalMonths % 12;
    var years = Math.floor(totalMonths / 12);

    return (
      years +
      "y " +
      months +
      "mo " +
      days +
      "d " +
      hours +
      "h " +
      minutes +
      "m " +
      seconds +
      "s " +
      ms +
      "ms"
    );
  }

  ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// HELPER FUNCTIONS ////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  function repositionGameItem() {
    // Reposition the game item based on its speed
    walker.x = walker.x + walker.speedX;
    walker.y = walker.y + walker.speedY;
  }
  function redrawGameItem() {
    // Redraw the game item at its new position
    // console.log("Walker position:", walker.x, walker.y);
    $("#walker").css("left", walker.x);
    $("#walker").css("top", walker.y);
  }
  function wallCollision() {
    // Check for collision with walls
    var boardWidth = $("#board").width();
    var boardHeight = $("#board").height();
    var walkerWidth = $("#walker").width();
    var walkerHeight = $("#walker").height();
    var hasHitWallThisFrame = false;

    if (walker.x < 0) {
      walker.x = 0;
      if (dvdMode) {
        walker.speedX = Math.abs(walker.speedX);
      } else {
        walker.x = walker.x - walker.speedX;
      }
      hasHitWallThisFrame = true;
    }
    if (walker.y < 0) {
      walker.y = 0;
      if (dvdMode) {
        walker.speedY = Math.abs(walker.speedY);
      } else {
        walker.y = walker.y - walker.speedY;
      }
      hasHitWallThisFrame = true;
    }
    if (walker.x > boardWidth - walkerWidth) {
      walker.x = boardWidth - walkerWidth;
      if (dvdMode) {
        walker.speedX = -Math.abs(walker.speedX);
      } else {
        walker.x = walker.x - walker.speedX;
      }
      hasHitWallThisFrame = true;
    }
    if (walker.y > boardHeight - walkerHeight) {
      walker.y = boardHeight - walkerHeight;
      if (dvdMode) {
        walker.speedY = -Math.abs(walker.speedY);
      } else {
        walker.y = walker.y - walker.speedY;
      }
      hasHitWallThisFrame = true;
    }

    if (randomMode && hasHitWallThisFrame) {
      setRandomModeVelocity();
    }

    if (changeOnWallHitMode && hasHitWallThisFrame) {
      changeWalkerAppearance();
    }

    if (dvdMode) {
      if (hasHitWallThisFrame) {
        dvdWallHitCount += 1;
        $("#dvd-hit-value").text(dvdWallHitCount);
      }
      collisionStatus = hasHitWallThisFrame ? "Bouncing" : "Moving";
      return;
    }

    if (hasHitWallThisFrame && !isTouchingWall) {
      wallHitCount += 1;
      $("#wall-hit-value").text(wallHitCount);
      isTouchingWall = true;
      collisionStatus = randomMode ? "Random bouncing" : "Touching wall";
    } else if (!hasHitWallThisFrame) {
      isTouchingWall = false;
      collisionStatus = randomMode ? "Moving" : "None";
    }
  }
  function endGame() {
    // stop the interval timer
    clearInterval(interval);

    // turn off event handlers
    $(document).off();
  }
}
