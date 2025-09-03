import { changePassword, addStudent } from "../controller/advisorController.js";
import express from "express";
import { authAdvisor } from "../middleware/auth.js";

const advisorRoutes = express.Router();

advisorRoutes.post("/addStudent", authAdvisor, addStudent); //authOfficial
advisorRoutes.post("/changePassword", authAdvisor, changePassword);

export default advisorRoutes;
