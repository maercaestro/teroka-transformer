<script lang="ts">
	import { modelMeta, tokens, rootRem } from '~/store';
	import * as d3 from 'd3';
	import { gsap } from '~/utils/gsap';
	import Matrix from '~/components/common/Matrix.svelte';
	import { onDestroy, onMount } from 'svelte';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import tailwindConfig from '../../../tailwind.config';
	import HelpPopover from '../common/HelpPopover.svelte';
	import WeightPopoverCard from '../common/WeightPopoverCard.svelte';

	const { theme } = resolveConfig(tailwindConfig);

	const tokenGap = 6;

	// generate data
	const visibleDimension = 15;

	$: tokenLen = $tokens.length;
	$: embeddingData = Array(tokenLen)
		.fill(0)
		.map((col) =>
			Array(visibleDimension)
				.fill(0)
				.map((d) => Math.random())
		);

	const mlpUpWeightData = Array(visibleDimension * 4)
		.fill(0)
		.map((col) =>
			Array(visibleDimension)
				.fill(0)
				.map((d) => Math.random())
		);

	const mlpUpBiasData = Array(1)
		.fill(0)
		.map((col) =>
			Array(visibleDimension * 4)
				.fill(0)
				.map((d) => Math.random())
		);

	$: mlpUpOutData = Array(tokenLen)
		.fill(0)
		.map((col) =>
			Array(visibleDimension * 4)
				.fill(0)
				.map((d) => Math.random())
		);

	// color scale
	const embeddingColorScale = (d: number): string => {
		return d3.interpolate(theme.colors['purple'][100], theme.colors['purple'][400])(d);
	};
	const weightColorScale = (d: number): string => {
		return d3.interpolate(theme.colors['gray'][100], theme.colors['gray'][400])(d);
	};
	const out1ColorScale = (d: number): string => {
		return d3.interpolate(theme.colors['indigo'][100], theme.colors['indigo'][400])(d);
	};
	const out2ColorScale = (d: number): string => {
		return d3.interpolate(theme.colors['blue'][100], theme.colors['blue'][400])(d);
	};

	// animation
	let isAnimationActive = false;
	let progress = 0;
	let timeline: gsap.core.Timeline = gsap.timeline();

	onMount(() => {
		timeline.eventCallback('onUpdate', () => {
			progress = timeline.progress();
			if (progress === 1) isAnimationActive = false;
		});

		setTimeout(() => {
			isAnimationActive = true;
			draw();
		}, 300);
	});

	onDestroy(() => {
		timeline.kill();
	});

	const draw = () => {
		// upscale --------------------------------
		const embeddingRows = d3.selectAll('.weight-popover-content .embedding-matrix g.g-row').nodes();
		const weightCols = d3.selectAll('.weight-popover-content .mlp-weights g.g-col').nodes();
		const weightBiasCells = d3.selectAll('.weight-popover-content .mlp-bias rect').nodes();

		const outRows = d3.selectAll('.weight-popover-content .mlp-out g.g-row').nodes();

		const [mulSymbol1] = d3.selectAll('.weight-popover-content .symbol.mul').nodes();
		const [plusSymbol1] = d3.selectAll('.weight-popover-content .symbol.plus').nodes();
		const [equalSymbol1] = d3.selectAll('.weight-popover-content .symbol.equal').nodes();
		const highlight = '#94a3b8';

		// first row detail animation
		timeline.set(weightBiasCells, { opacity: 0.1 });

		const firstOutputRowRects = d3.select(outRows[0]).selectAll('rect').nodes();
		const firstEmbeddingRowRects = d3.select(embeddingRows[0]).selectAll('rect').nodes();

		firstOutputRowRects.forEach((outputRect, outCellIdx) => {
			const isFirstOutCell = outCellIdx === 0;
			const firstWeightColRects = d3.select(weightCols[outCellIdx]).selectAll('rect').nodes();
			timeline.set(firstEmbeddingRowRects, { opacity: 0.1 });

			firstEmbeddingRowRects.forEach((embeddingRect, i) => {
				//embedding
				timeline
					.fromTo(
						embeddingRect,
						{ opacity: 0.1, strokeWidth: 0 },
						{
							opacity: 1,
							duration: isFirstOutCell ? 0.1 : 0.002,
							strokeWidth: 10,
							stroke: highlight
						}
					)
					.to(
						embeddingRect,
						{
							strokeWidth: 0,
							duration: isFirstOutCell ? 0.1 : 0.002
						},
						'<50%'
					);

				//weights
				timeline
					.fromTo(
						firstWeightColRects[i],
						{ opacity: 0.1, strokeWidth: 0 },
						{
							opacity: 1,
							duration: isFirstOutCell ? 0.1 : 0.002,
							strokeWidth: 10,
							stroke: highlight
						},
						'<-50%'
					)
					.to(
						firstWeightColRects[i],
						{
							strokeWidth: 0,
							duration: isFirstOutCell ? 0.1 : 0.002
						},
						'<50%'
					);
			});

			//symbol
			if (isFirstOutCell) {
				timeline.from(
					[plusSymbol1, equalSymbol1],
					{
						duration: 0.5,
						opacity: 0.1
					},
					'<'
				);
			}
			//bias
			timeline
				.fromTo(
					weightBiasCells[outCellIdx],

					{ opacity: 0.1, strokeWidth: 0 },
					{
						opacity: 1,
						duration: isFirstOutCell ? 0.4 : 0.002,
						strokeWidth: 10,
						stroke: highlight
					},
					'<'
				)
				.to(
					weightBiasCells[outCellIdx],

					{
						strokeWidth: 0,
						duration: isFirstOutCell ? 0.4 : 0.002
					},
					'<50%'
				);

			//out
			timeline
				.fromTo(
					outputRect,
					{ opacity: 0, strokeWidth: 0 },
					{
						opacity: 1,
						duration: isFirstOutCell ? 0.4 : 0.002,
						strokeWidth: 10,
						stroke: highlight
					},
					'<-50%'
				)
				.to(
					outputRect,

					{
						strokeWidth: 0,
						duration: isFirstOutCell ? 0.4 : 0.002
					},
					'<50%'
				);
		});

		// rest row animation
		let previousRowIdx = 0;

		// out vectors
		outRows.forEach(function (row, rowIdx) {
			if (rowIdx === 0) return;

			const outputCells = d3.select(row).selectAll('rect').nodes();
			const embeddingRowRects = d3.select(embeddingRows[rowIdx]).selectAll('rect').nodes();

			// Check if rowIdx has changed
			if (previousRowIdx !== null && previousRowIdx !== rowIdx) {
				timeline.fromTo(
					embeddingRowRects,
					{ opacity: 0.1 },
					{
						opacity: 1,
						duration: 0.01
					},
					'<'
				);

				const weightColRects = d3
					.selectAll('.weight-popover-content .mlp-weights g.g-col rect')
					.nodes();
				timeline.set(weightColRects, { opacity: 0.1 });
				timeline.set(weightBiasCells, { opacity: 0.1 });
			}

			outputCells.forEach((d, colIdx) => {
				const weightColRects = d3.select(weightCols[colIdx]).selectAll('rect').nodes();

				timeline.fromTo(
					weightColRects,
					{ opacity: 0.1 },
					{
						opacity: 1,
						duration: 0.01
					},
					`<50%`
				);

				timeline.from(
					d,
					{
						opacity: 0,
						duration: 0.01
					},
					`<50%`
				);
				timeline.fromTo(
					weightBiasCells[colIdx],
					{ opacity: 0.1 },
					{
						opacity: 1,
						duration: 0.01
					},
					'<'
				);
			});
			previousRowIdx = rowIdx;
		});
	};

	// event
	let highlightCol: number | undefined = undefined;
	let highlightRow: number | undefined = undefined;

	const onMouseOverCell = (e: Event, d: { rowIndex: number; colIndex: number }) => {
		if (isAnimationActive) return;
		highlightRow = d.rowIndex;
		highlightCol = d.colIndex;
	};
	const onMouseOutSvg = () => {
		highlightCol = undefined;
		highlightRow = undefined;
	};
	
	const onMouseOutCell = () => {
		highlightCol = undefined;
		highlightRow = undefined;
	};
	
	const showTooltip = () => undefined;
