import express from "express";
import { authAdmin } from "../middleware/auth.js";
import {
  allWarnings,
  editOfficial,
  deleteOfficial,
  addOfficial,
  allClearances,
  totalOfficial,
  addAdvisor,
  editAdvisor,
  deleteAdvisor,
  totalAdvisor,
} from "../controller/adminController.js";
const adminRoutes = express.Router();

adminRoutes.post("/addOfficial", addOfficial);
adminRoutes.post("/addAdvisor", addAdvisor);
adminRoutes.put("/editOfficial/:official_id", authAdmin, editOfficial);
adminRoutes.put("/editAdvisor/:advisor_id", authAdmin, editAdvisor);
adminRoutes.delete("/deleteOfficial/:official_id", authAdmin, deleteOfficial);
adminRoutes.delete("/deleteAdvisor/:advisor_id", authAdmin, deleteAdvisor);
adminRoutes.get("/seeWarnings", authAdmin, allWarnings);
adminRoutes.get("/seeClearances", authAdmin, allClearances);
adminRoutes.get("/totalOfficial", authAdmin, totalOfficial);
adminRoutes.get("/totalAdvisor", authAdmin, totalAdvisor);

export default adminRoutes;
