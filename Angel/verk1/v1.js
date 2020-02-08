/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Sýnir notkun á tveimur minnissvæðum (VBO) og hvernig þau
//     eru virkjuð rétt fyrir teikningu í render().
//     Tvö VBO teiknuð með sömu liturum (og "uniform" breytu)
//
//    Hjálmtýr Hafsteinsson, janúar 2020
/////////////////////////////////////////////////////////////////
var gl;
var mouseX;             // Old value of x-coordinate  
var movement = true;    // Do we move the paddle?
// Global variables (accessed in render)
var locPosition;
var locColor;
var bufferIdA;
var bufferIdB;
var colorA = vec4(1.0, 0.0, 0.0, 1.0);
var colorB = vec4(0.0, 1.0, 0.0, 1.0);

var bird = [ vec2( -0.1,  0.3 ), vec2( -0.1, 0.4 ), vec2( 0.0, 0.4 ), vec2( 0.0, 0.3 ) ]; 
var shot = [ vec2( -0.01,  -0.8 ), vec2( -0.01, -0.7 ), vec2( 0.0, -0.7 ), vec2( 0.0, -0.8 ) ]; 
var birdDirection = 1;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    
    // Two triangles
    var player = [
        vec2( -0.1, -0.9 ),
        vec2(  0.0, -0.75 ),
        vec2(  0.1, -0.9 )
    ];
    var playerOffset = [
        vec2( -0.1, -0.9 ),
        vec2(  0.0, -0.75 ),
        vec2(  0.1, -0.9 )
    ];
    // var verticesB = [ vec2(  0.1, -0.5 ), vec2(  0.5,  0.5 ), vec2(  0.9, -0.5 ) ];

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    // gl.clearColor( 0.9, 0.9, 0.9, 1.0 );
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    initBkgnd();
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Define two VBOs and load the data into the GPU
    // initialize buffers
    // LEIKMAÐUR
    bufferIdPlayer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdPlayer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(player), gl.STATIC_DRAW );
    // FUGL
    bufferIdBird = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdBird );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(bird), gl.STATIC_DRAW );
    // SKOT
    bufferIdShot = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdShot );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(shot), gl.STATIC_DRAW );

    // Get location of shader variable vPosition
    locPosition = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( locPosition );
    locColor = gl.getUniformLocation( program, "rcolor" );

    // console.log(locColor)
    
    canvas.addEventListener("mousemove", function(e){
        if(movement) {
            mouseX = e.offsetX;
            for(i=0; i<3; i++) {
                player[i][0] = ((mouseX - 500)/500) + playerOffset[i][0];
            }
            gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdPlayer );
            gl.bufferSubData(gl.ARRAY_BUFFER, bufferIdPlayer, flatten(player));
        }
    } );

    canvas.addEventListener("mousedown", function(e){
        for(i=0; i<4; i++) {
            shot[i][0] = 0;
        }
        shoot(player[1][0]);
    } );

    render();
};

function shoot(x){
    
    var shotOffset = [ vec2( -0.01,  -0.8 ), vec2( -0.01, -0.7 ), vec2( 0.0, -0.7 ), vec2( 0.0, -0.8 ) ]; 
    for(i=0; i<4; i++) {
        shot[i][0] = ((mouseX - 500)/500) + shotOffset[i][0];
    }
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdShot );
    gl.bufferSubData(gl.ARRAY_BUFFER, bufferIdShot, flatten(shot));
}

function render() {
    // Bird collision detection
    for(i=0; i<4; i++) {
        bird[i][0] += (0.01 * birdDirection);
        shot[i][1] += 0.01;
    }
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdBird );
    gl.bufferSubData(gl.ARRAY_BUFFER, bufferIdBird, flatten(bird));

    if(bird[1][0] < -0.7 || bird[1][0] > 0.7) {
        birdDirection *= -1;
    }
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdShot );
    gl.bufferSubData(gl.ARRAY_BUFFER, bufferIdShot, flatten(shot));

    gl.clear( gl.COLOR_BUFFER_BIT );
    // Draw player    
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdPlayer );
    gl.vertexAttribPointer( locPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform4fv( locColor, flatten(colorA) );
    gl.drawArrays( gl.TRIANGLES, 0, 3 );

    // Draw bird
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdBird );
    gl.vertexAttribPointer( locPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform4fv( locColor, flatten(colorB) );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

    // Draw shot
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdShot );
    gl.vertexAttribPointer( locPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform4fv( locColor, flatten(colorB) );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );


    window.requestAnimFrame(render);

}

function initBkgnd() {
    backTex = gl.createTexture();
    backTex.Img = new Image();
    backTex.Img.onload = function() {
        handleBkTex(backTex);
    }
    backTex.Img.src = "./textures/back.jpg";
}
function handleBkTex(tex) {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.Img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
}