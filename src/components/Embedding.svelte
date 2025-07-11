<script lang="ts">
	import { tokens, expandedBlock, modelMeta, tokenIds, blockIdx } from '~/store';
	import classNames from 'classnames';
	import { gsap, Flip } from '~/utils/gsap';
	import { tick, setContext, getContext, onMount } from 'svelte';
	import VectorCanvas from './common/VectorCanvas.svelte';
	import * as d3 from 'd3';
	import HelpPopover from './common/HelpPopover.svelte';
	import tailwindConfig from '../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import { ga } from '~/utils/event';
	import { Tooltip } from 'flowbite-svelte';
	import { ZoomInOutline } from 'flowbite-svelte-icons';

	const { theme } = resolveConfig(tailwindConfig);

	export let className: string | undefined = undefined;

	setContext('block-id', 'embedding');

	const blockId = getContext('block-id') as string;

	let isEmbeddingExpanded = false;

	// event handling
	$: if ($expandedBlock.id !== blockId && isEmbeddingExpanded) {
		isEmbeddingExpanded = false;
		collapseEmbedding();
	}

	const onClickEmbedding = () => {
		if (!isEmbeddingExpanded) {
			expandedBlock.set({ id: blockId });
			expandEmbedding();
		}
	};

	const onClickEmbeddingTitle = (e: Event) => {
		e.stopPropagation();
		e.preventDefault();
		if (!isEmbeddingExpanded) {
			expandedBlock.set({ id: blockId });
			expandEmbedding();
		} else {
			expandedBlock.set({ id: null });
			collapseEmbedding();
		}
	};

	let expandableEl: HTMLDivElement;

	function handleOutsideClick(e: Event) {
		if (isEmbeddingExpanded && expandableEl && !expandableEl.contains(e.target as Node)) {
			expandedBlock.set({ id: null });
		}
	}
	onMount(() => {
		const mainSection = document.querySelector('.main-section');
		if (mainSection) {
			mainSection.addEventListener('click', handleOutsideClick);
		}
		return () => {
			const mainSection = document.querySelector('.main-section');
			if (mainSection) {
				mainSection.removeEventListener('click', handleOutsideClick);
			}
		};
	});

	// animation
	let containerState: any;

	// google analytics
	let startTime: number | null = null;

	const expandEmbedding = async () => {
		containerState = Flip.getState('.embedding .token-column');
		isEmbeddingExpanded = true;
		await tick();

		Flip.from(containerState, {
			duration: 0.5,
			ease: 'power2.inOut'
		});
		gsap.to('.embedding-detail', {
			opacity: 1,
			duration: 0.5,
			delay: 0.5
		});

		startTime = performance.now();
		(window as any).dataLayer?.push({
			event: 'visibility-show',
			visible_name: 'embedding-expansion',
			start_time: startTime
		});
	};

	const collapseEmbedding = async () => {
		let endTime = performance.now();
		let visibleDuration = startTime ? endTime - startTime : 0;

		(window as any).dataLayer?.push({
			event: 'visibility-hide',
			visible_name: 'embedding-expansion',
			end_time: endTime,
			visible_duration: visibleDuration
		});

		containerState = Flip.getState('.embedding .token-column');
		isEmbeddingExpanded = false;
		await tick();

		Flip.from(containerState, {
			duration: 0.5,
			ease: 'power2.inOut'
		});
	};

	let isHovered = false;

	function handleMouseEnter() {
		isHovered = true;
	}

	function handleMouseLeave() {
		isHovered = false;
	}

	const embeddingVectorColor = 'bg-gray-300';
</script>

<div
	class={classNames('embedding', className, { expanded: isEmbeddingExpanded })}
	bind:this={expandableEl}
	role="none"
	on:click={onClickEmbedding}
	on:keydown={onClickEmbedding}
	data-click="embedding-step"
