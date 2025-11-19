<script>
	import tailwindConfig from '../../../tailwind.config';
	import resolveConfig from 'tailwindcss/resolveConfig';
	import Katex from '~/utils/Katex.svelte';
</script>

<div id="description">
	<div class="article-section" data-click="article-intro">
		<h1>Apakah itu Transformer?</h1>

		<p>
			Transformer adalah seni bina neural network yang telah membawa perubahan besar dalam dunia
			Kecerdasan Buatan (AI). Diperkenalkan buat pertama kali menerusi kertas kajian penting
			<a
				href="https://dl.acm.org/doi/10.5555/3295222.3295349"
				title="ACM Digital Library"
				target="_blank">"Attention is All You Need"</a
			>
			pada tahun 2017, Transformer kini menjadi tunjang utama dalam deep learning. Ia menjadi nadi kepada
			model penjana teks terkenal seperti <strong>GPT</strong> (OpenAI), <strong>Llama</strong>
			(Meta), dan
			<strong>Gemini</strong> (Google). Bukan sekadar teks, Transformer juga digunakan secara meluas
			dalam
			<a
				href="https://huggingface.co/learn/audio-course/en/chapter3/introduction"
				title="Hugging Face"
				target="_blank">penjanaan audio</a
			>,
			<a
				href="https://huggingface.co/learn/computer-vision-course/unit3/vision-transformers/vision-transformers-for-image-classification"
				title="Hugging Face"
				target="_blank">pengecaman imej</a
			>,
			<a href="https://elifesciences.org/articles/82819" title="eLife">ramalan struktur protein</a>,
			dan
			<a
				href="https://www.deeplearning.ai/the-batch/reinforcement-learning-plus-transformers-equals-efficiency/"
				title="Deep Learning AI"
				target="_blank">permainan video</a
			>, sekaligus membuktikan betapa versatil penggunaannya.
		</p>
		<p>
			Secara asasnya, model Transformer berfungsi melalui prinsip ramalan perkataan seterusnya:
			berdasarkan prompt yang diberikan pengguna, apakah <em
				>perkataan seterusnya yang paling sesuai</em
			>
			untuk melengkapkan ayat itu? Kekuatan sebenar Transformer terletak pada mekanisme self-attention,
			yang membolehkannya memproses data secara serentak dan memahami konteks ayat yang panjang dengan
			jauh lebih baik berbanding model terdahulu.
		</p>
		<p>
			Keluarga model GPT-2 adalah contoh klasik bagi Transformer jenis ini. Modul Teroka Transformer
			ini dikuasakan oleh model
			<a href="https://huggingface.co/openai-community/gpt2" title="Hugging Face" target="_blank"
				>GPT-2</a
			>
			(versi kecil) yang memiliki 124 juta parameter. Walaupun bukan model yang paling baharu atau paling
			berkuasa, ia masih berkongsi prinsip dan struktur yang sama dengan model terkini, menjadikannya
			permulaan terbaik untuk kita memahami asas teknologi ini.
		</p>
	</div>

	<div class="article-section" data-click="article-overview">
		<h1>Seni Bina Transformer</h1>

		<p>Setiap Transformer penjana teks terdiri daripada tiga komponen utama berikut:</p>
		<ol>
			<li>
				<strong class="bold-purple">Embedding</strong>: Input teks dipecahkan kepada unit kecil yang
				dipanggil token (boleh jadi perkataan penuh atau pecahan perkataan). Token-token ini
				kemudiannya ditukar kepada vektor numerik yang dikenali sebagai embedding, yang berfungsi
				untuk menangkap makna semantik perkataan tersebut.
			</li>
			<li>
				<strong class="bold-purple">Blok Transformer</strong>: Ini adalah komponen asas model yang
				memproses dan mengubah data input. Setiap blok mengandungi dua bahagian penting:
				<ul class="">
					<li>
						<strong>Mekanisme Attention</strong>: Komponen paling kritikal dalam blok Transformer.
						Ia membolehkan setiap token "berinteraksi" dengan token lain untuk menangkap maklumat
						kontekstual dan memahami hubungan antara perkataan dalam ayat.
					</li>
					<li>
						<strong>Lapisan MLP (Multilayer Perceptron)</strong>: Rangkaian feed-forward yang
						memproses setiap token secara berasingan. Jika lapisan attention bertujuan menghubungkan
						maklumat antara token, MLP pula bertindak memperhalusi representasi bagi setiap token
						tersebut secara individu.
					</li>
				</ul>
			</li>
			<li>
				<strong class="bold-purple">Kebarangkalian Output</strong>: Lapisan linear dan softmax yang
				terakhir akan menukar embedding yang telah diproses menjadi nilai kebarangkalian. Ini
				membolehkan model membuat ramalan tentang token manakah yang paling sesuai untuk muncul
				seterusnya dalam urutan ayat.
			</li>
		</ol>
	</div>

	<div class="article-section" id="embedding" data-click="article-embedding">
		<h2>Embedding</h2>
		<p>
			Bayangkan anda ingin menjana teks menggunakan model Transformer. Anda memasukkan prompt
			seperti ini: <code>“Data visualization empowers users to”</code>.
		</p>
		<p>
			Input ini perlu ditukarkan kepada format yang boleh difahami dan diproses oleh model. Di
			sinilah embedding memainkan peranan penting: ia menukar teks kepada representasi numerik yang
			boleh dibaca oleh mesin. Untuk menukar prompt menjadi embedding akhir, kita perlu melalui
			empat langkah berikut:
		</p>
		<ol>
			<li>
				<strong>Tokenisasi Input</strong>: Memecahkan teks input kepada unit kecil yang dipanggil
				token.
			</li>
			<li>
				<strong>Mendapatkan Token Embedding</strong>: Menukar setiap token kepada vektor numerik
				asas.
			</li>
			<li>
				<strong>Menambah Pengekodan Posisi (Positional Encoding)</strong>: Menyuntik maklumat
				tentang urutan atau kedudukan setiap perkataan dalam ayat.
			</li>
			<li>
				<strong>Penjumlahan Akhir</strong>: Menggabungkan (menambah) vektor token dan vektor posisi
				untuk menghasilkan embedding akhir.
			</li>
		</ol>
		<p>Mari kita lihat bagaimana setiap langkah ini dilakukan.</p>
		<div class="figure">
			<img
				src="./article_assets/embedding.png"
				width="65%"
				alt="Rajah lapisan embedding menunjukkan penokenan, embedding token, pengekodan kedudukan, dan langkah embedding akhir"
			/>
		</div>
		<div class="figure-caption">
			Rajah <span class="attention">1</span>: Paparan terperinci lapisan Embedding, menunjukkan
			bagaimana prompt input ditukarkan kepada representasi vektor. Proses ini melibatkan
			<span class="fig-numbering">(1)</span> Tokenisasi, (2) Token Embedding, (3) Pengekodan Posisi (Positional
			Encoding), dan (4) Embedding Akhir.
		</div>
		<div class="article-subsection">
			<h3>Langkah 1: Tokenisasi (Tokenization)</h3>
			<p>
				Tokenisasi ialah proses memecahkan teks input kepada unit yang lebih kecil dan mudah diurus
				yang dipanggil token. Token ini boleh terdiri daripada perkataan penuh atau pecahan
				perkataan (sub-words). Sebagai contoh, perkataan <code>"Data"</code> dan
				<code>"visualization"</code> sepadan dengan satu token unik, manakala perkataan
				<code>"empowers"</code> mungkin dipecahkan kepada dua token berasingan. Saiz vokabulari
				penuh token ditentukan sebelum model dilatih: Vokabulari GPT-2, misalnya, mempunyai
				<code>50,257</code> token unik. Setelah teks input dipecahkan kepada token dengan ID yang tersendiri,
				kita boleh mendapatkan representasi vektor masing-masing daripada lapisan embedding.
			</p>
		</div>
		<div class="article-subsection" id="article-token-embedding">
			<h3>Langkah 2: Token Embedding</h3>
			<p>
				GPT-2 (versi kecil) mewakili setiap token dalam vokabularinya sebagai vektor berdimensi 768
				(saiz dimensi bergantung pada jenis model). Vektor embedding ini disimpan dalam matriks
				bersaiz <code>(50,257, 768)</code>, yang mengandungi kira-kira 39 juta parameter! Matriks
				yang besar ini membolehkan model memberikan makna semantik kepada setiap token tersebut.
			</p>
		</div>
		<div class="article-subsection" id="article-positional-embedding">
			<h3>Langkah 3: Pengekodan Posisi (Positional Encoding)</h3>
			<p>
				Lapisan Embedding juga berfungsi mengekod maklumat tentang kedudukan setiap token dalam
				prompt input. Model yang berbeza menggunakan kaedah yang pelbagai untuk pengekodan posisi
				ini. Bagi GPT-2, ia melatih matriks kedudukannya sendiri dari kosong (from scratch), dan
				mengintegrasikannya secara langsung ke dalam proses latihan.
			</p>

			<!-- <div class="article-subsection-l2">
	<h4>Alternative Positional Encoding Approach <strong class='attention'>[POTENTIALLY COLLAPSIBLE]</strong></h4>
	<p>
	  Other models, like the original Transformer and BERT,
	  use sinusoidal functions for positional encoding.
	  This sinusoidal encoding is deterministic and designed to reflect
	  the absolute as well as the relative position of each token.
	</p>
	<p>
	  Each position in a sequence is assigned a unique mathematical
	  representation using a combination of sine and cosine functions.
	  For a given position, the sine function represents even dimensions,
	  and the cosine function represents odd dimensions within the positional encoding vector.
	  This periodic nature ensures that each position has a consistent encoding,
	  independent of the surrounding context.
	</p>
	<p>
	  Here’s how it works:
	</p>
	<span class='attention'>
	  SINUSOIDAL POSITIONAL ENCODING EQUATION
	</span>
	<ul>
	  <li>
		<strong>Sine Function</strong>: Used for even indices of the embedding vector.
	  </li>
	  <li>
		<strong>Cosine Function</strong>: Used for odd indices of the embedding vector.
	</ul>
	<p>
	  Hover over individual encoding values in the matrix above to
	  see how it's calculated using the sins and cosine functions.
	</p>
  </div> -->
		</div>
		<div class="article-subsection">
			<h3>Langkah 4: Embedding Akhir</h3>
			<p>
				Akhir sekali, kita menggabungkan (menambah) vektor token embedding dan vektor pengekodan
				posisi tadi untuk menghasilkan embedding akhir. Representasi gabungan ini penting kerana ia
				menangkap kedua-dua makna semantik token dan kedudukannya dalam urutan input serentak.
			</p>
		</div>
	</div>

	<div class="article-section" data-click="article-transformer-block">
		<h2>Blok Transformer</h2>

		<p>
			Teras pemprosesan model ini terletak pada Blok Transformer. Ia terdiri daripada gabungan
			Multi-Head Self-Attention dan lapisan Multilayer Perceptron (MLP). Kebanyakan model moden
			dibina dengan menyusun beberapa blok ini secara bersiri (berturutan).
		</p>
		<p>
			Representasi token akan berkembang melalui lapisan-lapisan ini, dari blok pertama hinggalah ke
			blok terakhir. Proses ini membolehkan model membina pemahaman yang mendalam dan kompleks
			mengenai setiap token. Pendekatan berlapis ini menghasilkan representasi aras tinggi
			(high-level representation) bagi input tersebut. Sebagai rujukan, model GPT-2 (versi kecil)
			yang sedang kita bincangkan mempunyai <code>12</code> blok seumpama ini.
		</p>
	</div>

	<div class="article-section" id="self-attention" data-click="article-attention">
		<h3>Multi-Head Self-Attention</h3>
		<p>
			Mekanisme self-attention membolehkan model memberi tumpuan kepada bahagian-bahagian yang
			relevan dalam urutan input. Ini membolehkan ia menangkap hubungan yang kompleks dan
			kebergantungan antara data. Mari kita lihat bagaimana self-attention dikira langkah demi
			langkah.
		</p>
		<div class="article-subsection-l2">
			<h4>Langkah 1: Matriks Query, Key, dan Value</h4>

			<div class="figure pt-10">
				<img
					src="./article_assets/QKV.png"
					width="80%"
					alt="Penjanaan matriks Query, Key, dan Value daripada embedding"
				/>
				<div class="text-xs">
					<Katex
						displayMode
						math={`
		QKV_{ij} = ( \\sum_{d=1}^{768} \\text{Embedding}_{i,d} \\cdot \\text{Weights}_{d,j}) + \\text{Bias}_j
		`}
					/>
				</div>
			</div>
			<div class="figure-caption">
				Rajah <span class="attention">2</span>: Pengiraan matriks Query, Key, dan Value daripada
				embedding asal.
			</div>

			<p>
				Setiap vektor embedding token diubah menjadi tiga vektor baharu:
				<span class="q-color">Query (Q)</span>,
				<span class="k-color">Key (K)</span>, dan
				<span class="v-color">Value (V)</span>. Vektor-vektor ini diperoleh dengan mendarabkan
				matriks embedding input dengan matriks pemberat (weights) yang telah dilatih untuk Q, K, dan
				V.
			</p>
			<p>
				Berikut adalah analogi carian web untuk memudahkan pemahaman kita mengenai fungsi matriks
				ini:
			</p>
			<ul>
				<li>
					<strong class="q-color font-medium">Query (Q)</strong>: Teks carian yang anda taip dalam
					bar enjin carian. Ini adalah token yang sedang "mencari maklumat lanjut".
				</li>
				<li>
					<strong class="k-color font-medium">Key (K)</strong>: Tajuk setiap halaman web dalam
					senarai hasil carian. Ia mewakili token-token lain yang mungkin relevan dengan Query tadi.
				</li>
				<li>
					<strong class="v-color font-medium">Value (V)</strong>: Kandungan sebenar halaman web
					tersebut. Setelah kita memadankan istilah carian (Query) dengan hasil yang relevan (Key),
					kita mahu mendapatkan isi kandungannya (Value).
				</li>
			</ul>
			<p>
				Dengan menggunakan nilai-nilai QKV ini, model boleh mengira skor attention, yang menentukan
				berapa banyak tumpuan yang perlu diberikan kepada setiap token semasa menjana ramalan.
			</p>
		</div>
		<div class="article-subsection-l2">
			<h4>Langkah 2: Pemecahan Multi-Head</h4>
			<p>
				Vektor <span class="q-color">Query</span>, <span class="k-color">Key</span>, dan
				<span class="v-color">Value</span>
				dipecahkan kepada beberapa 'kepala' atau heads—bagi GPT-2 (kecil), terdapat
				<code>12</code> heads. Setiap head memproses segmen embedding secara berasingan. Ini membolehkan
				model menangkap pelbagai hubungan sintaksis dan semantik yang berbeza serentak. Reka bentuk ini
				memudahkan pembelajaran selari ciri-ciri linguistik, sekaligus meningkatkan keupayaan representasi
				model.
			</p>
		</div>
		<div class="article-subsection-l2">
			<h4>Langkah 3: Masked Self-Attention</h4>
			<p>
				Dalam setiap head, kita melakukan pengiraan masked self-attention. Mekanisme ini membolehkan
				model menjana urutan dengan menumpukan pada bahagian input yang relevan, sambil menghalang
				akses kepada token masa depan (future tokens).
			</p>

			<div class="figure">
				<img
					src="./article_assets/attention.png"
					width="80%"
					alt="Rajah mekanisme attention menunjukkan hasil darab titik Query-Key dan pengiraan softmax"
					style="vertical-align: middle;"
				/>
			</div>
			<div class="figure-caption">
				Rajah <span class="attention">3</span>: Penggunaan matriks Query, Key, dan Value untuk
				mengira masked self-attention.
			</div>

			<ul>
				<li>
					<strong>Skor Attention</strong>: Hasil darab titik (dot product) antara matriks
					<span class="q-color">Query</span>
					dan <span class="k-color">Key</span> menentukan sejauh mana padanan setiap query dengan setiap
					key. Ini menghasilkan matriks segi empat sama yang mencerminkan hubungan antara semua token
					input.
				</li>
				<li>
					<strong>Masking</strong>: Satu mask digunakan pada bahagian segitiga atas matriks
					attention untuk menghalang model daripada mengakses token masa depan (menetapkan nilai ini
					kepada negatif infiniti). Model perlu belajar meramal token seterusnya tanpa "mengintai"
					(peeking) jawapan masa depan.
				</li>
				<li>
					<strong>Softmax</strong>: Selepas masking, skor attention ditukarkan menjadi
					kebarangkalian melalui operasi softmax. Setiap baris dalam matriks akan berjumlah satu,
					menunjukkan tahap relevan setiap token lain di sebelah kirinya.
				</li>
			</ul>
		</div>
		<div class="article-subsection-l2">
			<h4>Langkah 4: Output dan Gabungan</h4>
			<p>
				Model menggunakan skor masked self-attention tadi dan mendarabkannya dengan matriks
				<span class="v-color">Value</span> untuk mendapatkan output akhir mekanisme self-attention.
				Memandangkan GPT-2 mempunyai <code>12</code> heads, output daripada kesemua heads ini digabungkan
				(concatenated) dan disalurkan melalui satu unjuran linear (linear projection).
			</p>
		</div>
	</div>

	<div class="article-section" id="article-activation" data-click="article-mlp">
		<h3>MLP: Multi-Layer Perceptron</h3>

		<div class="figure">
			<img
				src="./article_assets/mlp.png"
				width="70%"
				alt="Rajah lapisan MLP menunjukkan unjuran ke dimensi yang lebih tinggi dan kembali"
				style="vertical-align: middle;"
			/>
		</div>
		<div class="figure-caption">
			Rajah <span class="attention">4</span>: Penggunaan lapisan MLP untuk mengunjurkan representasi
			self-attention ke dimensi yang lebih tinggi bagi meningkatkan kapasiti model.
		</div>

		<p>
			Selepas pelbagai heads menangkap hubungan antara token, output gabungan tersebut disalurkan ke
			lapisan Multilayer Perceptron (MLP). Blok MLP terdiri daripada dua transformasi linear dengan
			fungsi pengaktifan GELU di antaranya.
		</p>
		<p>
			Transformasi linear pertama mengembangkan dimensi input sebanyak empat kali ganda (daripada
			<code>768</code>
			kepada <code>3072</code>). Transformasi linear kedua mengecilkan semula dimensi ke saiz asal (<code
				>768</code
			>), memastikan lapisan seterusnya menerima input yang konsisten.
		</p>
		<p>
			Berbeza dengan self-attention, MLP memproses setiap token secara individu (independently) dan
			hanya berfungsi memetakan token tersebut dari satu representasi ke representasi yang lain
			untuk memperhalusi maklumat.
		</p>
	</div>

	<div class="article-section" id="article-prob" data-click="article-prob">
		<h2>Kebarangkalian Output</h2>
		<p>
			Setelah input diproses melalui kesemua blok Transformer, output disalurkan ke lapisan linear
			terakhir untuk penyediaan ramalan. Lapisan ini mengunjurkan representasi akhir ke dalam ruang
			dimensi <code>50,257</code> (saiz vokabulari), di mana setiap token mempunyai nilai sepadan
			yang dipanggil <code>logit</code>.
		</p>
		<p>
			Mana-mana token berpotensi menjadi perkataan seterusnya. Oleh itu, kita menyusun token-token
			ini mengikut kebarangkalian. Fungsi softmax digunakan untuk menukar logit menjadi taburan
			kebarangkalian yang berjumlah satu. Ini membolehkan kita membuat persampelan (sampling) token
			seterusnya.
		</p>

		<div class="figure py-5">
			<img
				src="./article_assets/softmax.png"
				width="70%"
				alt="Fungsi softmax menukar logits kepada taburan kebarangkalian merentasi perbendaharaan kata"
			/>
		</div>
		<div class="figure-caption">
			Rajah <span class="attention">5</span>: Setiap token dalam vokabulari diberikan kebarangkalian
			berdasarkan logit output model.
		</div>

		<p id="article-temperature" data-click="article-temperature">
			Langkah terakhir adalah menjana token dengan mengambil sampel daripada taburan ini. Di sini,
			hiperparameter <code>Temperature</code> memainkan peranan kritikal:
		</p>

		<ul>
			<li>
				<code>Temperature = 1</code>: Membahagikan logit dengan satu (tiada kesan pada output
				softmax).
			</li>
			<li>
				<code>Temperature &lt; 1</code>: Suhu rendah menjadikan model lebih yakin dan deterministik
				dengan "menajamkan" taburan kebarangkalian. Output menjadi lebih rigid dan mudah diramal.
			</li>
			<li>
				<code>Temperature &gt; 1</code>: Suhu tinggi menghasilkan taburan kebarangkalian yang lebih
				rata/lembut. Ini membenarkan lebih banyak elemen rawak dalam teks yang dijana—sering dirujuk
				sebagai "kreativiti" model.
			</li>
		</ul>

		<p id="article-sampling" data-click="article-sampling">
			Selain itu, proses persampelan boleh diperhalusi menggunakan parameter <code>top-k</code>
			dan
			<code>top-p</code>:
		</p>
		<ul>
			<li>
				<code>Persampelan top-k</code>: Hanya mempertimbangkan k token teratas dengan kebarangkalian
				tertinggi, sekaligus menapis pilihan yang tidak relevan.
			</li>
			<li>
				<code>Persampelan top-p (Nucleus Sampling)</code>: Mempertimbangkan set token terkecil yang
				mana kebarangkalian kumulatifnya melebihi ambang p. Ini memastikan hanya token yang paling
				mungkin dipilih, namun masih membenarkan kepelbagaian kosa kata.
			</li>
		</ul>
		<p>
			Dengan melaraskan <code>Temperature</code>, <code>top-k</code>, dan <code>top-p</code>, anda
			boleh mengimbangi antara output yang deterministik atau kreatif mengikut keperluan aplikasi
			anda.
		</p>
	</div>

	<div class="article-section" data-click="article-advanced-features">
		<h2>Ciri-ciri Seni Bina Lanjutan</h2>
		<p>
			Terdapat beberapa ciri seni bina lanjutan yang meningkatkan prestasi model Transformer dengan
			ketara. Walaupun komponen-komponen ini mungkin tidak kritikal untuk memahami konsep asas seni
			bina, ia amat mustahak untuk prestasi keseluruhan model yang optimum.
		</p>
		<p>
			Tiga komponen utama—Layer Normalization, Dropout, dan Residual Connections—memainkan peranan
			penting terutamanya semasa fasa latihan. Secara ringkasnya:
		</p>
		<ul>
			<li>
				<strong>Layer Normalization</strong> menstabilkan latihan dan mempercepatkan penumpuan (convergence).
			</li>
			<li><strong>Dropout</strong> mencegah overfitting dengan mematikan neuron secara rawak.</li>
			<li>
				<strong>Residual Connections</strong> membolehkan aliran kecerunan (gradient flow) bergerak lancar
				melalui rangkaian, sekaligus mengelakkan masalah kecerunan hilang (vanishing gradient problem).
			</li>
		</ul>
		<div class="article-subsection" id="article-ln">
			<h3>1. Layer Normalization</h3>
			<p>
				Layer Normalization berfungsi menstabilkan proses latihan dan meningkatkan kadar penumpuan
				model. Ia menormalkan input merentasi ciri-ciri (features), memastikan min dan varians
				pengaktifan kekal konsisten. Teknik ini membantu mengurangkan isu "anjakan kovariat dalaman"
				(internal covariate shift), membolehkan model belajar dengan lebih efisien dan kurang
				sensitif terhadap berat permulaan (initial weights). Dalam setiap blok Transformer, Layer
				Normalization digunakan dua kali: sebelum mekanisme self-attention dan sebelum lapisan MLP.
			</p>
		</div>
		<div class="article-subsection" id="article-dropout">
			<h3>2. Dropout</h3>
			<p>
				Dropout ialah teknik regularisasi yang digunakan untuk mencegah overfitting dalam rangkaian
				saraf. Ia berfungsi dengan menetapkan sebahagian kecil berat model kepada sifar (0) secara
				rawak semasa latihan. Ini memaksa model untuk mempelajari ciri-ciri yang lebih teguh
				(robust) dan tidak bergantung sepenuhnya pada neuron tertentu. Hasilnya, model mampu
				melakukan generalisasi dengan lebih baik terhadap data baharu. Semasa fasa inferens
				(penggunaan sebenar), dropout dimatikan sepenuhnya—ini bermakna kita seolah-olah menggunakan
				gabungan (ensemble) pelbagai sub-rangkaian yang telah dilatih, yang membawa kepada prestasi
				yang lebih baik.
			</p>
		</div>
		<div class="article-subsection" id="article-residual">
			<h3>3. Residual Connections</h3>
			<p>
				Mula diperkenalkan dalam model ResNet pada tahun 2015, inovasi ini merevolusikan bidang
				pembelajaran mendalam (deep learning) dengan membolehkan latihan rangkaian saraf yang sangat
				dalam. Secara asasnya, residual connections bertindak sebagai "jalan pintas" yang memintas
				satu atau lebih lapisan dengan menambah input asal terus kepada output lapisan tersebut.
			</p>
			<p>
				Ini membantu mengurangkan masalah kecerunan hilang (vanishing gradient), menjadikannya lebih
				mudah untuk melatih rangkaian yang mempunyai banyak blok Transformer bertingkat. Dalam
				GPT-2, sambungan ini digunakan dua kali dalam setiap blok: sekali sebelum MLP dan sekali
				selepasnya. Ini memastikan kecerunan mengalir dengan lancar dan lapisan awal menerima kemas
				kini (updates) yang mencukupi semasa proses backpropagation.
			</p>
		</div>
	</div>

	<div class="article-section" data-click="article-interactive-features">
		<h2>Ciri-ciri Interaktif</h2>
		<p>
			Aplikasi Teroka Transformer ini dibina untuk membolehkan anda menyelami sistem dalaman
			Transformer secara interaktif. Berikut adalah beberapa fungsi yang boleh anda cuba:
		</p>

		<ul>
			<li>
				<strong>Input Teks Sendiri</strong>: Masukkan ayat anda untuk melihat bagaimana model
				memprosesnya dan meramal perkataan seterusnya. Anda boleh meneliti berat attention,
				pengiraan perantaraan, dan bagaimana kebarangkalian output akhir dijana.
			</li>
			<li>
				<strong>Peluncur Temperature</strong>: Gunakan slider ini untuk mengawal tahap rawak ramalan
				model. Eksperimen untuk melihat bagaimana nilai suhu menjadikan output lebih deterministik
				(tetap) atau lebih kreatif.
			</li>
			<li>
				<strong>Persampelan Top-k & Top-p</strong>: Ubah kaedah persampelan ini untuk melaraskan
				tingkah laku model semasa inferens. Lihat bagaimana perubahan nilai mempengaruhi taburan
				kebarangkalian dan pemilihan kata model.
			</li>
			<li>
				<strong>Interaksi Peta Attention</strong>: Lihat bagaimana model memberi tumpuan kepada
				token yang berbeza dalam urutan input. Lalukan kursor (hover) di atas token untuk
				menyerlahkan berat attention masing-masing dan fahami bagaimana model menangkap konteks
				serta hubungan antara perkataan.
			</li>
		</ul>
	</div>

	<div class="article-section" data-click="article-implementation">
		<h2>Bagaimana Teroka Transformer Dibina?</h2>
		<p>
			Teroka Transformer menampilkan model GPT-2 (kecil) sebenar yang berjalan sepenuhnya di dalam
			pelayar web anda. Model ini diadaptasi daripada pelaksanaan PyTorch GPT oleh Andrej Karpathy
			(projek nanoGPT) dan telah ditukarkan kepada format ONNX Runtime untuk kelancaran pelaksanaan
			di pelayar.
		</p>
		<p>
			Antara muka aplikasi ini dibina menggunakan JavaScript, dengan Svelte sebagai rangka kerja
			bahagian hadapan (frontend framework) dan D3.js untuk menjana visualisasi dinamik. Segala
			nilai numerik yang dipaparkan akan dikemas kini secara langsung (real-time) berdasarkan input
			pengguna.
		</p>
	</div>

	<div class="article-section" data-click="article-credit">
		<h2>Kredit</h2>
		<p>
			Versi Bahasa Melayu ini diadaptasi dan dibangunkan semula oleh <a
				href="https://www.ahead-huzaifah.com/"
				target="_blank">Abu Huzaifah Bin Haji Bidin</a
			>.
		</p>
		<p class="mt-4 text-sm text-gray-500">
			Berdasarkan kerja asal oleh pasukan Georgia Tech:
			<a href="https://aereeeee.github.io/" target="_blank">Aeree Cho</a>,
			<a href="https://www.linkedin.com/in/chaeyeonggracekim/" target="_blank">Grace C. Kim</a>,
			<a href="https://alexkarpekov.com/" target="_blank">Alexander Karpekov</a>,
			<a href="https://alechelbling.com/" target="_blank">Alec Helbling</a>,
			<a href="https://zijie.wang/" target="_blank">Jay Wang</a>,
			<a href="https://seongmin.xyz/" target="_blank">Seongmin Lee</a>,
			<a href="https://bhoov.com/" target="_blank">Benjamin Hoover</a>, dan
			<a href="https://poloclub.github.io/polochau/" target="_blank">Polo Chau</a>.
		</p>
	</div>
