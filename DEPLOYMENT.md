# اجرای پروژه روی سرور

ایمیج‌ها در رجیستری زیر منتشر می‌شوند و تگ مشترک `latest` هر دو معماری Linux AMD64 و ARM64 را پوشش می‌دهد:

```text
188.212.97.228:5000/taj-front:latest
188.212.97.228:5000/taj-back:latest
```

فایل `compose.yaml` شامل فرانت، API، Worker و یک سرویس موقت اجرای مایگریشن است. Worker از همان ایمیج بک‌اند استفاده می‌کند. این تنظیمات به PostgreSQL موجود روی سرور متصل می‌شوند و دیتابیس جدیدی راه‌اندازی نمی‌کنند.

## ۱. دسترسی Docker سرور به رجیستری

این رجیستری با HTTP کار می‌کند. در فایل `/etc/docker/daemon.json` روی سرور، آدرس آن را به `insecure-registries` اضافه کنید. اگر فایل تنظیمات دیگری دارد، این گزینه را با تنظیمات موجود ادغام کنید؛ فایل را کامل بازنویسی نکنید:

```json
{
  "insecure-registries": ["188.212.97.228:5000"]
}
```

اعمال تغییر نیاز به restart سرویس Docker دارد و ممکن است کانتینرهای موجود را متوقف کند؛ این مرحله را در زمان مناسب روی سرور انجام دهید:

```bash
sudo systemctl restart docker
docker login 188.212.97.228:5000
```

نام کاربری و رمز رجیستری با اطلاعات PostgreSQL متفاوت‌اند. از Docker Compose v2، یعنی دستور `docker compose` استفاده کنید.

## ۲. کپی فایل‌ها روی سرور و تنظیم متغیرها

فایل‌های `compose.yaml` و `.env.production.example` را در یک پوشه روی سرور قرار دهید. برای اجرای ایمیج‌های آماده به سورس پروژه نیاز نیست.

```bash
cp .env.production.example .env.production
chmod 600 .env.production
nano .env.production
```

مقادیر `replace-me` را با مقادیر واقعی جایگزین کنید. به‌خصوص این متغیرها باید تنظیم شوند:

- `DB_HOST`، `DB_PORT`، `DB_NAME`، `DB_USERNAME` و `DB_PASSWORD`: اتصال PostgreSQL موجود؛ نام پیشنهادی دیتابیس `vendure` است.
- `COOKIE_SECRET`: رمز تصادفی طولانی برای کوکی‌ها.
- `SUPERADMIN_USERNAME` و `SUPERADMIN_PASSWORD`: اطلاعات ادمین هنگام راه‌اندازی اولیهٔ Vendure.
- `STOREFRONT_URL` و `CORS_ORIGINS`: آدرس عمومی فرانت، مثلاً `http://188.212.97.228:3001`.
- `NUXT_PUBLIC_API_BASE_URL`: آدرس عمومی API، مثلاً `http://188.212.97.228:3000/shop-api`؛ باید هم از مرورگر و هم از کانتینر فرانت قابل دسترسی باشد.
- `ASSET_URL_PREFIX`: آدرس عمومی فایل‌ها با اسلش پایانی، مثلاً `http://188.212.97.228:3000/assets/`.
- `ZARINPAL_MERCHANT_ID` و `ZARINPAL_SANDBOX`: تنظیمات درگاه پرداخت.

اگر دامنه یا پورت‌ها را تغییر دادید، آدرس‌های عمومی بالا را هم هماهنگ کنید. مقدار پیش‌فرض `host.docker.internal` برای دیتابیس با `host-gateway` به میزبان Docker اشاره می‌کند. PostgreSQL میزبان باید روی آدرسی قابل دسترسی از شبکهٔ Docker گوش دهد و دسترسی کاربر از آن شبکه در `pg_hba.conf` مجاز باشد؛ صرفاً گوش دادن روی `127.0.0.1` کافی نیست. دیتابیس را برای این کار بدون نیاز به اینترنت عمومی باز نکنید.

