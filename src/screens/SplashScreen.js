/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {View, ActivityIndicator, Text, StatusBar} from 'react-native';

class SplashScreen extends Component {
  componentDidMount() {
    setTimeout(() => {
      this.props.navigation.navigate('Home');
    }, 1000);
  }

  render() {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#072F5F" />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#072F5F',
          }}>
          <Text
            style={{
              fontSize: 32,
              margin: 32,
              color: 'white',
              fontWeight: 'bold',
            }}>
            TransBatam
          </Text>
          <ActivityIndicator color="yellow" size={32} />
        </View>
      </>
    );
  }
}

export default SplashScreen;
