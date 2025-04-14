<script lang="ts">
	import type { PageData } from './$types';
	import { t } from '$lib/translations';

	let { data }: { data: PageData } = $props();

	let output: HTMLDivElement | null = $state(null);
	$effect(() => {
		if (output) {
			// format * and ** and other things ai might use
			output.innerHTML = output.innerHTML
				.replace(/(\*{1,2})(.*?)\1/g, (match, p1, p2) => {
					if (p1.length === 1) {
						return `<em>${p2}</em>`;
					} else if (p1.length === 2) {
						return `<strong>${p2}</strong>`;
					}
					return match;
				})
				.replace(/`([^`]+)`/g, '<code>$1</code>')
				.replace(/~~(.*?)~~/g, '<del>$1</del>'); // Added strikethrough formatting
		}
	});
</script>

<div class="space-y-8 sm:p-16 sm:py-4">
	<div class="rounded border p-4 py-0 pt-2 dark:border-gray-800 space-y-4">
		<div class="flex flex-col items-center justify-center gap-4">
			<h1 class="text-3xl font-bold">{$t('roast.header')}</h1>
			<p class="text-lg">{$t('roast.subText')}</p>
			<a href="#roast" class="rounded bg-blue-500 p-2 text-white dark:bg-blue-600"
				>{$t('roast.goToRoastBtn')}</a
			>
		</div>

		<h1 class="text-3xl">{$t('roast.topArtists')}</h1>
		<div class="-mx-4 w-auto overflow-x-auto scroll-smooth">
			<div class="grid grid-flow-col gap-4 scroll-smooth">
				{#each data.top_artists.items as artist, i}
					<a class="flex w-32 flex-col items-center justify-start" href={artist.external_urls.spotify} target="_blank">
						<span class="text-xl opacity-50">#{i + 1}</span>
						<img
							src={artist.images[0].url}
							alt={artist.name}
							class="aspect-square h-32 rounded-full"
						/>
						<p class="text-center text-lg font-bold">{artist.name}</p>
						<p class="text-center text-sm text-gray-500">{artist.genres.join(', ')}</p>
						<p class="text-center text-sm text-gray-500">
							{$t('roast.followers')}: {artist.followers.total}
						</p>
						<p class="text-center text-sm text-gray-500">
							{$t('roast.popularity')}: {artist.popularity}
						</p>
					</a>
				{/each}
			</div>
		</div>
		<h1 class="mt-16 text-3xl">{$t('roast.topTracks')}</h1>
		<div class="-mx-4 w-auto overflow-x-auto scroll-smooth">
			<div class="grid grid-flow-col gap-4 scroll-smooth">
				{#each data.top_tracks.items as track, i}
					<a class="flex w-48 flex-col items-center justify-start" href={track.external_urls.spotify} target="_blank">
						<span class="text-xl opacity-50">#{i + 1}</span>
						<img
							src={track.album.images[0].url}
							alt={track.name}
							class="aspect-square h-32 rounded-full"
						/>
						<p class="text-center text-lg font-bold">{track.name}</p>
						<p class="text-center text-sm text-gray-500">
							{track.artists.map((artist) => artist.name).join(', ')}
						</p>
						<p class="text-center text-sm text-gray-500">{$t('roast.album')}: {track.album.name}</p>
						<p class="text-center text-sm text-gray-500">
							{$t('roast.popularity')}: {track.popularity}
						</p>
					</a>
				{/each}
			</div>
		</div>
	</div>
</div>

<h1 class="mt-8 ml-6 text-3xl">{$t('roast.output')} ({data.model}):</h1>
<div class="grid w-full place-items-center p-6">
	{#await data.streamed.completion}
		<div class="min-h-64 w-full rounded border border-gray-800 bg-gray-800 p-6 py-2"></div>
	{:then data}
		<div
			id="roast"
			class="prose-invert min-h-64 !max-w-[none] rounded border border-gray-500 p-6 py-2 dark:border-gray-800"
			bind:this={output}
		>
			{data.choices[0]?.message?.content}
		</div>
	{:catch e}
		<div class="prose-invert border-gray-00 min-h-64 !max-w-[none] rounded border p-6 py-2">
			{$t('roast.error')}
		</div>
	{/await}
</div>