>
	<div
		class="title expandable"
		role="none"
		on:click={onClickEmbeddingTitle}
		on:keydown={onClickEmbeddingTitle}
		on:mouseenter={handleMouseEnter}
		on:mouseleave={handleMouseLeave}
		data-click="embedding-step-title"
	>
		<div class="flex items-center gap-1">Pembenaman <ZoomInOutline></ZoomInOutline></div>
	</div>
	<div class="content relative">
		<div class="token-column resizable resize-watch flex">
			<!-- token -->
			<div class="column token-string relative">
				{#if isEmbeddingExpanded}<div class="subtitle embedding-detail">Token</div>{/if}
				{#each $tokens as token, index}
					<div class="cell" class:last={index === $tokens.length - 1}>
						<span class="label">{token}</span>
					</div>
				{/each}
				<div
					class="bounding embedding-bounding"
					class:active={isHovered && !isEmbeddingExpanded}
				></div>
			</div>
			{#if isEmbeddingExpanded}
				<Tooltip triggeredBy=".embedding .vector" placement="right" class="popover"
					>vector({$modelMeta.dimension})</Tooltip
				>
				<!-- token id and embedding -->
				<div class="column token-embedding embedding-detail">
					<div class="subtitle flex items-center gap-1">
						<span>Token<br />Pembenaman</span><HelpPopover
							id="token-embedding"
							goTo="article-token-embedding"
							>{`Menukar token kepada perwakilan \nnumerik menggunakan pembenaman \nyang diperoleh daripada kosakata \nyang telah ditetapkan, \nmenangkap makna semantik mereka.`}</HelpPopover
						>
					</div>
					{#each $tokens as token, index}
						<div class="token-id flex items-center">
							<div class="vocab-index ellipsis flex items-center text-right text-xs text-gray-400">
								<div class="flex flex-col items-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 31 9"
										fill="none"
										class="w-10 text-gray-300"
									>
										<path
											fill="currentColor"
											d="M30.3886 4.74352C30.5839 4.54826 30.5839 4.23168 30.3886 4.03642L27.2067 0.854435C27.0114 0.659173 26.6948 0.659173 26.4996 0.854435C26.3043 1.0497 26.3043 1.36628 26.4996 1.56154L29.328 4.38997L26.4996 7.2184C26.3043 7.41366 26.3043 7.73024 26.4996 7.9255C26.6948 8.12076 27.0114 8.12076 27.2067 7.9255L30.3886 4.74352ZM0.31958 4.88997H30.0351V3.88997H0.31958V4.88997Z"
										/>
									</svg>
								</div>
							</div>
							<div class="cell flex items-center">
								<div class={`vector ${embeddingVectorColor}`}>
									<VectorCanvas active />
								</div>
								<span class="index-val text-xs">
									{#if index === 0}
										<span class="label">id</span><br />
									{/if}
									<span class="val">{$tokenIds[index]}</span>
								</span>
							</div>
						</div>
					{/each}
				</div>
				<!-- position embedding -->
				<div class="column symbol embedding-detail">
					{#each $tokens as token, index}
						<div class="cell">+</div>
					{/each}
				</div>
				<div class="column embedding-detail position-embedding">
					<div class="subtitle flex gap-1">
						<span>Pengekodan<br />Kedudukan</span><HelpPopover
							id="position-embedding"
							goTo="article-positional-embedding"
							>{`Menukar kedudukan token kepada \nperwakilan numerik yang \nmenangkap susunan mereka dalam urutan.`}</HelpPopover
						>
					</div>
					{#each $tokens as token, index}
						<div class="cell flex items-center">
							<div class={`vector ${embeddingVectorColor}`}>
								<VectorCanvas
									active
									colorScale={(d, i) => {
										if (d < 0.33) return d3.interpolate(theme.colors['red'][400], 'white')(d * 3);
										if (d < 0.67) return 'white';
										return d3.interpolate('white', theme.colors['blue'][400])((d - 0.67) * 3);
									}}
								/>
							</div>
							<span class="index-val text-xs">
								{#if index === 0}
									<span class="label">kedudukan</span><br />
								{/if}
								<span class="val">{index}</span>
							</span>
						</div>
					{/each}
				</div>
				<div class="column symbol embedding-detail">
					{#each $tokens as token, index}
						<div class="cell">=</div>
					{/each}
				</div>
				<!-- <PositionalEncodingPopover triggeredBy=".position-embedding" /> -->
			{/if}
		</div>

		<div class="vector-column block-start-column relative flex">
			<div class="column vectors embedding-column">
				{#each $tokens as token, index}
					<div class={`vector ${embeddingVectorColor}`} class:last={index === $tokens.length - 1}>
						<VectorCanvas active={$blockIdx === 0 && (isHovered || isEmbeddingExpanded)} />
					</div>
					<Tooltip placement="right" class="popover">vector({$modelMeta.dimension})</Tooltip>
				{/each}
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.embedding-bounding {
		top: -0.5rem;
		padding: 0.5rem 0;
		left: 0;
		width: calc(100% + 0.8rem);
		height: 100%;
	}
	.embedding {
		&.expanded {
			.title,
			.content {
				z-index: $EXPANDED_CONTENT_INDEX;
			}
			.operations {
				pointer-events: none;
				opacity: 0.2;
			}
		}
		.embedding-detail {
			opacity: 0;
		}
		.title {
			justify-content: end;
			padding-left: 3rem;
		}
		.content {
			padding-left: 2rem;
			display: flex;

			.token-column {
				.column {
					padding: 0 1rem;

					.cell {
						justify-content: flex-end;
						gap: 0.5rem;
						text-align: left;
					}
				}
				.symbol {
					font-size: 0.8rem;
					color: theme('colors.gray.400');
				}
			}

			.token-string {
				width: 7rem;
				flex-shrink: 0;
			}

			.subtitle {
				justify-content: center;
				align-items: end;
				line-height: 1.3;
			}
			.index-val .label {
				color: theme('colors.gray.400');
				line-height: 1;
				font-size: 0.7rem;
			}
			.index-val .val {
				width: 4rem;
				text-align: left;
				font-size: 0.7rem;
				color: theme('colors.gray.600');
				font-family: monospace;
			}

			.token-embedding {
				position: relative;
				width: 11rem;

				.vocab-index {
					width: 5rem;
					flex-shrink: 0;
					display: flex;
					justify-content: center;
					overflow: visible;
					padding-right: 1rem;
				}
			}

			.position-embedding {
				.subtitle {
					margin-left: -1rem;
				}
				.cell {
					justify-content: center;
					gap: 0.5rem;
				}
				.index-val {
					width: 2rem;
					justify-content: start;
				}
			}
		}
	}
</style>
