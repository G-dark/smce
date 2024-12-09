import { Router } from "express";
const product = Router();
import {uploadImage} from '../Midleware/storage.js'
import {getProducts, saveProduct, updateProduct, deleteProduct} from '../Controllers/productoController.js'


product.get("/API/producto", getProducts);

product.get("/API/producto/:id", getProducts);

product.post("/API/producto", uploadImage.single('image'), saveProduct);

product.patch("/API/producto/:id",uploadImage.single('image'), updateProduct);

product.delete("/API/producto/:id", deleteProduct);

export default product