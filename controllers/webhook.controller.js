import { Webhook } from "svix"
import User from "../models/user.model.js"

export const clerkWebHook = async (req, res) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
        return new Error("Webhook secret is not set")
    }

    const payload = req.body
    const headers = req.headers

    const wh = new Webhook(WEBHOOK_SECRET)
    let evt
    try {
        evt = wh.verify(payload, headers)
    } catch (err) {
        return res.status(400).json({ error: err.message })
    }

    if (evt.type === "user.created") {
        const newUser = new User({
            clerkId: evt.data.id,
            username: evt.data.username || evt.data.email_addresses[0].email_address,
            email: evt.data.email_addresses[0].email_address,
            imageUrl: evt.data.profile_image_url,
        })
        await newUser.save()
    }

    return res.status(200).json({ message: "Webhook received" })
}


