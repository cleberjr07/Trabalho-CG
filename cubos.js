var vertexShaderCode = `#version 300 es
in vec4 a_position;
in vec3 a_norm;
in vec2 a_uv;

uniform mat4 uPMatrix;
uniform mat4 uMVMatrix;
uniform mat4 uCameraMatrix;
uniform vec2[6] uFaces;
out highp vec2 vUV;

const float size = 1.0/16.0;

void main(void){
  int f = int(a_position.w);
  float u = uFaces[f].x * size + a_uv.x * size;
  float v = uFaces[f].y * size + a_uv.y * size;
  vUV = vec2(u,v);

  gl_Position = uPMatrix * uCameraMatrix * uMVMatrix * vec4(a_position.xyz, 1.0); 
}
`;

var fragmentShaderCode = `#version 300 es
precision mediump float;
uniform sampler2D uAltas;
in highp vec2 vUV;
out vec4 outColor;

void main(void){ outColor = texture(uAltas,vUV); }
`;


    var gl, gRLoop,	gShader, gModel, gCamera, gCameraCtrl;
    var gGridFloor, mDebugVerts, mDebugLine;

    window.addEventListener("load",function(){
      gl = GLInstance("glcanvas7").fFitScreen(1,1).fClear();

      gCamera = new Camera(gl);
      gCamera.transform.position.set(2,1,6);
      gCameraCtrl = new CameraController(gl,gCamera);

      gGridFloor = new GridFloor(gl);
      gRLoop = new RenderLoop(onRender,30);

      //Carregando resources
      Resources.setup(gl,onReady).loadTexture("atlas","atlas_mindcraft.png").start();
    });

    function onReady(){
      //Configura Test Shader, Modal, Meshes
      gShader = new ShaderBuilder(gl, vertexShaderCode, fragmentShaderCode)
      .prepareUniforms("uPMatrix","mat4", "uMVMatrix","mat4", "uCameraMatrix","mat4", "uFaces","2fv")
      .prepareTextures("uAltas","atlas")
      .setUniforms("uPMatrix",gCamera.projectionMatrix);


      var cubemesh = Primatives.Cube.createMesh(gl,"Cube",1,1,1,0,0,0,false);
      for(var i=0; i < 6; i++){
        var model = new Modal(cubemesh).setPosition( (i%3)*2 , 0.6 , Math.floor(i/3) * -2);
        gCubes.push(model);
      }

      gRLoop.start();
    }

    var gCubes = [];
    var texMap = [
        [3,0, 3,0, 3,0, 2,0, 3,0, 2,9],		//Grama
        [4,1, 4,1, 4,1, 5,1, 4,1, 5,1],		//Tronco
        [11,1, 10,1, 10,1, 9,1, 10,1, 9,1],	//Bau
        [7,7, 6,7, 6,7, 6,7, 6,7, 6,6],		//Abobora
        [8,0, 8,0, 8,0, 10,0, 8,0, 9,0],	//TNT
        [2,3, 2,3, 2,3, 2,3, 2,3, 2,3]      //diamante
    ];
    function onRender(dt){
      gl.fClear();

      gCamera.updateViewMatrix();
      gGridFloor.render(gCamera);
      gShader.preRender("uCameraMatrix",gCamera.viewMatrix);

      for(var i=0; i < gCubes.length; i++){
        gShader.setUniforms("uFaces",texMap[i]).renderModel( gCubes[i].preRender() );
      }
    }

    