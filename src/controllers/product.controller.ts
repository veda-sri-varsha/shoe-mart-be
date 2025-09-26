import { Request, Response } from "express";
import Product from "../models/product.schema";
import mongoose from "mongoose";
import Collection from "../models/collection.schema";
import { productSchema } from "../schema/product.zod";
import handler from "../services/handler";

export const addProduct = handler(async (req: Request, res: Response) => {
  const { name, price, brand, description, category, stock, collectionId } = req.body;

  const product = await Product.create({
    name,
    price,
    brand,
    description,
    category,
    stock,
    collectionId,
  });

  await Collection.findByIdAndUpdate(collectionId, {
    $inc: { productCount: 1 },
  });

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    product: {
      id: product._id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      description: product.description,
      category: product.category,
      stock: product.stock,
      collectionId: product.collectionId,
    },
  });
});

// export const addProduct = async (req: Request, res: Response) => {
//   try {
//     const product = await Product.create(req.body);
//     res
//       .status(201)
//       .json({
//         success: true,
//         message: "Product created successfully",
//         product,
//       });
//   } catch (error: any) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

export const getAllProducts = handler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;

  const productAggregate = Product.aggregate([
    { $match: { isDeleted: false } },
    { $sort: { createdAt: -1 } },
  ]);

  const products = await (Product as any).aggregatePaginate(productAggregate, {
    page: Number(page),
    limit: Number(limit),
    customLabels: {
      totalDocs: "totalProducts",
      docs: "products",
    },
  });

  res.status(200).json({
    success: true,
    message: "Products fetched successfully",
    ...products,
  });
});

export const getProductById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Product ID" });
    }

    const product = await Product.findById(id).populate("collectionId");
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    res.status(200).json({
      success: true,
      message: "Product fetched successfully by ID",
      product,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Product ID" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedProduct)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      updatedProduct,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const productByCollectionId = async (
  req: Request<{ collectionId: string }>,
  res: Response
) => {
  const { collectionId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(collectionId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Collection ID" });
  }

  const productAggregate = Product.aggregate([
    {
      $match: {
        collectionId: new mongoose.Types.ObjectId(collectionId),
        isDeleted: false,
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  const products = await (Product as any).aggregatePaginate(productAggregate, {
    page: Number(page),
    limit: Number(limit),
    customLabels: {
      totalDocs: "totalProducts",
      docs: "products",
    },
  });

  res.status(200).json({
    success: true,
    message: "Products fetched successfully by Collection ID",
    ...products,
  });
};

export const deleteProduct = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Product ID" });
    }

    const deletedProduct = await Product.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    await Collection.findByIdAndUpdate(deletedProduct.collectionId, {
      $inc: { productCount: -1 },
    });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      deletedProduct,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
