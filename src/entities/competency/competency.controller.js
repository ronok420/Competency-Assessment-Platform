import { generateResponse } from '../../lib/responseFormate.js';
import {
  createCompetency,
  listCompetencies,
  getCompetencyById,
  updateCompetency,
  softDeleteCompetency,
} from './competency.service.js';

export const createCompetencyController = async (req, res) => {
  try {
    const { name, description, code } = req.body;
    if (!name || !description || !code) {
      return generateResponse(res, 400, false, 'name, description and code are required');
    }
    const item = await createCompetency({ name, description, code });
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


