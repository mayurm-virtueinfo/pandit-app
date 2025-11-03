import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList, SafeAreaView} from 'react-native';
import {apiService} from '../api/apiService';
import CustomHeader from '../components/CustomHeader';
import {useTranslation} from 'react-i18next';
// import { CustomHeader } from '../components/CustomHeader';
// import { COLORS } from '../constants/colors';

interface CancellationPolicy {
  id: number;
  description: string;
}

const CancellationPolicyScreen: React.FC = () => {
  const [cancellationPolicies, setCancellationPolicies] = useState<
    CancellationPolicy[]
  >([]);

  const {t} = useTranslation();

  const fetchCancellationPolicies = async () => {
    const requests = await apiService.getCancellationPolicy();
    console.log('Fetched Cancellation Policies Request:', requests);
    setCancellationPolicies(requests);
  };

  useEffect(() => {
    fetchCancellationPolicies();
  }, []);

  const renderPolicyItem = ({
    item,
    index,
  }: {
    item: CancellationPolicy;
    index: number;
  }) => (
    <Text style={styles.policyText}>
      {index + 1}. {item.description}
    </Text>
  );

  return (
    <View style={styles.container}>
      <CustomHeader
        showBackButton={true}
        showMenuButton={false}
        title={t('cancellation_policy')}
      />
      <FlatList
        data={cancellationPolicies}
        keyExtractor={item => item.id.toString()}
        renderItem={renderPolicyItem}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBFC',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  policyText: {
    fontSize: 15,
    color: '#1C1C1E',
    marginBottom: 12,
  },
});

export default CancellationPolicyScreen;
