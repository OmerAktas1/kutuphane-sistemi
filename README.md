# Kütüphane Takip Sistemi

Modern ve kapsamlı bir kütüphane yönetim sistemi. Kitap takibi, üye yönetimi, ödünç alma/verme ve rezervasyon işlemleri için geliştirilmiştir.

## Teknolojiler

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Vite
- React Query
- React Router
- Zustand

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- JWT Authentication

### Veritabanı
- PostgreSQL 16

## Proje Yapısı

```
kutuphane/
├── backend/
│   ├── src/
│   │   ├── config/          # Uygulama konfigürasyonu
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/       # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Yardımcı fonksiyonlar
│   ├── prisma/
│   │   └── schema.prisma    # Veritabanı şeması
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React bileşenleri
│   │   ├── pages/           # Sayfa bileşenleri
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API servisleri
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Yardımcı fonksiyonlar
│   └── package.json
├── docker/
│   ├── backend.dockerfile
│   ├── frontend.dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## Veritabanı Şeması

### Modeller
- **Author**: Yazar bilgileri
- **Book**: Kitap bilgileri
- **Category**: Kategori hiyerarşisi
- **Member**: Üye bilgileri
- **Borrowing**: Ödünç alma kayıtları
- **Reservation**: Rezervasyon kayıtları
- **SystemSetting**: Sistem ayarları

### İlişkiler
- Kitap-Yazar: Many-to-Many
- Kitap-Kategori: Many-to-Many
- Kategori kendisiyle: Parent-Child ilişkisi

## Kurulum

### Gereksinimler
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16 (Docker dışı kurulum için)

### Docker ile Kurulum (Önerilen)

1. Repository'yi klonlayın:
```bash
git clone <repo-url>
cd kutuphane
```

2. Environment dosyasını oluşturun:
```bash
cp .env.example .env
```

3. Docker Compose ile başlatın:
```bash
docker-compose up -d
```

4. Migration'ları çalıştırın:
```bash
docker-compose exec backend npx prisma migrate deploy
```

Uygulama şu adreslerde çalışacak:
- Frontend: http://localhost
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/api-docs
- Prisma Studio: `docker-compose exec backend npx prisma studio`

### Yerel Geliştirme Kurulumu

#### Backend

```bash
cd backend

# Bağımlılıkları yükle
npm install

# Environment dosyasını oluştur
cp .env.example .env

# Veritabanı migration'ını çalıştır
npx prisma migrate dev

# Development server'ı başlat
npm run dev
```

#### Frontend

```bash
cd frontend

# Bağımlılıkları yükle
npm install

# Development server'ı başlat
npm run dev
```

## API Kullanımı

### Kimlik Doğrulama

```bash
# Giriş
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Kitaplar

```bash
# Tüm kitapları listele
GET /api/v1/books?page=1&limit=10&search=kitap

# Kitap detayı
GET /api/v1/books/:id

# Yeni kitap oluştur
POST /api/v1/books

# Kitap güncelle
PUT /api/v1/books/:id

# Kitap sil
DELETE /api/v1/books/:id
```

### Üyeler

```bash
# Tüm üyeleri listele
GET /api/v1/members

# Üye detayı
GET /api/v1/members/:id

# Yeni üye oluştur
POST /api/v1/members

# Üye güncelle
PUT /api/v1/members/:id
```

### Ödünç İşlemleri

```bash
# Tüm ödünç kayıtlarını listele
GET /api/v1/borrowings

# Kitap ödünç ver
POST /api/v1/borrowings

# Kitap iade et
PATCH /api/v1/borrowings/:id/return

# Gecikmiş ödünçleri listele
GET /api/v1/borrowings?status=OVERDUE
```

## Geliştirme

### Linting

```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

### Testing

```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test
```

### Prisma Komutları

```bash
# Migration oluştur
npx prisma migrate dev --name migration_name

# Migration deploy et
npx prisma migrate deploy

# Seed data yükle
npx prisma db seed

# Studio aç
npx prisma studio
```

## Production Deployment

1. Environment değişkenlerini güncelleyin:
```bash
# .env dosyasında
NODE_ENV=production
JWT_SECRET=<güvenli-bir-key>
```

2. Production build:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans

MIT License
