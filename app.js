//Requires
var express=require('express');
var mongoose=require('mongoose');
var bodyparser=require('body-parser');

//Inicializar variables
var app=express();

//Body parser
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());

//Importar rutas
var appRoutes=require('./routes/app');
var loginRoutes=require('./routes/login');
var usuarioRoutes=require('./routes/usuario');
var medicoRoutes=require('./routes/medico');
var hospitalRoutes=require('./routes/hospital');

//Conexion a bd
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB',(err,res)=>{
    if (err){
        throw err;
    }
    console.log("Conexion a la base de datos exitosa");
});

//Rutas
app.use('/usuario',usuarioRoutes);
app.use('/hospital',hospitalRoutes);
app.use('/medico',medicoRoutes);
app.use('/login',loginRoutes);
app.use('/',appRoutes);

//Escuchar peticiones
app.listen(3000,()=>{
    console.log("Express server corriendo en el puerto 3000");
});