var gl;

var initDemo = function () {
    loadTextResource( 'src/shader.vs.glsl', function ( vsErr, vsText ) {
        if ( vsErr ) {
            console.error( vsErr );
        } else {
            loadTextResource( 'src/shader.fs.glsl', function ( fsErr, fsText ) {
                if ( fsErr ) {
                    console.error( fsErr );
                } else {
                    loadJSONResource( 'media/airplane.json', function ( modelErr, modelObj ) {
                        if ( modelErr ) {
                            console.error( fsErr );
                        } else {
                            loadImage( 'media/lined-portrait-letter-college-blue.png', function ( imgErr, img ) {
                                if ( imgErr ) {
                                    console.error( imgErr );
                                } else {
                                    runDemo( vsText, fsText, img, modelObj );
                                }
                            } );
                        }
                    } );
                }
            } );
        }
    } );
};

var runDemo = function ( vertexShaderText, fragmentShaderText, objImage, objModel ) {
    var canvas = document.getElementById( 'outputCanvas' );
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gl = canvas.getContext( 'webgl' );

    if ( !gl ) {
        console.log( 'WebGL not supported, falling back on experimental-webgl' );
        gl = canvas.getContext( 'experimental-webgl' );
    }

    if ( !gl ) {
        alert( 'Your browser does not support WebGL' );
    }

    gl.clearColor( 0.75, 0.85, 0.8, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    gl.enable( gl.DEPTH_TEST );
    //gl.enable( gl.CULL_FACE );

    var vertexShader = gl.createShader( gl.VERTEX_SHADER );
    var fragmentShader = gl.createShader( gl.FRAGMENT_SHADER );

    gl.shaderSource( vertexShader, vertexShaderText );
    gl.shaderSource( fragmentShader, fragmentShaderText );

    gl.compileShader( vertexShader );
    if ( !gl.getShaderParameter( vertexShader, gl.COMPILE_STATUS ) ) {
        console.error( 'ERROR compiling vertex shader!', gl.getShaderInfoLog( vertexShader ) );
        return;
    }

    gl.compileShader( fragmentShader );
    if ( !gl.getShaderParameter( fragmentShader, gl.COMPILE_STATUS ) ) {
        console.error( 'ERROR compiling fragment shader!', gl.getShaderInfoLog( fragmentShader ) );
        return;
    }

    var program = gl.createProgram();
    gl.attachShader( program, vertexShader );
    gl.attachShader( program, fragmentShader );
    gl.linkProgram( program );
    if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) ) {
        console.error( 'ERROR linking program!', gl.getProgramInfoLog( program ) );
        return;
    }
    gl.validateProgram( program );
    if ( !gl.getProgramParameter( program, gl.VALIDATE_STATUS ) ) {
        console.error( 'ERROR validating program!', gl.getProgramInfoLog( program ) );
        return;
    }
    
    var objVertices = objModel.meshes[0].vertices;
    var objIndices = [].concat.apply( [], objModel.meshes[0].faces ); // odd way to collapse array of arrays.
    var objTexCoords = objModel.meshes[0].texturecoords[0];

    var objPosVertexBufferObject = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, objPosVertexBufferObject );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( objVertices ), gl.STATIC_DRAW );

    var objTexCoordVertexBufferObject = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, objTexCoordVertexBufferObject );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( objTexCoords ), gl.STATIC_DRAW );

    var objIndexBufferObject = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, objIndexBufferObject );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( objIndices ), gl.STATIC_DRAW );

    gl.bindBuffer( gl.ARRAY_BUFFER, objPosVertexBufferObject );
    var positionAttribLocation = gl.getAttribLocation( program, 'vertPosition' );
    gl.vertexAttribPointer( 
        positionAttribLocation, // Attribute location
        3, // Number of elements per attribute
        gl.FLOAT, // Type of elements
        gl.FALSE,
        3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        0 // Offset from the beginning of a single vertex to this attribute
     );
    gl.enableVertexAttribArray( positionAttribLocation );

    gl.bindBuffer( gl.ARRAY_BUFFER, objTexCoordVertexBufferObject );
    var texCoordAttribLocation = gl.getAttribLocation( program, 'vertTexCoord' );
    gl.vertexAttribPointer( 
        texCoordAttribLocation, // Attribute location
        2, // Number of elements per attribute
        gl.FLOAT, // Type of elements
        gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        0
     );
    gl.enableVertexAttribArray( texCoordAttribLocation );
    
    var objTexture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, objTexture );
    gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    gl.texImage2D( 
        gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
        gl.UNSIGNED_BYTE,
        objImage
     );
    gl.bindTexture( gl.TEXTURE_2D, null );

    // Tell OpenGL state machine which program should be active.
    gl.useProgram( program );

    var matWorldUniformLocation = gl.getUniformLocation( program, 'mWorld' );
    var matViewUniformLocation = gl.getUniformLocation( program, 'mView' );
    var matProjUniformLocation = gl.getUniformLocation( program, 'mProj' );

    var worldMatrix = new Float32Array( 16 );
    var viewMatrix = new Float32Array( 16 );
    var projMatrix = new Float32Array( 16 );
    mat4.identity( worldMatrix );
    mat4.lookAt( viewMatrix, [-4, 0, 0], [0, 0, 0], [0, 1, 0] );
    mat4.perspective( projMatrix, glMatrix.toRadian( 45 ), canvas.width / canvas.height, 0.1, 1000.0 );

    gl.uniformMatrix4fv( matWorldUniformLocation, gl.FALSE, worldMatrix );
    gl.uniformMatrix4fv( matViewUniformLocation, gl.FALSE, viewMatrix );
    gl.uniformMatrix4fv( matProjUniformLocation, gl.FALSE, projMatrix );

    var xRotationMatrix = new Float32Array( 16 );
    var yRotationMatrix = new Float32Array( 16 );

    //
    // Main render loop
    //
    var identityMatrix = new Float32Array( 16 );
    mat4.identity( identityMatrix );
    var angle = 0;
    var loop = function () {
        angle = performance.now() / 1000 / 12 * 2 * Math.PI;
        mat4.rotate( yRotationMatrix, identityMatrix, angle, [0, 1, 0] );
        mat4.rotate( xRotationMatrix, identityMatrix, angle / 2, [1, 0, 0] );
        mat4.mul( worldMatrix, yRotationMatrix, xRotationMatrix );
        gl.uniformMatrix4fv( matWorldUniformLocation, gl.FALSE, worldMatrix );

        gl.clearColor( 0.75, 0.85, 0.8, 1.0 );
        gl.clear( gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT );

        gl.bindTexture( gl.TEXTURE_2D, objTexture );
        gl.activeTexture( gl.TEXTURE0 );

        gl.drawElements( gl.TRIANGLES, objIndices.length, gl.UNSIGNED_SHORT, 0 );

        requestAnimationFrame( loop );
    };
    requestAnimationFrame( loop );
};

var startMeUp = setInterval(  function(){
    if(  document.readyState == 'complete' ){
        clearInterval(  startMeUp  );
        initDemo();
    }
}, 100  );