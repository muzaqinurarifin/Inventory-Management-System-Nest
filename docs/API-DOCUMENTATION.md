# 📚 Dokumentasi API Inventory Management System

Dokumentasi lengkap seluruh endpoint **Inventory Management API** (NestJS + PostgreSQL + TypeORM).
Dokumen ini mencakup method **GET, POST, PATCH, DELETE**, aturan validasi, contoh request/response asli, aturan bisnis stok, serta cara mengimpor dan menjalankan koleksi Postman.

- **Base URL default:** `http://localhost:3000`
- **Format data:** JSON (`Content-Type: application/json`)
- **Penamaan path:** huruf kecil dan tanda hubung (`stock-movement-items`)
- **Update data:** hanya `PATCH` (tidak ada `PUT`)
- **Penghapusan:** **soft delete** (`deletedAt` diisi), data tidak tampil lagi pada GET berikutnya

---

## 1. Menjalankan Aplikasi

```bash
# 1. Jalankan database PostgreSQL (Docker)
docker compose up -d

# 2. Jalankan server (mode development)
npm run start:dev
```

Server berjalan di `http://localhost:3000` (atau sesuai `PORT` di `.env`).

---

## 2. Format Response

### 2.1 Response Sukses

Semua response sukses dibungkus oleh `TransformResponseInterceptor`:

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Request berhasil",
  "data": {}
}
```

| Field | Tipe | Keterangan |
| --- | --- | --- |
| `success` | boolean | `true` untuk status 2xx |
| `statusCode` | number | Sama dengan HTTP status |
| `message` | string | Selalu `"Request berhasil"` |
| `data` | any | Payload asli dari service (objek, array, atau `{ message }` untuk delete) |

> Endpoint `GET /` juga dibungkus: `data` berisi string `"Hello World!"`.

### 2.2 Response Error

Error **tidak** dibungkus interceptor. Bentuknya mengikuti bawaan NestJS:

```json
{
  "message": "Produk dengan ID 00000000-0000-4000-8000-000000000000 tidak ditemukan",
  "error": "Not Found",
  "statusCode": 404
}
```

Untuk validasi DTO, `message` berupa **array**:

```json
{
  "message": [
    "price must not be less than 0"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### 2.3 Daftar Status Code

| Status | Kapan terjadi |
| --- | --- |
| `200 OK` | GET, PATCH, DELETE berhasil |
| `201 Created` | POST berhasil membuat data |
| `400 Bad Request` | Validasi DTO gagal, UUID tidak valid, tipe transaksi salah, stok tidak cukup, JSON rusak |
| `404 Not Found` | ID valid tetapi data tidak ada, atau route tidak terdaftar |
| `409 Conflict` | Duplikat nilai unik (nama kategori, email supplier, kode gudang, SKU, nomor referensi) |
| `500 Internal Server Error` | Kesalahan tak terduga (seharusnya tidak muncul pada alur normal) |

---

## 3. Aturan Validasi Global

Diterapkan melalui `ValidationPipe` di `src/main.ts`:

| Aturan | Efek |
| --- | --- |
| `whitelist: true` | Properti yang tidak dideklarasikan DTO dibuang |
| `forbidNonWhitelisted: true` | Properti asing **ditolak** dengan `400` (contoh: mengirim `currentStock` saat create product) |
| `transform: true` | Body/query dikonversi ke tipe DTO (mis. `capacity` menjadi number) |

Konsekuensi penting:

- Field yang tidak ada di DTO **tidak boleh** dikirim.
- `:id` pada semua endpoint memakai `ParseUUIDPipe`; nilai bukan UUID → `400` dengan pesan `Validation failed (uuid is expected)`.
- Nilai `type` transaksi **case-sensitive**: hanya `IN` atau `OUT` (huruf besar).

---

## 4. Ringkasan Endpoint

| # | Method | Path | Fungsi |
| --- | --- | --- | --- |
| 1 | GET | `/` | Health check |
| 2 | POST | `/categories` | Buat kategori |
| 3 | GET | `/categories` | List kategori |
| 4 | GET | `/categories/:id` | Detail kategori |
| 5 | PATCH | `/categories/:id` | Update kategori |
| 6 | DELETE | `/categories/:id` | Hapus kategori |
| 7 | POST | `/suppliers` | Buat supplier |
| 8 | GET | `/suppliers` | List supplier |
| 9 | GET | `/suppliers/:id` | Detail supplier |
| 10 | PATCH | `/suppliers/:id` | Update supplier |
| 11 | DELETE | `/suppliers/:id` | Hapus supplier |
| 12 | POST | `/warehouses` | Buat gudang |
| 13 | GET | `/warehouses` | List gudang |
| 14 | GET | `/warehouses/:id` | Detail gudang |
| 15 | PATCH | `/warehouses/:id` | Update gudang |
| 16 | DELETE | `/warehouses/:id` | Hapus gudang |
| 17 | POST | `/products` | Buat produk |
| 18 | GET | `/products` | List produk |
| 19 | GET | `/products/:id/stock-info` | Rekap stok + histori produk |
| 20 | GET | `/products/:id` | Detail produk |
| 21 | PATCH | `/products/:id` | Update produk |
| 22 | DELETE | `/products/:id` | Hapus produk |
| 23 | POST | `/stock-movements` | Buat dokumen transaksi |
| 24 | GET | `/stock-movements` | List transaksi (opsional `?type=IN\|OUT`) |
| 25 | GET | `/stock-movements/:id` | Detail transaksi + item |
| 26 | PATCH | `/stock-movements/:id` | Update transaksi |
| 27 | DELETE | `/stock-movements/:id` | Hapus transaksi + item |
| 28 | POST | `/stock-movement-items` | Tambah item transaksi |
| 29 | GET | `/stock-movement-items` | List item transaksi |
| 30 | GET | `/stock-movement-items/:id` | Detail item transaksi |
| 31 | PATCH | `/stock-movement-items/:id` | Update item transaksi |
| 32 | DELETE | `/stock-movement-items/:id` | Hapus item transaksi |

---

## 5. Health Check

### GET `/`

Memastikan server hidup dan response memakai wrapper standar.

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request berhasil",
  "data": "Hello World!"
}
```

---

## 6. Categories

### 6.1 POST `/categories`

**Body**

| Field | Tipe | Wajib | Aturan |
| --- | --- | --- | --- |
| `name` | string | ✅ | Tidak boleh kosong, maksimal 100 karakter, **unik** |
| `description` | string | ❌ | Teks bebas |

**Request**

```json
{
  "name": "Elektronik",
  "description": "Komponen dan perangkat keras komputer"
}
```

**Response `201 Created`**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Request berhasil",
  "data": {
    "id": "e68a0cc7-a240-48e5-8b47-82649ced97fd",
    "name": "Elektronik",
    "description": "Komponen dan perangkat keras komputer",
    "createdAt": "2026-11-08T23:12:51.619Z",
    "updatedAt": "2026-11-08T23:12:51.619Z",
    "deletedAt": null
  }
}
```

**Error**

| Status | Kondisi | Contoh pesan |
| --- | --- | --- |
| `400` | `name` kosong / > 100 karakter / field asing | array pesan validasi |
| `409` | Nama sudah dipakai | `Kategori Elektronik sudah ada` |

### 6.2 GET `/categories`

Menampilkan semua kategori beserta relasi `products`.

**Response `200 OK`** — `data` berupa array objek kategori (termasuk `products: []`).

### 6.3 GET `/categories/:id`

**Response `200 OK`** — objek kategori beserta `products`.

| Status | Kondisi | Contoh pesan |
| --- | --- | --- |
| `400` | `:id` bukan UUID | `Validation failed (uuid is expected)` |
| `404` | Data tidak ada / sudah dihapus | `Kategori dengan ID <uuid> tidak ditemukan` |

### 6.4 PATCH `/categories/:id`

Update **parsial**; hanya field yang dikirim yang berubah.

**Body** — semua opsional

| Field | Tipe | Aturan |
| --- | --- | --- |
| `name` | string | Tidak boleh kosong, maksimal 100 karakter, unik |
| `description` | string | Teks bebas |

```json
{ "description": "Komponen, aksesoris, dan perangkat komputer" }
```

**Response `200 OK`** — objek kategori terbaru.
**Error** — `400`, `404`, atau `409` jika nama baru sudah dipakai kategori lain.

### 6.5 DELETE `/categories/:id`

Soft delete.

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request berhasil",
  "data": {
    "message": "Kategori Elektronik berhasil dihapus"
  }
}
```

Setelah dihapus, `GET /categories/:id` mengembalikan `404`.

---

## 7. Suppliers

### 7.1 POST `/suppliers`

**Body**

| Field | Tipe | Wajib | Aturan |
| --- | --- | --- | --- |
| `name` | string | ✅ | Tidak kosong, maksimal 120 karakter |
| `contactPerson` | string | ✅ | Tidak kosong, maksimal 100 karakter |
| `phone` | string | ✅ | Tidak kosong, maksimal 20 karakter |
| `email` | string | ✅ | Format email valid, **unik** |
| `address` | string | ✅ | Tidak kosong |

**Request**

```json
{
  "name": "PT Sumber Teknologi",
  "contactPerson": "Budi Raharjo",
  "phone": "081234567890",
  "email": "supplier@example.com",
  "address": "Kawasan Industri Pulogadung, Jakarta"
}
```

**Response `201 Created`**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Request berhasil",
  "data": {
    "id": "ca49240e-cf30-41b2-b340-a132e4f008f8",
    "name": "PT Sumber Teknologi",
    "contactPerson": "Budi Raharjo",
    "phone": "081234567890",
    "email": "supplier@example.com",
    "address": "Kawasan Industri Pulogadung, Jakarta",
    "createdAt": "2026-11-08T23:12:51.656Z",
    "updatedAt": "2026-11-08T23:12:51.656Z",
    "deletedAt": null
  }
}
```

