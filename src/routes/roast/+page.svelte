<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-8">
	<div class="flex flex-col items-center justify-center">
		<h1 class="text-3xl font-bold">Your Spotify Roast</h1>
		<p class="mt-4 text-lg">Here are your spotify stats.</p>
	</div>

	<h1 class="ml-6 text-3xl">Your top artists:</h1>
	<div class="w-full overflow-x-auto">
		<div class="grid grid-flow-col gap-4">
			{#each data.top_artists.items as artist}
				<div class="flex w-32 flex-col items-center justify-start">
					<img
						src={artist.images[0].url}
						alt={artist.name}
						class="aspect-square h-32 rounded-full"
					/>
					<p class="text-center text-lg font-bold">{artist.name}</p>
					<p class="text-center text-sm text-gray-500">{artist.genres.join(', ')}</p>
					<p class="text-center text-sm text-gray-500">Followers: {artist.followers.total}</p>
					<p class="text-center text-sm text-gray-500">Popularity: {artist.popularity}</p>
				</div>
			{/each}
		</div>
	</div>
	<h1 class="mt-16 ml-6 text-3xl">Your top tracks:</h1>
	<div class="w-full overflow-x-auto">
		<div class="grid grid-flow-col gap-4">
			{#each data.top_tracks.items as track}
				<div class="flex w-48 flex-col items-center justify-start">
					<img
						src={track.album.images[0].url}
						alt={track.name}
						class="aspect-square h-32 rounded-full"
					/>
					<p class="text-center text-lg font-bold">{track.name}</p>
					<p class="text-center text-sm text-gray-500">
						{track.artists.map((artist) => artist.name).join(', ')}
					</p>
					<p class="text-center text-sm text-gray-500">Album: {track.album.name}</p>
					<p class="text-center text-sm text-gray-500">Popularity: {track.popularity}</p>
				</div>
			{/each}
		</div>
	</div>
</div>

<h1 class="mt-8 ml-6 text-3xl">Roast:</h1>
<div class="grid w-full place-items-center p-6">
	{#await data.streamed.completion}
		<div class="min-h-64 w-full rounded border border-gray-500 bg-gray-300 p-6 py-2"></div>
	{:then data}
		<div class="prose min-h-64 !max-w-[none] rounded border border-gray-500 p-6 py-2">
			{data.choices[0]?.message?.content}
		</div>
	{:catch e}
		<div class="prose min-h-64 !max-w-[none] rounded border border-gray-500 p-6 py-2">
			Wyskoczył błąd, prawdopodobnie darmowy LLM ma limit swojego użycia, spróbój ponownie później.
		</div>
	{/await}
</div>
