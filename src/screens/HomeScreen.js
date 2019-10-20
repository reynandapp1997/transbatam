/* eslint-disable react-native/no-inline-styles */
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
  Text,
  ActivityIndicator,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import MapView, {Marker} from 'react-native-maps';

class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      region: {
        latitude: 90,
        longitude: 180,
        latitudeDelta: 1,
        longitudeDelta: 1,
      },
      detail: false,
      loading: false,
    };
  }

  async componentDidMount() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'TransBatam',
          message: 'TransBatam ',
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
                <View style={{height: Dimensions.get('screen').height - 80}}>
                  {this.state.detail && (
                    <View
                      style={{
                        padding: 32,
                        flex: 1,
                        justifyContent: 'flex-end',
                      }}>
                      <View
                        style={{
                          backgroundColor: 'white',
                          elevation: 5,
                          borderRadius: 8,
                          padding: 16,
                        }}>
                        {this.state.loading ? (
                          <ActivityIndicator />
                        ) : (
                          <View style={{flexDirection: 'row'}}>
                            <View>
                              <Text>TransBatam : BP 123 AB</Text>
                              <Text>Pengemudi: Reynanda</Text>
                              <Text>Status: Diperjalanan</Text>
                            </View>
                            <View style={{alignItems: 'flex-end', flex: 1}}>
                              <Text>Jarak : 120 meter</Text>
                              <Text>Waktu: 1 menit</Text>
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                  <MapView
                    provider="google"
                    region={{
                      latitude: this.state.region.latitude,
                      longitude: this.state.region.longitude,
                      latitudeDelta: 0.075,
                      longitudeDelta: 0.075,
                    }}
                    style={{
                      width: Dimensions.get('screen').width,
                      height: Dimensions.get('screen').height - 80,
                      zIndex: 0,
                      position: 'absolute',
                    }}>
                    <Marker
                      coordinate={{
                        latitude: this.state.region.latitude,
                        longitude: this.state.region.longitude,
                        latitudeDelta: 0.075,
                        longitudeDelta: 0.075,
                      }}
                      onPress={() => {
                        this.setState((state, props) => ({
                          detail: !state.detail,
                          loading: true,
                        }));
                        setTimeout(() => {
                          this.setState({loading: false});
                        }, 2000);
                      }}
                    />
                  </MapView>
                </View>
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

export default HomeScreen;
