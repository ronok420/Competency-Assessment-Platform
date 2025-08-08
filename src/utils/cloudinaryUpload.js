// Upload fabric image
import { cloudinaryUpload } from "../lib/cloudinaryUpload.js";
import fs from 'fs';
export const uploadFabricImage = async (file) => {
  try {
    const result = await cloudinaryUpload(file.path, 'fabrics');
    
    // Delete temporary file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    return { imageUrl: result.secure_url };
  } catch (error) {
    // Delete temporary file if upload fails
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw new Error('Image upload failed');
  }
};


export const uploadImages = async (files) => {
  const imageUrls = [];
  if (files && files.length > 0) {
    for (const file of files) {
      try {
        const uploadResult = await cloudinaryUpload(file.path, 'products');
        imageUrls.push(uploadResult.secure_url);
        
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (uploadError) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        throw new Error('Failed to upload product image');
      }
    }
  }
  return imageUrls;
};