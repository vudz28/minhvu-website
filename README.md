# Minh Vũ — Gaming Profile

Website tĩnh HTML/CSS/JS. Có thể chạy bằng cách mở `index.html` hoặc triển khai lên Cloudflare Pages.

## Thiết lập Discord presence tự động

1. Mở `config.js`.
2. Điền Discord User ID của bạn vào `discordId`. Đây là ID số, không phải username, mật khẩu hay token.
3. Tham gia máy chủ Lanyard để cho phép dịch vụ cung cấp presence của bạn: https://discord.com/servers/lanyard-819285379982557265
4. Điền các liên kết của bạn trong `links`.
5. Lưu lại và mở lại website.

Lanyard cung cấp trạng thái và hoạt động mà Discord chia sẻ; dữ liệu có thể không xuất hiện nếu bạn chưa tham gia, chưa có presence hoặc dịch vụ tạm thời không hoạt động. Không bao giờ đưa mật khẩu hoặc token Discord vào website.

## Lấy Discord User ID

Trong Discord, bật Developer Mode ở User Settings → Advanced → Developer Mode. Sau đó nhấp chuột phải vào hồ sơ của chính bạn và chọn Copy User ID. Tên menu có thể khác nhẹ theo phiên bản ứng dụng.

## Đưa lên Cloudflare Pages miễn phí

1. Đăng nhập Cloudflare: https://dash.cloudflare.com/
2. Mở Workers & Pages → Create application → Pages.
3. Chọn Direct Upload nếu bạn muốn tải thư mục website lên trực tiếp, hoặc kết nối Git repository.
4. Đảm bảo `index.html`, `style.css`, `script.js`, `config.js` và thư mục `assets` nằm ở thư mục gốc.
5. Sau khi deploy, Cloudflare cấp địa chỉ dạng `ten-du-an.pages.dev`.

Xem hướng dẫn: https://developers.cloudflare.com/pages/framework-guides/deploy-anything/

## Tùy chỉnh
- Sửa tên, Discord ID và liên kết trong `config.js`.
- Sửa nội dung game, giới thiệu, kỹ năng trong `index.html`.
- Đổi màu và bố cục trong `style.css`.


## Phiên bản giao diện personal landing page

Giao diện đã được chuyển sang phong cách tối giản, lấy cảm hứng từ bố cục portfolio/profile: màn hình mở đầu, chữ lớn, hồ sơ Discord, Now Playing và My Sites.

### Thiết lập nhạc
Trong `config.js`, thêm một hoặc nhiều bài vào `music.playlist`. Mỗi bài có `title`, `artist`, `audioUrl` (URL trực tiếp tới tệp âm thanh) và `coverUrl` (URL ảnh hoặc đường dẫn tương đối như `assets/cover.jpg`). Website tự tạo danh sách chọn bài, hỗ trợ bài trước/tiếp theo, phát/tạm dừng, tắt tiếng và kéo thanh tiến trình. Nếu playlist trống, bạn sẽ thấy hướng dẫn cấu hình. Trình duyệt thường chặn tự phát âm thanh trước khi người dùng bấm nút, nên người xem cần bấm Play lần đầu.
