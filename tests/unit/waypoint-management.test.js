import { describe, it, expect } from 'vitest';

describe('Waypoint Management', () => {
  it('should validate input requirements', () => {
    const validateInput = (value) => Boolean(value && value.length >= 2);

    expect(validateInput('Phoenix')).toBe(true);
    expect(validateInput('Ph')).toBe(true);
    expect(validateInput('P')).toBe(false);
    expect(validateInput('')).toBe(false);
  });

  it('should manage waypoint collection', () => {
    const waypoints = [];
    const addWaypoint = (waypoint) => {
      waypoints.push({
        id: Date.now(),
        name: waypoint.name,
        coordinates: waypoint.coordinates
      });
    };

    addWaypoint({ name: 'Phoenix', coordinates: [-112.074, 33.4484] });
    addWaypoint({ name: 'Las Vegas', coordinates: [-115.1398, 36.1699] });

    expect(waypoints).toHaveLength(2);
    expect(waypoints[0].name).toBe('Phoenix');
    expect(waypoints[1].name).toBe('Las Vegas');
  });
});
