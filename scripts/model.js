/* Base class to render the bearing-shaft arrangement */
class Base {
  constructor(layer) {
    let updateRender = function() {};

    this.init = function() {
      switch(basic.layer[layer]) {
        case 'back':
          updateRender = function() {
            drawBack(basic.stepped, basic.merged);
          }
        break
        case 'bearing':
          updateRender = function() {
            drawBearing(pos.offset.left, false);
            drawBearing(pos.offset.right, basic.stepped);
          }
        break
        case 'housing':
          updateRender = function() {
            drawBasicHousing(pos.offset.left, basic.merged);
            drawBasicHousing(pos.offset.right, basic.merged);
          }
        break
        case 'shaft':
          updateRender = function() {
            drawShaft(pos.centre.x, basic.stepped, con.tag[0], con.tag[3]);
          }
        break
        case 'line':
          updateRender = function() {
            drawCentreline(pos.centre.y, canvas.dim.x * 0.95);
          }
        break
      }
    }
    this.init();

    this.render = function() {
      updateRender();
    }
  }
}

/* Constraint class to render all constraint types at each location */
class Constraint {
  constructor(type, location) {
    let updateRender = function() {}, 
        updatePosition = function() {},
        updatePreview = function() {};
    let position, rate, redRGB;

    this.resetHighlight = function() {
      rate = 5, redRGB = 45;
    }
    this.resetHighlight();

    this.init = function() {
      switch(type) {
        case 'circlip':
          updateRender = function() {
            fill(100, 100, 100);
            drawCirclip(location, basic.stepped);
          }
          updatePreview = function() {
            if (!basic.stepped || location != 2) {
              drawCirclip(location, basic.stepped);
              return true;
            }
          }
          updatePosition = function() {
            return position = drawCirclip(location, basic.stepped, true);
          }
        break
        case 'collar':
          updateRender = function() {
            fill('white');
            if ((location == 1 && con.tag[2] == 'collar') || (location == 2 && con.tag[1] == 'collar')) {
              drawCollar(location, true);
            }
            else {
              drawCollar(location, false);
            }
          }
          updatePreview = function() {
            if (!basic.stepped || location == 0) {
              drawCollar(location, false);
              return true;
            }
          }
          updatePosition = function() {
            return position = drawCollar(location, false, true);
          }
        break
        case 'spacer':
          updateRender = function() {
            if (location > 3) {
              if (!flag.alert && !basic.merged) {
                if (confirm('This will merge the bearing housings. Do you wish to continue?')) {
                  document.getElementById('housing').checked = true;
                  basic.merged = true;
                  flag.alert = true;
                }
                else {
                  removeConstraint(type, [5, 6]);
                }
              }
            }
            if (basic.merged || location < 3) {
              fill(100, 100, 100);
              drawSpacer(location, basic.stepped);
            }
          }
          updatePreview = function() {
            if(con.tag[location] == 'empty' && con.tag[location + 1] == 'empty') {
              drawSpacer(location, basic.stepped)
              return true;
            }
          }
          updatePosition = function() {
            return position = drawSpacer(location, basic.stepped, true);
          }
        break
        case 'shoulder':
          updateRender = function() {
            fill(200, 200, 200)

            if (((location == 5 && con.tag[6] == 'shoulder') || (location == 6 && con.tag[5] == 'shoulder')) && basic.merged) {
              drawCustomHousing(location, basic.stepped, true);
            }
            else {
              drawCustomHousing(location, basic.stepped, false);
            }
          }
          updatePreview = function() {
            drawShoulder(location, basic.stepped);
            return true;
          }
          updatePosition = function() {
            return position = drawShoulder(location, basic.stepped, true);
          }
        break
        case 'cap': 
          updateRender = function() {
            fill('white');
            drawCap(location);
          }
          updatePreview = function() {
            if (!(basic.stepped && location == 3)) {
              drawCap(location);
            }
            return true;
          }
          updatePosition = function() {
            return position = drawCap(location, true);;
          }
      }
    }
    this.init();

    this.render = function() {
      updateRender();
    }

    this.preview = function() {
      updatePreview();
    }

    this.highlight = function() {
      if (con.tag[location] == 'empty') {
        [redRGB, rate] = highlightPreview([redRGB, rate], updatePreview);
        if(checkHover(updatePosition(), true)) {
          flag.hand = true;
        }
        if (flag.held && updatePreview()) {
          if (checkHover(updatePosition(), false)) {
            updateConstraint(type, location);
            design.run[location] = this;
            flag.warning = true;
          }
        }
      }
    }
  }
}

