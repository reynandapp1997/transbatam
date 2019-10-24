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
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import Geolocation from 'react-native-geolocation-service';
import MapView, {Marker} from 'react-native-maps';
import socket from 'socket.io-client';

import {
  getBusLocation,
  getEstimation,
  updateBusLocation,
} from '../redux/actions';

class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      region: {
        latitude: 1.1301,
        longitude: 104.0529,
        latitudeDelta: 1,
        longitudeDelta: 1,
      },
      coordinate: {
        latitude: 90,
        longitude: 180,
        latitudeDelta: 1,
        longitudeDelta: 1,
      },
      detail: {},
      height: new Animated.Value(-128),
    };
  }

  componentDidMount() {
    this.getPermission();
    this.props.getBusLocation();
    const listen = socket('https://transbatam-api.herokuapp.com');
    listen.on('location', e => {
      if (e.type === 'ADD_LOCATION') {
        console.log('update');
        this.update(e.payload);
      }
    });
  }

  getPermission = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'TransBatam',
          message: 'TransBatam ',
        },
      );
    } else if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
    }
    this.getCurrentLocation();
  };

  getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      success => {
        this.mapViewRef._component.animateToRegion(
          {
            latitude: success.coords.latitude,
            longitude: success.coords.longitude,
            latitudeDelta: 0.025,
            longitudeDelta: 0.025,
          },
          1000,
        );
        setTimeout(() => {
          this.setState({
            region: {
              latitude: success.coords.latitude,
              longitude: success.coords.longitude,
              latitudeDelta: 0,
              longitudeDelta: 0,
            },
            coordinate: {
              latitude: success.coords.latitude,
              longitude: success.coords.longitude,
              latitudeDelta: 0,
              longitudeDelta: 0,
            },
          });
        }, 1000);
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

  update = lastLocation => {
    const {latitude, longitude} = lastLocation.location.coordinates;
    this.moveMarker(
      latitude,
      longitude,
      1000,
      this[lastLocation.busId],
      lastLocation.busId,
    );
    this.props.updateBusLocation(
      this.props.location.getBusLocation,
      lastLocation,
    );
  };

  moveMarker = (latitude, longitude, duration, marker, busId) => {
    if (marker) {
      marker.animateMarkerToCoordinate(
        {
          latitude,
          longitude,
        },
        duration,
      );
      if (this.state.detail.busId) {
        if (this.state.detail.busId._id === busId) {
          this.mapViewRef._component.animateToRegion(
            {
              latitude,
              longitude,
              latitudeDelta: 0.025,
              longitudeDelta: 0.025,
            },
            1000,
          );
          setTimeout(() => {
            this.props.getEstimation(
              {
                latitude: this.state.coordinate.latitude,
                longitude: this.state.coordinate.longitude,
              },
              {
                latitude,
                longitude,
              },
            );
          }, 1000);
        }
      }
    }
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
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'flex-end',
                    }}>
                    <Animated.View
                      style={{
                        backgroundColor: 'white',
                        elevation: 5,
                        height: 128,
                        bottom: this.state.height,
                        justifyContent: 'center',
                      }}>
                      {this.props.location.getEstimationLoading ? (
                        <ActivityIndicator size={32} />
                      ) : this.state.detail.busId ? (
                        <View style={{flexDirection: 'row', padding: 16}}>
                          <View>
                            <Text>
                              TransBatam :{' '}
                              {this.state.detail.busId &&
                                this.state.detail.busId.plateNumber}
                            </Text>
                            <Text>
                              Pengemudi:{' '}
                              {this.state.detail.busId &&
                                this.state.detail.busId.driver}
                            </Text>
                          </View>
                          <View style={{alignItems: 'flex-end', flex: 1}}>
                            <Text>
                              Jarak :{' '}
                              {
                                this.props.location.getEstimation.rows[0]
                                  .elements[0].distance.text
                              }
                            </Text>
                            <Text>
                              Waktu:{' '}
                              {
                                this.props.location.getEstimation.rows[0]
                                  .elements[0].duration.text
                              }
                            </Text>
                          </View>
                        </View>
                      ) : null}
                    </Animated.View>
                  </View>
                  <MapView.Animated
                    ref={ref => (this.mapViewRef = ref)}
                    provider="google"
                    initialRegion={{
                      latitude: this.state.region.latitude,
                      longitude: this.state.region.longitude,
                      latitudeDelta: 0.025,
                      longitudeDelta: 0.025,
                    }}
                    style={{
                      width: Dimensions.get('screen').width,
                      height: Dimensions.get('screen').height - 80,
                      zIndex: 0,
                      position: 'absolute',
                    }}
                    showsTraffic>
                    <Marker
                      coordinate={{
                        latitude: this.state.coordinate.latitude,
                        longitude: this.state.coordinate.longitude,
                        latitudeDelta: 0.025,
                        longitudeDelta: 0.025,
                      }}
                      onPress={() => {
                        this.mapViewRef._component.animateToRegion(
                          {
                            latitude: this.state.coordinate.latitude,
                            longitude: this.state.coordinate.longitude,
                            latitudeDelta: 0.025,
                            longitudeDelta: 0.025,
                          },
                          1000,
                        );
                        setTimeout(() => {
                          this.setState({
                            region: {
                              latitude: this.state.coordinate.latitude,
                              longitude: this.state.coordinate.longitude,
                              latitudeDelta: 0.025,
                              longitudeDelta: 0.025,
                            },
                            detail: {},
                          });
                        }, 1000);
                        Animated.timing(this.state.height, {
                          toValue: -128,
                          duration: 1000,
                        }).start();
                      }}
                    />
                    {this.props.location.getBusLocation.data.map(el => (
                      <Marker
                        ref={ref => (this[el.busId._id] = ref)}
                        key={el._id}
                        coordinate={{
                          latitude: el.location.coordinates.latitude,
                          longitude: el.location.coordinates.longitude,
                          latitudeDelta: 0.025,
                          longitudeDelta: 0.025,
                        }}
                        onPress={() => {
                          if (
                            // eslint-disable-next-line eqeqeq
                            el.location.coordinates.latitude !=
                            this.state.region.latitude
                          ) {
                            this.mapViewRef._component.animateToRegion(
                              {
                                latitude: el.location.coordinates.latitude,
                                longitude: el.location.coordinates.longitude,
                                latitudeDelta: 0.025,
                                longitudeDelta: 0.025,
                              },
                              1000,
                            );
                            setTimeout(() => {
                              this.setState({
                                region: {
                                  latitude: el.location.coordinates.latitude,
                                  longitude: el.location.coordinates.longitude,
                                  latitudeDelta: 0.025,
                                  longitudeDelta: 0.025,
                                },
                                detail: el,
                              });
                              this.props.getEstimation(
                                {
                                  latitude: this.state.coordinate.latitude,
                                  longitude: this.state.coordinate.longitude,
                                },
                                {
                                  latitude: el.location.coordinates.latitude,
                                  longitude: el.location.coordinates.longitude,
                                },
                              );
                            }, 1000);
                            Animated.timing(this.state.height, {
                              toValue: 0,
                              duration: 1000,
                            }).start();
                          }
                        }}
                      />
                    ))}
                  </MapView.Animated>
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

const mapStateToProps = state => ({
  location: state.location,
});

const mapDispatchToProps = {
  getBusLocation,
  getEstimation,
  updateBusLocation,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(HomeScreen);
