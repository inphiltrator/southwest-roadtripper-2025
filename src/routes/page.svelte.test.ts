import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import NavigationBar from '../lib/components/NavigationBar.svelte';

describe('/+page.svelte', () => {
	it('should render navigation', async () => {
		render(NavigationBar);

		const heading = page.getByRole('heading', { level: 1 });
		await expect.element(heading).toBeInTheDocument();
	});
});
