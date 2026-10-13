# Theme và minh họa Remotion

Đọc khi chốt giao diện hoặc viết kế hoạch đồ họa. Theme thay đổi đồ họa; không tự đổi phụ đề, audio, thời lượng hay cách đóng khung nguồn.

## Chọn theme

| Preset | Giao diện | Dùng khi |
|---|---|---|
| `dark-tech` | Xanh than, nhấn xanh cyan, nền gradient | AI, công nghệ, giải thích hệ thống |
| `light-minimal` | Nền sáng, chữ tối, nhấn xanh lam | Bài giảng, quy trình rõ ràng, ít trang trí |
| `warm-story` | Nền kem, nhấn đất nung, thẻ bo mềm | Kể chuyện, hành trình, chia sẻ gần gũi |
| `henry-brand` | Than, trắng, nhấn vàng `#FFE600`, nền trơn | Preset Henry dựa trên màu nhấn phụ đề đã chọn; không phải tuyên bố bộ nhận diện chính thức |
| `legacy-lime` | Đen/xanh than, lime, lưới mờ | Tương thích cấu hình cũ hoặc khi người dùng chọn phong cách này |

Mỗi video dùng một theme chủ đạo. Có thể đổi theo beat khi có lý do nội dung; không đổi màu ngẫu nhiên để tạo vẻ đa dạng. Nếu anh giao tự chọn, chọn theo nội dung, ghi vào cấu hình, không mặc định mọi video dùng đen–lime–lưới. Nếu chưa được giao tự chọn hoặc chưa chốt giao diện, hỏi câu giao diện trong `edit-interview.md` trước khi dựng.

Lưu trong `edit_options.json` của đúng nguồn:

```json
{
  "graphics_theme": {
    "preset": "light-minimal",
    "backgroundStyle": "solid",
    "cardStyle": "rounded",
    "motion": "gentle"
  }
}
```

Có thể thêm `accent` và `background` (hex sáu chữ số), `fontFamily` (font đủ dấu đã kiểm tra). `backgroundStyle`: `solid`, `gradient`, `grid`. `cardStyle`: `rounded`, `square`, `pill`. `motion`: `gentle`, `balanced`, `energetic` điều chỉnh biên độ chuyển động, không đổi timestamps lời thoại. Font đồ họa mặc định Arial; font phụ đề vẫn là lựa chọn riêng. Màu chữ trên nền/màu nhấn tùy chỉnh được chọn tự động để có độ tương phản; vẫn xem khung thực tế, nhất là đường kẻ trên nền sáng.

Thứ tự ưu tiên: `VIDEO_EDIT_GRAPHICS_CONFIG=/path/theme.json` (file chứa chính object theme) → `VIDEO_EDIT_GRAPHICS_THEME=<preset>` → `graphics_theme` trong `edit_options.json` của variant rồi nguồn → `legacy-lime`. Override riêng một beat bằng `graphics_theme`; khi vào props renderer tên trường là `graphicsTheme`. Với bốn mẫu cũ `flow_diagram`, `keyword_chips`, `progress_steps`, `annotated_screenshot`: theme mới mặc định timestamps tuyệt đối; `legacy-lime` không khai báo giữ timing tương đối cũ để không phá dự án đã dựng. Khi viết kế hoạch mới dùng legacy nhưng timestamps tuyệt đối, đặt `timing_mode: "absolute"` ở beat. Có thể khai báo `timing_mode: "relative"` khi tiếp tục kế hoạch cũ trên theme mới. Hai kind mới luôn dùng tuyệt đối. Cấu hình không hợp lệ bị chặn trước render. Không có cấu hình mới thì dự án cũ vẫn chạy theo giao diện legacy.

## Phạm vi đã hỗ trợ theme

`flow_diagram`, `concept_build`, `progress_steps`, `vs_split`, `callout`, `keyword_chips`, `annotated_screenshot`, `speaker_canvas`, `object_transform`.

Những mẫu khác vẫn dùng giao diện legacy và lint sẽ báo khi chọn theme mới. Muốn đồng nhất theme thì ưu tiên các mẫu đã hỗ trợ hoặc bổ sung chuyển đổi mẫu cần dùng rồi kiểm tra; không hứa toàn bộ thư viện đã đổi theme. `callout` chỉ dùng khi nhãn ngắn giải thích ý, không lặp nguyên phụ đề. Screenshot phải là tư liệu thật; mẫu annotation hiện giả định ảnh cùng tỉ lệ với khung để tọa độ highlight khớp.

## Chọn dạng minh họa theo ý đang nói