**Error**

| Status | Kondisi | Contoh pesan |
| --- | --- | --- |
| `400` | Field wajib kosong / email tidak valid / field asing | array pesan validasi |
| `409` | Email sudah terdaftar | `Email pemasok supplier@example.com sudah terdaftar` |

### 7.2 GET `/suppliers`

Menampilkan semua supplier beserta relasi `products`.

### 7.3 GET `/suppliers/:id`

Detail supplier + `products`.

| Status | Kondisi | Contoh pesan |
| --- | --- | --- |
| `404` | Tidak ada | `Pemasok dengan ID <uuid> tidak ditemukan` |

### 7.4 PATCH `/suppliers/:id`

Update parsial. Body opsional: `name`, `contactPerson`, `phone`, `email`, `address`.
Email baru harus unik; jika dipakai supplier lain → `409`.

**Response `200 OK`** — objek supplier terbaru.

### 7.5 DELETE `/suppliers/:id`

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request berhasil",
  "data": {
    "message": "Pemasok PT Sumber Teknologi berhasil dihapus"
  }
}
```

---

## 8. Warehouses

### 8.1 POST `/warehouses`

**Body**

| Field | Tipe | Wajib | Aturan |
| --- | --- | --- | --- |
| `code` | string | ✅ | Tidak kosong, maksimal 30 karakter, **unik** |
| `name` | string | ✅ | Tidak kosong, maksimal 100 karakter |
| `location` | string | ✅ | Tidak kosong |
| `capacity` | integer | ❌ | Minimal 1, default `1000` |

**Request**

```json
{
  "code": "WH-JKT-01",
  "name": "Gudang Utama Jakarta",
  "location": "Blok A No. 12",
  "capacity": 5000
}
```

**Response `201 Created`**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Request berhasil",
  "data": {
    "id": "40905ef0-51e3-49c6-a989-bba4b850f017",
    "code": "WH-JKT-01",
    "name": "Gudang Utama Jakarta",
    "location": "Blok A No. 12",
    "capacity": 5000,
    "createdAt": "2026-11-08T23:12:51.690Z",
    "updatedAt": "2026-11-08T23:12:51.690Z",
    "deletedAt": null
  }
}
```

