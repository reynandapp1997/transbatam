import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';

const InformationCard = ({detail, location}) => {
  return (
    <View style={styles.container}>
      <View>
        <Text>TransBatam : {detail.busId && detail.busId.plateNumber}</Text>
        <Text>Pengemudi: {detail.busId && detail.busId.driver}</Text>
      </View>
      <View style={styles.containerEstimation}>
        <Text>
          Jarak : {location.getEstimation.rows[0].elements[0].distance.text}
        </Text>
        <Text>
          Waktu: {location.getEstimation.rows[0].elements[0].duration.text}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
  },
  containerEstimation: {
    alignItems: 'flex-end',
    flex: 1,
  },
});

InformationCard.propTypes = {
  detail: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default InformationCard;
