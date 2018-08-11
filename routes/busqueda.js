var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;

    var regex = new RegExp(busqueda, 'i');

    var promise;

    switch (tabla) {
        case 'usuarios':
            promise = buscarUsuarios(regex);
            break;
        case 'hospitales':
            promise = buscarHospitales(regex);
            break;
        case 'medicos':
            promise = buscarMedicos(regex);
            break;
        default:
            res.status(400).json({
                ok: false,
                message: 'Peticion incorrecta'
            });
    }
    promise.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
});

app.get('/todo/:busqueda', (req, res) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(regex),
        buscarMedicos(regex),
        buscarUsuarios(regex)
    ]).then(respuestas => {
        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });

});

function buscarHospitales(regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email role')
            .exec(
                (err, hospitales) => {
                    if (err) {
                        reject('Error al cargar hospitales');
                    } else {
                        resolve(hospitales);
                    }
                });
    });

}

function buscarMedicos(regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email role')
            .exec(
                (err, medicos) => {
                    if (err) {
                        reject('Error al cargar medicos');
                    } else {
                        resolve(medicos);
                    }
                });
    });
}

function buscarUsuarios(regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios');
                } else {
                    resolve(usuarios);
                }
            })

    });
}
module.exports = app;