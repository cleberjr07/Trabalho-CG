    var gl, gRLoop,	gShader, gModel, gCamera, gCameraCtrl;
    var gGridFloor, mDebugVerts, mDebugLine;

    window.addEventListener("load",function(){
      gl = GLInstance("glcanvas5").fFitScreen(0.33,0.33).fClear();

      gCamera = new Camera(gl);
      gCamera.transform.position.set(0,1,3);
      gCameraCtrl = new CameraController(gl,gCamera);

      gGridFloor = new GridFloor(gl);
      gRLoop = new RenderLoop(onRender,30);

      //....................................
      //Carregando resources
      Resources.setup(gl,onReady).loadTexture("atlas","atlas_mindcraft.png").start();
    });

    function onReady(){
      //Configura Test Shader, Modal, Meshes
      gShader = new ShaderBuilder(gl,"vertex_shader","fragment_shader")
        .prepareUniforms("uPMatrix","mat4"
                ,"uMVMatrix","mat4"
                ,"uCameraMatrix","mat4"
                ,"uFaces","2fv")
        .prepareTextures("uAltas","atlas")
        .setUniforms("uPMatrix",gCamera.projectionMatrix);

      var cubemesh = Primatives.Cube.createMesh(gl,"Cube",1,1,1,0,0,0,false);
      for(var i=0; i < 1; i++){
        var model = new Modal(cubemesh).setPosition( (i%3)*2 , 0.6 , Math.floor(i/3) * -2);
        gCubes.push(model);
      }

      gRLoop.start();
    }

    var gCubes = [];
    var texMap = [
      [8,0, 8,0, 8,0, 10,0, 8,0, 9,0],		//TNT
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