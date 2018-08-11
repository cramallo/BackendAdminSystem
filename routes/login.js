var express = require('express');
var bcrypt = require('bcrypt');//Para desencriptar
var jwt = require('jsonwebtoken');
var SEED=require('../config/config').SEED;


var app=express();

var Usuario=require('../models/usuario');

app.post('/',(req,res)=>{

    var body=req.body;

    //Verifico email
    Usuario.findOne({ email: body.email }, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }        
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }
        //Verifico password

        if (!bcrypt.compareSync(body.password, usuario.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }
    
        //Creo token
        usuario.password=':)'
        var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }); // 4 horas

        res.status(200).json({
            ok:true,
            usuario:usuario,
            token:token,
            id:usuario._id
        });

    });
});

module.exports=app;