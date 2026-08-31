# Visual & Sprite Asset Requirements - Shadow Runner

Dokumen ini berisi spesifikasi teknis dan deskripsi visual mendalam untuk setiap aset gambar, spritesheet, tileset, ikon, dan VFX. Dirancang tanpa tabel agar mudah disalin langsung ke Google Flow / Google Docs.

---

## 1. Karakter Pemain (Player Character)

Ukuran Canvas per Frame: 32x48 px atau 48x48 px.
Gaya Visual: Pixel art semi-realistis / dark roguelite (proporsi 3.5 - 4 head-tall, terinspirasi Dead Cells / Katana Zero).
Palet Warna Karakter:
- Jubah/Pakaian Utama: Biru safir gelap (#3498db dan bayangan #1b4f72) dengan syal/kain leher oranye terang (#e67e22) yang berkibar dinamis mengikuti gerakan.
- Helm/Topeng: Emas kuningan (#f1c40f) dengan celah mata bersinar putih tajam.
- Celana & Sepatu: Abu-abu arang gelap (#2c3e50) dengan pelindung lutut besi.

Daftar Spritesheet & Animasi Player:

- **spr_player_idle**
  - Deskripsi: 4 hingga 6 frame loop. Karakter berdiri tegak dalam kuda-kuda siaga (side-profile menghadap depan). Badan naik-turun halus 1-2 pixel menyimulasikan tarikan napas berat, ujung syal oranye melambai pelan tertiup angin. Tangan kanan memegang gagang senjata di pinggang.

- **spr_player_run**
  - Deskripsi: 6 hingga 8 frame loop. Animasi lari cepat condong ke depan 15 derajat (aerodinamis). Kaki melangkah lebar dengan dorongan kuat, lutut terangkat tinggi. Syal oranye berkibar lurus ke belakang secara dinamis mengikuti kecepatan lari. Tangan berayun sinkron dengan langkah kaki.

- **spr_player_jump_up**
  - Deskripsi: 2 hingga 3 frame. Frame 1 adalah pose antisipasi membungkuk menjejak tanah; Frame 2-3 adalah pose terangkat ke udara dengan lutut sedikit menekuk, badan tegak, syal terdorong ke bawah lalu tertinggal ke belakang, memberikan kesan momentum vertikal yang kuat.

- **spr_player_fall**
  - Deskripsi: 2 frame loop. Pose melayang jatuh di udara. Jubah dan syal terangkat ke atas karena hambatan udara, kaki menjulur bersiap menyerap benturan pendaratan, kedua tangan terentang sedikit ke samping menjaga keseimbangan.

- **spr_player_wall_slide**
  - Deskripsi: 2 frame. Pose menempel pada dinding vertikal. Satu tangan dan satu sol sepatu menekan permukaan tembok menghasilkan gesekan, badan menghadap menjauhi dinding, syal berkibar ke atas karena gravitasi luncuran ke bawah.

- **spr_player_dodge**
  - Deskripsi: 4 hingga 5 frame. Karakter melakukan dash dorongan cepat ke depan menyapu tanah (bisa berupa roll berputar rendah atau dash siluet bayangan). Tubuh memanjang membentuk garis aksi horizontal dengan efek semi-transparan (after-image cyan/putih) untuk mengomunikasikan invincibility frame (i-frame).

- **spr_player_atk_combo**
  - Deskripsi: 9 frame total (terbagi menjadi 3 tahap combo serangan):
    - Hit 1 (Frame 1-3): Tebasan horizontal cepat dari kiri ke kanan dengan rentang pedang pendek, badan sedikit melangkah maju.
    - Hit 2 (Frame 4-6): Tebasan diagonal menyilang dari atas-kanan ke bawah-kiri dengan momentum putaran pinggul.
    - Hit 3 Finisher (Frame 7-9): Tebasan melingkar 360 derajat bertenaga besar, karakter melompat kecil dan menghantamkan bilah pedang ke depan dengan jangkauan tebasan terpanjang.

- **spr_player_downsmash**
  - Deskripsi: 4 frame:
    - Frame 1: Antisipasi di udara, karakter mengangkat senjata dengan kedua tangan di atas kepala dan lutut ditarik ke dada.
    - Frame 2-3: Dive slam vertikal menukik lurus ke bawah dengan ujung senjata mengarah ke tanah, seluruh tubuh diselimuti garis kecepatan angin vertikal.
    - Frame 4: Pendaratan hantaman keras ke lantai, karakter bertumpu satu lutut dengan senjata tertancap sesaat ke tanah memicu benturan.

- **spr_player_hit**
  - Deskripsi: 2 frame. Karakter terdorong mundur dengan tubuh tersentak ke belakang, kepala mendongak, warna sprite berkedip putih/merah terang selama beberapa milidetik menandakan masuknya damage.

- **spr_player_death**
  - Deskripsi: 6 hingga 8 frame. Karakter kehilangan keseimbangan, lutut ambruk ke tanah, senjata terlepas dari genggaman dan berdenting di lantai, lalu tubuh pemain berubah menjadi abu/partikel cahaya yang perlahan memudar ke udara.

---

## 2. Musuh & Proyektil (Enemies & Projectiles)

Ukuran Canvas: 32x48 px atau 48x48 px (Proyektil: 16x16 px).
Gaya Visual: Desain kontras tinggi dengan siluet tajam agar mudah dikenali pemain dalam arena cepat.

Daftar Spritesheet Musuh:

- **spr_enemy_melee (Brawler Merah / Crimson Berserker)**
  - Tampilan Fisik: Prajurit bertubuh kekar berbalut jubah merah marun (#c0392b), mengenakan topeng besi gelap (#78281f) dengan mata bersinar kuning/oranye menyala (#f39c12). Kedua tangan dilengkapi sarung tinju besi berduri.
  - State Animasi:
    - Idle (4 frame): Berdiri tegap dengan tangan mengepal berdenyut, mata berkilat.
    - Run / Chase (6 frame): Berlari agresif menyerbu ke arah pemain dengan langkah berat yang menggetarkan debu.
    - Windup & Attack Punch (5 frame): Mengangkat tinju ke belakang mengumpulkan tenaga (telegraf visual jelas bagi pemain), lalu melontarkan pukulan tinju lurus ke depan dengan efek lintasan merah.
    - Hit (2 frame): Terpental mundur dengan kilatan putih.
    - Death (6 frame): Tubuh roboh ke depan, topeng pecah, dan hancur menjadi serpihan batu bara merah.

- **spr_enemy_ranged (Mage Ungu / Shadow Sorcerer)**
  - Tampilan Fisik: Sosok kurus berjubah panjang ungu gelap (#8e44ad) dengan tudung kepala mistis (#5b2c6f). Wajah tertutup bayangan hitam dengan visor sihir cyan bercahaya (#00f2fe). Tangan kanan menggenggam tongkat kayu kuno yang ujungnya menopang bola kristal magis.
  - State Animasi:
    - Idle (4 frame): Melayang sedikit di atas tanah dengan jubah bawah melambai perlahan.
    - Walk / Kiting (6 frame): Melayang mundur atau maju secara anggun menjaga jarak optimal dari pemain.
    - Cast & Shoot (6 frame): Mengarahkan tongkat ke depan, bola kristal menyala terang mengumpulkan partikel energi cyan, lalu menembakkan proyektil sihir meluncur horizontal.
    - Hit (2 frame): Jubah tersentak mundur dan partikel sihir berhamburan.
    - Death (6 frame): Jubah mengempis jatuh ke tanah saat tubuhnya lenyap menjadi asap ungu kehitaman.

Daftar Sprite Proyektil:

- **proj_magic_orb**
  - Deskripsi: Spritesheet 4 frame (16x16 px). Bola energi sihir cyan milik Ranged Enemy dengan inti putih terang yang berputar cepat, meninggalkan jejak ekor partikel cahaya pudar di belakangnya.

- **proj_arrow**
  - Deskripsi: Sprite statis 1 frame (16x8 px). Anak panah kayu pemburu berbulu putih di pangkal dengan ujung mata panah besi runcing berwarna perak yang melesat lurus.

- **proj_arcane_blast**
  - Deskripsi: Spritesheet 4 frame (16x16 px). Bola plasma energi magis ungu kebiruan berdaya ledak milik Arcane Staff dengan cincin sihir konsentris yang berdenyut saat melaju.

---

## 3. Environment & Level Tilesets (Tileset Grid: 32x32 px)

- **tileset_dungeon_ground**
  - Deskripsi: Set ubin tanah padat bebatuan kastil kuno. Bagian atas ubin memiliki lapisan lumut hijau/rumput gelap (#27ae60), badan tengah berupa susunan balok batu andesit abu-abu gelap (#2c3e50), dan bagian bawah memiliki tekstur bebatuan kasar menggantung. Mencakup ubin tepi kiri, kanan, sudut luar, dan sudut dalam.

- **tileset_platforms (One-Way Drop-Through)**
  - Deskripsi: Ubin platform tipis gantung berupa papan kayu kokoh beralaskan besi berlumut (#00b894) dengan ketebalan visual 12-16 px. Sisi bawah dihiasi braket besi tempa atau rantai penopang agar terlihat jelas sebagai platform yang bisa dilewati dari bawah.

- **tileset_walls_chimney**
  - Deskripsi: Ubin dinding batu bata abu-abu kebiruan gelap (#1e293b) dengan guratan alur cengkeraman horizontal pada tepian luarnya, mengindikasikan secara visual bahwa dinding ini dapat dipanjat menggunakan teknik Wall Slide dan Wall Jump.

- **tile_breakable_floor**
  - Deskripsi: Blok lantai batu persegi 32x32 px bertekstur cokelat tua rapuh (#78350f) yang dipenuhi retakan kuning keemasan (#fde047) bercahaya samar. Memberi petunjuk visual kepada pemain bahwa ubin ini dapat dihancurkan dengan Down-Smash.

- **hazard_spikes**
  - Deskripsi: Sprite jebakan lantai 32x24 px berisi deretan 3-4 mata tombak/duri besi abu-abu baja (#bdc3c7) tajam mencuat ke atas, dengan ujung duri berlumuran noda merah tua (#c0392b).

- **hazard_saw_blade**
  - Deskripsi: Sprite gergaji mesin bundar 32x32 px (atau 48x48 px) dengan poros roda tengah abu-abu baja dan 8 gigi gergaji bergerigi tajam berlumuran karat merah (#e74c3c). Dirancang untuk diputar secara rotasional via engine.

---

## 4. Background & Parallax Layers (Resolusi: 1920x1080 px atau Seamless Horizontal Wrap)

- **bg_sky_stars (Layer Jauh - Scroll Factor: 0.0x)**
  - Deskripsi: Langit malam kelam perpaduan biru malam pekat (#050510) dan ungu gelap (#120d24), dihiasi bintang-bintang kecil bersinar redup serta bulan sabit raksasa bertudung kabut tipis di kejauhan.

- **bg_mountains_far (Layer Menengah Jauh - Scroll Factor: 0.12x)**
  - Deskripsi: Siluet deretan pegunungan berbatu lancip dan bayangan menara kastil gothic kejauhan dengan tone warna abu-abu keunguan berkabut (#121324).

- **bg_ruins_mid (Layer Menengah Dekat - Scroll Factor: 0.35x)**
  - Deskripsi: Siluet pilar-pilar batu kuno yang runtuh, pepohonan mati tanpa daun, dan jembatan lengkung berlumut dengan tone abu-abu arang (#1b1e36) memberikan ilusi kedalaman ruangan.

- **bg_cavern_depths (Layer Subterranean Bawah Tanah)**
  - Deskripsi: Dinding batuan gua bawah tanah bertekstur basah, akar pohon gantung raksasa, dan stalaktit gelap pekat dengan bias cahaya pendar jamur biru kehijauan redup.

---

## 5. Ikon Item & Equipment (Ukuran: 24x24 px atau 32x32 px)

- **icon_sword_iron**
  - Deskripsi: Ikon pedang bermata baja perak lurus mengilap dengan pelindung gagang baja silang abu-abu dan pegangan berbalut kulit cokelat tua.

- **icon_sword_flame**
  - Deskripsi: Ikon pedang besar (greatsword) berbilah hitam bergerigi yang diselimuti kobaran api jingga dan kuning menyala terang dari pangkal hingga ujung bilah.

- **icon_bow_hunter**
  - Deskripsi: Ikon busur melengkung dari kayu ek cokelat berukir dengan tali busur perak berkilau kencang dan anak panah terpasang siap bidik.

- **icon_staff_arcane**
  - Deskripsi: Ikon tongkat kayu mahoni meliuk yang menopang batu permata kristal ungu berpendar magis dengan kilatan petir sihir cyan di sekelilingnya.

- **icon_armor_leather**
  - Deskripsi: Ikon rompi zirah kulit cokelat tembaga tebal berhiaskan gesper besi dan bantalan bahu berlapis.

- **icon_armor_steel**
  - Deskripsi: Ikon baju zirah lempeng baja ksatria abu-abu keperakan mengilap dengan lambang elang terukir di bagian dada.

- **icon_potion_hp**
  - Deskripsi: Ikon botol kaca bulat pendek bertutup gabus kayu, berisi cairan ramuan merah delima berkilau dengan gelembung-gelembung kecil di dalamnya.

- **icon_coin_gold**
  - Deskripsi: Ikon koin emas bundar tebal dengan pinggiran timbul dan cetakan simbol mahkota berkilau di tengahnya.

---

## 6. Visual Effects & Partikel (VFX)

- **vfx_slash_normal**
  - Deskripsi: Busur sabit tebasan setengah lingkaran berwarna gradasi putih-kuning terang dengan ketebalan meruncing tajam di kedua ujungnya.

- **vfx_slash_fire**
  - Deskripsi: Busur tebasan api lebar berwarna oranye menyala dengan lidah-lidah api dan partikel percikan bara yang tertinggal di udara.

- **vfx_downsmash_wave**
  - Deskripsi: Cincin gelombang kejut elips kuning keemasan yang membesar cepat ke samping di permukaan lantai saat hantaman Down-Smash mendarat.

- **vfx_hit_spark**
  - Deskripsi: Ledakan 4-6 garis percikan cahaya kuning/putih bintang dan partikel merah darah kecil yang memancar dari titik tumbukan serangan.

- **vfx_dust_footstep**
  - Deskripsi: 3 gumpalan asap debu putih keabuan kecil berbentuk awan mini yang mengepul dan memudar cepat saat kaki menjejak tanah.

- **vfx_item_glow**
  - Deskripsi: Lingkaran halo cahaya tembus pandang lembut dengan efek denyut pulsing (warna biru untuk senjata, ungu untuk armor, hijau untuk potion, emas untuk koin).
