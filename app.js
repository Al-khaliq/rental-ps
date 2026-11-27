/* =============================================
   Rental PS – app.js
   Secure, XSS-safe, localStorage cart & PlayStation visuals
   ============================================= */
'use strict';

/* ---- WHATSAPP CONFIG ---- */
const WA_NUMBER = '6281234567890'; // Ganti dengan nomor WA aktif

/* ---- FALLBACK SVG DATA-URI (Zero broken image) ---- */
const FALLBACK_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 160'%3E%3Crect width='240' height='160' rx='16' fill='%230F172A'/%3E%3Ctext x='120' y='88' text-anchor='middle' fill='%2338BDF8' font-family='sans-serif' font-size='20' font-weight='bold'%3EPlayStation%3C/text%3E%3C/svg%3E";

/* ---- DATA PAKET & UNIT ---- */
const PAKET_DATA = [
  {
    id: 'p1',
    nama: 'PS4 Slim – 1 Hari',
    kategori: 'ps4',
    emoji: '🕹️',
    gambar: 'assets/ps4-slim.svg',
    alt: 'Konsol PlayStation 4 Slim hitam dengan stik DualShock 4',
    harga: 75000,
    deskripsi: 'PS4 Slim + 1 stik DualShock 4 + durasi 24 jam',
    inklusif: ['1 Stik DualShock 4', 'Akses Game Library', 'Kabel HDMI'],
    tersedia: true,
    stok: 15,
    featured: false,
  },
  {
    id: 'p2',
    nama: 'PS4 Pro – 1 Hari',
    kategori: 'ps4',
    emoji: '🎮',
    gambar: 'assets/ps4-pro.svg',
    alt: 'Konsol PlayStation 4 Pro 1TB 4K HDR dengan stik DualShock 4',
    harga: 100000,
    deskripsi: 'PS4 Pro 1TB + 1 stik DualShock 4 + resolusi 4K HDR',
    inklusif: ['1 Stik DualShock 4', 'Akses Game Library', '4K HDR'],
    tersedia: true,
    stok: 10,
    featured: false,
  },
  {
    id: 'p3',
    nama: 'PS5 Disc – 1 Hari',
    kategori: 'ps5',
    emoji: '⚡',
    gambar: 'assets/ps5-disc.svg',
    alt: 'Konsol PlayStation 5 Disc Edition putih-hitam dengan stik DualSense',
    harga: 150000,
    deskripsi: 'PS5 Disc Edition + 1 DualSense + loading super cepat',
    inklusif: ['1 Stik DualSense', 'Akses Game Library', 'Ray Tracing'],
    tersedia: true,
    stok: 8,
    featured: true,
  },
  {
    id: 'p4',
    nama: 'PS4 Weekend (Sabtu–Minggu)',
    kategori: 'weekend',
    emoji: '📅',
    gambar: 'assets/ps4-slim.svg',
    alt: 'Paket Weekend PlayStation 4 Slim beserta stik DualShock 4',
    harga: 180000,
    deskripsi: 'PS4 Slim selama 2 hari (Sabtu–Minggu). Hemat 20%!',
    inklusif: ['1 Stik DualShock 4', 'Akses Game Library', 'Hemat 20%'],
    tersedia: true,
    stok: 10,
    featured: false,
  },
  {
    id: 'p5',
    nama: 'PS5 Weekend (Sabtu–Minggu)',
    kategori: 'weekend',
    emoji: '🌟',
    gambar: 'assets/ps5-disc.svg',
    alt: 'Paket Weekend PlayStation 5 Disc Edition beserta stik DualSense',
    harga: 260000,
    deskripsi: 'PS5 Disc selama 2 hari (Sabtu–Minggu). Hemat 30%!',
    inklusif: ['1 Stik DualSense', 'Akses Game Library', 'Hemat 30%'],
    tersedia: true,
    stok: 6,
    featured: true,
  },
  {
    id: 'p6',
    nama: '+Stik Ekstra (DualShock 4)',
    kategori: 'stik',
    emoji: '🕹️',
    gambar: 'assets/dualshock4.svg',
    alt: 'Kontroler PlayStation DualShock 4 hitam original',
    harga: 20000,
    deskripsi: 'Tambah 1 stik DualShock 4 original per hari',
    inklusif: ['Cocok untuk mabar', 'Original Sony', 'Baterai penuh'],
    tersedia: true,
    stok: 20,
    featured: false,
  },
  {
    id: 'p7',
    nama: '+Stik Ekstra (DualSense)',
    kategori: 'stik',
    emoji: '🎯',
    gambar: 'assets/dualsense.svg',
    alt: 'Kontroler PlayStation 5 DualSense putih-hitam original',
    harga: 35000,
    deskripsi: 'Tambah 1 stik DualSense PS5 original per hari',
    inklusif: ['Haptic Feedback', 'Adaptive Triggers', 'Baterai penuh'],
    tersedia: true,
    stok: 12,
    featured: false,
  },
  {
    id: 'p8',
    nama: 'PS4 Slim – 3 Hari',
    kategori: 'ps4',
    emoji: '📦',
    gambar: 'assets/ps4-slim.svg',
    alt: 'Paket 3 Hari PlayStation 4 Slim dengan stik DualShock 4',
    harga: 195000,
    deskripsi: 'PS4 Slim + 1 stik selama 3 hari. Hemat 13%!',
    inklusif: ['1 Stik DualShock 4', 'Akses Game Library', 'Hemat 13%'],
    tersedia: false,
    stok: 0,
    featured: false,
  },
];

