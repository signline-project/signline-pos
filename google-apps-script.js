/**
 * ============================================================================
 * SIGNLINE STUDIO - GOOGLE APPS SCRIPT BACKEND (ALL-IN-ONE FULL CODE)
 * ============================================================================
 * Cara Pasang:
 * 1. Buka Google Spreadsheet Anda.
 * 2. Klik menu "Ekstensi" > "Apps Script".
 * 3. Hapus seluruh isi file Code.gs yang lama, lalu tempelkan SELURUH KODE ini.
 * 4. Klik ikon "Simpan" (Ctrl + S).
 * 5. Klik tombol "Terapkan" (Deploy) di kanan atas > pilih "Penerapan baru" (New deployment).
 * 6. Pilih jenis: "Aplikasi Web" (Web app).
 * 7. Konfigurasi penting:
 *    - Jalankan sebagai (Execute as): "Saya" (Me / akun Google Anda)
 *    - Siapa yang memiliki akses (Who has access): "Siapa saja" (Anyone) -> WAJIB!
 * 8. Klik "Terapkan" (Deploy). Jika muncul izin akses, klik "Beri Akses" (Review Permissions) > Pilih Akun > Advanced > Go to (unsafe) > Allow.
 * 9. Salin URL Aplikasi Web yang berakhiran "/exec", lalu masukkan ke menu [URL Sheet] di aplikasi Signline POS.
 * ============================================================================
 */

