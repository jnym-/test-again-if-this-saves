/* Draws bearing housing back (either merged or not merged) */
function drawBack(stepped, merged) {
  fill(240, 240, 240);
  if (merged) {
    rect(pos.centre.x, pos.centre.y, 0.5 * canvas.dim.x + 80, shaft.dia.straight/2 + 150);
  }
  else {
    rect(pos.offset.left, pos.centre.y, 80, shaft.dia.straight/2 + 150);
    rect(pos.offset.right, pos.centre.y, 80, shaft.dia.straight/2 + 150);
  }
  fill('white');
}

/* Draws bearing at a given x location for stepped and non-stepped shafts */
function drawBearing(x, stepped) {
  let shapeColour = ['black', 'white'], 
      outline = [2, 0],
      y = [pos.centre.y + (shaft.dia.straight - shaft.dia.stepped)/2 + 42, 
           pos.centre.y - (shaft.dia.straight - shaft.dia.stepped)/2 - 41];

  if (x < pos.centre.x) {
    x = constraintLogic(x, 'leftBearing');
  }
  else if (x > pos.centre.x) {
    x = constraintLogic(x, 'rightBearing');
  }

  noStroke();
  if (stepped) {
    for (let i=0; i<2; i++) {
      let sign = -1;
      for (let j=0; j<outline.length; j++) {
        fill(shapeColour[i]);
        rect(x + 0.5, y[j] - sign*14.5, 48.5 + outline[i], 15 + outline[i], 1, 1, 1, 1);
        rect(x + 0.5, y[j] + sign*30.5, 48.5 + outline[i], 15 + outline[i], 1, 1, 1, 1);
        ellipse(x + 0.5, y[j] + sign*8, 34 + outline[i], 34 + outline[i]);
        sign = 1;
      }
    }
  }
  else {
    for (let i=0; i<2; i++) {
      for (let j=0; j<outline.length; j++) {
        fill(shapeColour[i]);
        rect(x + 0.5, y[j] - 16, 40 + outline[i], 12 + outline[i], 1, 1, 1, 1);
        rect(x + 0.5, y[j] + 16, 40 + outline[i], 12 + outline[i], 1, 1, 1, 1);
        ellipse(x + 0.5, y[j], 24 + outline[i], 24 + outline[i]);
      }
    }
  }
  stroke('black');
}

/* Draws bearing housing */
function drawBasicHousing(x, merged) {
  fill(200, 200, 200);
  if (merged) {
    rect(pos.centre.x, pos.centre.y + shaft.dia.straight/2 + 57, 0.5 * canvas.dim.x + 80, 24);
    rect(pos.centre.x, pos.centre.y - shaft.dia.straight/2 - 57, 0.5 * canvas.dim.x + 80, 24);
  }
  else {
    rect(x, pos.centre.y + shaft.dia.straight/2 + 57, 80, 24);
    rect(x, pos.centre.y - shaft.dia.straight/2 - 57, 80, 24);
  }
  fill('white');
}

/* Draws shaft for stepped and non-stepped modes */
function drawShaft(x, stepped, leftCap, rightCap) {
  let leftShort = 0,
      rightShort = 0;

  x = constraintLogic(x, 'shaft');

  if (leftCap == 'cap') {
    leftShort = canvas.dim.x*0.2 - 25;
  }
  if (rightCap == 'cap') {
    rightShort = canvas.dim.x*0.2 - 25;
  }

  if (stepped) {
    rect(x + leftShort/2, pos.centre.y, shaft.dim.x - leftShort, shaft.dia.stepped, 3, 3, 3, 3);
    rect(x - canvas.dim.x * 0.1 - 12.5 + leftShort/2, pos.centre.y, canvas.dim.x * 0.7 - 25 - leftShort, shaft.dia.straight, 3, 3, 3, 3);
  }
  else {
    rect(x + leftShort/2 - rightShort/2, pos.centre.y, shaft.dim.x - leftShort - rightShort, shaft.dia.straight, 3, 3, 3, 3);
  }
}

/* Draws centreline at y for a given length */
function drawCentreline(y, length) {
  let n = (length - 4)/20,
      prev = (length - (Math.floor(n)-1)*20)/2;

  stroke('black');
  for (let i=0; i<n-1; i++) {
    line(prev + 4, y, prev + 16, y);
    point(prev + 20, y);
    prev += 20;
  }
  line(prev + 4, y, prev + 16, y);
}

/* Draws end cap at a given location */
function drawCap(location, returnPosition) {
  let x = [pos.offset.left - 41, pos.offset.right + 41];
      shift = 30;

  if (location > 0) {
    location = 1;
    shift *= -1;
  }

  x[location] = constraintLogic(x[location], 'shaft');

  if (returnPosition) {
    return {x: x[location], shift: 0, long: 20, high: shaft.dia.straight + 13};
  }
  else {
    rect(x[location], pos.centre.y, 40, shaft.dia.straight + 26, 2, 2, 2, 2);
    rect(x[location] - shift, pos.centre.y, 20, 40, 2, 2, 2, 2);
    drawCentreline(pos.centre.y, canvas.dim.x * 0.95);
  }
}


