
// importaciones 
import express from "express";
import cors from 'cors';
import {mongoose} from "mongoose";
import morgan from "morgan";
import {DB_NAME, DB_HOST,PORT,DB_PORT,dir} from "./config.js"
import product from './producto.routes.js'
import selling from "./selling.routes.js";
const conexion = 'mongodb://' + DB_HOST +':' + DB_PORT + '/'+ DB_NAME;

const app = express();
mongoose.connect(conexion).then()
app.use(cors());
app.use(express.json())
app.use(morgan("dev"));
app.use(product);
app.use(selling);

// manejar errores de manera centralizada
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Algo salió mal!");
});

app.use("/public", express.static(dir))

//listening activation 
app.listen(PORT, () => {
  console.log(`El servidor está escuchando en el puerto ${PORT}`);
});

