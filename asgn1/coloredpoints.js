// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' +
  'uniform float u_size;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = u_size;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
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

  u_size = gl.getUniformLocation(gl.program, 'u_size');
  if (!u_size){
    console.log("Failed to get the storage location of u_size");
    return;
  }
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


function addActionsForHtmlUI(){

  //button events
  document.getElementById('green').onclick = function() {g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
  document.getElementById('red').onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };

  document.getElementById("pointButton").onclick = function() { g_selectedType = POINT};
  document.getElementById('triButton').onclick = function() { g_selectedType = TRIANGLE};
  document.getElementById('circleButton').onclick = function() { g_selectedType = CIRCLE};
  document.getElementById('pic').onclick = drawing;


  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value / 100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value / 100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value / 100; });
  document.getElementById('segSlide').addEventListener('mouseup', function() { g_segments = this.value; });
  document.getElementById('alpha').addEventListener('mouseup', function() { g_selectedColor[3] = this.value; });

  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selected_size = this.value; });
  document.getElementById('clear').onclick = function() {g_shapesList=[]; renderAllShapes();};

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

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
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
  gl.clear(gl.COLOR_BUFFER_BIT);

  for (let i = 0; i < g_shapesList.length; i++) {
    g_shapesList[i].render();  
  }
}

function graphToWebGL(x, y) {
  let xGL = (x / 10) * 2 - 1;
  let yGL = (y / 10) * 2 - 1;
  return [xGL, yGL];
}


function drawing() {
  var brown = [0.6, 0.3, 0.1, 1.0];
  var red = [1.0, 0.0, 0.0, 1.0];
  var yellow = [1.0, 1.0, 0.0, 1.0];
  var pink = [1.0, 0.75, 0.8, 1.0];
  var blue = [0.0, 0.0, 1.0, 1.0];
  var green = [0.0, 1.0, 0.0, 1.0];

  var triangles = [
    { //1
      vertecies: [
        graphToWebGL(8, 10),
        graphToWebGL(10, 9),
        graphToWebGL(10, 10)
      ],
      color: yellow
    },
    { //2
      vertecies: [
        graphToWebGL(0, 8),
        graphToWebGL(4, 8),
        graphToWebGL(2, 9)
      ],
      color: green
    },
    { //3
      vertecies: [
        graphToWebGL(3, 8),
        graphToWebGL(5, 7),
        graphToWebGL(5, 9)
      ],
      color: green
    },
    { //4
      vertecies: [
        graphToWebGL(4, 8),
        graphToWebGL(4, 6),
        graphToWebGL(5, 7)
      ],
      color: green
    },
    { //5
      vertecies: [
        graphToWebGL(1, 8),
        graphToWebGL(4, 6),
        graphToWebGL(4, 8)
      ],
      color: green
    },
    { //6
      vertecies: [
        graphToWebGL(4, 6),
        graphToWebGL(1, 8),
        graphToWebGL(1, 6)
      ],
      color: green
    },
    { //7
      vertecies: [
        graphToWebGL(1, 6),
        graphToWebGL(1, 8),
        graphToWebGL(0, 7)
      ],
      color: green
    },
    { //8
      vertecies: [
        graphToWebGL(2, 6),
        graphToWebGL(3, 5),
        graphToWebGL(3, 6)
      ],
      color: brown
    },
    { //9
      vertecies: [
        graphToWebGL(3, 5),
        graphToWebGL(2, 5),
        graphToWebGL(2, 6)
      ],
      color: brown
    },
    { //10
      vertecies: [
        graphToWebGL(2, 5),
        graphToWebGL(3, 2),
        graphToWebGL(3, 5)
      ],
      color: brown
    },
    { //11
      vertecies: [
        graphToWebGL(3, 2),
        graphToWebGL(2, 2),
        graphToWebGL(2, 5)
      ],
      color: brown
    },
    { //12
      vertecies: [
        graphToWebGL(5, 5),
        graphToWebGL(4, 6),
        graphToWebGL(5, 6)
      ],
      color: red
    },
    { //13
      vertecies: [
        graphToWebGL(5, 5),
        graphToWebGL(4, 5),
        graphToWebGL(4, 6)
      ],
      color: red
    },
    { //14
      vertecies: [
        graphToWebGL(0, 6),
        graphToWebGL(1, 5),
        graphToWebGL(1, 6)
      ],
      color: pink
    },
    { //15
      vertecies: [
        graphToWebGL(0, 5),
        graphToWebGL(0, 6),
        graphToWebGL(1, 5)
      ],
      color: pink
    },
    { //16
      vertecies: [
        graphToWebGL(0, 2),
        graphToWebGL(3, 2),
        graphToWebGL(3, 0)
      ],
      color: brown
    },
    { //17
      vertecies: [
        graphToWebGL(0, 2),
        graphToWebGL(0, 0),
        graphToWebGL(3, 0)
      ],
      color: brown
    },
    { //18
      vertecies: [
        graphToWebGL(3, 2),
        graphToWebGL(3, 0),
        graphToWebGL(5, 0)
      ],
      color: blue
    },
    { //19
      vertecies: [
        graphToWebGL(5, 0),
        graphToWebGL(5, 2),
        graphToWebGL(3, 2)
      ],
      color: blue
    },
    { //20
      vertecies: [
        graphToWebGL(5, 0),
        graphToWebGL(5, 2),
        graphToWebGL(10, 0)
      ],
      color: brown
    },
    { //21
      vertecies: [
        graphToWebGL(5, 2),
        graphToWebGL(10, 2),
        graphToWebGL(10, 0)
      ],
      color: brown
    }
  ];

  for (let tri of triangles) {
    gl.uniform4fv(u_FragColor, tri.color);
    drawTriangle([
      tri.vertecies[0][0], tri.vertecies[0][1], // x1, y1
      tri.vertecies[1][0], tri.vertecies[1][1], // x2, y2
      tri.vertecies[2][0], tri.vertecies[2][1]  // x3, y3
    ]);
  }
}







main();
