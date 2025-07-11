<script lang="ts">
	import classNames from 'classnames';
	import Operation from './Operation.svelte';
	import DropoutPopover from './Popovers/DropoutPopover.svelte';
	import { tokens } from '~/store';
	import LayerNormPopover from './Popovers/LayerNormPopover.svelte';
	import ActivationPopover from './Popovers/ActivationPopover.svelte';
	import * as d3 from 'd3';
	import ResidualPopover from './Popovers/ResidualPopover.svelte';
	import gsap from 'gsap';
	import { onClickReadMore } from '~/utils/event';

	export let id: string;
	export let className: string | undefined = undefined;
	export let type: string | undefined = undefined;

	let isHovered = false;

	const onMouseOver = () => {
		isHovered = true;
		const startGroup = document.querySelector(`#${id}-start`);
		const endGroup = document.querySelector(`#${id}-end`);

		const connector = d3.select(`.residual-connector.${id}`);
		connector.style('opacity', 1);
		connectLine(connector);

		startGroup?.classList.add('active');
		endGroup?.classList.add('active');
	};

	let residualAnimation: gsap.core.Tween | undefined;
	const onMouseOut = () => {
		isHovered = false;
		const startGroup = document.querySelector(`#${id}-start`);
		const endGroup = document.querySelector(`#${id}-end`);

		const connector = d3.select(`.residual-connector.${id}`);
		connector.style('opacity', 0);
		if (residualAnimation) {
			residualAnimation.kill();
			connector.style('stroke-dashoffset', 0);
		}

		startGroup?.classList.remove('active');
		endGroup?.classList.remove('active');
	};

	const connectLine = (path: d3.Selection<any, any, any, any>) => {
		residualAnimation = gsap.to(path.node(), {
			strokeDashoffset: -50,
			duration: 1,
			repeat: -1,
			ease: 'none'
		});
	};
</script>

{#if type === 'activation'}
	<div
		{id}
		data-click="activation"
		class={classNames('operation-col column activation', className)}
		role="button"
		tabindex="0"
		class:active={isHovered}
		on:mouseenter={() => {
			isHovered = true;
		}}
		on:mouseleave={() => {
			isHovered = false;
		}}
		on:click={(e) => {
			onClickReadMore(e, 'article-activation', { value: type });
		}}
		on:keydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				onClickReadMore(e, 'article-activation', { value: type });
			}
		}}
	>
		{#each $tokens as token, index}
			<Operation
				className={classNames(className, {
					last: index === $tokens.length - 1
				})}
				type="activation"
				tail={index === $tokens.length - 1}
				active={isHovered}
			/>
		{/each}
	</div>
	<ActivationPopover triggeredBy={`#${id}`} offset={1} />
{:else if type === 'dropout'}
	<div
		{id}
		data-click="dropout"
		class={classNames('operation-col column dropout', className)}
		role="button"
		tabindex="0"
		class:active={isHovered}
		on:mouseenter={() => {
			isHovered = true;
		}}
		on:mouseleave={() => {
			isHovered = false;
		}}
		on:click={(e) => {
			onClickReadMore(e, 'article-dropout', { value: type });
		}}
		on:keydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				onClickReadMore(e, 'article-dropout', { value: type });
			}
		}}
	>
		{#each $tokens as token, index}
			<Operation
				className={classNames(className, {
					last: index === $tokens.length - 1
				})}
				type="dropout"
				tail={index === $tokens.length - 1}
				active={isHovered}
			/>
		{/each}
	</div>
	<DropoutPopover triggeredBy={`#${id}`} offset={1} />
{:else if type === 'ln'}
	<div
		{id}
		data-click="layernorm"
		class={classNames('operation-col column ln', className)}
		role="button"
		tabindex="0"
		class:active={isHovered}
		on:mouseenter={() => {
			isHovered = true;
		}}
		on:mouseleave={() => {
			isHovered = false;
		}}
		on:click={(e) => {
			onClickReadMore(e, 'article-ln', { value: type });
		}}
		on:keydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				onClickReadMore(e, 'article-ln', { value: type });
			}
		}}
	>
		{#each $tokens as token, index}
			<Operation
				className={classNames(className, {
					last: index === $tokens.length - 1
				})}
				type="ln"
				tail={index === $tokens.length - 1}
				active={isHovered}
			/>
		{/each}
	</div>
	<LayerNormPopover triggeredBy={`#${id}`} />
{:else if type === 'residual-start'}
	<div
		data-click="residual-start"
		id={`${id}-start`}
		class={classNames('operation-col column residual', className)}
		role="button"
		tabindex="0"
		class:active={isHovered}
		on:mouseenter={onMouseOver}
		on:mouseleave={onMouseOut}
		on:click={(e) => {
			onClickReadMore(e, 'article-residual', { value: type });
		}}
		on:keydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				onClickReadMore(e, 'article-residual', { value: type });
			}
		}}
	>
		{#each $tokens as token, index}
			<Operation
				{id}
				className={classNames(className, {
					last: index === $tokens.length - 1
				})}
				type="residual-start"
				head={index === 0}
				active={isHovered}
			/>
		{/each}
	</div>
	<ResidualPopover reference={`#${id}-start`} triggeredBy={`[id^='${id}-']`} offset={1} />
{:else if type === 'residual-end'}
	<div
		id={`${id}-end`}
		data-click="residual-end"
		class={classNames('operation-col column residual', className)}
		role="button"
		tabindex="0"
		class:active={isHovered}
		on:mouseenter={onMouseOver}
		on:mouseleave={onMouseOut}
		on:click={(e) => {
			onClickReadMore(e, 'article-residual', { value: type });
		}}
		on:keydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				onClickReadMore(e, 'article-residual', { value: type });
			}
		}}
	>
		{#each $tokens as token, index}
			<Operation
				{id}
				className={classNames(className, {
					last: index === $tokens.length - 1
				})}
				type="residual-end"
				head={index === 0}
				active={isHovered}
			/>
		{/each}
	</div>
{/if}

<style lang="scss">
	.column.operation-col {
		cursor: help;
		z-index: $ABOVE_COLUMN;
		height: fit-content;

		&.residual {
			opacity: 0.5;

			&.active {
				opacity: 1;
			}
		}

		&.active {
			z-index: $ABOVE_COLUMN;
			&::after {
				content: '';
				position: absolute;
				height: 100%;
				width: 1.3rem;
				z-index: $POPOVER_INDEX;
			}
		}
	}

	:global(.dropout-popover),
	:global(.ln-popover),
	:global(.residual-popover) {
		width: 10rem;
		z-index: $POPOVER_INDEX;
	}
</style>
