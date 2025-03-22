import express from "express"
import { getComments, createComment, deleteComment } from "../controllers/comment.controller.js"

const router = express.Router()

router.get("/:postId", getComments)
router.post("/:postId", createComment)
router.delete("/:commentId", deleteComment)

export default router
