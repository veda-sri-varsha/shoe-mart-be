import { Request, Response } from "express";
import Collection from "../models/collection.schema";
import handler from "../services/handler";

export const createCollection = handler(async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide name" });
  }

  const newCollection = await Collection.create({ name });
  
  res.status(201).json({
    success: true,
    message: "Collection created successfully",
    collection: {
      id: newCollection._id,
      name: newCollection.name,
      isActive: newCollection.isActive,
      productCount: newCollection.productCount,
    },
  });
});

export const updateCollection = handler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide name" });
  }

  const collection = await Collection.findByIdAndUpdate(
    id,
    { name },
    { new: true }
  );

  if (!collection) {
    return res
      .status(404)
      .json({ success: false, message: "Collection not found" });
  }

  res.status(200).json({
    success: true,
    message: "Collection updated successfully",
    collection: {
      id: collection._id,
      name: collection.name,
      isActive: collection.isActive,
      productCount: collection.productCount,
    },
  });
});

export const deleteCollection = handler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const deletedCollection = await Collection.findByIdAndDelete(id);

  if (!deletedCollection) {
    return res.status(404).json({
      success: false,
      message: "Collection not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Collection deleted successfully",
    collection: {
      id: deletedCollection._id,
      name: deletedCollection.name,
      isActive: deletedCollection.isActive,
    },
  });
});

export const getAllCollections = handler(
  async (req: Request, res: Response) => {
    const collections = await Collection.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "All Collections fetched successfully",
      count: collections.length,
      collections: collections.map((col) => ({
        id: col._id,
        name: col.name,
        isActive: col.isActive,
        productCount: col.productCount,
        createdAt: col.createdAt,
        updatedAt: col.updatedAt,
      })),
    });
  }
);
