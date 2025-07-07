import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Button,
  SegmentedButtons,
  List,
  Portal,
  Modal,
  Chip,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { LineChart, BarChart, PieChart, AreaChart } from 'react-native-chart-kit';
import { VictoryChart, VictoryLine, VictoryBar, VictoryArea, VictoryAxis, VictoryTheme } from 'victory-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AnalysisContext } from '../services/AnalysisContext';
import apiService from '../services/apiService';
import { theme } from '../utils/theme';

const { width } = Dimensions.get('window');

const GraphScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { currentAnalysis, analyses } = useContext(AnalysisContext);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState('motility');
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  useEffect(() => {
    if (currentAnalysis) {
      loadAnalysisResults(currentAnalysis.id);
    } else if (analyses.length > 0) {
      const latest = analyses[analyses.length - 1];
      if (latest.status === 'completed') {
        loadAnalysisResults(latest.id);
      }
    }
  }, [currentAnalysis, analyses]);

  const loadAnalysisResults = async (analysisId) => {
    try {
      setLoading(true);
      const data = await apiService.getAnalysisResults(analysisId);
      setResults(data);
      setSelectedAnalysis(analyses.find(a => a.id === analysisId));
    } catch (error) {
      Alert.alert(t('common.error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderMotilityChart = () => {
    if (!results || !results.frame_data) return null;

    const data = {
      labels: results.frame_data.slice(0, 12).map((_, index) => `${index * 5}s`),
      datasets: [
        {
          data: results.frame_data.slice(0, 12).map(frame => frame.motile_count),
          color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };

    return (
      <LineChart
        data={data}
        width={width - 32}
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
          style: { borderRadius: 16 },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: theme.colors.primary,
          },
        }}
        bezier
        style={styles.chart}
      />
    );
  };

  const renderVelocityChart = () => {
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
      <BarChart
        data={data}
        width={width - 32}
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
          style: { borderRadius: 16 },
        }}
        style={styles.chart}
      />
    );
  };

  const renderDensityChart = () => {
    if (!results || !results.frame_data) return null;

    const data = {
      labels: results.frame_data.slice(0, 10).map((_, index) => `${index * 6}s`),
      datasets: [
        {
          data: results.frame_data.slice(0, 10).map(frame => frame.density),
          color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    return (
      <AreaChart
        data={data}
        width={width - 32}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: theme.colors.surface,
          backgroundGradientFrom: theme.colors.surface,
          backgroundGradientTo: theme.colors.surface,
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 16 },
        }}
        style={styles.chart}
      />
    );
  };

  const renderCountChart = () => {
    if (!results || !results.frame_data) return null;

    const data = {
      labels: results.frame_data.slice(0, 8).map((_, index) => `${index * 7}s`),
      datasets: [
        {
          data: results.frame_data.slice(0, 8).map(frame => frame.total_count),
          color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    return (
      <LineChart
        data={data}
        width={width - 32}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: theme.colors.surface,
          backgroundGradientFrom: theme.colors.surface,
          backgroundGradientTo: theme.colors.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 16 },
        }}
        style={styles.chart}
      />
    );
  };

  const renderChart = () => {
    switch (chartType) {
      case 'motility':
        return renderMotilityChart();
      case 'velocity':
        return renderVelocityChart();
      case 'density':
        return renderDensityChart();
      case 'count':
        return renderCountChart();
      default:
        return renderMotilityChart();
    }
  };

  const renderAnalysisModal = () => (
    <Portal>
      <Modal
        visible={showAnalysisModal}
        onDismiss={() => setShowAnalysisModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Title style={styles.modalTitle}>Select Analysis</Title>
        <ScrollView style={styles.analysisListContainer}>
          {analyses.filter(a => a.status === 'completed').map((analysis) => (
            <List.Item
              key={analysis.id}
              title={`Analysis ${analysis.id.slice(-8)}`}
              description={new Date(analysis.created_at).toLocaleDateString()}
              left={() => <List.Icon icon="assessment" />}
              right={() => selectedAnalysis?.id === analysis.id ? <List.Icon icon="check" /> : null}
              onPress={() => {
                loadAnalysisResults(analysis.id);
                setShowAnalysisModal(false);
              }}
            />
          ))}
        </ScrollView>
        <Button
          mode="outlined"
          onPress={() => setShowAnalysisModal(false)}
          style={styles.modalButton}
        >
          Cancel
        </Button>
      </Modal>
    </Portal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading graphs...</Text>
      </View>
    );
  }

  if (!results) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="insert-chart" size={64} color={theme.colors.disabled} />
        <Text style={styles.emptyText}>{t('graphs.noData')}</Text>
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
        <Card style={styles.infoCard}>
          <Card.Content>
            <Title>Analysis Graphs</Title>
            <Text style={styles.analysisInfo}>
              {selectedAnalysis ? `Analysis ${selectedAnalysis.id.slice(-8)}` : 'Current Analysis'}
            </Text>
            <Text style={styles.analysisDate}>
              {selectedAnalysis ? new Date(selectedAnalysis.created_at).toLocaleDateString() : 'Today'}
            </Text>
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          onPress={() => setShowAnalysisModal(true)}
          style={styles.selectButton}
          icon="swap-horiz"
        >
          Switch Analysis
        </Button>
      </View>

      <Card style={styles.chartCard}>
        <Card.Content>
          <SegmentedButtons
            value={chartType}
            onValueChange={setChartType}
            buttons={[
              { value: 'motility', label: 'Motility' },
              { value: 'velocity', label: 'Velocity' },
              { value: 'density', label: 'Density' },
              { value: 'count', label: 'Count' },
            ]}
            style={styles.segmentedButtons}
          />
          
          <View style={styles.chartContainer}>
            {renderChart()}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title>Summary Statistics</Title>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{results.summary.total_sperm}</Text>
              <Text style={styles.statLabel}>Total Sperm</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{results.summary.motile_sperm}</Text>
              <Text style={styles.statLabel}>Motile Sperm</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{results.summary.motility_percentage.toFixed(1)}%</Text>
              <Text style={styles.statLabel}>Motility</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{results.summary.avg_velocity.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Avg Velocity</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {renderAnalysisModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 16,
  },
  infoCard: {
    marginBottom: 12,
  },
  analysisInfo: {
    fontSize: 16,
    color: theme.colors.onSurface,
    marginTop: 4,
  },
  analysisDate: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  selectButton: {
    marginTop: 8,
  },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.onSurface,
    textAlign: 'center',
    marginTop: 4,
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
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  analysisListContainer: {
    maxHeight: 300,
  },
  modalButton: {
    marginTop: 16,
  },
});

export default GraphScreen;