import { EnhancedRoutingService } from './src/lib/services/EnhancedRoutingService.js';
import { EnhancedPOIService } from './src/lib/services/EnhancedPOIService.js';

console.log('🌵 Testing Final Live API Integrations...');

const apiKey = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjczODIzZjRlMWM5YjRiOGFiNGZjNWE5MWRhYmFjMDQwIiwiaCI6Im11cm11cjY0In0=';

// Test Enhanced Routing Service
const routingService = new EnhancedRoutingService(apiKey);
const routeWaypoints = [
    { lat: 36.1699, lng: -115.1398, name: 'Las Vegas, NV' },
    { lat: 33.4484, lng: -112.0740, name: 'Phoenix, AZ' }
];

async function testRouting() {
    console.log('\n🛣️  Testing Live Routing Service...');
    try {
        const route = await routingService.calculateRoute(routeWaypoints);
        console.log('✅ Live route calculated successfully:');
        console.log(`- Distance: ${route.distance} miles`);
        console.log(`- Duration: ${route.duration} minutes`);
        console.log(`- Polyline length: ${route.polyline.length} characters`);
    } catch (error) {
        console.error('❌ Live routing test failed:', error.message);
    }
}

// Test Enhanced POI Service
const poiService = new EnhancedPOIService();
const poiLocation = { lat: 33.4484, lng: -112.0740 }; // Phoenix, AZ

async function testPOIs() {
    console.log('\n🏞️  Testing Live POI Service (private.coffee)...');
    try {
        const pois = await poiService.discoverPOIs(poiLocation, 15000, ['dining', 'attraction']);
        console.log(`✅ Found ${pois.length} POIs near Phoenix:`);
        pois.slice(0, 5).forEach(poi => {
            console.log(`- ${poi.name} (${poi.category})`);
        });
    } catch (error) {
        console.error('❌ Live POI discovery failed:', error.message);
    }
}

async function runTests() {
    await testRouting();
    await testPOIs();
    console.log('\n✅ All live API tests completed!');
}

runTests();

