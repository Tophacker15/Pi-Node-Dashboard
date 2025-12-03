
# 🚀 Pi-Node-Dashboard  
Dashboard Modern & Real-Time untuk Monitoring Pi Network Node (Stellar-Core + Horizon)

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Node.js-18%2B-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Stellar%20Core-19.6.0-purple?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-orange?style=for-the-badge" />
</p>

<p align="center">
  <b>Pi-Node-Dashboard</b> adalah dashboard modern untuk memantau status Pi Network Node Anda secara real-time, termasuk Stellar Core, Horizon, Peers, Ledger, dan sinkronisasi.
</p>

---

## 🖥️ **Preview (Screenshot)**
> *(Ganti URL saat kamu upload screenshot nanti)*

<p align="center">
  <img src="[https://via.placeholder.com/900x450?text=Pi+Node+Dashboard+Preview](https://raw.githubusercontent.com/zendshost/Pi-Node-Dashboard/refs/heads/main/demo.jpg)" />
</p>

---

## ✨ **Fitur Utama**

✔ **Monitoring Stellar-Core**, termasuk:  
- Status (Synced / Catching Up / Error)  
- Latest Ledger  
- Peers (Authenticated Count)  
- Quorum & State Info  

✔ **Monitoring Horizon**  
- Horizon Version  
- Latest Ledger  
- Ledger Closed At  
- Protocol Version  

✔ **Realtime Sync Progress**  
✔ **UI modern, smooth, clean**  
✔ **Data otomatis refresh setiap 2 detik**  
✔ **Auto-detect status Docker container Pi Node**  
✔ **Tampilan ringan & cepat**  

---

## 📦 **Instalasi Cepat (1 Baris Perintah)**

Jalankan:

```bash
curl -sSL https://raw.githubusercontent.com/zendshost/Pi-Node-Dashboard/main/install.sh | bash
````

Atau versi wget:

```bash
wget -O - https://raw.githubusercontent.com/zendshost/Pi-Node-Dashboard/main/install.sh | bash
```

Installer akan otomatis:

* Install Node.js (jika belum ada)
* Install npm
* Install PM2
* Clone repository
* Install dependencies
* Menjalankan server dengan PM2

---

## 🛠️ **Manual Installation**

### 1. Clone Repo

```bash
git clone https://github.com/zendshost/Pi-Node-Dashboard.git
cd Pi-Node-Dashboard
```

### 2. Install Dependency

```bash
npm install
```

### 3. Jalankan Server

```bash
node server.js
```

Atau pakai PM2 (disarankan):

```bash
pm2 start server.js
```

---

## 🌐 **Akses Dashboard**

Buka browser:

```
http://YOUR-IP:3000
```

Contoh:

```
http://192.168.1.10:3000
```

---

## 📁 **Struktur Project**

```
Pi-Node-Dashboard/
│── server.js          # Backend utama
│── public/            # File frontend
│── views/             # Template EJS
│── install.sh         # Auto installer
│── package.json
│── README.md
```

---

## ⚙️ **Teknologi yang Digunakan**

* **Node.js + Express.js**
* **EJS Template Engine**
* **Docker CLI integration**
* **Stellar Core RPC (pi-node protocol-status)**
* **Horizon API**
* **PM2 Process Manager**

---

## ❤️ **Kontribusi**

Kontribusi sangat diterima!
Silakan lakukan:

1. Fork repo
2. Buat branch baru
3. Commit perubahan
4. Buat pull request

---

## 📄 **Lisensi**

Proyek ini menggunakan lisensi **MIT License**.
Silakan gunakan & modifikasi sesuka hati.

---

## ⭐ **Dukung Project Ini**

Jika dashboard ini membantu Anda, jangan lupa beri **⭐ di GitHub!**

<p align="center"><b>Made with ❤️ by zendshost</b></p>
