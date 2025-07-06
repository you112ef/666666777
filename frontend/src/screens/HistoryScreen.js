import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Button,
  IconButton,
  Chip,
  Searchbar,
  Portal,
  Dialog,
  Menu,
  Divider,
  FAB,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AnalysisContext } from '../services/AnalysisContext';
import apiService from '../services/apiService';
import { theme } from '../utils/theme';

const HistoryScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { analyses, setAnalyses, removeAnalysis } = useContext(AnalysisContext);
  const [filteredAnalyses, setFilteredAnalyses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterAndSortAnalyses();
  }, [analyses, searchQuery, sortBy, sortOrder, filterStatus]);

  const loadHistory = async () => {
    try {
      const history = await apiService.getAnalysisHistory();
      setAnalyses(history);
    } catch (error) {
      Alert.alert(t('common.error'), error.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const filterAndSortAnalyses = () => {
    let filtered = [...analyses];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(analysis =>
        analysis.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        new Date(analysis.created_at).toLocaleDateString().includes(searchQuery)
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(analysis => analysis.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'duration':
          aValue = a.duration || 0;
          bValue = b.duration || 0;
          break;
        case 'motility':
          aValue = a.results?.motility_percentage || 0;
          bValue = b.results?.motility_percentage || 0;
          break;
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredAnalyses(filtered);
  };

  const handleDelete = async (analysis) => {
    setSelectedAnalysis(analysis);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await apiService.deleteAnalysis(selectedAnalysis.id);
      removeAnalysis(selectedAnalysis.id);
      setDeleteDialogVisible(false);
      setSelectedAnalysis(null);
      Alert.alert(t('common.success'), t('history.deleteSuccess'));
    } catch (error) {
      Alert.alert(t('common.error'), error.message);
    }
  };

  const viewAnalysis = (analysis) => {
    navigation.navigate('AnalysisDetails', { analysisId: analysis.id });
  };

  const viewResults = (analysis) => {
    navigation.navigate('Results', { analysisId: analysis.id });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return theme.colors.success || '#4CAF50';
      case 'processing':
        return theme.colors.warning || '#FF9800';
      case 'failed':
        return theme.colors.error || '#F44336';
      default:
        return theme.colors.surfaceVariant;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'processing':
        return 'hourglass-empty';
      case 'failed':
        return 'error';
      default:
        return 'help';
    }
  };

  const renderAnalysisItem = ({ item }) => (
    <Card style={styles.analysisCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.analysisInfo}>
            <Text style={styles.analysisId}>Analysis {item.id.slice(-8)}</Text>
            <Text style={styles.analysisDate}>
              {new Date(item.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <Chip
            icon={getStatusIcon(item.status)}
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={styles.statusText}
          >
            {item.status}
          </Chip>
        </View>

        {item.results && (
          <View style={styles.resultsPreview}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Sperm Count</Text>
              <Text style={styles.metricValue}>{item.results.total_sperm || 'N/A'}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Motility</Text>
              <Text style={styles.metricValue}>
                {item.results.motility_percentage ? `${item.results.motility_percentage.toFixed(1)}%` : 'N/A'}
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Duration</Text>
              <Text style={styles.metricValue}>
                {item.duration ? `${Math.round(item.duration)}s` : 'N/A'}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.cardActions}>
          <Button
            mode="outlined"
            onPress={() => viewAnalysis(item)}
            style={styles.actionButton}
            icon="visibility"
          >
            {t('history.view')}
          </Button>
          {item.status === 'completed' && (
            <Button
              mode="contained"
              onPress={() => viewResults(item)}
              style={styles.actionButton}
              icon="assessment"
            >
              Results
            </Button>
          )}
          <IconButton
            icon="delete"
            size={20}
            onPress={() => handleDelete(item)}
            style={styles.deleteButton}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="history" size={64} color={theme.colors.disabled} />
      <Text style={styles.emptyText}>{t('history.empty')}</Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Analysis')}
        style={styles.emptyButton}
      >
        Start New Analysis
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search analyses..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <View style={styles.filters}>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setMenuVisible(true)}
                icon="filter-list"
                style={styles.filterButton}
              >
                Filter & Sort
              </Button>
            }
          >
            <Menu.Item
              title="All Status"
              onPress={() => { setFilterStatus('all'); setMenuVisible(false); }}
            />
            <Menu.Item
              title="Completed"
              onPress={() => { setFilterStatus('completed'); setMenuVisible(false); }}
            />
            <Menu.Item
              title="Processing"
              onPress={() => { setFilterStatus('processing'); setMenuVisible(false); }}
            />
            <Menu.Item
              title="Failed"
              onPress={() => { setFilterStatus('failed'); setMenuVisible(false); }}
            />
            <Divider />
            <Menu.Item
              title="Sort by Date"
              onPress={() => { setSortBy('date'); setMenuVisible(false); }}
            />
            <Menu.Item
              title="Sort by Status"
              onPress={() => { setSortBy('status'); setMenuVisible(false); }}
            />
            <Menu.Item
              title="Sort by Motility"
              onPress={() => { setSortBy('motility'); setMenuVisible(false); }}
            />
          </Menu>
        </View>
      </View>

      <FlatList
        data={filteredAnalyses}
        renderItem={renderAnalysisItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => navigation.navigate('Analysis')}
      />

      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>{t('history.deleteConfirm')}</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to delete this analysis? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>
              {t('common.cancel')}
            </Button>
            <Button onPress={confirmDelete} textColor={theme.colors.error}>
              {t('common.delete')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  searchbar: {
    marginBottom: 12,
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButton: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  analysisCard: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  analysisInfo: {
    flex: 1,
  },
  analysisId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  analysisDate: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  statusChip: {
    marginLeft: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
  },
  resultsPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 8,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  deleteButton: {
    margin: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default HistoryScreen;