**Error**

| Status | Kondisi | Contoh pesan |
| --- | --- | --- |
| `400` | Field wajib kosong / `capacity` < 1 | array pesan validasi |
| `409` | Kode sudah dipakai | `Kode gudang WH-JKT-01 sudah digunakan` |

### 8.2 GET `/warehouses`

Menampilkan semua gudang (tanpa relasi).

### 8.3 GET `/warehouses/:id`

Detail gudang beserta relasi `stockMovements`.

| Status | Kondisi | Contoh pesan |
| --- | --- | --- |
| `404` | Tidak ada | `Gudang dengan ID <uuid> tidak ditemukan` |

### 8.4 PATCH `/warehouses/:id`

Update parsial: `code`, `name`, `location`, `capacity`.
Kode baru harus unik; jika dipakai gudang lain → `409`.

**Response `200 OK`** — objek gudang terbaru.

### 8.5 DELETE `/warehouses/:id`

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request berhasil",
  "data": {
    "message": "Gudang Gudang Utama Jakarta berhasil dihapus"
  }
}
```

> Gudang yang masih dipakai transaksi aktif sebaiknya tidak dihapus. Penghapusan gudang tidak otomatis menghapus transaksi.

---

## 9. Products

### 9.1 POST `/products`

**Body**

| Field | Tipe | Wajib | Aturan |
| --- | --- | --- | --- |
| `sku` | string | ✅ | Tidak kosong, maksimal 50 karakter, **unik** |
| `name` | string | ✅ | Tidak kosong, maksimal 150 karakter |
| `unit` | string | ❌ | Maksimal 30 karakter, default `pcs` |
| `price` | number | ✅ | Minimal `0` |
| `categoryId` | UUID | ✅ | Kategori harus ada |
| `supplierId` | UUID | ✅ | Supplier harus ada |

> `currentStock` **tidak boleh** dikirim saat create. Field ini dikelola otomatis oleh transaksi stok. Mengirimnya akan ditolak `400` karena `forbidNonWhitelisted`.

**Request**

```json
{
  "sku": "PRD-ELK-001",
  "name": "Mechanical Keyboard",
  "unit": "unit",
  "price": 750000,
  "categoryId": "e68a0cc7-a240-48e5-8b47-82649ced97fd",
  "supplierId": "ca49240e-cf30-41b2-b340-a132e4f008f8"
}
```

**Response `201 Created`**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Request berhasil",
  "data": {
    "id": "8a81c1a6-d313-47a3-ba78-88a8cb81fb9d",
    "sku": "PRD-ELK-001",
    "name": "Mechanical Keyboard",
    "unit": "unit",
    "price": 750000,
    "currentStock": 0,
    "categoryId": "e68a0cc7-a240-48e5-8b47-82649ced97fd",
    "supplierId": "ca49240e-cf30-41b2-b340-a132e4f008f8",
    "createdAt": "2026-11-08T23:12:51.719Z",
    "updatedAt": "2026-11-08T23:12:51.719Z",
    "deletedAt": null
  }
}
```

