/* =============================================
   Rental PS – app.js
   Secure, XSS-safe, localStorage cart
   ============================================= */
'use strict';

/* ---- WHATSAPP CONFIG ---- */
const WA_NUMBER = '6281234567890'; // Ganti dengan nomor WA aktif

/* ---- DATA PAKET ---- */
const PAKET_DATA = [
  {
    id: 'p1',
    nama: 'PS4 Slim – 1 Hari',
    kategori: 'ps4',
    emoji: '🕹️',
    harga: 75000,
    deskripsi: 'PS4 Slim + 1 stik + 1 hari (maks. 24 jam)',
    inklusif: ['1 Stik DualShock', 'Akses Game Library', 'Kabel HDMI'],
    tersedia: true,
    stok: 15,
    featured: false,
  },
  {
    id: 'p2',
    nama: 'PS4 Pro – 1 Hari',
    kategori: 'ps4',
    emoji: '🎮',
    harga: 100000,
    deskripsi: 'PS4 Pro 1TB + 1 stik + resolusi 4K HDR',
    inklusif: ['1 Stik DualShock', 'Akses Game Library', '4K HDR'],
    tersedia: true,
    stok: 10,
    featured: false,
  },
  {
    id: 'p3',
    nama: 'PS5 Disc – 1 Hari',
    kategori: 'ps5',
    emoji: '⚡',
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
    harga: 180000,
    deskripsi: 'PS4 Slim selama 2 hari (Sabtu–Minggu). Hemat 20%!',
    inklusif: ['1 Stik DualShock', 'Akses Game Library', 'Hemat 20%'],
    tersedia: true,
    stok: 10,
    featured: false,
  },
  {
    id: 'p5',
    nama: 'PS5 Weekend (Sabtu–Minggu)',
    kategori: 'weekend',
    emoji: '🌟',
    harga: 260000,
    deskripsi: 'PS5 selama 2 hari (Sabtu–Minggu). Hemat 30%!',
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
    harga: 195000,
    deskripsi: 'PS4 Slim + 1 stik selama 3 hari. Hemat 13%!',
    inklusif: ['1 Stik DualShock', 'Akses Game Library', 'Hemat 13%'],
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

function saveCart(cart) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {}
}

let cart = loadCart();

function getCartQty() {
  return cart.reduce((s, i) => s + (i.qty || 0), 0);
}

function getCartTotal() {
  return cart.reduce((s, i) => {
    const p = PAKET_DATA.find(p => p.id === i.id);
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
  const icons = { success:'✅', info:'ℹ️', error:'❌', warning:'⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = document.createElement('span');
  icon.textContent = icons[type] || 'ℹ️';
  const text = document.createElement('span');
  text.textContent = msg; // textContent – XSS safe
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

/* ---- SANITIZE (textContent guard) ---- */
function safe(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>"'`&]/g, c => ({'<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;','`':'&#x60;','&':'&amp;'}[c]));
}

/* ---- RENDER PAKET SECTION ---- */
function renderPaket() {
  const grid = document.getElementById('paketGrid');
  if (!grid) return;
  grid.innerHTML = '';
  PAKET_DATA.forEach((p, idx) => {
    const card = document.createElement('div');
    card.className = `paket-card${p.featured ? ' featured' : ''}`;
    card.style.animationDelay = `${idx * 0.06}s`;

    if (p.featured) {
      const badge = document.createElement('div');
      badge.className = 'absolute top-3 right-3 bg-electric text-white text-xs font-bold px-2.5 py-0.5 rounded-full';
      badge.textContent = '⭐ Terlaris';
      card.appendChild(badge);
    }

    const emojiEl = document.createElement('div');
    emojiEl.className = 'text-3xl';
    emojiEl.textContent = p.emoji;

    const nameEl = document.createElement('div');
    nameEl.className = 'font-bold text-sm leading-tight';
    nameEl.textContent = p.nama;

    const hargaEl = document.createElement('div');
    hargaEl.className = 'text-electric font-black text-xl';
    hargaEl.textContent = formatRp(p.harga);

    const descEl = document.createElement('div');
    descEl.className = 'text-muted text-xs leading-relaxed';
    descEl.textContent = p.deskripsi;

    const inklusifEl = document.createElement('ul');
    inklusifEl.className = 'space-y-1 mt-auto';
    p.inklusif.forEach(item => {
      const li = document.createElement('li');
      li.className = 'text-xs text-muted flex items-center gap-1.5';
      const check = document.createElement('span');
      check.className = 'text-cyan';
      check.textContent = '✓';
      const t = document.createElement('span');
      t.textContent = item;
      li.appendChild(check);
      li.appendChild(t);
      inklusifEl.appendChild(li);
    });

    const btn = document.createElement('button');
    btn.className = p.tersedia
      ? 'btn-primary w-full py-2.5 rounded-lg text-sm font-semibold mt-2'
      : 'w-full py-2.5 rounded-lg text-sm font-semibold mt-2 bg-mid text-muted cursor-not-allowed';
    btn.textContent = p.tersedia ? '+ Tambah ke Keranjang' : 'Stok Habis';
    btn.disabled = !p.tersedia;
    if (p.tersedia) btn.addEventListener('click', () => addToCart(p.id));

    card.appendChild(emojiEl);
    card.appendChild(nameEl);
    card.appendChild(hargaEl);
    card.appendChild(descEl);
    card.appendChild(inklusifEl);
    card.appendChild(btn);
    grid.appendChild(card);
  });
}

/* ---- RENDER KATALOG ---- */
function renderCatalog(filterKat = 'semua', query = '') {
  const grid = document.getElementById('catalogGrid');
  const empty = document.getElementById('emptyState');
  if (!grid || !empty) return;
  grid.innerHTML = '';

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
    card.style.animationDelay = `${idx * 0.07}s`;

    // Image area
    const imgBox = document.createElement('div');
    imgBox.className = 'unit-emoji-box';
    const emojiSpan = document.createElement('span');
    emojiSpan.textContent = p.emoji;
    if (p.featured) {
      const starBadge = document.createElement('span');
      starBadge.className = 'absolute top-3 left-3 bg-electric text-white text-xs font-bold px-2 py-0.5 rounded-full';
      starBadge.textContent = '⭐ Terlaris';
      imgBox.appendChild(starBadge);
    }
    imgBox.appendChild(emojiSpan);

    // Status badge
    let statusClass, statusText;
    if (!p.tersedia || p.stok === 0) {
      statusClass = 'status-unavailable'; statusText = 'Stok Habis';
    } else if (p.stok <= 3) {
      statusClass = 'status-limited'; statusText = `Sisa ${p.stok} Unit`;
    } else {
      statusClass = 'status-available'; statusText = 'Tersedia';
    }
    const statusBadge = document.createElement('div');
    statusBadge.className = `absolute top-3 right-3 ${statusClass} text-xs font-semibold px-2.5 py-1 rounded-full`;
    statusBadge.textContent = statusText;
    imgBox.style.position = 'relative';
    imgBox.appendChild(statusBadge);

    card.appendChild(imgBox);

    // Body
    const body = document.createElement('div');
    body.className = 'p-4 flex flex-col gap-3 flex-1';

    const nameEl = document.createElement('div');
    nameEl.className = 'font-bold text-sm leading-tight';
    nameEl.textContent = p.nama;

    const descEl = document.createElement('div');
    descEl.className = 'text-muted text-xs leading-relaxed';
    descEl.textContent = p.deskripsi;

    const hargaRow = document.createElement('div');
    hargaRow.className = 'flex items-end justify-between mt-auto pt-2 border-t border-mid/40';

    const hargaEl = document.createElement('div');
    hargaEl.className = 'text-electric font-black text-lg';
    hargaEl.textContent = formatRp(p.harga);

    const perEl = document.createElement('div');
    perEl.className = 'text-muted text-xs';
    perEl.textContent = p.kategori === 'weekend' ? '/paket' : '/hari';

    hargaRow.appendChild(hargaEl);
    hargaRow.appendChild(perEl);

    const btn = document.createElement('button');
    if (p.tersedia && p.stok > 0) {
      btn.className = 'btn-primary w-full py-2.5 rounded-lg text-sm font-semibold';
      btn.textContent = '+ Tambah ke Keranjang';
      btn.addEventListener('click', () => addToCart(p.id));
    } else {
      btn.className = 'w-full py-2.5 rounded-lg text-sm font-semibold bg-mid text-muted cursor-not-allowed';
      btn.textContent = 'Stok Habis';
      btn.disabled = true;
    }

    body.appendChild(nameEl);
    body.appendChild(descEl);
    body.appendChild(hargaRow);
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

  container.innerHTML = '';

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

    // Header row
    const headerRow = document.createElement('div');
    headerRow.className = 'flex items-start justify-between gap-3';

    const info = document.createElement('div');
    info.className = 'flex items-center gap-2 flex-1 min-w-0';

    const emojiEl = document.createElement('div');
    emojiEl.className = 'text-2xl flex-shrink-0';
    emojiEl.textContent = paket.emoji;

    const nameBlock = document.createElement('div');
    nameBlock.className = 'min-w-0';

    const nameEl = document.createElement('div');
    nameEl.className = 'font-semibold text-sm leading-tight truncate';
    nameEl.textContent = paket.nama;

    const priceEl = document.createElement('div');
    priceEl.className = 'text-muted text-xs mt-0.5';
    priceEl.textContent = `${formatRp(paket.harga)} × ${item.qty}`;

    nameBlock.appendChild(nameEl);
    nameBlock.appendChild(priceEl);
    info.appendChild(emojiEl);
    info.appendChild(nameBlock);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'text-muted hover:text-danger transition-colors p-1 rounded flex-shrink-0';
    removeBtn.setAttribute('aria-label', 'Hapus item');
    const svgRemove = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svgRemove.setAttribute('class','w-4 h-4'); svgRemove.setAttribute('fill','none');
    svgRemove.setAttribute('viewBox','0 0 24 24'); svgRemove.setAttribute('stroke','currentColor');
    const pathR = document.createElementNS('http://www.w3.org/2000/svg','path');
    pathR.setAttribute('stroke-linecap','round'); pathR.setAttribute('stroke-linejoin','round');
    pathR.setAttribute('stroke-width','2'); pathR.setAttribute('d','M6 18L18 6M6 6l12 12');
    svgRemove.appendChild(pathR);
    removeBtn.appendChild(svgRemove);
    removeBtn.addEventListener('click', () => removeFromCart(item.id));

    headerRow.appendChild(info);
    headerRow.appendChild(removeBtn);

    // Qty + Subtotal row
    const footRow = document.createElement('div');
    footRow.className = 'flex items-center justify-between';

    const qtyCtrl = document.createElement('div');
    qtyCtrl.className = 'flex items-center gap-2';

    const minusBtn = document.createElement('button');
    minusBtn.className = 'qty-btn';
    minusBtn.textContent = '−';
    minusBtn.addEventListener('click', () => changeQty(item.id, -1));

    const qtyDisplay = document.createElement('span');
    qtyDisplay.className = 'text-sm font-bold w-6 text-center';
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
    subtotal.className = 'text-electric font-black text-sm';
    subtotal.textContent = formatRp(paket.harga * item.qty);

    footRow.appendChild(qtyCtrl);
    footRow.appendChild(subtotal);

    el.appendChild(headerRow);
    el.appendChild(footRow);
    container.appendChild(el);
  });

  if (totalEl) totalEl.textContent = formatRp(getCartTotal());
}

/* ---- UPDATE CART UI (badge, fab) ---- */
function updateCartUI() {
  const qty    = getCartQty();
  const badge  = document.getElementById('cartBadge');
  const fab    = document.getElementById('cartFab');
  if (badge) badge.textContent = qty > 0 ? (qty > 99 ? '99+' : qty) : '';
  if (fab)   fab.classList.toggle('hidden', qty === 0);
}

/* ---- MODAL HELPERS ---- */
function openModal(id)  { document.getElementById(id)?.classList.remove('hidden'); document.body.style.overflow='hidden'; }
function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); document.body.style.overflow=''; }

/* ---- NAVBAR SCROLL ---- */
function handleScroll() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  if (window.scrollY > 50) nav.classList.add('navbar-scrolled');
  else nav.classList.remove('navbar-scrolled');
}

