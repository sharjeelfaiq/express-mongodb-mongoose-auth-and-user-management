import multer from "multer";

import { storage } from "#config/index.js";

const knownFields = [
  { name: "profilePicture", maxCount: 1 },
];

// Add expected dynamic branch fields (assuming max 10 branches for safety)
// for (let i = 0; i < 10; i++) {
//   knownFields.push({
//     name: `branches[${i}][residenceGuidelines]`,
//     maxCount: 1,
//   });
// }

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields(knownFields);
