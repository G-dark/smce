import { mongoose } from "mongoose";

const Schema = mongoose.Schema;
const Producto = new Schema(
  {
    name: String,
    code: Number,
    quantity: Number,
    image: String,
    price: Number,
    expireDate: String,
    arriveDate: String,
    soldDate: Date,
  },
  { versionKey: false }
);
const sellSchema = new Schema(
  {
    total: Number,
    code: String,
    products: [Producto],
    customerName: String,
    orderDate: Date,
    customerID: Number,
  },
  { versionKey: false }
);

const Selling = mongoose.model("Selling", sellSchema);
const SoldProduct = mongoose.model("SoldProduct", Producto);

export const sellProducts = async (req, res) => {
  try {
    const { idProducts, customerName, customerID } = req.body;

    console.log(idProducts, customerName, customerID);

    if (await validacion(Object.values(idProducts))) {
      const products = await getProducts(idProducts);
      const Products = productsToProducts(products);
      const total = getTotal(products);
      const code = await createCode();

      console.log(total, code);

      const nuevaVenta = new Selling({
        total: total,
        code: code,
        products: Products,
        customerName: customerName,
        orderDate: Date.now(),
        customerID: customerID,
      });
      await nuevaVenta.save().then(() => {
        console.log("Vendido");
        res.status(200).json(nuevaVenta)
      });
    } else {
      return res.status(405).json({ message: "productos no validos" });
    }
  } catch (error) {
    return res.status(400).json({message:"error"});
  }
};

export const getBills = async (req, res) => {
  const { id } = req.params;
  try {
    const data =
      id == undefined ? await Selling.find() : await Selling.find({ code: id });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(404).json({message:'No encontrado'});
  }
};

async function getProducts(ids) {
  let id;
  let products = [];
  const unique = setUnique(ids);

  while (ids.length > 0) {
    id = ids.pop();
    console.log(id);
    try {
      const product = await fetch("http://localhost:3010/API/producto/" + id);
      const productA = await product.json();
      await sell(productA);
      products.push(productA);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  }
  console.log(unique);
  killProducts(unique);
  return products;
}

const productsToProducts = (products) => {
  let Products = [];
  products.map((product) => {
    const nuevoProducto = new SoldProduct({
      name: product[0].name,
      code: product[0].code,
      quantity: product[0].quantity,
      image: product[0].image,
      price: product[0].price,
      expireDate: product[0].expireDate,
      arriveDate: product[0].arriveDate,
      soldDate: Date.now(),
    });
    Products.push(nuevoProducto);
  });
  return Products;
};

const sell = async (product) => {
  const vendido = new SoldProduct({
    name: product[0].name,
    code: product[0].code,
    quantity: product[0].quantity,
    image: product[0].image,
    price: product[0].price,
    expireDate: product[0].expireDate,
    arriveDate: product[0].arriveDate,
    soldDate: Date.now(),
  });
  try {
    await vendido.save().then(() => {
      console.log("registrado");
    });
  } catch (error) {
    console.error("Error", error);
  }
};

const killProducts = async (ids) => {
  let id;
  while (ids.length > 0) {
    console.log(id);
    id = ids.pop();
    const result = await fetch("http://localhost:3010/API/producto/" + id, {
      method: "DELETE",
      Headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error en la solicitud");
        }
        return response.json();
      })
      .then((data) => console.log("Éxito:", data))
      .catch((error) => console.error("Error:", error));
  }
};

function setUnique(ids) {
  let idsUnique = [];
  for (let index = 0; index < ids.length; index++) {
    if (!idsUnique.includes(ids[index])) {
      idsUnique.push(ids[index]);
    }
  }

  return idsUnique;
}

const getTotal = (products) => {
  let total = 0;
  products.map((product) => {
    total += product[0].price;
  });

  return total;
};

const createCode = async () => {
  let code = getRandomInt(0, 99999.9);
  while (!existCode(code)) {
    code = getRandomInt(0, 99999.9);
  }
  return code;
};
const existCode = async (id) => {
  try {
    const rows = await Selling.find({ code: id });
    return rows.length != 0;
  } catch (error) {
    return false;
  }
};

const existProduct = async (id) => {
  try {
    const rows = await fetch("http://localhost:3010/API/producto/" + id);
    let rows2 = await rows.json();
    return rows2.message != "no encontrado";
  } catch (error) {
    return false;
  }
};

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

const validacion = async (ids) => {
  let valid = ids.length > 0,
    valid2;
  let id;

  while (ids.length > 0) {
    id = ids.pop();
    valid2 = await existProduct(id);
    valid = valid && valid2;
  }
  console.log(valid);
  return valid;
};
