# Minh Vũ — Personal Portfolio

Website portfolio tĩnh bằng HTML, CSS và JavaScript, thiết kế tối giản nền tối, tham khảo phong cách profile cá nhân hiện đại.

## Bố cục
- Hero / intro mở đầu
- About Me
- My Skills
- Projects
- Discord Profile (Lanyard presence)
- Music Player
- Games, My Sites và Contact

## Cấu hình Discord
1. Mở `config.js`.
2. Điền Discord User ID vào `discordId` (ID số công khai; không dùng mật khẩu hoặc token).
3. Tham gia Lanyard để presence có thể hiển thị: https://discord.com/servers/lanyard-819285379982557265
4. Điền các liên kết trong `links`.

## Cấu hình nhạc
Trong `config.js`, thêm bài hát vào `music.playlist`, với `title`, `artist`, `audioUrl` và `coverUrl`. Chỉ dùng âm thanh mà bạn có quyền sử dụng.

## Chạy thử
Mở `index.html` trong trình duyệt. Để Discord presence hoạt động ổn định, chạy website qua hosting HTTPS như GitHub Pages.

## Triển khai GitHub Pages
1. Đưa tất cả file và thư mục bên trong ZIP lên repository.
2. Đảm bảo `index.html` nằm ở thư mục gốc.
3. Mở Settings → Pages.
4. Source: Deploy from a branch; Branch: `main`; Folder: `/ (root)`; Save.


Bố cục bản cập nhật: hồ sơ/hoạt động Discord ngay dưới phần đầu trang, giới thiệu bản thân, kỹ năng backend; đã bỏ hẳn mục Projects.