/* Drag class to render the dragged components */
class Drag {
  constructor(part) {
    let hover = function() {},
        direction = function() {};
    let face = [false, false]; // Defines which sides of each part are constrained; [left, right]
    let select = false;

    this.init = function() {
      switch (part) {
        case 'shaft':
          hover = function() {
            let isHovering = false; // Returns true if any of the hover conditions are met
            if (select && mouseIsPressed) {
              return true;
            }
            if (design.drag[1].part || design.drag[2].part) {
              return false;
            }
            if (basic.stepped) {
              isHovering = checkHover({x: pos.centre.x + move.x, shift: 0, long: shaft.dim.x, high: shaft.dia.stepped}, true);
              if (!isHovering) {
                isHovering = checkHover({x: pos.centre.x - canvas.dim.x * 0.1 - 12.5 + move.x, shift: 0, long: canvas.dim.x * 0.7 - 25, high: shaft.dia.straight}, true);
              }            
            }
            else {
              isHovering = checkHover({x: pos.centre.x + move.x, shift: 0, long: shaft.dim.x, high: shaft.dia.straight}, true);
            }
            return isHovering;
          }
          direction = function(x) {
            return x + move.x;
          }
        break
        case 'leftBearing':
          hover = function() {
            if (design.drag[0].part) {
              return false;
            }
            if (select && mouseIsPressed) {
              return true;
            }
            return checkHover({x: pos.offset.left + move.x, shift: shaft.dia.straight/2 + 14, long: 42, high: 60}, true);
          }
          direction = function(x) {
            let sign = 1;
            for (let i=0; i<2; i++) {
              if (!con.state[4+i] && sign*move.x < 0) {
                x += move.x;
              }
              sign *= -1;
            }
            return x;
          }
        break
        case 'rightBearing':
          hover = function() {
            if (design.drag[0].part) {
              return false;
            }
            if (select && mouseIsPressed) {
              return true;
            }
            if (basic.stepped) {
              return checkHover({x: pos.offset.right + move.x, shift: shaft.dia.straight/2 + 14, long: 50.5, high: 60}, true);
            }
            return checkHover({x: pos.offset.right + move.x, shift: shaft.dia.straight/2 + 14, long: 42, high: 60}, true);
          }
          direction = function (x) {
            let sign = 1;
            for (let i=0; i<2; i++) {
              if (!con.state[6+i] && sign*move.x < 0) {
                x += move.x;
              }
              sign *= -1;
            }
            return x;
          }
        break 
      }
    }
    this.init();

    this.selected = function() {
      if (hover()) {
        flag.hand = true;
        select = true;
        this.part = true;
      }
      else {
        this.part = false;
        select = false;
      }
    }

    this.drawX = function(x) {
      return direction(x);
    }
  }
}

/* Setup function runs once on startup */
function setup() {
  // Model dimensioning (to scale with screen width)
  canvas = {
    dim: {
      x: document.getElementById('model.ID').offsetWidth,
      y: document.getElementById('model.ID').offsetHeight,
    },
  };
  canvas.dimensions = createCanvas(canvas.dim.x, canvas.dim.y);
  canvas.dimensions.parent('model.ID');

  shaft = {
    dim: {
      x: canvas.dim.x * 0.9,
    },
    dia: {
      straight: 70,
      stepped: 38,
    },
  };
  pos = {
    centre: {
      x: canvas.dim.x * 0.5,
      y: canvas.dim.y * 0.55,
    },
    offset: {
      up: canvas.dim.y * 0.5 - shaft.dia.straight - 20,
      down: canvas.dim.y * 0.5 + shaft.dia.straight + 20, 
      left: canvas.dim.x * 0.25,
      right: canvas.dim.x * 0.75,
    },
  };

  // Initialising model
  rectMode(CENTER);
  ellipseMode(CENTER);

  basic = {
    stepped: false,
    merged: false,
    message: undefined,
    assembly: [],
    layer: ['back', 'bearing', 'housing', 'shaft', 'line'],
  };
  con = { // Constraint status (tag defines the type of constraint; state defines the constrained status)
    tag: [],
    state: [],
  };

  design = [];
  design.base = [], design.run = [];
  typeName = ['circlip', 'collar', 'spacer', 'shoulder', 'cap']; // Constraint types

  for (let i=0; i<typeName.length; i++) {
    design[typeName[i]] = [];
    for (let j=0; j<8; j++) {
      design[typeName[i]][j] = new Constraint(typeName[i], j);
    }
  }
  for (let i=0; i<basic.layer.length; i++) {
    design.base[i] = new Base(i);
  }

  mode = 'design';
  flag = {
    held: false,
    hand: false,
    press: false,
    motion: false, // Drag mode flag: if true, update move coordinates to allow drag motion
    alert: false, // Merge alert flag: if true, hide merge housing warning
    warning: true, // User warning flag: if true, update warning boxes
  };
  move = {
    origin: 0,
    x: 0,
  };

  design.motion = undefined;
  design.drag = [];
  partName = ['shaft', 'leftBearing', 'rightBearing'];

  for (let i=0; i<partName.length; i++) {
    design.drag[i] = new Drag(partName[i]);
  }

  reset();
}

