import React from 'react';
import {
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';

const Container = ({statusBarColor, statusBarStyle, children}) => {
  return (
    <>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarColor ? statusBarColor : 'black'}
      />
      <SafeAreaView>
        <KeyboardAvoidingView
          behavior="height"
          style={styles.container}
          keyboardVerticalOffset={30}>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            keyboardShouldPersistTaps="handled">
            <View style={styles.viewContainer}>
              {children}
              <View style={styles.helper} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    justifyContent: 'flex-start',
    height: Dimensions.get('screen').height,
  },
  viewContainer: {
    padding: 0,
  },
  helper: {
    height: 80,
  },
});

Container.propTypes = {
  statusBarColor: PropTypes.string,
  statusBarStyle: PropTypes.oneOf(['dark-content', 'light-content']).isRequired,
};

export default Container;
