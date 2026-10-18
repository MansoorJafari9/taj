# اجرای پروژه روی سرور

فایل `compose.yaml` همان سرویس‌های PostgreSQL و رجیستری سرور را همراه با بک‌اند Vendure، Worker، سرویس مایگریشن و فرانت Nuxt اجرا می‌کند.

ایمیج‌های برنامه برای Linux AMD64 و ARM64 در این آدرس‌ها منتشر شده‌اند:

```text
188.212.97.228:5000/taj-back:latest
188.212.97.228:5000/taj-front:latest
```

## فایل‌ها و متغیرهای محیطی

ساختار پوشه روی سرور:

```text
server-folder/
├── compose.yaml
├── .env              # POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB
├── auth/
│   └── htpasswd      # فایل فعلی احراز هویت رجیستری
├── panel/
│   └── .env          # بک‌اند Vendure
└── taj/
    └── .env          # فرانت Nuxt
```

Compose جدید را در همان پوشه و با همان نام پروژهٔ Compose قبلی اجرا کنید تا volumeهای موجود `postgres_data` و `registry_data` استفاده شوند. در این فایل نام پروژه به‌اجبار تعیین نشده است. اگر قبلاً گزینهٔ `-p` یا متغیر `COMPOSE_PROJECT_NAME` داشتید، همان را نگه دارید.

فایل اصلی `.env` و پوشهٔ `auth` موجود سرور را نگه دارید. فایل [compose.env.example](compose.env.example) فقط نمونهٔ متغیرهای اصلی است. اطلاعات `POSTGRES_*` باید همان اطلاعات واقعی دیتابیس فعلی باشند؛ تغییر آن‌ها در فایل env، رمز یا نام دیتابیس داخل volume موجود را عوض نمی‌کند.

برای فایل‌های برنامه از نمونه‌های زیر استفاده کنید:

```bash
mkdir -p panel taj
cp panel/.env.example panel/.env
cp taj/.env.example taj/.env
chmod 600 panel/.env taj/.env
nano panel/.env
nano taj/.env
```

این دستورها برای اولین ساخت فایل‌های env هستند؛ اگر آن‌ها را از قبل ساخته‌اید، مستقیماً ویرایششان کنید. در صورت انتقال دستی فایل‌ها، محتوای نمونه‌ها را در مسیرهای بالا قرار دهید.

### panel/.env — بک‌اند Vendure

```dotenv
COOKIE_SECRET=replace-me-with-a-long-random-secret
SUPERADMIN_USERNAME=superadmin
SUPERADMIN_PASSWORD=replace-me
CORS_ORIGINS=http://188.212.97.228:3001
STOREFRONT_URL=http://188.212.97.228:3001
ASSET_URL_PREFIX=http://188.212.97.228:3000/assets/
ZARINPAL_MERCHANT_ID=
ZARINPAL_SANDBOX=true
```

مقادیر نمونهٔ رمزها را جایگزین کنید. آدرس فایل‌ها باید اسلش پایانی داشته باشد. برای پرداخت واقعی، تنظیمات درگاه را با حساب واقعی خود هماهنگ کنید.

اتصال دیتابیس را خود Compose تنظیم می‌کند: `DB_HOST=postgres`، `DB_PORT=5432` و اطلاعات ورود از `POSTGRES_*` فایل اصلی `.env`. این مقادیر بر مقادیر احتمالی `DB_*` در `panel/.env` اولویت دارند. نیازی به باز کردن پورت PostgreSQL روی اینترنت نیست؛ پورت فعلی `127.0.0.1:5432:5432` حفظ شده است.

### taj/.env — فرانت Nuxt

```dotenv
NUXT_PUBLIC_API_BASE_URL=http://188.212.97.228:3000/shop-api
NUXT_PUBLIC_SITE_URL=http://188.212.97.228:3001
NUXT_PUBLIC_CHANNEL_TOKEN=
```

آدرس API باید هم از مرورگر و هم از کانتینر فرانت قابل دسترسی باشد. اگر دامنه یا پورت عمومی را تغییر دادید، آدرس‌های عمومی در هر دو فایل را هماهنگ کنید. نام داخلی `backend` برای آدرس عمومی API مناسب نیست.

اگر فایل‌هایتان به‌جای پوشه‌ها، `panel.env` و `taj.env` نام دارند، این دو مقدار را در فایل اصلی `.env` تنظیم کنید:

