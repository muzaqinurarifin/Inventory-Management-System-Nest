# 📦 Backend Sistem Pengelolaan Persediaan Barang (Inventory Management API)

Proyek ini disusun untuk memenuhi Ujian Tengah Semester (UTS) mata kuliah **Framework Programming**. Aplikasi ini merupakan RESTful API berbasis **NestJS** untuk mengelola data inventaris gudang, mencakup manajemen produk, kategori, pemasok, gudang penyimpanan, serta pencatatan transaksi keluar-masuk barang beserta perhitungan stok otomatis.

## 👥 Anggota Kelompok Capstone
* **[Intan Tri Hartati]** - [24090039]
* **[Muhammad Hammam Ghazi]** - [24090056]
* **[Muhammad Zaim El Yafi]** - [24090064]
* **[Muzaqi Nur Arifin]** - [24090132]

---

## 🛠️ Teknologi yang Digunakan
* **Framework:** NestJS (Node.js & TypeScript)
* **Database:** PostgreSQL 16 (Berjalan di atas Docker Container)
* **ORM:** TypeORM
* **Validasi Input & DTO:** `class-validator`, `class-transformer`, `@nestjs/mapped-types`
* **Validasi Environment:** `@nestjs/config` & `joi`
* **API Testing:** Postman / REST client lain (koleksi Postman tersedia di [`docs/postman`](docs/postman))

---

## 🎁 Fitur Bonus (Tambahan)

Di luar kebutuhan utama UTS, proyek ini menambahkan **dua fitur bonus** sebagai berikut:

1. **Global Response Interceptor** — `src/interceptors/transform-response/transform-response.interceptor.ts`
   * Membungkus seluruh response API ke dalam format standar yang konsisten:
     ```json
     {
       "success": true,
       "statusCode": 200,
       "message": "Request berhasil",
       "data": { }
     }
     ```
   * Didaftarkan secara global melalui `app.useGlobalInterceptors(...)` di `src/main.ts`.

2. **Logger Middleware** — `src/middlewares/simple-logger/simple-logger.middleware.ts`
   * Mencatat setiap request yang masuk ke console, termasuk method dan URL:
     ```text
     Request Masuk method: GET, URL: /categories
     ```
   * Didaftarkan untuk semua route melalui `configure()` pada `AppModule` di `src/app.module.ts`.

Kedua fitur ini bersifat **tambahan (bonus)** dan tidak mengubah aturan bisnis utama aplikasi.

---

## 📂 Struktur Folder Proyek
Aplikasi ini menerapkan arsitektur modular sesuai standar NestJS, di mana setiap entitas memiliki `Module`, `Controller`, `Service`, `DTO`, dan `Entity` masing-masing:

```text
src/
├── categories/
│   ├── dto/
│   ├── entities/
│   ├── categories.controller.ts
│   ├── categories.module.ts
│   └── categories.service.ts
├── suppliers/
│   ├── dto/
│   ├── entities/
│   ├── suppliers.controller.ts
│   ├── suppliers.module.ts
│   └── suppliers.service.ts
├── warehouses/
│   ├── dto/
│   ├── entities/
│   ├── warehouses.controller.ts
│   ├── warehouses.module.ts
│   └── warehouses.service.ts
├── products/
│   ├── dto/
│   ├── entities/
│   ├── products.controller.ts
│   ├── products.module.ts
│   └── products.service.ts
├── stock-movements/
│   ├── dto/
│   ├── entities/
│   ├── stock-movements.controller.ts
│   ├── stock-movements.module.ts
│   └── stock-movements.service.ts
├── stock-movement-items/
│   ├── dto/
│   ├── entities/
│   ├── stock-movement-items.controller.ts
│   ├── stock-movement-items.module.ts
│   └── stock-movement-items.service.ts
├── common/
│   ├── assign-defined.ts       # partial update aman (hanya field yang dikirim)
│   └── stock-calculator.ts     # hitung & sinkronisasi stok dari histori transaksi
├── interceptors/
│   └── transform-response/
│       └── transform-response.interceptor.ts
├── middlewares/
│   └── simple-logger/
│       └── simple-logger.middleware.ts
├── app.module.ts
└── main.ts
```

---

## 🗄️ Desain Database & Entity Relationship Diagram (ERD)