</div>

<style lang="scss">
	a {
		color: theme('colors.blue.500');

		&:hover {
			color: theme('colors.blue.700');
		}
	}

	.bold-purple {
		color: theme('colors.purple.700');
		font-weight: bold;
	}

	code {
		color: theme('colors.gray.500');
		background-color: theme('colors.gray.50');
		font-family: theme('fontFamily.mono');
	}

	.q-color {
		color: theme('colors.blue.400');
	}

	.k-color {
		color: theme('colors.red.400');
	}

	.v-color {
		color: theme('colors.green.400');
	}

	.purple-color {
		color: theme('colors.purple.500');
	}

	.article-section {
		padding-bottom: 2rem;
	}
	.video-container {
		position: relative;
		padding-bottom: 56.25%; /* 16:9 aspect ratio */
		height: 0;
		overflow: hidden;
		max-width: 100%;
		background: #000;
	}

	.video-container iframe {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	#description {
		padding-bottom: 3rem;
		margin-left: auto;
		margin-right: auto;
		max-width: 78ch;
	}

	#description h1 {
		color: theme('colors.purple.700');
		font-size: 2.2rem;
		font-weight: 300;
		padding-top: 1rem;
	}

	#description h2 {
		// color: #444;
		color: theme('colors.purple.700');
		font-size: 2rem;
		font-weight: 300;
		padding-top: 1rem;
	}

	#description h3 {
		color: theme('colors.gray.700');
		font-size: 1.6rem;
		font-weight: 200;
		padding-top: 1rem;
	}

	#description h4 {
		color: theme('colors.gray.700');
		font-size: 1.6rem;
		font-weight: 200;
		padding-top: 1rem;
	}

	#description p {
		margin: 1rem 0;
	}

	#description p img {
		vertical-align: middle;
	}

	#description .figure-caption {
		font-size: 0.8rem;
		margin-top: 0.5rem;
		text-align: center;
		margin-bottom: 2rem;
	}

	#description ol {
		margin-left: 3rem;
		list-style-type: decimal;
	}

	#description li {
		margin: 0.6rem 0;
	}

	#description p,
	#description div,
	#description li {
		color: theme('colors.gray.600');
		line-height: 1.6;
	}

	#description ol li img {
		vertical-align: middle;
	}

	#description ul {
		list-style-type: disc;
		margin-left: 2.5rem;
		margin-bottom: 1rem;
	}

	#description a:hover {
		text-decoration: underline;
	}

	.figure {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
