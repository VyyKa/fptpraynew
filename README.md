# FPT Pray · Bản clone Next.js

Trang “bàn thờ số” mô phỏng fptpray.com. Người dùng nhập email & tâm nguyện, bấm gửi để cắm nhang, phát nhạc, rơi cánh hoa và lưu nội dung vào Google Docs cho đội dự án.

## Chức năng chính

- UI bàn thờ kính với nhang, khói, cánh hoa và hiệu ứng nhạc Web Audio API.
- Form nhập email + mong ước, hiển thị trạng thái gửi.
- API route `/api/prayers` xác thực dữ liệu bằng `zod`.
- Ghi log vào Google Docs qua service account (`googleapis`).
- Chuẩn Next.js App Router + Tailwind v4, sẵn sàng deploy lên Vercel.

## Yêu cầu hệ thống

- Node.js 18.18+ (khuyến nghị 20 LTS).
- npm 9+.

## Cài đặt & chạy dev

```bash
npm install
npm run dev
# mở http://localhost:3000
```

Kiểm tra lint:

```bash
npm run lint
```

Build production:

```bash
npm run build
npm start
```

## Biến môi trường

| Tên | Mô tả |
| --- | --- |
| `N8N_WEBHOOK_URL` | URL webhook của workflow n8n (ví dụ: `https://eclatduteint.vn/webhook/get-email`). |
| `N8N_WEBHOOK_SECRET` _(optional)_ | Secret header gửi kèm (đặt trong webhook node). |
| `NEXT_PUBLIC_GAS_WEBAPP_URL` _(optional)_ | URL Google Apps Script Web App dùng để ghi trực tiếp vào Google Sheets. Nếu khai báo biến này, FE sẽ gửi payload thẳng tới GAS. |
| `NEXT_PUBLIC_SITE_URL` _(optional)_ | URL deploy thực tế, giúp Next.js tạo metadata tuyệt đối. |

Tạo file `.env.local` ở gốc dự án và điền các giá trị trên (file `.env*` đã bị ignore).

## Kết nối workflow n8n

1. Trong n8n tạo workflow:
   - **Webhook node** (POST) nhận `email`, `wish`.
   - Các node xử lý (ghi Google Sheets, gửi email…).
   - **Respond to Webhook** trả JSON `{ "success": true }`.
2. Lấy URL webhook (và secret nếu có) → cấu hình vào `.env.local`.
3. FE gọi `/api/prayers`. API route trên Next.js sẽ proxy payload sang webhook, đảm bảo khóa API không lộ và không bị CORS.
4. Bạn có thể mở rộng workflow n8n cho bất kỳ quy trình nào khác mà không cần sửa FE.

## Tùy chỉnh giao diện

- Thay ảnh bàn thờ hoặc cây nhang bằng cách đặt file vào `public/` rồi đổi `background-image` trong `IncenseStage`.
- Có thể thêm file nhạc của riêng bạn tại `public/incense.mp3` và cập nhật hook âm thanh nếu muốn dùng audio file thay vì Web Audio API.

## Deploy Vercel

```bash
vercel login
vercel
```

Trên dashboard Vercel:

1. Import repo từ GitHub.
2. Ở mục **Environment Variables**, thêm các biến giống `.env.local`.
3. Deploy → kiểm tra logs API trên tab **Functions** nếu cần.

Mặc định build command `npm run build`, output `Next.js App` theo chuẩn. Không cần cấu hình thêm.

---

Nếu bạn cần mở rộng (ví dụ: gửi email xác nhận, dashboard thống kê, kết nối Google Sheets), chỉ cần tạo thêm API route và reuse helper `appendPrayerToDoc`.
