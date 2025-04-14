<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="mt-6 grid w-full place-items-center gap-2">
	<h1 class="text-6xl">Roastify</h1>
	<h2 class="text-2xl">Let an LLM roast your tastes</h2>
	<div class="p-4">
		{#if data.authorized}
			<a
				href="/roast"
				class="btn transform bg-blue-500 text-white transition-all hover:scale-110 hover:bg-blue-700"
			>
				Roast me!
			</a>
		{:else}
			<a
				href="/login"
				class="btn bg-green-500 text-white transition-all hover:scale-110 hover:bg-green-600"
			>
				Login to spotify
			</a>
		{/if}
	</div>
</div>