- Quy trình tuần tự → `flow_diagram` / `progress_steps`.
- Quan hệ, bộ phận, cấu trúc → `concept_build`.
- Hai cách hoặc hai kết quả → `vs_split`.
- Tài liệu rời gom về một kho / đầu vào qua xử lý tạo đầu ra → `object_transform`.
- Cần duy trì người nói khi giải thích → `speaker_canvas`, chứa `concept_build` hoặc `object_transform`.
- Giới thiệu giao diện thật → `annotated_screenshot` với vùng nhấn đúng ảnh.

Đa dạng đến từ hành động trực quan và bố cục, không phải thêm hộp chữ hay đổi màu liên tục. Nhãn là tên đối tượng/ngắn gọn; không tạo lớp chữ lặp lời thoại. Luân phiên người nói, B-roll thật và đồ họa khi nội dung cần. Giữ khoảng nghỉ; không ép số lượng hiệu ứng hoặc chèn đủ mọi mẫu.

## `object_transform`

```json
{
  "kind": "object_transform",
  "start_sec": 8,
  "end_sec": 14,
  "reason": "Các tài liệu rời chuyển về cùng một kho khi người nói mô tả việc gom tri thức.",
  "objects": [
    {"id": "lesson", "label": "Giáo án", "appear_sec": 8.2},
    {"id": "exercise", "label": "Bài tập", "appear_sec": 9.0},
    {"id": "feedback", "label": "Phản hồi", "appear_sec": 9.8}
  ],
  "target_label": "Kho tri thức",
  "gather_sec": 11.2,
  "transform_mode": "collect"
}
```

`appear_sec`, `gather_sec`, `objects[].transform_sec` đều là giây tuyệt đối trong nguồn. Thẻ hiện tại `appear_sec`; di chuyển vào đích từ `transform_sec`, mặc định `gather_sec + index × 0.22s`. Để lại ít nhất 1 giây cuối cho đối tượng cuối tới đích và người xem hiểu kết quả. `collect`: 1–6 tài liệu vào một thư mục. `pipeline`: 1–4 tài liệu đi qua bước xử lý; thêm `process_label` ngắn. Mô phỏng khái niệm, không bịa số liệu hoặc giao diện sản phẩm. Mẫu tự chừa vùng đáy cho phụ đề.

## `speaker_canvas`

```json
{
  "kind": "speaker_canvas",
  "start_sec": 14,
  "end_sec": 20,
  "reason": "Giữ người nói trong khung riêng, đồng thời dựng quan hệ dữ liệu đi vào hệ thống.",
  "speaker_side": "left",
  "visual": "concept_build",
  "elements": [
    {"id": "input", "label": "Dữ liệu", "x": 0.22, "y": 0.5, "w": 0.32, "appear_sec": 14.2},
    {"id": "ai", "label": "Trợ lý AI", "x": 0.77, "y": 0.5, "w": 0.34, "emphasis": true, "appear_sec": 15.5}
  ],
  "connectors": [{"from": "input", "to": "ai", "flowing": true, "appear_sec": 15.6}]
}
```

Video nguồn được lấy tự động từ composition, hiển thị toàn bộ khung bằng `contain`, không crop mặt. Ngang: người nói bên trái/phải, minh họa bên cạnh. Dọc: người nói phía trên, minh họa phía dưới; `speaker_side` chỉ có tác dụng ở ngang. Chừa đáy cho một lớp phụ đề. Bản sao video trong khung riêng bị tắt tiếng và bắt đầu tại offset đúng nguồn; audio nguồn chính vẫn quyết định lời thoại. Không dùng cùng nguồn `gradient` vì không có người nói thật.

Với `visual: "object_transform"`, dùng các trường `objects`, `target_label`, `gather_sec`, `transform_mode`, `process_label` như mẫu trên. `overlay: true` không áp dụng cho hai kind mới vì chúng tự quản lý bố cục. Khi chọn giữ framing nguồn, việc thu toàn bộ nguồn vào vùng riêng chỉ áp dụng nếu người dùng đã chọn/giao phối hợp cách trình bày hiệu ứng này.

## Kiểm tra

Trước xuất: xem các theme trên mẫu đang dùng, chữ tiếng Việt dài, mặt, đường kết nối và ranh giới trước/sau beat; xác nhận màu chữ trên thẻ nhấn đọc được. Với `speaker_canvas`, kiểm tra offset khung nguồn và audio không bị nhân đôi. Sau xuất: chạy `verify.py`, xem các khung trong MP4 thực tế. Demo trong composition `GraphicsShowcase` là mẫu kỹ thuật để xem theme; không áp nội dung demo vào video thật.