/* ---- CART (LocalStorage) ---- */
const CART_KEY = 'rentalps_cart_v1';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(cartData) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cartData)); } catch {}
}

let cart = loadCart();

function getCartQty() {
  return cart.reduce((s, i) => s + (i.qty || 0), 0);
}

function getCartTotal() {
  return cart.reduce((s, i) => {
    const p = PAKET_DATA.find(x => x.id === i.id);
    return s + (p ? p.harga * (i.qty || 1) : 0);
  }, 0);
}

function addToCart(id) {
  const paket = PAKET_DATA.find(p => p.id === id);
  if (!paket || !paket.tersedia) return;
  const existing = cart.find(i => i.id === id);
  if (existing) {
    if (existing.qty >= paket.stok) {
      showToast('Stok habis untuk item ini!', 'warning');
      return;
    }
    existing.qty += 1;
  } else {
    cart.push({ id, qty: 1 });
  }
  saveCart(cart);
  updateCartUI();
  showToast(`"${paket.nama}" ditambahkan ke keranjang!`, 'success');
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart(cart);
  updateCartUI();
  renderCartItems();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  const paket = PAKET_DATA.find(p => p.id === id);
  if (!paket) return;
  const next = item.qty + delta;
  if (next < 1) { removeFromCart(id); return; }
  if (next > paket.stok) { showToast('Melebihi stok yang tersedia!', 'warning'); return; }
  item.qty = next;
  saveCart(cart);
  updateCartUI();
  renderCartItems();
}

function clearCart() {
  cart = [];
  saveCart(cart);
  updateCartUI();
  renderCartItems();
}

/* ---- TOAST ---- */
function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = { success: '✅', info: 'ℹ️', error: '❌', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = document.createElement('span');
  icon.textContent = icons[type] || 'ℹ️';
  const text = document.createElement('span');
  text.textContent = msg;
  toast.appendChild(icon);
  toast.appendChild(text);
  container.appendChild(toast);
  const remove = () => {
    toast.classList.add('hiding');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  };
  setTimeout(remove, 3500);
}

/* ---- FORMAT CURRENCY ---- */
function formatRp(n) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

