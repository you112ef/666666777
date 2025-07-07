import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  Share,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  DataTable,
  Portal,
  Modal,
  List,
  Divider,
  IconButton,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AnalysisContext } from '../services/AnalysisContext';
import apiService from '../services/apiService';
import { theme } from '../utils/theme';

const { width } = Dimensions.get('window');

const ResultsScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { currentAnalysis, analyses } = useContext(AnalysisContext);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      const analysisId = route?.params?.analysisId || currentAnalysis?.id;
      
      if (!analysisId) {
        if (analyses.length > 0) {
          const latest = analyses[analyses.length - 1];
          setSelectedAnalysis(latest);
          if (latest.status === 'completed') {
            const data = await apiService.getAnalysisResults(latest.id);
            setResults(data);
          }
        }
        return;
      }

      const data = await apiService.getAnalysisResults(analysisId);
      setResults(data);
      setSelectedAnalysis(currentAnalysis);
    } catch (error) {
      Alert.alert(t('common.error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportResults = async (format) => {
    try {
      if (!selectedAnalysis) return;
      
      const data = await apiService.downloadResults(selectedAnalysis.id, format);
      
      // In a real app, you would save this to the device
      Alert.alert(t('common.success'), `Results exported in ${format.toUpperCase()} format`);
      setExportModalVisible(false);
    } catch (error) {
      Alert.alert(t('common.error'), error.message);
    }
  };

  const shareResults = async () => {
    try {
      if (!results) return;
      
      const shareText = `
Sperm Analysis Results
===================
Total Sperm: ${results.summary.total_sperm}
Motile Sperm: ${results.summary.motile_sperm}
Motility: ${results.summary.motility_percentage.toFixed(1)}%
Average Velocity: ${results.summary.avg_velocity.toFixed(1)} px/s
Density: ${results.summary.density.toFixed(1)} per 10K pixels
      `;
      
      await Share.share({
        message: shareText,
        title: 'Sperm Analysis Results',
      });
    } catch (error) {
      Alert.alert(t('common.error'), error.message);
    }
  };

  const renderSummaryCard = () => {
    if (!results) return null;

    const { summary } = results;
    
    return (
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title>{t('results.summary')}</Title>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{summary.total_sperm}</Text>
              <Text style={styles.metricLabel}>{t('results.metrics.totalSperm')}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{summary.motile_sperm}</Text>
              <Text style={styles.metricLabel}>{t('results.metrics.motileSperm')}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{summary.motility_percentage.toFixed(1)}%</Text>
              <Text style={styles.metricLabel}>{t('results.metrics.motilityPercentage')}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{summary.avg_velocity.toFixed(1)}</Text>
              <Text style={styles.metricLabel}>{t('results.metrics.averageVelocity')}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderMotilityChart = () => {
    if (!results || !results.frame_data) return null;

    const data = {
      labels: results.frame_data.slice(0, 10).map((_, index) => `${index * 10}s`),
      datasets: [
        {
          data: results.frame_data.slice(0, 10).map(frame => frame.motile_count),
          color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    return (
      <Card style={styles.chartCard}>
        <Card.Content>
          <Title>Motile Sperm Over Time</Title>
          <LineChart
            data={data}
            width={width - 60}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: theme.colors.surface,
              backgroundGradientFrom: theme.colors.surface,
              backgroundGradientTo: theme.colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: theme.colors.primary,
              },
            }}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>
    );
  };

  const renderVelocityDistribution = () => {
    if (!results || !results.velocity_distribution) return null;

    const data = {
      labels: ['0-5', '5-10', '10-15', '15-20', '20+'],
      datasets: [
        {
          data: results.velocity_distribution,
        },
      ],
    };

    return (
      <Card style={styles.chartCard}>
        <Card.Content>
          <Title>Velocity Distribution</Title>
          <BarChart
            data={data}
            width={width - 60}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: theme.colors.surface,
              backgroundGradientFrom: theme.colors.surface,
              backgroundGradientTo: theme.colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            style={styles.chart}
          />
        </Card.Content>
      </Card>
    );
  };

  const renderDetailedResults = () => {
    if (!results) return null;

    return (
      <Card style={styles.detailCard}>
        <Card.Content>
          <Title>{t('results.details')}</Title>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Metric</DataTable.Title>
              <DataTable.Title numeric>Value</DataTable.Title>
            </DataTable.Header>

            <DataTable.Row>
              <DataTable.Cell>Total Sperm Detected</DataTable.Cell>
              <DataTable.Cell numeric>{results.summary.total_sperm}</DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row>
              <DataTable.Cell>Active Sperm</DataTable.Cell>
              <DataTable.Cell numeric>{results.summary.active_sperm}</DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row>
              <DataTable.Cell>Motile Sperm</DataTable.Cell>
              <DataTable.Cell numeric>{results.summary.motile_sperm}</DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row>
              <DataTable.Cell>Motility %</DataTable.Cell>
              <DataTable.Cell numeric>{results.summary.motility_percentage.toFixed(1)}%</DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row>
              <DataTable.Cell>Average Velocity</DataTable.Cell>
              <DataTable.Cell numeric>{results.summary.avg_velocity.toFixed(1)} px/s</DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row>
              <DataTable.Cell>Max Velocity</DataTable.Cell>
              <DataTable.Cell numeric>{results.summary.max_velocity.toFixed(1)} px/s</DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row>
              <DataTable.Cell>Density</DataTable.Cell>
              <DataTable.Cell numeric>{results.summary.density.toFixed(1)} per 10K px</DataTable.Cell>
            </DataTable.Row>

            <DataTable.Row>
              <DataTable.Cell>Analysis Duration</DataTable.Cell>
              <DataTable.Cell numeric>{results.metadata.analysis_duration.toFixed(1)}s</DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </Card.Content>
      </Card>
    );
  };

  const renderExportModal = () => (
    <Portal>
      <Modal
        visible={exportModalVisible}
        onDismiss={() => setExportModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Title style={styles.modalTitle}>{t('results.export')}</Title>
        <List.Section>
          <List.Item
            title="JSON Format"
            description="Complete data with all details"
            left={() => <List.Icon icon="code-braces" />}
            onPress={() => exportResults('json')}
          />
          <Divider />
          <List.Item
            title="CSV Format"
            description="Summary data for spreadsheets"
            left={() => <List.Icon icon="file-table" />}
            onPress={() => exportResults('csv')}
          />
          <Divider />
          <List.Item
            title="Excel Format"
            description="Formatted report with charts"
            left={() => <List.Icon icon="file-excel" />}
            onPress={() => exportResults('xlsx')}
          />
        </List.Section>
        <Button
          mode="outlined"
          onPress={() => setExportModalVisible(false)}
          style={styles.modalButton}
        >
          {t('common.cancel')}
        </Button>
      </Modal>
    </Portal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{t('results.loading')}</Text>
      </View>
    );
  }

  if (!results) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="assessment" size={64} color={theme.colors.disabled} />
        <Text style={styles.emptyText}>{t('results.noResults')}</Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Analysis')}
          style={styles.emptyButton}
        >
          Start New Analysis
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="share"
          size={24}
          onPress={shareResults}
        />
        <IconButton
          icon="download"
          size={24}
          onPress={() => setExportModalVisible(true)}
        />
      </View>

      {renderSummaryCard()}
      {renderMotilityChart()}
      {renderVelocityDistribution()}
      {renderDetailedResults()}
      {renderExportModal()}

      <View style={styles.actionButtons}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Graphs')}
          style={styles.actionButton}
          icon="insert-chart"
        >
          {t('results.viewGraphs')}
        </Button>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Analysis')}
          style={styles.actionButton}
          icon="refresh"
        >
          New Analysis
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
  },
  summaryCard: {
    margin: 16,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  metricItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.onSurface,
    textAlign: 'center',
    marginTop: 4,
  },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  detailCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.onSurface,
    textAlign: 'center',
    marginVertical: 16,
  },
  emptyButton: {
    marginTop: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  modalButton: {
    marginTop: 16,
  },
});

export default ResultsScreen;