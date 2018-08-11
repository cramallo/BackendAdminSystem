var express = require('express');
var app = express();
var bcrypt=require('bcrypt');

var autenticacion=require('../middlewares/autenticacion');
var Usuario = require('../models/usuario');

app.get('/', (req, res) => {

    var desde=req.query.desde || 0;
    desde=Number(desde);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error de servidor',
                        error: err
                    });
                }
                Usuario.count({},(err,total)=>{
                    if(err){
                        return res.status(500).json({
                            ok:false,
                            message:'Error interno del servidor',
                            error:err
                        });
                    }
                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total:total
                    });
                });
                
            });
});

app.post('/',autenticacion.verificaToken,(req,res)=>{
    var body=req.body;
    var usuario=new Usuario({
        nombre:body.nombre,
        email:body.email,
        password:bcrypt.hashSync(body.password,10),
        img:body.img,
        role:body.role
    });

    usuario.save((err,usuarioGuardado)=>{
        if(err){
            return res.status(400).json({
                ok:false,
                message:'Peticion incorrecta',
                error:err
            });
        }
        res.status(201).json({
            ok:true,
            usuario:usuarioGuardado,
            usuarioToken:req.usuario
        });
    });
});

app.put('/:id',(req,res)=>{
    var id=req.params.id;
    var body=req.body;
    
    Usuario.findById(id,(err,usuario)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                message:'Error interno del servidor',
                error:err
            });
        }

        if(!usuario){
            return res.status(400).json({
                ok:false,
                message:'No existe el usuario',
                error:err
            });
        }
       
        usuario.nombre=body.nombre;
        usuario.email=body.email;      
        usuario.role=body.role;

        usuario.save((err,usuarioGuardado)=>{
            if(err){
                return res.status(400).json({
                    ok:false,
                    message:'No se pudo actualizar el usuario',
                    error:err
                });
            }
            usuarioGuardado.password=":)";
            res.status(200).json({
                ok:true,
                usuario:usuarioGuardado
            });
        });
    });
});

app.delete('/:id',(req,res)=>{
    var id=req.params.id;

    Usuario.findByIdAndRemove(id,(err,usuario)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                message:'Error interno del servidor',
                error:err
            });
        }
        if(!usuario){
            return res.status(400).json({
                ok:false,
                message:'Usuario incorrecto'
            });
        }
        usuario.password=":)";
        res.status(200).json({
            ok:true,
            message:'Usuario eliminado con exito',
            usuario:usuario
        });
    });

});

module.exports = app;