/* ---- HELPER: CREATE PRODUCT IMAGE BOX ---- */
function createProductImgBox(p, showStatus = false) {
  const imgBox = document.createElement('div');
  imgBox.className = 'unit-img-box';

  const img = document.createElement('img');
  img.src = p.gambar;
  img.alt = p.alt || p.nama;
  img.className = 'unit-img';
  img.loading = 'lazy';
  img.addEventListener('error', () => {
    if (img.src !== FALLBACK_IMG) img.src = FALLBACK_IMG;
  });
  imgBox.appendChild(img);

  if (p.featured) {
    const starBadge = document.createElement('span');
    starBadge.className = 'badge-terlaris';
    starBadge.textContent = '⭐ Terlaris';
    imgBox.appendChild(starBadge);
  }

  if (showStatus) {
    let statusClass, statusText;
    if (!p.tersedia || p.stok === 0) { statusClass = 'status-unavailable'; statusText = 'Stok Habis'; }
    else if (p.stok <= 3)            { statusClass = 'status-limited';     statusText = `Sisa ${p.stok}`; }
    else                              { statusClass = 'status-available';   statusText = 'Tersedia'; }

    const statusBadge = document.createElement('div');
    statusBadge.className = `status-badge ${statusClass}`;
    statusBadge.textContent = statusText;
    imgBox.appendChild(statusBadge);
  }

  return imgBox;
}

/* ---- RENDER PAKET SECTION ---- */
function renderPaket() {
  const grid = document.getElementById('paketGrid');
  if (!grid) return;
  grid.replaceChildren();

  PAKET_DATA.forEach((p, idx) => {
    const card = document.createElement('div');
    card.className = `paket-card${p.featured ? ' featured' : ''}`;
    card.style.animationDelay = `${idx * 0.06}s`;

    card.appendChild(createProductImgBox(p, false));

    const body = document.createElement('div');
    body.className = 'paket-body';

    const nameEl = document.createElement('div');
    nameEl.className = 'font-bold text-sm leading-tight text-white';
    nameEl.textContent = p.nama;

    const hargaEl = document.createElement('div');
    hargaEl.className = 'paket-price';
    hargaEl.textContent = formatRp(p.harga);

    const descEl = document.createElement('div');
    descEl.className = 'text-xs leading-relaxed text-slate-400';
    descEl.textContent = p.deskripsi;

    const inklusifEl = document.createElement('ul');
    inklusifEl.className = 'space-y-1 mt-1 mb-3';
    p.inklusif.forEach(item => {
      const li = document.createElement('li');
      li.className = 'text-xs text-slate-300 flex items-center gap-1.5';
      const check = document.createElement('span');
      check.className = 'text-sky-400 font-bold';
      check.textContent = '✓';
      const t = document.createElement('span');
      t.textContent = item;
      li.appendChild(check);
      li.appendChild(t);
      inklusifEl.appendChild(li);
    });

    const btn = document.createElement('button');
    if (p.tersedia) {
      btn.className = 'btn-primary w-full py-2.5 rounded-xl text-sm font-semibold mt-auto';
      btn.textContent = '+ Tambah ke Keranjang';
      btn.addEventListener('click', () => addToCart(p.id));
    } else {
      btn.className = 'w-full py-2.5 rounded-xl text-sm font-semibold mt-auto bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed';
      btn.textContent = 'Stok Habis';
      btn.disabled = true;
    }

    body.appendChild(nameEl);
    body.appendChild(hargaEl);
    body.appendChild(descEl);
    body.appendChild(inklusifEl);
    body.appendChild(btn);
    card.appendChild(body);
    grid.appendChild(card);
  });
}

