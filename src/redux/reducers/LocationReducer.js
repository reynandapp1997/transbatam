export default (
  state = {
    location: {
      length: 0,
      data: [],
    },
    loading: false,
    message: '',
  },
  action,
) => {
  switch (action.type) {
    case 'GET_BUS_LOCATION':
      return {
        ...state,
        loading: true,
        message: '',
      };
    case 'BUS_LOCATION_RESULT':
      return {
        ...state,
        location: action.payload,
        loading: false,
        message: '',
      };
    case 'BUS_LOCATION_ERROR':
      return {
        ...state,
        loading: false,
        message: action.payload,
      };
    default:
      return state;
  }
};
