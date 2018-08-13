var express = require('express');
var bcrypt = require('bcrypt');//Para desencriptar
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
var app = express();
var Usuario = require('../models/usuario');
//Google
const { OAuth2Client } = require('google-auth-library');
var CLIENT_ID = require('../config/config').CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

//Autenticacion con google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];  
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

//El async para poder utilizar el await, q es como la promesa espera q se ejecute
app.post('/google', async (req, res) => {
    var token = req.body.IdToken;
    var googleUser = await verify(token)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                message: 'Token no valido'
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error interno del servidor'
            });
        }
        if (usuario) {
            //El usuario ya se habia registrado con login normal
            if (usuario.google === false) {
                return res.status(400).json({
                    ok: false,
                    message: 'Debe utilizar su autenticacion normal'
                });
            } else {
                var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }); // 4 horas
                usuario.password = ':)';
                res.status(200).json({
                    ok: true,
                    usuario: usuario,
                    token: token,
                    id: usuario._id
                });
            }
        } else {
            //Si el usuario no existe lo creo
            var user = new Usuario({
                nombre : googleUser.nombre,
                email : googleUser.email,
                password : ':)',
                img : googleUser.picture,                
                google : true
            });

            user.save((err, usuarioGuardado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        message: 'Petición incorrecta',
                        error:err
                    });
                }
                //Genero el token
                var token = jwt.sign({ usuario: usuarioGuardado }, SEED, { expiresIn: 14400 }); // 4 horas
                res.status(201).json({
                    ok: true,
                    usuario: usuarioGuardado,
                    token: token,
                    id: usuarioGuardado._id
                });
            });
        }

    });

    //Obtuve la informacion del usuario de google
    /*return res.status(200).json({
        ok: true,
        googleUser: googleUser
    });*/
});

//Autenticacion normal
app.post('/', (req, res) => {

    var body = req.body;

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
        usuario.password = ':)'
        var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }); // 4 horas

        res.status(200).json({
            ok: true,
            usuario: usuario,
            token: token,
            id: usuario._id
        });

    });
});

module.exports = app;