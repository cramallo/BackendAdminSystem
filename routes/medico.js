var express=require('express');
var app=express();

var Medico=require('../models/medico');
var autenticacion=require('../middlewares/autenticacion');

app.get('/',(req,res)=>{

    var desde=req.query.desde;
    desde=Number(desde);

    Medico.find({},'nombre img usuario hospital')
    .skip(desde)
    .limit(5)
    .populate('usuario','nombre email')
    .populate('hospital')
    .exec(
        (err,medicos)=>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    message:'Error interno del servidor',
                    error:err
                });
            }
            Medico.count({},(err,total)=>{
                if(err){
                    return res.status(500).json({
                        ok:false,
                        message:'Error interno del servidor',
                        error:err
                    });
                }
                res.status(200).json({
                    ok:true,
                    medicos:medicos,
                    total:total
                });
            });
        });
});

app.post('/',autenticacion.verificaToken,(req,res)=>{
    var body=req.body;

    Medico=new Medico({
        nombre:body.nombre,
        img:body.img,
        usuario:req.usuario._id,
        hospital:body.hospital
    });

    Medico.save((err,medico)=>{
        if(err){
            return res.status(400).json({
                ok:false,
                message:'Peticion incorrecta',
                error:err
            });
        }
        res.status(201).json({
            ok:true,
            medico:medico
        });
    });
});

app.put('/:id',autenticacion.verificaToken,(req,res)=>{
    var id=req.params.id;
    var body=req.body;

    Medico.findById(id,(err,medico)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                message:'Error interno del servidor',
                error:err
            });
        }
        if(!medico){
            return res.status(400).json({
                ok:false,
                message:'Peticion incorrecta',
                error:err
            });
        }
        medico.nombre=body.nombre,
        medico.img=body.img,
        medico.usuario=req.usuario._id;
        medico.hospital=body.hospital;

        medico.save((err,medicoGuardado)=>{
            if(err){
                return res.status(400).json({
                    ok:false,
                    message:'Peticion incorrecta',
                    error:err
                });
            }
            res.status(200).json({
                ok:true,
                medico:medicoGuardado
            });
        });
    });
});

app.delete('/:id',autenticacion.verificaToken,(req,res)=>{
    var id=req.params.id;

    Medico.findByIdAndRemove(id,(err,medico)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                message:'Error interno del servidor',
                error:err
            })
        }
        if(!medico){
            return res.status(400).json({
                ok:false,
                message:'Peticion incorrecta',
                error:err
            });
        }
        res.status(200).json({
            ok:true,
            message:'Medico eliminado con exito',
            medico:medico
        });
    });
});
module.exports=app;