import { browser } from '$app/environment';

/**
 * Environment configuration for API keys and settings
 * Supports both server-side and client-side environments
 */
interface EnvironmentConfig {
	openRouteServiceApiKey: string;
	overpassApiUrl: string;
	isDevelopment: boolean;
	isProduction: boolean;
}

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, fallback: string = ''): string {
	if (browser) {
		// Client-side: use public env vars only
		return (window as any).__ENV__?.[key] || fallback;
	} else {
		// Server-side: use process.env
		return process.env[key] || fallback;
	}
}

/**
 * Environment configuration
 */
export const env: EnvironmentConfig = {
	// OpenRouteService API Key for routing
	openRouteServiceApiKey: getEnvVar(
		'VITE_ORS_API_KEY',
		'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjczODIzZjRlMWM5YjRiOGFiNGZjNWE5MWRhYmFjMDQwIiwiaCI6Im11cm11cjY0In0='
	),

	// Overpass API URL for POI discovery
	overpassApiUrl: getEnvVar('VITE_OVERPASS_ENDPOINT', 'https://overpass.private.coffee/api/interpreter'),

	// Environment flags
	isDevelopment: getEnvVar('NODE_ENV', 'development') === 'development',
	isProduction: getEnvVar('NODE_ENV', 'development') === 'production'
};

/**
 * Validate that required API keys are available
 */
export function validateEnvironment(): { valid: boolean; missing: string[] } {
	const missing: string[] = [];

	if (!env.openRouteServiceApiKey || env.openRouteServiceApiKey === 'demo-key') {
		missing.push('VITE_ORS_API_KEY (OpenRouteService API Key)');
	}

	if (!env.overpassApiUrl) {
		missing.push('VITE_OVERPASS_ENDPOINT (Overpass API URL)');
	}

	return {
		valid: missing.length === 0,
		missing
	};
}

/**
 * Log environment status (development only)
 */
if (env.isDevelopment && !browser) {
	const validation = validateEnvironment();
	if (validation.valid) {
		console.log('✅ All required environment variables are configured');
	} else {
		console.warn('⚠️ Missing environment variables:', validation.missing);
	}
}
