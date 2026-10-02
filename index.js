/**
 * doc-to-sang-highlight — đọc văn bản thành giọng nói (Web Speech API, miễn phí,
 * có sẵn trong trình duyệt), tô sáng từng từ đang đọc, gọi callback khi đọc xong.
 *
 * Không phụ thuộc thư viện nào, chạy thẳng trên trình duyệt (ES module hoặc script thường).
 * Không cần dịch vụ TTS trả phí — dùng SpeechSynthesis có sẵn của hệ điều hành/trình duyệt.
 */

/**
 * @typedef {Object} DocOptions
 * @property {string} text Văn bản cần đọc
 * @property {HTMLElement} container Nơi hiện chữ có tô sáng (sẽ bị ghi đè nội dung)
 * @property {string} [lang] Mã ngôn ngữ giọng đọc, mặc định 'vi-VN'
 * @property {number} [rate] Tốc độ đọc 0.1–10, mặc định 1
 * @property {boolean} [tuChonGiongTotNhat] Tự chọn giọng tốt nhất trong các giọng có sẵn
 *   (ưu tiên giọng online/mạng — thường tự nhiên hơn giọng cục bộ của hệ điều hành),
 *   mặc định true. Tắt nếu muốn để trình duyệt tự chọn như cũ.
 * @property {string} [highlightClass] Class CSS cho từ đang đọc, mặc định 'dtsh-dang-doc'
 * @property {() => void} [onDone] Gọi khi đọc xong hết văn bản
 * @property {(tuDaDoc: number, tongSoTu: number) => void} [onTienDo] Gọi mỗi khi qua 1 từ
 */

/**
 * Chọn giọng tốt nhất trong các giọng trình duyệt đang có cho một ngôn ngữ.
 *
 * Trình duyệt thường có CẢ HAI loại giọng cho cùng 1 ngôn ngữ: giọng CỤC BỘ (cài sẵn
 * trong hệ điều hành, thường nghe "robot") và giọng MẠNG (tải từ máy chủ Google/Microsoft
 * khi có internet, thường tự nhiên hơn nhiều — vd "Google Tiếng Việt", "Microsoft HoaiMy
 * Online (Natural)"). Mặc định `SpeechSynthesisUtterance` chỉ đặt `lang` thì trình duyệt
 * tự chọn giọng ĐẦU TIÊN khớp ngôn ngữ — có thể rơi vào giọng robot dù máy có giọng hay hơn.
 * Hàm này quét hết giọng khớp `lang`, ưu tiên giọng KHÔNG phải cục bộ (`localService === false`).
 *
 * @param {string} lang Mã ngôn ngữ, vd 'vi-VN'
 * @returns {SpeechSynthesisVoice | null} Giọng tốt nhất tìm được, hoặc null nếu chưa có giọng nào
 *   khớp (trình duyệt có thể chưa nạp xong danh sách giọng — gọi lại sau sự kiện `voiceschanged`).
 */
export function chonGiongTotNhat(lang) {
  if (!("speechSynthesis" in window)) return null;
  const tatCa = window.speechSynthesis.getVoices();
  const ma = lang.toLowerCase();
  const khopNgonNgu = tatCa.filter((v) => v.lang.toLowerCase().startsWith(ma.split("-")[0]));
  if (khopNgonNgu.length === 0) return null;
  // Ưu tiên (thứ tự giảm dần, vùng miền LUÔN thắng trước): (1) khớp đúng cả vùng miền
  // (vi-VN khớp vi-VN, không khớp vi-US...) — nhân hệ số lớn để không bao giờ bị hệ số
  // (2) giọng MẠNG (localService === false, thường tự nhiên hơn giọng cục bộ) lấn át.
  const diem = (v) => (v.lang.toLowerCase() === ma ? 10 : 0) + (v.localService ? 0 : 1);
  khopNgonNgu.sort((a, b) => diem(b) - diem(a));
  return khopNgonNgu[0];
}

/**
 * Bắt đầu đọc 1 đoạn văn bản, tô sáng từng từ đang đọc trong `container`.
 * @param {DocOptions} opt
 * @returns {{ dung: () => void, tamDung: () => void, tiepTuc: () => void }}
 */
export function docVaToSang(opt) {
  if (!("speechSynthesis" in window)) {
    throw new Error("Trình duyệt này không hỗ trợ đọc giọng nói (SpeechSynthesis).");
  }
  const {
    text,
    container,
    lang = "vi-VN",
    rate = 1,
    highlightClass = "dtsh-dang-doc",
    tuChonGiongTotNhat = true,
    onDone,
    onTienDo,
  } = opt;

  // Tách từ, giữ lại khoảng trắng/dấu câu để ráp lại y nguyên khi hiện.
  const phanManh = text.split(/(\s+)/);
  const spans = [];
  container.innerHTML = "";
  for (const doan of phanManh) {
    if (/^\s+$/.test(doan) || doan === "") {
      container.appendChild(document.createTextNode(doan));
    } else {
      const span = document.createElement("span");
      span.textContent = doan;
      container.appendChild(span);
      spans.push(span);
    }
  }

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = rate;
  if (tuChonGiongTotNhat) {
    const giong = chonGiongTotNhat(lang);
    if (giong) utter.voice = giong;
  }

  // 'boundary' báo vị trí ký tự (charIndex) mỗi khi qua 1 từ — map ngược về span.
  // Độ hỗ trợ: Chrome/Edge tốt cho nhiều ngôn ngữ; một số trình duyệt/giọng không bắn
  // sự kiện boundary đều — lúc đó tô sáng sẽ không mượt, nhưng việc ĐỌC vẫn chạy.
  let viTriKyTu = 0;
  utter.onboundary = (ev) => {
    if (ev.name !== "word") return;
    viTriKyTu = ev.charIndex;
    const truocDo = text.slice(0, viTriKyTu);
    const soTuTruocDo = (truocDo.match(/\S+/g) || []).length;
    spans.forEach((s, i) => s.classList.toggle(highlightClass, i === soTuTruocDo));
    if (onTienDo) onTienDo(soTuTruocDo, spans.length);
  };

  utter.onend = () => {
    spans.forEach((s) => s.classList.remove(highlightClass));
    if (onDone) onDone();
  };

  window.speechSynthesis.cancel(); // đừng chồng nhiều lượt đọc
  window.speechSynthesis.speak(utter);

  return {
    dung: () => window.speechSynthesis.cancel(),
    tamDung: () => window.speechSynthesis.pause(),
    tiepTuc: () => window.speechSynthesis.resume(),
  };
}