/* ---- RENDER KATALOG ---- */
function renderCatalog(filterKat = 'semua', query = '') {
  const grid = document.getElementById('catalogGrid');
  const empty = document.getElementById('emptyState');
  if (!grid || !empty) return;
  grid.replaceChildren();

  const q = query.trim().toLowerCase();
  const filtered = PAKET_DATA.filter(p => {
    const matchKat = filterKat === 'semua' || p.kategori === filterKat;
    const matchQ   = !q || p.nama.toLowerCase().includes(q) || p.deskripsi.toLowerCase().includes(q);
    return matchKat && matchQ;
  });

  if (filtered.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  filtered.forEach((p, idx) => {
    const card = document.createElement('div');
    card.className = `unit-card${!p.tersedia ? ' unavailable' : ''}`;
    card.style.animationDelay = `${idx * 0.06}s`;

    card.appendChild(createProductImgBox(p, true));

    const body = document.createElement('div');
    body.className = 'unit-body';

    const nameEl = document.createElement('div');
    nameEl.className = 'font-bold text-sm leading-tight text-white';
    nameEl.textContent = p.nama;

    const descEl = document.createElement('div');
    descEl.className = 'text-xs text-slate-400 leading-relaxed flex-1';
    descEl.textContent = p.deskripsi;

    const priceRow = document.createElement('div');
    priceRow.className = 'flex items-end justify-between pt-3 mt-auto border-t border-slate-800';

    const priceEl = document.createElement('div');
    priceEl.className = 'unit-price';
    priceEl.textContent = formatRp(p.harga);

    const perEl = document.createElement('div');
    perEl.className = 'text-xs text-slate-400';
    perEl.textContent = p.kategori === 'weekend' ? '/paket' : '/hari';

    priceRow.appendChild(priceEl);
    priceRow.appendChild(perEl);

    const btn = document.createElement('button');
    if (p.tersedia && p.stok > 0) {
      btn.className = 'btn-primary w-full py-2.5 rounded-xl text-sm font-semibold mt-2';
      btn.textContent = '+ Tambah ke Keranjang';
      btn.addEventListener('click', () => addToCart(p.id));
    } else {
      btn.className = 'w-full py-2.5 rounded-xl text-sm font-semibold mt-2 bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed';
      btn.textContent = 'Stok Habis';
      btn.disabled = true;
    }

    body.appendChild(nameEl);
    body.appendChild(descEl);
    body.appendChild(priceRow);
    body.appendChild(btn);
    card.appendChild(body);
    grid.appendChild(card);
  });
}

/* ---- RENDER CART ITEMS ---- */
function renderCartItems() {
  const container = document.getElementById('cartItems');
  const emptyEl   = document.getElementById('cartEmpty');
  const footerEl  = document.getElementById('cartFooter');
  const totalEl   = document.getElementById('cartTotal');
  if (!container) return;

  container.replaceChildren();

  if (cart.length === 0) {
    container.classList.add('hidden');
    emptyEl.classList.remove('hidden');
    footerEl.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');
  emptyEl.classList.add('hidden');
  footerEl.classList.remove('hidden');

  cart.forEach(item => {
    const paket = PAKET_DATA.find(p => p.id === item.id);
    if (!paket) return;

    const el = document.createElement('div');
    el.className = 'cart-item';

    const headerRow = document.createElement('div');
    headerRow.className = 'flex items-start justify-between gap-3';

    const info = document.createElement('div');
    info.className = 'flex items-center gap-3 flex-1 min-w-0';

    const thumb = document.createElement('img');
    thumb.src = paket.gambar;
    thumb.alt = paket.nama;
    thumb.className = 'w-12 h-9 object-contain rounded-lg bg-slate-900 p-1 flex-shrink-0';
    thumb.addEventListener('error', () => {
      if (thumb.src !== FALLBACK_IMG) thumb.src = FALLBACK_IMG;
    });

    const nameBlock = document.createElement('div');
    nameBlock.className = 'min-w-0';

    const nameEl = document.createElement('div');
    nameEl.className = 'font-semibold text-sm text-white leading-tight truncate';
    nameEl.textContent = paket.nama;

    const priceEl = document.createElement('div');
    priceEl.className = 'text-slate-400 text-xs mt-0.5';
    priceEl.textContent = `${formatRp(paket.harga)} × ${item.qty}`;

    nameBlock.appendChild(nameEl);
    nameBlock.appendChild(priceEl);
    info.appendChild(thumb);
    info.appendChild(nameBlock);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'text-slate-400 hover:text-red-400 transition-colors p-1 rounded flex-shrink-0';
    removeBtn.setAttribute('aria-label', 'Hapus item');
    const svgRemove = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgRemove.setAttribute('class', 'w-4 h-4');
    svgRemove.setAttribute('fill', 'none');
    svgRemove.setAttribute('viewBox', '0 0 24 24');
    svgRemove.setAttribute('stroke', 'currentColor');
    const pathR = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathR.setAttribute('stroke-linecap', 'round');
    pathR.setAttribute('stroke-linejoin', 'round');
    pathR.setAttribute('stroke-width', '2');
    pathR.setAttribute('d', 'M6 18L18 6M6 6l12 12');
    svgRemove.appendChild(pathR);
    removeBtn.appendChild(svgRemove);
    removeBtn.addEventListener('click', () => removeFromCart(item.id));

    headerRow.appendChild(info);
    headerRow.appendChild(removeBtn);

    const footRow = document.createElement('div');
    footRow.className = 'flex items-center justify-between';

    const qtyCtrl = document.createElement('div');
    qtyCtrl.className = 'flex items-center gap-2';

    const minusBtn = document.createElement('button');
    minusBtn.className = 'qty-btn';
    minusBtn.textContent = '−';
    minusBtn.addEventListener('click', () => changeQty(item.id, -1));

    const qtyDisplay = document.createElement('span');
    qtyDisplay.className = 'text-sm font-bold w-6 text-center text-white';
    qtyDisplay.textContent = item.qty;

    const plusBtn = document.createElement('button');
    plusBtn.className = 'qty-btn';
    plusBtn.textContent = '+';
    if (item.qty >= paket.stok) plusBtn.disabled = true;
    plusBtn.addEventListener('click', () => changeQty(item.id, 1));

    qtyCtrl.appendChild(minusBtn);
    qtyCtrl.appendChild(qtyDisplay);
    qtyCtrl.appendChild(plusBtn);

    const subtotal = document.createElement('div');
    subtotal.className = 'text-sky-400 font-black text-sm';
    subtotal.textContent = formatRp(paket.harga * item.qty);

    footRow.appendChild(qtyCtrl);
    footRow.appendChild(subtotal);

    el.appendChild(headerRow);
    el.appendChild(footRow);
    container.appendChild(el);
  });

  if (totalEl) totalEl.textContent = formatRp(getCartTotal());
}

/* ---- UPDATE CART UI ---- */
function updateCartUI() {
  const qty   = getCartQty();
  const badge = document.getElementById('cartBadge');
  const fab   = document.getElementById('cartFab');
  if (badge) badge.textContent = qty > 0 ? (qty > 99 ? '99+' : qty) : '';
  if (fab)   fab.classList.toggle('hidden', qty === 0);
}

/* ---- MODAL HELPERS ---- */
function openModal(id)  { document.getElementById(id)?.classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); document.body.style.overflow = ''; }

/* ---- NAVBAR SCROLL ---- */
function handleScroll() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  nav.classList.toggle('navbar-scrolled', window.scrollY > 40);
}

