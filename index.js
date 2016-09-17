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
    attribute vec2 position;\
    attribute vec3 vertColor;\
    varying vec3 fragColor;\
    void main() {\
        gl_Position = vec4( position, 0.0, 1.0 );\
        fragColor = vertColor;\
    }';

var fragmentShaderText = '\
    precision mediump float;\
    varying vec3 fragColor;\
    void main() {\
       gl_FragColor = vec4(fragColor, 1.0);\
    }';

gl.clearColor(.5,.5,.8, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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
var vertices = new Float32Array([
    // x, y,    R, G, B,
    -0.5, -0.5,  1.0, 1.0, 1.0,
    0.5, -0.5,   0.7, 0.3, 0.1,
    0.0, 0.5,    0.0, 1.0, 0.1
]);

var buffer = gl.createBuffer();
gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
gl.bufferData( gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW );

var positionAttribLocation = gl.getAttribLocation( program, 'position');
var colorAttribLocation = gl.getAttribLocation( program, 'vertColor');
gl.vertexAttribPointer(
    positionAttribLocation, // attribute location
    2, // number elements per attribute
    gl.FLOAT, // type of elements.
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT, // size of indiv vertex
    0 // OFFSETS
);
gl.vertexAttribPointer(
    colorAttribLocation, // attribute location
    3, // number elements per attribute
    gl.FLOAT, // type of elements.
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT, // size of indiv vertex
    2 * Float32Array.BYTES_PER_ELEMENT // OFFSETS
);


gl.enableVertexAttribArray( positionAttribLocation );
gl.enableVertexAttribArray( colorAttribLocation );

// main animation loop
gl.useProgram(program);
gl.drawArrays( gl.TRIANGLES, 0, 3 );


//gl.useProgram( program );
//program.color = gl.getUniformLocation( program, 'color' );
//gl.uniform4fv( program.color, [0, 1, 0, 1.0] );
//
//program.position = gl.getAttribLocation( program, 'position' );
//gl.enableVertexAttribArray( program.position );
//gl.vertexAttribPointer( program.position, 2, gl.FLOAT, false, 0, 0 );
//
//gl.drawArrays( gl.TRIANGLES, 0, vertices.length / 2 );
