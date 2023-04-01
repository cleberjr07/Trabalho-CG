		if (window.layout)
            layout.overridePreference("WebGLEnabled", "1");

        function initWebGL(canvasName, vshader, fshader, attribs, clearColor, clearDepth)
        {
            var canvas = document.getElementById(canvasName);
            var gl = canvas.getContext("webgl");
            

            gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
            gl.clearDepth(clearDepth);

            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

            return gl;
        }

        function drawCanvas(canvasID)
        {
          var gl = initWebGL(canvasID, "", "", [], [ 0, 0, 0, 0 ], 1);
          gl.viewport(0, 0, 200, 200);
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        }

        function init()
        {
          drawCanvas('canvas');
       }
