// src/services/customFieldService.js
import { customFieldService as apiCustomFieldService } from './api';

const mapCustomFieldFromApi = (apiField) => {
  return {
    id: apiField.fieldId || apiField.customFieldId || apiField.id,  // Önce fieldId'yi kontrol et
    fieldId: apiField.fieldId, // Orijinal fieldId'yi de sakla
    name: apiField.fieldName || '',
    type: apiField.fieldType || 'text',
    description: apiField.description || '',
    required: apiField.required || false,
    searchable: apiField.searchable || true,
    options: apiField.options ? (
      typeof apiField.options === 'string' ? 
        apiField.options.split(',').map(opt => opt.trim()) : 
        apiField.options
    ) : [],
    defaultValue: apiField.defaultValue || '',
    issueTypes: apiField.issueTypes || [],
    projectId: apiField.projectId || 0,
    projects: apiField.projectId ? [apiField.projectId] : [],
    created: apiField.createdAt ? new Date(apiField.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    usage: apiField.usage || 0
  };
};

const mapCustomFieldToApi = (field) => {
  // Önce tüm gerekli alanların var olduğundan emin olun
  if (!field) {
    console.error('Cannot map undefined field to API format');
    return {};
  }
  
  console.log('Mapping field to API format:', field);
  
  // API'nin beklediği formatta veri oluştur
  return {
    fieldId: field.fieldId || field.id || null, // Önce fieldId, sonra id kullan
    projectId: field.projectId || 
              (field.projects && field.projects.length > 0 ? field.projects[0] : null),
    fieldName: field.name || '',
    fieldType: field.type || 'text',
    description: field.description || '',
    required: field.required === true, // Boolean olduğundan emin ol
    searchable: field.searchable !== false, // Default true
    options: ['select', 'multiselect', 'radio'].includes(field.type) 
      ? (Array.isArray(field.options) ? field.options.join(',') : field.options || '')
      : null,
    defaultValue: field.defaultValue || ''
  };
};

export const customFieldService = {
  getAll: async () => {
    try {
      const response = await apiCustomFieldService.getAll();
      
      // API yanıtını kontrol et
      if (!response || !response.data) {
        console.error('Invalid API response:', response);
        return { data: [] };
      }
      
      const fields = Array.isArray(response.data) ? response.data : [response.data];
      
      // Her alanı dönüştür
      return {
        data: fields.map(field => mapCustomFieldFromApi(field))
      };
    } catch (error) {
      console.error('Error fetching custom fields:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await apiCustomFieldService.getById(id);
      if (!response || !response.data) {
        return null;
      }
      return mapCustomFieldFromApi(response.data);
    } catch (error) {
      console.error(`Error fetching custom field with id ${id}:`, error);
      throw error;
    }
  },
  
  create: async (fieldData) => {
    try {
      const apiData = mapCustomFieldToApi(fieldData);
      const response = await apiCustomFieldService.create(apiData);
      if (!response || !response.data) {
        throw new Error('Failed to create custom field');
      }
      return { 
        success: true, 
        data: mapCustomFieldFromApi(response.data) 
      };
    } catch (error) {
      console.error('Error creating custom field:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create custom field' 
      };
    }
  },
  
  update: async (id, fieldData) => {
    try {
      // Önce id'nin tanımlı olduğunu kontrol et
      if (!id) {
        console.error('Update operation failed: ID is undefined');
        return { 
          success: false, 
          error: 'Invalid ID provided for update' 
        };
      }
      
      console.log(`Updating custom field with ID: ${id}`, fieldData);
      
      // API'ye gönderilecek veriyi hazırla
      const apiData = mapCustomFieldToApi({ 
        ...fieldData,
        fieldId: id // fieldId'yi açıkça belirt
      });
      
      console.log('Data being sent to API:', apiData);
      
      // API çağrısı
      const response = await apiCustomFieldService.update(id, apiData);
      
      if (!response) {
        throw new Error('No response received from API');
      }
      
      return { 
        success: true, 
        data: response.data ? mapCustomFieldFromApi(response.data) : null
      };
    } catch (error) {
      console.error(`Error updating custom field with id ${id}:`, error);
      return { 
        success: false, 
        error: error.message || 'Failed to update custom field' 
      };
    }
  },
  
  delete: async (id) => {
    try {
      if (!id) {
        console.error('Delete operation failed: ID is undefined');
        return { 
          success: false, 
          error: 'Invalid ID provided for deletion' 
        };
      }
      
      console.log(`Sending delete request for custom field with ID: ${id}`);
      // API'nin beklediği endpoint formatını kullanın
      await apiCustomFieldService.delete(`${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting custom field with id ${id}:`, error);
      return { 
        success: false, 
        error: error.message || 'Failed to delete custom field' 
      };
    }
  }
};
