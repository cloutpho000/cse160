class Cube{
    constructor(){
        this.type = 'cube';
        //this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        //this.size = 5.0;
        //this.segments = 10;
        this.matrix = new Matrix4();
    }
    render() {
        var rgba = this.color;
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
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
    
        // Front face (z = 0)
        drawFace(
            [0, 0, 0,  1, 1, 0,  1, 0, 0],
            [0, 0, 0,  0, 1, 0,  1, 1, 0],
            1.0
        );
    
        // Top face (y = 1)
        drawFace(
            [0, 1, 0,  0, 1, 1,  1, 1, 1],
            [0, 1, 0,  1, 1, 1,  1, 1, 0],
            0.9
        );
    
        // Right face (x = 1)
        drawFace(
            [1, 0, 0,  1, 1, 0,  1, 0, 1],
            [1, 0, 1,  1, 1, 0,  1, 1, 1],
            0.8
        );
    
        // Back face (z = 1)
        drawFace(
            [1, 0, 1,  0, 1, 1,  1, 1, 1],
            [1, 0, 1,  0, 0, 1,  0, 1, 1],
            0.7
        );
    
        // Left face (x = 0)
        drawFace(
            [0, 0, 0,  0, 1, 1,  0, 1, 0],
            [0, 0, 0,  0, 0, 1,  0, 1, 1],
            0.85
        );
    
        // Bottom face (y = 0)
        drawFace(
            [0, 0, 0,  1, 0, 1,  1, 0, 0],
            [0, 0, 0,  0, 0, 1,  1, 0, 1],
            0.6
        );
    }
    
}
