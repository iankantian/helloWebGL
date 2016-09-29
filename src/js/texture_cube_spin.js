/**
 * Created by joshuabrown on 9/16/16.
 */

var canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild( canvas );

var gl = canvas.getContext( 'webgl' );
if(!gl){
    console.log('WebGl not supported. Attempting experimental-webgl');
    gl = canvas.getContext('experimental-webgl');
}
if(!gl){
    console.log('WebGl not supported after two attempts');
}

// dynamic sizing of window:
gl.viewport(0, 0, window.innerWidth, window.innerHeight);

var vertexShaderText = '\
    precision mediump float;\
    attribute vec3 vertPosition;\
    attribute vec2 vertTexCoord;\
    varying vec2 fragTexCoord;\
    uniform mat4 mWorld;\
    uniform mat4 mView;\
    uniform mat4 mProj;\
    void main() {\
        fragTexCoord = vertTexCoord;\
        gl_Position = mProj * mView * mWorld * vec4( vertPosition, 1.0 );\
    }';

var fragmentShaderText = '\
    precision mediump float;\
    varying vec2 fragTexCoord;\
    uniform sampler2D sampler;\
    void main() {\
       gl_FragColor = texture2D( sampler, fragTexCoord );\
    }';

gl.clearColor(.5,.5,.8, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.enable( gl.DEPTH_TEST );
gl.enable( gl.CULL_FACE );
gl.frontFace( gl.CCW );
gl.cullFace( gl.BACK );

var vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource( vertexShader, vertexShaderText );

var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER );
gl.shaderSource( fragmentShader, fragmentShaderText );

gl.compileShader( fragmentShader );
if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS )){
    console.error('ERROR compiling fragmentShader', gl.getShaderInfoLog( fragmentShader ) );
}

gl.compileShader( vertexShader );
if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS )){
    console.error('ERROR compiling vertexShader', gl.getShaderInfoLog( vertexShader ) );
}
var program = gl.createProgram();
gl.attachShader( program, vertexShader );
gl.attachShader( program, fragmentShader );
gl.linkProgram( program );
if(!gl.getProgramParameter(program, gl.LINK_STATUS )){
    console.error('ERROR compiling linking program', gl.getProgramInfoLog( program ) );
}
// only for validation: not for deployment on clients: it's expensive!
gl.validateProgram( program );
if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
    console.error('ERROR validating program', gl.getProgramInfoLog( program ) );
}

// define in counter clockwise fashion
// webGL expects float32's  so define as new Float32Array
var triangleVertices = new Float32Array([
    // x, y,    R, G, B,
    -0.5, -0.5, 0.0,  1.0, 1.0, 1.0,
    0.5, -0.5, 0.0,   0.7, 0.3, 0.1,
    0.0, 0.5, 0.0,   0.0, 1.0, 0.1
]);

var boxVertices =
    [ // X, Y, Z           U, V
        // Top
        -1.0, 1.0, -1.0,   0, 0,
        -1.0, 1.0, 1.0,    0, 1,
        1.0, 1.0, 1.0,     1, 1,
        1.0, 1.0, -1.0,    1, 0,

        // Left
        -1.0, 1.0, 1.0,    0, 0,
        -1.0, -1.0, 1.0,   1, 0,
        -1.0, -1.0, -1.0,  1, 1,
        -1.0, 1.0, -1.0,   0, 1,

        // Right
        1.0, 1.0, 1.0,    1, 1,
        1.0, -1.0, 1.0,   0, 1,
        1.0, -1.0, -1.0,  0, 0,
        1.0, 1.0, -1.0,   1, 0,

        // Front
        1.0, 1.0, 1.0,    1, 1,
        1.0, -1.0, 1.0,    1, 0,
        -1.0, -1.0, 1.0,    0, 0,
        -1.0, 1.0, 1.0,    0, 1,

        // Back
        1.0, 1.0, -1.0,    0, 0,
        1.0, -1.0, -1.0,    0, 1,
        -1.0, -1.0, -1.0,    1, 1,
        -1.0, 1.0, -1.0,    1, 0,

        // Bottom
        -1.0, -1.0, -1.0,  1, 1,
        -1.0, -1.0, 1.0,    1, 0,
        1.0, -1.0, 1.0,    0, 0,
        1.0, -1.0, -1.0,   0, 1
    ];

