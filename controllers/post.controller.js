import ImageKit from "imagekit"
import Post from "../models/post.model.js"
import User from "../models/user.model.js"

const imagekit = new ImageKit({
    urlEndpoint: process.env.IK_URL_ENDPOINT,
    publicKey: process.env.IK_PUBLIC_KEY,
    privateKey: process.env.IK_PRIVATE_KEY,
})
export const uploadAuth = async (req, res) => {
    const result = imagekit.getAuthenticationParameters()
    res.send(result)
}

export const getPosts = async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5

    const query = {}
    const category = req.query.category
    const search = req.query.search
    const author = req.query.author
    const sort = req.query.sort

    if (category) {
        query.category = category
    }

    // 排序
    let sortQuery = { createdAt: -1 }
    if (sort) {
        switch (sort) {
            // 最新
            case "newest":
                sortQuery = { createdAt: -1 }
                break
            // 最旧
            case "oldest":
                sortQuery = { createdAt: 1 }
                break
            // 最受欢迎
            case "most-popular":
                sortQuery = { visits: -1 }
                break
            // 趋势
            case "trending":
                sortQuery = { visits: -1 }
                query.createdAt = {
                    $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)
                }
                break
            default:
                break
        }
    }

    // 搜索 标题、描述、类型、作者、内容
    if (search) {
        const posts = await Post.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            {
                $unwind: "$userInfo"
            },
            {
                $match: {
                    $or: [
                        { title: { $regex: search, $options: "i" } },
                        { description: { $regex: search, $options: "i" } },
                        { category: { $regex: search, $options: "i" } },
                        { content: { $regex: search, $options: "i" } },
                        { "userInfo.username": { $regex: search, $options: "i" } }
                    ]
                }
            },
            {
                $sort: sortQuery
            },
            {
                $skip: (page - 1) * limit
            },
            {
                $limit: limit
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    content: 1,
                    category: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    slug: 1,
                    imageUrl: 1,
                    isFeatured: 1,
                    visits: 1,
                    "user.username": "$userInfo.username"
                }
            }
        ])

        const totalPosts = await Post.countDocuments(query)
        const hasMore = page * limit < totalPosts

        return res.status(200).json({ posts, hasMore })
    }

    if (author) {
        const user = await User.findOne({ username: author }).select("_id")
        if (!user) {
            return res.status(404).json({ message: "Post not found" })
        }
        query.user = user._id
    }

    const posts = await Post
        .find(query)
        .sort(sortQuery)
        .populate("user", "username")
        .limit(limit)
        .skip((page - 1) * limit)

    const totalPosts = await Post.countDocuments()
    const hasMore = page * limit < totalPosts

    res.status(200).json({ posts, hasMore })
}

export const getPostBySlug = async (req, res) => {
    const { slug } = req.params
    const post = await Post.findOne({ slug }).populate("user", "username imageUrl")
    res.status(200).json(post)
}

export const createPost = async (req, res) => {
    const clerkId = req.auth.userId
    if (!clerkId) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    const user = await User.findOne({ clerkId })
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }

    let slugBase = req.body.title.toLowerCase().replace(/ /g, "-");  // 初始的slug基础 
    let slug = slugBase;  // 赋值给slug
    let counter = 2
    let existingPost = await Post.findOne({ slug })
    while (existingPost) {
        slug = `${slugBase}-${counter}`
        existingPost = await Post.findOne({ slug })
        counter++
    }

    let category = req.body.category || "general";
    const { category: _, ...restBody } = req.body;  // 排除 req.body 中的 category 字段
    const newPost = new Post({
        user: user._id,
        slug,
        category,
        ...restBody
    })
    const post = await newPost.save()
    res.status(200).json(post)
}

export const deletePost = async (req, res) => {
    const clerkId = req.auth.userId
    if (!clerkId) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    const role = req.auth.sessionClaims.matadata?.role || "user"
    if (role === "admin") {
        await Post.findByIdAndDelete(req.params.id)
        return res.status(200).json("Post deleted successfully")
    }

    const user = await User.findOne({ clerkId })
    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }

    const deletedPost = await Post.findByIdAndDelete({
        _id: req.params.id,
        user: user._id
    })
    if (!deletedPost) {
        return res.status(403).json({ message: "You can only delete your own posts" })
    }

    res.status(200).json("Post deleted successfully")
}

export const featurePost = async (req, res) => {
    const clerkId = req.auth.userId

    if (!clerkId) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    const role = req.auth.sessionClaims.metadata?.role || "user"

    if (role !== "admin") {
        return res.status(403).json({ message: "You can't feature posts" })
    }

    const post = await Post.findById(req.params.id)
    if (!post) {
        return res.status(404).json({ message: "Post not found" })
    }

    const isFeatured = post.isFeatured
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, { isFeatured: !isFeatured }, { new: true })

    res.status(200).json(updatedPost)
}

export const getFeaturedPosts = async (req, res) => {
    const posts = await Post.find({ isFeatured: true }).sort({ createdAt: -1 }).limit(4)
    res.status(200).json(posts)
}