/* Draws circlip at a given location */
function drawCirclip(location, stepped, returnPosition) {
  let x = [pos.offset.left - 24, pos.offset.left + 24, pos.offset.right - 24, pos.offset.right + 24],
      shift = shaft.dia.straight/2;

  x[location] = constraintLogic(x[location], 'shaft');

  if (location == 3 && stepped) {
    shift -= (shaft.dia.straight - shaft.dia.stepped)/2; 
  }

  if (location > 3) {
    shift += 45;
    location -= 4;
  }

  if (stepped) {
    x[2] -= 4;
    x[3] += 4;
  }

  if (returnPosition) {
    return {x: x[location], shift: shift, long: 6, high: 12};
  }
  else {
    rect(x[location], pos.centre.y + shift, 6, 12, 1, 1, 1, 1);
    rect(x[location], pos.centre.y - shift, 6, 12, 1, 1, 1, 1);
  }
}

/* Draws collar at given location and merges common central collars */
function drawCollar(location, common, returnPosition) {
  let length = canvas.dim.x * 0.2 - 20,
      x = [pos.offset.left - 20.5 - length/2, pos.offset.left + 20.5 + length/2,
           pos.offset.right - 20.5 - length/2, pos.offset.right + 20.5 + length/2];

  if (common) {
    x[location] = pos.centre.x;
    length = canvas.dim.x * 0.5 - 41;
  }

  x[location] = constraintLogic(x[location], 'shaft');

  if (returnPosition) {
    return {x: x[location], shift: 0, long: length, high: shaft.dia.straight + 26};
  }
  else {
    rect(x[location], pos.centre.y, length, shaft.dia.straight + 26, 3, 3, 3, 3);
    drawCentreline(pos.centre.y, canvas.dim.x * 0.95);
  }
}


/* Draws spacer at locations 1 or 5 */
function drawSpacer(location, stepped, returnPosition) {
  let shift = shaft.dia.straight/2 + 7.5,
      x = pos.centre.x,
      step = 0;

  for (let i=0; i<partName.length; i++) {
    if (design.drag[i].part) {
      x = constraintLogic(x, partName[i], true);
    }
  }

  if (location > 3) {
    shift += 30;
    if (stepped) {
      step = 4.5;
      x -= step/2;
    }
  }

  if (returnPosition) {
    return {x: x, shift: shift, long: canvas.dim.x * 0.5 - 41 - step, high: 15};
  }
  else {
    rect(x, pos.centre.y - shift, canvas.dim.x * 0.5 - 41 - step, 15, 2, 2, 2, 2);
    rect(x, pos.centre.y + shift, canvas.dim.x * 0.5 - 41 - step, 15, 2, 2, 2, 2);
  }
}

/* Draws housing shoulder at location (preview only) */
function drawShoulder(location, stepped, returnPosition) {
  let x = [pos.offset.left - 30, pos.offset.left + 30, pos.offset.right - 30, pos.offset.right + 30],
      shift = 38.5,
      step = {x: 0, y: 0};
  
  location -= 4;
  if (stepped && location > 1) {
    step.x = 4;
    step.y = 3;
    x[2] -= step.x/2;
    x[3] += step.x/2;
  }

  if (returnPosition) {
    return {x: x[location], shift: shaft.dia.straight/2 + shift - step.y/2, long: 19 - step.x, high: 13 + step.y};
  }
  else {
    rect(x[location], pos.centre.y + shaft.dia.straight/2 + shift - step.y/2, 19 - step.x, 13 + step.y);
    rect(x[location], pos.centre.y - shaft.dia.straight/2 - shift + step.y/2, 19 - step.x, 13 + step.y);
  }
}

/* Draws a custom housing with shoulders and merges common central shoulders */
function drawCustomHousing(location, stepped, common) {
  let shapeColour = ['black', 200], 
      outline = [0, -2],
      step = {x: 0, y: 0},
      x = [pos.offset.left - 29.5, pos.offset.left + 30.5, pos.offset.right - 29.5, pos.offset.right + 30.5];

  location -=4;
  if (stepped && location > 1) {
    step.x = 4;
    step.y = 3;
    x[2] -= step.x/2;
    x[3] += step.x/2;
  }

  noStroke()
  if (common && location == 2) {
    for (let i=0; i<outline.length; i++) {
      fill(shapeColour[i]);
      rect(pos.centre.x + 0.5 - step.x/2, pos.centre.y + shaft.dia.straight/2 + 38.5 - outline[i] - step.y/2, canvas.dim.x*0.5 - 39 + outline[i] - step.x, 13 - outline[i] + step.y);
      rect(pos.centre.x + 0.5 - step.x/2, pos.centre.y - shaft.dia.straight/2 - 37.5 + outline[i] + step.y/2, canvas.dim.x*0.5 - 39 + outline[i] - step.x, 13 - outline[i] + step.y);
    }
  }
  else {
    if (!common && (location == 1 || location == 2) || location == 0 || location == 3) {
      for (let i=0; i<outline.length; i++) {
        fill(shapeColour[i]);
        rect(x[location], pos.centre.y + shaft.dia.straight/2 + 38.5 - outline[i] - step.y/2, 21 + outline[i] - step.x, 13 - outline[i] + step.y);
        rect(x[location], pos.centre.y - shaft.dia.straight/2 - 37.5 + outline[i] + step.y/2, 21 + outline[i] - step.x, 13 - outline[i] + step.y);
      }
    }
  }
  stroke('black');
}