# Postman Collection - Inventory Management API

Folder ini berisi koleksi Postman untuk menguji seluruh endpoint API secara end-to-end.

## File

| File | Keterangan |
| :--- | :--- |
| `Inventory-Management-API.postman_collection.json` | Collection utama (50 request, 118 assertion) |
| `Inventory-Local.postman_environment.json` | Environment `baseUrl = http://localhost:3000` |
| `newman-report.json` | Hasil run terakhir (laporan lengkap request/response) |

## Cara Import ke Postman

1. Buka Postman → **Import**.
2. Import kedua file `.json` di atas (collection dan environment).
3. Pilih environment **Inventory Local** di kanan atas.
4. Klik collection → **Run** (Collection Runner).
5. Pastikan opsi **Run in order** aktif, lalu klik **Run Inventory Management API**.

> Jalankan dari folder `00` sampai `08` secara berurutan. Collection menyimpan ID hasil
> `POST` ke collection variable secara otomatis, sehingga request selanjutnya tidak perlu
> mengisi UUID secara manual.

## Cara Run via CLI (Newman)

Pastikan API sudah berjalan di `http://localhost:3000`, lalu:

```bash
npx newman run postman/Inventory-Management-API.postman_collection.json \
  -e postman/Inventory-Local.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export postman/newman-report.json
```

## Cakupan Pengujian

| Folder | Cakupan |
| :--- | :--- |
| `00 - Health Check` | `GET /` |
| `01 - Categories` | CRUD kategori + relasi products |
| `02 - Suppliers` | CRUD supplier |
| `03 - Warehouses` | CRUD gudang + relasi stockMovements |
| `04 - Products` | CRUD produk, stok awal 0, relasi category/supplier |
| `05 - Stock Movements` | Transaksi IN/OUT, filter `?type=`, detail, update |
| `06 - Stock Movement Items` | Penambahan item, perhitungan stok otomatis, update kuantitas (rollback) |
| `07 - Negative Cases` | 400 validasi, 400 stok tidak cukup, 404, 409 duplikat, UUID invalid |
| `08 - Cleanup` | Rollback stok, hapus semua data uji, verifikasi soft delete |

Skenario utama yang dibuktikan:

- Stok awal produk = `0`.
- `IN 50` → `currentStock = 50`.
- `OUT 15` → `currentStock = 35`.
- `PATCH` item IN dari `50` → `60` → `currentStock = 45`.
- `OUT 100` (melebihi stok) → `400 Bad Request`, stok tetap `45`.
- Hapus item OUT lalu item IN → stok kembali `0`.

## Catatan

- Nilai unik (nama kategori, email, SKU, kode gudang, nomor referensi) memakai dynamic
  variable `{{$timestamp}}`, sehingga collection aman dijalankan berulang kali.
- Folder `08 - Cleanup` menghapus data uji dan mengembalikan stok ke `0`. Jika ingin
  memeriksa data hasil transaksi, cukup hentikan run sebelum folder `08`.
- `movementDate` diisi otomatis dari collection-level pre-request script (`{{today}}`).
