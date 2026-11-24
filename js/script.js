"use strict";

// Nomor WhatsApp tujuan (format internasional tanpa + atau 0 di depan).
// Ganti dengan nomor usaha yang asli.
const NOMOR_WA = "6285181838164";
const NAMA_USAHA = "Risol Lagi";

const rupiah = (angka) => "Rp" + angka.toLocaleString("id-ID");
const bukaWa = (teks) => {
  const url = "https://wa.me/" + NOMOR_WA + "?text=" + encodeURIComponent(teks);
  window.open(url, "_blank", "noopener");
};

// ---------- Header: menu layar kecil dan warna saat di-scroll ----------
const header = document.getElementById("atas");
const menuToggle = document.getElementById("menuToggle");

menuToggle.addEventListener("click", () => {
  const buka = header.classList.toggle("buka");
  menuToggle.setAttribute("aria-expanded", String(buka));
});

const linkNav = [...document.querySelectorAll(".nav-link")];

linkNav.forEach((a) =>
  a.addEventListener("click", () => {
    header.classList.remove("buka");
    menuToggle.setAttribute("aria-expanded", "false");
  })
);

// Header transparan di atas hero, berubah krem setelah melewati hero
function aturHeader() {
  header.classList.toggle("menempel", window.scrollY > 40);
}
window.addEventListener("scroll", aturHeader, { passive: true });
aturHeader();

// ---------- Tandai menu sesuai bagian yang sedang dilihat ----------
const bagian = linkNav
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const pengamat = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        linkNav.forEach((a) =>
          a.classList.toggle("aktif", a.getAttribute("href") === "#" + entry.target.id)
        );
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  bagian.forEach((b) => pengamat.observe(b));
}

// ---------- Filter menu ----------
const barisMenu = [...document.querySelectorAll(".menu-baris")];
const tombolFilter = [...document.querySelectorAll(".filter-btn")];

tombolFilter.forEach((btn) => {
  btn.addEventListener("click", () => {
    tombolFilter.forEach((b) => b.classList.toggle("aktif", b === btn));
    const kategori = btn.dataset.filter;
    barisMenu.forEach((baris) => {
      baris.hidden = kategori !== "semua" && baris.dataset.cat !== kategori;
    });
  });
});

// ---------- Keranjang pesanan ----------
const jumlah = new Map(); // nama produk -> jumlah

const elKosong = document.getElementById("keranjangKosong");
const elList = document.getElementById("keranjangList");
const elTotalBaris = document.getElementById("totalBaris");
const elTotal = document.getElementById("totalHarga");
const elKosongkan = document.getElementById("kosongkan");
const elKirim = document.getElementById("kirimPesanan");
const elBar = document.getElementById("barPesanan");
const elBarJumlah = document.getElementById("barJumlah");
const elBarTotal = document.getElementById("barTotal");

function hitung() {
  let item = 0;
  let total = 0;
  barisMenu.forEach((baris) => {
    const qty = jumlah.get(baris.dataset.name) || 0;
    item += qty;
    total += qty * Number(baris.dataset.price);
  });
  return { item, total };
}

function render() {
  const { item, total } = hitung();

  elList.innerHTML = "";
  barisMenu.forEach((baris) => {
    const nama = baris.dataset.name;
    const qty = jumlah.get(nama) || 0;
    const harga = Number(baris.dataset.price);

    baris.querySelector(".qty-nilai").textContent = qty;
    baris.classList.toggle("dipilih", qty > 0);

    if (qty > 0) {
      const li = document.createElement("li");
      const kiri = document.createElement("div");
      const judul = document.createElement("div");
      const rinci = document.createElement("div");
      judul.textContent = nama;
      rinci.className = "rincian";
      rinci.textContent = qty + " x " + rupiah(harga);
      kiri.append(judul, rinci);

      const kanan = document.createElement("strong");
      kanan.textContent = rupiah(qty * harga);
      li.append(kiri, kanan);
      elList.append(li);
    }
  });

  const adaItem = item > 0;
  elKosong.hidden = adaItem;
  elTotalBaris.hidden = !adaItem;
  elKosongkan.hidden = !adaItem;
  elKirim.disabled = !adaItem;
  elTotal.textContent = rupiah(total);

  elBar.hidden = !adaItem;
  elBarJumlah.textContent = item;
  elBarTotal.textContent = rupiah(total);
}

