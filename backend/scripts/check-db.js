// Kiểm tra database TRƯỚC KHI bật backend (tự chạy khi `npm run dev`, nhờ "predev" trong package.json).
// Chạy tay: npm --prefix backend run db:check
//
// Làm 3 việc, hỏng ở đâu thì in câu tiếng Việt chỉ cách sửa và DỪNG (không bật backend để web lỗi ngầm):
//   1. Prisma Client cũ hơn prisma/schema.prisma (vd vừa pull code mới) -> tự chạy `prisma generate`
//   2. Nối được PostgreSQL theo DATABASE_URL trong backend/.env không
//   3. Còn migration chưa áp dụng -> tự chạy `prisma migrate deploy` (chỉ thêm bảng / cột, KHÔNG xóa dữ liệu)
//      Database trống (chưa có bảng nào) -> không tự làm gì, báo chạy `npm run setup`
// Tài liệu: docs/02-cai-dat-va-chay.md mục 4.
import 'dotenv/config';
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..'); // thư mục backend/
const schemaFile = join(root, 'prisma', 'schema.prisma');
const clientSchema = join(root, 'node_modules', '.prisma', 'client', 'schema.prisma');
const migrationsDir = join(root, 'prisma', 'migrations');
const prismaCli = join(root, 'node_modules', 'prisma', 'build', 'index.js');

const ok = (msg) => console.log(`[db] ✔ ${msg}`);
const info = (msg) => console.log(`[db] … ${msg}`);
function fail(title, hints) {
  console.error(`\n[db] ✖ ${title}`);
  for (const h of hints) console.error(`     - ${h}`);
  console.error('     Sửa xong thì chạy lại: npm run dev\n');
  process.exit(1);
}

// Chạy lệnh prisma bằng chính bản cài trong backend/node_modules (không qua npx cho nhanh)
function prisma(...args) {
  const r = spawnSync(process.execPath, [prismaCli, ...args], { cwd: root, stdio: 'inherit' });
  return r.status === 0;
}

if (!process.env.DATABASE_URL) {
  fail('Thiếu DATABASE_URL trong backend/.env', ['Chép backend/.env.example thành backend/.env (hoặc chạy npm run install:all)']);
}
const url = new URL(process.env.DATABASE_URL);
const where = `${url.hostname}:${url.port || 5432}/${url.pathname.slice(1)}`;

// ---- 1. Prisma Client có khớp schema.prisma không ----
const normalize = (s) => s.replace(/\r\n/g, '\n');
const clientFresh = existsSync(clientSchema) && normalize(readFileSync(clientSchema, 'utf8')) === normalize(readFileSync(schemaFile, 'utf8'));
if (!clientFresh) {
  info('schema.prisma vừa đổi, đang tạo lại Prisma Client (prisma generate)...');
  if (!prisma('generate')) {
    fail('Không tạo lại được Prisma Client', [
      'Thường do một backend cũ vẫn đang chạy và giữ file: tắt hết cửa sổ terminal đang chạy backend (Ctrl+C) rồi chạy lại',
      'Vẫn lỗi: chạy npm --prefix backend run generate để xem lỗi chi tiết',
    ]);
  }
}

// ---- 2. Nối database ----
const { PrismaClient } = await import('@prisma/client');
const db = new PrismaClient();
let version;
try {
  const [row] = await db.$queryRawUnsafe('SELECT version() AS v');
  version = String(row.v).split(' ').slice(0, 2).join(' '); // "PostgreSQL 18.3"
} catch (e) {
  await db.$disconnect().catch(() => {});
  // Prisma 6 không phải lúc nào cũng có mã lỗi (errorCode) nên đoán thêm theo câu báo lỗi
  const msg = String(e.message);
  const code = e.errorCode || e.code
    || (/credentials|authentication failed/i.test(msg) && 'P1000')
    || (/database .* does not exist/i.test(msg) && 'P1003');
  if (code === 'P1000') {
    fail(`Sai tên đăng nhập / mật khẩu PostgreSQL (${where})`, ['Sửa user:mật khẩu trong DATABASE_URL ở backend/.env cho đúng với Postgres trên máy']);
  }
  if (code === 'P1003') {
    fail(`Chưa có database "${url.pathname.slice(1)}" trên ${url.hostname}:${url.port || 5432}`, [
      `Tạo database: createdb ${url.pathname.slice(1)} (hoặc tạo trong pgAdmin)`,
      'Rồi chạy npm run setup để tạo bảng + dữ liệu mẫu',
    ]);
  }
  fail(`Không nối được PostgreSQL tại ${where}`, [
    'Postgres cài trên Windows: mở "Services" (services.msc), tìm postgresql-x64-18, bấm Start',
    'Dùng Docker: mở Docker Desktop rồi chạy docker compose up -d ở thư mục gốc',
    'Kiểm tra DATABASE_URL trong backend/.env',
    `Lỗi gốc: ${String(e.message).trim().split('\n').pop()}`,
  ]);
}

// ---- 3. Bảng đã đủ chưa (so thư mục prisma/migrations với bảng _prisma_migrations) ----
try {
  const local = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(migrationsDir, d.name, 'migration.sql')))
    .map((d) => d.name);

  const [{ has }] = await db.$queryRawUnsafe(`SELECT to_regclass('public._prisma_migrations') IS NOT NULL AS has`);
  if (!has) {
    const [{ n }] = await db.$queryRawUnsafe(`SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public'`);
    fail(n === 0 ? `Database ${where} đang TRỐNG (chưa có bảng nào)` : `Database ${where} không phải database của dự án (không có bảng _prisma_migrations)`, [
      'Lần đầu cài: chạy npm run setup (tạo bảng + dữ liệu mẫu)',
      'Nếu bạn ĐÃ CÓ dữ liệu: backend đang nối nhầm database khác. Máy có 2 Postgres cùng cổng 5432 (Postgres Windows và Postgres trong Docker)? Tắt bớt một cái: docker stop fab-restaurant-db-1',
    ]);
  }

  const rows = await db.$queryRawUnsafe('SELECT migration_name, finished_at, rolled_back_at FROM _prisma_migrations');
  const broken = rows.filter((r) => !r.finished_at && !r.rolled_back_at).map((r) => r.migration_name);
  if (broken.length) {
    fail(`Migration bị lỗi giữa chừng: ${broken.join(', ')}`, [
      'Xem lỗi: npm --prefix backend exec prisma migrate status',
      'Hướng dẫn: https://pris.ly/d/migrate-resolve (hỏi lại trước khi xóa / reset database)',
    ]);
  }
  const applied = new Set(rows.filter((r) => r.finished_at).map((r) => r.migration_name));
  const pending = local.filter((m) => !applied.has(m));
  if (pending.length) {
    info(`Có ${pending.length} migration mới chưa áp dụng: ${pending.join(', ')}`);
    info('Đang cập nhật bảng (prisma migrate deploy, không xóa dữ liệu)...');
    await db.$disconnect();
    if (!prisma('migrate', 'deploy')) {
      fail('Cập nhật bảng thất bại', ['Xem lỗi ở trên; chạy lại tay: npm --prefix backend run db:deploy']);
    }
  }

  const [{ users }] = await db.$queryRawUnsafe(`SELECT count(*)::int AS users FROM "User"`);
  ok(`Database: ${version} · ${where} · ${local.length}/${local.length} migration · ${users} tài khoản`);
  if (users === 0) console.log('[db] ! Chưa có tài khoản nào: chạy npm --prefix backend run db:seed để có dữ liệu mẫu');
} finally {
  await db.$disconnect().catch(() => {});
}