### Visualisasi ERD
```mermaid
erDiagram
    CATEGORIES ||--o{ PRODUCTS : "memiliki (1:N)"
    SUPPLIERS ||--o{ PRODUCTS : "memasok (1:N)"
    WAREHOUSES ||--o{ STOCK_MOVEMENTS : "mencatat (1:N)"
    STOCK_MOVEMENTS ||--|{ STOCK_MOVEMENT_ITEMS : "memuat detail (1:N)"
    PRODUCTS ||--o{ STOCK_MOVEMENT_ITEMS : "tercatat pada (1:N)"

    CATEGORIES {
        uuid id PK
        varchar name UK
        text description
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }

    SUPPLIERS {
        uuid id PK
        varchar name
        varchar contactPerson
        varchar phone
        varchar email UK
        text address
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }

    WAREHOUSES {
        uuid id PK
        varchar code UK
        varchar name
        text location
        int capacity
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }

    PRODUCTS {
        uuid id PK
        varchar sku UK
        varchar name
        varchar unit
        decimal price
        int currentStock
        uuid category_id FK
        uuid supplier_id FK
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }

    STOCK_MOVEMENTS {
        uuid id PK
        varchar referenceNumber UK
        enum type "IN | OUT"
        date movementDate
        text notes
        uuid warehouse_id FK
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }

    STOCK_MOVEMENT_ITEMS {
        uuid id PK
        uuid stock_movement_id FK
        uuid product_id FK
        int quantity
        text remarks
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }
```

### Penjelasan Relasi Antartabel
1. **Categories -> Products (`1:N`):** Satu kategori dapat menaungi banyak produk, sedangkan satu produk terikat pada satu kategori.
2. **Suppliers -> Products (`1:N`):** Satu pemasok dapat menyuplai banyak produk.
3. **Warehouses -> StockMovements (`1:N`):** Satu gudang dapat memiliki banyak dokumen transaksi pergerakan stok.
4. **StockMovements -> StockMovementItems (`1:N`):** Satu transaksi pergerakan stok dapat memuat banyak baris item barang.
5. **Products -> StockMovementItems (`1:N`):** Satu produk dapat muncul di banyak detail transaksi pergerakan stok.

---

## ⚙️ Aturan Bisnis & Mekanisme Perhitungan Stok

Stok produk (`currentStock`) tidak lagi ditambah/dikurangi secara manual. Nilai stok selalu **dihitung ulang dari histori transaksi** yang masih aktif melalui helper `src/common/stock-calculator.ts`:

* `calculateProductStock()` menjumlahkan seluruh item pada transaksi `IN` lalu mengurangkan seluruh item pada transaksi `OUT`.
* `syncProductStock()` menyimpan hasil perhitungan ke `products.currentStock`. Jika hasilnya negatif, seluruh transaksi database dibatalkan (*rollback*) dan API mengembalikan **`400 Bad Request`**.

Dengan pendekatan ini, `currentStock` selalu konsisten dengan histori transaksi, termasuk ketika item diubah, dipindahkan, atau dihapus.

1. **Inisialisasi Stok Awal:** Setiap produk baru yang didaftarkan melalui `POST /products` memiliki nilai stok awal (`currentStock = 0`).
2. **Transaksi Barang Masuk (`IN`):**
   * Saat item ditambahkan ke transaksi bertipe `IN`, stok produk dihitung ulang dan bertambah sesuai kuantitas item.
3. **Transaksi Barang Keluar (`OUT`):**
   * Ketersediaan stok divalidasi dari **histori transaksi**, bukan hanya angka `currentStock` yang tersimpan.
   * Apabila stok tersedia < `quantity`, sistem menolak transaksi dengan **`400 Bad Request`** agar stok tidak bernilai negatif.
4. **Perubahan Item Transaksi (`PATCH /stock-movement-items/:id`):**
   * Item dapat diubah kuantitas/catatannya, dipindahkan ke dokumen transaksi lain (`stockMovementId`), atau dipindahkan ke produk lain (`productId`).
   * Stok produk lama dan produk baru (jika berpindah) dihitung ulang. Jika perubahan membuat stok negatif, perubahan ditolak **`400 Bad Request`**.
5. **Penghapusan Item Transaksi (`DELETE /stock-movement-items/:id`):**
   * Item di-*soft delete*, lalu stok produk terkait dihitung ulang. Penghapusan ditolak `400` jika stok dari barang masuk sudah terpakai pada transaksi keluar.
6. **Perubahan Tipe Transaksi (`PATCH /stock-movements/:id`):**
   * Mengubah tipe `IN` ↔ `OUT` akan membalik arah seluruh item pada transaksi tersebut.
   * Stok semua produk terkait dihitung ulang. Jika ada produk yang stoknya menjadi negatif, perubahan ditolak **`400 Bad Request`**.
