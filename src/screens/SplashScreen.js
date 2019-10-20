/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {View, ActivityIndicator, Text} from 'react-native';

class SplashScreen extends Component {
  componentDidMount() {
    setTimeout(() => {
      this.props.navigation.navigate('Home');
    }, 2000);
  }

  render() {
    return (
      <>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{fontSize: 32, margin: 32}}>TransBatam</Text>
          <ActivityIndicator color="blue" size={32} />
        </View>
      </>
    );
  }
}

export default SplashScreen;