/* ---- FILTER STATE & SYNC ---- */
let activeFilter = 'semua';
let searchQuery  = '';

function applyFilter(kat) {
  activeFilter = kat;
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === kat);
  });
  const heroSelect = document.getElementById('heroConsoleSelect');
  if (heroSelect && heroSelect.value !== kat) heroSelect.value = kat;
  renderCatalog(activeFilter, searchQuery);
}

function syncSearchInputs(val, sourceId) {
  searchQuery = val;
  const heroSearch = document.getElementById('heroSearchInput');
  const catSearch  = document.getElementById('searchInput');
  if (sourceId !== 'heroSearchInput' && heroSearch) heroSearch.value = val;
  if (sourceId !== 'searchInput' && catSearch) catSearch.value = val;
  renderCatalog(activeFilter, searchQuery);
}

/* ---- BOOKING FORM VALIDATION ---- */
function sanitizeText(str) {
  return str.replace(/[<>"'`]/g, '').trim();
}

function validateBooking() {
  const nama     = document.getElementById('namaInput');
  const jadwal   = document.getElementById('jadwalInput');
  const namaErr  = document.getElementById('namaError');
  const jadwalErr = document.getElementById('jadwalError');
  let valid = true;

  [namaErr, jadwalErr].forEach(e => { e.textContent = ''; e.classList.add('hidden'); });
  [nama, jadwal].forEach(el => el.classList.remove('border-danger'));

  const namaVal = sanitizeText(nama.value);
  if (!namaVal || namaVal.length < 2) {
    namaErr.textContent = 'Nama minimal 2 karakter.';
    namaErr.classList.remove('hidden');
    nama.classList.add('border-danger');
    valid = false;
  }

  const jadwalVal = jadwal.value;
  if (!jadwalVal) {
    jadwalErr.textContent = 'Jadwal sewa wajib diisi.';
    jadwalErr.classList.remove('hidden');
    jadwal.classList.add('border-danger');
    valid = false;
  } else {
    const selectedDate = new Date(jadwalVal);
    if (selectedDate < new Date()) {
      jadwalErr.textContent = 'Jadwal tidak boleh di masa lalu.';
      jadwalErr.classList.remove('hidden');
      jadwal.classList.add('border-danger');
      valid = false;
    }
  }
  return valid;
}

/* ---- BUILD WHATSAPP MESSAGE ---- */
function buildWAMessage(nama, jadwal, catatan) {
  const lines = [
    '🎮 *PEMESANAN RENTAL PS*',
    '',
    `👤 *Nama:* ${nama}`,
    `📅 *Jadwal:* ${jadwal}`,
    '',
    '*📦 Rincian Pesanan:*',
  ];

  cart.forEach(item => {
    const p = PAKET_DATA.find(x => x.id === item.id);
    if (p) lines.push(`${p.emoji} ${p.nama} ×${item.qty} = ${formatRp(p.harga * item.qty)}`);
  });

  lines.push('');
  lines.push(`💰 *Total Estimasi: ${formatRp(getCartTotal())}*`);

  if (catatan.trim()) {
    lines.push('');
    lines.push(`📝 *Catatan:* ${catatan.trim()}`);
  }

  lines.push('');
  lines.push('Mohon konfirmasi ketersediaan unit. Terima kasih! 🙏');

  return lines.join('\n');
}

/* ---- CHECKOUT ---- */
function handleCheckout() {
  if (cart.length === 0) {
    showToast('Keranjang kosong. Tambahkan unit terlebih dahulu.', 'warning');
    return;
  }
  closeModal('cartModal');
  openModal('bookingModal');
}

function handleBookingSubmit(e) {
  e.preventDefault();
  if (!validateBooking()) return;

  const nama      = sanitizeText(document.getElementById('namaInput').value);
  const jadwalRaw = document.getElementById('jadwalInput').value;
  const catatan   = sanitizeText(document.getElementById('catatanInput').value);

  const jadwalDate = new Date(jadwalRaw);
  const jadwalFmt  = jadwalDate.toLocaleString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const msg = buildWAMessage(nama, jadwalFmt, catatan);
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

  const link = document.createElement('a');
  link.href   = url;
  link.target = '_blank';
  link.rel    = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  closeModal('bookingModal');
  clearCart();
  renderCartItems();
  document.getElementById('bookingForm').reset();
  showToast('Pesanan dikirim ke WhatsApp! Tunggu konfirmasi admin.', 'success');
}

/* ---- MOBILE MENU ---- */
function initMobileMenu() {
  const btn       = document.getElementById('menuBtn');
  const menu      = document.getElementById('mobileMenu');
  const iconMenu  = document.getElementById('iconMenu');
  const iconClose = document.getElementById('iconClose');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = !menu.classList.contains('hidden');
    menu.classList.toggle('hidden', isOpen);
    if (iconMenu)  iconMenu.classList.toggle('hidden', !isOpen);
    if (iconClose) iconClose.classList.toggle('hidden', isOpen);
    btn.setAttribute('aria-expanded', String(!isOpen));
  });

  document.querySelectorAll('.mobile-nav-link').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.add('hidden');
      if (iconMenu)  iconMenu.classList.remove('hidden');
      if (iconClose) iconClose.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---- MODAL BACKDROPS & ESCAPE ---- */
function initModalBackdrops() {
  ['cartModal', 'bookingModal'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', e => {
      if (e.target === el) closeModal(id);
    });
  });
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    ['cartModal', 'bookingModal'].forEach(id => closeModal(id));
  }
});