</script>

<WeightPopoverCard id="mlp-up" title={'MLP Expansion'} bind:isAnimationActive {timeline}>
	<div class="mlp-weight-popover weight-popover-content flex items-center justify-start">
		<div class="matrix flex flex-col items-center">
			<div class="tokens" style={`gap:${tokenGap}px`}>
				{#each $tokens as token, index}
					<div class="token-label"><span>{token}</span></div>
				{/each}
			</div>
		</div>
		<div class="matrix flex flex-col items-center">
			<div class="title flex items-center gap-1">
				Pembenaman<HelpPopover id="mlp-emgeddings" placement="top"
					>{`Pembenaman yang diubah melalui mekanisme perhatian.`}</HelpPopover
				>
			</div>
			<Matrix
				className="embedding-matrix"
				data={embeddingData}
				showSize={false}
				cellHeight={rootRem * 0.8}
				cellWidth={2}
				rowGap={tokenGap}
				colorScale={embeddingColorScale}
				{highlightRow}
				highlightCol={undefined}
				{onMouseOverCell}
				{onMouseOutCell}
				{onMouseOutSvg}
				{showTooltip}
			/>
			<div class="size">({tokenLen}, {$modelMeta.dimension})</div>
		</div>
		<div class="operator"><div class="symbol mul">&times;</div></div>
		<div class="matrix flex flex-col items-center">
			<div class="title flex items-center gap-1">
				Berat Pengembangan<HelpPopover id="mlp-weights" placement="top"
					>{`Mengunjurkan vektor pembenaman ke ruang tersembunyi yang diperluas. \nParameter yang dipelajari dalam latihan, tetap dalam ramalan.`}</HelpPopover
				>
			</div>
			<div class="flex gap-0">
				<Matrix
					className="mlp-weights"
					data={mlpUpWeightData}
					showSize={false}
					groupBy={'col'}
					cellHeight={3}
					cellWidth={3}
					rowGap={0}
					colorScale={weightColorScale}
					{highlightCol}
					highlightRow={undefined}
					{onMouseOverCell}
					{onMouseOutCell}
					{onMouseOutSvg}
					{showTooltip}
				/>
			</div>

			<div class="size">({$modelMeta.dimension}, {$modelMeta.dimension * 4})</div>
		</div>
		<div class="operator"><div class="symbol plus">+</div></div>
		<div class="matrix flex flex-col items-center">
			<div class="title flex items-center gap-1">
				Bias Pengembangan <HelpPopover id="mlp-bias" placement="top"
					>{`Ofset yang ditambahkan selepas pengembangan. \nParameter yang dipelajari dalam latihan, tetap dalam ramalan.`}</HelpPopover
				>
			</div>
			<Matrix
				className="mlp-bias"
				data={mlpUpBiasData}
				showSize={false}
				groupBy={'col'}
				cellHeight={2}
				cellWidth={8}
				rowGap={0}
				colorScale={weightColorScale}
				highlightRow={highlightCol}
				highlightCol={undefined}
				{onMouseOverCell}
				{onMouseOutCell}
				{onMouseOutSvg}
				{showTooltip}
			/>
			<div class="size">({$modelMeta.dimension * 4})</div>
		</div>
		<div class="operator">
			<div class="symbol equal px-2">=</div>
			<!-- <div class="symbol arrow absolute top-0">&rArr;</div> -->
		</div>
		<!-- <div class="matrix flex flex-col items-center">
			<div class="tokens" style={`gap:${tokenGap - 2}px`}>
				{#each $tokens as token, index}
					<div class="token-label"><span>{token}</span></div>
				{/each}
			</div>
		</div> -->
		<div class="matrix flex flex-col items-center">
			<div class="title">Pembenaman Diperluas <br />Embeddings</div>
			<div class="flex">
				<Matrix
					className="mlp-out"
					data={mlpUpOutData}
					showSize={false}
					cellHeight={rootRem * 0.8}
					cellWidth={2}
					rowGap={tokenGap}
					colorScale={out1ColorScale}
					{onMouseOverCell}
					{onMouseOutCell}
					{onMouseOutSvg}
					{showTooltip}
					{highlightCol}
					{highlightRow}
				/>
			</div>
			<div class="size">({tokenLen}, {$modelMeta.dimension * 4})</div>
		</div>
	</div></WeightPopoverCard
>

<style lang="scss">
	.weight-popover-content {
		padding: 3rem 3rem 3rem 1rem;
		gap: 0.2rem;
	}
	.operator {
		position: relative;
	}
	.matrix {
		.title {
			line-height: 1.1;
			text-align: center;
		}
	}
</style>
