import Drone from '../models/Drone';

describe('Drone Model', () => {
  it('should create a drone', () => {
    const drone = new Drone({ name: 'Test Drone', type: 'quadcopter', status: 'idle' });
    expect(drone.name).toBe('Test Drone');
    expect(drone.status).toBe('idle');
  });
});