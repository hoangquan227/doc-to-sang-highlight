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
 * @property {string} [highlightClass] Class CSS cho từ đang đọc, mặc định 'dtsh-dang-doc'
 * @property {() => void} [onDone] Gọi khi đọc xong hết văn bản
 * @property {(tuDaDoc: number, tongSoTu: number) => void} [onTienDo] Gọi mỗi khi qua 1 từ
 */

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
