---
name: skill-video-edit
description: "Chỉnh video đã cắt trong Codex: phỏng vấn qua chat để chốt lựa chọn còn thiếu trước khi dựng, giữ lời nói và thời lượng, tạo phụ đề đúng ngôn ngữ, nhấn từ trong phụ đề, thêm minh họa/chuyển động, rồi xuất preview 720p hoặc final theo yêu cầu. Dùng khi gửi video để biên tập hoặc thêm phụ đề, B-roll, minh họa và hiệu ứng."
---

# Chỉnh video trong Codex

Biên tập video đã cắt sẵn. Mặc định giữ nguyên lời nói, thứ tự cảnh và thời lượng; chỉ cắt lại khi người dùng yêu cầu. Video có thể là dọc, ngang, một hoặc nhiều người nói.

## Mặc định cho Henry

- Một lớp phụ đề duy nhất. Từ/cụm từ quan trọng được nhấn ngay trong phụ đề bằng cả ba yếu tố: **VIẾT HOA**, **cỡ chữ lớn hơn phần còn lại** (mặc định khoảng 1.25 lần) và **màu nổi bật khác** (mặc định vàng `#FFE600`, như ảnh tham khảo Henry đã chọn). Phần không nhấn giữ nguyên cách viết theo lời thoại, màu trắng; không tự viết hoa toàn bộ phụ đề hoặc đổi màu từng từ đang nói. Không thêm `word_pop`, `hook_title` hoặc câu chữ lớn lặp lại phụ đề.
- Có thể bố trí phụ đề nhiều dòng theo cụm tự nhiên; đây vẫn là một lớp phụ đề. Tính chiều rộng theo chữ đã viết hoa và cỡ chữ nhấn, giữ cụm cần nhấn liền nhau khi có thể, tránh tràn khung/che mặt. Không bắt buộc sao chép font viết tay hay vị trí phía trên của ảnh tham khảo. Ví dụ: “đưa những người **ĐÃ TIN TƯỞNG** đến gần với **SẢN PHẨM CỦA BẠN**”; chỉ hai cụm in đậm được viết hoa, tăng cỡ và đổi màu, không dùng chúng làm danh sách nhấn cố định cho video khác.
- Dùng font có đủ dấu tiếng Việt, mặc định Arial; chữ có bóng để đọc được trên nền video, không che mặt. Chọn vị trí từ khung hình thực tế, không giả định người nói luôn ở giữa.
- Giữ nguyên cách đóng khung nguồn. `CAMERA=zoom`, `ZOOM=0` là mặc định; chỉ thêm zoom/follow khi phù hợp cảnh và đã kiểm tra đầu/mặt của mọi người.
- Video của Henry Hoàng: không tự chèn Subscribe/CTA của Luuk, không yêu cầu database BuildLoop, không áp dụng bảng sửa tên riêng hay nhạc mặc định của kênh khác.
- **Luôn kết hợp đồ họa chuyển động Remotion:** B-roll video/ảnh (dù chọn Pexels, tư liệu tự gửi hay cảnh nguồn) KHÔNG thay thế đồ họa Remotion. Mặc định trong mọi video của Henry Hoàng phải luôn chủ động phối hợp đan xen cả hai yếu tố:
  (1) B-roll tư liệu thực tế (video Pexels, ảnh/screenshot), VÀ
  (2) Các mẫu hiệu ứng đồ họa chuyển động Remotion chuyên nghiệp (`flow_diagram`, `callout`, `keyword_chips`, `vs_split`, `concept_build`, `progress_steps`, v.v.) để trực quan hóa luận điểm, tạo nhịp hiện đại, tăng tính thuyết phục và giữ chân người xem. Lựa chọn nguồn B-roll ở câu hỏi phỏng vấn chỉ quyết định nguồn ảnh/video thực tế, tuyệt đối không được triệt tiêu hoặc bỏ quên đồ họa chuyển động Remotion (trừ khi người dùng chọn rõ ràng là "Không thêm hiệu ứng minh họa").
