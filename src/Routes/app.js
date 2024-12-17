// importaciones
import express from "express";
import cors from "cors";
import { mongoose } from "mongoose";
import morgan from "morgan";
import { DB_NAME, DB_HOST, PORT, DB_PORT, dir } from "./config.js";
import product from "./producto.routes.js";
import selling from "./selling.routes.js";
import cron from "node-cron";
import fs from "fs"
import path from "path"

const conexion = "mongodb://" + DB_HOST + ":" + DB_PORT + "/" + DB_NAME;
let cache = ["nimageavailable.png"];
const app = express();
mongoose.connect(conexion).then(() => {
  console.log("Conexion a DB establecida");
});
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(product);
app.use(selling);

app.use("/public", (req, res, next) => {
  console.log(`Se hizo un fetch a la ruta: ${req.originalUrl}`);
  const str = (req.originalUrl).replace("/public/","")
  
  if(!cache.includes(str)) cache.push(str) 
 
  next();
});

cron.schedule("0 0 1 */3 *", () => {
  console.log("Ejecutando tarea cada 3 meses a las 12:00 :", new Date().toLocaleString());
  fs.readdir(dir, (err, archivos) => {
    if (err) {
      console.error("Error al leer la carpeta:", err);
      return;
    }
  
    archivos.forEach((archivo) => {
      if (!cache.includes(archivo)) {
        const rutaArchivo = path.join(dir, archivo);
  
        fs.unlink(rutaArchivo, (err) => {
          if (err) {
            console.error(`Error al eliminar el archivo ${archivo}:`, err);
          } else {
            console.log(`Archivo eliminado: ${archivo}`);
          }
        });
      }
    });
  });
});

// manejar errores de manera centralizada
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Algo salió mal!");
});

app.use("/public", express.static(dir));

//listening activation
app.listen(PORT, () => {
  console.log(`El servidor está escuchando en el puerto ${PORT}`);
});
