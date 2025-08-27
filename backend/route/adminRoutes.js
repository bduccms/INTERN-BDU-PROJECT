import express from "express";
import { authAdmin } from "../middleware/auth.js";
import {
  allWarnings,
  editOfficial,
  deleteOfficial,
  addOfficial,
  allClearances,
  totalOfficial,
} from "../controller/adminController.js";
const adminRoutes = express.Router();

adminRoutes.post("/addOfficial", addOfficial); //authAdmin
adminRoutes.put("/editOfficial/:official_id", authAdmin, editOfficial);
adminRoutes.delete("/deleteOfficial/:official_id", authAdmin, deleteOfficial);
adminRoutes.get("/seeWarnings", authAdmin, allWarnings);
adminRoutes.get("/seeClearances", authAdmin, allClearances);
adminRoutes.get("/totalOfficial", authAdmin, totalOfficial);

export default adminRoutes;
