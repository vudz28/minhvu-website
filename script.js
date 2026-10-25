(() => {
  const cfg = window.SITE_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  $("year").textContent = new Date().getFullYear();

  // Áp dụng các liên kết mạng xã hội từ config.js.
  document.querySelectorAll("[data-link]").forEach((a) => {
    const key = a.dataset.link;
    const url = cfg.links && cfg.links[key];
    if (url) a.href = url;
    if (!url || url === "#") {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        alert("Bạn hãy thêm liên kết " + key + " trong file config.js nhé.");
      });
    }
  });
  $("discordProfileLink").href = cfg.discordInviteOrProfile || "https://discord.com/app";
  $("contactDiscord").textContent = cfg.links?.discord ? "Mở hồ sơ / Discord" : "Thêm liên kết trong config.js";

  const id = String(cfg.discordId || "").trim();
  const validId = /^\d{17,20}$/.test(id);
  const statusMap = { online: "Online", idle: "Idle", dnd: "Do Not Disturb", offline: "Offline" };
  let socket, heartbeat, reconnectTimer, reconnectDelay = 2000, manuallyClosed = false;

  function setStatus(status) {
    const dot = $("statusDot");
    dot.className = "status-dot " + ({
      online: "status-online", idle: "status-idle", dnd: "status-dnd", offline: "status-offline"
    }[status] || "status-unknown");
    $("statusText").textContent = statusMap[status] || "Chưa rõ trạng thái";
  }
  function setConnection(text) { $("connectionState").textContent = text; }
  function activityLabel(a) {
    if (!a) return "";
    if (a.type === 4) return a.state || "Custom status";
    if (a.name === "Spotify" && a.details) return "Nghe Spotify: " + a.details + (a.state ? " — " + a.state : "");
    if (a.name === "Custom Status") return a.state || a.details || "Custom status";
    if (a.name) return a.name + (a.details ? " — " + a.details : "");
    return a.details || a.state || "";
  }
  function renderPresence(p) {
    if (!p) return;
    const user = p.discord_user || {};
    const name = user.global_name || user.display_name || user.username || cfg.displayName || "Đoàn Minh Vũ";
    $("discordName").textContent = name;
    $("discordHandle").textContent = user.username ? "@" + user.username : "Discord presence";
    if (user.id && user.avatar) {
      const ext = user.avatar.startsWith("a_") ? "gif" : "png";
      $("discordAvatar").src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=256`;
      $("heroAvatar").innerHTML = `<img alt="Discord avatar" src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=512">`;
      const heroImg = $("heroAvatar").querySelector("img");
      heroImg.style.cssText = "width:100%;height:100%;object-fit:cover;position:relative;z-index:2";
    } else if (user.id && user.avatar === null) {
      const index = Number(user.discriminator || 0) % 5;
      $("discordAvatar").src = `https://cdn.discordapp.com/embed/avatars/${index}.png`;
    }
    const status = p.discord_status || "offline";
    setStatus(status);
    const activities = Array.isArray(p.activities) ? p.activities : [];
    const visible = activities.filter(a => a.name && a.name !== "Custom Status");
    const custom = activities.find(a => a.type === 4 || a.name === "Custom Status");
    const list = $("activityList");
    list.innerHTML = "";
    if (custom) {
      const note = document.createElement("div");
      note.className = "activity-item";
      note.innerHTML = "<strong>Custom status</strong>";
      const text = document.createElement("span");
      text.textContent = [custom.emoji?.name, custom.state].filter(Boolean).join(" ");
      note.appendChild(text); list.appendChild(note);
    }
    visible.forEach(a => {
      const item = document.createElement("div");
      item.className = "activity-item";
      const title = document.createElement("strong");
      title.textContent = a.name === "Spotify" ? "♫ Spotify" : "▶ " + a.name;
      const detail = document.createElement("span");
      detail.textContent = [a.details, a.state].filter(Boolean).join(" • ") || "Đang hoạt động";
      item.append(title, detail); list.appendChild(item);
    });
    if (p.listening_to_spotify && p.spotify) {
      const s = p.spotify;
      const item = document.createElement("div"); item.className = "activity-item";
      const title = document.createElement("strong"); title.textContent = "♫ Đang nghe Spotify";
      const detail = document.createElement("span"); detail.textContent = `${s.song || "Bài hát"} — ${s.artist || "Nghệ sĩ"}`;
      item.append(title, detail); list.appendChild(item);
    }
    if (!list.children.length) {
      const empty = document.createElement("div"); empty.className = "activity-placeholder";
      empty.textContent = status === "offline" ? "Hiện không có hoạt động công khai." : "Discord chưa chia sẻ hoạt động nào.";
      list.appendChild(empty);
    }
    $("activityText").textContent = visible.length ? visible.map(a => a.name).join(", ") : (p.listening_to_spotify ? "Spotify" : "Không có hoạt động công khai");
    $("lastUpdated").textContent = "Cập nhật: " + new Date().toLocaleTimeString("vi-VN", {hour:"2-digit", minute:"2-digit", second:"2-digit"});
    setConnection("CONNECTED");
  }
  function showSetupMessage() {
    setConnection("NOT CONFIGURED");
    $("discordHandle").textContent = "Cần Discord User ID để đồng bộ";
    $("activityList").innerHTML = '<div class="activity-placeholder">Mở file <b>config.js</b>, điền Discord User ID. Sau đó tham gia máy chủ Lanyard để cho phép chia sẻ presence.</div>';
    $("lastUpdated").textContent = "Chưa thiết lập";
  }
  function connect() {
    if (!validId) { showSetupMessage(); return; }
    manuallyClosed = false;
    try { socket = new WebSocket("wss://api.lanyard.rest/socket"); }
    catch (_) { setConnection("CONNECTION ERROR"); return; }
    socket.onopen = () => { reconnectDelay = 2000; };
    socket.onmessage = (event) => {
      let msg;
      try { msg = JSON.parse(event.data); } catch (_) { return; }
      if (msg.op === 1) {
        clearInterval(heartbeat);
        heartbeat = setInterval(() => {
          if (socket && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({op: 3}));
        }, msg.d.heartbeat_interval);
        socket.send(JSON.stringify({op: 2, d: {subscribe_to_id: id}}));
      } else if (msg.op === 0 && msg.t === "INIT_STATE") {
        renderPresence(msg.d);
      } else if (msg.op === 0 && msg.t === "PRESENCE_UPDATE") {
        const data = msg.d;
        if (data && (data.discord_user?.id === id || data.user_id === id)) renderPresence(data);
      } else if (msg.op === 1) {
        // Hello is handled above; included for clarity.
      }
    };
    socket.onerror = () => setConnection("RETRYING");
    socket.onclose = () => {
      clearInterval(heartbeat);
      if (manuallyClosed) return;
      setConnection("RECONNECTING");
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connect, reconnectDelay);
      reconnectDelay = Math.min(reconnectDelay * 1.7, 30000);
    };
  }
  if (validId) connect(); else showSetupMessage();

  // Welcome screen. Guard storage access so local preview still works in restricted browsers.
  const intro = $("introScreen");
  const enter = $("enterSite");
  let introSeen = false;
  try { introSeen = sessionStorage.getItem("mvIntroSeen") === "1"; } catch (_) {}
  if (enter && intro) enter.addEventListener("click", () => {
    intro.classList.add("is-hidden");
    try { sessionStorage.setItem("mvIntroSeen", "1"); } catch (_) {}
  });
  if (intro && introSeen) intro.classList.add("is-hidden");

  // Custom personal music player. A playlist can contain any number of user-provided tracks.
  const music = cfg.music || {};
  const audio = new Audio();
  audio.preload = "metadata";
  audio.loop = false;
  const playButton = $("playTrack");
  const trackSelect = $("trackSelect");
  const legacyTrack = music.audioUrl ? [{
    title: music.title || "Now Playing", artist: music.artist || "Unknown",
    audioUrl: music.audioUrl, coverUrl: music.coverUrl || ""
  }] : [];
  const playlist = (Array.isArray(music.playlist) ? music.playlist : [])
    .filter(t => t && typeof t.audioUrl === "string" && t.audioUrl.trim())
    .map((t, i) => ({
      title: String(t.title || `Track ${i + 1}`),
      artist: String(t.artist || "Unknown artist"),
      url: t.audioUrl.trim(),
      cover: typeof t.coverUrl === "string" ? t.coverUrl.trim() : ""
    }));
  if (!playlist.length) {
    legacyTrack.forEach((t, i) => playlist.push({title:String(t.title), artist:String(t.artist), url:t.audioUrl.trim(), cover:String(t.coverUrl || "")}));
  }
  let trackIndex = 0;
  function timeFmt(seconds) {
    if (!Number.isFinite(seconds)) return "00:00";
    const m = Math.floor(seconds / 60), s = Math.floor(seconds % 60);
    return String(m).padStart(2,"0") + ":" + String(s).padStart(2,"0");
  }
  function updatePlayUi(playing) {
    if (playButton) playButton.textContent = playing ? "Ⅱ" : "▶";
    const soundToggle = $("soundToggle");
    if (soundToggle) soundToggle.innerHTML = playing ? '♫ <span>PLAYING</span>' : '♫ <span>PLAYER</span>';
  }
  function setCover(url) {
    const cover = $("musicCover");
    if (!cover) return;
    cover.style.backgroundImage = "";
    cover.style.backgroundSize = "cover";
    if (url) {
      // CSS background URL is escaped to avoid quotes breaking the declaration.
      const safeUrl = url.replace(/["\\\\]/g, "\\$&");
      cover.style.backgroundImage = `linear-gradient(#10121a22,#10121a44),url("${safeUrl}")`;
      cover.style.backgroundPosition = "center";
    }
  }
  function renderTrackOptions() {
    if (!trackSelect) return;
    trackSelect.innerHTML = "";
    if (!playlist.length) {
      const option = document.createElement("option"); option.value = ""; option.textContent = "Chưa có danh sách nhạc"; trackSelect.appendChild(option); trackSelect.disabled = true;
      return;
    }
    trackSelect.disabled = false;
    playlist.forEach((track, i) => {
      const option = document.createElement("option"); option.value = String(i); option.textContent = `${track.title} — ${track.artist}`; trackSelect.appendChild(option);
    });
  }
  function loadTrack(index, autoplay = false) {
    if (!playlist.length) {
      $("trackTitle").textContent = music.title || "Chưa chọn bài nhạc";
      $("trackArtist").textContent = music.artist || "Thêm danh sách nhạc trong config.js";
      setCover(""); updatePlayUi(false); return;
    }
    trackIndex = (index + playlist.length) % playlist.length;
    const track = playlist[trackIndex];
    audio.src = track.url;
    $("trackTitle").textContent = track.title;
    $("trackArtist").textContent = track.artist;
    $("currentTime").textContent = "00:00";
    $("duration").textContent = "00:00";
    $("trackProgress").style.width = "0%";
    setCover(track.cover);
    if (trackSelect) trackSelect.value = String(trackIndex);
    if (autoplay) audio.play().then(() => updatePlayUi(true)).catch(() => {
      updatePlayUi(false); $("trackArtist").textContent = "Không phát được tệp này. Hãy kiểm tra URL âm thanh.";
    });
    else updatePlayUi(false);
  }
  renderTrackOptions();
  if (playlist.length) loadTrack(0);
  if (playButton) playButton.addEventListener("click", async () => {
    if (!playlist.length) {
      alert("Hãy thêm ít nhất một bài trong music.playlist ở config.js. Cần URL trực tiếp tới tệp âm thanh và có thể thêm coverUrl.");
      return;
    }
    if (audio.paused) {
      try { await audio.play(); updatePlayUi(true); }
      catch (_) { $("trackArtist").textContent = "Trình duyệt không phát được tệp này. Kiểm tra URL hoặc định dạng âm thanh."; }
    } else { audio.pause(); updatePlayUi(false); }
  });
  $("prevTrack")?.addEventListener("click", () => { if (playlist.length) loadTrack(trackIndex - 1, true); });
  $("nextTrack")?.addEventListener("click", () => { if (playlist.length) loadTrack(trackIndex + 1, true); });
  trackSelect?.addEventListener("change", () => { const index = Number(trackSelect.value); if (Number.isInteger(index) && playlist[index]) loadTrack(index, true); });
  $("muteTrack")?.addEventListener("click", () => { audio.muted = !audio.muted; $("muteTrack").textContent = audio.muted ? "×" : "♫"; });
  $("soundToggle")?.addEventListener("click", () => {
    $("music")?.scrollIntoView({behavior:"smooth"});
    if (playlist.length && audio.paused) playButton?.click();
  });
  $("trackProgress")?.parentElement?.addEventListener("click", (event) => {
    if (!Number.isFinite(audio.duration) || !audio.duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    audio.currentTime = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)) * audio.duration;
  });
  audio.addEventListener("timeupdate", () => {
    $("currentTime").textContent = timeFmt(audio.currentTime);
    $("duration").textContent = timeFmt(audio.duration);
    $("trackProgress").style.width = audio.duration ? (audio.currentTime / audio.duration * 100) + "%" : "0%";
  });
  audio.addEventListener("play", () => updatePlayUi(true));
  audio.addEventListener("pause", () => updatePlayUi(false));
  audio.addEventListener("ended", () => {
    if (playlist.length > 1) loadTrack(trackIndex + 1, true);
    else updatePlayUi(false);
  });

  window.addEventListener("beforeunload", () => {
    manuallyClosed = true; clearInterval(heartbeat); clearTimeout(reconnectTimer);
    if (socket) socket.close();
  });
})();