`price` selalu dikembalikan sebagai **number** (bukan string) karena ada transformer pada entity.

**Error**

| Status | Kondisi | Contoh pesan |
| --- | --- | --- |
| `400` | Validasi gagal / `categoryId`/`supplierId` bukan UUID / field asing | array pesan validasi |
| `404` | Kategori atau supplier tidak ditemukan | `Kategori dengan ID <uuid> tidak ditemukan` |
| `409` | SKU sudah terdaftar | `Produk dengan SKU PRD-ELK-001 sudah terdaftar` |

### 9.2 GET `/products`

Menampilkan semua produk beserta relasi `category` dan `supplier`, diurutkan berdasarkan `id ASC`.

### 9.3 GET `/products/:id/stock-info`

Rekap stok dan histori transaksi produk.

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request berhasil",
  "data": {
    "productId": "8a81c1a6-d313-47a3-ba78-88a8cb81fb9d",
    "sku": "PRD-ELK-001",
    "name": "Mechanical Keyboard",
    "unit": "unit",
    "totalIn": 50,
    "totalOut": 15,
    "currentStock": 35,
    "calculatedStock": 35,
    "transactionHistory": [
      {
        "id": "19275ecf-0e8c-4d73-9798-cb8d3c6a03d5",
        "stockMovementId": "4c59b918-eb34-4c38-811e-59219f7401b1",
        "productId": "8a81c1a6-d313-47a3-ba78-88a8cb81fb9d",
        "quantity": 50,
        "remarks": "Kondisi baik",
        "stockMovement": {
          "id": "4c59b918-eb34-4c38-811e-59219f7401b1",
          "referenceNumber": "TRX-IN-2026001",
          "type": "IN",
          "movementDate": "2026-11-09",
          "notes": "Pengadaan stok awal",
          "warehouseId": "40905ef0-51e3-49c6-a989-bba4b850f017",
          "warehouse": {
            "id": "40905ef0-51e3-49c6-a989-bba4b850f017",
            "code": "WH-JKT-01",
            "name": "Gudang Utama Jakarta",
            "location": "Blok A No. 12",
            "capacity": 5000,
            "createdAt": "2026-11-08T23:12:51.690Z",
            "updatedAt": "2026-11-08T23:12:51.690Z",
            "deletedAt": null
          },
          "createdAt": "2026-11-08T23:12:51.737Z",
          "updatedAt": "2026-11-08T23:12:51.737Z",
          "deletedAt": null
        },
        "createdAt": "2026-11-08T23:12:51.765Z",
        "updatedAt": "2026-11-08T23:12:51.765Z",
        "deletedAt": null
      }
    ]
  }
}
```

| Field | Keterangan |
| --- | --- |
| `totalIn` | Jumlah seluruh item pada transaksi `IN` aktif |
| `totalOut` | Jumlah seluruh item pada transaksi `OUT` aktif |
| `currentStock` | Nilai `currentStock` yang tersimpan di produk |
| `calculatedStock` | `totalIn - totalOut` (hasil hitung ulang dari histori) |
| `transactionHistory` | Semua item transaksi aktif beserta dokumen & gudang |

Pada kondisi normal, `currentStock` **harus sama** dengan `calculatedStock`.

### 9.4 GET `/products/:id`

Detail produk beserta relasi `category` dan `supplier`.

**Response `200 OK`** (ringkas)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request berhasil",
  "data": {
    "id": "8a81c1a6-d313-47a3-ba78-88a8cb81fb9d",
    "sku": "PRD-ELK-001",
    "name": "Mechanical Keyboard",
    "unit": "unit",
    "price": 750000,
    "currentStock": 35,
    "categoryId": "e68a0cc7-a240-48e5-8b47-82649ced97fd",
    "supplierId": "ca49240e-cf30-41b2-b340-a132e4f008f8",
    "category": { "id": "...", "name": "Elektronik" },
    "supplier": { "id": "...", "name": "PT Sumber Teknologi" },
    "createdAt": "2026-11-08T23:12:51.719Z",
    "updatedAt": "2026-11-08T23:12:51.787Z",
    "deletedAt": null
  }
}
```

