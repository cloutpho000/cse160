// DrawTriangle.js (c) 2012 matsuda
function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('canvas');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  //make background black
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Make new Vector with z = 0
  let v1 = new Vector3([1, 1, 0]);
  drawVector(v1, "red");

}

function drawVector(v, color){
  let canvas = document.getElementById("canvas");
  let ctx = canvas.getContext("2d");

  ctx.beginPath();
  ctx.moveTo(200,200); // 400 x 400 canvas, (200,200) is the center
  ctx.lineTo(200 + v.elements[0] * 20, 200 - v.elements[1] * 20); //scale and flip 
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function handleDrawEvent(){

  let x1 = parseFloat(document.getElementById("xinput").value);
  let y1 = parseFloat(document.getElementById("yinput").value);
  let x2 = parseFloat(document.getElementById("xinput2").value);
  let y2 = parseFloat(document.getElementById("yinput2").value);

  let canvas = document.getElementById("canvas");
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let v1 = new Vector3([x1, y1, 0]);
  let v2 = new Vector3([x2, y2, 0]);
  drawVector(v1, "red");
  drawVector(v2, "blue");
}

function angleBetween(v1, v2){
  let dot = Vector3.dot(v1, v2);
  let mag1 = v1.magnitude();
  let mag2 = v2.magnitude();
  let cos = dot / (mag1 * mag2);
  let angle = Math.acos(cos);
  angle = angle * (180 / Math.PI);
  return angle
}

function areaTriangle(v1, v2){
  let cross = Vector3.cross(v1, v2);
  let mag = cross.magnitude();
  let area = mag / 2;
  return area;
}

function handleDrawOperationEvent(){
  let canvas = document.getElementById("canvas");
  let ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let x1 = parseFloat(document.getElementById("xinput").value);
  let y1 = parseFloat(document.getElementById("yinput").value);
  let x2 = parseFloat(document.getElementById("xinput2").value);
  let y2 = parseFloat(document.getElementById("yinput2").value);
  let scalar = parseFloat(document.getElementById("scalar").value);

  let v1 = new Vector3([x1, y1, 0]);
  let v2 = new Vector3([x2, y2, 0]);

  drawVector(v1, "red");
  drawVector(v2, "blue");

  let operation = document.getElementById("operation").value;

  let v3, v4;
  if (operation === "add") {
    v3 = v1.add(v2); 
    drawVector(v3, "green");
  } else if (operation === "sub") {
    v3 = v1.sub(v2); 
    drawVector(v3, "green");
  } else if (operation === "mul") {
    v3 = v1.mul(scalar); 
    v4 = v2.mul(scalar); 
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (operation === "div") {
    v3 = v1.div(scalar); 
    v4 = v2.div(scalar); 
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (operation == "mag") {
    let m1 = v1.magnitude();
    let m2 = v2.magnitude();
    console.log("Magnitude v1: " + m1);
    console.log("Magnitude v2: " + m2);
  } else if (operation == "norm") {
    v3 = v1.normalize();
    v4 = v2.normalize();
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (operation == "angle"){
    let angle = angleBetween(v1, v2);
    console.log("Angle Between v1 and v2 is " + angle + "degrees.");
  } else if (operation == "tri"){
    let area = areaTriangle(v1, v2);
    console.log("Area of the Triangle formed by v1 and v2: " + area);
  }
}
