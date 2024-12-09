import { mongoose } from "mongoose";

const Schema = mongoose.Schema;
const producto = new Schema(
  {
    name: String,
    code: Number,
    quantity: Number,
    image: String,
    price: Number,
    expireDate: String,
    arriveDate: String,
    soldDate: String,
  },
  { versionKey: false }
);
const sellSchema = new Schema(
  {
    total: Number,
    code: String,
    products: [producto],
    customerName: String,
    orderDate: String,
    customerID: Number,
  },
  { versionKey: false }
);

const Selling = mongoose.model("Selling", sellSchema);
const SoldProduct = mongoose.model("SoldProduct", producto);

export const sellProducts = async (req, res) => {
  try {
    const { total, code, idProducts, customerName, Date, customerID } =
      req.body;
    const products = getProducts(idProducts);

    const nuevaVenta = new Selling({
      total: total,
      code: code,
      products: products,
      customerName: customerName,
      orderDate: Date,
      customerID: customerID,
    });
    nuevaVenta.save().then(() => {
      console.log("Vendido");
    });
  } catch (error) {
    return res.status(400);
  }
};

async function getProducts(ids) {
  let id;
  let products = [];
  while (ids) {
    id = ids.Remove();
    try {
      const product = await fetch("http://localhost:3010/API/producto/" + id);
      sell(id, product);
      products.append(product);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  }
  return products;
}
const sell = async (id, product) => {
  const result = await fetch("http://localhost:3010/API/producto/" + id, {
    method: "DELETE",
    Headers: { "Content-Type": "application/json" },
  });

  const vendido = new SoldProduct({
    name: product.name,
    code: product.code,
    quantity: product.quantity,
    image: product.image,
    price: product.price,
    expireDate: product.expireDate,
    arriveDate: product.arriveDate,
    soldDate: Date.UTC().toString(),
  });
  try {
    vendido.save().then(() => {
      console.log("registrado");
    });
  } catch (error) {}
};