function doGet(e) {
  var param = (e && e.parameter) ? e.parameter : {};
  var aksi = param.aksi || '';

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. AMBIL KATALOG PRODUK / LAYANAN
    if (aksi === 'getProduk') {
      var sheetProd = dapatkanSheetProduk(ss);
      var data = sheetProd.getDataRange().getValues();
      return responJson(data);
    }

    // 2. AMBIL RIWAYAT TRANSAKSI POS
    if (aksi === 'getTransaksi') {
      var sheetTrx = dapatkanSheetTransaksi(ss);
      var lastRow = sheetTrx.getLastRow();
      if (lastRow <= 1) {
        return responJson([]);
      }
      var rows = sheetTrx.getRange(2, 1, lastRow - 1, sheetTrx.getLastColumn()).getValues();
      // Urutkan transaksi terbaru di atas
      rows.reverse();
      return responJson(rows);
    }

    // 3. AMBIL DATA GRAFIK OMZET & PROFIT HARIAN & BULANAN
    if (aksi === 'getDataGrafik') {
      var sheetTrx = dapatkanSheetTransaksi(ss);
      var lastRow = sheetTrx.getLastRow();
      var namaBulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      var harian = {};
      var bulanan = {};

      if (lastRow > 1) {
        var data = sheetTrx.getRange(2, 1, lastRow - 1, sheetTrx.getLastColumn()).getValues();
        for (var i = 0; i < data.length; i++) {
          var row = data[i];
          var rawDate = row[0];
          if (!rawDate) continue;

          var d = new Date(rawDate);
          if (isNaN(d.getTime())) continue;

          var strHari = d.getDate() + " " + namaBulan[d.getMonth()] + " " + d.getFullYear();
          var strBulan = namaBulan[d.getMonth()] + " " + d.getFullYear();

          var omzet = Number(row[7]) || 0;
          var profit = Number(row[9]) || 0;

          // Akumulasi Harian
          if (!harian[strHari]) harian[strHari] = { omzet: 0, profit: 0 };
          harian[strHari].omzet += omzet;
          harian[strHari].profit += profit;

          // Akumulasi Bulanan
          if (!bulanan[strBulan]) bulanan[strBulan] = { omzet: 0, profit: 0 };
          bulanan[strBulan].omzet += omzet;
          bulanan[strBulan].profit += profit;
        }
      }
      return responJson({ harian: harian, bulanan: bulanan });
    }

    // 4. AMBIL DATA SERVIS GADGET
    if (aksi === 'getService') {
      var sheetSrv = dapatkanSheetServis(ss);
      var lastRow = sheetSrv.getLastRow();
      if (lastRow <= 1) {
        return responJson([]);
      }
      var rows = sheetSrv.getRange(1, 1, lastRow, sheetSrv.getLastColumn()).getValues();
      return responJson(rows);
    }

    // DEFAULT / PING TES
    return responJson({
      status: "online",
      pesan: "Google Apps Script Signline Studio Aktif & Siap Digunakan",
      waktu: new Date().toLocaleString("id-ID")
    });

  } catch (err) {
    return responJson({ status: "error", pesan: err.toString() });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var contents = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    var param = JSON.parse(contents);
    var aksi = param.aksi || '';

    // 1. SIMPAN TRANSAKSI MULTI-ITEM KASIR POS
    if (aksi === 'simpanOrder') {
      var sheetTrx = dapatkanSheetTransaksi(ss);
      var d = param.data || {};
      var now = new Date();
      var idOrder = 'SL-' + Math.floor(1000 + Math.random() * 9000);
      var items = d.items || [];

      items.forEach(function(it) {
        var qty = Number(it.qty) || 1;
        var hpp = Number(it.hpp) || 0;
        var harga = Number(it.harga) || 0;
        var subtotal = Number(it.subtotal) || (qty * harga);
        var subtotalHpp = hpp * qty;
        var profit = subtotal - subtotalHpp;

        sheetTrx.appendRow([
          Utilities.formatDate(now, "GMT+7", "M/d/yyyy HH:mm:ss"),
          idOrder,
          d.nama || 'Pelanggan Umum',
          it.layanan || 'Layanan',
          qty,
          hpp,
          harga,
          subtotal,
          subtotalHpp,
          profit,
          d.catatan || '-'
        ]);
      });

      return responJson({ status: 'sukses', id: idOrder });
    }

    // 2. TAMBAH PRODUK / LAYANAN KE KATALOG
    if (aksi === 'tambahProduk') {
      var sheetProd = dapatkanSheetProduk(ss);
      var p = param.data || {};
      sheetProd.appendRow([
        p.nama || 'Produk Baru',
        Number(p.hpp || 0),
        Number(p.jual || 0)
      ]);
      return responJson({ status: 'sukses' });
    }

    // 3. HAPUS PRODUK DARI KATALOG
    if (aksi === 'hapusProduk') {
      var sheetProd = dapatkanSheetProduk(ss);
      var namaTarget = param.nama;
      var rows = sheetProd.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] == namaTarget) {
          sheetProd.deleteRow(i + 1);
          break;
        }
      }
      return responJson({ status: 'sukses' });
    }

    // 4. HAPUS TRANSAKSI DARI RIWAYAT
    if (aksi === 'hapusTransaksi') {
      var sheetTrx = dapatkanSheetTransaksi(ss);
      var idTarget = param.id;
      var rows = sheetTrx.getDataRange().getValues();
      // Hapus dari baris paling bawah ke atas agar indeks tidak bergeser
      for (var i = rows.length - 1; i >= 1; i--) {
        if (rows[i][1] == idTarget) {
          sheetTrx.deleteRow(i + 1);
        }
      }
      return responJson({ status: 'sukses' });
    }

    // 5. SIMPAN NOTA SERVIS GADGET
    if (aksi === 'simpanService') {
      var sheetSrv = dapatkanSheetServis(ss);
      var s = param.data || {};
      var now = new Date();
      var biaya = s.biaya || {};
      var spareparts = biaya.spareparts || [];
      var sparepartsText = spareparts.map(function(x) {
        return x.nama + ' (' + x.qty + 'x @' + x.harga + ')';
      }).join('; ');

      sheetSrv.appendRow([
        Utilities.formatDate(now, "GMT+7", "M/d/yyyy HH:mm:ss"),
        s.id,
        s.tanggal || Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd HH:mm"),
        s.estimasi || '-',
        s.teknisi || 'Teknisi Signline',
        (s.pelanggan && s.pelanggan.nama) || 'Pelanggan',
        (s.pelanggan && s.pelanggan.hp) || '',
        (s.pelanggan && s.pelanggan.alamat) || '-',
        (s.perangkat && s.perangkat.kategori) || 'Gadget',
        (s.perangkat && s.perangkat.model) || '-',
        (s.perangkat && s.perangkat.imei) || '-',
        (s.perangkat && s.perangkat.warna) || '-',
        (s.perangkat && s.perangkat.password) || '-',
        (s.perangkat && s.perangkat.kondisiFisik) || '-',
        (s.perangkat && s.perangkat.kelengkapan) || '-',
        s.keluhan || '-',
        s.kondisiMasuk || '-',
        biaya.namaJasa || 'Jasa Servis',
        Number(biaya.biayaJasa || 0),
        sparepartsText || '-',
        Number(biaya.totalSpareparts || 0),
        Number(biaya.grandTotal || 0),
        Number(biaya.dp || 0),
        Number(biaya.sisa || 0),
        biaya.statusBayar || 'Belum Bayar',
        s.garansi || '30 Hari',
        s.status || 'Diterima',
        s.catatanTeknisi || '-'
      ]);

      return responJson({ status: 'sukses', id: s.id });
    }

    // 6. UPDATE STATUS SERVIS GADGET
    if (aksi === 'updateStatusService') {
      var sheetSrv = dapatkanSheetServis(ss);
      var idTarget = param.id;
      var rows = sheetSrv.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][1] == idTarget) {
          var rowNum = i + 1;
          if (param.status) sheetSrv.getRange(rowNum, 27).setValue(param.status);
          if (param.catatanTeknisi) sheetSrv.getRange(rowNum, 28).setValue(param.catatanTeknisi);
          if (param.sisa !== undefined) sheetSrv.getRange(rowNum, 24).setValue(Number(param.sisa));
          if (param.statusBayar) sheetSrv.getRange(rowNum, 25).setValue(param.statusBayar);
          break;
        }
      }
      return responJson({ status: 'sukses' });
    }

    // 7. HAPUS SERVIS GADGET
    if (aksi === 'hapusService') {
      var sheetSrv = dapatkanSheetServis(ss);
      var idTarget = param.id;
      var rows = sheetSrv.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][1] == idTarget) {
          sheetSrv.deleteRow(i + 1);
          break;
        }
      }
      return responJson({ status: 'sukses' });
    }

    return responJson({ status: 'error', pesan: 'Aksi tidak dikenali: ' + aksi });

  } catch (err) {
    return responJson({ status: 'error', pesan: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

// ============================================================================
// HELPER SHEET MANAGEMENT (AUTO-CREATE JIKA BELUM ADA)
// ============================================================================

function dapatkanSheetTransaksi(ss) {
  var s = ss.getSheetByName('Transaksi');
  if (!s) {
    // Gunakan sheet pertama jika bernama lain, atau buat sheet baru
    var sheets = ss.getSheets();
    if (sheets.length > 0 && sheets[0].getName() !== 'Produk' && sheets[0].getName() !== 'Servis') {
      s = sheets[0];
    } else {
      s = ss.insertSheet('Transaksi');
    }
  }
  if (s.getLastRow() === 0) {
    s.appendRow([
      "Timestamp", "ID Order", "Nama Pelanggan", "Nama Layanan", "Qty",
      "HPP", "Harga Jual", "Subtotal Jual", "Subtotal HPP", "Profit", "Catatan"
    ]);
  }
  return s;
}

function dapatkanSheetProduk(ss) {
  var s = ss.getSheetByName('Produk');
  if (!s) {
    s = ss.insertSheet('Produk');
    s.appendRow(["Nama Produk", "HPP", "Harga Jual"]);
    s.appendRow(["Cetak Foto 3x4", 1000, 2500]);
    s.appendRow(["Cetak Foto 4x6", 1000, 3000]);
    s.appendRow(["Copy B/W", 500, 1000]);
    s.appendRow(["Laminating Press", 4000, 10000]);
  }
  return s;
}

function dapatkanSheetServis(ss) {
  var s = ss.getSheetByName('Servis');
  if (!s) {
    s = ss.insertSheet('Servis');
    s.appendRow([
      "Timestamp", "No_Nota", "Tanggal_Masuk", "Estimasi_Selesai", "Teknisi",
      "Nama_Pelanggan", "No_HP", "Alamat_Pelanggan", "Kategori_Perangkat", "Tipe_Model",
      "No_Seri_IMEI", "Warna_Unit", "Pola_Password", "Kondisi_Fisik", "Kelengkapan",
      "Keluhan_Kerusakan", "Kondisi_Masuk", "Nama_Jasa", "Biaya_Jasa", "Rincian_Sparepart",
      "Total_Sparepart", "Grand_Total", "Uang_Muka_DP", "Sisa_Tagihan", "Status_Bayar",
      "Garansi", "Status_Servis", "Catatan_Teknisi"
    ]);
  }
  return s;
}

function responJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
