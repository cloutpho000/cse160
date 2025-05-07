var g_map = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
];

function drawMap(){
    for (x = 0; x < 8; x++ ){
        for (y =0; y < 8; y++){
            if (g_map[x][y] == 1){
                var body = new Cube();
                body.color = [1, 1, 1, 1];
                body.matrix.translate(x-4, -.75, y-4);
                body.textureNum = -2;
                body.render();
            }
        }
    }
}