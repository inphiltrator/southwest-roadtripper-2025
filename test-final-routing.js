import { EnhancedRoutingService } from './src/lib/services/EnhancedRoutingService.ts';

console.log('🌵 Testing Final Enhanced Routing Service...');

// Test with your API key
const apiKey = 'ENTER_YOUR_KEY_HERE'; // User will replace this
const routingService = new EnhancedRoutingService(apiKey);

// Test waypoints: Las Vegas to Phoenix
const testWaypoints = [
    { lat: 36.1699, lng: -115.1398, name: 'Las Vegas, NV' },
    { lat: 33.4484, lng: -112.0740, name: 'Phoenix, AZ' }
];

try {
    console.log('\n🛣️  Testing Enhanced Routing Service...');
    const route = await routingService.calculateRoute(testWaypoints);
    
    console.log('✅ Enhanced route calculated successfully:');
    console.log(`- Distance: ${route.distance} miles`);
    console.log(`- Duration: ${route.duration} minutes`);
    console.log(`- Waypoints: ${route.waypoints.length}`);
    console.log(`- Route ID: ${route.id}`);
    console.log(`- Polyline type: ${typeof route.polyline}`);
    console.log(`- Polyline length: ${route.polyline.length} characters`);
    
    // Test decoding
    if (typeof route.polyline === 'string') {
        try {
            const coords = EnhancedRoutingService.decodePolyline(route.polyline);
            console.log(`- Decoded coordinates: ${coords.length} points`);
            console.log(`- First coordinate: [${coords[0][0]}, ${coords[0][1]}]`);
            console.log(`- Last coordinate: [${coords[coords.length-1][0]}, ${coords[coords.length-1][1]}]`);
        } catch (decodeError) {
            console.log('- Polyline decoding failed (might be mock format):', decodeError.message);
        }
    }
    
} catch (error) {
    console.error('❌ Enhanced routing test failed:', error.message);
}

console.log('\n✅ Final Enhanced API Service test completed!');
