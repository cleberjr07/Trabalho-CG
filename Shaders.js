class ShaderBuilder{
    constructor(gl,vertShader,fragShader){
        if(vertShader.length < 20)	this.program = ShaderUtil.domShaderProgram(gl,vertShader,fragShader,true);
        else						this.program = ShaderUtil.createProgramFromText(gl,vertShader,fragShader,true);

        if(this.program != null){
            this.gl = gl;
            gl.useProgram(this.program);
            this.mUniformList = [];
            this.mTextureList = [];

            this.noCulling = false;
            this.doBlending = false;
        }
    }

    prepareUniforms(){
        if(arguments.length % 2 != 0 ){ console.log("prepareUniforms precisa de argumentos."); return this; }

        var loc = 0;
        for(var i=0; i < arguments.length; i+=2){
            loc = gl.getUniformLocation(this.program,arguments[i]);
            if(loc != null) this.mUniformList[arguments[i]] = {loc:loc,type:arguments[i+1]};
        }
        return this;
    }

    prepareTextures(){
        if(arguments.length % 2 != 0){ console.log("prepareTextures precisa de argumentos."); return this; }

        var loc = 0,tex = "";
        for(var i=0; i < arguments.length; i+=2){
            tex = this.gl.mTextureCache[arguments[i+1]];
            if(tex === undefined){ console.log("Textura não foi achada na cache" + arguments[i+1]); continue; }

            loc = gl.getUniformLocation(this.program,arguments[i]);
            if(loc != null) this.mTextureList.push({loc:loc,tex:tex});
        }
        return this;
    }

    setUniforms(){
        if(arguments.length % 2 != 0){ console.log("setUniforms precisa de argumentos."); return this; }

        var name;
        for(var i=0; i < arguments.length; i+=2){
            name = arguments[i];
            if(this.mUniformList[name] === undefined){ console.log("uniform não foi achado " + name); return this; }

            switch(this.mUniformList[name].type){
                case "2fv":		this.gl.uniform2fv(this.mUniformList[name].loc, new Float32Array(arguments[i+1])); break;
                case "3fv":		this.gl.uniform3fv(this.mUniformList[name].loc, new Float32Array(arguments[i+1])); break;
                case "4fv":		this.gl.uniform4fv(this.mUniformList[name].loc, new Float32Array(arguments[i+1])); break;
                case "mat4":	this.gl.uniformMatrix4fv(this.mUniformList[name].loc,false,arguments[i+1]); break;
                default: console.log("desconhecido uniform" + name); break;
            }
        }

        return this;
    }

    activate(){ this.gl.useProgram(this.program); return this; }
    deactivate(){ this.gl.useProgram(null); return this; }

    dispose(){
        // desvincula o programa se estiver ativo no momento
        if(this.gl.getParameter(this.gl.CURRENT_PROGRAM) === this.program) this.gl.useProgram(null);
        this.gl.deleteProgram(this.program);
    }

    preRender(){
        this.gl.useProgram(this.program);

        if(arguments.length > 0) this.setUniforms.apply(this,arguments);

        //Prepara as texturas que podem ser carregadas.
        if(this.mTextureList.length > 0){
            var texSlot;
            for(var i=0; i < this.mTextureList.length; i++){
                texSlot = this.gl["TEXTURE" + i];
                this.gl.activeTexture(texSlot);
                this.gl.bindTexture(this.gl.TEXTURE_2D,this.mTextureList[i].tex);
                this.gl.uniform1i(this.mTextureList[i].loc,i);
            }
        }

        return this;
    }

    //Trata a renderização de um modal
    renderModel(model, doShaderClose){
        this.setUniforms("uMVMatrix",model.transform.getViewMatrix());
        this.gl.bindVertexArray(model.mesh.vao);

        if(model.mesh.noCulling || this.noCulling) this.gl.disable(this.gl.CULL_FACE);
        if(model.mesh.doBlending || this.doBlending) this.gl.enable(this.gl.BLEND);

        if(model.mesh.indexCount) this.gl.drawElements(model.mesh.drawMode, model.mesh.indexCount, gl.UNSIGNED_SHORT, 0); 
        else this.gl.drawArrays(model.mesh.drawMode, 0, model.mesh.vertexCount);

        //Limpa
        this.gl.bindVertexArray(null);
        if(model.mesh.noCulling || this.noCulling) this.gl.enable(this.gl.CULL_FACE);
        if(model.mesh.doBlending || this.doBlending) this.gl.disable(this.gl.BLEND);

        if(doShaderClose) this.gl.useProgram(null);

        return this;
    }
}


class Shader{
    constructor(gl,vertShaderSrc,fragShaderSrc){
        this.program = ShaderUtil.createProgramFromText(gl,vertShaderSrc,fragShaderSrc,true);

        if(this.program != null){
            this.gl = gl;
            gl.useProgram(this.program);
            this.attribLoc = ShaderUtil.getStandardAttribLocations(gl,this.program);
            this.uniformLoc = ShaderUtil.getStandardUniformLocations(gl,this.program);
        }

    }

    activate(){ this.gl.useProgram(this.program); return this; }
    deactivate(){ this.gl.useProgram(null); return this; }

