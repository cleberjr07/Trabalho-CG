
 class Resources{
    //configura o objeto
    static setup(gl,completeHandler){
        Resources.gl = gl;
        Resources.onComplete = completeHandler;
        return this;
    }

    //Inicia a baixar a fila
    static start(){
        if(Resources.Queue.length > 0) Resources.loadNextItem();
    }

    //Carregando
    static loadTexture(name,src){
        for(var i=0; i < arguments.length; i+=2){
            Resources.Queue.push({type:"img",name:arguments[i],src:arguments[i+1]});
        }
        return this;
    }
    static loadVideoTexture(name,src){
        for(var i=0; i < arguments.length; i+=2){
            Resources.Queue.push({type:"vid",name:arguments[i],src:arguments[i+1]});
        }
        return this;
    }

    //Configura a fila
    static loadNextItem(){
        if(Resources.Queue.length == 0){
            if(Resources.onComplete != null) Resources.onComplete();
            else console.log("Resource Download Queue Complete");
            return;
        }

        var itm = Resources.Queue.pop();
        switch(itm.type){
            case "img":
                var img = new Image();
                img.queueData = itm;
                img.onload = Resources.onDownloadSuccess;
                img.onabort = img.onerror = Resources.onDownloadError;
                img.src = itm.src;
                break;
            case "vid":
                var vid = document.createElement("video");
                vid.style.display = "none";
                document.body.appendChild(vid);
                vid.queueData = itm;
                vid.addEventListener("loadeddata",Resources.onDownloadSuccess,false);
                vid.onabort = vid.onerror = Resources.onDownloadError;
                vid.autoplay = true;
                vid.loop = true;
                vid.src = itm.src;
                vid.load();
                vid.play();

                Resources.Videos[itm.name] = vid;
                break;
        }
    }

    static onDownloadSuccess(){
        if( this instanceof Image || this.tagName == "VIDEO"){
            var dat = this.queueData;
            Resources.gl.fLoadTexture(dat.name,this);
        }
        Resources.loadNextItem();
    }

    static onDownloadError(){
        console.log("Error getting ",this);
        Resources.loadNextItem();
    }
}

Resources.Queue = [];
Resources.onComplete = null;
Resources.gl = null;

Resources.Images = [];
Resources.Videos = [];