<script lang="ts">
	type Props = {
		class?: string;
		variant?: 'primary' | 'secondary' | 'accent';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		onclick?: () => void;
		children: import('svelte').Snippet;
	};

	let {
		class: className = '',
		variant = 'primary',
		size = 'md',
		disabled = false,
		onclick,
		children
	}: Props = $props();

	const variantClasses = {
		primary:
			'bg-southwest-sunset/20 border-southwest-sunset/40 text-southwest-sunset hover:bg-southwest-sunset/30',
		secondary:
			'bg-southwest-sage/20 border-southwest-sage/40 text-southwest-sage hover:bg-southwest-sage/30',
		accent:
			'bg-southwest-canyon/20 border-southwest-canyon/40 text-southwest-canyon hover:bg-southwest-canyon/30'
	};

	const sizeClasses = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-base',
		lg: 'px-6 py-3 text-lg'
	};
</script>

<button
	class="rounded-xl border font-medium backdrop-blur-glass transition-all duration-300 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 {variantClasses[
		variant
	]} {sizeClasses[size]} {className}"
	{disabled}
	{onclick}
>
	{@render children()}
</button>
