// This is a small program. There are only two sections. This first section is what runs
// as soon as the page loads.
$(document).ready(function () {
  render($("#display"), image);
  $("#apply").on("click", applyAndRender);
  $("#reset").on("click", resetAndRender);
});

/////////////////////////////////////////////////////////
//////// event handler functions are below here /////////
/////////////////////////////////////////////////////////

// this function resets the image to its original value; do not change this function
function resetAndRender() {
  reset();
  render($("#display"), image);
}

// this function applies the filters to the image and is where you should call
// all of your apply functions
function applyAndRender() {
  // Multiple TODOs: Call your apply function(s) here
  //applyFilterNoBackground(reddify);
  applyFilterNoBackground(decreaseBlue);
  //applyFilterNoBackground(increaseGreenByBlue);

  // do not change the below line of code
  render($("#display"), image);
}

/////////////////////////////////////////////////////////
// "apply" and "filter" functions should go below here //
/////////////////////////////////////////////////////////

// TODO 1, 2, 3 & 5: Create the applyFilter function here
function applyFilter(filterFunction) {
  for (var row = 0; row < image.length; row++) {
    for (var col = 0; col < image[row].length; col++) {
      var pixel = image[row][col];
      var pixelArray = rgbStringToArray(pixel);
      // This is where I’ll modify the color values later
      filterFunction(pixelArray);
      var updatedPixel = rgbArrayToString(pixelArray);
      image[row][col] = updatedPixel;
    }
  }
}
// TODO 9 Create the applyFilterNoBackground function
function applyFilterNoBackground(filterFunction) {
  var backgroundColor = image[0][0];
  for (var row = 0; row < image.length; row++) {
    for (var col = 0; col < image[row].length; col++) {
      var pixel = image[row][col];
      if (pixel !== backgroundColor) {
        var pixelArray = rgbStringToArray(pixel);
        filterFunction(pixelArray);
        var updatedPixel = rgbArrayToString(pixelArray);
        image[row][col] = updatedPixel;
      }
    }
  }
}
// TODO 6: Create the keepInBounds function
function keepInBounds(value) {
  return value < 0 ? 0 : value > 255 ? 255 : value;
}
console.log(keepInBounds(-50));
console.log(keepInBounds(300));
console.log(keepInBounds(125));
// TODO 4: Create reddify filter function
function reddify(pixelArray) {
  pixelArray[RED] = 200;
}
var testArray = [100, 100, 100];
reddify(testArray);
console.log(testArray); // Should show [200, 100, 100]
// TODO 7 & 8: Create more filter functions
function decreaseBlue(pixelArray) {
  pixelArray[BLUE] = keepInBounds(pixelArray[BLUE] - 50);
}
function increaseGreenByBlue(pixelArray) {
  pixelArray[GREEN] = keepInBounds(pixelArray[GREEN] + pixelArray[BLUE]);
}
var testArray2 = [100, 100, 100];
decreaseBlue(testArray2);
console.log(testArray2); // Should show [100, 100, 50]

function increaseGreenByBlue(pixelArray) {
  pixelArray[GREEN] = keepInBounds(pixelArray[GREEN] + pixelArray[BLUE]);
}
var testArray3 = [100, 100, 100];
increaseGreenByBlue(testArray3);
console.log(testArray3); // Should show [100, 200, 100]
// CHALLENGE code goes below here
