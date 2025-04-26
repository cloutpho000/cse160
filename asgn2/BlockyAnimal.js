// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_GlobalRotateMatrix;\n'+
  'void main() {\n' +
  '  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n'

//global vars
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_size;



function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);

}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log("Failed to get the storage location of the u_Model Matrix");
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix){
    console.log("No Global rotate matrix!");
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

//constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;


//more gloabl vars related to ui elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selected_size = 5;
let g_selectedType = POINT;
let g_segments = 10;
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_fastAngle = 0;
let g_magAngle = 0;
g_yellowAnimation = false;




function addActionsForHtmlUI(){

  //button events

  document.getElementById('angleSlide').addEventListener('input', function() {g_globalAngle = this.value; renderAllShapes();});
  document.getElementById('yellowSlide').addEventListener('input', function() {g_yellowAngle = this.value; renderAllShapes();});
  document.getElementById('magSlide').addEventListener('input', function() {g_fastAngle = this.value; renderAllShapes();});

  document.getElementById('animationYellowOnButton').onclick = function(){g_yellowAnimation = true;};
  document.getElementById('animationYellowOffButton').onclick = function(){g_yellowAnimation = false;};

}


function main() {

  setupWebGL();
  connectVariablesToGLSL();

  addActionsForHtmlUI();


  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) }};

  let isDragging = false;
  let lastX = 0;

  canvas.addEventListener('mousedown',function(ev) {
    isDragging = true;
    lastX = ev.clientX;
  });
  canvas.addEventListener('mouseup',function(ev){
    isDragging = false;
  });
  canvas.addEventListener('mousemove',function(ev){
    if (isDragging) {
      let dx = ev.clientX - lastX;
      g_globalAngle += dx * .4;
      lastX = ev.clientX;
    }
  });

  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);
  requestAnimationFrame(tick);
}

var g_start = performance.now()/1000;
var g_seconds = performance.now()/1000 - g_start;
let g_lastFrameTime = performance.now();
let g_fps = 0;
function tick(){


    let now = performance.now();
    let elapsed = now - g_lastFrameTime;
    g_lastFrameTime = now;
    g_fps = 1000/ elapsed;

    document.getElementById('fps').innerText = "FPS: " + g_fps.toFixed(1);


    g_seconds = performance.now()/1000 - g_start;

    updateAnimationAngles();

    renderAllShapes();

    requestAnimationFrame(tick);
}

function updateAnimationAngles(){
  if (g_yellowAnimation) {
    g_yellowAngle = (45*Math.sin(g_seconds));
    g_fastAngle = 45 * Math.sin(1.5 * g_seconds);  

  }
}

class Point{
  constructor(){
    this.type = 'point';
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 5.0;
  }
  render() {
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;

    gl.disableVertexAttribArray(a_Position);

    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniform1f(u_size, size);

    gl.drawArrays(gl.POINTS, 0, 1);
  }
}

var g_shapesList = [];

var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point
var g_sizes = []; //array

