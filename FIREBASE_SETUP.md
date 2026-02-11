# Hướng dẫn cấu hình Firebase chi tiết

## Bước 1: Truy cập Firebase Console

1. Vào https://console.firebase.google.com/
2. Đăng nhập với Google account
3. Chọn project "kingkong-e8eab"

## Bước 2: Bật Authentication

1. Sidebar trái → chọn **Build** → **Authentication**
2. Click **Get started**
3. Tab **Sign-in method** → Click **Email/Password**
4. Bật **Enable** (toggle sang màu xanh)
5. Click **Save**

## Bước 3: Tạo Firestore Database

1. Sidebar trái → chọn **Build** → **Firestore Database**
2. Click **Create database**
3. Chọn **Start in production mode**
4. Chọn location: **asia-northeast1** (Tokyo) hoặc gần Nhật nhất
5. Click **Enable**

## Bước 4: Cấu hình Firestore Rules

1. Trong Firestore Database → Tab **Rules**
2. Xóa hết code cũ, paste code sau:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Products collection
    match /products/{product} {
      // Ai cũng đọc được sản phẩm
      allow read: if true;
      
      // Chỉ admin mới được thêm/sửa/xóa sản phẩm
      allow write: if request.auth != null && 
                      request.auth.token.email == 'admin@kingkong.com';
    }
    
    // Orders collection
    match /orders/{order} {
      // Chỉ user sở hữu đơn hàng hoặc admin mới đọc được
      allow read: if request.auth != null && 
                     (resource.data.userId == request.auth.uid || 
                      request.auth.token.email == 'admin@kingkong.com');
      
      // Ai đăng nhập cũng tạo đơn hàng được
      allow create: if request.auth != null;
      
      // Chỉ admin mới update đơn hàng (thêm mã vận đơn, đổi trạng thái)
      allow update: if request.auth != null && 
                       request.auth.token.email == 'admin@kingkong.com';
    }
  }
}
```

3. Click **Publish**

## Bước 5: (Optional) Bật Storage nếu muốn upload ảnh

1. Sidebar trái → **Build** → **Storage**
2. Click **Get started**
3. Chọn **Start in production mode**
4. Chọn location: **asia-northeast1**
5. Click **Done**

## Bước 6: Tạo tài khoản Admin

### Cách 1: Qua web app
1. Chạy `npm start`
2. Vào http://localhost:3000/register
3. Đăng ký với:
   - Email: `admin@kingkong.com`
   - Password: (tùy chọn, ít nhất 6 ký tự)
   - Tên: Admin

### Cách 2: Qua Firebase Console
1. Vào **Authentication** → Tab **Users**
2. Click **Add user**
3. Nhập:
   - Email: `admin@kingkong.com`
   - Password: (tùy chọn)
4. Click **Add user**

## Bước 7: Thêm sản phẩm mẫu

1. Đăng nhập với tài khoản admin
2. Vào http://localhost:3000/admin
3. Click **商品管理** (Quản lý sản phẩm)
4. Click **新規商品追加** (Thêm sản phẩm mới)
5. Nhập thông tin:

### Sản phẩm 1:
```
商品名: iPhone 15 Pro Max 強化ガラス
価格: 2980
説明: iPhone 15 Pro Max専用の9H強化ガラスフィルム。指紋防止コーティング付き
画像URL: (optional - có thể để trống)
特徴: 9H硬度, 指紋防止, 気泡ゼロ, 日本製
```

### Sản phẩm 2:
```
商品名: Galaxy S24 Ultra 強化ガラス
価格: 3280
説明: Galaxy S24 Ultra専用の強化ガラスフィルム。曲面まで完全保護
画像URL: (optional)
特徴: 全面保護, 9H硬度, 指紋認証対応, タッチ感度抜群
```

## Bước 8: Test flow hoàn chỉnh

### Test quy trình khách hàng:
1. Logout khỏi admin
2. Xem trang chủ → Thấy 2 sản phẩm
3. Thêm vào giỏ hàng
4. Checkout → Nhập thông tin
5. Chọn 着払い hoặc 銀行振込
6. Nếu chọn 銀行振込 → Thấy thông tin Yucho
7. Đăng nhập/Đăng ký
8. Xác nhận đơn hàng
9. Vào "注文履歴" → Xem đơn hàng vừa tạo

### Test quy trình admin:
1. Đăng nhập admin@kingkong.com
2. Vào /admin → Click 注文管理
3. Thấy đơn hàng mới
4. Click 編集
5. Đổi status thành "発送済み"
6. Nhập mã vận đơn: "123456789012" (Yamato) hoặc "12345678901" (Yubin)
7. Click 更新
8. Logout admin → Login lại user thường
9. Vào 注文履歴 → Thấy mã vận đơn

## Lỗi thường gặp

### Lỗi: "Missing or insufficient permissions"
→ Kiểm tra lại Firestore Rules, đảm bảo đã publish

### Lỗi: "Firebase: Error (auth/admin-restricted-operation)"
→ Chưa bật Email/Password trong Authentication

### Lỗi: Network request failed
→ Kiểm tra internet, hoặc Firebase project bị disable

### Không thấy sản phẩm ở trang chủ
→ Đảm bảo đã thêm sản phẩm qua Admin panel
→ Kiểm tra Console (F12) xem có lỗi gì không

## Customization

### Thay đổi thông tin tài khoản Yucho:
File: `src/pages/CheckoutPage.js` (line ~166-173)

```javascript
<div className="bank-row">
  <span className="bank-label">記号:</span>
  <span className="bank-value">12345</span> // ← Thay đổi ở đây
</div>
<div className="bank-row">
  <span className="bank-label">番号:</span>
  <span className="bank-value">67890123</span> // ← Thay đổi ở đây
</div>
<div className="bank-row">
  <span className="bank-label">口座名義:</span>
  <span className="bank-value">キングコング（カ</span> // ← Thay đổi ở đây
</div>
```

### Thay đổi màu sắc theme:
File: `src/App.css` (line ~1-12)

```css
:root {
  --primary: #1a1a1a;      /* Màu chính */
  --secondary: #ff4444;    /* Màu phụ (đỏ) */
  --accent: #ffd700;       /* Màu nhấn (vàng) */
  --bg: #fafafa;          /* Màu nền */
  --card-bg: #ffffff;     /* Màu card */
  --text: #2c2c2c;        /* Màu chữ */
  --text-light: #666;     /* Màu chữ nhạt */
}
```

## Bảo mật

⚠️ **QUAN TRỌNG**: 
- KHÔNG share Firebase config public
- KHÔNG commit sensitive data vào Git
- Luôn sử dụng Firestore Rules để bảo vệ data
- Admin email được hardcode là `admin@kingkong.com` - có thể thay đổi trong code

## Support

Nếu gặp vấn đề, kiểm tra:
1. Firebase Console → Authentication → Users (có user chưa?)
2. Firestore → Data (có collections chưa?)
3. Browser Console (F12) → Có error gì không?
4. Network tab → Request có fail không?
