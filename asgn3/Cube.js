

class Cube{
    constructor(){
        this.type = 'cube';
        //this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        //this.size = 5.0;
        //this.segments = 10;
        this.matrix = new Matrix4();
        this.textureNum = 0;
    }
    
    render() {
      function drawFace(tri1, tri2, brightness) {
        if (brightness === undefined) brightness = 1.0;
        gl.uniform4f(
            u_FragColor,
            rgba[0] * brightness,
            rgba[1] * brightness,
            rgba[2] * brightness,
            rgba[3]
        );
        drawTriangle3D(tri1);
        drawTriangle3D(tri2);
    }
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.uniform4f(u_FragColor,rgba[0],rgba[1],rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        
    
        // Front face (z = 0)
        //drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [1,0,0,1,1,1]);
        // Front face (z = 0)
        drawTriangle3DUV(
          [0, 0, 0,  1, 1, 0,  1, 0, 0],  // triangle 1
          [0,0, 1, 1, 1, 0]            // UVs
        );
        drawTriangle3DUV(
          [0, 0, 0,  0, 1, 0,  1, 1, 0],  // triangle 2
          [0, 0,  0, 1,  1, 1]            // UVs
        );

        // Top face (y = 1)
        drawTriangle3DUV(
          [0, 1, 0,  0, 1, 1,  1, 1, 1],
          [0, 0,  0, 1,  1, 1]
        );
        drawTriangle3DUV(
          [0, 1, 0,  1, 1, 1,  1, 1, 0],
          [0, 0,  1, 1,  1, 0]
        );

        // Right face (x = 1)
        drawTriangle3DUV(
          [1, 0, 0,  1, 1, 0,  1, 0, 1],
          [0, 0,  0, 1,  1, 0]
        );
        drawTriangle3DUV(
          [1, 0, 1,  1, 1, 0,  1, 1, 1],
          [1, 0,  0, 1,  1, 1]
        );

        // Back face (z = 1)
        drawTriangle3DUV(
          [1, 0, 1,  0, 1, 1,  1, 1, 1],
          [1, 0,  0, 1,  1, 1]
        );
        drawTriangle3DUV(
          [1, 0, 1,  0, 0, 1,  0, 1, 1],
          [1, 0,  0, 0,  0, 1]
        );

        // Left face (x = 0)
        drawTriangle3DUV(
          [0, 0, 0,  0, 1, 1,  0, 1, 0],
          [0, 0,  1, 1,  0, 1]
        );
        drawTriangle3DUV(
          [0, 0, 0,  0, 0, 1,  0, 1, 1],
          [0, 0,  1, 0,  1, 1]
        );

        // Bottom face (y = 0)
        drawTriangle3DUV(
          [0, 0, 0,  1, 0, 1,  1, 0, 0],
          [0, 0,  1, 1,  1, 0]
        );
        drawTriangle3DUV(
          [0, 0, 0,  0, 0, 1,  1, 0, 1],
          [0, 0,  0, 1,  1, 1]
        );

    }
    
}

function drawColoredTriangle3D(vertices, color) {
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
    drawTriangle3D(vertices);
  }
  
class Cylinder {
    constructor(segments = 20) {
      this.type = 'cylinder';
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.matrix = new Matrix4();
      this.segments = segments; // number of segments around the cylinder
    }
  
    render() {
      let rgba = this.color;
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
  
      let angleStep = 360 / this.segments;
      let radius = 0.5;
      let height = 1;
  
      // SIDE SURFACE
      for (let i = 0; i < this.segments; i++) {
        let angle1 = (i * angleStep) * Math.PI / 180;
        let angle2 = ((i + 1) * angleStep) * Math.PI / 180;
  
        let x1 = radius * Math.cos(angle1);
        let z1 = radius * Math.sin(angle1);
        let x2 = radius * Math.cos(angle2);
        let z2 = radius * Math.sin(angle2);
  
        // Bottom triangle
        drawColoredTriangle3D(
          [x1, 0, z1, x2, 0, z2, x1, height, z1],
          rgba
        );
  
        // Top triangle
        drawColoredTriangle3D(
          [x1, height, z1, x2, 0, z2, x2, height, z2],
          rgba
        );
      }
  
      // TOP CAP
      for (let i = 0; i < this.segments; i++) {
        let angle1 = (i * angleStep) * Math.PI / 180;
        let angle2 = ((i + 1) * angleStep) * Math.PI / 180;
        let x1 = radius * Math.cos(angle1);
        let z1 = radius * Math.sin(angle1);
        let x2 = radius * Math.cos(angle2);
        let z2 = radius * Math.sin(angle2);
  
        drawColoredTriangle3D(
          [0, height, 0, x1, height, z1, x2, height, z2],
          rgba.map(x => x ) 
        );
      }
  
      // BOTTOM CAP
      for (let i = 0; i < this.segments; i++) {
        let angle1 = (i * angleStep) * Math.PI / 180;
        let angle2 = ((i + 1) * angleStep) * Math.PI / 180;
        let x1 = radius * Math.cos(angle1);
        let z1 = radius * Math.sin(angle1);
        let x2 = radius * Math.cos(angle2);
        let z2 = radius * Math.sin(angle2);
  
        drawColoredTriangle3D(
          [0, 0, 0, x2, 0, z2, x1, 0, z1],
          rgba.map(x => x * .95 ) 
        );
      }
    }
  }
  