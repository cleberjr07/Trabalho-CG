class GridFloor{
    constructor(gl,incAxis){
        this.transform = new Transform();
        this.gl = gl;
        this.createMesh(gl,incAxis || false)
        this.createShader();
    }

    createShader(){
        var vShader = '#version 300 es\n' +
            'in vec3 a_position;' +
            'layout(location=4) in float a_color;' +
            'uniform mat4 uPMatrix;' +
            'uniform mat4 uMVMatrix;' +
            'uniform mat4 uCameraMatrix;' +
            'uniform vec3 uColorAry[4];' +
            'out lowp vec4 color;' +
            'void main(void){' +
                'color = vec4(uColorAry[ int(a_color) ],1.0);' +
                'gl_Position = uPMatrix * uCameraMatrix * uMVMatrix * vec4(a_position, 1.0);' +
            '}';
        var fShader = '#version 300 es\n' +
            'precision mediump float;' +
            'in vec4 color;' +
            'out vec4 finalColor;' +
            'void main(void){ finalColor = color; }';

        this.mShader		= ShaderUtil.createProgramFromText(this.gl,vShader,fShader,true);
        this.mUniformColor	= this.gl.getUniformLocation(this.mShader,"uColorAry");
        this.mUniformProj	= this.gl.getUniformLocation(this.mShader,"uPMatrix");
        this.mUniformCamera	= this.gl.getUniformLocation(this.mShader,"uCameraMatrix");
        this.mUniformModelV	= this.gl.getUniformLocation(this.mShader,"uMVMatrix");

        //Salva cores no shader. Só precisa renderizar uma vez.
        this.gl.useProgram(this.mShader);
        this.gl.uniform3fv(this.mUniformColor, new Float32Array([ 0.8,0.8,0.8,  1,0,0,  0,1,0,  0,0,1 ]));
        this.gl.useProgram(null);
    }

    render(camera){
        this.transform.updateMatrix();

        //Prepara o Shader
        this.gl.useProgram(this.mShader);
        this.gl.bindVertexArray(this.mesh.vao);

        this.gl.uniformMatrix4fv(this.mUniformProj, false, camera.projectionMatrix); 
        this.gl.uniformMatrix4fv(this.mUniformCamera, false, camera.viewMatrix);
        this.gl.uniformMatrix4fv(this.mUniformModelV, false, this.transform.getViewMatrix()); 

        //Desenha Grid
        this.gl.drawArrays(this.mesh.drawMode, 0, this.mesh.vertexCount);

        //Limpa
        this.gl.bindVertexArray(null);
        this.gl.useProgram(null);
    }

    createMesh(gl,incAxis){
        //Cria dinamicamente grid
        var verts = [],
            size = 2,
            div = 10.0,
            step = size / div,
            half = size / 2;

        var p;
        for(var i=0; i <= div; i++){
            //Vertical
            p = -half + (i * step);
            verts.push(p);		//x1
            verts.push(0);		//y1
            verts.push(half);	//z1
            verts.push(0);		//c2

            verts.push(p);		//x2
            verts.push(0);		//y2
            verts.push(-half);	//z2
            verts.push(0);		//c2

            //Horizontal
            p = half - (i * step);
            verts.push(-half);	//x1
            verts.push(0);		//y1
            verts.push(p);		//z1
            verts.push(0);		//c1

            verts.push(half);	//x2
            verts.push(0);		//y2
            verts.push(p);		//z2
            verts.push(0);		//c2
        }

        if(incAxis){
            //x axis
            verts.push(-1.1);	//x1
            verts.push(0);		//y1
            verts.push(0);		//z1
            verts.push(1);		//c2

            verts.push(1.1);	//x2
            verts.push(0);		//y2
            verts.push(0);		//z2
            verts.push(1);		//c2

            //y axis
            verts.push(0);//x1
            verts.push(-1.1);	//y1
            verts.push(0);		//z1
            verts.push(2);		//c2

            verts.push(0);		//x2
            verts.push(1.1);	//y2
            verts.push(0);		//z2
            verts.push(2);		//c2

            //z axis
            verts.push(0);		//x1
            verts.push(0);		//y1
            verts.push(-1.1);	//z1
            verts.push(3);		//c2

            verts.push(0);		//x2
            verts.push(0);		//y2
            verts.push(1.1);	//z2
            verts.push(3);		//c2
        }

        var attrColorLoc = 4,
            strideLen,
            mesh = { drawMode:gl.LINES, vao:gl.createVertexArray() };

        mesh.vertexComponentLen = 4;
        mesh.vertexCount = verts.length / mesh.vertexComponentLen;
        strideLen = Float32Array.BYTES_PER_ELEMENT * mesh.vertexComponentLen;

        //Configura o Buffer
        mesh.bufVertices = gl.createBuffer();
        gl.bindVertexArray(mesh.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.bufVertices);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(ATTR_POSITION_LOC);
        gl.enableVertexAttribArray(attrColorLoc);

        gl.vertexAttribPointer(ATTR_POSITION_LOC,3,gl.FLOAT,false,strideLen,0);
        gl.vertexAttribPointer(attrColorLoc,1,gl.FLOAT,false,strideLen,Float32Array.BYTES_PER_ELEMENT * 3);

        //Limpa e finaliza
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.mMeshCache["grid"] = mesh;
        this.mesh = mesh;
    }
}