import { Request, Response } from "express";
import User from "../models/user.schema";
import handler from "../services/handler";

export const getAllVendors = handler(async (_req: Request, res: Response) => {
  const vendors = await User.find({ role: "VENDOR" }).select(
    "name email isActive role"
  );
  res.status(200).json({ success: true, vendors });
});

export const activateVendor = handler(
  async (req: Request, res: Response) => {
    const { vendorId } = req.params;

    const vendor = await User.findByIdAndUpdate(
      vendorId,
      { isActive: true },
      { new: true }
    );

    if (!vendor)
      return res.status(404).json({ success: false, message: "Vendor not found" });

    res
      .status(200)
      .json({ success: true, message: "Vendor activated successfully", vendor });
  }
);

export const deactivateVendor = handler(
  async (req: Request, res: Response) => {
    const { vendorId } = req.params;

    const vendor = await User.findByIdAndUpdate(
      vendorId,
      { isActive: false },
      { new: true }
    );

    if (!vendor)
      return res.status(404).json({ success: false, message: "Vendor not found" });

    res
      .status(200)
      .json({ success: true, message: "Vendor deactivated successfully", vendor });
  }
);


