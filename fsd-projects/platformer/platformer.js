$(function () {
  // initialize canvas and context when able to
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  window.addEventListener("load", loadJson);

  function setup() {
    if (firstTimeSetup) {
      halleImage = document.getElementById("player");
      projectileImage = document.getElementById("projectile");
      cannonImage = document.getElementById("cannon");
      $(document).on("keydown", handleKeyDown);
      $(document).on("keyup", handleKeyUp);
      firstTimeSetup = false;
      //start game
      setInterval(main, 1000 / frameRate);
    }

    // Create walls - do not delete or modify this code
    createPlatform(-50, -50, canvas.width + 100, 50); // top wall
    createPlatform(-50, canvas.height - 10, canvas.width + 100, 200, "navy"); // bottom wall
    createPlatform(-50, -50, 50, canvas.height + 500); // left wall
    createPlatform(canvas.width, -50, 50, canvas.height + 100); // right wall

    //////////////////////////////////
    // ONLY CHANGE BELOW THIS POINT //
    //////////////////////////////////

    // TODO 1 - Enable the Grid
     toggleGrid();


    // TODO 2 - Create Platforms
createPlatform(500, 90, 1, 566, "black");
createPlatform(1350, 400, 50, 50, "red");
createPlatform(300, 598, 330, 20, "black");
createPlatform(500, 740, 200, 1, "black");
createPlatform(100, 456, 200, 1, "black");
createPlatform(300, 314, 200, 1, "black");
createPlatform(100, 192, 200, 1, "black");
createPlatform(300, 90, 200, 1, "black");
createPlatform(544, 10, 50, 150, "black");
//createPlatform(544, 90, 1, 569);
createPlatform(700, 460, 200, 1, "black");
createPlatform(1000, 340, 200, 1, "black");
    // TODO 3 - Create Collectables
createCollectable("database", 550, 540, 5, 0);
createCollectable("database", 1080, 290, 5, 0);
createCollectable("database", 1360, 350, 5, 0);
    
    // TODO 4 - Create Cannons
 createCannon("top", 960, 700);
 createCannon("bottom", 1180, 700);
 createCannon("right", 760, 500);
    
    
    //////////////////////////////////
    // ONLY CHANGE ABOVE THIS POINT //
    //////////////////////////////////
  }

  registerSetup(setup);
});