```dotenv
BACKEND_ENV_FILE=./panel.env
FRONTEND_ENV_FILE=./taj.env
```

## دسترسی به رجیستری HTTP

Docker سرور باید رجیستری را در `insecure-registries` بشناسد. در صورت نیاز گزینهٔ زیر را با تنظیمات موجود `/etc/docker/daemon.json` ادغام کنید؛ فایل تنظیمات فعلی را بازنویسی نکنید:

```json
{
  "insecure-registries": ["188.212.97.228:5000"]
}
```

اعمال تغییر daemon به restart سرویس Docker نیاز دارد و ممکن است کانتینرهای فعلی را متوقف کند؛ این مرحله را فقط در صورت نیاز و در زمان مناسب انجام دهید:

```bash
sudo systemctl restart docker
docker login 188.212.97.228:5000
```

## دریافت و اجرای برنامه

از همان پوشهٔ Compose موجود سرور و با Docker Compose v2 اجرا کنید:

```bash
docker compose config --quiet
docker compose pull migrate backend worker frontend
docker compose up -d migrate backend worker frontend
docker compose ps -a
docker compose logs --tail=100 migrate backend worker frontend
```

این دستور دریافت، ایمیج‌های برنامه را می‌گیرد؛ دریافت آن‌ها به رجیستری در حال اجرای سرور وابسته است. سرویس `postgres` به‌عنوان وابستگی برنامه مدیریت می‌شود. ترتیب شروع: سالم شدن PostgreSQL، موفقیت مایگریشن‌ها، آماده شدن API، سپس Worker و فرانت. خروج سرویس `migrate` با `Exited (0)` طبیعی است.

مایگریشن اولیهٔ `InitialVendure1790000000000` جدول‌های پایه را روی دیتابیس خالی می‌سازد و سپس پنج مایگریشن ویژگی‌های پروژه اجرا می‌شوند. در دیتابیسی که همهٔ جدول‌های پایه را دارد، مرحلهٔ ساخت آن‌ها رد می‌شود. ساختار پایهٔ ناقص با خطا متوقف می‌شود و باید بررسی شود. در صورت شکست مایگریشن، سرویس‌های برنامه شروع نمی‌شوند. جزئیات: [DATABASE-MIGRATIONS.md](DATABASE-MIGRATIONS.md).

آدرس‌های پیش‌فرض:

- فرانت: `http://188.212.97.228:3001`
- داشبورد Vendure: `http://188.212.97.228:3000/dashboard`
- Shop API: `http://188.212.97.228:3000/shop-api`

پورت‌های عمومی `3000` و `3001` باید برای دسترسی موردنظر در فایروال مجاز باشند. برنامه فعلاً ایمیل را در حالت dev داخل volume ذخیره می‌کند؛ ارسال واقعی ایمیل به تنظیم سرویس ایمیل در بک‌اند نیاز دارد.

## به‌روزرسانی نسخهٔ برنامه

```bash
docker compose pull migrate backend worker frontend
docker compose stop frontend worker backend
docker compose rm -f migrate
docker compose up -d migrate backend worker frontend
```

این روش هنگام به‌روزرسانی برنامه وقفه ایجاد می‌کند. فایل‌های آپلودی و خروجی ایمیل در volumeهای `assets` و `email-output` نگه‌داری می‌شوند. از `docker compose down -v` استفاده نکنید؛ این دستور volumeهای تعریف‌شده، از جمله داده‌های PostgreSQL و رجیستری، را حذف می‌کند. برای توقف فقط برنامه، از `docker compose stop frontend worker backend` استفاده کنید.

## انتشار از سیستم توسعه

```bash
docker login 188.212.97.228:5000
bash scripts/publish-images.sh
```

برای انتشار نسخهٔ مشخص، مثلاً `v1`، دستور `IMAGE_TAG=v1 bash scripts/publish-images.sh` را اجرا کنید و روی سرور نیز `IMAGE_TAG=v1` را در فایل اصلی `.env` بگذارید.

مراجع: [ترتیب اجرای Compose](https://docs.docker.com/compose/how-tos/startup-order/) و [تنظیم رجیستری HTTP](https://docs.docker.com/reference/cli/dockerd/#insecure-registries).
