import {put, takeLatest, all} from 'redux-saga/effects';

const domain = 'https://transbatam-api.herokuapp.com';

function* fetchBusLocation() {
  const result = yield fetch(`${domain}/api/location`, {
    method: 'GET',
  })
    .then(async results => {
      const response = await results.json();
      if (results.status === 200) {
        return {type: 'BUS_LOCATION_RESULT', payload: response};
      } else if (results.status === 400) {
        return {type: 'BUS_LOCATION_ERROR', payload: response.message};
      }
    })
    .catch(error => {
      return {type: 'BUS_LOCATION_ERROR', payload: error};
    });
  yield put(result);
}

function* fetchEstimation(params) {
  const {origins, destinations} = params.payload;
  const result = yield fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${
      origins.latitude
    },${origins.longitude}&destinations=${destinations.latitude},${
      destinations.longitude
    }&key=yourapigoeshere`,
    {
      method: 'GET',
    },
  )
    .then(async results => {
      const response = await results.json();
      if (response.status === 'OK') {
        return {
          type: 'ESTIMATION_RESULT',
          payload: response,
        };
      } else {
        return {type: 'ESTIMATION_ERROR', payload: response.status};
      }
    })
    .catch(error => {
      return {type: 'ESTIMATION_ERROR', payload: error};
    });
  yield put(result);
}

function* updateBusLocation(params) {
  const {prevProps, newLocation} = params.payload;
  const newProps = prevProps.data.map(el => {
    if (el.busId._id === newLocation.busId) {
      return {
        ...el,
        location: {
          coordinates: {
            latitude: newLocation.location.coordinates.latitude,
            longitude: newLocation.location.coordinates.longitude,
          },
        },
      };
    }
    return {
      ...el,
    };
  });
  const payload = {
    length: newProps.length,
    data: newProps,
  };
  yield put({type: 'BUS_LOCATION_RESULT', payload});
}

function* getBusLocationWatcher() {
  yield takeLatest('GET_BUS_LOCATION', fetchBusLocation.bind(this));
}

function* getEstimationWatcher() {
  yield takeLatest('GET_ESTIMATION', fetchEstimation.bind(this));
}

function* updateBusLocationWatcher() {
  yield takeLatest('UPDATE_BUS_LOCATION', updateBusLocation.bind(this));
}

export default function* rootSaga() {
  yield all([
    getBusLocationWatcher(),
    getEstimationWatcher(),
    updateBusLocationWatcher(),
  ]);
}
