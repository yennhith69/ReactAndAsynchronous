# 📖 React Code Flow - Giải Thích Chi Tiết

> Tài liệu giải thích luồng chương trình React cho ứng dụng Product List

---

## 📋 Mục Lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Luồng khi trang web tải](#2-luồng-khi-trang-web-tải)
3. [Luồng khi user click](#3-luồng-khi-user-click)
4. [Sơ đồ luồng dữ liệu](#4-sơ-đồ-luồng-dữ-liệu)
5. [3 điểm cốt lõi](#5-3-điểm-cốt-lõi)
6. [Code reference](#6-code-reference)

---

## 1. Tổng Quan Kiến Trúc

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER DOM                       │
│  ┌───────────────────────────────────────────────┐  │
│  │              React Root (#root)               │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │              App Component              │  │  │
│  │  │  • state: lastViewed                    │  │  │
│  │  │  • handler: handleQuickView             │  │  │
│  │  │  ┌─────────────────────────────────┐    │  │  │
│  │  │  │    ProductList Component        │    │  │  │
│  │  │  │    • props: products[]          │    │  │  │
│  │  │  │    • props: onQuickView         │    │  │  │
│  │  │  │    ┌──────────────────────┐    │    │  │  │
│  │  │  │    │ ProductCard x10      │    │    │  │  │
│  │  │  │    │ • props: product     │    │    │  │  │
│  │  │  │    │ • props: onQuickView │    │    │  │  │
│  │  │  │    └──────────────────────┘    │    │  │  │
│  │  │  └─────────────────────────────────┘    │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 🔄 Data Flow (One-way Data Flow)

```
[DATA SOURCE: mockProducts] 
     ↓ (pass down via props)
[App] → [ProductList] → [ProductCard] → [UI Display]
     ↑                                    │
     │                                    ↓
     └──── [Event: onClick] ← [User Action]
               ↓
     [Callback: handleQuickView]
               ↓
     [setState: lastViewed] → [Re-render App] → [UI Update]
```

> 📌 **Nguyên tắc vàng**: Dữ liệu chảy **xuôi** (props), sự kiện chảy **ngược** (callbacks).

---

## 2. Luồng Khi Trang Web Tải

### 🚀 Giai đoạn 1: Initial Render

```
1. Code bắt đầu chạy từ dưới cùng:
   ReactDOM.createRoot(...).render(<App />)
   
2. Component <App /> được gọi lần đầu:
   ├─ Tạo state: lastViewed = null
   ├─ Định nghĩa hàm: handleQuickView
   ├─ Trả về JSX chứa:
   │  • Header (tiêu đề + số lượng sản phẩm)
   │  • <ProductList products={mockProducts} onQuickView={handleQuickView} />
   │  • Section notes (hiển thị "Chưa bấm sản phẩm nào...")
   
3. <ProductList /> nhận props và chạy:
   ├─ Dùng .map() duyệt qua 10 sản phẩm trong mockProducts
   ├─ Với mỗi sản phẩm → tạo 1 <ProductCard />
   ├─ Truyền xuống: product (dữ liệu) + onQuickView (hàm từ App)
   
4. Mỗi <ProductCard /> nhận props và render:
   ├─ Hiển thị: ảnh + tên + giá (đã format)
   ├─ Nút "Xem nhanh" có gắn sự kiện onClick
   └─ Kết quả: 10 card sản phẩm hiện ra màn hình
```

✅ **Kết thúc giai đoạn 1**: Giao diện hiển thị đủ 10 sản phẩm, trạng thái `lastViewed = null`.

---

## 3. Luồng Khi User Click

### 👆 Giai đoạn 2: User Interaction

Giả sử user click vào card **Xiaomi 14**:

```
1. Sự kiện onClick trên button được kích hoạt
   ↓
2. Chạy hàm: () => onQuickView(product)
   • product ở đây chính là {id:3, name:"Xiaomi 14", ...}
   ↓
3. onQuickView thực chất là handleQuickView từ App
   ↓
4. Hàm handleQuickView chạy:
   ├─ setLastViewed(product) → cập nhật state lastViewed = Xiaomi 14
   ├─ console.log(...) → in thông tin ra console (để debug)
   ↓
5. setState kích hoạt App re-render (chạy lại hàm App)
   ↓
6. App render lại với lastViewed MỚI:
   ├─ ProductList vẫn giữ nguyên (vì products không đổi)
   ├─ Section "notes" thay đổi nội dung:
      • Trước: "Chưa bấm sản phẩm nào..."
      • Sau: "Ban vua bam: Xiaomi 14 (14.990.000 d)"
   ↓
7. React cập nhật DOM → user thấy màn hình thay đổi
```

✅ **Kết thúc giai đoạn 2**: Giao diện cập nhật thông báo sản phẩm vừa xem.

---

## 4. Sơ Đồ Luồng Dữ Liệu

```
┌─────────────────┐
│   mockProducts  │  (dữ liệu gốc - không đổi)
└────────┬────────┘
         │ (truyền xuống qua props)
         ▼
┌─────────────────┐
│      App        │
│ • state: lastViewed │
│ • handler: handleQuickView │
└────┬───────┬────┘
     │       │
     │       │ (truyền handler xuống)
     │       ▼
     │ ┌─────────────┐
     │ │ ProductList │
     │ • map() 10 items │
     │ • render 10 ProductCard │
     │ └──────┬──────┘
     │        │
     │        │ (truyền product + handler)
     │        ▼
     │ ┌─────────────┐
     │ │ ProductCard │
     │ • Hiển thị UI │
     │ • onClick → gọi handler │
     │ └──────┬──────┘
     │        │
     │        │ (user click)
     │        ▼
     │ ┌─────────────┐
     │ │ handleQuickView │
     │ • setLastViewed() │
     │ • console.log()   │
     │ └──────┬──────┘
     │        │
     │        │ (state thay đổi → trigger re-render)
     │        ▼
     └──► App render lại → UI cập nhật ◄──┘
```

---

## 5. 3 Điểm Cốt Lõi

| Điểm | Giải thích | Ví dụ trong code |
|------|-----------|------------------|
| **Props Drilling** | Dữ liệu và hàm được truyền từ cha → con qua props | `App` → `ProductList` → `ProductCard` |
| **State + Re-render** | Khi gọi `setState`, component chứa state chạy lại → UI tự cập nhật | `setLastViewed()` → App re-render |
| **Event Bubbling Ngược** | User click ở component con → gọi hàm từ component cha để xử lý | `ProductCard.onClick` → `App.handleQuickView` |

---

## 6. Code Reference

### 📦 Mock Data

```javascript
const mockProducts = [
    { id: 1, name: "iPhone 15 128GB", price: 21490000, image: "..." },
    { id: 2, name: "Samsung Galaxy S24", price: 19990000, image: "..." },
    // ... 10 items total
];
```

### 🔧 Utility Function

```javascript
function formatVnd(number) {
    return number.toLocaleString("vi-VN") + " d";
}
```

### 🧩 Components

```javascript
// ProductCard - Hiển thị 1 sản phẩm
function ProductCard({ product, onQuickView }) {
    return (
        <article className="card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{formatVnd(product.price)}</p>
            <button onClick={() => onQuickView(product)}>Xem nhanh</button>
        </article>
    );
}

// ProductList - Render danh sách
function ProductList({ products, onQuickView }) {
    return (
        <section className="grid">
            {products.map((item) => (
                <ProductCard key={item.id} product={item} onQuickView={onQuickView} />
            ))}
        </section>
    );
}

// App - Quản lý state và điều phối
function App() {
    const [lastViewed, setLastViewed] = React.useState(null);
    
    function handleQuickView(product) {
        setLastViewed(product);
        console.log("Quick view:", product.id, product.name);
    }

    return (
        <main>
            <ProductList products={mockProducts} onQuickView={handleQuickView} />
            <section>
                {lastViewed 
                    ? `Bạn vừa bấm: ${lastViewed.name}` 
                    : "Chưa bấm sản phẩm nào"}
            </section>
        </main>
    );
}
```

---

## 🎯 Tóm Tắt

> **Vòng lặp cốt lõi của React:**
> ```
> Render UI → User tương tác → Cập nhật state → Re-render UI
> ```

> **3 nguyên tắc cần nhớ:**
> 1. ✅ Dữ liệu truyền xuôi (props)
> 2. ✅ Sự kiện truyền ngược (callbacks)
> 3. ✅ State thay đổi → component re-render