### 9.5 PATCH `/products/:id`

Update parsial; semua field opsional dengan aturan sama seperti create.
Jika `categoryId`/`supplierId` berubah, relasi tujuan harus ada (`404` jika tidak).
Jika `sku` berubah dan sudah dipakai produk lain → `409`.

**Response `200 OK`** — objek produk terbaru.
**Catatan:** `currentStock` tidak dapat diubah lewat PATCH product; nilainya hanya berubah melalui transaksi stok.

### 9.6 DELETE `/products/:id`

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request berhasil",
  "data": {
    "message": "Produk Mechanical Keyboard berhasil dihapus"
  }
}
```

---

## 10. Stock Movements (Dokumen Transaksi)

`type` hanya menerima `IN` (barang masuk) atau `OUT` (barang keluar).

### 10.1 POST `/stock-movements`

**Body**

| Field | Tipe | Wajib | Aturan |
| --- | --- | --- | --- |
| `referenceNumber` | string | ✅ | Tidak kosong, maksimal 50 karakter, **unik** |
| `type` | enum | ✅ | `IN` atau `OUT` (case-sensitive) |
| `movementDate` | string | ✅ | Tanggal valid format ISO `YYYY-MM-DD` |
| `warehouseId` | UUID | ✅ | Gudang harus ada |
| `notes` | string | ❌ | Teks bebas |

**Request**

```json
{
  "referenceNumber": "TRX-IN-2026001",
  "type": "IN",
  "movementDate": "2026-11-07",
  "warehouseId": "40905ef0-51e3-49c6-a989-bba4b850f017",
  "notes": "Pengadaan stok awal dari supplier"
}
```

**Response `201 Created`**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Request berhasil",
  "data": {
    "id": "4c59b918-eb34-4c38-811e-59219f7401b1",
    "referenceNumber": "TRX-IN-2026001",
    "type": "IN",
    "movementDate": "2026-11-07",
    "notes": "Pengadaan stok awal dari supplier",
    "warehouseId": "40905ef0-51e3-49c6-a989-bba4b850f017",
    "createdAt": "2026-11-08T23:12:51.737Z",
    "updatedAt": "2026-11-08T23:12:51.737Z",
    "deletedAt": null
  }
}
```

**Error**

| Status | Kondisi | Contoh pesan |
| --- | --- | --- |
| `400` | `type` selain IN/OUT | `Tipe transaksi harus IN (Barang Masuk) atau OUT (Barang Keluar)` |
| `400` | Tanggal tidak valid / field asing | array pesan validasi |
| `404` | Gudang tidak ditemukan | `Gudang dengan ID <uuid> tidak ditemukan` |
| `409` | Referensi duplikat | `Nomor referensi TRX-IN-2026001 sudah terdaftar` |

### 10.2 GET `/stock-movements`

Menampilkan semua transaksi beserta `warehouse` dan `items[].product`, diurutkan `movementDate DESC, id DESC`.

**Query opsional**

| Query | Nilai | Keterangan |
| --- | --- | --- |
| `type` | `IN` / `OUT` | Filter jenis transaksi |

```
GET /stock-movements?type=IN
```

Jika `type` bukan `IN`/`OUT` (termasuk huruf kecil `in`) → `400` dengan pesan:
`Filter tipe transaksi harus IN (Barang Masuk) atau OUT (Barang Keluar)`.

### 10.3 GET `/stock-movements/:id`

Detail transaksi beserta relasi `warehouse` dan `items[].product`.