/* Draw function loops indefinitely following setup */
function draw() {
  // Base model
  if (mode == 'design') {
    background(204, 216, 240);
  }
  else {
    background(240, 240, 255);
  }

  for (let i=0; i<basic.layer.length; i++) {
    design.base[i].render();
  }
  for (let i=0; i<design.run.length; i++) {
    if (design.run[i] != undefined) {
      design.run[i].render();
    }
  }

  // Model modes
  switch (mode) {
    case 'design':
      for (let i=0; i<design.runHighlight.length; i++) {
        design.runHighlight[i].highlight();
      }
    break
    case 'test':
      for (let i=0; i<design.drag.length; i++) {
        design.drag[i].selected();
      }
    break
  }

  // Mouse click and hover checks
  if (flag.held) {
    flag.held = false;
  }
  if (flag.press) {
    flag.press = false;
  }
  if (flag.hand) {
    flag.hand = false;
    cursor(HAND);
  }
  else {
    cursor(ARROW);
  }

  // Update user information
  updateBearingTable();
  updateAssembly();
}

/* Resets design model */
function reset() {
  design.run = [];
  design.runHighlight = [];
  shaftModel = 'S0000';
  shaftFile = shaftModel;
  for (let i =0; i<8; i++) {
    updateConstraint('empty', i);
  }
  document.getElementById('housing').checked = false;
  updateHousing();
  updateStyle();

  $("#graphic").fadeOut(200, function() {
    $(this).attr("src","animations/background.gif").on('load', function(){$(this).fadeIn(200)});;
  });

  // Reset warnings
  basic.message = undefined;
  basic.assembly = [];
  removeWarning('all');
  flag.warning = true;
}

/* Assigns constraint type */
function feature(type) {
  design.runHighlight = [];

  $("#graphic").fadeOut(200, function() {
    $(this).attr("src","animations/" + type + ".gif").on('load', function(){$(this).fadeIn(200)});;
  });

  switch (type) {
    case 'intCirclip':
      design.runHighlight = design.circlip.slice(4,8);
    break
    case 'extCirclip':
      design.runHighlight = design.circlip.slice(0,4);
    break
    case 'collar':
      design.runHighlight = design.collar.slice(0,4);
    break
    case 'inSpacer':
      design.runHighlight = design.spacer.slice(1,2);
    break
    case 'outSpacer':
      design.runHighlight = design.spacer.slice(5,6);
    break
    case 'shoulder':
      design.runHighlight = design.shoulder.slice(4,8);
    break
    case 'cap':
      design.runHighlight = design.cap.slice(0,1).concat(design.cap.slice(3,4));
    break
  }
}

/* Updates model mode */
function updateMode() {
  let modeCheck = document.querySelector('input[name="mode.ID"]:checked').value;
  mode = modeCheck;
  design.runHighlight = [];

  if (mode == 'test') {
    $('.test-message').fadeIn(300);
  }
  else {
    $('.test-message').fadeOut(300);
  }

  $("#graphic").fadeOut(250, function() {
    $(this).fadeIn(250).attr("src","animations/background.gif");
  });
}

