# Lộ trình Cải tiến ứng dụng RANDOM (ROADMAP)

Dưới đây là kế hoạch chi tiết nhằm tối ưu hóa mã nguồn, giảm dung lượng và nâng cao hiệu suất cho ứng dụng RANDOM.

## 1. Tối ưu hóa Kiến trúc Mã nguồn (Modularization)
- **Mục tiêu:** Giảm sự phụ thuộc vào một file `script.js` duy nhất.
- **Thực hiện:** Chia nhỏ thành các file chuyên biệt:
    - `SpinEngine.js`: Xử lý logic quay số và kiểm tra trùng lặp.
    - `FireworkEngine.js`: Quản lý hệ thống hiệu ứng pháo hoa.
    - `UIManager.js`: Quản lý hiển thị giao diện, modal và âm thanh.

## 2. Giảm dung lượng phát sinh
- **Mục tiêu:** Giảm kích thước file `.exe` cuối cùng.
- **Thực hiện:**
    - Loại bỏ thư viện `lodash`, thay thế bằng JavaScript thuần (ES6+).
    - Nén tài nguyên hình ảnh (chuyển PNG sang WebP).
    - Nén các tệp âm thanh MP3 về bitrate thấp hơn (64kbps - 128kbps).

## 3. Nâng cao Hiệu suất (Performance)
- **Mục tiêu:** Ứng dụng chạy mượt mà trên mọi cấu hình máy tính.
- **Thực hiện:**
    - Thay thế các `setInterval` bằng `requestAnimationFrame` cho các chuyển động UI.
    - Tận dụng tăng tốc phần cứng (GPU) bằng cách sử dụng `will-change: transform` trong CSS cho các hiệu ứng chuyển động.

## 4. Bảo mật & Tiêu chuẩn Electron (Best Practices)
- **Mục tiêu:** Tuân thủ các tiêu chuẩn bảo mật hiện đại của Electron.
- **Thực hiện:**
    - Tắt `nodeIntegration: true`.
    - Triển khai **Preload Script** và **Context Bridge** để giao tiếp an toàn giữa Main và Renderer process.

---
*Kế hoạch này được lưu trữ để phục vụ việc phát triển và nâng cấp trong tương lai.*
