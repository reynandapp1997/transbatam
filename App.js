/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  Dimensions,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      region: {
        latitude: 90,
        longitude: 180,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
    };
  }

  async componentDidMount() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'BKS',
          message: 'BKS ',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Permission granted');
      } else {
        console.log('Permission denied');
      }
    } else if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
    }
    this.getCurrentLocation();
  }

  getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      success => {
        this.setState({
          region: {
            latitude: success.coords.latitude,
            longitude: success.coords.longitude,
            latitudeDelta: 0,
            longitudeDelta: 0,
          },
        });
      },
      error => {
        console.log(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  render() {
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <KeyboardAvoidingView
            behavior="height"
            style={styles.container}
            keyboardVerticalOffset={30}>
            <ScrollView
              contentInsetAdjustmentBehavior="automatic"
              keyboardShouldPersistTaps="handled">
              <View style={styles.viewContainer}>
                <View style={{height: 80}} />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    justifyContent: 'flex-start',
    height: Dimensions.get('screen').height,
  },
  viewContainer: {
    padding: 0,
  },
});

export default App;
