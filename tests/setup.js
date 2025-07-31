import '@testing-library/jest-dom';

// Mock Leaflet
global.L = {
  map: () => ({}),
  tileLayer: () => ({}),
  marker: () => ({}),
  layerGroup: () => ({}),
  icon: () => ({}),
  divIcon: () => ({})
};

global.fetch = global.fetch || (() => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({ features: [] })
}));