/* ---- FILTER STATE ---- */
let activeFilter = 'semua';
let searchQuery  = '';

function applyFilter(kat) {
  activeFilter = kat;
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === kat);
  });
  renderCatalog(activeFilter, searchQuery);
}

/* ---- BOOKING FORM VALIDATION ---- */
function sanitizeText(str) {
  return str.replace(/[<>"'`]/g, '').trim();
}

function validateBooking() {
  const nama    = document.getElementById('namaInput');
  const jadwal  = document.getElementById('jadwalInput');
  const namaErr = document.getElementById('namaError');
  const jadwalErr= document.getElementById('jadwalError');
  let valid = true;

  // Reset
  [namaErr, jadwalErr].forEach(e => { e.textContent=''; e.classList.add('hidden'); });
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
    const now = new Date();
    if (selectedDate < now) {
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

  const nama   = sanitizeText(document.getElementById('namaInput').value);
  const jadwalRaw = document.getElementById('jadwalInput').value;
  const catatan   = sanitizeText(document.getElementById('catatanInput').value);

  const jadwalDate = new Date(jadwalRaw);
  const jadwalFmt  = jadwalDate.toLocaleString('id-ID', {
    weekday:'long', year:'numeric', month:'long', day:'numeric',
    hour:'2-digit', minute:'2-digit'
  });

  const msg   = buildWAMessage(nama, jadwalFmt, catatan);
  const url   = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

  // Open WA in new tab
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
  const btn  = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const open = !menu.classList.contains('hidden');
    menu.classList.toggle('hidden', open);
    btn.setAttribute('aria-expanded', String(!open));
  });
  document.querySelectorAll('.mobile-nav-link').forEach(a => {
    a.addEventListener('click', () => menu.classList.add('hidden'));
  });
}

/* ---- CLOSE MODAL ON BACKDROP CLICK ---- */
function initModalBackdrops() {
  ['cartModal','bookingModal'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', e => {
      if (e.target === el) closeModal(id);
    });
  });
}

