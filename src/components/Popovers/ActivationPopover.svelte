<script lang="ts">
	import type { PopoverProps } from 'flowbite-svelte/Popover.svelte';
	import CommonPopover from './CommonPopover.svelte';

	export let offset: PopoverProps['offset'] = undefined;
	export let triggeredBy: PopoverProps['triggeredBy'] = undefined;
	export let trigger: PopoverProps['trigger'] = undefined;
	export let placement: PopoverProps['placement'] = undefined;
</script>

<CommonPopover
	className="activation-popover"
	title="Pengaktifan GELU"
	{offset}
	{triggeredBy}
	{trigger}
	{placement}
	goTo="article-activation"
>
		Mengaplikasikan transformasi bukan linear kepada output yang telah ditransformasikan secara linear untuk belajar corak kompleks.
</CommonPopover>

<style>
</style>
