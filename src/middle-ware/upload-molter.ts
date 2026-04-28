import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({ storage });

export default upload.fields([
  { name: "files" },
  { name: "thumbnail" },
  { name: "video" },
]);
