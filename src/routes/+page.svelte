<script lang="ts">
	import type { PageData } from './$types';
	import ChevronDown from '$lib/chevron-down.svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { t } from '$lib/translations';
	import type { time } from 'console';

	let { data }: { data: PageData } = $props();

	let model = $state('gemma2-9b-it');
	let locale = $state(data.preferred_locale);
	let temperature = $state(0.7);
	let top_p = $state(0.9);
	let time_range = $state('medium_term');

	let advanced = $state(false);

	function toggleAdvanced() {
		advanced = !advanced;
	}

	let loading = $state(false);
	function handleClick() {
		loading = true;
	}
</script>

<div class="mt-6 grid w-full place-items-center gap-2">
	<h1 class="text-6xl">Roast<span class="dark:text-green-700 text-green-500">ify</span></h1>
	<h2 class="text-center text-2xl">{$t('home.subText')}</h2>
	<div class="grid place-items-center p-4">
		{#if data.authorized}
			<!-- select -->
			<div class="flex flex-col justify-center gap-4">
				<h1 class="text-center text-3xl font-bold text-nowrap">{$t('home.timeRange')}</h1>
				<div>
					<h2 class="text-xl font-bold">{$t('home.shortTerm')}</h2>
					<span>{$t('home.shortTermDesc')}</span>
				</div>
				<div>
					<h2 class="text-xl font-bold">{$t('home.mediumTerm')}</h2>
					<span>{$t('home.mediumTermDesc')}</span>
				</div>
				<div>
					<h2 class="text-xl font-bold">{$t('home.longTerm')}</h2>
					<span>{$t('home.longTermDesc')}</span>
				</div>
				<select
					bind:value={time_range}
					class="w-full rounded border dark:border-gray-700 dark:bg-slate-800 dark:text-gray-200"
					placeholder="Select a time range"
				>
					<option value="short_term">{$t('home.shortTerm')}</option>
					<option value="medium_term">{$t('home.mediumTerm')}</option>
					<option value="long_term">{$t('home.longTerm')}</option>
				</select>

				<h1 class="text-center text-3xl font-bold text-nowrap">{$t('home.selectModel')}</h1>
				<div>
					<h2 class="text-xl font-bold">gemma2-9b-it</h2>
					<span>{$t('home.gemmaDescription')}</span>
				</div>
				<div>
					<h2 class="text-xl font-bold">llama3-70b-8192</h2>
					<span>{$t('home.llamaDescription')}</span>
				</div>
				<select
					bind:value={model}
					class="w-full rounded border dark:border-gray-700 dark:bg-slate-800 dark:text-gray-200"
					placeholder="Select a model"
				>
					<option value="gemma2-9b-it">gemma2-9b-it</option>
					<option value="llama3-70b-8192">llama3-70b-8192</option>
				</select>
				<h1 class="text-center text-3xl font-bold text-nowrap">{$t('home.selectLanguage')}</h1>
				<div>
					<h2 class="text-xl font-bold">{$t('common.english')}</h2>
					<span>{$t('home.englishDesc')}</span>
				</div>
				<div>
					<h2 class="text-xl font-bold">{$t('common.polish')}</h2>
					<span>{$t('home.polishDesc')}</span>
				</div>
				<select
					bind:value={locale}
					class="w-full rounded border dark:border-gray-700 dark:bg-slate-800 dark:text-gray-200"
					placeholder="Select a language"
				>
					<option value="en">{$t('common.english')}</option>
					<option value="pl">{$t('common.polish')}</option>
				</select>

				<a
					href="/roast?model={model}&locale={locale}&temperature={temperature}&top_p={top_p}&time_range={time_range}"
					class="btn w-full transform bg-blue-600 text-center transition-all hover:scale-105 hover:bg-blue-800 text-white"
				>
				{loading ? $t('home.roastBtnLoading') : $t('home.roastBtn')}
				</a>
				<button onclick={toggleAdvanced} class="flex items-center gap-2">
					<ChevronDown class="{advanced ? 'rotate-180' : 'rotate-0'} transition-transform" />
					<span>{$t('home.advancedBtn')}</span>
				</button>
				{#if advanced}
					<!-- temperature from 0 to 1 and top_p from 0 to 1 -->
					<div transition:slide class="flex flex-col gap-4">
						<div>
							<label for="temperature" class="text-lg font-bold">{$t('home.temperature')}: {temperature}</label>
							<input
								type="range"
								id="temperature"
								min="0"
								max="1"
								step="0.01"
								bind:value={temperature}
								class="w-full"
							/>
						</div>
						<div>
							<label for="top_p" class="text-lg font-bold">Top P: {top_p}</label>
							<input
								type="range"
								id="top_p"
								min="0"
								max="1"
								step="0.01"
								bind:value={top_p}
								class="w-full"
							/>
						</div>
					</div>
				{/if}
			</div>
		{:else}
			<a href="/login" class="btn bg-green-500 transition-all hover:scale-110 hover:bg-green-600 text-white" onclick={handleClick}>
				{$t('home.loginBtn')}
			</a>
		{/if}
	</div>
</div>
