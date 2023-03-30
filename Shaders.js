class ShaderBuilder{
    constructor(gl,vertShader,fragShader){
        if(vertShader.length < 20)	this.program = ShaderUtil.domShaderProgram(gl,vertShader,fragShader,true);
        else						this.program = ShaderUtil.createProgramFromText(gl,vertShader,fragShader,true);

        if(this.program != null){
            this.gl = gl;
            gl.useProgram(this.program);
            this.mUniformList = [];		//List of Uniforms that have been loaded in. Key=UNIFORM_NAME {loc,type}
            this.mTextureList = [];		//List of texture uniforms, Indexed {loc,tex}

            this.noCulling = false;		//If true disables culling
            this.doBlending = false;	//If true, allows alpha to work.
        }
    }

    prepareUniforms(){
        if(arguments.length % 2 != 0 ){ console.log("prepareUniforms needs arguments to be in pairs."); return this; }

        var loc = 0;
        for(var i=0; i < arguments.length; i+=2){
            loc = gl.getUniformLocation(this.program,arguments[i]);
            if(loc != null) this.mUniformList[arguments[i]] = {loc:loc,type:arguments[i+1]};
        }
        return this;
    }

    prepareTextures(){
        if(arguments.length % 2 != 0){ console.log("prepareTextures needs arguments to be in pairs."); return this; }

        var loc = 0,tex = "";
        for(var i=0; i < arguments.length; i+=2){
            tex = this.gl.mTextureCache[arguments[i+1]];
            if(tex === undefined){ console.log("Texture not found in cache " + arguments[i+1]); continue; }

            loc = gl.getUniformLocation(this.program,arguments[i]);
            if(loc != null) this.mTextureList.push({loc:loc,tex:tex});
        }
        return this;
    }

    setUniforms(){
        if(arguments.length % 2 != 0){ console.log("setUniforms needs arguments to be in pairs."); return this; }

        var name;
        for(var i=0; i < arguments.length; i+=2){
            name = arguments[i];
            if(this.mUniformList[name] === undefined){ console.log("uniform not found " + name); return this; }

            switch(this.mUniformList[name].type){
                case "2fv":		this.gl.uniform2fv(this.mUniformList[name].loc, new Float32Array(arguments[i+1])); break;
                case "3fv":		this.gl.uniform3fv(this.mUniformList[name].loc, new Float32Array(arguments[i+1])); break;
                case "4fv":		this.gl.uniform4fv(this.mUniformList[name].loc, new Float32Array(arguments[i+1])); break;
                case "mat4":	this.gl.uniformMatrix4fv(this.mUniformList[name].loc,false,arguments[i+1]); break;
                default: console.log("unknown uniform type for " + name); break;
            }
        }

        return this;
    }

    activate(){ this.gl.useProgram(this.program); return this; }
    deactivate(){ this.gl.useProgram(null); return this; }

    dispose(){
        //unbind the program if its currently active
        if(this.gl.getParameter(this.gl.CURRENT_PROGRAM) === this.program) this.gl.useProgram(null);
        this.gl.deleteProgram(this.program);
    }

    preRender(){
        this.gl.useProgram(this.program); //Save a function call and just activate this shader program on preRender

        //If passing in arguments, then lets push that to setUniforms for handling. Make less line needed in the main program by having preRender handle Uniforms
        if(arguments.length > 0) this.setUniforms.apply(this,arguments);

        //Prepare textures that might be loaded up.
        //TODO, After done rendering need to deactivate the texture slots
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

    //Handle rendering a modal
    renderModel(model, doShaderClose){
        this.setUniforms("uMVMatrix",model.transform.getViewMatrix());
        this.gl.bindVertexArray(model.mesh.vao);

        if(model.mesh.noCulling || this.noCulling) this.gl.disable(this.gl.CULL_FACE);
        if(model.mesh.doBlending || this.doBlending) this.gl.enable(this.gl.BLEND);

        if(model.mesh.indexCount) this.gl.drawElements(model.mesh.drawMode, model.mesh.indexCount, gl.UNSIGNED_SHORT, 0); 
        else this.gl.drawArrays(model.mesh.drawMode, 0, model.mesh.vertexCount);

        //Cleanup
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

        //Note :: Extended shaders should deactivate shader when done calling super and setting up custom parts in the constructor.
    }

    activate(){ this.gl.useProgram(this.program); return this; }
    deactivate(){ this.gl.useProgram(null); return this; }

    setPerspective(matData){	this.gl.uniformMatrix4fv(this.uniformLoc.perspective, false, matData); return this; }
    setModalMatrix(matData){	this.gl.uniformMatrix4fv(this.uniformLoc.modalMatrix, false, matData); return this; }
    setCameraMatrix(matData){	this.gl.uniformMatrix4fv(this.uniformLoc.cameraMatrix, false, matData); return this; }

    //function helps clean up resources when shader is no longer needed.
    dispose(){
        //unbind the program if its currently active
        if(this.gl.getParameter(this.gl.CURRENT_PROGRAM) === this.program) this.gl.useProgram(null);
        this.gl.deleteProgram(this.program);
    }


    preRender(){}

    //Handle rendering a modal
    renderModal(modal){
        this.setModalMatrix(modal.transform.getViewMatrix());	//Set the transform, so the shader knows where the modal exists in 3d space
        this.gl.bindVertexArray(modal.mesh.vao);				//Enable VAO, this will set all the predefined attributes for the shader

        if(modal.mesh.noCulling) this.gl.disable(this.gl.CULL_FACE);
        if(modal.mesh.doBlending) this.gl.enable(this.gl.BLEND);

        if(modal.mesh.indexCount) this.gl.drawElements(modal.mesh.drawMode, modal.mesh.indexCount, gl.UNSIGNED_SHORT, 0); 
        else this.gl.drawArrays(modal.mesh.drawMode, 0, modal.mesh.vertexCount);

        //Cleanup
        this.gl.bindVertexArray(null);
        if(modal.mesh.noCulling) this.gl.enable(this.gl.CULL_FACE);
        if(modal.mesh.doBlending) this.gl.disable(this.gl.BLEND);

        return this;
    }
}


class ShaderUtil{
    static domShaderSrc(elmID){
        var elm = document.getElementById(elmID);
        if(!elm || elm.text == ""){ console.log(elmID + " shader not found or no text."); return null; }

        return elm.text;
    }

    //Create a shader by passing in its code and what type
    static createShader(gl,src,type){
        var shader = gl.createShader(type);
        gl.shaderSource(shader,src);
        gl.compileShader(shader);

        //Get Error data if shader failed compiling
        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            console.error("Error compiling shader : " + src, gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    //Link two compiled shaders to create a program for rendering.
    static createProgram(gl,vShader,fShader,doValidate){
        //Link shaders together
        var prog = gl.createProgram();
        gl.attachShader(prog,vShader);
        gl.attachShader(prog,fShader);

        //Force predefined locations for specific attributes. If the attibute isn't used in the shader its location will default to -1
        gl.bindAttribLocation(prog,ATTR_POSITION_LOC,ATTR_POSITION_NAME);
        gl.bindAttribLocation(prog,ATTR_NORMAL_LOC,ATTR_NORMAL_NAME);
        gl.bindAttribLocation(prog,ATTR_UV_LOC,ATTR_UV_NAME);

        gl.linkProgram(prog);

        //Check if successful
        if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){
            console.error("Error creating shader program.",gl.getProgramInfoLog(prog));
            gl.deleteProgram(prog); return null;
        }

        //Only do this for additional debugging.
        if(doValidate){
            gl.validateProgram(prog);
            if(!gl.getProgramParameter(prog,gl.VALIDATE_STATUS)){
                console.error("Error validating program", gl.getProgramInfoLog(prog));
                gl.deleteProgram(prog); return null;
            }
        }

        //Can delete the shaders since the program has been made.
        gl.detachShader(prog,vShader); //TODO, detaching might cause issues on some browsers, Might only need to delete.
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