7. **Penghapusan Dokumen Transaksi (`DELETE /stock-movements/:id`):**
   * Dokumen transaksi beserta seluruh item-nya di-*soft delete*, lalu stok semua produk terkait dihitung ulang.
   * Penghapusan ditolak `400` apabila stok dari transaksi masuk sudah terpakai oleh transaksi keluar.
8. **Soft Delete:**
   * Operasi `DELETE` mengisi `deletedAt` tanpa menghapus baris secara permanen. Query TypeORM biasa tidak menyertakan data yang sudah dihapus.
9. **Validasi Filter Transaksi:**
   * Query `?type=` pada `GET /stock-movements` divalidasi dengan DTO. Nilai selain `IN` atau `OUT` menghasilkan **`400 Bad Request`**.
10. **Tipe Data Harga:**
    * Kolom `price` menggunakan *transformer* sehingga PostgreSQL `decimal` selalu dikembalikan sebagai `number` pada response API, bukan string.
11. **Partial Update Aman:**
    * Helper `assignDefined()` hanya menyalin field yang benar-benar dikirim pada `PATCH`, sehingga properti yang tidak disertakan tidak menimpa nilai entity menjadi `undefined`.
12. **Validasi Uniqueness saat Update:**
    * `PATCH` pada kategori (`name`), pemasok (`email`), dan gudang (`code`) mengecek duplikasi dan mengembalikan **`409 Conflict`** jika nilai sudah dipakai data lain.

---

## 🚀 Panduan Instalasi & Konfigurasi

### 1. Prasyarat Sistem
Pastikan perangkat telah terinstal:
* **Node.js** (v18 atau lebih baru)
* **Docker Desktop** (untuk menjalankan database PostgreSQL)
* **Postman** (untuk pengujian endpoint API)

### 2. Instalasi Dependensi
Clone repositori ini dan instal seluruh paket yang dibutuhkan:
```bash
npm install
```

### 3. Konfigurasi Environment (`.env`)
Buat file bernama **`.env`** di direktori utama (*root folder* sejajar dengan `package.json`). Jangan commit file ini karena berisi konfigurasi lokal dan kredensial database. Contoh:

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=ganti_dengan_password_lokal
DB_DATABASE=apifirstnestjs
```

### 4. Menjalankan Database PostgreSQL dengan Docker
Jalankan *container* database PostgreSQL di latar belakang menggunakan Docker Compose:
```bash
docker compose up -d
```

### 5. Menjalankan Aplikasi Backend NestJS
Jalankan server dalam mode *development (watch mode)*:
```bash
npm run start:dev
```
Aplikasi akan berjalan di **`http://localhost:3000`**. Tabel-tabel database akan otomatis dibuat oleh TypeORM (`synchronize: true`).
Untuk penggunaan lokal, nilai `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, dan `DB_PORT` harus cocok dengan konfigurasi Docker Compose. `DB_HOST=localhost` digunakan karena aplikasi dijalankan langsung di host, bukan di dalam container.

---

## 📡 API Specification

Base URL: `http://localhost:3000`

Semua primary key dan foreign key menggunakan UUID. Gunakan ID yang dikembalikan oleh API untuk mengisi parameter `:id` dan field relasi seperti `categoryId`, `supplierId`, `warehouseId`, `stockMovementId`, serta `productId`. Contoh UUID di bawah hanya placeholder.

Semua endpoint `DELETE` melakukan *soft delete*: data ditandai melalui `deletedAt`, bukan dihapus permanen. Data terhapus tidak muncul pada query biasa; API saat ini belum menyediakan endpoint untuk memulihkannya.

### 1. Modul Categories (`/categories`)
| Method | Endpoint | Deskripsi | Status Code |
| :--- | :--- | :--- | :--- |
| `POST` | `/categories` | Membuat kategori produk baru | `201 Created`, `409 Conflict` |
| `GET` | `/categories` | Menampilkan seluruh kategori beserta daftar produknya | `200 OK` |
| `GET` | `/categories/:id` | Menampilkan detail satu kategori berdasarkan ID | `200 OK`, `404 Not Found` |
| `PATCH` | `/categories/:id` | Memperbarui data kategori (nama duplikat ditolak) | `200 OK`, `404 Not Found`, `409 Conflict` |
| `DELETE` | `/categories/:id` | Melakukan *soft delete* kategori | `200 OK`, `404 Not Found` |

