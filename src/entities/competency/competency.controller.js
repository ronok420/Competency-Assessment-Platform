import { generateResponse } from '../../lib/responseFormate.js';
import {
  createCompetency,
  listCompetencies,
  getCompetencyById,
  updateCompetency,
  softDeleteCompetency,
  bulkCreateCompetencies,
  parseBulkCompetenciesJsonFile,
  parseBulkCompetenciesCsvFile,
} from './competency.service.js';
import fs from 'fs';

export const createCompetencyController = async (req, res) => {
  try {
    const { name, description, code } = req.body;
    if (!name || !description || !code) {
      return generateResponse(res, 400, false, 'name, description and code are required');
    }
    const normalizedCode = String(code).trim().toUpperCase();
    const item = await createCompetency({ name, description, code: normalizedCode });
    return generateResponse(res, 201, true, 'Competency created successfully', item);
  } catch (error) {
    return generateResponse(res, 500, false, error.message || 'Failed to create competency');
  }
};

export const listCompetenciesController = async (req, res) => {
  try {
    const { page, limit, search, isActive, date } = req.query;
    const { items, paginationInfo } = await listCompetencies({ page, limit, search, isActive, date });
    return generateResponse(res, 200, true, 'Competencies fetched successfully', { items, paginationInfo });
  } catch (error) {
    return generateResponse(res, 500, false, error.message || 'Failed to fetch competencies');
  }
};

export const getCompetencyByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getCompetencyById(id);
    return generateResponse(res, 200, true, 'Competency fetched successfully', item);
  } catch (error) {
    const status = /not found/i.test(error.message) ? 404 : 500;
    return generateResponse(res, status, false, error.message || 'Failed to fetch competency');
  }
};

export const updateCompetencyController = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await updateCompetency(id, req.body);
    return generateResponse(res, 200, true, 'Competency updated successfully', item);
  } catch (error) {
    const status = /not found/i.test(error.message) ? 404 : 500;
    return generateResponse(res, status, false, error.message || 'Failed to update competency');
  }
};

export const deleteCompetencyController = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await softDeleteCompetency(id);
    return generateResponse(res, 200, true, 'Competency deactivated successfully', item);
  } catch (error) {
    const status = /not found/i.test(error.message) ? 404 : 500;
    return generateResponse(res, status, false, error.message || 'Failed to deactivate competency');
  }
};

export const bulkUploadCompetenciesController = async (req, res) => {
  try {
    let items;
    if (req.files && req.files.file && req.files.file[0]) {
      const file = req.files.file[0];
      if (file.mimetype === 'text/csv' || file.originalname.toLowerCase().endsWith('.csv')) {
        items = await parseBulkCompetenciesCsvFile(file.path);
      } else {
        items = await parseBulkCompetenciesJsonFile(file.path);
      }
      fs.unlink(file.path, () => {});
    } else if (Array.isArray(req.body)) {
      items = req.body;
    } else if (req.body && req.body.items) {
      items = req.body.items;
    } else {
      return generateResponse(res, 400, false, 'Provide items array in body or upload a JSON file in field "file"');
    }

    const result = await bulkCreateCompetencies(items);
    const httpStatus = result.errors.length ? 207 : 201;
    return generateResponse(res, httpStatus, true, 'Bulk competencies upload processed', result);
  } catch (error) {
    return generateResponse(res, 500, false, error.message || 'Failed to process bulk competencies upload');
  }
};


