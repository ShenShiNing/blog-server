import User from "../models/user.model.js"
import Comment from "../models/comment.model.js"

export const getComments = async (req, res) => {
    const { postId } = req.params
    const comments = await Comment
        .find({ post: postId })
        .populate("user", "username imageUrl")
        .sort({ createdAt: -1 })
        
    res.status(200).json(comments)
}

export const createComment = async (req, res) => {
    const clerkId = req.auth.userId
    const postId = req.params.postId

    if (!clerkId) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    const user = await User.findOne({ clerkId })

    const newComment = new Comment({
        ...req.body,
        user: user._id,
        post: postId,
    })
    const comment = await newComment.save()

    res.status(201).json(comment)
}

export const deleteComment = async (req, res) => {
    const clerkId = req.auth.userId
    const commentId = req.params.commentId

    if (!clerkId) {
        return res.status(401).json({ message: "Unauthorized" })
    }
    const role = req.auth.sessionClaims.matadata?.role || "user" 
    if (role === "admin") {
        await Comment.findByIdAndDelete(commentId)
        return res.status(200).json("Comment deleted successfully")
    }

    const user = await User.findOne({ clerkId })

    const comment = await Comment.findByIdAndDelete({ 
        _id: commentId,
        user: user._id 
    })

    if (!comment) {
        return res.status(403).json({ message: "You can only delete your own comments" })
    }

    res.status(200).json({ message: "Comment deleted" })
}


