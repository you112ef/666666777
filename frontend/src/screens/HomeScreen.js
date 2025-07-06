import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Surface,
  Text,
  Avatar,
  IconButton,
  Chip,
  ProgressBar,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useAnalysis } from '../services/AnalysisContext';
import { theme, styles } from '../utils/theme';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const {
    analyses,
    statistics,
    serverStatus,
    loading,
    actions,
  } = useAnalysis();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await actions.loadStatistics();
      await actions.checkServerStatus();
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const getRecentAnalyses = () => {
    return analyses
      .slice(0, 3)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'processing':
        return 'sync';
      case 'failed':
        return 'error';
      default:
        return 'schedule';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return theme.colors.success;
      case 'processing':
        return theme.colors.warning;
      case 'failed':
        return theme.colors.error;
      default:
        return theme.colors.placeholder;
    }
  };

  const getCompletedAnalysisData = () => {
    const completed = analyses.filter(a => a.status === 'completed');
    if (completed.length === 0) return null;

    const data = completed.slice(-7).map((analysis, index) => ({
      x: index + 1,
      y: analysis.results?.summary?.average_motility_percentage || 0,
    }));

    return {
      labels: data.map((_, i) => `${i + 1}`),
      datasets: [{
        data: data.map(d => d.y),
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        strokeWidth: 2,
      }],
    };
  };

  const StatCard = ({ title, value, subtitle, icon, color = theme.colors.primary }) => (
    <Surface style={[styles.card, { flex: 1, margin: 4 }]}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.caption}>{title}</Text>
          <Title style={{ color }}>{value}</Title>
          {subtitle && (
            <Text style={styles.caption}>{subtitle}</Text>
          )}
        </View>
        <Avatar.Icon
          size={40}
          icon={icon}
          style={{ backgroundColor: color }}
        />
      </View>
    </Surface>
  );

  const ServerStatusCard = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.spaceBetween}>
          <View style={styles.row}>
            <Icon
              name={serverStatus === 'online' ? 'cloud-done' : 'cloud-off'}
              size={24}
              color={serverStatus === 'online' ? theme.colors.success : theme.colors.error}
            />
            <Text style={[styles.subheader, { marginLeft: 8, marginBottom: 0 }]}>
              {t('common.server')}
            </Text>
          </View>
          <Chip
            mode="outlined"
            textStyle={{
              color: serverStatus === 'online' ? theme.colors.success : theme.colors.error,
            }}
            style={{
              borderColor: serverStatus === 'online' ? theme.colors.success : theme.colors.error,
            }}
          >
            {serverStatus === 'online' ? t('common.online') : t('common.offline')}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );

  const QuickActionsCard = () => (
    <Card style={styles.card}>
      <Card.Title
        title={t('home.quickStart')}
        left={(props) => <Avatar.Icon {...props} icon="flash-on" />}
      />
      <Card.Content>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Button
            mode="contained"
            icon="biotech"
            onPress={() => navigation.navigate('Analysis')}
            style={{ flex: 1, marginRight: 8 }}
          >
            {t('home.newAnalysis')}
          </Button>
          <Button
            mode="outlined"
            icon="camera"
            onPress={() => navigation.navigate('Camera')}
            style={{ flex: 1, marginLeft: 8 }}
          >
            {t('analysis.recordVideo')}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const RecentAnalysesCard = () => {
    const recentAnalyses = getRecentAnalyses();

    return (
      <Card style={styles.card}>
        <Card.Title
          title={t('home.recentAnalysis')}
          left={(props) => <Avatar.Icon {...props} icon="history" />}
          right={(props) => (
            <IconButton
              {...props}
              icon="arrow-forward"
              onPress={() => navigation.navigate('History')}
            />
          )}
        />
        <Card.Content>
          {recentAnalyses.length === 0 ? (
            <View style={styles.centerContainer}>
              <Icon name="biotech" size={48} color={theme.colors.placeholder} />
              <Text style={[styles.body, { color: theme.colors.placeholder, textAlign: 'center' }]}>
                {t('history.empty')}
              </Text>
            </View>
          ) : (
            recentAnalyses.map((analysis) => (
              <Surface key={analysis.id} style={[styles.card, { margin: 4 }]}>
                <View style={styles.row}>
                  <Icon
                    name={getStatusIcon(analysis.status)}
                    size={24}
                    color={getStatusColor(analysis.status)}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.body}>
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </Text>
                    <Text style={styles.caption}>
                      {analysis.message || t(`status.${analysis.status}`)}
                    </Text>
                    {analysis.status === 'processing' && (
                      <ProgressBar
                        progress={analysis.progress / 100}
                        color={theme.colors.primary}
                        style={{ marginTop: 4 }}
                      />
                    )}
                  </View>
                  <IconButton
                    icon="arrow-forward"
                    size={20}
                    onPress={() => {
                      actions.setCurrentAnalysis(analysis);
                      navigation.navigate('AnalysisDetails', { analysisId: analysis.id });
                    }}
                  />
                </View>
              </Surface>
            ))
          )}
        </Card.Content>
      </Card>
    );
  };

  const MotilityTrendCard = () => {
    const chartData = getCompletedAnalysisData();

    return (
      <Card style={styles.card}>
        <Card.Title
          title={t('home.motilityTrend')}
          left={(props) => <Avatar.Icon {...props} icon="trending-up" />}
        />
        <Card.Content>
          {chartData ? (
            <LineChart
              data={chartData}
              width={width - 64}
              height={200}
              chartConfig={{
                backgroundColor: theme.colors.surface,
                backgroundGradientFrom: theme.colors.surface,
                backgroundGradientTo: theme.colors.surface,
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: theme.colors.primary,
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          ) : (
            <View style={styles.centerContainer}>
              <Icon name="show-chart" size={48} color={theme.colors.placeholder} />
              <Text style={[styles.body, { color: theme.colors.placeholder, textAlign: 'center' }]}>
                {t('graphs.noData')}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Header */}
      <Card style={[styles.card, { backgroundColor: theme.colors.primary }]}>
        <Card.Content>
          <Title style={{ color: 'white' }}>
            {t('home.welcome')}
          </Title>
          <Paragraph style={{ color: 'white', opacity: 0.9 }}>
            {t('home.description')}
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Server Status */}
      <ServerStatusCard />

      {/* Statistics Grid */}
      <View style={{ flexDirection: 'row', marginVertical: 8 }}>
        <StatCard
          title={t('home.totalAnalyses')}
          value={analyses.length.toString()}
          subtitle={t('common.total')}
          icon="biotech"
          color={theme.colors.primary}
        />
        <StatCard
          title={t('home.completedAnalyses')}
          value={analyses.filter(a => a.status === 'completed').length.toString()}
          subtitle={t('common.completed')}
          icon="check-circle"
          color={theme.colors.success}
        />
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        <StatCard
          title={t('home.averageMotility')}
          value={statistics?.averageMotility ? `${statistics.averageMotility.toFixed(1)}%` : '0%'}
          subtitle={t('results.motility')}
          icon="timeline"
          color={theme.colors.warning}
        />
        <StatCard
          title={t('home.averageDensity')}
          value={statistics?.averageDensity ? statistics.averageDensity.toFixed(2) : '0.00'}
          subtitle={t('results.density')}
          icon="scatter-plot"
          color={theme.colors.accent}
        />
      </View>

      {/* Quick Actions */}
      <QuickActionsCard />

      {/* Recent Analyses */}
      <RecentAnalysesCard />

      {/* Motility Trend Chart */}
      <MotilityTrendCard />
    </ScrollView>
  );
};

export default HomeScreen;