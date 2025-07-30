<script lang="ts">
	import GlassCard from './GlassCard.svelte';
	import GlassButton from './GlassButton.svelte';

	type Props = {
		class?: string;
	};

	let { class: className = '' }: Props = $props();
</script>

<nav class="fixed top-0 right-0 left-0 z-50 p-4 {className}">
	<GlassCard class="px-6 py-4">
		<div class="flex items-center justify-between">
			<!-- Logo/Brand -->
			<div class="flex items-center gap-3">
				<span class="text-2xl" role="img" aria-label="cactus">🌵</span>
				<h1 class="text-xl font-bold text-southwest-sunset">Vronis Roadtripper</h1>
			</div>

			<!-- Navigation Links -->
			<div class="hidden items-center gap-2 md:flex">
				<GlassButton variant="secondary" size="sm">🗺️ Map</GlassButton>
				<GlassButton variant="secondary" size="sm">🛣️ Routes</GlassButton>
				<GlassButton variant="secondary" size="sm">📍 POIs</GlassButton>
				<GlassButton variant="accent" size="sm">💾 Save Trip</GlassButton>
			</div>

			<!-- Mobile Menu Button -->
			<div class="md:hidden">
				<GlassButton variant="primary" size="sm">☰</GlassButton>
			</div>
		</div>
	</GlassCard>
</nav>
