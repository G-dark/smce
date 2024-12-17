import fs from "fs";
import mongoose from "mongoose";
import { PORT, HOST } from "../Routes/config.js";
const Schema = mongoose.Schema;

const productoSchema = new Schema(
  {
    name: String,
    code: Number,
    quantity: Number,
    image: String,
    price: Number,
    expireDate: String,
    arriveDate: String,
    cost: Number,
  },
  { versionKey: false }
);

const Producto = mongoose.model("Producto", productoSchema);

export const getProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const rows =
      id === undefined
        ? await Producto.find()
        : await Producto.find({ code: id });
    if (rows.length > 0) {
      return res.status(200).json(rows);
    } else {
      return res.status(404).json({ message: "no encontrado" });
    }
  } catch (error) {
    return res.status(404);
  }
};

export const saveProduct = async (req, res) => {
  try {
    const { name, quantity, price, arriveDate, expireDate, cost } = req.body;
    let code = await createCode(0);
    console.log(price, quantity, name);
    if (validacion(name, quantity, price, expireDate, arriveDate, cost)) {
      
      const nuevoProducto = new Producto({
        name: name,
        code: code,
        quantity: quantity,
        image: req.file
          ? HOST + PORT + "/public/" + req.file.filename
          : HOST + PORT + "/public/" + "nimageavailable.png",
        price: price,
        expireDate: expireDate,
        arriveDate: arriveDate,
        cost: cost,
      });

       await nuevoProducto.save().then(() => {
        console.log("guardado");
      });
     
      return res.status(200).json({ message: "producto creado" });
    } else {
      return res.status(404).json({ message: "datos invalidos" });
    }
  } catch (error) {
    console.error("Error:", error)
    return res.status(400).json({ message: "Error" });
  }
};

const validacion = (
  name,
cantidad,
  price,
  expireDate,
  arriveDate,
  cost
) => {

  let letras = new RegExp(/^[A-Za-z\s]+$/g);
  let numeros = new RegExp(/^[0-9]+$/g);
  let numeros2 = new RegExp(/^[0-9]+$/g);
  let numeros3 = new RegExp(/^[0-9]+$/g);

  if ((name == undefined || name.trim() == "") &&
  (cantidad == undefined || cantidad.trim() == "") &&
   (price == undefined || price.trim() == "") && 
   (expireDate == undefined || expireDate.trim() == "") &&
    (arriveDate == undefined || arriveDate.trim() == "") &&
     (cost == undefined || cost.trim() == "") &&
    !letras.test(name) && !numeros.test(cantidad) && 
    !numeros2.test(price)&& !numeros3.test(cost)
  ) return false;
  
  return true;
};

async function createCode(code) {
  while (await existProduct(code)) {
    code++;
  }
  return code;
}

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, price, cost, arriveDate, expireDate } = req.body;
    console.log(name, quantity, id);
    let product;
    if (req.file) {
      product = {
        name: name,
        quantity: quantity,
        image: HOST + PORT + "/public/" + req.file.filename,
        price: price,
        arriveDate: arriveDate,
        expireDate: expireDate,
        cost: cost,
      };
    } else {
      product = {
        name: name,
        quantity: quantity,
        arriveDate: arriveDate,
        expireDate: expireDate,
        price: price,
        cost: cost,
      };
    }

    if (await existProduct(id)) {
      const result = await Producto.updateOne({ code: id }, product, {
        runValidators: true,
      });

      console.log(result);
      return res.status(200).json({ message: "producto actualizado" });
    } else {
      return res.status(404).json({ message: "Producto inexistente" });
    }
  } catch (error) {
    return res.status(404);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (await existProduct(id)) {
      const result = await Producto.deleteOne({ code: id });
      console.log(result);
      return res.status(200).json({ message: "Producto eliminado" });
    } else {
      return res.status(404).json({ message: "Producto inexistente" });
    }
  } catch (error) {
    return res.status(404);
  }
};

const existProduct = async (id) => {
  try {
    const rows = await Producto.find({ code: id });
    return rows.length != 0;
  } catch (error) {
    return false;
  }
};