- Nếu người dùng có kịch bản, lưu `script.txt` trong workdir và dùng để đối chiếu tên riêng/nội dung. Lời thực tế trong audio vẫn quyết định câu chữ và thời điểm; không ép người nói thành lời khác.
- Mặc định xuất preview 720p rồi chờ góp ý. Nếu người dùng đã chọn hoặc yêu cầu final/1080p rõ ràng, kiểm tra chất lượng rồi xuất bản được yêu cầu; không bắt duyệt thêm preview. Chọn preview rồi final chỉ cho phép final sau khi người dùng duyệt.

## Ưu tiên tốc độ cho Henry — mọi cuộc trò chuyện

Đây là lựa chọn lâu dài của Henry: khi dùng `$skill-video-edit`, ưu tiên hoàn thành nhanh trong mọi cuộc trò chuyện và dự án có skill này. Giữ các yêu cầu về lời thoại, phụ đề, minh họa và kiểm tra đầu ra; không giảm chất lượng để chạy cho kịp.

- Dùng lại runtime, font, bố cục phụ đề, template sơ đồ và tài sản đã kiểm tra nếu phù hợp. Chỉ thay nội dung, thời điểm và vị trí theo video mới; không dựng lại bộ mẫu từ đầu hoặc áp nguyên nội dung/CTA của video cũ. Đọc và tìm tài liệu đúng phần cần dùng, tránh rà toàn bộ kho hoặc sửa công cụ không liên quan.
- Chạy doctor/probe ngắn trước; chỉ bổ sung phụ thuộc thực sự thiếu. Đặt cache/output trong thư mục được phép ghi. Nếu dùng lại `node_modules` qua symlink, xác nhận cache dựng cũng ghi được; nếu không, dùng runtime trong workspace hoặc sao chép phụ thuộc, bỏ `.cache`, thay vì lặp lại lỗi quyền.
- Kiểm tra Pexels sớm nếu cần stock. Khi tải lỗi, chuyển ngay sang tài sản có sẵn phù hợp. Chỉ thử lại tối đa một lần khi đã xác định cách xử lý cụ thể, như cấp quyền cho kết nối bị sandbox chặn; không lặp tìm/tải cùng nguồn lỗi. Báo thiếu tư liệu nếu chưa có thay thế đúng nội dung.
- Chốt `broll_plan.json`, font và tài sản trước khi prepare. Dùng lại transcript đã rà soát khi source không đổi; chỉ nhận dạng lại đoạn thực sự còn nghi ngờ. Gom các bước kiểm tra độc lập trong cùng lượt công cụ khi phù hợp.
- Trước khi xuất toàn bộ, kiểm tra một nhóm khung đại diện và đoạn mẫu ngắn qua chuyển cảnh có nguy cơ: phụ đề dài/có dấu, sơ đồ, B-roll, mặt người nói và ranh giới đầu/cuối. Với takeover có fade, kiểm tra cả nền phía dưới để bắt khoảng tối/đen hoặc lóe hình. Không coi một ảnh tĩnh giữa cảnh là đủ để xác nhận chuyển cảnh.
- Preview mặc định 720p; ưu tiên 30fps cho clip nói chuyện nếu không ảnh hưởng nhịp chuyển động và vẫn giữ thời lượng trong sai số cho phép. Dùng fps nguồn khi nội dung cần. Khi anh yêu cầu final hoặc 1080p ngay, xuất thẳng bản được yêu cầu sau kiểm tra; không bắt duyệt thêm một preview. Chỉ render lại toàn video khi có sửa đổi ảnh hưởng đầu ra hoặc lỗi cần khắc phục.
- Sau xuất, chạy kiểm tra thời lượng, giải mã và audio; xem một nhóm khung trong file xuất thực tế, gồm các điểm chuyển cảnh. Mở rộng kiểm tra khi có lỗi hoặc nghi ngờ mới; không lặp các kiểm tra đã đạt mà không có lý do.
- Với clip khoảng một phút và tư liệu/runtime sẵn, mục tiêu vận hành là khoảng 5–8 phút có preview. Đây là mục tiêu chưa được đo ổn định, không phải cam kết. Đo thời gian chuẩn bị, render và kiểm tra riêng, loại thời gian chờ anh trả lời; nếu có trở ngại, báo ngắn gọn bước đang chậm và tiếp tục phần độc lập.