/* ---- INIT ---- */
function init() {
  renderPaket();
  renderCatalog();
  updateCartUI();

  window.addEventListener('scroll', handleScroll, { passive: true });

  document.getElementById('filterBtns')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-filter]');
    if (btn) applyFilter(btn.dataset.filter);
  });

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => syncSearchInputs(searchInput.value, 'searchInput'), 200);
    });
  }

  /* Hero Overlapping Search & Quick Filter Bar */
  const heroSearchInput   = document.getElementById('heroSearchInput');
  const heroConsoleSelect = document.getElementById('heroConsoleSelect');
  const heroSearchBtn     = document.getElementById('heroSearchBtn');

  if (heroSearchInput) {
    let heroDebounce;
    heroSearchInput.addEventListener('input', () => {
      clearTimeout(heroDebounce);
      heroDebounce = setTimeout(() => syncSearchInputs(heroSearchInput.value, 'heroSearchInput'), 200);
    });
    heroSearchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        syncSearchInputs(heroSearchInput.value, 'heroSearchInput');
        document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  heroConsoleSelect?.addEventListener('change', () => {
    applyFilter(heroConsoleSelect.value);
  });

  heroSearchBtn?.addEventListener('click', () => {
    if (heroSearchInput) syncSearchInputs(heroSearchInput.value, 'heroSearchInput');
    if (heroConsoleSelect) applyFilter(heroConsoleSelect.value);
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  });

  document.querySelectorAll('[data-quick-filter]').forEach(pill => {
    pill.addEventListener('click', () => {
      const kat = pill.getAttribute('data-quick-filter') || 'semua';
      applyFilter(kat);
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  document.getElementById('cartBtn')?.addEventListener('click', () => {
    renderCartItems();
    openModal('cartModal');
  });
  document.getElementById('closeCartBtn')?.addEventListener('click', () => closeModal('cartModal'));

  document.getElementById('checkoutBtn')?.addEventListener('click', handleCheckout);
  document.getElementById('clearCartBtn')?.addEventListener('click', () => {
    clearCart();
    renderCartItems();
    showToast('Keranjang dikosongkan.', 'info');
  });

  document.getElementById('closeBookingBtn')?.addEventListener('click', () => closeModal('bookingModal'));
  document.getElementById('bookingForm')?.addEventListener('submit', handleBookingSubmit);

  const jadwalInput = document.getElementById('jadwalInput');
  if (jadwalInput) {
    const pad = n => String(n).padStart(2, '0');
    const now = new Date();
    jadwalInput.min = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  initMobileMenu();
  initModalBackdrops();
}

document.addEventListener('DOMContentLoaded', init);