/* Updates the chosen shaft style */
function updateStyle() {
  let stepCheck = document.querySelector('input[name="shaft.ID"]:checked').value;
  if (stepCheck == 'stepped') {
    basic.stepped = true;
    removeConstraint('collar', [1, 2, 3]);
    removeConstraint('spacer', [1, 2]);
    removeConstraint('cap', 3);
    removeConstraint('all', 2);
    updateConstraint('collar', 2);

    if (con.tag[0] == 'collar') {
      shaftFile = 'ST1';
    }
    else {
      shaftFile = 'ST0';
    }
  }
  else {
    basic.stepped = false;
    updateConstraint('empty', 2)

    if (con.tag[0] == 'collar') {
      shaftModel = 'S1000';
    }
    else {
      shaftModel = 'S0000';
    }
    shaftFile = shaftModel;
  }
  
  for (let i=0; i<typeName.length; i++) {
    for (let j=0; j<8; j++) {
      design[typeName[i]][j].resetHighlight();
    }
  }

  // Reset warnings
  basic.message = undefined;
  basic.assembly = [];
  removeWarning('all');
  flag.warning = true;
}

/* Updates bearing housing (merged or unmerged) */
function updateHousing() {
  let mergeCheck = document.getElementById('housing');
  if (mergeCheck.checked) {
    basic.merged = true;
  }
  else {
    basic.merged = false;
    flag.alert = false;
    removeConstraint('spacer', [5, 6]);
  }

  for (let i=0; i<typeName.length; i++) {
    for (let j=0; j<8; j++) {
      design[typeName[i]][j].resetHighlight();
    }
  }
}

/* p5 function that triggers when the mouse is pressed and released */
function mouseClicked() {
  flag.held = true;
  move.x = 0;
}

/* p5 function that triggers when the mouse is pressed */
function mousePressed() {
  move.origin = mouseX;

  if (mode == 'test') {
    let graphic = document.getElementById('graphic');
    if ((design.drag[1].part || design.drag[2].part) && graphic.getAttribute('src') != 'animations/bearing.gif') {
      $("#graphic").fadeOut(200, function() {
        $(this).attr("src","animations/bearing.gif").on('load', function(){$(this).fadeIn(200)});
      });
    }
    else if (design.drag[0].part && graphic.getAttribute('src') != 'animations/' + shaftFile + '.gif') {
      $("#graphic").fadeOut(200, function() {
        $(this).attr("src","animations/" + shaftFile + ".gif").on('load', function(){$(this).fadeIn(200)});
      });
    } 
  }
}

/* p5 function that triggers when the mouse is dragged */
function mouseDragged() {
  if (mode == 'test') {
    move.x = mouseX - move.origin;

    for (let i=-1; i<=1; i+=2) {
      if (i*move.x > shaft.dim.x*0.25) {
        move.x = i*shaft.dim.x*0.25;
      }
    }
  }
}

/* Returns true if the mouse is within the position object parameters */
function checkHover(position, pointer) {
  let margin = 0;
  if (mode == 'design') {
    margin = 10;
  }

  if (((mouseY > pos.centre.y - position.shift - position.high/2 - margin && mouseY < pos.centre.y - position.shift + position.high/2 + margin) ||
        (mouseY < pos.centre.y + position.shift + position.high/2 + margin && mouseY > pos.centre.y + position.shift - position.high/2 - margin)) &&
          mouseX > position.x - position.long/2 - margin && mouseX < position.x + position.long/2 + margin) {
    if (!pointer) {
      flag.held = false;
    }
    return true;
  }
}

/* Update the constraint status of a constraint type */
function updateConstraint(type, location) {
  con.tag[location] = type;
  if (type == 'spacer') {
    con.tag[location + 1] = type;
  }

  if (type == 'empty' || type == 'spacer') {
    con.state[location] = false;
  }
  else {
    con.state[location] = true;
  }

  [1, 5].forEach( function(i) {
    if (con.state[i-1] && con.state[i+2] && con.tag[i] == 'spacer') {
      con.state[i] = true;
      con.state[i+1] = true;
    }
  });

  // Custom prototype for replacing graphic path filenames
  String.prototype.indexReplace = function (index) {
    return this.substr(0, index) + '1' + this.substr(index + 1);
  }

  // Directing collar graphic paths
  if (type == 'collar') {
    if (basic.stepped) {
      if (location == 0) {
        shaftFile = 'ST1';
      }
      else {
        shaftFile = 'ST0';
      }
    }
    else {
      shaftModel = shaftModel.indexReplace(location + 1);
      shaftFile = shaftModel;

      let mirror = ['0010', '0001', '0101', '0011', '1011', '0111'];
      for (let i=0; i<mirror.length; i++) {
        if (shaftModel.indexOf(mirror[i]) > -1) {
          shaftFile = 'S' + shaftModel.substr(1).split('').reverse().join('');
        }
      }
    }
  }
}

