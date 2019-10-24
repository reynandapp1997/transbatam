export default (
  state = {
    getBusLocation: {
      length: 0,
      data: [],
    },
    getBusLocationLoading: false,
    getBusLocationMessage: '',
    getEstimation: {
      destination_addresses: [''],
      origin_addresses: [''],
      rows: [
        {
          elements: [
            {
              distance: {
                text: '0 km',
                value: 0,
              },
              duration: {
                text: '0 mins',
                value: 0,
              },
              status: 'OK',
            },
          ],
        },
      ],
      status: 'OK',
    },
    getEstimationLoading: false,
    getEstimationMessage: '',
  },
  action,
) => {
  switch (action.type) {
    case 'GET_BUS_LOCATION':
      return {
        ...state,
        getBusLocationLoading: true,
        getBusLocationMessage: '',
      };
    case 'BUS_LOCATION_RESULT':
      return {
        ...state,
        getBusLocation: action.payload,
        getBusLocationLoading: false,
        getBusLocationMessage: '',
      };
    case 'BUS_LOCATION_ERROR':
      return {
        ...state,
        getBusLocationLoading: false,
        getBusLocationMessage: action.payload,
      };
    case 'GET_ESTIMATION':
      return {
        ...state,
        getEstimationLoading: true,
        getEstimationMessage: '',
      };
    case 'ESTIMATION_RESULT':
      return {
        ...state,
        getEstimation: action.payload,
        getEstimationLoading: false,
        getEstimationMessage: '',
      };
    case 'ESTIMATION_ERROR':
      return {
        ...state,
        getEstimationLoading: false,
        getEstimationMessage: action.payload,
      };
    default:
      return state;
  }
};
