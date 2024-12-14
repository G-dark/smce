import { Router } from "express";

const selling = Router();
import {sellProducts, getBills} from "../Controllers/sellingController.js"

selling.get("/API/Vender",getBills);
selling.post("/API/Vender", sellProducts);

export default selling