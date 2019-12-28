import React from 'react';
import {View, Text, Picker} from 'react-native';
import PropTypes from 'prop-types';

const HalteOptions = ({label, selectedValue, onValueChange, halte}) => {
  return (
    <View>
      <Text>Dari</Text>
      <Picker selectedValue={selectedValue} onValueChange={onValueChange}>
        <Picker.Item label="Pilih Halte" value="" />
        {halte.map((el, index) => (
          <Picker.Item key={index} label={el} value={el} />
        ))}
      </Picker>
    </View>
  );
};

HalteOptions.propTypes = {
  label: PropTypes.string.isRequired,
  selectedValue: PropTypes.string.isRequired,
  onValueChange: PropTypes.func.isRequired,
  halte: PropTypes.array.isRequired,
};

export default HalteOptions;