/* ---- CLOSE ON ESCAPE ---- */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    ['cartModal','bookingModal'].forEach(id => closeModal(id));
  }
});

/* ---- INIT ---- */
function init() {
  // Render sections
  renderPaket();
  renderCatalog();
  updateCartUI();

  // Navbar scroll
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Filter buttons
  document.getElementById('filterBtns')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-filter]');
    if (btn) applyFilter(btn.dataset.filter);
  });

  // Search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchQuery = searchInput.value;
        renderCatalog(activeFilter, searchQuery);
      }, 220);
    });
  }

  // Cart FAB & open
  document.getElementById('cartBtn')?.addEventListener('click', () => {
    renderCartItems();
    openModal('cartModal');
  });
  document.getElementById('closeCartBtn')?.addEventListener('click', () => closeModal('cartModal'));

  // Checkout
  document.getElementById('checkoutBtn')?.addEventListener('click', handleCheckout);
  document.getElementById('clearCartBtn')?.addEventListener('click', () => {
    clearCart();
    renderCartItems();
    showToast('Keranjang dikosongkan.', 'info');
  });

  // Booking modal
  document.getElementById('closeBookingBtn')?.addEventListener('click', () => closeModal('bookingModal'));
  document.getElementById('bookingForm')?.addEventListener('submit', handleBookingSubmit);

  // Set min datetime to now
  const jadwalInput = document.getElementById('jadwalInput');
  if (jadwalInput) {
    const pad = n => String(n).padStart(2,'0');
    const now = new Date();
    const local = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    jadwalInput.min = local;
  }

  // Mobile menu
  initMobileMenu();

  // Backdrop close
  initModalBackdrops();
}

document.addEventListener('DOMContentLoaded', init);
