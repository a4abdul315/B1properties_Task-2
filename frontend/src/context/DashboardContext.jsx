import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import {
  fetchAlerts,
  fetchCompetitors,
  fetchMarketHeat,
  fetchPriceTracker,
  fetchListingVelocity,
} from '../services/dashboardApi';
import { connectAlertSocket, disconnectAlertSocket } from '../services/alertSocket';

const DashboardContext = createContext(null);

const initialState = {
  filters: {
    area: '',
    competitor: '',
    category: '',
    days: 30,
    groupBy: 'week',
  },
  options: {
    areas: [
      'dubai-marina',
      'downtown-dubai',
      'business-bay',
      'jlt',
      'palm-jumeirah',
      'dubai-hills',
      'dubai-creek-harbour',
      'al-barsha',
    ],
    categories: ['residential', 'commercial', 'luxury'],
    competitors: [],
  },
  data: {
    priceTracker: null,
    listingVelocity: null,
    marketHeat: null,
    alerts: [],
  },
  loading: {
    bootstrap: true,
    insights: false,
    alerts: false,
  },
  realtime: {
    connected: false,
  },
  error: null,
};

const actionTypes = {
  SET_FILTER: 'SET_FILTER',
  LOAD_START: 'LOAD_START',
  LOAD_SUCCESS: 'LOAD_SUCCESS',
  LOAD_FAILURE: 'LOAD_FAILURE',
  SET_COMPETITORS: 'SET_COMPETITORS',
  SET_ALERTS_LOADING: 'SET_ALERTS_LOADING',
  SET_ALERTS: 'SET_ALERTS',
  PREPEND_ALERT: 'PREPEND_ALERT',
  UPDATE_ALERT: 'UPDATE_ALERT',
  SET_SOCKET_STATUS: 'SET_SOCKET_STATUS',
};

function dashboardReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_FILTER:
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.name]: action.payload.value,
        },
      };
    case actionTypes.LOAD_START:
      return {
        ...state,
        loading: {
          ...state.loading,
          bootstrap: action.payload.bootstrap ?? state.loading.bootstrap,
          insights: true,
        },
        error: null,
      };
    case actionTypes.LOAD_SUCCESS:
      return {
        ...state,
        data: {
          ...state.data,
          ...action.payload,
        },
        loading: {
          ...state.loading,
          bootstrap: false,
          insights: false,
        },
        error: null,
      };
    case actionTypes.LOAD_FAILURE:
      return {
        ...state,
        loading: {
          ...state.loading,
          bootstrap: false,
          insights: false,
        },
        error: action.payload,
      };
    case actionTypes.SET_COMPETITORS:
      return {
        ...state,
        options: {
          ...state.options,
          competitors: action.payload,
        },
      };
    case actionTypes.SET_ALERTS_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          alerts: action.payload,
        },
      };
    case actionTypes.SET_ALERTS:
      return {
        ...state,
        data: {
          ...state.data,
          alerts: action.payload,
        },
        loading: {
          ...state.loading,
          alerts: false,
        },
      };
    case actionTypes.PREPEND_ALERT:
      return {
        ...state,
        data: {
          ...state.data,
          alerts: [action.payload, ...state.data.alerts.filter((alert) => alert._id !== action.payload._id)],
        },
      };
    case actionTypes.UPDATE_ALERT:
      return {
        ...state,
        data: {
          ...state.data,
          alerts: state.data.alerts.map((alert) =>
            alert._id === action.payload._id ? action.payload : alert
          ),
        },
      };
    case actionTypes.SET_SOCKET_STATUS:
      return {
        ...state,
        realtime: {
          connected: action.payload,
        },
      };
    default:
      return state;
  }
}

const buildInsightParams = (filters) => {
  return {
    ...(filters.area ? { area: filters.area } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.competitor ? { competitor: filters.competitor } : {}),
    days: filters.days,
    groupBy: filters.groupBy,
  };
};

export function DashboardProvider({ children }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  useEffect(() => {
    async function bootstrap() {
      try {
        const competitorsResponse = await fetchCompetitors();
        dispatch({
          type: actionTypes.SET_COMPETITORS,
          payload: competitorsResponse,
        });
      } catch (error) {
        dispatch({
          type: actionTypes.LOAD_FAILURE,
          payload: error.message || 'Failed to load filter options',
        });
      }
    }

    bootstrap();
  }, []);

  useEffect(() => {
    async function loadInsights() {
      dispatch({
        type: actionTypes.LOAD_START,
        payload: {
          bootstrap: state.loading.bootstrap,
        },
      });

      try {
        const params = buildInsightParams(state.filters);
        const [priceTracker, listingVelocity, marketHeat] = await Promise.all([
          fetchPriceTracker(params),
          fetchListingVelocity(params),
          fetchMarketHeat(params),
        ]);

        dispatch({
          type: actionTypes.LOAD_SUCCESS,
          payload: {
            priceTracker,
            listingVelocity,
            marketHeat,
          },
        });
      } catch (error) {
        dispatch({
          type: actionTypes.LOAD_FAILURE,
          payload: error.message || 'Failed to load dashboard insights',
        });
      }
    }

    loadInsights();
  }, [state.filters]);

  useEffect(() => {
    let isMounted = true;

    async function loadAlerts() {
      dispatch({
        type: actionTypes.SET_ALERTS_LOADING,
        payload: true,
      });

      try {
        const alerts = await fetchAlerts();

        if (isMounted) {
          dispatch({
            type: actionTypes.SET_ALERTS,
            payload: alerts,
          });
        }
      } catch (error) {
        if (isMounted) {
          dispatch({
            type: actionTypes.LOAD_FAILURE,
            payload: error.message || 'Failed to load alerts',
          });
        }
      }
    }

    loadAlerts();
    const intervalId = window.setInterval(loadAlerts, 45000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const socket = connectAlertSocket();

    socket.on('connect', () => {
      dispatch({
        type: actionTypes.SET_SOCKET_STATUS,
        payload: true,
      });
    });

    socket.on('disconnect', () => {
      dispatch({
        type: actionTypes.SET_SOCKET_STATUS,
        payload: false,
      });
    });

    socket.on('alerts:new', (alert) => {
      dispatch({
        type: actionTypes.PREPEND_ALERT,
        payload: alert,
      });
    });

    socket.on('alerts:updated', (alert) => {
      dispatch({
        type: actionTypes.UPDATE_ALERT,
        payload: alert,
      });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('alerts:new');
      socket.off('alerts:updated');
      disconnectAlertSocket();
    };
  }, []);

  const value = useMemo(
    () => ({
      state,
      setFilter: (name, value) => {
        dispatch({
          type: actionTypes.SET_FILTER,
          payload: { name, value },
        });
      },
    }),
    [state]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }

  return context;
}
