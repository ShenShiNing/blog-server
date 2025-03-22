import User from "../models/user.model.js"

export const getUsersSavedPosts = async (req, res) => {
    const clerkId = req.auth.userId

    if (!clerkId) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    const user = await User.findOne({ clerkId })

    res.status(200).json(user.savedPosts)
}

export const updateUsersSavedPosts = async (req, res) => {
    const clerkId = req.auth.userId
    const postId = req.body.postId

    if (!clerkId) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    const user = await User.findOne({ clerkId })
    
    const isSaved = user.savedPosts.some((post) => post === postId)

    if (!isSaved) {
        await User.findByIdAndUpdate(user._id, {
            $push: { savedPosts: postId }
        })
    } else {
        await User.findByIdAndUpdate(user._id, {
            $pull: { savedPosts: postId }
        })
    }

    return res.status(200).json({ message: isSaved ? "Post unsaved" : "Post saved" })
}

