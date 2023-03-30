var Primatives = {};


 Primatives.CubeBad = class {
 	static createModal(gl){ return new Modal(Primatives.CubeBad.createMesh(gl)); }
 	static createMesh(gl){
 		var aVert = [
 				-0.5,0.5,0,0, -0.5,-0.5,0,0, 0.5,-0.5,0,0, 0.5,0.5,0,0,			//Front
 				0.5,0.5,-1,1, 0.5,-0.5,-1,1, -0.5,-0.5,-1,1, -0.5,0.5,-1,1		//Back
 			],
 			aUV = [
 				0,0, 0,1, 1,1, 1,0, 
 				0,0, 0,1, 1,1, 1,0
 			],
 			aIndex = [
 				0,1,2, 2,3,0, //Front
 			 	4,5,6, 6,7,4, //Back
 			 	3,2,5, 5,4,3, //Right
 			 	7,0,3, 3,4,7, //Top
 			 	7,6,1, 1,0,7  //Left
 			 ];
 		return gl.fCreateMeshVAO("CubeBad",aIndex,aVert,null,aUV,4);
 	}
 }


 Primatives.Cube = class {
 	static createModal(gl,name,keepRawData){ return new Modal(Primatives.Cube.createMesh(gl,name||"Cube",1,1,1,0,0,0,keepRawData)); }
 	static createMesh(gl,name,width,height,depth,x,y,z,keepRawData){
 		var w = width*0.5, h = height*0.5, d = depth*0.5;
 		var x0 = x-w, x1 = x+w, y0 = y-h, y1 = y+h, z0 = z-d, z1 = z+d;

 		//Começando no canto inferior esquerdo, depois trabalhando no sentido anti-horário para criar a face frontal.
 		//Backface é a primeira face, mas ao contrário (3,2,1,0)
		//mantém cada face construído da mesma maneira para facilitar a atribuição de index e uv
 		var aVert = [
 			x0, y1, z1, 0,	//0 Front
 			x0, y0, z1, 0,	//1
 			x1, y0, z1, 0,	//2
 			x1, y1, z1, 0,	//3 

 			x1, y1, z0, 1,	//4 Back
 			x1, y0, z0, 1,	//5
 			x0, y0, z0, 1,	//6
 			x0, y1, z0, 1,	//7 

 			x0, y1, z0, 2,	//7 Left
 			x0, y0, z0, 2,	//6
 			x0, y0, z1, 2,	//1
 			x0, y1, z1, 2,	//0

 			x0, y0, z1, 3,	//1 Bottom
 			x0, y0, z0, 3,	//6
 			x1, y0, z0, 3,	//5
 			x1, y0, z1, 3,	//2

 			x1, y1, z1, 4,	//3 Right
 			x1, y0, z1, 4,	//2 
 			x1, y0, z0, 4,	//5
 			x1, y1, z0, 4,	//4

 			x0, y1, z0, 5,	//7 Top
 			x0, y1, z1, 5,	//0
 			x1, y1, z1, 5,	//3
 			x1, y1, z0, 5	//4
 		];

 		//Construir o índice [0,1,2, 2,3,0]
 		var aIndex = [];
 		for(var i=0; i < aVert.length / 4; i+=2) aIndex.push(i, i+1, (Math.floor(i/4)*4)+((i+2)%4));

 		//Constroi dados UV para cada vértice
 		var aUV = [];
 		for(var i=0; i < 6; i++) aUV.push(0,0,	0,1,  1,1,  1,0);

 		//Constroi dados normais para cada vértice
 		var aNorm = [
 			 0, 0, 1,	 0, 0, 1,	 0, 0, 1,	 0, 0, 1,		//Front
 			 0, 0,-1,	 0, 0,-1,	 0, 0,-1,	 0, 0,-1,		//Back
 			-1, 0, 0,	-1, 0, 0,	-1, 0,0 ,	-1, 0, 0,		//Left
 			 0,-1, 0,	 0,-1, 0,	 0,-1, 0,	 0,-1, 0,		//Bottom
 			 1, 0, 0,	 1, 0, 0,	 1, 0, 0,	 1, 0, 0,		//Right
 			 0, 1, 0,	 0, 1, 0,	 0, 1, 0,	 0, 1, 0		//Top
 		]

 		var mesh = gl.fCreateMeshVAO(name,aIndex,aVert,aNorm,aUV,4);
 		mesh.noCulling = true;

 		if(keepRawData){
 			mesh.aIndex	= aIndex;
 			mesh.aVert	= aVert;
 			mesh.aNorm	= aNorm;
 		}

 		return mesh;
 	}
 }


 Primatives.Quad = class {
 	static createModal(gl){ return new Modal(Primatives.Quad.createMesh(gl)); }
 	static createMesh(gl){
 		var aVert = [ -0.5,0.5,0, -0.5,-0.5,0, 0.5,-0.5,0, 0.5,0.5,0 ],
 			aUV = [ 0,0, 0,1, 1,1, 1,0 ],
 			aIndex = [ 0,1,2, 2,3,0 ];
 		var mesh = gl.fCreateMeshVAO("Quad",aIndex,aVert,null,aUV);
 		mesh.noCulling = true;
 		mesh.doBlending = true;
 		return mesh;
 	}
 }

 Primatives.MultiQuad = class {
 	static createModal(gl){ return new Modal(Primatives.MultiQuad.createMesh(gl)); }
 	static createMesh(gl){
 		var	aIndex = [ ],
 			aUV = [ ], 
 			aVert = [];		

 		for(var i=0; i < 10; i++){
 			//Calcula um tamanho aleatório, rotação y e posição
 			var size = 0.2 + (0.8* Math.random()),
 				half = size * 0.5,
 				angle = Math.PI * 2 * Math.random(),
 				dx = half * Math.cos(angle),
 				dy = half * Math.sin(angle),
 				x = -2.5 + (Math.random()*5),
 				y = -2.5 + (Math.random()*5),			
 				z = 2.5 - (Math.random()*5),
 				p = i * 4;

 			//Constroi os 4 pontos
 			aVert.push(x-dx, y+half, z-dy);		//TOP LEFT
 			aVert.push(x-dx, y-half, z-dy);		//BOTTOM LEFT
 			aVert.push(x+dx, y-half, z+dy);		//BOTTOM RIGHT			
 			aVert.push(x+dx, y+half, z+dy);		//TOP RIGHT

 			aUV.push(0,0, 0,1, 1,1, 1,0);		//Quad's UV
 			aIndex.push(p,p+1,p+2, p+2,p+3,p);	//Quad's Index
 		}

 		var mesh = gl.fCreateMeshVAO("MultiQuad",aIndex,aVert,null,aUV);
 		mesh.noCulling = true;
 		mesh.doBlending = true;
 		return mesh;
 	}
 }

 Primatives.GridAxis = class {
 	static createModal(gl,incAxis){ return new Modal(Primatives.GridAxis.createMesh(gl,incAxis)); }
 	static createMesh(gl,incAxis){
 		//Cria grid
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


 		//Configura
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

 		gl.vertexAttribPointer(
 			ATTR_POSITION_LOC
 			,3
 			,gl.FLOAT
 			,false
 			,strideLen
 			,0
 		);

 		gl.vertexAttribPointer(
 			attrColorLoc
 			,1
 			,gl.FLOAT
 			,false
 			,strideLen
 			,Float32Array.BYTES_PER_ELEMENT * 3
 		);

 		//Limpa e finaliza
 		gl.bindVertexArray(null);
 		gl.bindBuffer(gl.ARRAY_BUFFER,null);
 		gl.mMeshCache["grid"] = mesh;
 		return mesh;
 	}
 }