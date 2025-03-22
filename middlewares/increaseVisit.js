import Post from "../models/post.model.js"

const increaseVisit = async (req, res, next) => {
    const { slug } = req.params
    
    await Post.findOneAndUpdate({ slug }, { $inc: { visits: 1 } })
    
    next()
}

export default increaseVisit
