var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

app.use(fileUpload());

app.put('/:tabla/:id', (req, res) => {

    var tabla = req.params.tabla;
    var id = req.params.id;

    //Validar tipo de coleccion(tabla)
    var coleccionesValidas = ['usuarios', 'hospitales', 'medicos'];
    if (coleccionesValidas.indexOf(tabla) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Tipo de coleccion no valida'
        });
    }


    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No se ha seleccionado nada'
        });
    }

    //Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extension = nombreCortado[nombreCortado.length - 1];

    //Validar con las extensiones validas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Formato no permitido',
            erros: { message: 'Las extensiones validas son ' + extensionesValidas.join(', ') }
        });
    }

    //Generar nombre de archivo
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    //Mover archivo a un path
    var path = `./uploads/${tabla}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al mover el archivo',
                error: err
            });
        }
        subirPorTabla(tabla, id, nombreArchivo, res);
    });

});

function subirPorTabla(tabla, id, nombreArchivo, res) {
    if (tabla === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error interno del servidor'
                });
            }
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    message: 'Peticion incorrecta',
                    error: err
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            //Si hay una imagen vieja se reemplaza
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        message: 'Peticion incorrecta'
                    });
                }
                usuarioActualizado.password = ':)'
                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    }

    if (tabla === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error interno del servidor'
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    message: 'Peticion incorrecta',
                    error: err
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            //Si hay una imagen vieja se reemplaza
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        message: 'Peticion incorrecta'
                    });
                }
                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });
        });
    }

    if (tabla === 'medicos') {
        Medico.findById(id, (err, medico) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error interno del servidor'
                });
            }
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    message: 'Peticion incorrecta',
                    error: err
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            //Si hay una imagen vieja se reemplaza
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        message: 'Peticion incorrecta'
                    });
                }
                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });
            });
        });
    }
}

module.exports = app;