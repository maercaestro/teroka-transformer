<script lang="ts">
	import {
		expandedBlock,
		tokens,
		modelData,
		rootRem,
		attentionHeadIdx,
		hoveredMatrixCell,
		blockIdx
	} from '~/store';
	import classNames from 'classnames';
	import Matrix from '~/components/common/Matrix.svelte';
	import { gsap } from '~/utils/gsap';
	import { maskArray } from '~/utils/array';
	import { getContext, onMount } from 'svelte';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import tailwindConfig from '../../tailwind.config';
	import * as d3 from 'd3';
	import Katex from '~/utils/Katex.svelte';
	import { Tooltip } from 'flowbite-svelte';
	import { ATTENTION_OUT } from '~/constants/opacity';
	import { ga } from '~/utils/event';
	import { ZoomInOutline } from 'flowbite-svelte-icons';

	const { theme } = resolveConfig(tailwindConfig);

	// Helper function to convert (number | null)[][] to number[][]
	const filterNullValues = (data: (number | null)[][]): number[][] => {
		return data.map(row => row.map(val => val ?? 0));
	};

	$: placeHolderData = Array($tokens.length)
		.fill(0)
		.map((col) => Array($tokens.length).fill(-Infinity));
	$: queryKey =
		$modelData?.outputs?.[`block_${$blockIdx}_attn_head_${$attentionHeadIdx}_attn`]?.data ||
		placeHolderData;
	$: masked =
		$modelData?.outputs?.[`block_${$blockIdx}_attn_head_${$attentionHeadIdx}_attn_masked`]?.data ||
		placeHolderData;
	$: softmaxed =
		$modelData?.outputs?.[`block_${$blockIdx}_attn_head_${$attentionHeadIdx}_attn_dropout`]?.data ||
		placeHolderData;

	let factor = 1; //todo
	let maxCellSize = 20 * factor;
	let minCellSize = 10 * factor;
	$: cellSize = Math.min(
		maxCellSize,
		Math.max((1 / $tokens.length) * rootRem * 6 * factor, minCellSize)
	);

	let attentionQK: HTMLDivElement;
	let attentionMask: HTMLDivElement;
	let attentionSoftmax: HTMLDivElement;
	let attentionResult: HTMLDivElement;

	let attentionMatrixWidth = 0;

	let isAttentionExpanded = false;

	const blockId = getContext('block-id') as string;

	// event handling

	$: if ($expandedBlock.id !== blockId && isAttentionExpanded) {
		isAttentionExpanded = false;
		collapseAttention();
	}

	const onClickAttention = () => {
		if (!isAttentionExpanded) {
			expandedBlock.set({ id: blockId });
			expandAttention();
		}
	};

	let expandableEl: HTMLDivElement;

	function handleOutsideClick(e: Event) {
		if (isAttentionExpanded && e.target && !expandableEl.contains(e.target as Node)) {
			expandedBlock.set({ id: null });
		}
	}
	onMount(() => {
		const mainSection = document.querySelector('.main-section');
		if (mainSection) {
			mainSection.addEventListener('click', handleOutsideClick);
		}
		return () => {
			if (mainSection) {
				mainSection.removeEventListener('click', handleOutsideClick);
			}
		};
	});

	// animation
	let expandTl = gsap.timeline();
	let collapseTl = gsap.timeline();

	// google analytics
	let startTime: number | null = null;

	const expandAttention = () => {
		isAttentionExpanded = true;
		collapseTl.progress(1);

		const keyPaths = document.querySelectorAll('div.sankey g.attention path.key-to-attention');
		const queryPaths = document.querySelectorAll('div.sankey g.attention path.query-to-attention');
		const outPaths = document.querySelectorAll('div.sankey g.attention path.to-attention-out');

		[...keyPaths, ...queryPaths].forEach((path) => {
			const svgPath = path as SVGPathElement;
			const length = svgPath.getTotalLength();
			svgPath.style.strokeDasharray = length.toString();
			svgPath.style.strokeDashoffset = length.toString();
		});

		const QKDuration = 1.2;
		const stagger = Number((QKDuration / $tokens.length).toFixed(2));

		expandTl
			.set([attentionMask.querySelector('.prev'), attentionSoftmax.querySelector('.prev')], {
				opacity: 1
			})
			.set([attentionMask.querySelector('.main'), attentionSoftmax.querySelector('.main')], {
				opacity: 0
			});
		expandTl.set(outPaths, { opacity: 0 });

		expandTl.to(attentionResult, {
			opacity: 0,
			display: 'none',
			duration: 0.2
		});

		// show QK
		expandTl
			.set(attentionQK, {
				width: 'auto',
				display: 'flex',
				opacity: 0
			})
			.to(attentionQK, {
				opacity: 1,
				duration: 0.5
			})
			.to(keyPaths, {
				strokeDashoffset: 0,
				stagger,
				duration: QKDuration,
				ease: 'power2.out'
				// ease: 'back.out(1.7)'
			})
			.to(
				queryPaths,
				{
					strokeDashoffset: 0,
					stagger,
					duration: QKDuration,
					// ease: 'back.out(1.7)'
					ease: 'power2.out'
				},
				'<'
			)
			.from(
				attentionQK.querySelectorAll('svg circle'),
				{
					scale: 0,
					transformOrigin: '50% 50%',
					opacity: 0,
					delay: QKDuration / $tokens.length,
					stagger: Number((QKDuration / Math.pow($tokens.length, 2)).toFixed(2)),
					ease: 'power2.out',
					// ease: 'back.out(1.7)',
					duration: QKDuration
				},
				'<'
			);

		// show Masked
		expandTl
			.set(attentionMask, { width: 0, x: attentionMatrixWidth * -1, opacity: 0 })
			.to(attentionMask, {
				opacity: 1,
				display: 'flex',
				width: attentionMatrixWidth,
				x: 0,
				duration: 0.5
			})
			.to(attentionMask.querySelector('.prev'), {
				opacity: 0,
				duration: 1
			})
			.to(
				attentionMask.querySelector('.main'),
				{
					opacity: 1,
					duration: 1
				},
				'<'
			);

		// show Softmaxed
		expandTl
			.set(attentionSoftmax, { width: 0, x: attentionMatrixWidth * -1, opacity: 0 })
			.to(attentionSoftmax, {
				opacity: 1,
				display: 'flex',
				width: attentionMatrixWidth,
				x: 0,
				duration: 0.4
			})
			.to(attentionSoftmax.querySelector('.prev'), {
				opacity: 0,
				duration: 1
			})
			.to(
				attentionSoftmax.querySelector('.main'),
				{
					opacity: 1,
					duration: 1
				},
				'<'
			);

		expandTl.to(outPaths, { opacity: ATTENTION_OUT });

		startTime = performance.now();
		(window as any).dataLayer?.push({
			event: 'visibility-show',
			visible_name: 'attention-expansion',
			start_time: startTime
		});
	};

	const collapseAttention = () => {
		if (startTime === null) return;
		
		let endTime = performance.now();
		let visibleDuration = endTime - startTime;

		(window as any).dataLayer?.push({
			event: 'visibility-hide',
			visible_name: 'attention-expansion',
			end_time: endTime,
			visible_duration: visibleDuration
		});

		isAttentionExpanded = false;
		expandTl.progress(1);
		collapseTl.to([attentionQK, attentionMask, attentionSoftmax], {
			opacity: 0,
			display: 'none',
			width: 0,
			duration: 0.5
		});

		collapseTl.to(
			attentionResult,
			{
				opacity: 1,
				display: 'flex',
				duration: 0.5
			},
			0
		);
	};

	// color scale
	$: qkColorScaleDomain = d3.extent(queryKey.flat().filter((val): val is number => val !== null));
	$: qkColorScale = (d: number, i?: number) => {
		const domain = qkColorScaleDomain && qkColorScaleDomain[0] !== undefined && qkColorScaleDomain[1] !== undefined 
			? qkColorScaleDomain as [number, number]
			: [0, 1];
		return d3
			.scaleLinear<string>()
			.domain(domain)
			.range(['white', theme.colors['purple'][700]])(d);
	};
	const maskedColorScale = (d: number, i?: number) => {
		return d3.scaleLinear<string>().domain([-3, 3]).range(['white', theme.colors['purple'][700]])(d);
	};
	const softmaxColorScale = (d: number, i?: number) => {
		return d3.interpolate('white', theme.colors['purple'][700])(d);
	};

	const onMouseOverCell = (e: Event, d: any, el: any) => {
		const rowIdx = d.rowIndex;
		const colIdx = d.colIndex;
		hoveredMatrixCell.set({ row: rowIdx, col: colIdx });
		if (Number.isFinite(d.cell)) {
			d3.select(el).attr('stroke', theme.colors.gray[400]);
		}
	};
	const onMouseOutCell = (e: Event, d: any, el: any) => {
		hoveredMatrixCell.set({ row: null, col: null });
		if (Number.isFinite(d.cell)) {
			d3.select(el).attr('stroke', !Number.isFinite(d.cell) ? 'none' : theme.colors.gray[200]);
		}
	};

	const onMouseOutSvg = (e: Event, d: any, el: any) => {
		// Handle mouse out on SVG if needed
	};

	const showTooltip = (e: Event, d: any) => {
		if (!Number.isFinite(d)) return;
		return d.toFixed(2);
	};