    setPerspective(matData){	this.gl.uniformMatrix4fv(this.uniformLoc.perspective, false, matData); return this; }
    setModalMatrix(matData){	this.gl.uniformMatrix4fv(this.uniformLoc.modalMatrix, false, matData); return this; }
    setCameraMatrix(matData){	this.gl.uniformMatrix4fv(this.uniformLoc.cameraMatrix, false, matData); return this; }

    dispose(){
        //Desvincula o programa se estiver ativo no momento
        if(this.gl.getParameter(this.gl.CURRENT_PROGRAM) === this.program) this.gl.useProgram(null);
        this.gl.deleteProgram(this.program);
    }


    preRender(){}

    //Trata a renderização de um modal
    renderModal(modal){
        this.setModalMatrix(modal.transform.getViewMatrix());	//Define a transformação, para que o shader saiba onde o modal existe no espaço 3d
        this.gl.bindVertexArray(modal.mesh.vao);

        if(modal.mesh.noCulling) this.gl.disable(this.gl.CULL_FACE);
        if(modal.mesh.doBlending) this.gl.enable(this.gl.BLEND);

        if(modal.mesh.indexCount) this.gl.drawElements(modal.mesh.drawMode, modal.mesh.indexCount, gl.UNSIGNED_SHORT, 0); 
        else this.gl.drawArrays(modal.mesh.drawMode, 0, modal.mesh.vertexCount);

        //Limpa
        this.gl.bindVertexArray(null);
        if(modal.mesh.noCulling) this.gl.enable(this.gl.CULL_FACE);
        if(modal.mesh.doBlending) this.gl.disable(this.gl.BLEND);

        return this;
    }
}


class ShaderUtil{
    static domShaderSrc(elmID){
        var elm = document.getElementById(elmID);
        if(!elm || elm.text == ""){ console.log(elmID + "não foi achado shader ou texto."); return null; }

        return elm.text;
    }

    //Cria um shader passando o código e qual tipo
    static createShader(gl,src,type){
        var shader = gl.createShader(type);
        gl.shaderSource(shader,src);
        gl.compileShader(shader);

        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            console.error("Erro ao compilar shader : " + src, gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    //Vincula dois shaders compilados para criar um programa para renderização.
    static createProgram(gl,vShader,fShader,doValidate){
        // Vincula os shaders juntos
        var prog = gl.createProgram();
        gl.attachShader(prog,vShader);
        gl.attachShader(prog,fShader);
        gl.bindAttribLocation(prog,ATTR_POSITION_LOC,ATTR_POSITION_NAME);
        gl.bindAttribLocation(prog,ATTR_NORMAL_LOC,ATTR_NORMAL_NAME);
        gl.bindAttribLocation(prog,ATTR_UV_LOC,ATTR_UV_NAME);

        gl.linkProgram(prog);

        //Verificando
        if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){
            console.error("Erro ao criar shader do programa.",gl.getProgramInfoLog(prog));
            gl.deleteProgram(prog); return null;
        }

        if(doValidate){
            gl.validateProgram(prog);
            if(!gl.getProgramParameter(prog,gl.VALIDATE_STATUS)){
                console.error("Erro ao validar programa", gl.getProgramInfoLog(prog));
                gl.deleteProgram(prog); return null;
            }
        }

        gl.detachShader(prog,vShader);
        gl.detachShader(prog,fShader);
        gl.deleteShader(fShader);
        gl.deleteShader(vShader);

        return prog;
    }

    static domShaderProgram(gl,vectID,fragID,doValidate){
        var vShaderTxt	= ShaderUtil.domShaderSrc(vectID);								if(!vShaderTxt)	return null;
        var fShaderTxt	= ShaderUtil.domShaderSrc(fragID);								if(!fShaderTxt)	return null;
        var vShader		= ShaderUtil.createShader(gl,vShaderTxt,gl.VERTEX_SHADER);		if(!vShader)	return null;
        var fShader		= ShaderUtil.createShader(gl,fShaderTxt,gl.FRAGMENT_SHADER);	if(!fShader){	gl.deleteShader(vShader); return null; }

        return ShaderUtil.createProgram(gl,vShader,fShader,true);
    }

    static createProgramFromText(gl,vShaderTxt,fShaderTxt,doValidate){
        var vShader		= ShaderUtil.createShader(gl,vShaderTxt,gl.VERTEX_SHADER);		if(!vShader)	return null;
        var fShader		= ShaderUtil.createShader(gl,fShaderTxt,gl.FRAGMENT_SHADER);	if(!fShader){	gl.deleteShader(vShader); return null; }

        return ShaderUtil.createProgram(gl,vShader,fShader,true);
    }

    static getStandardAttribLocations(gl,program){
        return {
            position:	gl.getAttribLocation(program,ATTR_POSITION_NAME),
            norm:		gl.getAttribLocation(program,ATTR_NORMAL_NAME),
            uv:			gl.getAttribLocation(program,ATTR_UV_NAME)
        };
    }

    static getStandardUniformLocations(gl,program){
        return {
            perspective:	gl.getUniformLocation(program,"uPMatrix"),
            modalMatrix:	gl.getUniformLocation(program,"uMVMatrix"),
            cameraMatrix:	gl.getUniformLocation(program,"uCameraMatrix"),
            mainTexture:	gl.getUniformLocation(program,"uMainTex")
        };
    }
}