barisMenu.forEach((baris) => {
  const nama = baris.dataset.name;
  baris.querySelector(".qty-plus").addEventListener("click", () => {
    jumlah.set(nama, (jumlah.get(nama) || 0) + 1);
    render();
  });
  baris.querySelector(".qty-min").addEventListener("click", () => {
    const sekarang = jumlah.get(nama) || 0;
    if (sekarang > 0) jumlah.set(nama, sekarang - 1);
    render();
  });
});

elKosongkan.addEventListener("click", () => {
  jumlah.clear();
  render();
});

// Sembunyikan bilah pesanan saat bagian Pesan sudah terlihat
const bagianPesan = document.getElementById("pesan");
if ("IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => {
    elBar.style.display = entry.isIntersecting ? "none" : "";
  }).observe(bagianPesan);
}

document.getElementById("formPesanan").addEventListener("submit", (e) => {
  e.preventDefault();
  const { item, total } = hitung();
  if (item === 0) return;

  const nama = document.getElementById("namaPesan").value.trim();
  const catatan = document.getElementById("catatanPesan").value.trim();

  const baris = [];
  baris.push("Halo " + NAMA_USAHA + ", saya mau pesan:");
  barisMenu.forEach((el) => {
    const qty = jumlah.get(el.dataset.name) || 0;
    if (qty > 0) {
      baris.push(
        "- " + el.dataset.name + " x" + qty + " = " + rupiah(qty * Number(el.dataset.price))
      );
    }
  });
  baris.push("Total: " + rupiah(total));
  baris.push("Nama: " + nama);
  if (catatan) baris.push("Catatan: " + catatan);

  bukaWa(baris.join("\n"));
});

// ---------- Form kontak -> WhatsApp ----------
document.getElementById("formKontak").addEventListener("submit", (e) => {
  e.preventDefault();
  const nama = document.getElementById("nama").value.trim();
  const wa = document.getElementById("wa").value.trim();
  const pesan = document.getElementById("pesan").value.trim();

  const teks = [
    "Halo " + NAMA_USAHA + ",",
    pesan || "saya ingin bertanya.",
    "",
    "Nama: " + nama,
    "Nomor WhatsApp: " + wa,
  ].join("\n");

  bukaWa(teks);
  e.target.reset();
});

// ---------- Lightbox gambar ----------
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");

function tutupLightbox() {
  lightbox.hidden = true;
  lightboxImg.src = "";
}

document.querySelectorAll("[data-lightbox]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const img = btn.querySelector("img");
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.hidden = false;
  });
});

lightbox.addEventListener("click", (e) => {
  if (e.target !== lightboxImg) tutupLightbox();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !lightbox.hidden) tutupLightbox();
});

render();

// ---------- Carousel hero ----------
(function () {
  const hero = document.getElementById("hero");
  const slide = [...hero.querySelectorAll(".hero-slide")];
  const wadahTitik = document.getElementById("heroTitik");
  const JEDA = 3000; // ms antar slide
  let indeks = 0;
  let timer = null;

  const titik = slide.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", "Slide " + (i + 1));
    b.addEventListener("click", () => {
      pindah(i);
      mulai();
    });
    wadahTitik.append(b);
    return b;
  });

  function pindah(i) {
    indeks = (i + slide.length) % slide.length;
    slide.forEach((s, n) => {
      s.classList.toggle("aktif", n === indeks);
      s.setAttribute("aria-hidden", String(n !== indeks));
    });
    titik.forEach((t, n) => t.classList.toggle("aktif", n === indeks));
  }

  function mulai() {
    clearInterval(timer);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer = setInterval(() => pindah(indeks + 1), JEDA);
  }

  document.getElementById("heroPrev").addEventListener("click", () => {
    pindah(indeks - 1);
    mulai();
  });
  document.getElementById("heroNext").addEventListener("click", () => {
    pindah(indeks + 1);
    mulai();
  });

  // Jeda saat disentuh/di-hover/difokus supaya teks bisa dibaca
  hero.addEventListener("mouseenter", () => clearInterval(timer));
  hero.addEventListener("mouseleave", mulai);
  hero.addEventListener("focusin", () => clearInterval(timer));
  hero.addEventListener("focusout", mulai);

  // Geser jari di layar sentuh
  let awalX = null;
  hero.addEventListener("touchstart", (e) => {
    awalX = e.touches[0].clientX;
  }, { passive: true });
  hero.addEventListener("touchend", (e) => {
    if (awalX === null) return;
    const selisih = e.changedTouches[0].clientX - awalX;
    if (Math.abs(selisih) > 50) {
      pindah(indeks + (selisih < 0 ? 1 : -1));
      mulai();
    }
    awalX = null;
  });

  pindah(0);
  mulai();
})();