</script>

<div
	class="flex items-center gap-8 px-5"
	style={`--attention-matrix-width: ${attentionMatrixWidth}px;`}
	data-click="attention-matrix"
>
	<!-- QK -->
	<div
		role="none"
		class={classNames('attention-matrix-container relative flex', {
			active: isAttentionExpanded
		})}
		bind:this={expandableEl}
		on:click={onClickAttention}
		on:keydown={onClickAttention}
	>
		<div
			class={classNames('attention-matrix attention-qk flex flex-col items-center', {
				'attention-initial': isAttentionExpanded
			})}
			bind:this={attentionQK}
		>
			<Matrix
				className="main"
				data={filterNullValues(queryKey)}
				showSize={false}
				cellHeight={cellSize}
				cellWidth={cellSize}
				rowGap={3}
				colGap={3}
				shape={'circle'}
				colorScale={qkColorScale}
				{onMouseOverCell}
				{onMouseOutCell}
				{onMouseOutSvg}
				{showTooltip}
				highlightRow={undefined}
				highlightCol={undefined}
			/>
			<div class="matrix-label">Hasil darab titik</div>
			<Tooltip class="popover tooltip">
				<Katex math={'Q \\cdot K^T'}></Katex>
			</Tooltip>
			<div class="color-scale">
				<span class="val">{qkColorScaleDomain?.[0]?.toFixed(1) ?? '0.0'}</span>
				<div class="bar"></div>
				<span class="val">{qkColorScaleDomain?.[1]?.toFixed(1) ?? '1.0'}</span>
			</div>
		</div>
		<!-- Scaling · Mask -->
		<div
			class="attention-matrix attention-mask flex flex-col items-center"
			bind:this={attentionMask}
		>
			<svg
				class="arrow"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 12H5m14 0-4 4m4-4-4-4"
				/>
			</svg>

			<div>
				<Matrix
					className="prev absolute top-0 left-0 pointer-events-none"
					data={filterNullValues(queryKey)}
					showSize={false}
					cellHeight={cellSize}
					cellWidth={cellSize}
					rowGap={3}
					colGap={3}
					shape={'circle'}
					colorScale={qkColorScale}
					{onMouseOverCell}
					{onMouseOutCell}
					{onMouseOutSvg}
					{showTooltip}
					highlightRow={undefined}
					highlightCol={undefined}
				/>
				<Matrix
					className="main opacity-0"
					data={maskArray(filterNullValues(masked))}
					showSize={false}
					cellHeight={cellSize}
					cellWidth={cellSize}
					rowGap={3}
					colGap={3}
					shape={'circle'}
					colorScale={maskedColorScale}
					{onMouseOverCell}
					{onMouseOutCell}
					{onMouseOutSvg}
					{showTooltip}
					highlightRow={undefined}
					highlightCol={undefined}
				/>
			</div>
			<div class="matrix-label">Skala · Topeng</div>
			<Tooltip class="popover tooltip">
				<Katex math={'\\frac{QK^T}{\\sqrt{d_k}} + M'}></Katex>
			</Tooltip>
			<div class="color-scale">
				<span class="val">-3.0</span>
				<div class="bar"></div>
				<span class="val">3.0</span>
			</div>
		</div>

		<!-- Softmax · Dropout -->
		<div
			class={classNames('attention-matrix attention-softmax flex flex-col items-center', {
				'attention-out': isAttentionExpanded
			})}
			bind:this={attentionSoftmax}
		>
			<svg
				class="arrow"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 12H5m14 0-4 4m4-4-4-4"
				/>
			</svg>
			<div>
				<Matrix
					className="prev absolute top-0 left-0  pointer-events-none"
					data={maskArray(filterNullValues(masked))}
					showSize={false}
					cellHeight={cellSize}
					cellWidth={cellSize}
					rowGap={3}
					colGap={3}
					shape={'circle'}
					colorScale={maskedColorScale}
					{onMouseOverCell}
					{onMouseOutCell}
					{onMouseOutSvg}
					{showTooltip}
					highlightRow={undefined}
					highlightCol={undefined}
				/>
				<Matrix
					className="main opacity-0"
					data={maskArray(filterNullValues(softmaxed))}
					showSize={false}
					cellHeight={cellSize}
					cellWidth={cellSize}
					rowGap={3}
					colGap={3}
					shape={'circle'}
					colorScale={softmaxColorScale}
					{onMouseOverCell}
					{onMouseOutCell}
					{onMouseOutSvg}
					{showTooltip}
					highlightRow={undefined}
					highlightCol={undefined}
				/>
			</div>

			<div class="matrix-label">Softmax · Dropout</div>
			<Tooltip class="popover tooltip">
				<Katex math={'\\text{Dropout}(\\text{softmax}(\\frac{QK^T}{\\sqrt{d_k}} + M))'}></Katex>
			</Tooltip>
			<div class="color-scale">
				<span class="val">-1.0</span>
				<div class="bar"></div>
				<span class="val">1.0</span>
			</div>
		</div>
		<div
			class={classNames('attention-matrix attention-result flex flex-col items-center', {
				'attention-initial': !isAttentionExpanded,
				'attention-out': !isAttentionExpanded
			})}
			bind:this={attentionResult}
			bind:offsetWidth={attentionMatrixWidth}
		>
			<Matrix
				className="main"
				data={maskArray(filterNullValues(softmaxed))}
				showSize={false}
				cellHeight={cellSize}
				cellWidth={cellSize}
				rowGap={3}
				colGap={3}
				shape={'circle'}
				colorScale={softmaxColorScale}
				{onMouseOverCell}
				{onMouseOutCell}
				{onMouseOutSvg}
				{showTooltip}
				highlightRow={undefined}
				highlightCol={undefined}
			/>

			<div class="matrix-label flex items-center gap-1">
				Perhatian <ZoomInOutline></ZoomInOutline>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.attention-matrix-container {
		cursor: pointer;
		border-radius: 0.5rem;
		transition: 0.2s background-color;
		gap: 1rem;
		padding: 1rem;
	}

	.attention-matrix-container {
		.attention-qk,
		.attention-mask,
		.attention-softmax {
			display: none;
		}

		:global(.matrix) {
			padding: 0.5rem;
		}
		.matrix-label {
			white-space: nowrap;
			color: theme('colors.gray.400');
		}
		.attention-result {
			.matrix-label:hover {
				color: theme('colors.gray.600');
			}
		}
		.arrow {
			position: absolute;
			left: -1rem;
			top: calc(var(--attention-matrix-width) / 2 - 0.5rem);
			width: 1.2rem;
			height: 1.2rem;
			color: theme('colors.gray.300');
		}

		.attention-matrix {
			position: relative;
		}
	}
	.color-scale {
		position: absolute;
		bottom: -1.2rem;
		height: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: 0 1rem;
		gap: 0.2rem;

		.bar {
			height: 0.4rem;
			flex: 1 0 0;
			border: 1px solid theme('colors.gray.200');
			background: linear-gradient(90deg, white 0%, theme('colors.purple.700') 100%);
		}
		.val {
			flex-shrink: 0;
			font-family: monospace;
			font-size: 0.7rem;
			color: theme('colors.gray.600');
		}
	}
</style>
