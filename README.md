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

## Giới hạn đã biết

- Độ hỗ trợ sự kiện `boundary` (báo đúng từng từ) khác nhau giữa trình duyệt
  và giọng đọc hệ thống — Chrome/Edge thường ổn cho tiếng Việt; Safari/Firefox
  có thể không tô sáng mượt dù giọng đọc vẫn chạy bình thường.
- Chất lượng giọng tiếng Việt phụ thuộc giọng cài sẵn của hệ điều hành/trình
  duyệt người dùng — gói này không mang theo giọng đọc riêng.

## Giấy phép

MIT