**Contoh Request Body (`POST /categories`):**
```json
{
  "name": "Elektronik & Perangkat",
  "description": "Komponen dan perangkat keras komputer"
}
```

---

### 2. Modul Suppliers (`/suppliers`)
| Method | Endpoint | Deskripsi | Status Code |
| :--- | :--- | :--- | :--- |
| `POST` | `/suppliers` | Mendaftarkan pemasok baru | `201 Created`, `409 Conflict` |
| `GET` | `/suppliers` | Menampilkan seluruh daftar pemasok | `200 OK` |
| `GET` | `/suppliers/:id` | Menampilkan detail pemasok berdasarkan ID | `200 OK`, `404 Not Found` |
| `PATCH` | `/suppliers/:id` | Memperbarui informasi pemasok (email duplikat ditolak) | `200 OK`, `404 Not Found`, `409 Conflict` |
| `DELETE` | `/suppliers/:id` | Melakukan *soft delete* pemasok | `200 OK`, `404 Not Found` |

**Contoh Request Body (`POST /suppliers`):**
```json
{
  "name": "PT Sumber Teknologi Jaya",
  "contactPerson": "Budi Raharjo",
  "phone": "081234567890",
  "email": "sales@sumbertekno.co.id",
  "address": "Kawasan Industri Pulogadung, Jakarta"
}
```

---

### 3. Modul Warehouses (`/warehouses`)
| Method | Endpoint | Deskripsi | Status Code |
| :--- | :--- | :--- | :--- |
| `POST` | `/warehouses` | Membuat data gudang penyimpanan baru | `201 Created`, `409 Conflict` |
| `GET` | `/warehouses` | Menampilkan daftar seluruh gudang | `200 OK` |
| `GET` | `/warehouses/:id` | Menampilkan detail gudang beserta riwayat transaksinya | `200 OK`, `404 Not Found` |
| `PATCH` | `/warehouses/:id` | Memperbarui data gudang (kode duplikat ditolak) | `200 OK`, `404 Not Found`, `409 Conflict` |
| `DELETE` | `/warehouses/:id` | Melakukan *soft delete* gudang | `200 OK`, `404 Not Found` |

**Contoh Request Body (`POST /warehouses`):**
```json
{
  "code": "GDG-UTR-01",
  "name": "Gudang Utama Utara",
  "location": "Blok A No. 12",
  "capacity": 5000
}
```

---

### 4. Modul Products (`/products`)
| Method | Endpoint | Deskripsi | Status Code |
| :--- | :--- | :--- | :--- |
| `POST` | `/products` | Menambahkan produk baru (stok awal = 0) | `201 Created`, `404 Not Found`, `409 Conflict` |
| `GET` | `/products` | Menampilkan seluruh produk beserta kategori & pemasok | `200 OK` |
| `GET` | `/products/:id` | Menampilkan detail produk berdasarkan ID | `200 OK`, `404 Not Found` |
| `GET` | `/products/:id/stock-info` | **Fitur Khusus:** Menampilkan rekap stok (`totalIn`, `totalOut`, `currentStock`, `calculatedStock`) & histori transaksi produk | `200 OK`, `404 Not Found` |
| `PATCH` | `/products/:id` | Memperbarui informasi produk (SKU duplikat ditolak) | `200 OK`, `404 Not Found`, `409 Conflict` |
| `DELETE` | `/products/:id` | Melakukan *soft delete* produk | `200 OK`, `404 Not Found` |

**Contoh Request Body (`POST /products`):**
```json
{
  "sku": "PRD-MCH-001",
  "name": "Mechanical Keyboard Wireless",
  "unit": "unit",
  "price": 750000,
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "supplierId": "550e8400-e29b-41d4-a716-446655440001"
}
```

---

### 5. Modul Stock Movements (`/stock-movements`)
| Method | Endpoint | Deskripsi | Status Code |
| :--- | :--- | :--- | :--- |
| `POST` | `/stock-movements` | Membuat dokumen transaksi pergerakan stok (`IN` / `OUT`) | `201 Created`, `404 Not Found`, `409 Conflict` |
| `GET` | `/stock-movements` | Menampilkan semua transaksi (filter `?type=IN` / `?type=OUT`, nilai lain ditolak) | `200 OK`, `400 Bad Request` |
| `GET` | `/stock-movements/:id` | Menampilkan detail transaksi beserta rincian item barangnya | `200 OK`, `404 Not Found` |
| `PATCH` | `/stock-movements/:id` | Memperbarui dokumen transaksi; perubahan tipe `IN` ↔ `OUT` menghitung ulang stok produk | `200 OK`, `400 Bad Request`, `404 Not Found`, `409 Conflict` |
| `DELETE` | `/stock-movements/:id` | *Soft delete* dokumen beserta item terkait lalu menghitung ulang stok produk | `200 OK`, `400 Bad Request`, `404 Not Found` |

