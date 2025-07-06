import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import {
  Button,
  IconButton,
  Card,
  Title,
  Portal,
  Modal,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../utils/theme';

const { width, height } = Dimensions.get('window');

const CameraScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const cameraRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [videoQuality, setVideoQuality] = useState(Camera.Constants.VideoQuality['720p']);

  const recordingIntervalRef = useRef(null);

  useEffect(() => {
    requestPermissions();
    
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    const { status: audioStatus } = await Camera.requestMicrophonePermissionsAsync();
    const { status: mediaLibraryStatus } = await MediaLibrary.requestPermissionsAsync();
    
    setHasPermission(
      cameraStatus === 'granted' && 
      audioStatus === 'granted' && 
      mediaLibraryStatus === 'granted'
    );
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;

    try {
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);

      const videoRecordPromise = cameraRef.current.recordAsync({
        quality: videoQuality,
        maxDuration: 300, // 5 minutes max
        mute: false,
      });

      const data = await videoRecordPromise;
      setRecordedVideo(data);
      setShowPreview(true);
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to start recording');
      console.error('Recording error:', error);
    } finally {
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const stopRecording = async () => {
    if (!cameraRef.current || !isRecording) return;

    try {
      await cameraRef.current.stopRecording();
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to stop recording');
      console.error('Stop recording error:', error);
    }
  };

  const retakeVideo = () => {
    setRecordedVideo(null);
    setShowPreview(false);
    setRecordingTime(0);
  };

  const useVideo = async () => {
    try {
      // Save video to media library
      await MediaLibrary.saveToLibraryAsync(recordedVideo.uri);
      
      // Return video data to previous screen
      navigation.navigate('Analysis', {
        selectedVideo: {
          uri: recordedVideo.uri,
          type: 'video/mp4',
          fileName: `recorded_video_${Date.now()}.mp4`,
          duration: recordingTime * 1000,
        }
      });
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to save video');
      console.error('Save video error:', error);
    }
  };

  const toggleCameraType = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const toggleFlashMode = () => {
    setFlashMode(
      flashMode === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.torch
        : Camera.Constants.FlashMode.off
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderVideoPreview = () => (
    <Portal>
      <Modal
        visible={showPreview}
        onDismiss={retakeVideo}
        contentContainerStyle={styles.previewModal}
      >
        <Card style={styles.previewCard}>
          <Card.Content>
            <Title style={styles.previewTitle}>Video Preview</Title>
            {recordedVideo && (
              <Video
                source={{ uri: recordedVideo.uri }}
                style={styles.previewVideo}
                useNativeControls
                resizeMode="contain"
                isLooping
              />
            )}
            <Text style={styles.previewInfo}>
              Duration: {formatTime(recordingTime)}
            </Text>
            <View style={styles.previewActions}>
              <Button
                mode="outlined"
                onPress={retakeVideo}
                style={styles.previewButton}
                icon="refresh"
              >
                {t('camera.retake')}
              </Button>
              <Button
                mode="contained"
                onPress={useVideo}
                style={styles.previewButton}
                icon="check"
              >
                {t('camera.use')}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text>Requesting camera permissions...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Icon name="camera-alt" size={64} color={theme.colors.disabled} />
        <Text style={styles.permissionText}>
          Camera access is required to record videos for analysis.
        </Text>
        <Button
          mode="contained"
          onPress={requestPermissions}
          style={styles.permissionButton}
        >
          Grant Permission
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={cameraType}
        flashMode={flashMode}
        ratio="16:9"
      >
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <IconButton
              icon="arrow-back"
              size={24}
              iconColor="white"
              onPress={() => navigation.goBack()}
            />
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{t('camera.title')}</Text>
              {isRecording && (
                <Text style={styles.recordingTime}>
                  {t('camera.duration', { time: formatTime(recordingTime) })}
                </Text>
              )}
            </View>
            <IconButton
              icon="flip-camera-ios"
              size={24}
              iconColor="white"
              onPress={toggleCameraType}
            />
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>
              {t('camera.instructions')}
            </Text>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <IconButton
              icon={flashMode === Camera.Constants.FlashMode.off ? 'flash-off' : 'flash-on'}
              size={28}
              iconColor="white"
              onPress={toggleFlashMode}
              style={styles.controlButton}
            />
            
            <View style={styles.recordButtonContainer}>
              <IconButton
                icon={isRecording ? 'stop' : 'fiber-manual-record'}
                size={isRecording ? 40 : 60}
                iconColor={isRecording ? '#fff' : '#ff4444'}
                onPress={isRecording ? stopRecording : startRecording}
                style={[
                  styles.recordButton,
                  isRecording && styles.recordButtonActive
                ]}
              />
            </View>

            <IconButton
              icon="settings"
              size={28}
              iconColor="white"
              onPress={() => {
                // Could open settings for video quality, etc.
                Alert.alert('Settings', 'Video quality and camera settings');
              }}
              style={styles.controlButton}
            />
          </View>
        </View>
      </Camera>

      {renderVideoPreview()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recordingTime: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  instructions: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  controlButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    margin: 0,
  },
  recordButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    margin: 0,
  },
  recordButtonActive: {
    backgroundColor: 'rgba(255,68,68,0.3)',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  permissionText: {
    fontSize: 16,
    color: theme.colors.onSurface,
    textAlign: 'center',
    marginVertical: 20,
  },
  permissionButton: {
    marginTop: 20,
  },
  previewModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  previewCard: {
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  previewTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  previewVideo: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
    borderRadius: 8,
    marginBottom: 16,
  },
  previewInfo: {
    textAlign: 'center',
    fontSize: 14,
    color: theme.colors.onSurface,
    marginBottom: 16,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default CameraScreen;