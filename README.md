# doc-to-sang-highlight

Đọc văn bản thành giọng nói trong trình duyệt (dùng Web Speech API có sẵn,
**miễn phí**, không cần dịch vụ TTS trả tiền), tô sáng từng từ đang đọc, tự
gọi callback khi đọc xong — dùng để tự chuyển trang, tự cuộn, v.v.

## Vì sao

Nhiều nơi cần tính năng "đọc cho tôi nghe, tô sáng chữ đang đọc" (sách điện
tử, bài học, tài liệu lật trang) nhưng hay trả phí dịch vụ TTS ngoài. Trình
duyệt hiện đại đã có sẵn `speechSynthesis` — gói này chỉ là lớp tiện ích mỏng
để tô sáng đúng từ đang đọc và báo khi đọc xong, không gọi ra ngoài, không
tốn phí.

## Cài đặt

```bash
npm install doc-to-sang-highlight
```

Hoặc dùng thẳng bằng thẻ `<script type="module">`, copy `index.js`.

## Dùng

```js
import { docVaToSang } from "doc-to-sang-highlight";

const dieuKhien = docVaToSang({
  text: "Nội dung cần đọc ở đây.",
  container: document.getElementById("vung-hien-chu"),
  lang: "vi-VN",       // mặc định vi-VN
  rate: 1,             // tốc độ đọc
  onDone: () => {
    console.log("Đọc xong trang này — tự chuyển trang sau nếu muốn.");
  },
  onTienDo: (tuDaDoc, tongSoTu) => {
    console.log(`${tuDaDoc}/${tongSoTu} từ`);
  },
});

// Dừng / tạm dừng / đọc tiếp
dieuKhien.dung();
dieuKhien.tamDung();
dieuKhien.tiepTuc();
```

Thêm CSS cho từ đang đọc:

```css
.dtsh-dang-doc {
  background: #FDE68A; /* vàng */
  border-radius: 3px;
}
```

## Tự chọn giọng tốt nhất (mặc định bật)

Trình duyệt thường có **cả giọng cục bộ** (cài sẵn hệ điều hành, hay nghe "robot") **và
giọng mạng** (tải từ Google/Microsoft khi có internet, tự nhiên hơn nhiều — vd "Google
Tiếng Việt", "Microsoft HoaiMy Online (Natural)"). Nếu chỉ đặt `utter.lang = 'vi-VN'` mà
không chọn `voice` cụ thể, trình duyệt tự lấy giọng ĐẦU TIÊN khớp ngôn ngữ — có thể là
giọng robot dù máy có giọng hay hơn.

Từ bản này, `docVaToSang()` **mặc định tự dò và chọn giọng tốt nhất** (ưu tiên đúng vùng
miền, rồi ưu tiên giọng mạng). Tắt bằng `tuChonGiongTotNhat: false` nếu muốn hành vi cũ.
Dùng riêng hàm chọn giọng (vd để hiện danh sách cho người dùng chọn tay):

```js
import { chonGiongTotNhat } from "doc-to-sang-highlight";

const giong = chonGiongTotNhat("vi-VN"); // null nếu trình duyệt chưa nạp xong danh sách giọng
```

⛔ **Số giọng thấy được tuỳ máy người dùng** — không đo được từ trình duyệt tự động hoá
(Playwright/headless thường chặn dịch vụ giọng mạng, báo 0 giọng dù người dùng thật thấy
nhiều). Phải tự mở trình duyệt thật, có mạng, để thấy đúng số giọng thật.

## Giới hạn đã biết

- Độ hỗ trợ sự kiện `boundary` (báo đúng từng từ) khác nhau giữa trình duyệt
  và giọng đọc hệ thống — Chrome/Edge thường ổn cho tiếng Việt; Safari/Firefox
  có thể không tô sáng mượt dù giọng đọc vẫn chạy bình thường.
- Chất lượng giọng tiếng Việt phụ thuộc giọng cài sẵn của hệ điều hành/trình
  duyệt người dùng — gói này không mang theo giọng đọc riêng, chỉ chọn giọng
  tốt nhất trong số giọng đã có sẵn.

## Phép thử

```bash
node test.mjs
```

## Giấy phép

MIT
