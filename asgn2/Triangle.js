class Triangle {
  constructor() {
      this.type = 'triangle';
      this.position = [0.0, 0.0, 0.0];
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.size = 5.0;
  }

  generateVertices() {
      let d = this.size / 200.0;
      return [
          this.position[0], this.position[1] + d,       // Top
          this.position[0] - d, this.position[1] - d,    // Bottom left
          this.position[0] + d, this.position[1] - d     // Bottom right
      ];
  }

  render() {
      let rgba = this.color;
      let size = this.size;

      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      gl.uniform1f(u_size, size);

      let vertices = this.generateVertices();
      drawTriangle(vertices);
  }
}

function drawTriangle(vertecies) {
//  var vertices = new Float32Array([
//    0, 0.5,   -0.5, -0.5,   0.5, -0.5
//  ]);
  var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertecies), gl.DYNAMIC_DRAW);
  //gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
//  if (a_Position < 0) {
//    console.log('Failed to get the storage location of a_Position');
//    return -1;
//  }
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n);
  //return n;
}

function drawTriangle3D(vertecies) {
//  var vertices = new Float32Array([
//    0, 0.5,   -0.5, -0.5,   0.5, -0.5
//  ]);
  var n = 3; // The number of vertices
  console.log(vertecies);

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertecies), gl.DYNAMIC_DRAW);
  //gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n);
  //return n;
}
