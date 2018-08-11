var express=require('express');
var app=express();
var Hospital=require('../models/hospital');
var autenticacion=require('../middlewares/autenticacion');

app.get('/',(req,res)=>{

    var desde=req.query.desde;
    desde=Number(desde);

    Hospital.find({},'nombre img usuario')
    .skip(desde)
    .limit(desde)
    .populate('usuario','nombre email')
    .exec(
        (err,hospitales)=>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    message:'Error interno del servidor',
                    error:err
                });
            }
            Hospital.count({},(err,total)=>{
                if(err){
                    return res.status(500).json({
                        ok:false,
                        message:'Error interno del servidor',
                        error:err
                    });
                }
                res.status(200).json({
                    ok:true,
                    hospitales:hospitales,
                    total:total
                });
            });            
        }
    );
});

app.post('/',autenticacion.verificaToken,(req,res)=>{
    var body=req.body;
    Hospital=new Hospital({
        nombre:body.nombre,
        img:body.img,
        usuario:req.usuario._id
    });

    Hospital.save((err,hospitalGuardado)=>{
        if(err){
            return res.status(400).json({
                ok:false,
                message:'Peticion incorrecta',
                error:err
            });
        }
        res.status(201).json({
            ok:true,
            hospital:hospitalGuardado
        });
    });
});

app.put('/:id',autenticacion.verificaToken,(req,res)=>{
    var body=req.body;
    var id=req.params.id;

    Hospital.findById(id,(err,hospital)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                message:'Error interno del servidor',
                error:err
            });
        }
        if(!hospital){
            return res.status(400).json({
                ok:false,
                message:'Peticion incorrecta',
                error:err
            });
        }
        
        hospital.nombre=body.nombre;
        hospital.img=body.img;
        hospital.usuario=req.usuario._id;

        hospital.save((err,hospitalGuardado)=>{
            if(err){
                return res.status(400).json({
                    ok:false,
                    message:'Peticion incorrcta',
                    error:err
                })
            }            
            res.status(200).json({
                ok:true,
                hospital:hospitalGuardado
            });
        });
        
    });
});

app.delete('/:id',autenticacion.verificaToken,(req,res)=>{
    var id=req.params.id;
    Hospital.findByIdAndRemove(id,(err,hospital)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                message:'Error interno del servidor',
                error:err
            });
        }
        if(!hospital){
            return res.status(400).json({
                ok:false,
                message:'Peticion incorrecta',
                error:err
            });
        }
        res.status(200).json({
            ok:true,
            message:'Hospital eliminado con exito',
            hospital:hospital
        });
    });
});

module.exports=app;