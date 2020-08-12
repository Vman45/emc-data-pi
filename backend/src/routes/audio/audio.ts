import axios from "axios";
import express from "express";
import FormData from "form-data";
import fs from "fs";
import multer from "multer";
import path from "path";
import { BadRequestError } from "../../core/ApiError";
import { SuccessResponse } from "../../core/ApiResponse";
import asyncHandler from "../../helpers/asyncHandler";

const router = express.Router()

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./audio/")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage })

const CUR_DIR = path.join(process.cwd())

router.post("/", upload.single("audio"), asyncHandler(async (req, res, next) => {
    const file = req.file

    if (!file) throw new BadRequestError("No file provided")

    // Forward file to uni server
    try {
        const data = new FormData()
        data.append("audio", fs.createReadStream(path.join(CUR_DIR + "/" + file.path)))

        const config = {
            headers: {
                ...data.getHeaders()
            },
        };
        const res = await axios.post(`${process.env.UNI_SERVER_URL}/audio`, data, config)
    } catch (error) {
        console.log(error);
    }
    return new SuccessResponse("Success", file).send(res)
}),
)

export default router