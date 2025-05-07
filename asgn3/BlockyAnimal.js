// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' +
  'attribute vec2 a_UV;\n' +
  'varying vec2 v_UV;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_GlobalRotateMatrix;\n'+
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjectionMatrix; \n' +
  'void main() {\n' +
  '  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
  '  v_UV = a_UV;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'varying vec2 v_UV;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform
  'uniform sampler2D u_Sampler0;\n' +
  'uniform sampler2D u_Sampler1;\n' +
  'uniform int u_whichTexture;\n' +
  'void main() {\n' +
  '  if (u_whichTexture == -2) { \n'+
  '    gl_FragColor = u_FragColor;\n' +
  '  } else if (u_whichTexture == -1){ \n' +
  '   gl_FragColor = vec4(v_UV, 1.0, 1.0);\n' +
  '  } else if (u_whichTexture == 0){\n' +
  '    gl_FragColor = texture2D(u_Sampler0, v_UV);\n'+
  '  } else if (u_whichTexture == 1){\n' +
  '    gl_FragColor = texture2D(u_Sampler1, v_UV);\n' +
  '  } else {\n ' +
  '    gl_FragColor = vec4(1, .2, .2, 1);' +
  '  }\n' +
  '}\n'

//global vars
let canvas;
let gl;
let a_UV;
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

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0){
    console.log('failed to get a_UV');
    return;
  }
   // Get the storage location of u_Sampler
   u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
   if (!u_Sampler0) {
     console.log('Failed to get the storage location of u_Sampler');
     return false;
   }

   u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
   if (!u_Sampler1){
    console.log("failed to get the location of u_sampler1");
    return false;
   }

   u_whichTexture = gl.getUniformLocation(gl.program , 'u_whichTexture')
   if (!u_whichTexture){
    console.log("failed to get u_whichTextuer");
    return;
   }

   u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
   if (!u_ProjectionMatrix){
    console.log("failed to get projection matrix!");
    return;
   }

   u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
   if (!u_ViewMatrix){
    console.log("failed to get view matrix!")
    return;
   }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}


function initTextures() {
  var image = new Image();  // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function(){ sendImageToSpecifiedSampler(image, u_Sampler0, gl.TEXTURE0, 0); };
  // Tell the browser to load an image
  image.src = 'sky.jpg';

  var image1 = new Image();
  if (!image1){
    console.log("Failed to create imag1 in init textures");
    return false;
  }

  image1.onload = function() {sendImageToSpecifiedSampler(image1, u_Sampler1, gl.TEXTURE1, 1); };
  image1.src = 'stones.jpg'

  return true;
}

function sendImageToSpecifiedSampler(image, sampler, textureUnit, unitNumber) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(textureUnit);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  gl.uniform1i(sampler, unitNumber);

  console.log("finished loading texture");
  
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
let g_yellowAnimation = false;
let camera = new Camera();




function addActionsForHtmlUI(){

  //button events

  document.getElementById('angleSlide').addEventListener('input', function() {g_globalAngle = Number(this.value); renderAllShapes();});
  document.getElementById('yellowSlide').addEventListener('input', function() {g_yellowAngle = this.value; renderAllShapes();});
  document.getElementById('magSlide').addEventListener('input', function() {g_fastAngle = this.value; renderAllShapes();});

  document.getElementById('animationYellowOnButton').onclick = function(){g_yellowAnimation = true;};
  document.getElementById('animationYellowOffButton').onclick = function(){g_yellowAnimation = false;};

}


function main() {

  setupWebGL();
  connectVariablesToGLSL();

  addActionsForHtmlUI();

  document.onkeydown = keydown;

  initTextures();


  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) }};

  let isDragging = false;
  let lastX, lastY;



  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);
  requestAnimationFrame(tick);
}

function keydown(ev){
  if (ev.key == 'q'){
    camera.panLeft();
  }
  switch(ev.key){
    case 'w' : camera.forward(); break;
    case 's' : camera.back(); break;
    case 'a' : camera.left(); break;
    case 'd' : camera.right(); break;
    case 'q' : camera.panLeft(); break;
    case 'e' : camera.panRight(); break;
  } 
  renderAllShapes();
  console.log(ev.keyCode);

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

  var projMat = new Matrix4();
  projMat.setPerspective(50, canvas.width/canvas.height, .1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = camera.getViewMatrix();
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //for (let i = 0; i < g_shapesList.length; i++) {
  //  g_shapesList[i].render();  
  //}

 // drawTriangle3D([-1,0,0, -.5,-1,0, 0,0,0]);

  var floor = new Cube();
  floor.color = [1, 0, 0, 1];
  floor.textureNum = 1;
  floor.matrix.translate(-20, -1,-20 );
  floor.matrix.scale(40, .1, 40);
  //floor.matrix.translate(-.5, 0. -.5);
  floor.render();

  var sky = new Cube();
  sky.color = [1, 0, 0, 1];
  sky.textureNum = 0;
  sky.matrix.scale(50, 50, 50);
  sky.matrix.translate(-.5, -.5, -.5);
  sky.render();


  var body = new Cube();
  body.color = [0.36, 0.25, 0.20, 1.0];
  body.matrix.translate(-.25, -.75, 0);
  body.matrix.rotate(0, 1, 0, 0);
  body.matrix.scale(0.5, .5, .5);
  body.render();

  drawMap();

}



main();
