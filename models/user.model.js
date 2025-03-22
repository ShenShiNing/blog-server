import mongoose from "mongoose"
import { Schema } from "mongoose"

const userSchema = new Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    imageUrl: {
        type: String,
    },
    savedPosts: {
        type: [String],
        default: [],
    },
}, { timestamps: true })

export default mongoose.model("User", userSchema)
