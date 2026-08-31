# Audio Asset Requirements - Shadow Runner

Dokumen ini berisi spesifikasi teknis dan deskripsi detail akustik untuk setiap aset audio, mencakup Sound Effects (SFX) dan Background Music (BGM). Dirancang tanpa tabel agar mudah disalin langsung ke Google Flow / Google Docs.

Spesifikasi Teknis Umum:
- Format SFX: WAV atau OGG, 16-bit, 44.1 kHz, Mono atau Stereo.
- Format BGM: OGG atau MP3, 192-320 kbps, Stereo.
- Semua file audio harus bebas clipping dan memiliki headroom -3 dB.
- SFX harus memiliki zero-silence padding di awal (kurang dari 10ms) agar tidak ada delay saat dipicu.

---

## 1. Player & Traversal SFX

- **sfx_player_jump**
  - Durasi: 0.15 - 0.2 detik.
  - Deskripsi Akustik: Hembusan angin pendek naik (rising whoosh) yang tajam dan renyah di frekuensi mid-high (2-6 kHz). Diikuti suara hentakan ringan kain jubah dan syal berkibar sesaat. Karakter suara bersih tanpa bass berat, memberikan kesan lompatan ringan dan lincah.

- **sfx_player_land**
  - Durasi: 0.2 - 0.25 detik.
  - Deskripsi Akustik: Dentuman sol sepatu menghantam permukaan batu keras dengan transien awal yang tajam di frekuensi low-mid (200-500 Hz). Disertai kepulan debu halus berupa suara noise ringan yang cepat memudar. Intensitas suara bervariasi proporsional terhadap ketinggian jatuh.

- **sfx_player_dodge**
  - Durasi: 0.2 - 0.3 detik.
  - Deskripsi Akustik: Desingan angin cepat (fast swoosh) dengan karakter frekuensi tinggi bergeser dari kiri ke kanan (panning stereo jika memungkinkan), menyimulasikan tubuh melesat melewati udara dengan kecepatan tinggi. Ditambah lapisan tipis suara kain syal berkibar tajam.

- **sfx_player_wallslide**
  - Durasi: Loopable seamless (0.4 - 0.6 detik per cycle).
  - Deskripsi Akustik: Suara gesekan terus-menerus antara sol sepatu kulit dan permukaan batu kasar. Karakter noise berpasir (gritty friction) di frekuensi mid (800 Hz - 2 kHz) dengan volume rendah konstan. Harus seamless di titik loop tanpa popping atau klik.

- **sfx_player_walljump**
  - Durasi: 0.15 - 0.2 detik.
  - Deskripsi Akustik: Suara dorongan kuat kaki menolak dari permukaan dinding. Kombinasi dentuman tumpul pendek (thud) di bass rendah diikuti hembusan udara naik yang ringan. Lebih bertenaga dari sfx_player_jump untuk mengomunikasikan dorongan ekstra dari dinding.

- **sfx_player_downsmash_fall**
  - Durasi: 0.3 - 0.5 detik (atau bisa dipotong dinamis oleh engine saat mendarat).
  - Deskripsi Akustik: Suara angin menderu vertikal yang menguat secara progresif (crescendo whoosh). Frekuensi dominan bergeser dari mid ke low saat kecepatan jatuh meningkat, memberikan sensasi percepatan gravitasi yang intens.

- **sfx_player_downsmash_land**
  - Durasi: 0.4 - 0.5 detik.
  - Deskripsi Akustik: Ledakan dentuman berat (heavy crater boom) dengan sub-bass dalam (40-80 Hz) yang menggema sesaat. Lapisan atas berupa suara retakan batu dan serpihan kerikil bertebaran. Transien awal sangat keras dan tajam diikuti ekor reverb pendek, memberikan bobot destruktif pada serangan Down-Smash.

- **sfx_player_hit**
  - Durasi: 0.25 - 0.3 detik.
  - Deskripsi Akustik: Kombinasi suara pukulan tumpul bertenaga (blunt impact thud) di frekuensi low-mid dengan lapisan metalik denting ringan dari zirah yang bergetar. Disertai erangan vokal pendek karakter (suara pria parau bernada rendah) yang terpotong cepat.

- **sfx_player_death**
  - Durasi: 0.6 - 0.8 detik.
  - Deskripsi Akustik: Suara tubuh ambruk menghantam tanah (body drop thud) diikuti denting senjata logam terlepas berdentang di lantai batu. Kemudian hembusan energi jiwa yang memudar perlahan berupa drone reverb rendah dan partikel cahaya berdesing halus yang fade out.

