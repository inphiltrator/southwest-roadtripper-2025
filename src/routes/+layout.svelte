<script lang="ts">
	import '../app.css';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

	// Initialize Vercel Speed Insights
	injectSpeedInsights();

	let { children } = $props();
</script>

{@render children()}
