import { generateResponse } from "../../lib/responseFormate.js";
import { 
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage
} from "./category.service.js";

// Get all categories with pagination and filtering
export const getAllCategoriesController = async (req, res) => {
  try {
    const { page, limit, search, type } = req.query;
    const { categories, paginationInfo } = await getAllCategories({ 
      page: parseInt(page) || 1, 
      limit: parseInt(limit) || 10, 
      search, 
      type
    });
    
    generateResponse(res, 200, true, 'Categories fetched successfully', { 
      categories, 
      pagination: paginationInfo 
    });
  } catch (error) {
    generateResponse(res, 500, false, 'Failed to fetch categories', null, error.message);
  }
};

// Get category by ID
export const getCategoryByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await getCategoryById(id);
    
    generateResponse(res, 200, true, 'Category fetched successfully', category);
  } catch (error) {
    if (error.message === 'Category not found') {
      generateResponse(res, 404, false, 'Category not found', null);
    } else {
      generateResponse(res, 500, false, 'Failed to fetch category', null, error.message);
    }
  }
};

// Create new category
export const createCategoryController = async (req, res) => {
  try {
    const { name, description, fabrics, accents, styles } = req.body;
    const createdBy = req.user._id;
    
    // Validate required fields
    if (!name || !description) {
      return generateResponse(res, 400, false, 'Name and description are required', null);
    }
    
    // Check if image file is provided
    if (!req.files || !req.files.image || req.files.image.length === 0) {
      return generateResponse(res, 400, false, 'Image file is required', null);
    }
    
    let imageUrl = null;
    try {
      const uploadResult = await uploadCategoryImage(req.files.image[0]);
      imageUrl = uploadResult.imageUrl;
    } catch (uploadError) {
      console.error('Image upload error:', uploadError);
      return generateResponse(res, 500, false, 'Failed to upload image', null, uploadError.message);
    }
    
    // Parse arrays from form data
    let parsedFabrics = [];
    let parsedAccents = [];
    let parsedStyles = [];
    
    // Handle fabrics array
    if (fabrics) {
      if (typeof fabrics === 'string') {
        try {
          parsedFabrics = JSON.parse(fabrics);
        } catch (error) {
          // If JSON parsing fails, treat as single value or comma-separated
          parsedFabrics = fabrics.includes(',') ? fabrics.split(',').map(id => id.trim()) : [fabrics];
        }
      } else if (Array.isArray(fabrics)) {
        parsedFabrics = fabrics;
      }
    }
    
    // Handle accents array
    if (accents) {
      if (typeof accents === 'string') {
        try {
          parsedAccents = JSON.parse(accents);
        } catch (error) {
          parsedAccents = accents.includes(',') ? accents.split(',').map(id => id.trim()) : [accents];
        }
      } else if (Array.isArray(accents)) {
        parsedAccents = accents;
      }
    }
    
    // Handle styles array
    if (styles) {
      if (typeof styles === 'string') {
        try {
          parsedStyles = JSON.parse(styles);
        } catch (error) {
          parsedStyles = styles.includes(',') ? styles.split(',').map(id => id.trim()) : [styles];
        }
      } else if (Array.isArray(styles)) {
        parsedStyles = styles;
      }
    }
    
    const category = await createCategory(
      { 
        name, 
        description, 
        image: imageUrl, 
        fabrics: parsedFabrics, 
        accents: parsedAccents, 
        styles: parsedStyles 
      },
      createdBy
    );
    
    generateResponse(res, 201, true, 'Category created successfully', category);
  } catch (error) {
    console.error('Category creation error:', error);
    if (error.message === 'Category with this name already exists') {
      generateResponse(res, 409, false, 'Category with this name already exists', null);
    } else if (error.message.includes('Fabric with ID') || error.message.includes('Accent with ID') || error.message.includes('Style with ID')) {
      generateResponse(res, 404, false, error.message, null);
    } else {
      generateResponse(res, 500, false, 'Failed to create category', null, error.message);
    }
  }
};

// Update category
export const updateCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const updatedBy = req.user._id;
    
    // Handle image upload if file is provided
    if (req.files && req.files.image && req.files.image.length > 0) {
      try {
        const uploadResult = await uploadCategoryImage(req.files.image[0]);
        updateData.image = uploadResult.imageUrl;
      } catch (uploadError) {
        return generateResponse(res, 500, false, 'Failed to upload image', null, uploadError.message);
      }
    }
    
    // Parse arrays from form data
    const { fabrics, accents, styles } = updateData;
    
    // Handle fabrics array
    if (fabrics) {
      if (typeof fabrics === 'string') {
        try {
          updateData.fabrics = JSON.parse(fabrics);
        } catch (error) {
          updateData.fabrics = fabrics.includes(',') ? fabrics.split(',').map(id => id.trim()) : [fabrics];
        }
      }
    }
    
    // Handle accents array
    if (accents) {
      if (typeof accents === 'string') {
        try {
          updateData.accents = JSON.parse(accents);
        } catch (error) {
          updateData.accents = accents.includes(',') ? accents.split(',').map(id => id.trim()) : [accents];
        }
      }
    }
    
    // Handle styles array
    if (styles) {
      if (typeof styles === 'string') {
        try {
          updateData.styles = JSON.parse(styles);
        } catch (error) {
          updateData.styles = styles.includes(',') ? styles.split(',').map(id => id.trim()) : [styles];
        }
      }
    }
    
    const category = await updateCategory(id, updateData, updatedBy);
    
    generateResponse(res, 200, true, 'Category updated successfully', category);
  } catch (error) {
    if (error.message === 'Category not found') {
      generateResponse(res, 404, false, 'Category not found', null);
    } else if (error.message === 'Category with this name already exists') {
      generateResponse(res, 409, false, 'Category with this name already exists', null);
    } else if (error.message.includes('Fabric with ID') || error.message.includes('Accent with ID') || error.message.includes('Style with ID')) {
      generateResponse(res, 404, false, error.message, null);
    } else {
      generateResponse(res, 500, false, 'Failed to update category', null, error.message);
    }
  }
};

// Delete category
export const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteCategory(id);
    
    generateResponse(res, 200, true, result.message, null);
  } catch (error) {
    if (error.message === 'Category not found') {
      generateResponse(res, 404, false, 'Category not found', null);
    } else if (error.message.includes('Cannot delete category')) {
      generateResponse(res, 400, false, error.message, null);
    } else {
      generateResponse(res, 500, false, 'Failed to delete category', null, error.message);
    }
  }
}; 