---

## 2. Weapons & Combat SFX

- **sfx_slash_light**
  - Durasi: 0.15 - 0.2 detik.
  - Deskripsi Akustik: Sabetan bilah pedang tajam membelah udara dengan karakter frekuensi tinggi bersih (4-8 kHz). Suara metalik tipis berdesing cepat (sharp metallic swish) tanpa bobot bass berlebihan. Digunakan untuk combo hit pertama dan kedua.

- **sfx_slash_heavy**
  - Durasi: 0.25 - 0.3 detik.
  - Deskripsi Akustik: Tebasan pedang berat bertenaga penuh dengan desiran udara lebih dalam dan lebih lebar dari sfx_slash_light. Mengandung lapisan bass rendah distorsi ringan (sub-whoosh) yang memberikan bobot destruktif finisher combo ketiga.

- **sfx_slash_flame**
  - Durasi: 0.3 - 0.35 detik.
  - Deskripsi Akustik: Suara tebasan pedang standar yang ditindih (layered) dengan gemuruh kobaran api pendek (fire burst roar). Karakteristik api berupa suara crackling kayu terbakar dan hembusan angin panas di frekuensi mid-high. Khusus untuk senjata Flame Greatsword.

- **sfx_bow_shoot**
  - Durasi: 0.25 - 0.3 detik.
  - Deskripsi Akustik: Terdiri dari dua elemen berurutan. Pertama: suara tarikan dan lepasan tali busur tegang (bowstring twang) yang berdenting tajam di frekuensi tinggi. Kedua: hembusan angin (arrow whoosh) dari anak panah yang meluncur cepat dengan fading tail.

- **sfx_staff_cast**
  - Durasi: 0.35 - 0.45 detik.
  - Deskripsi Akustik: Dimulai dengan dengung pengisian energi sihir (arcane charge hum) berupa nada sintetis naik di frekuensi low-mid selama 0.15 detik, lalu diakhiri letupan tembakan bola plasma (plasma blast pop) berupa transien tajam di frekuensi tinggi dengan ekor reverb shimmer magis.

- **sfx_enemy_hit**
  - Durasi: 0.2 - 0.25 detik.
  - Deskripsi Akustik: Suara impact senjata mengenai daging dan tulang musuh (juicy meaty slash impact). Kombinasi sabetan tajam basah (wet slice) dengan dentuman tumpul tulang (bone thud). Terasa memuaskan dan berat untuk memberikan umpan balik yang jelas kepada pemain bahwa serangan terhubung.

- **sfx_enemy_death**
  - Durasi: 0.4 - 0.5 detik.
  - Deskripsi Akustik: Terdapat dua varian berdasarkan tipe musuh. Melee Brawler: suara jeritan serak rendah pendek diikuti bunyi bara api yang padam dan batu pecah (coal crumble). Ranged Mage: suara desisan energi sihir implosi pendek diikuti hembusan asap gaib (magical smoke dissipation) yang surut.

- **sfx_block_break**
  - Durasi: 0.3 - 0.4 detik.
  - Deskripsi Akustik: Suara retakan batu besar yang meledak pecah (heavy rubble crumble). Transien awal berupa bunyi crack keras di frekuensi mid, diikuti jatuhan kerikil dan puing bertumpuk (cascading debris rattle) yang cepat memudar.

- **sfx_saw_loop**
  - Durasi: Loopable seamless (0.5 - 0.8 detik per cycle).
  - Deskripsi Akustik: Dengungan mesin gergaji besi berputar kecepatan tinggi (high-speed circular saw whine). Nada konstan di frekuensi tinggi (3-6 kHz) dengan modulasi amplitudo halus memberikan kesan gerigi berputar. Volume akan diatur secara spasial oleh engine berdasarkan jarak pemain terhadap objek gergaji.

---

## 3. UI, Loot & Feedback SFX

- **sfx_loot_coin**
  - Durasi: 0.12 - 0.15 detik.
  - Deskripsi Akustik: Suara gemerincing koin emas logam cerah (bright metallic gold coin ping). Nada tinggi berkilau di frekuensi 4-8 kHz yang berdenting sekali dan surut cepat. Ringan, menyenangkan, dan tidak mengganggu saat terdengar berulang dalam frekuensi tinggi.

- **sfx_loot_item**
  - Durasi: 0.3 - 0.4 detik.
  - Deskripsi Akustik: Jingle harmonik pendek berupa chime sihir naik tiga nada (ascending magic chime triad). Nada kristal bening di frekuensi tinggi dengan sedikit reverb shimmer, memberikan kesan mendapatkan sesuatu yang berharga dan langka.

