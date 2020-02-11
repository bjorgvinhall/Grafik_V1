/////////////////////////////////////////////////////////////////
//    Verkefni 1 í tölvugrafík
//
//    Björgvin Hall, febrúar 2020
/////////////////////////////////////////////////////////////////
// Global variables (accessed in render)
var gl;
var mouseX;             // value of x-coordinate  
var movement = true;    // play/pause game
var locPosition;
var locColor;
var bufferIdA;
var bufferIdB;
var colorA = vec4(1.0, 0.0, 0.0, 1.0);
var colorB = vec4(0.0, 1.0, 0.0, 1.0);

// Vertices for all items
var bird = [ vec2( -0.1,  0.3 ), vec2( -0.1, 0.4 ), vec2( 0.0, 0.4 ), vec2( 0.0, 0.3 ) ]; 
var birdOffset = [ vec2( -0.1,  0.3 ), vec2( -0.1, 0.4 ), vec2( 0.0, 0.4 ), vec2( 0.0, 0.3 ) ]; 
var shot = [ vec2( -0.01,  -0.8 ), vec2( -0.01, -0.7 ), vec2( 0.0, -0.7 ), vec2( 0.0, -0.8 ) ];
var shotOffset = [ vec2( -0.01,  -0.8 ), vec2( -0.01, -0.7 ), vec2( 0.0, -0.7 ), vec2( 0.0, -0.8 ) ]; 

var score1 = [vec2( 0.80,  0.85 ), vec2( 0.80, 0.75 ), vec2( 0.81, 0.75 ), vec2( 0.81, 0.85 )];
var score2 = [vec2( 0.83,  0.85 ), vec2( 0.83, 0.75 ), vec2( 0.84, 0.75 ), vec2( 0.84, 0.85 )];
var score3 = [vec2( 0.86,  0.85 ), vec2( 0.86, 0.75 ), vec2( 0.87, 0.75 ), vec2( 0.87, 0.85 )];
var score4 = [vec2( 0.89,  0.85 ), vec2( 0.89, 0.75 ), vec2( 0.90, 0.75 ), vec2( 0.90, 0.85 )];
var score5 = [vec2( 0.92,  0.85 ), vec2( 0.92, 0.75 ), vec2( 0.93, 0.75 ), vec2( 0.93, 0.85 )];
var scores = [score1, score2, score3, score4, score5];

var scoreOffset = [vec2( 0.80,  0.85 ), vec2( 0.80, 0.75 ), vec2( 0.81, 0.75 ), vec2( 0.81, 0.85 )];
var scoreBuffers;

var birdDirection = 1;
var deadBirds = 0;

// initailize on load
window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

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
    // PLAYER
    bufferIdPlayer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdPlayer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(player), gl.STATIC_DRAW );
    // BIRD
    bufferIdBird = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdBird );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(bird), gl.STATIC_DRAW );
    // SHOT
    bufferIdShot = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdShot );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(shot), gl.STATIC_DRAW );
    // SCORE
    bufferIdScore1 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdScore1 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(score1), gl.STATIC_DRAW );
    bufferIdScore2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdScore2 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(score2), gl.STATIC_DRAW );
    bufferIdScore3 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdScore3 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(score3), gl.STATIC_DRAW );
    bufferIdScore4 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdScore4 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(score4), gl.STATIC_DRAW );
    bufferIdScore5 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdScore5 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(score5), gl.STATIC_DRAW );
    
    scoreBuffers = [ bufferIdScore1, bufferIdScore2, bufferIdScore3, bufferIdScore4, bufferIdScore5 ]

    // Get location of shader variable vPosition
    locPosition = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( locPosition );
    locColor = gl.getUniformLocation( program, "rcolor" );

    // eventListener for mouse movement   
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
    // eventListener for mouseclick
    canvas.addEventListener("mousedown", function(e){
        if(movement && shot[1][1] > 1) {
            for(i=0; i<4; i++) {
                shot[i][1] = shotOffset[i][1];
            }
            shoot();
        }
    } );

    render();
};

// Render function to draw frames, includes collision detection
function render() {
    // Bird collision detection
    if(movement){
        for(i=0; i<4; i++) {
            bird[i][0] += (0.005 * birdDirection);
            shot[i][1] += 0.03;
        }
    }
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdBird );
    gl.bufferSubData(gl.ARRAY_BUFFER, bufferIdBird, flatten(bird));

    if(bird[1][0] < -0.95 || bird[1][0] > 0.85) {
        birdDirection *= -1;
    }

    if(shot[1][1] > 0.3 && shot[1][1] < 0.4){
        if(shot[1][0] > bird[1][0] && shot[1][0] < bird[2][0]){
            hit();
        }
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

    // Draw scores
    for(i=0; i<deadBirds; i++){
        gl.bindBuffer( gl.ARRAY_BUFFER, scoreBuffers[i] );
        gl.vertexAttribPointer( locPosition, 2, gl.FLOAT, false, 0, 0 );
        gl.uniform4fv( locColor, flatten(colorB) );
        gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );    
    }

    window.requestAnimFrame(render);

}

// Triggers when the user shoots
function shoot(){
    for(i=0; i<4; i++) {
        shot[i][0] = ((mouseX - 500)/500) + shotOffset[i][0];
    }
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdShot );
    gl.bufferSubData(gl.ARRAY_BUFFER, bufferIdShot, flatten(shot));
}

// Triggers when the shot hits the bird
function hit() {
    deadBirds++;
    random = (Math.random()*1.5) - 0.7;
    for(i=0; i<4; i++) {
        bird[i][0] = birdOffset[i][0] + random;
        shot[i][1] = -1;
    }
    if(random < 0.0)
        birdDirection *= -1;

    if(deadBirds >= 5){
        alert("Vel gert! Stig: 5");
        movement = false;
    }
}

// Initializes the background
function initBkgnd() {
    backTex = gl.createTexture();
    backTex.Img = new Image();
    backTex.Img.onload = function() {
        handleBkTex(backTex);
    }
    backTex.Img.src = "./textures/back.jpg";
}
// loads the background image
function handleBkTex(tex) {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.Img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
}