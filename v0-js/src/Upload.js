// // routes/resource.js
// require("dotenv").config();

// console.log("Cloudinary Config:", {
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET ? "***" : null, // Hide secret in log
// });

// const express = require("express");
// const multer = require("multer");
// const { v2: cloudinary } = require("cloudinary");
// const router = express.Router();
// const Resource = require("./modules/resource");
// const connectDB = require("./utility/connectDb");
// console.log(
//   " 1 lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllele"
// );
// // Configure Cloudinary using your environment variables
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Use memory storage to get file buffers instead of saving files locally
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // Helper function to upload a file buffer to Cloudinary
// const uploadBufferToCloudinary = (fileBuffer, folder = "default") => {
//   console.log(
//     " 1 lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllele"
//   );
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       { folder, resource_type: "auto" }, // "auto" handles images, PDFs, audio, etc.
//       (error, result) => {
//         if (result) {
//           resolve(result);
//         } else {
//           reject(error);
//         }
//       }
//     );
//     stream.end(fileBuffer);
//   });
// };

// // POST /upload endpoint
// router.post(
//   "/upload",
//   upload.fields([{ name: "files" }, { name: "thumbnail" }]),
//   async (req, res) => {
//     const { files, body } = req;
//     console.log("Incoming Body:", body);

//     await connectDB();

//     try {
//       console.log(
//         " 2 lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllele"
//       );
//       // Process thumbnail upload (if provided)
//       let thumbnailUrl = "";
//       if (files.thumbnail && files.thumbnail.length > 0) {
//         const thumbnailUploadResult = await uploadBufferToCloudinary(
//           files.thumbnail[0].buffer,
//           "thumbnails"
//         );
//         thumbnailUrl = thumbnailUploadResult.secure_url;
//       }

//       // Process general files upload (if provided)
//       let resources = [];
//       if (files.files && files.files.length > 0) {
//         console.log(
//           " 3 lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllele"
//         );
//         resources = await Promise.all(
//           files.files.map(async (file) => {
//             const result = await uploadBufferToCloudinary(
//               file.buffer,
//               "resources"
//             );
//             console.log("Uploaded file:", file.originalname);
//             return {
//               url: result.secure_url,
//               type: file.mimetype, // use file.mimetype (not result.mimetype, which Cloudinary doesn’t return)
//             };
//           })
//         );
//       }
//       console.log(
//         " 4 lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllele"
//       );
//       // Save resource in MongoDB
//       const newResource = new Resource({
//         header: body.title,
//         description: body.description,
//         type: body.type,
//         thumbnail: thumbnailUrl,
//         gallery: resources,
//         views: 0,
//         state: body.state,
//         adress: body.adress,
//         landmark: body.adress,
//       });

//       const resource = await newResource.save();
//       console.log("✅ Uploaded resource:", resource);

//       res
//         .status(200)
//         .json({ message: "Resource uploaded successfully!", resource });
//     } catch (error) {
//       console.log(
//         " 5 lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllele"
//       );
//       console.error("❌ Error handling upload:", error);
//       res.status(500).json({
//         message: "Failed to upload resource.",
//         error: error.message,
//       });
//     }
//   }
// );

// module.exports = router;
