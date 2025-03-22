import express from "express"
import { uploadAuth, getPosts, getPostBySlug, createPost, deletePost, featurePost, getFeaturedPosts } from "../controllers/post.controller.js"
import increaseVisit from "../middlewares/increaseVisit.js"
const router = express.Router()


router.get("/upload-auth",  uploadAuth)

router.get("/", getPosts)
router.get("/featured", getFeaturedPosts)
router.get("/:slug", increaseVisit, getPostBySlug)
router.post("/create", createPost)
router.delete("/delete/:id", deletePost)
router.patch("/feature/:id", featurePost)

export default router
 