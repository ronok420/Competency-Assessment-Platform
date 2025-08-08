import { createFilter, createPaginationInfo } from "../../lib/pagination.js";
import Category from "./category.model.js";
import { cloudinaryUpload } from "../../lib/cloudinaryUpload.js";
import mongoose from "mongoose";
import fs from "fs";

// Get all categories with pagination and filtering
export const getAllCategories = async ({ page = 1, limit = 10, search, type }) => {
  const filter = createFilter(search, null, ['name', 'description']);
  
  // Add type filter if provided
  if (type) {
    filter.type = type;
  }
  
  const totalCategories = await Category.countDocuments(filter);
  const categories = await Category.find(filter)
    .populate('fabrics', 'name type color price')
    .populate('accents', 'name price types')
    .populate('styles', 'name price types')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const paginationInfo = createPaginationInfo(page, limit, totalCategories);
  return { categories, paginationInfo };
};

// Get category by ID
export const getCategoryById = async (id) => {
  const category = await Category.findById(id)
    .populate('fabrics', 'name type color price image')
    .populate('accents', 'name price types')
    .populate('styles', 'name price types');
  
  if (!category) {
    throw new Error('Category not found');
  }
  
  return category;
};

// Create new category
export const createCategory = async (categoryData, createdBy) => {
  const { name, description, image, fabrics, accents, styles } = categoryData;

  // Check if category name already exists
  const existingCategory = await Category.findOne({ name: name.trim() });
  if (existingCategory) {
    throw new Error('Category with this name already exists');
  }
  
  // Validate fabrics if provided
  if (fabrics && fabrics.length > 0) {
    const Fabric = mongoose.model('Fabric');
    for (const fabricId of fabrics) {
      const fabric = await Fabric.findById(fabricId);
      if (!fabric) {
        throw new Error(`Fabric with ID ${fabricId} not found`);
      }
    }
  }
  
  // Validate accents if provided
  if (accents && accents.length > 0) {
    const Accent = mongoose.model('Accent');
    for (const accentId of accents) {
      const accent = await Accent.findById(accentId);
      if (!accent) {
        throw new Error(`Accent with ID ${accentId} not found`);
      }
    }
  }
  
  // Validate styles if provided
  if (styles && styles.length > 0) {
    const Style = mongoose.model('Style');
    for (const styleId of styles) {
      const style = await Style.findById(styleId);
      if (!style) {
        throw new Error(`Style with ID ${styleId} not found`);
      }
    }
  }
  
  // Create category
  const category = new Category({
    name: name.trim(),
    description: description.trim(),
    createdBy,
    image,
    fabrics: fabrics || [],
    accents: accents || [],
    styles: styles || [],
  });
  
  await category.save();
  return category;
};

// Update category
export const updateCategory = async (id, updateData, updatedBy) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new Error('Category not found');
  }
  
  const { name, description, image, fabrics, accents, styles } = updateData;
  
  // Check if name is being changed and if it conflicts with existing category
  if (name && name.trim() !== category.name) {
    const existingCategory = await Category.findOne({ 
      name: name.trim(), 
      _id: { $ne: id } 
    });
    if (existingCategory) {
      throw new Error('Category with this name already exists');
    }
    category.name = name.trim();
  }
  
  // Validate fabrics if provided
  if (fabrics && fabrics.length > 0) {
    const Fabric = mongoose.model('Fabric');
    for (const fabricId of fabrics) {
      const fabric = await Fabric.findById(fabricId);
      if (!fabric) {
        throw new Error(`Fabric with ID ${fabricId} not found`);
      }
    }
  }
  
  // Validate accents if provided
  if (accents && accents.length > 0) {
    const Accent = mongoose.model('Accent');
    for (const accentId of accents) {
      const accent = await Accent.findById(accentId);
      if (!accent) {
        throw new Error(`Accent with ID ${accentId} not found`);
      }
    }
  }
  
  // Validate styles if provided
  if (styles && styles.length > 0) {
    const Style = mongoose.model('Style');
    for (const styleId of styles) {
      const style = await Style.findById(styleId);
      if (!style) {
        throw new Error(`Style with ID ${styleId} not found`);
      }
    }
  }
  
  // Update other fields
  if (description !== undefined) category.description = description.trim();
  if (image !== undefined) category.image = image;
  if (fabrics !== undefined) category.fabrics = fabrics;
  if (accents !== undefined) category.accents = accents;
  if (styles !== undefined) category.styles = styles;
  
  await category.save();
  
  // Populate references before returning
  await category.populate([
    { path: 'fabrics', select: 'name type color price image' },
    { path: 'accents', select: 'name price types' },
    { path: 'styles', select: 'name price types' }
  ]);
  
  return category;
};

// Delete category
export const deleteCategory = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new Error('Category not found');
  }
  
  // Check if category has products
  const Product = mongoose.model('Product');
  const productCount = await Product.countDocuments({ category: id });
  if (productCount > 0) {
    throw new Error('Cannot delete category with products. Please move or delete products first.');
  }
  
  await Category.findByIdAndDelete(id);
  return { message: 'Category deleted successfully' };
};

// Upload category image
export const uploadCategoryImage = async (file) => {
  try {
    const result = await cloudinaryUpload(file.path, 'categories');
    
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