**Response `200 OK`** (ringkas)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request berhasil",
  "data": {
    "id": "4c59b918-eb34-4c38-811e-59219f7401b1",
    "referenceNumber": "TRX-IN-2026001",
    "type": "IN",
    "movementDate": "2026-11-07",
    "notes": "Pengadaan stok awal dari supplier",
    "warehouseId": "40905ef0-51e3-49c6-a989-bba4b850f017",
    "warehouse": {
      "id": "40905ef0-51e3-49c6-a989-bba4b850f017",
      "code": "WH-JKT-01",
      "name": "Gudang Utama Jakarta",
      "location": "Blok A No. 12",
      "capacity": 5000,
      "createdAt": "2026-11-08T23:12:51.690Z",
      "updatedAt": "2026-11-08T23:12:51.690Z",
      "deletedAt": null
    },
    "items": [
      {
        "id": "19275ecf-0e8c-4d73-9798-cb8d3c6a03d5",
        "stockMovementId": "4c59b918-eb34-4c38-811e-59219f7401b1",
        "productId": "8a81c1a6-d313-47a3-ba78-88a8cb81fb9d",
        "quantity": 50,
        "remarks": "Kondisi baik",
        "product": {
          "id": "8a81c1a6-d313-47a3-ba78-88a8cb81fb9d",
          "sku": "PRD-ELK-001",
          "name": "Mechanical Keyboard",
          "unit": "unit",
          "price": 750000,
          "currentStock": 35,
          "categoryId": "e68a0cc7-a240-48e5-8b47-82649ced97fd",
          "supplierId": "ca49240e-cf30-41b2-b340-a132e4f008f8",
          "createdAt": "2026-11-08T23:12:51.719Z",
          "updatedAt": "2026-11-08T23:12:51.787Z",
          "deletedAt": null
        },
        "createdAt": "2026-11-08T23:12:51.765Z",
        "updatedAt": "2026-11-08T23:12:51.765Z",
        "deletedAt": null
      }
    ],
    "createdAt": "2026-11-08T23:12:51.737Z",
    "updatedAt": "2026-11-08T23:12:51.737Z",
    "deletedAt": null
  }
}
```

| Status | Kondisi | Contoh pesan |
| --- | --- | --- |
| `404` | Tidak ada | `Transaksi stok dengan ID <uuid> tidak ditemukan` |

### 10.4 PATCH `/stock-movements/:id`

Update parsial: `referenceNumber`, `type`, `movementDate`, `warehouseId`, `notes`.

**Aturan khusus:**

- Jika `type` diubah `IN ↔ OUT`, **seluruh item** pada transaksi ikut berubah arah, lalu stok semua produk terkait dihitung ulang.
- Jika perubahan tipe menyebabkan stok produk menjadi negatif, seluruh perubahan dibatalkan (`rollback`) dan `400` dikembalikan dengan pesan:
  `Tipe transaksi tidak dapat diubah karena stok produk terkait tidak mencukupi`
- `referenceNumber` baru harus unik (`409`), `warehouseId` baru harus ada (`404`).

**Request**

```json
{ "notes": "Catatan diperbarui" }
```

**Response `200 OK`** — objek transaksi terbaru beserta `warehouse` dan `items`.

### 10.5 DELETE `/stock-movements/:id`

Soft delete transaksi **beserta seluruh item-nya** (cascade soft-remove), lalu stok semua produk terkait dihitung ulang.

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request berhasil",
  "data": {
    "message": "Transaksi stok TRX-IN-2026001 berhasil dihapus"
  }
}
```

**Error `400`** — jika penghapusan membuat stok produk negatif (mis. transaksi `IN` yang stoknya sudah terpakai transaksi `OUT`):
`Transaksi stok tidak dapat dihapus karena stok dari transaksi masuk sudah terpakai pada transaksi keluar`

---

## 11. Stock Movement Items (Barang per Transaksi)

Setiap item menambah/mengurangi stok produk sesuai `type` dokumen transaksinya.

### 11.1 POST `/stock-movement-items`

**Body**

| Field | Tipe | Wajib | Aturan |
| --- | --- | --- | --- |
| `stockMovementId` | UUID | ✅ | Dokumen transaksi harus ada |
| `productId` | UUID | ✅ | Produk harus ada |
| `quantity` | integer | ✅ | Minimal `1` |
| `remarks` | string | ❌ | Teks bebas |

**Request**

```json
{
  "stockMovementId": "4c59b918-eb34-4c38-811e-59219f7401b1",
  "productId": "8a81c1a6-d313-47a3-ba78-88a8cb81fb9d",
  "quantity": 50,
  "remarks": "Kondisi segel baik"
}
```