/* Removes a constraint at a given location */ 
function removeConstraint(type, location) {
  if (location.constructor !== Array ) {
    location = [location];
  }

  for (let i=0; i<location.length; i++) {
    if (type == 'all' || con.tag[location[i]] == type) {
      updateConstraint('empty', location[i]);
      design.run[location[i]] = undefined;
    }
  }
}

/* Updates constraint preview highlight colour */
function highlightPreview(colour, preview) {
  stroke('red');
  fill(255, colour[0] += colour[1], 45, 150);
  preview();
  stroke('black');

  if (colour[0] >= 255 || colour[0] <= 45) {
    colour[1] *= -1;
  }
  return colour;
}

/* Determines the constraint drag logic and returns the relevant x-coordinate */
function constraintLogic(x, part, spacer) {
  let limits = [0, 4, 0, 2, 2, 4];
  let sign = 1;

  for (let i=0; i<partName.length; i++) {
    if (design.drag[i].part) {

      // Spacer constraint logic
      if (con.tag.indexOf('spacer') > -1) {
        for (let k=-0.5; k<=0.5; k++) {
          if (k*move.x < 0) {
            if (design.drag[0].part) { // When shaft is selected
              if (con.state[3*k + 1.5] && con.state[-3*k + 5.5]) {
                return design.drag[-k + 1.5].drawX(x);
              }
              if (con.state[3*k + 1.5]) {
                return design.drag[k + 1.5].drawX(x);
              }
            }
            if (design.drag[k + 1.5].part) { // When bearings are selected (left k=-0.5, right k=0.5)
              if (part != 'shaft' && design.drag[k + 1.5].drawX(x) != x) {
                return design.drag[-k + 1.5].drawX(x);
              }
              if (con.state[-3*k + 1.5] && design.drag[-k + 1.5].drawX(x) != x) {
                return design.drag[k + 1.5].drawX(x);
              }
            }
            if (design.drag[-k + 1.5].part && con.state[0] && con.state[3]) {
              if (design.drag[-k + 1.5].drawX(x) != x) {
                return design.drag[k + 1.5].drawX(x);
              }
              return design.drag[-k + 1.5].drawX(x);
            }
          }
        }
      }

      if (!spacer) {
        for (let j=limits[2*partName.indexOf(part)]; j<limits[2*partName.indexOf(part)+1]; j++) {
          // Constraint logic when shaft is selected
          if ((con.state[j]) && sign*move.x > 0 && design.drag[0].part) {
            for (let k=-0.5; k<=0.5; k++) {
              if (k*(j-1.5) > 0) {
                if (design.drag[k + 1.5].drawX(x) != x) {
                  if ((con.state[0] && con.state[2]) || (con.state[1] && con.state[3])) {
                    return design.drag[-k + 1.5].drawX(x);
                  }
                }
                return design.drag[k + 1.5].drawX(x);
              }
            } 
          }

          // Constraint logic when bearings are selected (left k=-0.5, right k=0.5)
          for (let k=-0.5; k<=0.5; k++) {
            if ((con.state[j]) && design.drag[k + 1.5].part) {
              if (design.drag[k + 1.5].drawX(x) != x) {
                if ((con.state[1] && con.state[2] && k*move.x < 0) || (con.state[0] && con.state[3] && k*move.x > 0)) {
                  return design.drag[-k + 1.5].drawX(x);
                }
              }
              else {
                if ((con.state[1] && con.state[2] && k*move.x < 0) || (con.state[0] && con.state[3] && k*move.x > 0)) {
                  return design.drag[k + 1.5].drawX(x);
                }
              }
              if (con.state[j] && k*(j-1.5) > 0 && sign*move.x < 0) {
                return design.drag[k + 1.5].drawX(x);
              }
            }
          }
          sign *= -1;
        }

        // Default constraint motion if no specific conditions are met
        if (design.drag[partName.indexOf(part)].part) {
          return design.drag[partName.indexOf(part)].drawX(x); 
        }
      }
    }
  }
  return x;
}