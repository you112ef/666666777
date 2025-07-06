import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './apiService';

// Initial state
const initialState = {
  analyses: [],
  currentAnalysis: null,
  analysisHistory: [],
  loading: false,
  error: null,
  serverStatus: 'unknown', // unknown, online, offline
  statistics: null,
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_ANALYSES: 'SET_ANALYSES',
  ADD_ANALYSIS: 'ADD_ANALYSIS',
  UPDATE_ANALYSIS: 'UPDATE_ANALYSIS',
  DELETE_ANALYSIS: 'DELETE_ANALYSIS',
  SET_CURRENT_ANALYSIS: 'SET_CURRENT_ANALYSIS',
  SET_ANALYSIS_HISTORY: 'SET_ANALYSIS_HISTORY',
  SET_SERVER_STATUS: 'SET_SERVER_STATUS',
  SET_STATISTICS: 'SET_STATISTICS',
  RESET_STATE: 'RESET_STATE',
};

// Reducer function
const analysisReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };

    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };

    case ActionTypes.SET_ANALYSES:
      return { ...state, analyses: action.payload };

    case ActionTypes.ADD_ANALYSIS:
      return {
        ...state,
        analyses: [action.payload, ...state.analyses],
        currentAnalysis: action.payload,
      };

    case ActionTypes.UPDATE_ANALYSIS:
      return {
        ...state,
        analyses: state.analyses.map(analysis =>
          analysis.id === action.payload.id ? { ...analysis, ...action.payload } : analysis
        ),
        currentAnalysis:
          state.currentAnalysis?.id === action.payload.id
            ? { ...state.currentAnalysis, ...action.payload }
            : state.currentAnalysis,
      };

    case ActionTypes.DELETE_ANALYSIS:
      return {
        ...state,
        analyses: state.analyses.filter(analysis => analysis.id !== action.payload),
        currentAnalysis:
          state.currentAnalysis?.id === action.payload ? null : state.currentAnalysis,
      };

    case ActionTypes.SET_CURRENT_ANALYSIS:
      return { ...state, currentAnalysis: action.payload };

    case ActionTypes.SET_ANALYSIS_HISTORY:
      return { ...state, analysisHistory: action.payload };

    case ActionTypes.SET_SERVER_STATUS:
      return { ...state, serverStatus: action.payload };

    case ActionTypes.SET_STATISTICS:
      return { ...state, statistics: action.payload };

    case ActionTypes.RESET_STATE:
      return { ...initialState };

    default:
      return state;
  }
};

// Create context
const AnalysisContext = createContext();

