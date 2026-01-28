# 📸 Cloudinary Setup - Client-Side Upload

## Overview

Eduvate menggunakan **Cloudinary Upload Widget** untuk upload gambar **langsung dari client ke Cloudinary** tanpa melalui server. Ini menghemat bandwidth server dan membuat upload lebih cepat.

---

## 🎯 **Keuntungan Client-Side Upload:**

✅ **Hemat Bandwidth Server** - File langsung ke Cloudinary
✅ **Lebih Cepat** - Tidak ada bottleneck di server
✅ **Gratis Tier Generous** - 25GB storage + 25GB bandwidth/bulan
✅ **Auto Optimization** - Cloudinary optimize gambar otomatis
✅ **CDN Global** - Gambar load cepat dari mana saja
✅ **Cropping Built-in** - User bisa crop sebelum upload
✅ **Multi Language** - Support Bahasa Indonesia

---

## 🔧 **Setup Cloudinary (5 Menit)**

### **Step 1: Create Cloudinary Account**

1. Buka https://cloudinary.com/users/register/free
2. Sign up (Gratis!)
3. Verify email

### **Step 2: Get Credentials**

Setelah login, di Dashboard kamu akan lihat:

```
Cloud Name: your-cloud-name
API Key: 123456789012345
API Secret: xxxxxxxxxxxxxxxxxxxxx
```

**Yang Kita Butuhkan:**
- ✅ Cloud Name
- ✅ Upload Preset (akan dibuat)

**TIDAK Perlu:**
- ❌ API Key
- ❌ API Secret
(Karena upload dari client, bukan server!)

### **Step 3: Create Upload Preset**

Upload Preset adalah konfigurasi untuk unsigned upload (tanpa API secret).

**Di Cloudinary Dashboard:**

1. Klik **Settings** (icon gear ⚙️)
2. Klik tab **Upload**
3. Scroll ke **Upload presets**
4. Klik **Add upload preset**
5. Isi form:
   ```
   Preset name: eduvate_gallery
   Signing mode: Unsigned ⚠️ (PENTING!)
   Folder: eduvate/gallery
   ```
6. **Optional Settings:**
   - Max file size: 5 MB
   - Allowed formats: jpg, jpeg, png, gif, webp
   - Auto tagging: Enabled
   - Auto backup: Enabled (for paid plans)
7. Klik **Save**

### **Step 4: Add to Environment Variables**

Edit file `.env` di root project:

```env
# Cloudinary Configuration (Client-Side Upload)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=eduvate_gallery
```

**⚠️ PENTING:**
- Gunakan prefix `NEXT_PUBLIC_` agar bisa diakses dari client
- Cloud name dan upload preset **AMAN** untuk public (tidak ada API secret)
- Ganti `your-cloud-name` dengan cloud name kamu

### **Step 5: Restart Dev Server**

```bash
# Stop server (Ctrl+C)
pnpm dev
```

---

## 📝 **Example .env File**

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary (Client-Side Upload)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=eduvate-demo
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=eduvate_gallery
```

---

## 🚀 **Cara Kerja:**

```
┌─────────┐      ┌──────────────┐      ┌─────────────┐
│ Browser │─────▶│  Cloudinary  │─────▶│   CDN       │
│ (Client)│      │   Upload     │      │  (Global)   │
└─────────┘      └──────────────┘      └─────────────┘
     │                                         │
     │                                         │
     └──────────────────┬──────────────────────┘
                        ▼
                  ┌──────────┐
                  │ Database │◀── Hanya simpan URL
                  │ (Server) │
                  └──────────┘