## Phỏng vấn trước khi biên tập — mọi cuộc trò chuyện

Áp dụng khi gọi skill trực tiếp hoặc khi skill tự kích hoạt; không phụ thuộc Project Instructions. Yêu cầu chung chung cần chốt lựa chọn trước khi dựng, không cần người dùng gọi thêm một chế độ phỏng vấn.

- Đọc yêu cầu và kiểm tra sơ bộ nguồn/tư liệu trước. Nếu còn thiếu lựa chọn, đọc [bộ câu hỏi nâng cấp](knowledge/edit-interview.md), dùng chín câu chính và chỉ hỏi mục chưa rõ: nguồn B-roll, trình bày B-roll, kiểu phụ đề, font, phong cách hiệu ứng, trình bày hiệu ứng, âm thanh, khung hình và đầu ra. Phụ đề, âm thanh và khung hình là câu chính, không đợi anh yêu cầu tùy chỉnh sâu mới hỏi. Mật độ B-roll, mức chuyển động và chi tiết bổ sung chỉ mở khi cần hoặc người dùng muốn.
- Đã đủ thông tin: thực hiện ngay. “Dùng mặc định”, “em tự chọn”, “cứ làm đi” cho phép áp dụng mặc định cho phạm vi người dùng giao. Trong một câu, “em tự chọn” chỉ áp dụng câu đó; không tự bỏ toàn bộ lượt hỏi.
- Vòng sửa cùng video: dùng lại lựa chọn đã chốt, chỉ hỏi thay đổi mơ hồ. Không áp cấu hình video trước cho nguồn khác nếu chưa được yêu cầu. Video tham khảo giúp suy ra lựa chọn rõ ràng; hỏi phần còn mơ hồ.
- Có thể chạy probe/doctor ngắn và chuẩn bị phần độc lập trong lúc chờ; chưa dựng/render hoặc lấy tư liệu theo lựa chọn chưa trả lời. Kiểm tra/tải Pexels theo nguồn đã chọn hoặc phạm vi tự chọn đã được giao.

### Phỏng vấn trực tiếp bằng tin nhắn

Luôn phỏng vấn bằng nội dung tin nhắn chat thông thường trên cả máy tính và điện thoại. Không dùng công cụ hỏi tương tác (`request_user_input`, `request_user_input_async` hoặc tương đương), nút bấm, biểu mẫu, Visualize, HTML hay bảng gom toàn bộ câu hỏi cho bước phỏng vấn này.

- Khi còn thiếu lựa chọn, viết câu hỏi đầu tiên cùng phương án ngay trong câu trả lời của lượt hiện tại; không chỉ nói “anh chọn trong câu hỏi bên trên” hoặc “em đang chờ lựa chọn” mà không hiện câu hỏi.
- Mỗi lượt một câu hỏi, đánh dấu phương án A, B, C, D… (tiếp tục E, F… nếu cần), kèm “Khác: anh mô tả mong muốn riêng”. Ghi rõ cho phép một hay nhiều lựa chọn; đánh dấu mặc định/gợi ý nhưng chưa coi là câu trả lời.
- Kết thúc tin nhắn sau câu hỏi để chờ anh trả lời bằng tin nhắn. Nhận chữ cái, tên phương án hoặc mô tả tự do; có thể nhận nhiều chữ cái cho câu nhiều lựa chọn. Diễn giải câu trả lời theo đúng câu vừa hỏi, không coi chữ A ở câu này là lựa chọn của câu khác.
- Ghi nhận lựa chọn ngắn gọn rồi viết câu tiếp theo trong cùng tin nhắn; không cần anh xác nhận sau mỗi câu. Bỏ câu đã đủ thông tin và câu phụ thuộc không còn áp dụng.
- Nếu anh trả lời nhiều mục trong một tin, ghi nhận các mục rõ ràng và chỉ hỏi phần còn thiếu. Mong muốn riêng được viết trong chính tin nhắn trả lời, không cần ô nhập hay một câu bắt buộc riêng.
- Sau câu cuối, xác nhận bằng cách nhắc lại cấu hình đã hiểu và bắt đầu edit ngay; đây là thông báo, không phải câu hỏi yêu cầu anh duyệt lại. Chỉ hỏi lại khi câu trả lời mâu thuẫn/mơ hồ có ảnh hưởng hoặc còn thiếu dữ liệu bắt buộc.
- Chưa nhận đủ câu trả lời thì không dựng/render, trừ khi anh rõ ràng giao dùng mặc định cho phần còn lại. Im lặng không phải đồng ý. “Dùng mặc định cho tất cả” cho phép bỏ các câu tùy chọn còn lại và thực hiện.

