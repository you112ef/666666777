import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {
  Button,
  Card,
  Title,
  Paragraph,
  ProgressBar,
  Slider,
  Chip,
  Portal,
  Modal,
  TextInput,
  RadioButton,
  Switch,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Video } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AnalysisContext } from '../services/AnalysisContext';
import apiService from '../services/apiService';
import { theme } from '../utils/theme';

const { width } = Dimensions.get('window');

const AnalysisScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { currentAnalysis, setCurrentAnalysis, addAnalysis } = useContext(AnalysisContext);
  
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [analysisParameters, setAnalysisParameters] = useState({
    confidence_threshold: 0.5,
    motility_threshold: 0.3,
    max_detections: 1000,
    enable_tracking: true,
    save_frames: false,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showParametersModal, setShowParametersModal] = useState(false);
  const [videoSource, setVideoSource] = useState('gallery');

  // Request permissions on mount
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
      Alert.alert(
        t('errors.permissionDenied'),
        'Sorry, we need camera and media library permissions to work!',
      );
    }
  };

  const selectVideoFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedVideo(result.assets[0]);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('analysis.error.uploadFailed'));
    }
  };

  const selectVideoFromFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setSelectedVideo(result.assets[0]);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('analysis.error.uploadFailed'));
    }
  };

  const recordVideo = () => {
    navigation.navigate('Camera');
  };

  const startAnalysis = async () => {
    if (!selectedVideo) {
      Alert.alert(t('common.error'), t('analysis.error.noVideo'));
      return;
    }

    setIsAnalyzing(true);
    setUploadProgress(0);
    setAnalysisProgress(0);

    try {
      // Start analysis
      const response = await apiService.analyzeVideo(
        selectedVideo,
        analysisParameters,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      const analysisId = response.analysis_id;
      
      // Update context
      const newAnalysis = {
        id: analysisId,
        status: 'processing',
        created_at: new Date().toISOString(),
        parameters: analysisParameters,
        video_info: selectedVideo,
      };
      
      setCurrentAnalysis(newAnalysis);
      addAnalysis(newAnalysis);

      // Poll for progress
      await apiService.pollAnalysisStatus(
        analysisId,
        (status) => {
          setAnalysisProgress(status.progress || 0);
          setCurrentAnalysis(prev => ({ ...prev, ...status }));
        }
      );

      // Navigate to results
      navigation.navigate('Results');
      
    } catch (error) {
      Alert.alert(t('common.error'), error.message || t('analysis.error.analysisFailed'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderVideoPreview = () => {
    if (!selectedVideo) return null;

    return (
      <Card style={styles.videoPreview}>
        <Card.Content>
          <Title>{t('analysis.videoSelected')}</Title>
          <Video
            source={{ uri: selectedVideo.uri }}
            style={styles.video}
            useNativeControls
            resizeMode="contain"
            isLooping
          />
          <View style={styles.videoInfo}>
            <Text style={styles.videoInfoText}>
              {t('common.duration')}: {selectedVideo.duration ? `${Math.round(selectedVideo.duration / 1000)}s` : 'N/A'}
            </Text>
            <Text style={styles.videoInfoText}>
              Size: {selectedVideo.fileSize ? `${Math.round(selectedVideo.fileSize / 1024 / 1024)}MB` : 'N/A'}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderParametersModal = () => (
    <Portal>
      <Modal
        visible={showParametersModal}
        onDismiss={() => setShowParametersModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView>
          <Title style={styles.modalTitle}>{t('analysis.parameters')}</Title>
          
          <View style={styles.parameterGroup}>
            <Text style={styles.parameterLabel}>
              {t('analysis.confidenceThreshold')}: {analysisParameters.confidence_threshold.toFixed(2)}
            </Text>
            <Slider
              style={styles.slider}
              value={analysisParameters.confidence_threshold}
              onValueChange={(value) => 
                setAnalysisParameters(prev => ({ ...prev, confidence_threshold: value }))
              }
              minimumValue={0.1}
              maximumValue={0.9}
              step={0.05}
              thumbStyle={{ backgroundColor: theme.colors.primary }}
              trackStyle={{ backgroundColor: theme.colors.surface }}
              minimumTrackTintColor={theme.colors.primary}
            />
          </View>

          <View style={styles.parameterGroup}>
            <Text style={styles.parameterLabel}>
              {t('analysis.motilityThreshold')}: {analysisParameters.motility_threshold.toFixed(2)}
            </Text>
            <Slider
              style={styles.slider}
              value={analysisParameters.motility_threshold}
              onValueChange={(value) => 
                setAnalysisParameters(prev => ({ ...prev, motility_threshold: value }))
              }
              minimumValue={0.1}
              maximumValue={0.8}
              step={0.05}
              thumbStyle={{ backgroundColor: theme.colors.primary }}
              trackStyle={{ backgroundColor: theme.colors.surface }}
              minimumTrackTintColor={theme.colors.primary}
            />
          </View>

          <View style={styles.parameterGroup}>
            <Text style={styles.parameterLabel}>
              {t('analysis.maxDetections')}: {analysisParameters.max_detections}
            </Text>
            <Slider
              style={styles.slider}
              value={analysisParameters.max_detections}
              onValueChange={(value) => 
                setAnalysisParameters(prev => ({ ...prev, max_detections: Math.round(value) }))
              }
              minimumValue={100}
              maximumValue={5000}
              step={100}
              thumbStyle={{ backgroundColor: theme.colors.primary }}
              trackStyle={{ backgroundColor: theme.colors.surface }}
              minimumTrackTintColor={theme.colors.primary}
            />
          </View>

          <View style={styles.switchGroup}>
            <Text style={styles.parameterLabel}>Enable Tracking</Text>
            <Switch
              value={analysisParameters.enable_tracking}
              onValueChange={(value) => 
                setAnalysisParameters(prev => ({ ...prev, enable_tracking: value }))
              }
            />
          </View>

          <View style={styles.switchGroup}>
            <Text style={styles.parameterLabel}>Save Frames</Text>
            <Switch
              value={analysisParameters.save_frames}
              onValueChange={(value) => 
                setAnalysisParameters(prev => ({ ...prev, save_frames: value }))
              }
            />
          </View>

          <Button
            mode="contained"
            onPress={() => setShowParametersModal(false)}
            style={styles.modalButton}
          >
            {t('common.ok')}
          </Button>
        </ScrollView>
      </Modal>
    </Portal>
  );

  if (isAnalyzing) {
    return (
      <View style={styles.progressContainer}>
        <Card style={styles.progressCard}>
          <Card.Content>
            <Title style={styles.progressTitle}>{t('analysis.analyzing')}</Title>
            
            <View style={styles.progressSection}>
              <Text style={styles.progressLabel}>Upload Progress</Text>
              <ProgressBar progress={uploadProgress / 100} color={theme.colors.primary} />
              <Text style={styles.progressText}>{uploadProgress}%</Text>
            </View>

            <View style={styles.progressSection}>
              <Text style={styles.progressLabel}>Analysis Progress</Text>
              <ProgressBar progress={analysisProgress / 100} color={theme.colors.secondary} />
              <Text style={styles.progressText}>{analysisProgress}%</Text>
            </View>

            <View style={styles.estimatedTime}>
              <Icon name="schedule" size={20} color={theme.colors.primary} />
              <Text style={styles.estimatedTimeText}>
                {t('analysis.estimatedTime')}: {Math.max(1, Math.round((100 - analysisProgress) / 10))} minutes
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.headerCard}>
          <Card.Content>
            <Title>{t('analysis.title')}</Title>
            <Paragraph>{t('analysis.description')}</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.selectionCard}>
          <Card.Content>
            <Title>{t('analysis.videoSource')}</Title>
            <RadioButton.Group
              onValueChange={setVideoSource}
              value={videoSource}
            >
              <View style={styles.radioOption}>
                <RadioButton value="gallery" />
                <Text>{t('analysis.gallery')}</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="camera" />
                <Text>{t('analysis.camera')}</Text>
              </View>
            </RadioButton.Group>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={videoSource === 'gallery' ? selectVideoFromGallery : recordVideo}
            style={styles.button}
            icon={videoSource === 'gallery' ? 'video-library' : 'videocam'}
          >
            {videoSource === 'gallery' ? t('analysis.selectVideo') : t('analysis.recordVideo')}
          </Button>

          <Button
            mode="outlined"
            onPress={selectVideoFromFiles}
            style={styles.button}
            icon="folder-open"
          >
            {t('analysis.uploadVideo')}
          </Button>
        </View>

        {renderVideoPreview()}

        {selectedVideo && (
          <View style={styles.actionContainer}>
            <Button
              mode="outlined"
              onPress={() => setShowParametersModal(true)}
              style={styles.button}
              icon="settings"
            >
              {t('analysis.parameters')}
            </Button>

            <Button
              mode="contained"
              onPress={startAnalysis}
              style={[styles.button, styles.analyzeButton]}
              icon="play-arrow"
            >
              {t('analysis.startAnalysis')}
            </Button>
          </View>
        )}

        {renderParametersModal()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
  },
  selectionCard: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  videoPreview: {
    marginBottom: 16,
  },
  video: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
    borderRadius: 8,
    marginVertical: 8,
  },
  videoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  videoInfoText: {
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  analyzeButton: {
    backgroundColor: theme.colors.primary,
  },
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  progressCard: {
    padding: 16,
  },
  progressTitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: theme.colors.onSurface,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  estimatedTime: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  estimatedTimeText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  parameterGroup: {
    marginBottom: 20,
  },
  parameterLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: theme.colors.onSurface,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalButton: {
    marginTop: 20,
  },
});

export default AnalysisScreen;