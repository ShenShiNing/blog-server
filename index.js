import cors from "cors"
import express from "express"
import connectDB from "./lib/connectDB.js"
import userRoute from "./routes/user.route.js"
import postRoute from "./routes/post.route.js"
import commentRoute from "./routes/comment.route.js"
import webhookRoute from "./routes/webhook.route.js"
import { clerkMiddleware } from "@clerk/express"


const app = express()

app.use(cors(process.env.CLIENT_URL))

app.use(clerkMiddleware())
app.use("/webhook", webhookRoute)

app.use(express.json())

app.use("/users", userRoute)
app.use("/posts", postRoute)
app.use("/comments", commentRoute)

app.use((error, req, res, next) => {
    res.status(error.status || 500)

    res.json({
        message: error.message || "Internal server error",
        status: error.status || 500,
        stack: error.stack || null,
    })
})

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    )
    next()
})

app.listen(3000, () => {
    connectDB()
    console.log("Server is running on port 3000")
})