- **sfx_potion_drink**
  - Durasi: 0.4 - 0.5 detik.
  - Deskripsi Akustik: Suara cairan diminum dari botol kaca (liquid glugging) berupa 2-3 tegukan bergelembung pendek. Diikuti suara gabus botol ditutup kembali dan lapisan sparkle sihir penyembuhan berupa chime lembut naik (angelic heal shimmer) yang surut halus.

- **sfx_ui_click**
  - Durasi: 0.05 - 0.08 detik.
  - Deskripsi Akustik: Suara klik tombol antarmuka yang renyah, taktil, dan pendek (crisp tactile click). Satu transien tajam tanpa dengung ekor. Bersih dan tidak memiliki karakter musikal, murni mekanis.

- **sfx_ui_equip**
  - Durasi: 0.25 - 0.3 detik.
  - Deskripsi Akustik: Kombinasi suara gesper tali kulit dikencangkan (leather strap buckle) dan denting kait logam terkunci (metal clasp lock). Memberikan kesan fisik memasang perlengkapan ke tubuh karakter.

- **sfx_game_over_sting**
  - Durasi: 1.5 - 2.0 detik.
  - Deskripsi Akustik: Nada minor atmosferik suram berupa 2-3 nada piano rendah yang bergetar dengan reverb panjang, ditindih drone cello tunggal yang memudar perlahan. Bernuansa final dan melankolis tanpa terlalu dramatis.

- **sfx_highscore_cheer**
  - Durasi: 1.2 - 1.5 detik.
  - Deskripsi Akustik: Fanfare kemenangan singkat berupa akor mayor cerah yang meningkat (ascending bright major chord). Dimainkan dengan brass sintetis atau chiptune yang menggema, diakhiri dentingan lonceng katedral tunggal (cathedral bell ring) dengan reverb panjang yang memudar.

---

## 4. Background Music (BGM)

- **bgm_main_menu**
  - Durasi: 60 - 90 detik (seamless loop).
  - Tempo: Lambat, 70-80 BPM.
  - Suasana: Misterius, tenang, dan atmosferik dengan nuansa fantasi abad pertengahan gelap.
  - Instrumentasi: Petikan gitar akustik/klasik fingerstyle sebagai melodi utama, dilapisi ambient pad synthesizer bernada rendah yang mengalun, sesekali tiupan seruling melankolis di register tinggi, dan ketukan perkusi tribal sangat halus di latar belakang.
  - Referensi Gaya: Hollow Knight (Dirtmouth Theme), Dead Cells (Main Menu Ambience), Ori and the Blind Forest (melodi akustik tenang).
  - Catatan Loop: Titik loop harus mulus tanpa jeda atau perubahan dinamis mendadak.

- **bgm_catacombs_action**
  - Durasi: 90 - 120 detik (seamless loop).
  - Tempo: Cepat dan agresif, 140-160 BPM.
  - Suasana: Adrenalin tinggi, gelap, tegang, dan memompa semangat pertarungan.
  - Instrumentasi: Synth bass tebal dan berdistorsi sebagai fondasi ritmis, drum pattern gabungan taiko Jepang dan trap hi-hat cepat, cello staccato agresif yang mengiris di latar belakang, sesekali terdengar teriakan paduan suara (choir stab) pendek bernuansa epik, dan lapisan noise industrial yang terkontrol.
  - Referensi Gaya: Dead Cells (Prisoners Quarters, Promenade of the Condemned), Hades (combat themes), Celeste (intense chapters).
  - Catatan Loop: Transisi loop harus seamless di titik ketukan pertama bar dengan energi yang tidak pernah turun.

- **bgm_game_over**
  - Durasi: 15 - 25 detik (loop halus atau single play dengan fade out).
  - Tempo: Sangat lambat, 50-60 BPM atau rubato (tanpa tempo tetap).
  - Suasana: Hening, reflektif, melankolis, dan sedikit misterius.
  - Instrumentasi: Drone ambient rendah berdenging halus sebagai alas, 3-5 nada piano solo yang jatuh perlahan dengan reverb panjang, dan hembusan angin semu (wind noise pad) yang mengisi kekosongan.
  - Referensi Gaya: Dead Cells (Death Screen Ambience), Dark Souls (You Died aftermath), Hollow Knight (death zone ambient).
  - Catatan Loop: Jika di-loop, harus crossfade mulus tanpa terasa berulang secara jelas.