var boxIndices =
    [
        // Top
        0, 1, 2,
        0, 2, 3,

        // Left
        5, 4, 6,
        6, 4, 7,

        // Right
        8, 9, 10,
        8, 10, 11,

        // Front
        13, 12, 14,
        15, 14, 12,

        // Back
        16, 17, 18,
        16, 18, 19,

        // Bottom
        21, 20, 22,
        22, 20, 23
    ];

var boxVertexBufferObject = gl.createBuffer();
gl.bindBuffer( gl.ARRAY_BUFFER, boxVertexBufferObject );
gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( boxVertices ), gl.STATIC_DRAW );

var boxIndexBufferObject = gl.createBuffer();
gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject );
gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( boxIndices ), gl.STATIC_DRAW );

var positionAttribLocation = gl.getAttribLocation( program, 'vertPosition');
var texCoordAttribLocation = gl.getAttribLocation( program, 'vertTexCoord');
gl.vertexAttribPointer(
    positionAttribLocation, // attribute location
    3, // number elements per attribute
    gl.FLOAT, // type of elements.
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT, // size of indiv vertex
    0 // OFFSETS
);
gl.vertexAttribPointer(
    texCoordAttribLocation, // attribute location
    2, // number elements per attribute
    gl.FLOAT, // type of elements.
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT, // size of individual vertex data
    3 * Float32Array.BYTES_PER_ELEMENT // OFFSETS
);


gl.enableVertexAttribArray( positionAttribLocation );
gl.enableVertexAttribArray( texCoordAttribLocation );

// create texture
var boxTexture = gl.createTexture();
gl.bindTexture( gl.TEXTURE_2D, boxTexture );
gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

var imageTexture = document.getElementById('crateTexture');
gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    imageTexture
);
//gl.bindTexture( gl.TEXTURE_2D, null ); // You should UN-BIND all textures once thy are loaded onto the gpu

gl.useProgram(program);

var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

var worldMatrix = new Float32Array(16);
var viewMatrix = new Float32Array(16);
var projMatrix = new Float32Array(16);
mat4.identity(worldMatrix);
mat4.lookAt( viewMatrix, [ 0, 0, -6 ], [ 0, 0, 0 ], [ 0, 1, 0 ]  );
mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0 );

gl.uniformMatrix4fv( matWorldUniformLocation, gl.FALSE, worldMatrix );
gl.uniformMatrix4fv( matViewUniformLocation, gl.FALSE, viewMatrix );
gl.uniformMatrix4fv( matProjUniformLocation, gl.FALSE, projMatrix );

var xRotationMatrix = new Float32Array(16);
var yRotationMatrix = new Float32Array(16);

var indentityMatrix = new Float32Array(16);
mat4.identity( indentityMatrix );
var angle = 0.0;

// main render loop
var loop = function(){
    requestAnimationFrame( loop );
    angle = performance.now() / 1000 / 6 * 2 * Math.PI;
    mat4.rotate(xRotationMatrix, indentityMatrix, angle, [ 0, 1, 0 ]);
    mat4.rotate(yRotationMatrix, indentityMatrix, angle / 2, [ 1, 0, 0 ]);
    mat4.mul( worldMatrix, xRotationMatrix, yRotationMatrix );
    gl.uniformMatrix4fv( matWorldUniformLocation, gl.FALSE, worldMatrix );

    gl.clearColor( .5,.5,.8, 1.0 );
    gl.clear( gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT );
    gl.drawElements( gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0 );
};
requestAnimationFrame( loop );

