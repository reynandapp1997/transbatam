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
} from 'react-native';
import {connect} from 'react-redux';
import Geolocation from 'react-native-geolocation-service';
import MapView, {Marker, AnimatedRegion} from 'react-native-maps';

import {getBusLocation, getEstimation} from '../redux/actions';

function HomeScreen(props) {
  const marker = useRef(null);
  const [region, setRegion] = useState({
    latitude: 90,
    longitude: 180,
    latitudeDelta: 1,
    longitudeDelta: 1,
  });
  const [coordinate, setCoordinate] = useState(
    new AnimatedRegion({
      latitude: 1.125802,
      longitude: 104.056964,
      latitudeDelta: 1,
      longitudeDelta: 1,
    }),
  );

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
          setRegion({
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
      marker.current._component.animateMarkerToCoordinate(
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
                  </View>
                </View>
                <MapView
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
                      latitude: region.latitude,
                      longitude: region.longitude,
                      latitudeDelta: 0.025,
                      longitudeDelta: 0.025,
                    }}
                  />
                  {props.location.location.data.map(el => (
                    <Marker
                      key={el._id}
                      coordinate={{
                        latitude: el.location.coordinates.latitude,
                        longitude: el.location.coordinates.longitude,
                        latitudeDelta: 0.025,
                        longitudeDelta: 0.025,
                      }}
                      onPress={() => {
                        props.getEstimation(
                          {
                            latitude: region.latitude,
                            longitude: region.longitude,
                          },
                          {
                            latitude: el.location.coordinates.latitude,
                            longitude: el.location.coordinates.longitude,
                          },
                        );
                      }}
                    />
                  ))}
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
