import express from "express";
import { authOfficial } from "../middleware/auth.js";
import {
  addWarning,
  deleteWarning,
  editWarning,
  seeWarnings,
  seeAllStudents,
  changePassword,
} from "../controller/officialController.js";

const officialRoutes = express.Router();

officialRoutes.post("/addWarning", authOfficial, addWarning); //authOfficial
officialRoutes.delete("/deleteWarning/:risk_id", authOfficial, deleteWarning); //authOfficial
officialRoutes.get("/Warnings", authOfficial, seeWarnings); //authOfficial
officialRoutes.get("/seeAllStudents", authOfficial, seeAllStudents);
officialRoutes.put("/editWarning/:risk_id", authOfficial, editWarning);
officialRoutes.post("/changePassword", authOfficial, changePassword);
export default officialRoutes;