**Response `201 Created`**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Request berhasil",
  "data": {
    "id": "19275ecf-0e8c-4d73-9798-cb8d3c6a03d5",
    "stockMovementId": "4c59b918-eb34-4c38-811e-59219f7401b1",
    "productId": "8a81c1a6-d313-47a3-ba78-88a8cb81fb9d",
    "quantity": 50,
    "remarks": "Kondisi segel baik",
    "createdAt": "2026-11-08T23:12:51.765Z",
    "updatedAt": "2026-11-08T23:12:51.765Z",
    "deletedAt": null
  }
}
```

**Error**

| Status | Kondisi | Contoh pesan |
| --- | --- | --- |
| `400` | `quantity` < 1 | `Kuantitas barang minimal 1` |
| `400` | Transaksi `OUT` melebihi stok | `Stok produk "Mechanical Keyboard" tidak mencukupi. Stok tersedia: 35, diminta: 100` |
| `404` | Dokumen transaksi tidak ada | `Transaksi stok ID <uuid> tidak ditemukan` |
| `404` | Produk tidak ada | `Produk ID <uuid> tidak ditemukan` |

### 11.2 GET `/stock-movement-items`

Menampilkan semua item beserta `stockMovement` dan `product`.

### 11.3 GET `/stock-movement-items/:id`

Detail item beserta `stockMovement` dan `product`.

| Status | Kondisi | Contoh pesan |
| --- | --- | --- |
| `404` | Tidak ada / sudah dihapus | `Detail item transaksi ID <uuid> tidak ditemukan` |

### 11.4 PATCH `/stock-movement-items/:id`

Update parsial: `stockMovementId`, `productId`, `quantity`, `remarks`.

**Aturan khusus:**

- Item boleh dipindah ke dokumen transaksi lain (`stockMovementId`) dan/atau produk lain (`productId`).
- Stok **produk lama dan produk baru** (jika berpindah) dihitung ulang.
- Jika hasilnya negatif, seluruh perubahan dibatalkan dan `400`:
  `Stok produk tidak mencukupi untuk pembaruan item transaksi`

**Request**

```json
{ "quantity": 20 }
```

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request berhasil",
  "data": {
    "id": "19275ecf-0e8c-4d73-9798-cb8d3c6a03d5",
    "stockMovementId": "4c59b918-eb34-4c38-811e-59219f7401b1",
    "productId": "8a81c1a6-d313-47a3-ba78-88a8cb81fb9d",
    "quantity": 20,
    "remarks": "Kondisi segel baik",
    "stockMovement": { "...": "objek dokumen transaksi" },
    "product": { "...": "objek produk dengan currentStock terbaru" },
    "createdAt": "2026-11-08T23:12:51.765Z",
    "updatedAt": "2026-11-08T23:12:51.868Z",
    "deletedAt": null
  }
}
```

### 11.5 DELETE `/stock-movement-items/:id`

Soft delete item, lalu stok produk dihitung ulang.

**Response `200 OK`**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request berhasil",
  "data": {
    "message": "Item transaksi ID 3c2e8c86-4d48-4d0c-a2fe-c3c50934802f berhasil dihapus dan stok produk telah diperbarui"
  }
}
```

**Error `400`** — jika penghapusan item `IN` membuat stok minus:
`Item barang masuk tidak dapat dihapus karena stok tersebut sudah terpakai di transaksi keluar`

---

## 12. Aturan Bisnis Stok

1. **Stok adalah turunan histori.** `currentStock` dihitung ulang dari seluruh item transaksi aktif:
   `currentStock = Σ quantity(IN) − Σ quantity(OUT)`.
2. **Create product** selalu `currentStock = 0`. Field ini tidak boleh diisi manual.
3. **Item `IN`** menambah stok, **item `OUT`** mengurangi stok.
4. **Stok tidak boleh negatif.** Setiap operasi yang menghasilkan stok < 0 ditolak `400` dan transaksi database di-`rollback`.
5. **Operasi yang memicu hitung ulang stok:**
   - create / update / delete item transaksi;
   - update tipe transaksi (`IN ↔ OUT`);
   - delete transaksi (cascade ke item).
6. **Perpindahan item** ke produk lain menghitung ulang stok produk asal dan tujuan.
7. **Soft delete** menjaga integritas data: item/transaksi yang dihapus tidak dihitung lagi, tetapi baris tetap ada di database.

---

## 13. Postman Collection

### 13.1 File

| File | Fungsi |
| --- | --- |
| `docs/postman/Inventory-Management-Complete.postman_collection.json` | **Koleksi utama** — 69 request, 9 folder, mencakup CRUD, validasi, alur stok, dan cleanup |
| `docs/postman/Inventory-Management-Local.postman_environment.json` | Environment opsional, berisi `baseUrl` |

### 13.2 Cara Import

1. Jalankan database & server (`docker compose up -d`, `npm run start:dev`).
2. Buka Postman → **Import**.
3. Pilih file `docs/postman/Inventory-Management-Complete.postman_collection.json`.
4. (Opsional) Import juga `Inventory-Management-Local.postman_environment.json`, lalu pilih environment **Inventory Management - Local**.
5. Jika tidak memakai environment, collection sudah memiliki variabel `baseUrl` default `http://localhost:3000`.

