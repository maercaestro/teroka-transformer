<script>
	const slides = [
		{
			title: 'Apa itu Transformer?',
			content:
				'Transformer adalah seni bina rangkaian neural yang mengubah AI. Ia menggunakan mekanisme "Attention" untuk memproses keseluruhan urutan teks serentak, membolehkan pemahaman konteks yang lebih mendalam berbanding model lama.'
		},
		{
			title: 'Embedding',
			content:
				'Teks input ditukar kepada nombor (token) dan kemudian kepada vektor. Maklumat posisi ditambah supaya model tahu urutan perkataan. Ini adalah cara mesin "membaca" teks.'
		},
		{
			title: 'Blok Transformer',
			content:
				'Teras model ini. Terdiri daripada lapisan Self-Attention dan MLP. Data diproses melalui berbilang blok (12 blok untuk GPT-2 kecil) untuk membina pemahaman yang kompleks.'
		},
		{
			title: 'Self-Attention',
			content:
				'Membolehkan model fokus pada perkataan yang relevan. Menggunakan matriks Query (Carian), Key (Kunci), dan Value (Nilai) untuk mengira hubungan antara semua perkataan dalam ayat.'
		},
		{
			title: 'MLP',
			content:
				'Lapisan pemprosesan yang memetakan maklumat dari satu bentuk ke bentuk lain. Ia memproses setiap token secara individu untuk memperhalusi maklumat yang ditangkap oleh Attention.'
		},
		{
			title: 'Output & Kebarangkalian',
			content:
				'Model menghasilkan skor (logit) untuk setiap perkataan dalam vokabulari. Skor ini ditukar kepada kebarangkalian. Perkataan seterusnya dipilih berdasarkan kebarangkalian ini.'
		}
	];
</script>

<div class="summary-container">
	<div class="slides-wrapper">
		{#each slides as slide}
			<div class="slide-card">
				<h3>{slide.title}</h3>
				<p>{slide.content}</p>
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	.summary-container {
		width: 100%;
		padding: 2rem 0;
		background-color: theme('colors.gray.50');
		border-bottom: 1px solid theme('colors.gray.200');
	}

	.slides-wrapper {
		display: flex;
		gap: 1.5rem;
		overflow-x: auto;
		padding: 0 2rem;
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;

		/* Hide scrollbar for cleaner look but keep functionality */
		&::-webkit-scrollbar {
			height: 6px;
		}
		&::-webkit-scrollbar-track {
			background: transparent;
		}
		&::-webkit-scrollbar-thumb {
			background-color: theme('colors.gray.300');
			border-radius: 3px;
		}
	}

	.slide-card {
		flex: 0 0 300px;
		background: white;
		padding: 1.5rem;
		border-radius: 0.75rem;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
		border: 1px solid theme('colors.gray.100');
		transition: transform 0.2s;

		&:hover {
			transform: translateY(-2px);
			box-shadow:
				0 10px 15px -3px rgba(0, 0, 0, 0.1),
				0 4px 6px -2px rgba(0, 0, 0, 0.05);
		}

		h3 {
			color: theme('colors.purple.700');
			font-size: 1.25rem;
			font-weight: 600;
			margin-bottom: 0.75rem;
		}

		p {
			color: theme('colors.gray.600');
			font-size: 0.95rem;
			line-height: 1.5;
		}
	}
</style>
