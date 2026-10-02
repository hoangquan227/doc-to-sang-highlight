// Phép thử logic chonGiongTotNhat() — giả lập window.speechSynthesis vì không có trình duyệt thật.
// Chạy: node test.mjs

function diem(v) {
  return (v.lang.toLowerCase() === "vi-vn" ? 10 : 0) + (v.localService ? 0 : 1);
}

function chonGiongTotNhatGiaLap(tatCa, lang) {
  const ma = lang.toLowerCase();
  const khop = tatCa.filter((v) => v.lang.toLowerCase().startsWith(ma.split("-")[0]));
  if (khop.length === 0) return null;
  khop.sort((a, b) => diem(b) - diem(a));
  return khop[0];
}

function test(ten, fn) {
  try {
    fn();
    console.log("OK  " + ten);
  } catch (e) {
    console.log("DO  " + ten + " — " + e.message);
    process.exitCode = 1;
  }
}

test("ưu tiên giọng MẠNG hơn giọng CỤC BỘ cùng ngôn ngữ", () => {
  const voices = [
    { name: "Robot cục bộ", lang: "vi-VN", localService: true },
    { name: "Giọng online tự nhiên", lang: "vi-VN", localService: false },
  ];
  const got = chonGiongTotNhatGiaLap(voices, "vi-VN");
  if (got.name !== "Giọng online tự nhiên") throw new Error("chọn nhầm giọng: " + got.name);
});

test("ưu tiên khớp đúng vùng miền hơn chỉ khớp ngôn ngữ", () => {
  const voices = [
    { name: "Vietnamese khác vùng", lang: "vi-US", localService: false },
    { name: "Đúng vi-VN nhưng cục bộ", lang: "vi-VN", localService: true },
  ];
  const got = chonGiongTotNhatGiaLap(voices, "vi-VN");
  if (got.name !== "Đúng vi-VN nhưng cục bộ") throw new Error("chọn nhầm giọng: " + got.name);
});

test("không có giọng khớp ngôn ngữ thì trả về null", () => {
  const voices = [{ name: "English", lang: "en-US", localService: true }];
  const got = chonGiongTotNhatGiaLap(voices, "vi-VN");
  if (got !== null) throw new Error("đáng lẽ null, lại ra: " + JSON.stringify(got));
});

test("THỬ PHÁ: đảo điểm ưu tiên (localService đảo dấu) phải cho kết quả KHÁC", () => {
  const voices = [
    { name: "Robot cục bộ", lang: "vi-VN", localService: true },
    { name: "Giọng online tự nhiên", lang: "vi-VN", localService: false },
  ];
  const diemSai = (v) => (v.lang.toLowerCase() === "vi-vn" ? 10 : 0) + (v.localService ? 1 : 0); // cố ý đảo dấu
  const khop = [...voices].sort((a, b) => diemSai(b) - diemSai(a));
  if (khop[0].name === chonGiongTotNhatGiaLap(voices, "vi-VN").name) {
    throw new Error("phép thử không phân biệt được logic đúng với logic bị đảo dấu");
  }
});