Ví dụ câu hỏi đầu trong chat:

**Anh muốn lấy B-roll từ đâu? Có thể chọn nhiều nguồn; chọn “không thêm” thì bỏ các nguồn khác.**

- **A.** Em tự chọn nguồn phù hợp — gợi ý.
- **B.** Anh tự gửi tư liệu.
- **C.** Dùng ngay cảnh trong video nguồn.
- **D.** Pexels.
- **E.** Screenshot/logo chính thức.
- **F.** Hình minh họa tạo mới khi công cụ khả dụng.
- **G.** Không thêm B-roll.
- **Khác:** Anh mô tả mong muốn riêng.

“Anh trả lời bằng chữ cái hoặc mô tả; có thể nói ‘dùng mặc định cho tất cả’ để em làm ngay.”

### Chốt và thực thi

Khi thực sự nhận đủ lựa chọn hoặc được giao dùng mặc định, tóm tắt ngắn và thực hiện, không hỏi xác nhận lại. Nếu trả lời một phần rồi yêu cầu tiếp tục, dùng mặc định cho phần tùy ý còn thiếu; chỉ hỏi thêm dữ liệu bắt buộc như nguồn, tư liệu tự gửi hoặc tên chưa chắc chắn.

Lưu `edit_options.json` trong thư mục tác vụ và dùng lại trong workdir: nhận diện nguồn bằng đường dẫn/hash khi có, ghi các lựa chọn rõ ràng, mục được giao dùng mặc định, mong muốn riêng và phần bắt buộc còn thiếu. Không ghi khóa API. Nếu tiếp tục cùng nguồn, đọc lại cấu hình; chỉ áp dụng câu trả lời thực sự đã nhận. Người dùng đổi ý thì cập nhật cấu hình đó.

Giữ mặc định phụ đề Henry (một lớp, cụm nhấn viết hoa + lớn hơn + màu nổi bật); đổi font không tự đổi quy tắc nhấn. Lưu cả kiểu phụ đề, âm thanh và khung hình đã chọn. Chọn không thêm phụ đề mới thì đặt `CAPTIONS=0` và bỏ câu font; chọn giữ audio gốc thì không tự thêm nhạc/SFX; chọn đổi tỉ lệ hoặc zoom/follow thì thực hiện theo lựa chọn sau khi kiểm tra bố cục và mặt. Chọn không thêm B-roll/hiệu ứng/phụ đề mới hoặc kiểu trình bày riêng được ưu tiên trong phạm vi đã chốt, không bị các mặc định minh họa ở phần sau ghi đè. Lời nói, timestamps và kiểm tra đầu ra vẫn được giữ.

## Giao diện và minh họa Remotion

