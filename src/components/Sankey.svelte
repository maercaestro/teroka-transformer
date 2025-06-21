<script lang="ts">
	import {
		tokens,
		modelMeta,
		rootRem,
		weightPopover,
		tooltip,
		attentionHeadIdx,
		blockIdx,
		isOnBlockTransition
	} from '~/store';
	import * as d3 from 'd3';
	import { onMount, tick } from 'svelte';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import tailwindConfig from '../../tailwind.config';
	import { gradientMap } from '~/constants/gradient';
	import {
		ATTENTION_HEAD_1,
		ATTENTION_HEAD_BACK,
		ATTENTION_OUT,
		EMBEDDING,
		LOGIT,
		MLP,
		TRANSFORMER_BLOCKS
	} from '~/constants/opacity';

	const { theme } = resolveConfig(tailwindConfig);

	let svgBackEl: HTMLOrSVGElement;
	let svgEl: HTMLOrSVGElement;

	let resizeObserver: ResizeObserver;
	let screenWidth: number;

	$: curveFactor = Math.floor(screenWidth / 1000) || 1;
	$: defaultCurveOffset = 40 * (curveFactor - 1) + 80;

	type PathMap = Record<
		string,
		{
			from: string;
			to: string;
			gradientId?: string;
			fill?: string;
			opacity?: number;
			curve?: number;
			type?: 'stroke' | 'shape';
			id?: string;
			pathGenerator?: (source: DOMRect, target: DOMRect, curve: number) => string;
		}[]
	>;

	const backPaths = [
		{
			from: '.qkv .qkv-column .query',
			to: '.head-block .query .vector',
			// fill: theme.colors.blue[defaultGradientBrightness],
			gradientId: 'blue-blue2',
			opacity: ATTENTION_HEAD_BACK
		},
		{
			from: '.qkv .qkv-column .key',
			to: '.head-block .key .vector',
			// fill: theme.colors.red[defaultGradientBrightness],
			gradientId: 'red-red2',
			opacity: ATTENTION_HEAD_BACK
		},
		{
			from: '.qkv .qkv-column .value',
			to: '.head-block .value .vector',
			gradientId: 'green-green2',
			// fill: theme.colors.green[defaultGradientBrightness],
			opacity: ATTENTION_HEAD_BACK
		},
		{
			from: '.attention .head-out .vector',
			to: '.mlp .initial .vector',
			gradientId: 'transparent-purple',
			opacity: ATTENTION_HEAD_BACK
		}
	];
	const backPathMap: PathMap = {
		attention: backPaths.map((d) => ({
			...d,
			from: `.block-steps.main ${d.from}`,
			to: `.block-steps.main ${d.to}`
		})),
		nextAttention: backPaths.map((d) => ({
			...d,
			from: `.block-steps.next ${d.from}`,
			to: `.block-steps.next ${d.to}`
		}))
	};

	$: qkvPaths = [
		{
			from: '.qkv .vector-column .column.vectors .vector',
			to: '.qkv .qkv-column .vector',
			gradientId: $blockIdx === 0 ? 'gray-blue' : 'transparent-blue',
			opacity: EMBEDDING,
			pathGenerator: (source: DOMRect, target: DOMRect, curve: number) => {
				const scrollTop = window.scrollY;
				const scrollLeft = window.scrollX;

				const rightOffset = 30;
				const { curveOffset } = pathAdjustor(source, target, curve);
				return `
					M ${source.right + scrollLeft},${source.top + scrollTop}
					L ${source.right + rightOffset + scrollLeft},${source.top + scrollTop}
					C ${source.right + rightOffset + scrollLeft + curveOffset},${source.top + scrollTop} ${target.left + scrollLeft - curveOffset},${target.top + scrollTop} ${target.left + scrollLeft},${target.top + scrollTop}
					L ${target.left + scrollLeft},${target.bottom + scrollTop}
					C ${target.left + scrollLeft - curveOffset},${target.bottom + scrollTop} ${source.right + rightOffset + scrollLeft + curveOffset},${source.bottom + scrollTop} ${source.right + rightOffset + scrollLeft},${source.bottom + scrollTop}
					L ${source.right + scrollLeft},${source.bottom + scrollTop}
					Z
				`;
			},
			onMouseOver: () => {
				const paths = d3.select(`g.qkv`).selectAll('path');
				paths.transition().duration(100).style('opacity', 1);
				tooltip.set('click to see QKV calculation');
			},
			onMouseOut: () => {
				const paths = d3.select(`g.qkv`).selectAll('path');
				paths.transition().duration(100).style('opacity', EMBEDDING);
				tooltip.set(null);
			},
			onMouseClick: (e: Event, d: any) => {
				e.stopPropagation();
				if ($weightPopover === 'qkv') weightPopover.set(null);
				else weightPopover.set('qkv');
			}
		}
	];
	$: attentionPaths = [
		{
			from: '.qkv .qkv-column .query .sub-vector.head1',
			to: '.head-block .query .vector',
			// fill: theme.colors.blue[200]
			gradientId: 'blue-blue',
			opacity: ATTENTION_HEAD_1
		},
		{
			from: '.qkv .qkv-column .key .sub-vector.head1',
			to: '.head-block .key .vector',
			// fill: theme.colors.red[200]
			gradientId: 'red-red',
			opacity: ATTENTION_HEAD_1
		},
		{
			from: '.qkv .qkv-column .value .sub-vector.head1',
			to: '.head-block .value .vector',
			// fill: theme.colors.green[200]
			gradientId: 'green-green',
			opacity: ATTENTION_HEAD_1
		},
		{
			from: '.attention .head-out .vector',
			to: '.mlp .initial .head1',
			gradientId: 'purple-purple',
			opacity: ATTENTION_HEAD_1
			// fill: theme.colors.purple[200]
		},
		{
			from: '.head-block .head1.key .vector',
			to: `.attention-matrix.attention-initial .main g.g-row-${$tokens.length - 1} rect`,
			id: 'key-to-attention',
			type: 'stroke',
			gradientId: 'red-purple',
			opacity: ATTENTION_HEAD_1,		unique: true,
		curve: 20,
		pathGenerator: (source: DOMRect, target: DOMRect, curve: number) => {
				const scrollTop = window.scrollY;
				const scrollLeft = window.scrollX;

				const sourceMiddleY = source.top + scrollTop + source.height / 2;
				const targetMiddleX = target.left + scrollLeft + target.width / 2;
				// const { curveOffset } = pathAdjustor(source, target, curve);
				let curveOffset = curve;
				return `
			    M ${source.right + scrollLeft},${sourceMiddleY}
			    L ${targetMiddleX - curveOffset},${sourceMiddleY}
			    A ${curveOffset},${curveOffset} 0 0 1 ${targetMiddleX},${sourceMiddleY + curveOffset}
			    L ${targetMiddleX},${target.bottom + scrollTop}
			`;
			}
		},
		{
			from: '.head-block .query .vector',
			to: `.attention-initial .main g.g-row`,
			gradientId: 'blue-purple',
			id: 'query-to-attention',		unique: true,
		type: 'stroke',
		opacity: ATTENTION_HEAD_1,
		curve: curveFactor * 30,
		pathGenerator: (source: DOMRect, target: DOMRect, curve: number) => {
				let curveOffset = curve;

				const scrollTop = window.scrollY;
				const scrollLeft = window.scrollX;

				const sourceMiddleY = source.top + scrollTop + source.height / 2;
				const targetMiddleY = target.top + scrollTop + target.height / 2;
				const controlPoint1X = source.right + scrollLeft + curveOffset;
				const controlPoint2X = target.left + scrollLeft - curveOffset;

				return `
			    M ${source.right + scrollLeft},${sourceMiddleY}
			    C ${controlPoint1X},${sourceMiddleY} ${controlPoint2X},${targetMiddleY} ${target.left + scrollLeft},${targetMiddleY}
					L ${target.right + scrollLeft},${targetMiddleY}
			`;
			}
		},
		{
			from: '.attention-matrix.attention-out .main svg',
			to: '.attention .head-out',		gradientId: 'transparent-purple2',
		id: 'to-attention-out',
		unique: true,
		opacity: ATTENTION_OUT,
		curve: 20,
		pathGenerator: (source: DOMRect, target: DOMRect, curve: number) => {
				const { curveOffset } = pathAdjustor(source, target, curve);

				const scrollTop = window.scrollY;
				const scrollLeft = window.scrollX;

				return `
			    M ${source.right + scrollLeft},${source.top + scrollTop}
			    C ${source.right + scrollLeft + curveOffset},${source.top + scrollTop} ${target.left + scrollLeft - curveOffset},${target.top + scrollTop} ${target.left + scrollLeft},${target.top + scrollTop}
			    L ${target.left + scrollLeft},${target.bottom + scrollTop}
			    C ${target.left + scrollLeft - curveOffset},${target.bottom + scrollTop} ${source.right + scrollLeft + curveOffset},${source.bottom + scrollTop} ${source.right + scrollLeft},${source.bottom + scrollTop}
			    Z
			`;
			},
			onMouseOver: () => {
				d3.select('path.value-to-out').transition().duration(100).style('opacity', 0.8);
				d3.select('path.to-attention-out').transition().duration(100).style('opacity', 0.8);

				tooltip.set('click to see Attention Out calculation');
			},
			onMouseOut: () => {
				d3.select('path.value-to-out').transition().duration(100).style('opacity', ATTENTION_OUT);
				d3.select('path.to-attention-out')
					.transition()
					.duration(100)
					.style('opacity', ATTENTION_OUT);

				tooltip.set(null);
			},
			onMouseClick: (e: Event, d: any) => {
				e.stopPropagation();

				if ($weightPopover === 'attention') weightPopover.set(null);
				else weightPopover.set('attention');
			}
		},
		{
			from: '.head-block .value',
			to: '.attention .head-out',
			gradientId: 'green-purple',
			id: 'to-attention-out value-to-out',
			unique: true,
			opacity: ATTENTION_OUT,
			curve: curveFactor * 30,
			pathGenerator: (source, target, curve) => {
				const scrollTop = window.scrollY;
				const scrollLeft = window.scrollX;
				const { curveOffset } = pathAdjustor(source, target, curve);
				return `
        M ${source.right + scrollLeft},${source.top + scrollTop} 
        C ${target.left - curveOffset},${source.top + scrollTop} ${target.left + scrollLeft - curveOffset},${source.top + scrollTop} ${target.left + scrollLeft},${target.top + scrollTop}
        L ${target.left + scrollLeft},${target.bottom + scrollTop}
        C ${target.left + scrollLeft - curveOffset},${source.bottom + scrollTop} ${target.left - curveOffset},${source.bottom + scrollTop} ${source.right + scrollLeft},${source.bottom + scrollTop}
        Z
    `;
			},
			onMouseOver: () => {
				d3.select('path.value-to-out').transition().duration(100).style('opacity', 0.8);
				d3.select('path.to-attention-out').transition().duration(100).style('opacity', 0.8);

				tooltip.set('click to see Attention Out calculation');
			},
			onMouseOut: () => {
				d3.select('path.value-to-out').transition().duration(100).style('opacity', ATTENTION_OUT);
				d3.select('path.to-attention-out')
					.transition()
					.duration(100)
					.style('opacity', ATTENTION_OUT);

				tooltip.set(null);
			},
			onMouseClick: (e: Event, d: any) => {
				e.stopPropagation();

				if ($weightPopover === 'attention') weightPopover.set(null);
				else weightPopover.set('attention');
			}
		}
	];
	$: mlpUpPaths = [
	{
		from: '.mlp .column.initial .vector',
		to: '.mlp .second-layer .vector',
		gradientId: 'purple-indigo',
		curve: 50 + (curveFactor - 1) * 20,
		opacity: MLP,
		pathGenerator: (source: DOMRect, target: DOMRect, curve: number) => {
				const scrollTop = window.scrollY;
				const scrollLeft = window.scrollX;

				const rightOffset = rootRem * 3;
				const { curveOffset } = pathAdjustor(source, target, curve);
				return `
					M ${source.right + scrollLeft},${source.top + scrollTop}
					L ${source.right + rightOffset + scrollLeft},${source.top + scrollTop}
					C ${source.right + rightOffset + scrollLeft + curveOffset},${source.top + scrollTop} ${target.left + scrollLeft - curveOffset},${target.top + scrollTop} ${target.left + scrollLeft},${target.top + scrollTop}
					L ${target.left + scrollLeft},${target.bottom + scrollTop}
					C ${target.left + scrollLeft - curveOffset},${target.bottom + scrollTop} ${source.right + rightOffset + scrollLeft + curveOffset},${source.bottom + scrollTop} ${source.right + rightOffset + scrollLeft},${source.bottom + scrollTop}
					L ${source.right + scrollLeft},${source.bottom + scrollTop}
					Z
				`;
			},
			onMouseOver: () => {
				const paths = d3.select(`g.mlpUp`).selectAll('path');
				paths.transition().duration(100).style('opacity', 0.6);
				tooltip.set('click to see MLP process');
			},
			onMouseOut: () => {
				const paths = d3.select(`g.mlpUp`).selectAll('path');
				paths.transition().duration(100).style('opacity', MLP);
				tooltip.set(null);
			},
			onMouseClick: (e: Event, d: any) => {
				e.stopPropagation();

				if ($weightPopover === 'mlpUp') weightPopover.set(null);
				else weightPopover.set('mlpUp');
			}
		}
	];
	$: mlpDownPaths = [
		{
			from: '.mlp .second-layer .vector',
			to: '.mlp .column.out .vector',
			gradientId: 'indigo-blue',
			curve: 50 + (curveFactor - 1) * 20,
			opacity: MLP,
			pathGenerator: (source: DOMRect, target: DOMRect, curve: number) => {
				const scrollTop = window.scrollY;
				const scrollLeft = window.scrollX;

				const leftOffset = rootRem * 1.5;
				const { curveOffset } = pathAdjustor(source, target, curve);
				return `
					M ${source.right + scrollLeft},${source.top + scrollTop}
					C ${source.right + scrollLeft + curveOffset},${source.top + scrollTop} ${target.left - leftOffset + scrollLeft - curveOffset},${target.top + scrollTop} ${target.left - leftOffset + scrollLeft},${target.top + scrollTop}
					L ${target.left + scrollLeft},${target.top + scrollTop}
					L ${target.left + scrollLeft},${target.bottom + scrollTop}
					L ${target.left - leftOffset + scrollLeft},${target.bottom + scrollTop}
					C ${target.left - leftOffset + scrollLeft - curveOffset},${target.bottom + scrollTop} ${source.right + scrollLeft + curveOffset},${source.bottom + scrollTop} ${source.right + scrollLeft},${source.bottom + scrollTop}
					L ${source.right + scrollLeft},${source.bottom + scrollTop}
					Z
				`;
			},
			onMouseOver: () => {
				const paths = d3.select(`g.mlpDown`).selectAll('path');
				paths.transition().duration(100).style('opacity', 0.6);
				tooltip.set('click to see MLP process');
			},
			onMouseOut: () => {
				const paths = d3.select(`g.mlpDown`).selectAll('path');
				paths.transition().duration(100).style('opacity', MLP);
				tooltip.set(null);
			},
			onMouseClick: (e: Event, d: any) => {
				e.stopPropagation();

				if ($weightPopover === 'mlpDown') weightPopover.set(null);
				else weightPopover.set('mlpDown');
			}
		}
	];

	$: pathMap = {
		embedding: [
			{
				from: '.embedding .vector-column .column.vectors .vector',
				to: '.block-steps.main .qkv .vector-column .column.vectors .vector',
				gradientId: 'gray-white-blue',
				opacity: TRANSFORMER_BLOCKS
			}
		],
		qkv: qkvPaths.map((d) => ({
			...d,
			from: `.block-steps.main ${d.from}`,
			to: `.block-steps.main ${d.to}`
		})),
		nextQkv: qkvPaths.map((d) => ({
			...d,
			from: `.block-steps.next ${d.from}`,
			to: `.block-steps.next ${d.to}`
		})),
		attention: attentionPaths.map((d) => ({
			...d,
			from: `.block-steps.main ${d.from}`,
			to: `.block-steps.main ${d.to}`
		})),
		nextAttention: attentionPaths.map((d) => ({
			...d,
			from: `.block-steps.next ${d.from}`,
			to: `.block-steps.next ${d.to}`
		})),
		mlpUp: mlpUpPaths.map((d) => ({
			...d,
			from: `.block-steps.main ${d.from}`,
			to: `.block-steps.main ${d.to}`
		})),
		mlpDown: mlpDownPaths.map((d) => ({
			...d,
			from: `.block-steps.main ${d.from}`,
			to: `.block-steps.main ${d.to}`
		})),
		nextMlpUp: mlpUpPaths.map((d) => ({
			...d,
			from: `.block-steps.next ${d.from}`,
			to: `.block-steps.next ${d.to}`
		})),
		nextMlpDown: mlpDownPaths.map((d) => ({
			...d,
			from: `.block-steps.next ${d.from}`,
			to: `.block-steps.next ${d.to}`
		})),
		'transformer-blocks': [
			{
				from: `.block-steps.${$isOnBlockTransition ? 'next' : 'main'} .mlp .column.out .vector`,			to: '.transformer-blocks .column.final .vector',
			gradientId: $blockIdx === $modelMeta.layer_num - 1 ? 'blue' : 'blue-white-blue',
			opacity: $blockIdx === $modelMeta.layer_num - 1 ? MLP : TRANSFORMER_BLOCKS,
			pathGenerator: (source: DOMRect, target: DOMRect, curve: number) => {
					const scrollTop = window.scrollY;
					const scrollLeft = window.scrollX;
					const { curveOffset } = pathAdjustor(source, target, curve);
					return `
        M ${source.right + scrollLeft},${source.top + scrollTop}
        C ${source.right + scrollLeft + curveOffset},${source.top + scrollTop} ${target.left + scrollLeft - curveOffset},${target.top + scrollTop} ${target.left + scrollLeft},${target.top + scrollTop}
        L ${target.left + scrollLeft},${target.bottom + scrollTop}
        C ${target.left + scrollLeft - curveOffset},${target.bottom + scrollTop} ${source.right + scrollLeft + curveOffset},${source.bottom + scrollTop} ${source.right + scrollLeft},${source.bottom + scrollTop}
        Z
    `;
				}
			}
		],
		softmax: [
			{
				from: '.transformer-blocks .final .vector.last-token',
				to: '.softmax .content .vector',
				gradientId: 'blue-gray',
				opacity: LOGIT,
				unique: true,
				onMouseOver: () => {
					const paths = d3.select(`g.softmax`).selectAll('path');
					paths.transition().duration(100).style('opacity', 1);
					tooltip.set('click to see Logits calculation');
					// showTooltip('');
				},
				onMouseOut: () => {
					const paths = d3.select(`g.softmax`).selectAll('path');
					paths.transition().duration(100).style('opacity', LOGIT);
					// hideTooltip();
					tooltip.set(null);
				},
				onMouseClick: (e: Event, d: any) => {
					e.stopPropagation();

					if ($weightPopover === 'softmax') weightPopover.set(null);
					else weightPopover.set('softmax');
				}
			}
		]
	};

	const createGradients = () => {
		const svg = d3.select(svgEl as SVGElement);
		const defs = svg.append('defs');

		Object.keys(gradientMap).forEach((key) => {
			const stops = gradientMap[key as keyof typeof gradientMap];
			const grad = defs
				.append('linearGradient')
				.attr('id', key)
				.attr('class', key)
				.attr('x1', '0%')
				.attr('y1', '0%')
				.attr('x2', '100%')
				.attr('y2', '0%');

			const gradClone = defs
				.append('linearGradient')
				.attr('id', key + '-last')
				.attr('class', key)
				.attr('x1', '0%')
				.attr('y1', '0%')
				.attr('x2', '100%')
				.attr('y2', '0%');

			Object.keys(stops).forEach((stop) => {			let color, opacity;
			const stopValue = (stops as any)[stop];
			if (typeof stopValue !== 'string') {
				color = stopValue.color;
				opacity = stopValue.opacity;
			} else {
				color = stopValue;
				opacity = 1;
			}

				grad
					.append('stop')
					.attr('offset', `${stop}%`)
					.attr('stop-color', color)
					.attr('stop-opacity', opacity);

				gradClone
					.append('stop')
					.attr('offset', `${stop}%`)
					.attr('stop-color', color)
					.attr('stop-opacity', opacity);
			});
		});
	};

	const drawPath = async () => {
		await tick();
		const svg = d3.select(svgEl as SVGElement);
		const svgBack = d3.select(svgBackEl as SVGElement);

		[
			{ dataMap: pathMap, svg },
			{ dataMap: backPathMap, svg: svgBack }
		].forEach(({ dataMap, svg }) => {
			const g = svg
				.selectAll('g.path-group')
				.data(Object.keys(dataMap))
				.join('g')
				.attr('class', (d) => `path-group ${d}`);

			g.selectAll('path.sankey-path')
				.data((d: string) => {
					const data = dataMap[d as keyof typeof dataMap].map((item: any) => {
						const { from, to, curve, pathGenerator, gradientId, unique, ...rest } = item;
						const sources = d3.selectAll(from).nodes() as unknown as Element[];
						const targets = d3.selectAll(to).nodes() as unknown as Element[];

						return sources.map((src, i) => {
							const source = src?.getBoundingClientRect();
							const target = targets[i]?.getBoundingClientRect();

							const curveOffset = curve || defaultCurveOffset;

							const generator = pathGenerator || defaultPathGenerator;
							const path = source && target ? generator(source, target, curveOffset) : '';

							const isLast = targets.length > 1 && i === sources.length - 1;
							let gradUrl = gradientId;

							if (isLast && !unique && document.getElementById(gradientId + '-last')) {
								gradUrl = gradientId + '-last';
							}

							return {
								isLast: i === sources.length - 1,
								path,
								fill:
									item.type === 'stroke'
										? 'none'
										: item.gradientId
											? `url(#${gradUrl})`
											: item.fill,
								opacity: item.opacity,
								stroke:
									item.type === 'stroke'
										? item.gradientId
											? `url(#${item.gradientId})`
											: item.fill
										: 'none',
								clickable: !!item.onMouseClick,
								...rest
							};
						});
					});				return data.flat();
			})
			.join('path')
			.attr('class', (d: any) => `sankey-path ${d.id || ''} ${d.isLast ? 'last' : ''}`)
			.attr('fill', (d: any) => d.fill)
			.attr('stroke', (d: any) => d.stroke)
			.attr('stroke-width', 2)
			.attr('opacity', (d: any) => d.opacity)
			.attr('cursor', (d: any) => d.clickable && 'pointer')
			.attr('d', (d: any) => d.path)
			.on('mouseenter', (e: Event, d: any) => d.onMouseOver?.(d))
			.on('mouseleave', (e: Event, d: any) => d.onMouseOut?.(d))
			.on('click', (e: Event, d: any) => d.onMouseClick?.(e, d));
		});
	};

	const defaultPathGenerator = (source: DOMRect, target: DOMRect, curve: number) => {
		const scrollTop = window.scrollY;
		const scrollLeft = window.scrollX;
		const { curveOffset } = pathAdjustor(source, target, curve);

		return `
        M ${source.right + scrollLeft},${source.top + scrollTop}
        C ${source.right + scrollLeft + curveOffset},${source.top + scrollTop} ${target.left + scrollLeft - curveOffset},${target.top + scrollTop} ${target.left + scrollLeft},${target.top + scrollTop}
        L ${target.left + scrollLeft},${target.bottom + scrollTop}
        C ${target.left + scrollLeft - curveOffset},${target.bottom + scrollTop} ${source.right + scrollLeft + curveOffset},${source.bottom + scrollTop} ${source.right + scrollLeft},${source.bottom + scrollTop}
        Z
    `;
	};

	const pathAdjustor = (source: DOMRect, target: DOMRect, curve: number) => {
		const distance = target.left - source.right;
		const maxDistance = 100;

		const curveOffset = distance > maxDistance ? curve : curve * (distance / maxDistance);

		return { curveOffset };
	};

	onMount(() => {
		createGradients();

		const updateSvgs = () => {
			drawPath();
			drawResidualPath();
		};

		// animate during resizing
		resizeObserver = new ResizeObserver(updateSvgs);

		const elements = document?.querySelectorAll('.resize-watch');
		elements.forEach((el) => resizeObserver.observe(el));

		const transition = document?.querySelector('.transition-watch');

		if (transition) {
			resizeObserver.observe(transition);
		}

		// redraw when data updated
		const unsubscribeAttnIdx = attentionHeadIdx.subscribe(async (newIdx) => {
			drawPath();
		});

		return () => {
			resizeObserver.disconnect();
			unsubscribeAttnIdx();
		};
	});

	$: if (typeof window !== 'undefined') {
		if ($tokens) {
			drawPath();
			drawResidualPath();
		}
	}

	const drawResidualPath = () => {
		const svg = d3.select(svgEl as SVGElement);

		const starts = d3.selectAll(`.residual-start path.head`).nodes() as Element[];
		const ends = d3.selectAll(`.residual-end path.head`).nodes() as Element[];

		const lineData = starts.map((start, i) => {
			if (!start || !ends[i] || !('getBoundingClientRect' in start) || !('getBoundingClientRect' in ends[i])) {
				return null;
			}
			const startEl = (start as HTMLElement).getBoundingClientRect();
			const endEl = (ends[i] as HTMLElement).getBoundingClientRect();

			const x1 = startEl.right;
			const y1 = startEl.top;
			const x2 = endEl.left;
			const y2 = endEl.top;

			return { x1, y1, x2, y2, id: (start as HTMLElement).id };
		}).filter(Boolean);
		svg		.selectAll('line.residual-connector')
		.data(lineData)
		.join('line')
		.attr('class', (d: any) => `residual-connector ${d?.id || ''}`)
		.attr('x1', (d: any) => d?.x1 || 0)
		.attr('y1', (d: any) => d?.y1 || 0)
		.attr('x2', (d: any) => d?.x2 || 0)
		.attr('y2', (d: any) => d?.y2 || 0)
			.attr('stroke', theme.colors.gray[400])
			.attr('stroke-width', 1)
			.attr('stroke-dasharray', '8,4')
			.style('opacity', 0);
	};
</script>

<svelte:window bind:innerWidth={screenWidth} />

<div bind:clientWidth={screenWidth} class="h-full w-full">
	<svg
		bind:this={svgBackEl}
		id="back"
		class="sankey-back absolute left-0 top-0 h-full w-full"
		style={`z-index:${$modelMeta.attention_head_num - 1};`}
	></svg>
	<svg
		bind:this={svgEl}
		class="sankey-top absolute left-0 top-0 h-full w-full"
		style={`z-index:${$modelMeta.attention_head_num};`}
	/>
</div>

<style lang="scss">
</style>
