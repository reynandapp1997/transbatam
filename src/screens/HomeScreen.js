/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect, useRef} from 'react';
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

import {getBusLocation, getEstimation} from '../redux/actions';

function HomeScreen(props) {
  const mapViewRef = useRef(null);
  const markerRef = useRef(null);
  const [region, setRegion] = useState({
    latitude: 1.1301,
    longitude: 104.0529,
    latitudeDelta: 1,
    longitudeDelta: 1,
  });
  const [coordinate, setCoordinate] = useState({
    latitude: 90,
    longitude: 180,
    latitudeDelta: 1,
    longitudeDelta: 1,
  });
  const [detail, setDetail] = useState({});
  const [height, setHeight] = useState(new Animated.Value(-128));

  useEffect(() => {
    const getPermission = async () => {
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
      getCurrentLocation();
    };
    const getCurrentLocation = () => {
      Geolocation.getCurrentPosition(
        success => {
          mapViewRef.current._component.animateToRegion(
            {
              latitude: success.coords.latitude,
              longitude: success.coords.longitude,
              latitudeDelta: 0.025,
              longitudeDelta: 0.025,
            },
            1000,
          );
          setTimeout(() => {
            setRegion({
              latitude: success.coords.latitude,
              longitude: success.coords.longitude,
              latitudeDelta: 0,
              longitudeDelta: 0,
            });
            setDetail({});
          }, 1000);
          setCoordinate({
            latitude: success.coords.latitude,
            longitude: success.coords.longitude,
            latitudeDelta: 0,
            longitudeDelta: 0,
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
    getPermission();
    props.getBusLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveMarker = (latitude, longitude, duration) => {
    if (Platform.OS === 'android') {
      markerRef.current._component.animateMarkerToCoordinate(
        {
          latitude,
          longitude,
        },
        duration,
      );
    } else if (Platform.OS === 'ios') {
      coordinate
        .timing({
          latitude,
          longitude,
          duration,
        })
        .start();
    }
    setTimeout(() => {
      setCoordinate({
        latitude,
        longitude,
        latitudeDelta: 1,
        longitudeDelta: 1,
      });
    }, duration);
  };

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
                      bottom: height,
                      justifyContent: 'center',
                    }}>
                    {props.location.getEstimationLoading ? (
                      <ActivityIndicator size={32} />
                    ) : detail.busId ? (
                      <View style={{flexDirection: 'row', padding: 16}}>
                        <View>
                          <Text>
                            TransBatam :{' '}
                            {detail.busId && detail.busId.plateNumber}
                          </Text>
                          <Text>
                            Pengemudi: {detail.busId && detail.busId.driver}
                          </Text>
                        </View>
                        <View style={{alignItems: 'flex-end', flex: 1}}>
                          <Text>
                            Jarak : {props.location.getEstimation.distance.text}
                          </Text>
                          <Text>
                            Waktu: {props.location.getEstimation.duration.text}
                          </Text>
                        </View>
                      </View>
                    ) : null}
                  </Animated.View>
                </View>
                <MapView.Animated
                  ref={mapViewRef}
                  provider="google"
                  region={{
                    latitude: region.latitude,
                    longitude: region.longitude,
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
                      latitude: coordinate.latitude,
                      longitude: coordinate.longitude,
                      latitudeDelta: 0.025,
                      longitudeDelta: 0.025,
                    }}
                    onPress={() => {
                      mapViewRef.current._component.animateToRegion(
                        {
                          latitude: coordinate.latitude,
                          longitude: coordinate.longitude,
                          latitudeDelta: 0.025,
                          longitudeDelta: 0.025,
                        },
                        1000,
                      );
                      setTimeout(() => {
                        setRegion({
                          latitude: coordinate.latitude,
                          longitude: coordinate.longitude,
                          latitudeDelta: 0.025,
                          longitudeDelta: 0.025,
                        });
                        setDetail({});
                      }, 1000);
                      Animated.timing(height, {
                        toValue: -128,
                        duration: 1000,
                      }).start();
                    }}
                  />
                  {props.location.getBusLocation.data.map(el => (
                    <Marker
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
                          el.location.coordinates.latitude != region.latitude
                        ) {
                          mapViewRef.current._component.animateToRegion(
                            {
                              latitude: el.location.coordinates.latitude,
                              longitude: el.location.coordinates.longitude,
                              latitudeDelta: 0.025,
                              longitudeDelta: 0.025,
                            },
                            1000,
                          );
                          setTimeout(() => {
                            setRegion({
                              latitude: el.location.coordinates.latitude,
                              longitude: el.location.coordinates.longitude,
                              latitudeDelta: 0.025,
                              longitudeDelta: 0.025,
                            });
                            setDetail(el);
                            props.getEstimation(
                              {
                                latitude: coordinate.latitude,
                                longitude: coordinate.longitude,
                              },
                              {
                                latitude: el.location.coordinates.latitude,
                                longitude: el.location.coordinates.longitude,
                              },
                            );
                          }, 1000);
                          Animated.timing(height, {
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
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(HomeScreen);
