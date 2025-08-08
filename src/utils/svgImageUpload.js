import path from 'path';
import { readFile } from 'fs/promises';
import { uploadImages } from './cloudinaryUpload.js';

const uploadPath = path.join(process.cwd(), 'uploads', 'images');

export const isSVG = (filename) => {
  return filename && filename.toLowerCase().endsWith('.svg');
};

export const getSVGIfExists = async (imagePath) => {
  if (imagePath && imagePath.endsWith('.svg')) {
    try {
      const filePath = path.join(uploadPath, path.basename(imagePath));
      return await readFile(filePath, 'utf-8');
    } catch {
      return null;
    }
  }
  return null;
};

export const generateThumbnailPath = (files) => {
  if (!files?.thumbnail?.length) return null;
  return `/uploads/images/${files.thumbnail[0].filename}`;
};

export const validateSVGFiles = (files = []) => {
  for (let file of files) {
    if (!isSVG(file.filename)) {
      throw new Error('Only SVG files are allowed');
    }
  }
};

export const buildTypesArray = async (types, files = []) => {
  return await Promise.all(
    types.map(async (type, i) => {
      const image = `/uploads/images/${files[i]?.filename || ''}`;
      const imageSvg = await getSVGIfExists(image);
      return {
        name: type.name,
        image,
        imageSvg
      };
    })
  );
};

export const processProductImages = async (files, type) => {
  if (!files || !files.length) return { images: [], svgImages: [] };
  if (type === 'CUSTOMIZABLE') {
    const images = [];
    const svgImages = [];
    for (const file of files) {
      const imagePath = `/uploads/images/${file.filename}`;
      if (!isSVG(file.filename)) throw new Error('Only SVG files are allowed for CUSTOMIZABLE products');
      images.push(imagePath);
      svgImages.push(await getSVGIfExists(imagePath));
    }
    return { images, svgImages };
  } else {
    // Use cloudinary for non-customizable
    const images = await uploadImages(files);
    return { images, svgImages: [] };
  }
};