import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import {
  Card,
  Title,
  List,
  Switch,
  Button,
  Portal,
  Dialog,
  RadioButton,
  TextInput,
  Divider,
  Chip,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AnalysisContext } from '../services/AnalysisContext';
import apiService from '../services/apiService';
import { theme } from '../utils/theme';

const SettingsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { clearAnalyses } = useContext(AnalysisContext);
  
  const [language, setLanguage] = useState(i18n.language);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [defaultConfidence, setDefaultConfidence] = useState(0.5);
  const [defaultMotility, setDefaultMotility] = useState(0.3);
  const [serverUrl, setServerUrl] = useState(apiService.getServerURL());
  
  const [languageDialogVisible, setLanguageDialogVisible] = useState(false);
  const [serverDialogVisible, setServerDialogVisible] = useState(false);
  const [clearDataDialogVisible, setClearDataDialogVisible] = useState(false);
  const [aboutDialogVisible, setAboutDialogVisible] = useState(false);

  const handleLanguageChange = async (newLanguage) => {
    try {
      await i18n.changeLanguage(newLanguage);
      setLanguage(newLanguage);
      await AsyncStorage.setItem('language', newLanguage);
      setLanguageDialogVisible(false);
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to change language');
    }
  };

  const handleServerUrlChange = async () => {
    try {
      apiService.updateServerURL(serverUrl);
      await AsyncStorage.setItem('serverUrl', serverUrl);
      setServerDialogVisible(false);
      Alert.alert(t('common.success'), 'Server URL updated successfully');
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to update server URL');
    }
  };

  const handleClearData = async () => {
    try {
      await AsyncStorage.clear();
      clearAnalyses();
      setClearDataDialogVisible(false);
      Alert.alert(t('common.success'), 'All data cleared successfully');
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to clear data');
    }
  };

  const handleTestConnection = async () => {
    try {
      const result = await apiService.testConnection();
      if (result.success) {
        Alert.alert(
          t('common.success'),
          `Connection successful\nLatency: ${result.latency}ms`
        );
      } else {
        Alert.alert(t('common.error'), result.message);
      }
    } catch (error) {
      Alert.alert(t('common.error'), 'Connection test failed');
    }
  };

  const openURL = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(t('common.error'), 'Cannot open URL');
      }
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to open URL');
    }
  };

  const renderLanguageDialog = () => (
    <Portal>
      <Dialog
        visible={languageDialogVisible}
        onDismiss={() => setLanguageDialogVisible(false)}
      >
        <Dialog.Title>{t('settings.language')}</Dialog.Title>
        <Dialog.Content>
          <RadioButton.Group
            onValueChange={handleLanguageChange}
            value={language}
          >
            <View style={styles.radioOption}>
              <RadioButton value="en" />
              <Text style={styles.radioLabel}>English</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="ar" />
              <Text style={styles.radioLabel}>العربية</Text>
            </View>
          </RadioButton.Group>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setLanguageDialogVisible(false)}>
            {t('common.cancel')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const renderServerDialog = () => (
    <Portal>
      <Dialog
        visible={serverDialogVisible}
        onDismiss={() => setServerDialogVisible(false)}
      >
        <Dialog.Title>Server Configuration</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Server URL"
            value={serverUrl}
            onChangeText={setServerUrl}
            mode="outlined"
            style={styles.textInput}
            placeholder="http://localhost:8000"
          />
          <Button
            mode="outlined"
            onPress={handleTestConnection}
            style={styles.testButton}
            icon="network-check"
          >
            Test Connection
          </Button>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setServerDialogVisible(false)}>
            {t('common.cancel')}
          </Button>
          <Button onPress={handleServerUrlChange}>
            {t('common.save')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const renderClearDataDialog = () => (
    <Portal>
      <Dialog
        visible={clearDataDialogVisible}
        onDismiss={() => setClearDataDialogVisible(false)}
      >
        <Dialog.Title>Clear All Data</Dialog.Title>
        <Dialog.Content>
          <Text>
            This will permanently delete all analysis history, settings, and cached data.
            This action cannot be undone.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setClearDataDialogVisible(false)}>
            {t('common.cancel')}
          </Button>
          <Button onPress={handleClearData} textColor={theme.colors.error}>
            Clear Data
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const renderAboutDialog = () => (
    <Portal>
      <Dialog
        visible={aboutDialogVisible}
        onDismiss={() => setAboutDialogVisible(false)}
      >
        <Dialog.Title>About Sperm Analyzer AI</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.aboutText}>
            Sperm Analyzer AI is an advanced application that uses artificial intelligence
            to analyze sperm motility and density from microscopic video footage.
          </Text>
          <Text style={styles.aboutText}>
            • YOLOv8 for sperm detection
            • DeepSORT for tracking
            • Real-time analysis
            • Comprehensive reporting
          </Text>
          <Text style={styles.aboutText}>
            Version: 1.0.0{'\n'}
            Build: 2024.01.01
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setAboutDialogVisible(false)}>
            {t('common.close')}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title>{t('settings.general')}</Title>
          <List.Item
            title={t('settings.language')}
            description={language === 'en' ? 'English' : 'العربية'}
            left={() => <List.Icon icon="language" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => setLanguageDialogVisible(true)}
          />
          <Divider />
          <List.Item
            title={t('settings.theme')}
            description={darkMode ? 'Dark Mode' : 'Light Mode'}
            left={() => <List.Icon icon="palette" />}
            right={() => (
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
              />
            )}
          />
          <Divider />
          <List.Item
            title={t('settings.notifications')}
            description="Enable analysis notifications"
            left={() => <List.Icon icon="notifications" />}
            right={() => (
              <Switch
                value={notifications}
                onValueChange={setNotifications}
              />
            )}
          />
        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title>{t('settings.analysis')}</Title>
          <List.Item
            title={t('settings.defaultConfidence')}
            description={`Current: ${defaultConfidence.toFixed(2)}`}
            left={() => <List.Icon icon="tune" />}
            right={() => (
              <Chip>{defaultConfidence.toFixed(2)}</Chip>
            )}
          />
          <Divider />
          <List.Item
            title={t('settings.defaultMotility')}
            description={`Current: ${defaultMotility.toFixed(2)}`}
            left={() => <List.Icon icon="speed" />}
            right={() => (
              <Chip>{defaultMotility.toFixed(2)}</Chip>
            )}
          />
          <Divider />
          <List.Item
            title="Auto-save Results"
            description="Automatically save analysis results"
            left={() => <List.Icon icon="save" />}
            right={() => (
              <Switch
                value={autoSave}
                onValueChange={setAutoSave}
              />
            )}
          />
        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title>Server & Data</Title>
          <List.Item
            title="Server Configuration"
            description="Configure API server settings"
            left={() => <List.Icon icon="dns" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => setServerDialogVisible(true)}
          />
          <Divider />
          <List.Item
            title="Test Connection"
            description="Test connection to analysis server"
            left={() => <List.Icon icon="network-check" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={handleTestConnection}
          />
          <Divider />
          <List.Item
            title="Clear All Data"
            description="Delete all analysis history and settings"
            left={() => <List.Icon icon="delete-sweep" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => setClearDataDialogVisible(true)}
          />
        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title>{t('settings.about')}</Title>
          <List.Item
            title={t('settings.version')}
            description="1.0.0"
            left={() => <List.Icon icon="info" />}
          />
          <Divider />
          <List.Item
            title={t('settings.developer')}
            description="AI Development Team"
            left={() => <List.Icon icon="code" />}
          />
          <Divider />
          <List.Item
            title="GitHub Repository"
            description="View source code"
            left={() => <List.Icon icon="github" />}
            right={() => <List.Icon icon="open-in-new" />}
            onPress={() => openURL('https://github.com/your-repo/sperm-analyzer-ai')}
          />
          <Divider />
          <List.Item
            title="Documentation"
            description="User guide and API docs"
            left={() => <List.Icon icon="book" />}
            right={() => <List.Icon icon="open-in-new" />}
            onPress={() => openURL('https://your-docs.com')}
          />
          <Divider />
          <List.Item
            title="About"
            description="App information and credits"
            left={() => <List.Icon icon="info-outline" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => setAboutDialogVisible(true)}
          />
        </Card.Content>
      </Card>

      {renderLanguageDialog()}
      {renderServerDialog()}
      {renderClearDataDialog()}
      {renderAboutDialog()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  sectionCard: {
    margin: 16,
    marginBottom: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 8,
    color: theme.colors.onSurface,
  },
  textInput: {
    marginBottom: 16,
  },
  testButton: {
    marginTop: 8,
  },
  aboutText: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginBottom: 12,
    lineHeight: 20,
  },
});

export default SettingsScreen;