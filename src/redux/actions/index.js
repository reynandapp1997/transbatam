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