- Chọn theme theo video, không cố định mọi đồ họa là đen than + lime + lưới. Bốn preset mới: `dark-tech`, `light-minimal`, `warm-story`, `henry-brand`; `legacy-lime` giữ tương thích dự án cũ. Preset Henry dùng vàng đã chọn cho phụ đề làm điểm xuất phát, có thể chỉnh; không suy diễn đây là bộ nhận diện chính thức.
- Lưu `graphics_theme` trong `edit_options.json` của đúng nguồn. Chốt giao diện cùng nhóm phong cách hiệu ứng; nếu đã giao tự chọn thì chọn và thông báo, không hỏi thêm. Màu/font đồ họa độc lập với phụ đề; đổi theme không tự đổi audio hoặc crop/zoom.
- Khi viết `broll_plan.json`, đọc [theme và minh họa](knowledge/graphics-themes.md): phạm vi mẫu đã hỗ trợ, cấu hình nền/màu/font/thẻ/mức chuyển động, schema `speaker_canvas` và `object_transform`. Mẫu chưa hỗ trợ theme vẫn giữ style legacy và lint báo rõ; không hứa toàn thư viện đã chuyển đổi.
- Đa dạng bằng hành động: tài liệu gom về kho, đầu vào đi qua xử lý tạo đầu ra, quan hệ dựng theo lời, screenshot thật được nhấn vùng. `speaker_canvas` giữ toàn bộ khung người nói trong vùng riêng, minh họa bên cạnh ở ngang hoặc phía dưới ở dọc, chừa vùng phụ đề. Chỉ dùng khi cách trình bày này đã được chọn/giao tự phối hợp. Không thêm hộp chữ lặp nguyên phụ đề, không đổi theme liên tục cho vui.
- Các thời điểm trong kế hoạch mới là giây tuyệt đối của nguồn; `render.sh` truyền theme và dữ liệu mới vào composition. Hai mẫu mới kiểm tra schema/thời gian trước render. Kiểm tra đầu ra thật, gồm offset người nói và audio không bị lặp.

## Chuẩn bị môi trường

Gọi `python3 scripts/doctor.py` từ thư mục skill. Kiểm tra ffmpeg/ffprobe, Node/npm, Remotion, Chrome và Python có Whisper + Pillow. Chỉ chạy `bash scripts/setup.sh` nếu thiếu phụ thuộc; dùng lại môi trường đang có. Không cài lại hoặc nâng cấp tất cả ở mỗi video.

Tất cả đường dẫn skill lấy theo vị trí file, không dùng `~/.claude/skills/...`. Trong Codex, nên sao chép runtime vào thư mục tác vụ và đặt:

```bash
export VIDEO_EDIT_CACHE_DIR="/duong-dan-tuyet-doi/tac-vu/cache"
export VIDEO_EDIT_OUTPUT_DIR="/duong-dan-tuyet-doi/tac-vu/preview"
```

Dùng thư mục được phép ghi. Không sửa source hoặc tài liệu đồng bộ. Khi sao chép runtime, dùng lại `node_modules` và môi trường Python phù hợp hệ điều hành; không lấy binary Windows sang macOS. Nếu Chrome bị sandbox chặn, dùng cơ chế cấp quyền của Codex cho đúng lần kiểm tra/xuất video, không đổi sandbox toàn ứng dụng.

## Quy trình mỗi video