اگر PostgreSQL در کانتینر دیگری است، `DB_HOST` را برابر نام آن سرویس بگذارید و سرویس‌های بک‌اند را به شبکهٔ مشترک با دیتابیس متصل کنید. فایل فعلی برای PostgreSQL روی میزبان یا یک آدرس شبکهٔ قابل دسترسی آماده شده است.

## ۳. وضعیت اولیهٔ دیتابیس

مایگریشن‌های فعلی پروژه، جدول‌های پایهٔ Vendure را از صفر نمی‌سازند. دیتابیس مقصد باید از قبل جدول‌های پایه و تاریخچهٔ مناسب مایگریشن‌ها را داشته باشد. برای دیتابیس کاملاً خالی، ابتدا یک مایگریشن اولیهٔ سازگار با مایگریشن‌های موجود لازم است، یا باید دیتابیس موجود و تاریخچهٔ آن را منتقل کنید.

جزئیات در [DATABASE-MIGRATIONS.md](DATABASE-MIGRATIONS.md) است. سرویس `migrate` در صورت شکست با کد غیرصفر متوقف می‌شود تا برنامه روی دیتابیس ناقص شروع نشود.

## ۴. دریافت ایمیج‌ها و اجرای پروژه

از همان پوشهٔ فایل‌های Compose و محیط اجرا کنید:

```bash
docker compose --env-file .env.production pull
docker compose --env-file .env.production up -d
docker compose --env-file .env.production ps -a
docker compose --env-file .env.production logs --tail=100 migrate backend worker frontend
```

ترتیب اجرا: ابتدا مایگریشن‌ها؛ پس از موفقیت، API؛ پس از سالم شدن API، فرانت و Worker. خروج سرویس `migrate` با وضعیت `Exited (0)` طبیعی است.

با تنظیمات پیش‌فرض:

- فرانت: `http://188.212.97.228:3001`
- داشبورد: `http://188.212.97.228:3000/dashboard`
- Shop API: `http://188.212.97.228:3000/shop-api`

پورت‌های `3000` و `3001` باید برای دسترسی موردنظر در فایروال سرور مجاز باشند. اگر دامنه و reverse proxy دارید، آدرس‌ها را در فایل محیط با دامنه‌های واقعی تنظیم کنید. تنظیم فعلی برنامه هنوز ایمیل را در حالت dev داخل volume ذخیره می‌کند؛ ارسال واقعی ایمیل نیاز به تنظیم سرویس ایمیل در بک‌اند دارد.

## ۵. به‌روزرسانی بعدی

پس از منتشر شدن نسخهٔ جدید، برای توقف Worker در زمان مایگریشن و اجرای مجدد سرویس مایگریشن:

```bash
docker compose --env-file .env.production pull
docker compose --env-file .env.production stop frontend worker backend
docker compose --env-file .env.production rm -f migrate
docker compose --env-file .env.production up -d
```

این روش هنگام به‌روزرسانی وقفه ایجاد می‌کند. Volumeهای `assets` و `email-output` فایل‌های تولیدشده را نگه می‌دارند. برای توقف معمولی از `docker compose --env-file .env.production down` استفاده کنید؛ گزینهٔ `-v` داده‌های این volumeها را حذف می‌کند.

## انتشار ایمیج از سیستم توسعه

از ریشهٔ پروژه، پس از ورود به رجیستری:

```bash
docker login 188.212.97.228:5000
bash scripts/publish-images.sh
```

اسکریپت هر دو معماری را می‌سازد، تگ‌های معماری را پوش می‌کند و یک manifest مشترک `latest` می‌سازد. برای یک نسخهٔ مشخص:

```bash
IMAGE_TAG=v1 bash scripts/publish-images.sh
```

در این حالت روی سرور نیز `IMAGE_TAG=v1` را در `.env.production` تنظیم کنید. سیستم توسعه باید امکان بیلد هر دو معماری را داشته باشد؛ Docker Desktop این قابلیت را فراهم می‌کند.

مراجع: [ترتیب اجرای Compose](https://docs.docker.com/compose/how-tos/startup-order/) و [تنظیم رجیستری HTTP](https://docs.docker.com/reference/cli/dockerd/#insecure-registries).
