import axios from 'axios';
import { Platform } from 'react-native';

// Configure base URL for different platforms
const getBaseURL = () => {
  if (__DEV__) {
    // Development URLs
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8000'; // Android emulator
    } else if (Platform.OS === 'ios') {
      return 'http://localhost:8000'; // iOS simulator
    } else {
      return 'http://localhost:8000'; // Web
    }
  } else {
    // Production URL - Replace with your actual server URL
    return 'https://your-api-server.com';
  }
};

// Create axios instance
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

class ApiService {
  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get API info
   */
  async getApiInfo() {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload and analyze video
   * @param {object} videoFile - The video file to analyze
   * @param {object} parameters - Analysis parameters
   * @param {function} onProgress - Progress callback
   */
  async analyzeVideo(videoFile, parameters = {}, onProgress = null) {
    try {
      const formData = new FormData();
      
      // Append video file
      formData.append('video', {
        uri: videoFile.uri,
        type: videoFile.type || 'video/mp4',
        name: videoFile.fileName || 'video.mp4',
      });

      // Append parameters as JSON string
      if (Object.keys(parameters).length > 0) {
        formData.append('parameters', JSON.stringify(parameters));
      }

      const response = await api.post('/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get analysis status
   * @param {string} analysisId - The analysis ID
   */
  async getAnalysisStatus(analysisId) {
    try {
      const response = await api.get(`/status/${analysisId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get analysis results
   * @param {string} analysisId - The analysis ID
   */
  async getAnalysisResults(analysisId) {
    try {
      const response = await api.get(`/results/${analysisId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Download analysis results
   * @param {string} analysisId - The analysis ID
   * @param {string} format - File format (json, csv, xlsx)
   */
  async downloadResults(analysisId, format = 'json') {
    try {
      const response = await api.get(`/download/${analysisId}`, {
        params: { format },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get analysis history
   */
  async getAnalysisHistory() {
    try {
      const response = await api.get('/history');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete analysis
   * @param {string} analysisId - The analysis ID
   */
  async deleteAnalysis(analysisId) {
    try {
      const response = await api.delete(`/delete/${analysisId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Poll analysis status until completion
   * @param {string} analysisId - The analysis ID
   * @param {function} onProgress - Progress callback
   * @param {number} interval - Polling interval in milliseconds
   */
  async pollAnalysisStatus(analysisId, onProgress = null, interval = 2000) {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await this.getAnalysisStatus(analysisId);
          
          if (onProgress) {
            onProgress(status);
          }

          if (status.status === 'completed') {
            resolve(status);
          } else if (status.status === 'failed') {
            reject(new Error(status.message || 'Analysis failed'));
          } else {
            // Continue polling
            setTimeout(poll, interval);
          }
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  /**
   * Upload video file with progress tracking
   * @param {object} videoFile - The video file
   * @param {function} onProgress - Progress callback
   */
  async uploadVideo(videoFile, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append('video', {
        uri: videoFile.uri,
        type: videoFile.type || 'video/mp4',
        name: videoFile.fileName || 'video.mp4',
      });

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get server statistics
   */
  async getStatistics() {
    try {
      const response = await api.get('/statistics');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Test connection to server
   */
  async testConnection() {
    try {
      const startTime = Date.now();
      await this.healthCheck();
      const endTime = Date.now();
      return {
        success: true,
        latency: endTime - startTime,
        message: 'Connection successful',
      };
    } catch (error) {
      return {
        success: false,
        latency: null,
        message: error.message || 'Connection failed',
      };
    }
  }

  /**
   * Handle API errors
   * @param {object} error - The error object
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      let message = data?.detail || data?.error || `HTTP ${status} Error`;
      
      switch (status) {
        case 400:
          message = data?.detail || 'Bad request - Please check your input';
          break;
        case 401:
          message = 'Unauthorized - Please check your credentials';
          break;
        case 403:
          message = 'Forbidden - You do not have permission';
          break;
        case 404:
          message = 'Resource not found';
          break;
        case 422:
          message = data?.detail || 'Validation error - Please check your input';
          break;
        case 500:
          message = 'Internal server error - Please try again later';
          break;
        case 502:
          message = 'Bad gateway - Server is temporarily unavailable';
          break;
        case 503:
          message = 'Service unavailable - Server is under maintenance';
          break;
        default:
          message = `Server error (${status}) - ${data?.detail || 'Unknown error'}`;
      }

      return new Error(message);
    } else if (error.request) {
      // Network error
      return new Error('Network error - Please check your internet connection');
    } else {
      // Other error
      return new Error(error.message || 'Unknown error occurred');
    }
  }

  /**
   * Cancel ongoing requests
   */
  cancelRequests() {
    // Create new axios instance to cancel all ongoing requests
    api.defaults.cancelToken = axios.CancelToken.source().token;
  }

  /**
   * Get current server URL
   */
  getServerURL() {
    return getBaseURL();
  }

  /**
   * Update server URL (for settings)
   * @param {string} newURL - New server URL
   */
  updateServerURL(newURL) {
    api.defaults.baseURL = newURL;
  }
}

// Export singleton instance
export default new ApiService();