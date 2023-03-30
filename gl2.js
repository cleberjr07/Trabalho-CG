
 const ATTR_POSITION_NAME	= "a_position";
 const ATTR_POSITION_LOC		= 0;
 const ATTR_NORMAL_NAME		= "a_norm";
 const ATTR_NORMAL_LOC		= 1;
 const ATTR_UV_NAME			= "a_uv";
 const ATTR_UV_LOC			= 2;
 
 class GlUtil{

 	//Converte cores hexadecimais em arrays flutuantes
 	static rgbArray(){
 		if(arguments.length == 0) return null;
 		var rtn = [];

 		for(var i=0,c,p; i < arguments.length; i++){
 			if(arguments[i].length < 6) continue;
 			c = arguments[i];		
 			p = (c[0] == "#")?1:0;	//Determine a posição inicial no array char para começar a puxar

 			rtn.push(
 				parseInt(c[p]	+c[p+1],16)	/ 255.0,
 				parseInt(c[p+2]	+c[p+3],16)	/ 255.0,
 				parseInt(c[p+4]	+c[p+5],16)	/ 255.0
 			);
 		}
 		return rtn;
 	}

 }

 function GLInstance(canvasID){
 	var canvas = document.getElementById(canvasID),
 		gl = canvas.getContext("webgl2");

 	if(!gl){ console.error("WebGL context is not available."); return null; }

 	//Configura as propriedades
 	gl.mMeshCache = [];	//Armazena todos os objetos mesh em um cache para facilitar a descarga dos buffers se todos estiverem em um só lugar.
 	gl.mTextureCache = [];

 	//Configura o WebGL, definindo todas as configurações padrão necessárias.
 	gl.cullFace(gl.BACK);	//Define qual face será recortada, BACK é o padrão
	gl.frontFace(gl.CCW);	//Define a ordem de vértices usada para definir as faces, CCW (Counter-ClockWise) é o padrão
	gl.enable(gl.DEPTH_TEST);	//Habilita o teste de profundidade
	gl.enable(gl.CULL_FACE);	//Habilita o recorte de faces traseiras, ou seja, só mostra triângulos criados no sentido horário
	gl.depthFunc(gl.LEQUAL);	//Configura a função de teste de profundidade como menor ou igual (LEQUAL), o que significa que objetos mais próximos vão obscurecer os objetos mais distantes
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);	//Configura o modo de mesclagem alpha padrão
	gl.clearColor(1.0,1.0,1.0,1.0);	//Define a cor de fundo
 	
	//Limpa o canvas com a cor de fundo definida anteriormente.
 	gl.fClear = function(){ this.clear(this.COLOR_BUFFER_BIT | this.DEPTH_BUFFER_BIT); return this; }

 	//Cria e preenche um buffer de arrays
 	gl.fCreateArrayBuffer = function(floatAry,isStatic){
 		if(isStatic === undefined) isStatic = true; //So we can call this function without setting isStatic

 		var buf = this.createBuffer();
 		this.bindBuffer(this.ARRAY_BUFFER,buf);
 		this.bufferData(this.ARRAY_BUFFER, floatAry, (isStatic)? this.STATIC_DRAW : this.DYNAMIC_DRAW );
 		this.bindBuffer(this.ARRAY_BUFFER,null);
 		return buf;
 	}

	//Transforma arrays em buffers GL e define um VAO que pré-define os buffers para atributos do shader padrão.
 	gl.fCreateMeshVAO = function(name,aryInd,aryVert,aryNorm,aryUV,vertLen){
 		var rtn = { drawMode:this.TRIANGLES };

 		//Creia e define vao
 		rtn.vao = this.createVertexArray();															
 		this.bindVertexArray(rtn.vao);	//Define o vao para que todas as chamadas de vertexAttribPointer/enableVertexAttribArray sejam salvas no vao.

 		
 		//Configura os vértices
 		if(aryVert !== undefined && aryVert != null){
 			rtn.bufVertices = this.createBuffer();													//Cria um buffer
 			rtn.vertexComponentLen = vertLen || 3;													//Quantos flutuadores formam um vértice
 			rtn.vertexCount = aryVert.length / rtn.vertexComponentLen;								//Quantos vértices na matriz

 			this.bindBuffer(this.ARRAY_BUFFER, rtn.bufVertices);
 			this.bufferData(this.ARRAY_BUFFER, new Float32Array(aryVert), this.STATIC_DRAW);		
 			this.enableVertexAttribArray(ATTR_POSITION_LOC);										//Habilita localização do atributo
 			this.vertexAttribPointer(ATTR_POSITION_LOC,rtn.vertexComponentLen,this.FLOAT,false,0,0);//Coloca o buffer no local do vao
 		}

 		//Configura normas
 		if(aryNorm !== undefined && aryNorm != null){
 			rtn.bufNormals = this.createBuffer();
 			this.bindBuffer(this.ARRAY_BUFFER, rtn.bufNormals);
 			this.bufferData(this.ARRAY_BUFFER, new Float32Array(aryNorm), this.STATIC_DRAW);
 			this.enableVertexAttribArray(ATTR_NORMAL_LOC);
 			this.vertexAttribPointer(ATTR_NORMAL_LOC,3,this.FLOAT,false, 0,0);
 		}

 		//Configura UV
 		if(aryUV !== undefined && aryUV != null){
 			rtn.bufUV = this.createBuffer();
 			this.bindBuffer(this.ARRAY_BUFFER, rtn.bufUV);
 			this.bufferData(this.ARRAY_BUFFER, new Float32Array(aryUV), this.STATIC_DRAW);
 			this.enableVertexAttribArray(ATTR_UV_LOC);
 			this.vertexAttribPointer(ATTR_UV_LOC,2,this.FLOAT,false,0,0);	//UV tem apenas dois floats por componente
 		}

 		//Configura Index.
 		if(aryInd !== undefined && aryInd != null){
 			rtn.bufIndex = this.createBuffer();
 			rtn.indexCount = aryInd.length;
 			this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, rtn.bufIndex);  
 			this.bufferData(this.ELEMENT_ARRAY_BUFFER, new Uint16Array(aryInd), this.STATIC_DRAW);
 		}

 		//Limpa o buffer
 		this.bindVertexArray(null);
 		this.bindBuffer(this.ARRAY_BUFFER,null);
 		if(aryInd != null && aryInd !== undefined)  this.bindBuffer(this.ELEMENT_ARRAY_BUFFER,null);

 		this.mMeshCache[name] = rtn;
 		return rtn;
 	}

 	gl.fLoadTexture = function(name,img,doYFlip,noMips){
 		var tex = this.createTexture();
 		this.mTextureCache[name] = tex;	
 		return this.fUpdateTexture(name,img,doYFlip,noMips);
 	};

 	gl.fUpdateTexture = function(name,img,doYFlip,noMips){
 		var tex = this.mTextureCache[name];	
 		if(doYFlip == true) this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, true);

 		this.bindTexture(this.TEXTURE_2D, tex);														//Definir buffer de texto para rodar
 		this.texImage2D(this.TEXTURE_2D, 0, this.RGBA, this.RGBA, this.UNSIGNED_BYTE, img);			//Bota a img na CPU

 		if(noMips === undefined || noMips == false){
 			this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MAG_FILTER, this.LINEAR);					//Configura up scaling
 			this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MIN_FILTER, this.LINEAR_MIPMAP_NEAREST);	//Configura down scaling
 			this.generateMipmap(this.TEXTURE_2D);	//Pré-calcula diferentes tamanhos de textura para renderização de melhor qualidade.
 		}else{
 			this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MAG_FILTER, this.NEAREST);
 			this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MIN_FILTER, this.NEAREST);
 			this.texParameteri(this.TEXTURE_2D, this.TEXTURE_WRAP_S, this.CLAMP_TO_EDGE);
 			this.texParameteri(this.TEXTURE_2D, this.TEXTURE_WRAP_T, this.CLAMP_TO_EDGE);
 		}

 		this.bindTexture(this.TEXTURE_2D,null);

 		if(doYFlip == true) this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, false);	//Para de inverter texturas
 		return tex;	
 	}

 	gl.fLoadCubeMap = function(name,imgAry){
 		if(imgAry.length != 6) return null;
 		var tex = this.createTexture();
 		this.bindTexture(this.TEXTURE_CUBE_MAP,tex);

 		//Bora a imagem para um ponto específico no mapa do cubo.
 		for(var i=0; i < 6; i++){
 			this.texImage2D(this.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, this.RGBA, this.RGBA, this.UNSIGNED_BYTE, imgAry[i]);
 		}

 		this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_MAG_FILTER, this.LINEAR);	//Configura up scaling
 		this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_MIN_FILTER, this.LINEAR);	//Configura down scaling
 		this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_WRAP_S, this.CLAMP_TO_EDGE);	//Estica imagem para posição X
 		this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_WRAP_T, this.CLAMP_TO_EDGE);	//Estica imagem para posição Y
 		this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_WRAP_R, this.CLAMP_TO_EDGE);	//Estica imagem para posição Z

 		this.bindTexture(this.TEXTURE_CUBE_MAP,null);
 		this.mTextureCache[name] = tex;
 		return tex;
 	};

 	//Setters/Getters

 	//Defini o tamanho do canvas html e o view port de renderização
 	gl.fSetSize = function(w,h){
 		this.canvas.style.width = w + "px";
 		this.canvas.style.height = h + "px";
 		this.canvas.width = w;
 		this.canvas.height = h;
 		this.viewport(0,0,w,h);
 		return this;
 	}

 	//Define o tamanho do canvas para preencher uma % da tela total.
 	gl.fFitScreen = function(wp,hp){ return this.fSetSize(window.innerWidth * (wp || 1),window.innerHeight * (hp || 1)); }

 	return gl;
 }