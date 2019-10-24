export const getBusLocation = () => ({
  type: 'GET_BUS_LOCATION',
});

export const getEstimation = (origins, destinations) => ({
  type: 'GET_ESTIMATION',
  payload: {
    origins,
    destinations,
  },
});

export const updateBusLocation = (prevProps, newLocation) => ({
  type: 'UPDATE_BUS_LOCATION',
  payload: {
    prevProps,
    newLocation,
  },
});
