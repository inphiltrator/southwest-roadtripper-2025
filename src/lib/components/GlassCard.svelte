<script lang="ts">
  type Props = {
    class?: string;
    variant?: 'default' | 'dark' | 'light';
    children: import('svelte').Snippet;
  };

  let { class: className = '', variant = 'default', children }: Props = $props();

  const variantClasses = {
    default: 'bg-white/10 border-white/20',
    dark: 'bg-black/10 border-black/20',
    light: 'bg-white/20 border-white/30'
  };
</script>

<div 
  class="backdrop-blur-glass border rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl {variantClasses[variant]} {className}"
>
  {@render children()}
</div>