0. Kiểm tra yêu cầu và thực hiện mục “Phỏng vấn trước khi biên tập”. Chỉ dựng khi đã nhận lựa chọn hoặc được giao dùng mặc định. Dùng lại kết quả probe/doctor đã chạy, tránh kiểm tra lặp vô ích.
1. Kiểm tra kích thước, fps, thời lượng và audio bằng ffprobe. Trích khung đầu, giữa, cuối và các góc máy khác nhau. Xác nhận có phụ đề gắn sẵn hay chưa bằng hình; ffprobe không phát hiện được chữ đã ghi trong pixels. Nếu có, đặt `CAPTIONS=0` và tránh thêm chữ nhắc lại phụ đề có sẵn.
2. Nhận dạng lời nói bằng `python3 scripts/transcribe.py "<video>"`. Mặc định Whisper `large-v3-turbo`, tự nhận ngôn ngữ; nếu đã nghe xác nhận tiếng Việt thì đặt `WHISPER_LANGUAGE=vi`. Không tự dịch video sang ngôn ngữ khác.
3. Rà soát `words.json` cùng audio, đặc biệt dấu tiếng Việt, tên người, tên workshop, sản phẩm, số liệu. Chuẩn hóa Unicode NFC. Tên chưa chắc phải hỏi ngắn gọn, đồng thời tiếp tục những phần độc lập. Không đoán tên để lấp chỗ trống. Các sửa tay phải giữ nguyên timestamps. Đặt `.polished` sau khi rà soát để khóa bản chữ đã chốt.
4. Chọn `CAPTION_EMPHASIS` và `CAPTION_PROTECT` theo video này. Cả hai là các cụm cách nhau bằng `|`; `PROTECT` giữ tên/cụm trên cùng dòng, `EMPHASIS` chọn từ/cụm để viết hoa, tăng cỡ và đổi màu ngay trong phụ đề; chỉ đổi kiểu hiển thị, không đổi chữ gốc hoặc timestamps trong `words.json`/`captions_plan.json`. Không dùng danh sách tên cố định của video trước. Phụ đề chia theo cụm tự nhiên, mặc định tối đa 6 từ, khoảng 2.5 giây và tự kiểm tra chiều rộng. Không ngắt tên thành các dòng rời kiểu `FOUNDER CỦA AI` rồi mới `MY LIFE`.
5. Viết `broll_plan.json`: mỗi beat có `kind`, `start_sec`, `end_sec`, `reason`, và `speech_anchor` nếu phù hợp. Dùng thời gian tuyệt đối của source; `appear_sec` của từng phần cũng là giây tuyệt đối. Minh họa phải giải thích đúng lời đang nói ở thời điểm đó.
6. Lấy tài sản thật trước: video/ảnh người dùng và cảnh trong source → screenshot/logo từ nguồn chính thức → stock phù hợp. Dùng hình tạo mới hoặc SVG chuyển động cho khái niệm không có tài sản thật hữu ích. Không biến video thành chỉ phụ đề hoặc chỉ các nhãn chữ. Không bịa screenshot, số liệu, logo hay chân dung người thật.
7. Đặt minh họa vào vùng không che mặt và không chiếm vùng phụ đề. Nhãn trong sơ đồ chỉ giữ khi cần để hiểu hình; bỏ nhãn lặp nguyên lời phụ đề. Chuyển động nên giúp hiểu ý, không thêm chỉ để lấp khoảng trống. Nếu thêm SFX/nhạc, giữ lời nói rõ và nghe kiểm tra âm lượng.
8. Chuẩn bị props, kiểm tra phụ đề và lint. Trích/render các khung có tên riêng, chữ nhấn, minh họa, chuyển cảnh; xem cả trước/sau mỗi ranh giới chữ để bắt chồng lớp, chữ cắt và lặp ý. Kiểm tra cụm nhấn có đủ ba yếu tố viết hoa/lớn hơn/màu khác, phần không nhấn vẫn màu trắng và dấu tiếng Việt không bị cắt.
9. Render theo đầu ra đã chốt, kiểm tra file xuất thực tế rồi gửi file/link mà phiên hiện tại mở được. Preview: chờ góp ý, các vòng sửa vẫn là preview trừ khi được yêu cầu final. Final đã được chọn/yêu cầu: xuất sau kiểm tra, không hỏi phê duyệt lại. Không mặc định đường dẫn local Mac mở được từ điện thoại; không tự đăng nền tảng.

## Thao tác và tệp

### Nguồn video và B-roll do người dùng cung cấp

- Video người dùng gửi là nguồn chính; ảnh/video bổ sung được đặt vào `<workdir>/broll/` rồi tham chiếu bằng `image_path` trong `broll_plan.json`. Với `kind: "video"`, đặt đường dẫn video vào cùng trường này. `render.sh` tự stage tài sản được tham chiếu; không cần sửa `remotion/public/` hoặc `src/props.json` bằng tay.
- Nếu người dùng muốn dựng slideshow từ nhiều ảnh/video thay vì biên tập một nguồn video, dùng composition `Slideshow`: chép media vào `remotion/public/media/`, sửa danh sách theo thứ tự trong `remotion/src/slideshow.json`, rồi chạy `npm run render:slideshow` từ `remotion/`. Mỗi mục cần `src`, `type` (`image` hoặc `video`) và `durationInSeconds`; video giữ tiếng gốc theo mặc định, có thể tắt bằng `"muted": true`. `fit` nhận `cover` hoặc `contain`; mặc định là `contain`. Slideshow dùng cắt thẳng giữa các mục.
- Đường dẫn trong `slideshow.json` tính từ `remotion/public/`. Đầu ra mặc định là `remotion/out/slideshow.mp4`; đặt `width`, `height`, `fps` trong JSON để đổi định dạng.

`transcribe.py` in đường dẫn workdir dạng `<cache>/<stem>_<hash>/`. Các file dùng lại:

