# 05 - Fitur Foto Produk

Menambahkan kemampuan menyimpan foto pada master barang.

## Perubahan Skema
Menambahkan field `image` ke model `Product`.

## Kompresi
Menggunakan library `sharp` untuk kompresi gambar sebelum disimpan sebagai format `Base64` ke database.
