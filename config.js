// Cấu hình website — chỉ sửa các giá trị bên dưới.
// Discord ID là ID người dùng dạng số, KHÔNG phải username, mật khẩu hay token.
window.SITE_CONFIG = {
  displayName: "Đoàn Minh Vũ",
  discordId: "", // Ví dụ: "123456789012345678" — điền Discord User ID của bạn
  discordInviteOrProfile: "https://discord.com/app",
  music: {
    // Thêm một hoặc nhiều bài. audioUrl phải là URL trực tiếp tới tệp âm thanh.
    // coverUrl có thể là URL ảnh hoặc đường dẫn tương đối, ví dụ: "assets/cover.jpg".
    playlist: [
      // Bỏ dấu // ở ví dụ dưới và điền thông tin của bạn:
      // { title: "Tên bài hát", artist: "Nghệ sĩ", audioUrl: "https://example.com/song.mp3", coverUrl: "assets/cover.jpg" }
    ],
    // Các giá trị dưới đây được dùng làm fallback cho cấu hình một bài nhạc cũ.
    title: "Chưa chọn bài nhạc",
    artist: "Thêm danh sách nhạc trong config.js",
    audioUrl: "",
    coverUrl: ""
  },
  links: {
    discord: "https://discord.com/app",
    github: "https://github.com/",
    facebook: "https://facebook.com/"
  }
};