- `edit_options.json`: cấu hình đã chốt cho đúng nguồn, mong muốn riêng và phần dữ liệu bắt buộc còn thiếu.
- `words.json`: lời đã rà soát và thời điểm từng từ.
- `script.txt`: chỉ có khi người dùng cung cấp kịch bản.
- `broll_plan.json`: kế hoạch tác giả; `broll_plan.source.json` giữ bản trước khi căn thời điểm để các vòng render không làm hỏng ý định ban đầu.
- `broll/`: tài sản thật hoặc minh họa đã kiểm tra.
- `captions_plan.json`, `caption-check.json`: dòng phụ đề và kết quả kiểm tra một lớp chữ.

Ví dụ kế hoạch hình thật, không thêm nhãn lặp lời nói:

```json
[
  {
    "kind": "image_card",
    "start_sec": 8.2,
    "end_sec": 11.5,
    "speech_anchor": "buổi workshop",
    "reason": "Người nói giới thiệu workshop; ảnh thật giúp thấy bối cảnh và học viên.",
    "source": "source-video",
    "image_path": "broll/workshop.jpg"
  }
]
```

Có thể dùng `video` với `overlay: true`, `image_card`, `icon`, sơ đồ hoặc biểu đồ khi phù hợp. Xem [knowledge/template_library.md](knowledge/template_library.md) để tra schema/template; các ví dụ thương hiệu hoặc sở thích kênh khác trong tài liệu là ví dụ kỹ thuật, không phải yêu cầu cho Henry. Không nạp các quy tắc kênh cũ để ghi đè mặc định ở đây.

```bash
CAPTION_EMPHASIS="<cum-can-nhan>|<ten-rieng>" \
CAPTION_PROTECT="<ten-workshop>|<ten-san-pham>" \
bash scripts/render.sh "<video>"
```

- `VIDEO_EDIT_SINGLE_CAPTION_LAYER=1` mặc định, được nối vào composition. Lint chặn text overlay tạo lớp chữ thứ hai. Chỉ dùng `=0` nếu người dùng yêu cầu cách trình bày khác và đã giải quyết trùng chữ.
- `VIDEO_EDIT_CAPTION_PLAN="/path/captions.json"` dùng phụ đề đã biên tập tay; vẫn kiểm tra đủ từ, đúng thứ tự/timestamps và không trùng khoảng hiển thị.
- `VIDEO_EDIT_PREPARE_ONLY=1` tạo props và kiểm tra mà chưa render.
- `VIDEO_EDIT_PYTHON` và `VIDEO_EDIT_BROWSER` cho phép chọn môi trường Python/Chrome đã có.
- `SCORE=0` mặc định cả preview/final. Muốn dùng nhạc đã chọn: `SCORE=1 MUSIC_TRACK="/path/music.mp3"`; không dùng nhạc signature của kênh khác. SFX riêng có thể trộn ở gain nhỏ, voice giữ gain 1, sau khi nghe thử.
- Render tuần tự, mỗi lần một video. Cache và lock là lớp bảo vệ, không phải lý do chạy nhiều render đồng thời.

## Kiểm tra trước khi gửi

`render.sh` tạo `caption-check.json`, chặn phụ đề thiếu/thêm từ hoặc overlap. Nó sao chép lại audio gốc khi codec hỗ trợ để giữ tiếng nói. Để kiểm tra video đã xuất:

```bash
python3 scripts/verify.py "<source>" --output "<preview>"
```

Kiểm tra thời lượng theo video stream (sai số tối đa một frame), giải mã toàn file, và so sánh audio khi chưa thêm nhạc/SFX. Nếu chủ động trộn audio, dùng `--allow-audio-mix`, nghe đầu/giữa/cuối và chỗ có hiệu ứng; không báo audio giống hệt bản gốc.

Phải xem hình trong **file xuất thực tế**, không chỉ props, lint hoặc báo render thành công. Kiểm tra mặt, dấu, tên riêng, bố cục và các đoạn chuyển chữ. Các kiểm tra kỹ thuật không đảm bảo nhận dạng tên hoặc gu minh họa luôn đúng; báo rõ những phần còn chưa chắc.