```

**Flow:**
1. User pilih gambar di Gallery page
2. Cloudinary widget muncul (dari browser)
3. User crop/edit gambar
4. Browser upload langsung ke Cloudinary
5. Cloudinary return URL
6. URL disimpan ke database (text saja!)

**Server TIDAK pernah menerima file gambar!** ✨

---

## 💻 **Implementation di Eduvate:**

### **Component Location:**
```
src/components/CloudinaryUploadWidget.tsx
```

### **Digunakan di:**
- ✅ Gallery Create Modal
- ✅ Gallery Edit Modal

### **Features:**
- ✅ Drag & drop upload
- ✅ Browse file dari device
- ✅ Paste URL gambar
- ✅ Camera capture (mobile)
- ✅ Image cropping (16:9 aspect ratio)
- ✅ Max file size: 5MB
- ✅ Allowed formats: jpg, jpeg, png, gif, webp
- ✅ Preview before upload
- ✅ Bahasa Indonesia

---

## 🎨 **User Experience:**

**Create/Edit Gallery:**

1. Klik "Upload Media" atau "Edit"
2. Modal muncul dengan 3 opsi:
   - **Upload Gambar dari Device** - Buka Cloudinary widget
   - **Atau masukkan URL** - Input manual
3. Jika pilih Upload:
   - Widget Cloudinary muncul
   - User bisa drag & drop atau browse
   - User bisa crop gambar
   - Upload otomatis
   - URL gambar ter-fill otomatis
4. Preview gambar muncul
5. User isi Title, Description, Category
6. Klik "Upload" - Hanya URL yang disimpan ke DB!

---

## 📊 **Cloudinary Free Tier:**

```
✅ 25 GB Storage
✅ 25 GB Bandwidth/month
✅ 25,000 transformations/month
✅ Unlimited uploads
✅ CDN global
✅ Auto image optimization
✅ Basic transformations
```

**Cukup untuk:**
- ~5,000 - 10,000 gambar (tergantung ukuran)
- ~500,000 page views/month
- School dengan 100-500 siswa

**Jika Butuh Lebih:**
- Upgrade ke Plus ($89/month)
- Atau gunakan multiple free accounts

---

## 🔒 **Security:**

### **Aman?**
✅ **YA!** Karena:
- Upload preset unsigned (public access OK)
- Tidak ada API secret di client
- Cloudinary validate file type & size
- Folder specific untuk organization

### **Protect from Abuse?**
1. **Rate Limiting** - Cloudinary punya built-in rate limit
2. **File Size Limit** - Max 5MB di widget
3. **File Type Filter** - Only images allowed
4. **Folder Organization** - Upload ke `eduvate/gallery` saja

### **Best Practices:**
- ✅ Set max file size di upload preset
- ✅ Enable auto-moderation (paid feature)
- ✅ Monitor usage di Cloudinary dashboard
- ✅ Set up notifications untuk quota warning

---

## 🐛 **Troubleshooting:**

### **Error: "Cloudinary belum dikonfigurasi"**
➜ Pastikan `.env` punya `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` dan `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
➜ Restart dev server

### **Error: "Upload failed"**
➜ Check upload preset di Cloudinary
➜ Pastikan "Signing mode" = **Unsigned**
➜ Check file size < 5MB

### **Widget tidak muncul**
➜ Check console browser (F12)
➜ Pastikan tidak ada AdBlock
➜ Check internet connection

### **Gambar tidak load**
➜ Check URL valid
➜ Check Cloudinary quota belum habis
➜ Try refresh page

---

## 📚 **Resources:**

- Cloudinary Docs: https://cloudinary.com/documentation
- Upload Widget: https://cloudinary.com/documentation/upload_widget
- Upload Presets: https://cloudinary.com/documentation/upload_presets
- Free Tier: https://cloudinary.com/pricing

---

## ✅ **Checklist:**

- [ ] Create Cloudinary account
- [ ] Get Cloud Name
- [ ] Create upload preset (unsigned!)
- [ ] Add to `.env`
- [ ] Restart dev server
- [ ] Test upload di Gallery page
- [ ] Check gambar muncul di Cloudinary dashboard

---

**Ready to upload!** 🚀

*Note: Credentials menyusul dari client. Guide ini ready untuk diikuti!*