### 13.3 Cara Menjalankan

- **Satu per satu:** buka request lalu klik **Send**. Jalankan berurutan dari folder `0` agar UUID hasil create tersimpan otomatis.
- **Sekaligus:** klik kanan collection → **Run collection** → **Run**. Urutan folder harus `0 → 8`.

### 13.4 Variabel Otomatis

Koleksi menyimpan UUID hasil create ke collection variable, sehingga tidak perlu copy-paste:

| Variabel | Diisi oleh |
| --- | --- |
| `runId` | `0.1 GET /` (selalu dibuat baru setiap run) |
| `categoryId` | `1.1 POST /categories` |
| `supplierId` | `2.1 POST /suppliers` |
| `warehouseId` | `3.1 POST /warehouses` |
| `productId` | `4.1 POST /products` |
| `movementInId` | `5.1 POST /stock-movements` (IN) |
| `movementOutId` | `5.2 POST /stock-movements` (OUT) |
| `itemInId` | `6.1 POST /stock-movement-items` (IN) |
| `itemOutId` | `6.3 POST /stock-movement-items` (OUT) |

`{{runId}}` membuat nama/SKU/email/referensi selalu unik, sehingga koleksi **aman dijalankan berulang** tanpa reset database. Folder `8. Cleanup` menghapus seluruh data uji (soft delete).

### 13.5 Menjalankan dengan Newman (CLI)

```bash
npx --yes newman run "docs/postman/Inventory-Management-Complete.postman_collection.json" \
  --env-var baseUrl=http://localhost:3000 \
  --reporters cli
```

Hasil validasi terakhir: **69 request, 162 assertion, 0 failure**.

### 13.6 Struktur Folder Koleksi

| Folder | Isi |
| --- | --- |
| `0. Persiapan & Cek Server` | Health check & membuat `runId` baru |
| `1. Categories` | CRUD + uji duplikat (`409`) |
| `2. Suppliers` | CRUD + uji email duplikat (`409`) |
| `3. Warehouses` | CRUD + uji kode duplikat (`409`) |
| `4. Products` | CRUD + stock-info + uji SKU duplikat (`409`) |
| `5. Stock Movements` | Dokumen IN/OUT, filter `?type=`, PATCH, validasi |
| `6. Stock Movement Items` | Alur stok otomatis, rollback, PATCH qty, DELETE item |
| `7. Validasi Tambahan & Error` | UUID salah, 404, route tidak ada, DTO invalid, JSON rusak |
| `8. Cleanup` | Soft delete seluruh data uji |

---

## 14. Catatan & Troubleshooting

| Gejala | Penyebab umum | Solusi |
| --- | --- | --- |
| `ECONNREFUSED` | Server belum berjalan | `npm run start:dev` |
| `500` saat start | Database belum siap / env salah | `docker compose up -d`, cek `.env` |
| `400` “property X should not exist” | Mengirim field di luar DTO | Hapus field tersebut (`whitelist` + `forbidNonWhitelisted`) |
| `409` saat menjalankan ulang Postman | Data unik sudah ada | Jalankan `0.1 GET /` agar `runId` baru terbentuk, atau truncate data uji |
| `400` “Stok ... tidak mencukupi” | Operasi `OUT`/update melebihi stok | Kurangi `quantity` atau tambah transaksi `IN` |
| `404` setelah DELETE | Soft delete | Data memang sudah dihapus; buat data baru |

Perintah bantuan untuk mereset data uji:

```bash
# Hapus semua data (hati-hati, hanya untuk development)
docker exec -i inventory_management_postgres psql -U IMSPostgre -d db-IMSPostgre \
  -c "TRUNCATE TABLE stock_movement_items, stock_movements, products, categories, suppliers, warehouses CASCADE;"
```

---

## 15. Ringkasan Method per Modul

| Modul | POST | GET All | GET By ID | PATCH | DELETE | Endpoint tambahan |
| --- | :---: | :---: | :---: | :---: | :---: | --- |
| Categories | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Suppliers | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Warehouses | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Products | ✅ | ✅ | ✅ | ✅ | ✅ | `GET /:id/stock-info` |
| Stock Movements | ✅ | ✅ | ✅ | ✅ | ✅ | Filter `?type=IN\|OUT` |
| Stock Movement Items | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Health | — | ✅ | — | — | — | `GET /` |