// Context provider component
export const AnalysisProvider = ({ children }) => {
  const [state, dispatch] = useReducer(analysisReducer, initialState);

  // Load saved data on startup
  useEffect(() => {
    loadSavedData();
    checkServerStatus();
  }, []);

  // Save data when state changes
  useEffect(() => {
    saveDataToStorage();
  }, [state.analyses, state.analysisHistory]);

  // Load data from AsyncStorage
  const loadSavedData = async () => {
    try {
      const savedAnalyses = await AsyncStorage.getItem('sperm_analyses');
      const savedHistory = await AsyncStorage.getItem('sperm_history');

      if (savedAnalyses) {
        dispatch({ type: ActionTypes.SET_ANALYSES, payload: JSON.parse(savedAnalyses) });
      }

      if (savedHistory) {
        dispatch({ type: ActionTypes.SET_ANALYSIS_HISTORY, payload: JSON.parse(savedHistory) });
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  // Save data to AsyncStorage
  const saveDataToStorage = async () => {
    try {
      await AsyncStorage.setItem('sperm_analyses', JSON.stringify(state.analyses));
      await AsyncStorage.setItem('sperm_history', JSON.stringify(state.analysisHistory));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Check server status
  const checkServerStatus = async () => {
    try {
      const result = await apiService.testConnection();
      dispatch({
        type: ActionTypes.SET_SERVER_STATUS,
        payload: result.success ? 'online' : 'offline',
      });
    } catch (error) {
      dispatch({ type: ActionTypes.SET_SERVER_STATUS, payload: 'offline' });
    }
  };

  // Actions
  const actions = {
    // Set loading state
    setLoading: (loading) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
    },

    // Set error
    setError: (error) => {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    },

    // Clear error
    clearError: () => {
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    },

    // Start new analysis
    startAnalysis: async (videoFile, parameters = {}) => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        dispatch({ type: ActionTypes.CLEAR_ERROR });

        // Create analysis object
        const analysis = {
          id: Date.now().toString(),
          status: 'pending',
          createdAt: new Date().toISOString(),
          videoFile,
          parameters,
          progress: 0,
          message: 'Uploading video...',
        };

        // Add to state
        dispatch({ type: ActionTypes.ADD_ANALYSIS, payload: analysis });

        // Start analysis via API
        const response = await apiService.analyzeVideo(
          videoFile,
          parameters,
          (progress) => {
            actions.updateAnalysisProgress(analysis.id, progress, 'Uploading video...');
          }
        );

        // Update with server response
        const updatedAnalysis = {
          ...analysis,
          serverId: response.analysis_id,
          status: 'processing',
          message: response.message,
          estimatedTime: response.estimated_time,
        };

        dispatch({ type: ActionTypes.UPDATE_ANALYSIS, payload: updatedAnalysis });

        // Start polling for status
        actions.pollAnalysisStatus(response.analysis_id, analysis.id);

        return updatedAnalysis;
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        // Update analysis status to failed
        const failedAnalysis = {
          id: analysis?.id,
          status: 'failed',
          error: error.message,
        };
        dispatch({ type: ActionTypes.UPDATE_ANALYSIS, payload: failedAnalysis });
        throw error;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    },

    // Poll analysis status
    pollAnalysisStatus: async (serverId, localId) => {
      try {
        await apiService.pollAnalysisStatus(
          serverId,
          (status) => {
            // Update local analysis with server status
            const updatedAnalysis = {
              id: localId,
              status: status.status,
              progress: status.progress || 0,
              message: status.message || '',
              updatedAt: new Date().toISOString(),
            };
            dispatch({ type: ActionTypes.UPDATE_ANALYSIS, payload: updatedAnalysis });
          }
        );

        // Analysis completed, fetch results
        const results = await apiService.getAnalysisResults(serverId);
        
        const completedAnalysis = {
          id: localId,
          status: 'completed',
          progress: 100,
          message: 'Analysis completed successfully',
          results,
          completedAt: new Date().toISOString(),
        };

        dispatch({ type: ActionTypes.UPDATE_ANALYSIS, payload: completedAnalysis });
      } catch (error) {
        const failedAnalysis = {
          id: localId,
          status: 'failed',
          error: error.message,
          updatedAt: new Date().toISOString(),
        };
        dispatch({ type: ActionTypes.UPDATE_ANALYSIS, payload: failedAnalysis });
      }
    },

    // Update analysis progress
    updateAnalysisProgress: (analysisId, progress, message) => {
      const updatedAnalysis = {
        id: analysisId,
        progress,
        message,
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: ActionTypes.UPDATE_ANALYSIS, payload: updatedAnalysis });
    },

    // Set current analysis
    setCurrentAnalysis: (analysis) => {
      dispatch({ type: ActionTypes.SET_CURRENT_ANALYSIS, payload: analysis });
    },

    // Get analysis results
    getAnalysisResults: async (analysisId) => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        const analysis = state.analyses.find(a => a.id === analysisId);
        
        if (analysis?.serverId) {
          const results = await apiService.getAnalysisResults(analysis.serverId);
          const updatedAnalysis = {
            id: analysisId,
            results,
          };
          dispatch({ type: ActionTypes.UPDATE_ANALYSIS, payload: updatedAnalysis });
          return results;
        }
        
        return analysis?.results || null;
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        throw error;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    },

    // Delete analysis
    deleteAnalysis: async (analysisId) => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        const analysis = state.analyses.find(a => a.id === analysisId);
        
        // Delete from server if it exists
        if (analysis?.serverId) {
          await apiService.deleteAnalysis(analysis.serverId);
        }
        
        // Delete from local state
        dispatch({ type: ActionTypes.DELETE_ANALYSIS, payload: analysisId });
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        throw error;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    },

    // Load analysis history from server
    loadAnalysisHistory: async () => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        const history = await apiService.getAnalysisHistory();
        dispatch({ type: ActionTypes.SET_ANALYSIS_HISTORY, payload: history.history || [] });
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    },

    // Load statistics
    loadStatistics: async () => {
      try {
        const statistics = await apiService.getStatistics();
        dispatch({ type: ActionTypes.SET_STATISTICS, payload: statistics });
      } catch (error) {
        console.warn('Failed to load statistics:', error.message);
      }
    },

    // Download results
    downloadResults: async (analysisId, format = 'json') => {
      try {
        const analysis = state.analyses.find(a => a.id === analysisId);
        if (analysis?.serverId) {
          return await apiService.downloadResults(analysis.serverId, format);
        }
        throw new Error('Analysis not found or not uploaded to server');
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    // Retry failed analysis
    retryAnalysis: async (analysisId) => {
      const analysis = state.analyses.find(a => a.id === analysisId);
      if (analysis && analysis.videoFile) {
        return actions.startAnalysis(analysis.videoFile, analysis.parameters);
      }
      throw new Error('Cannot retry analysis - video file not found');
    },

    // Clear all data
    clearAllData: async () => {
      try {
        await AsyncStorage.multiRemove(['sperm_analyses', 'sperm_history']);
        dispatch({ type: ActionTypes.RESET_STATE });
      } catch (error) {
        console.error('Error clearing data:', error);
      }
    },

    // Check server status
    checkServerStatus,

    // Get analysis by ID
    getAnalysisById: (analysisId) => {
      return state.analyses.find(a => a.id === analysisId) || null;
    },

    // Get completed analyses
    getCompletedAnalyses: () => {
      return state.analyses.filter(a => a.status === 'completed');
    },

    // Get failed analyses
    getFailedAnalyses: () => {
      return state.analyses.filter(a => a.status === 'failed');
    },

    // Get processing analyses
    getProcessingAnalyses: () => {
      return state.analyses.filter(a => a.status === 'processing' || a.status === 'pending');
    },
  };

  const value = {
    ...state,
    actions,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};

// Custom hook to use the context
export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};

export default AnalysisContext;