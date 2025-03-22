import express from "express"
import { getUsersSavedPosts, updateUsersSavedPosts } from "../controllers/user.controller.js"

const router = express.Router()

router.get("/saved", getUsersSavedPosts)
router.patch("/saved", updateUsersSavedPosts)



export default router
