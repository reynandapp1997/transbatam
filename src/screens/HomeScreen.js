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
  Easing,
  Button,
  Picker,
} from 'react-native';
import {connect} from 'react-redux';
import Geolocation from 'react-native-geolocation-service';
import MapView, {Marker} from 'react-native-maps';
import socket from 'socket.io-client';
import MapViewDirections from 'react-native-maps-directions';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  getBusLocation,
  getEstimation,
  updateBusLocation,
} from '../redux/actions';

const GOOGLE_MAPS_APIKEY = 'yourapigoeshere';

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
      userMarker: {
        latitude: 90,
        longitude: 180,
        latitudeDelta: 1,
        longitudeDelta: 1,
      },
      busMarker: {
        latitude: 90,
        longitude: 180,
        latitudeDelta: 1,
        longitudeDelta: 1,
      },
      detail: {},
      height: new Animated.Value(-128),
      showActionButton: true,
      filterHeight: new Animated.Value(-384),
      origins: '',
      destinations: '',
    };
  }

  componentDidMount() {
    this.getPermission();
    this.props.getBusLocation();
    const listen = socket('https://transbatam-api.herokuapp.com');
    listen.on('location', e => {
      if (
        e.type === 'ADD_LOCATION' &&
        this.props.location.getBusLocation.length > 0
      ) {
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
        this.animateRegion(success.coords.latitude, success.coords.longitude);
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

  animateRegion = (lat, long) => {
    this.mapViewRef._component.animateToRegion(
      {
        latitude: lat,
        longitude: long,
        latitudeDelta: 0.025,
        longitudeDelta: 0.025,
      },
      1000,
    );
    setTimeout(() => {
      this.setState({
        region: {
          latitude: lat,
          longitude: long,
          latitudeDelta: 0,
          longitudeDelta: 0,
        },
        userMarker: {
          latitude: lat,
          longitude: long,
          latitudeDelta: 0,
          longitudeDelta: 0,
        },
      });
    }, 1000);
  };

  calculateRegionBetweenCoordinates = points => {
    let minX, maxX, minY, maxY;
    (point => {
      minX = point.latitude;
      maxX = point.latitude;
      minY = point.longitude;
      maxY = point.longitude;
    })(points[0]);

    points.map(point => {
      minX = Math.min(minX, point.latitude);
      maxX = Math.max(maxX, point.latitude);
      minY = Math.min(minY, point.longitude);
      maxY = Math.max(maxY, point.longitude);
    });

    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    const deltaX = maxX - minX;
    const deltaY = maxY - minY;

    return {
      latitude: midX,
      longitude: midY,
      latitudeDelta: deltaX + 0.005,
      longitudeDelta: deltaY + 0.005,
    };
  };

  update = lastLocation => {
    const {latitude, longitude} = lastLocation.location.coordinates;
    this.moveMarker(latitude, longitude, 1000, lastLocation.busId);
    this.props.updateBusLocation(
      this.props.location.getBusLocation,
      lastLocation,
    );
  };

  moveMarker = (latitude, longitude, duration, busId) => {
    if (this.state.detail.busId) {
      if (this.state.detail.busId._id === busId) {
        const coord = this.calculateRegionBetweenCoordinates([
          {
            latitude,
            longitude,
          },
          {
            latitude: this.state.userMarker.latitude,
            longitude: this.state.userMarker.longitude,
          },
        ]);
        this.mapViewRef._component.animateToRegion(coord, 1000);
        setTimeout(() => {
          this.props.getEstimation(
            {
              latitude,
              longitude,
            },
            {
              latitude: this.state.userMarker.latitude,
              longitude: this.state.userMarker.longitude,
            },
          );
          this.setState({
            busMarker: {
              latitude,
              longitude,
              latitudeDelta: 0.025,
              longitudeDelta: 0.025,
            },
          });
        }, 1000);
      }
    }
  };

  animateToUserMarker = () => {
    this.mapViewRef._component.animateToRegion(
      {
        latitude: this.state.userMarker.latitude,
        longitude: this.state.userMarker.longitude,
        latitudeDelta: 0.025,
        longitudeDelta: 0.025,
      },
      1000,
    );
    setTimeout(() => {
      this.setState({
        region: {
          latitude: this.state.userMarker.latitude,
          longitude: this.state.userMarker.longitude,
          latitudeDelta: 0.025,
          longitudeDelta: 0.025,
        },
        busMarker: {
          latitude: this.state.userMarker.latitude,
          longitude: this.state.userMarker.longitude,
          latitudeDelta: 0.025,
          longitudeDelta: 0.025,
        },
        detail: {},
        showActionButton: true,
      });
    }, 1000);
    Animated.timing(this.state.height, {
      toValue: -128,
      duration: 1000,
      easing: Easing.in(),
    }).start();
    Animated.timing(this.state.filterHeight, {
      toValue: -384,
      duration: 1000,
      easing: Easing.in(),
    }).start();
  };

  animateToBusMarker = el => {
    const coord = this.calculateRegionBetweenCoordinates([
      {
        latitude: el.location.coordinates.latitude,
        longitude: el.location.coordinates.longitude,
      },
      {
        latitude: this.state.userMarker.latitude,
        longitude: this.state.userMarker.longitude,
      },
    ]);
    if (
      // eslint-disable-next-line eqeqeq
      el.location.coordinates.latitude != this.state.region.latitude
    ) {
      this.mapViewRef._component.animateToRegion(coord, 1000);
      setTimeout(() => {
        this.setState({
          region: {
            latitude: el.location.coordinates.latitude,
            longitude: el.location.coordinates.longitude,
            latitudeDelta: 0.025,
            longitudeDelta: 0.025,
          },
          busMarker: {
            latitude: el.location.coordinates.latitude,
            longitude: el.location.coordinates.longitude,
            latitudeDelta: 0.025,
            longitudeDelta: 0.025,
          },
          detail: el,
          showActionButton: false,
        });
        this.props.getEstimation(
          {
            latitude: this.state.userMarker.latitude,
            longitude: this.state.userMarker.longitude,
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
        easing: Easing.in(),
      }).start();
      Animated.timing(this.state.filterHeight, {
        toValue: -384,
        duration: 1000,
        easing: Easing.in(),
      }).start();
    }
  };

  render() {
    let busLocation = this.props.location.getBusLocation.data;
    if (this.state.origins && this.state.destinations) {
      busLocation = this.props.location.getBusLocation.data.filter(
        el =>
          el.busId.entryPoint.includes(this.state.origins) &&
          el.busId.entryPoint.includes(this.state.destinations),
      );
    }
    const halte = [
      'Halte Politeknik Negeri Batam',
      'Halte Franky',
      'Halte Duta Mas',
      'Halte Simpang Kabil',
      'Halte Casa Panbil',
      'Halte Muka Kuning',
      'Halte Tiban',
      'Halte UIB',
      'Halte Permata',
      'Halte Pantai Permata',
      'Halte BCS',
    ];
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#072F5F" />
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
                    {this.state.showActionButton && (
                      <ActionButton
                        onPress={() => {
                          this.setState({showActionButton: false});
                          Animated.timing(this.state.filterHeight, {
                            toValue: -128,
                            duration: 1000,
                            easing: Easing.in(),
                          }).start();
                        }}
                        style={{zIndex: 1}}
                        buttonColor="#072F5F"
                        renderIcon={() => (
                          <Icon name="directions" color="yellow" size={24} />
                        )}
                      />
                    )}
                    <Animated.View
                      style={{
                        backgroundColor: 'white',
                        elevation: 5,
                        height: 256,
                        bottom: this.state.filterHeight,
                        zIndex: 6,
                        padding: 16,
                      }}>
                      <View>
                        <Text>Dari</Text>
                        <Picker
                          selectedValue={this.state.origins}
                          onValueChange={e => {
                            this.setState({origins: e});
                          }}>
                          <Picker.Item label="Pilih Halte" value="" />
                          {halte.map((el, index) => (
                            <Picker.Item key={index} label={el} value={el} />
                          ))}
                        </Picker>
                      </View>
                      <View>
                        <Text>Tujuan</Text>
                        <Picker
                          selectedValue={this.state.destinations}
                          onValueChange={e => {
                            this.setState({destinations: e});
                          }}>
                          <Picker.Item label="Pilih Halte" value="" />
                          {halte.map((el, index) => (
                            <Picker.Item key={index} label={el} value={el} />
                          ))}
                        </Picker>
                      </View>
                      <Button
                        title="Filter"
                        onPress={() => {
                          this.setState({showActionButton: true});
                          Animated.timing(this.state.filterHeight, {
                            toValue: -384,
                            duration: 1000,
                            easing: Easing.in(),
                          }).start();
                        }}
                      />
                    </Animated.View>
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
                  {this.props.location.getBusLocationLoading && (
                    <View
                      style={{
                        position: 'absolute',
                        zIndex: 2,
                        width: Dimensions.get('screen').width,
                        height: Dimensions.get('screen').height,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      }}>
                      <ActivityIndicator color="yellow" size={32} />
                    </View>
                  )}
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
                    }}>
                    {this.state.userMarker.latitude !==
                      this.state.busMarker.latitude && (
                      <MapViewDirections
                        destination={this.state.userMarker}
                        origin={this.state.busMarker}
                        apikey={GOOGLE_MAPS_APIKEY}
                        strokeWidth={3}
                        strokeColor="#072F5F"
                      />
                    )}
                    <Marker
                      coordinate={{
                        latitude: this.state.userMarker.latitude,
                        longitude: this.state.userMarker.longitude,
                        latitudeDelta: 0.025,
                        longitudeDelta: 0.025,
                      }}
                      onPress={() => {
                        this.animateToUserMarker();
                      }}
                    />
                    {busLocation.map(el => (
                      <Marker
                        key={el._id}
                        coordinate={{
                          latitude: el.location.coordinates.latitude,
                          longitude: el.location.coordinates.longitude,
                          latitudeDelta: 0.025,
                          longitudeDelta: 0.025,
                        }}
                        image={require('../assets/bus.png')}
                        onPress={() => {
                          this.animateToBusMarker(el);
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