**Contoh Request Body (`POST /stock-movements`):**
```json
{
  "referenceNumber": "TRX-IN-20261101",
  "type": "IN",
  "movementDate": "2026-11-07",
  "warehouseId": "550e8400-e29b-41d4-a716-446655440002",
  "notes": "Pengadaan stok awal dari supplier"
}
```

---

### 6. Modul Stock Movement Items (`/stock-movement-items`)
| Method | Endpoint | Deskripsi | Status Code |
| :--- | :--- | :--- | :--- |
| `POST` | `/stock-movement-items` | Menambahkan item produk ke transaksi & menghitung ulang stok produk | `201 Created`, `400 Bad Request`, `404 Not Found` |
| `GET` | `/stock-movement-items` | Menampilkan seluruh item detail transaksi | `200 OK` |
| `GET` | `/stock-movement-items/:id` | Menampilkan detail satu item transaksi | `200 OK`, `404 Not Found` |
| `PATCH` | `/stock-movement-items/:id` | Mengubah kuantitas/catatan, memindahkan item ke transaksi/produk lain, lalu menghitung ulang stok | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/stock-movement-items/:id` | *Soft delete* item & menghitung ulang (*rollback*) stok produk | `200 OK`, `400 Bad Request`, `404 Not Found` |

**Contoh Request Body (`POST /stock-movement-items`):**
```json
{
  "stockMovementId": "550e8400-e29b-41d4-a716-446655440003",
  "productId": "550e8400-e29b-41d4-a716-446655440004",
  "quantity": 50,
  "remarks": "Kondisi segel baik"
}
```

---

## 🧪 Urutan Skenario Pengujian Endpoint

Untuk mendemonstrasikan aplikasi secara menyeluruh, jalankan *request* berikut secara berurutan melalui Postman atau REST client lain. Koleksi Postman siap import tersedia di [`docs/postman/Inventory-Management-Complete.postman_collection.json`](docs/postman/Inventory-Management-Complete.postman_collection.json), dan dokumentasi lengkap seluruh endpoint ada di [`docs/API-DOCUMENTATION.md`](docs/API-DOCUMENTATION.md).
1. **`POST /categories`** — Buat data kategori terlebih dahulu.
2. **`POST /suppliers`** — Buat data pemasok barang.
3. **`POST /warehouses`** — Buat data gudang penyimpanan.
4. **`POST /products`** — Buat produk baru dengan menghubungkan `categoryId` dan `supplierId`.
5. **`POST /stock-movements`** — Buat transaksi masuk dengan `"type": "IN"`.
6. **`POST /stock-movement-items`** — Masukkan produk beserta kuantitas barang masuk (misal: `50`).
7. **`POST /stock-movements`** — Buat transaksi keluar dengan `"type": "OUT"`.
8. **`POST /stock-movement-items`** — Masukkan produk beserta kuantitas barang keluar (misal: `15`).
9. **`GET /products/:id/stock-info`** — Ganti `:id` dengan UUID produk, lalu periksa hasil perhitungan stok (`totalIn: 50`, `totalOut: 15`, `currentStock: 35`, `calculatedStock: 35`). `currentStock` dan `calculatedStock` seharusnya selalu sama karena stok dihitung ulang dari histori transaksi.
10. **Uji Validasi Stok (`400 Bad Request`):** Coba kirim `POST /stock-movement-items` pada transaksi `OUT` dengan `quantity: 100` (melebihi sisa stok `35`) untuk membuktikan sistem menolak stok minus.
11. **Uji Validasi Filter (`400 Bad Request`):** Akses `GET /stock-movements?type=SALAH` untuk membuktikan filter tipe divalidasi dan hanya menerima `IN` atau `OUT`.
12. **Uji Perubahan Tipe Transaksi:** Ubah transaksi `IN` menjadi `OUT` melalui `PATCH /stock-movements/:id`. Stok produk terkait akan dihitung ulang; jika stok menjadi negatif, API menolak dengan `400 Bad Request`.
