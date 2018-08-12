var express=require('express');
var app=express();

const path=require('path');
const fs=require('fs');

//Devolver una imagen
app.get('/:coleccion/:img',(req,res)=>{
    var coleccion=req.params.coleccion;
    var img=req.params.img;

    //__dirname me dice la ruta de donde me encuentro indendientemente de donde este desplegada la app
    //PATH COMPLETO PARA OBTENER LA IMAGEN, SI ESTOY LOCAL O SERVIDOR, ETC X ESO EL DIR__NAME
    var pathImg=path.resolve(__dirname,`../uploads/${coleccion}/${img}`);

    if(fs.existsSync(pathImg)){
        res.sendfile(pathImg);//Envio la imagen
    }else{
        var pathNoImg=path.resolve(__dirname,'../assets/no-img.jpg');
        res.sendFile(pathNoImg);
    }
});

module.exports=app;