function click(ev) {
  let [x,y] = convertCoordinatesEventToGL(ev);

  let point;
  if (g_selectedType == POINT){
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else{
    point = new Circle();
    point.segments = g_segments;
  }
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selected_size;
  g_shapesList.push(point);

  // Store the coordinates to g_points array
  g_points.push([x, y]);
  g_colors.push(g_selectedColor.slice());
  g_sizes.push(g_selected_size);
  // Store the coordinates to g_points array
//  if (x >= 0.0 && y >= 0.0) {      // First quadrant
//    g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
//  } else if (x < 0.0 && y < 0.0) { // Third quadrant
//    g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
//  } else {                         // Others
//    g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
//  }


  //draw all the shapes that are to be on the canvas
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

function renderAllShapes(){

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //for (let i = 0; i < g_shapesList.length; i++) {
  //  g_shapesList[i].render();  
  //}

 // drawTriangle3D([-1,0,0, -.5,-1,0, 0,0,0]);

  var body = new Cube();
  body.color = [0.36, 0.25, 0.20, 1.0];
  body.matrix.translate(-.25, -1, 0);
  body.matrix.rotate(0, 1, 0, 0);
  body.matrix.scale(0.5, .5, .5);
  body.render();

  var leftArm = new Cube();
  leftArm.color = [1, 1, 0, 0];
  leftArm.matrix.setTranslate(0, -.5, 0);
  leftArm.matrix.rotate(-5, 1,0, 0);
  leftArm.matrix.rotate(-g_yellowAngle, 0,0, 1);
  var yellowCoordinates = new Matrix4(leftArm.matrix);
  leftArm.matrix.scale(0.25, 0.7, .2);
  leftArm.matrix.translate(-.5, 0,0);
  //leftArm.render();

  var box = new Cube();
  box.color = [1,0,1,0];
  box.matrix = yellowCoordinates;
  box.matrix.translate(0, .65, 0);
  box.matrix.rotate(g_magAngle, 0, 0, 1);
  box.matrix.scale(.3, .3, .3);
  box.matrix.translate(-.5, 0, -.0001);
  //box.render();

  var stalk = new Cylinder(30);
  stalk.color = [0.45, 0.53, 0.18, 1.0];
  stalk.matrix.setTranslate(0, -0.75, .3);
  stalk.matrix.scale(0.3, 1, 0.3);
  stalk.matrix.rotate(-g_yellowAngle*.3, 0, 0,1);
  var stalkCoords = new Matrix4(stalk.matrix);
  stalk.render();

  var shooter = new Cylinder(30);
  shooter.color = [0.3, 0.8, 0.1, 1.0];
  shooter.matrix = stalkCoords;
  shooter.matrix.translate(0,1,-1);
  shooter.matrix.scale(1,.35,1.5);
  shooter.matrix.rotate(90, 1, 0, 0);
  shooter.matrix.rotate(g_yellowAngle*.3, 0, 0, 1);
  var shooterCoord = new Matrix4(shooter.matrix);
  shooter.render();

  var antena1 = new Cube();
  antena1.color = [1.0, 0.84, 0.0, 1.0];
  antena1.matrix = new Matrix4(shooterCoord);
  antena1.matrix.scale(.1,.1,1);
  antena1.matrix.translate(-2,6.5,-1.2);
  antena1.matrix.rotate(g_fastAngle * 2, 0, 0, 1);

  antena1.render();

  var antena2 = new Cube();
  antena2.color = [0.0, 0.39, 0.0, 1.0];
  antena2.matrix = new Matrix4(shooterCoord);
  antena2.matrix.scale(.1,.1,1);
  antena2.matrix.translate(2,6.5,-1.2);
  antena2.matrix.rotate(-g_fastAngle * 2 , 0, 0, 1);

  antena2.render();

  var antena2 = new Cube();
  antena2.color = [1.0, 0.84, 0.0, 1.0];
  antena2.matrix = new Matrix4(shooterCoord);
  antena2.matrix.scale(.1,.1,1);
  antena2.matrix.translate(0,6.5,-1.2);
  antena2.matrix.rotate(-g_fastAngle * 2 , 0, 0, 1);

  antena2.render();

  var antena2 = new Cube();
  antena2.color = [1.0, 0.84, 0.0, 1.0];
  antena2.matrix = new Matrix4(shooterCoord);
  antena2.matrix.scale(.1,.1,1);
  antena2.matrix.translate(1,6.5,-1.2);
  antena2.matrix.rotate(-g_fastAngle * 2 , 0, 0, 1);

  antena2.render();

  var antena2 = new Cube();
  antena2.color = [0.0, 0.39, 0.0, 1.0];
  antena2.matrix = new Matrix4(shooterCoord);
  antena2.matrix.scale(.1,.1,1);
  antena2.matrix.translate(-1,6.5,-1.2);
  antena2.matrix.rotate(-g_fastAngle * 2 , 0, 0, 1);

  antena2.render();



}



main();
