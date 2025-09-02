# 🌸 LadyWeb

## 📖 Giới thiệu  
LadyWeb là một ứng dụng web được thiết kế để cung cấp các công cụ và tài nguyên hữu ích cho phụ nữ.  
Ứng dụng bao gồm các tính năng như:  
- 📅 Theo dõi chu kỳ kinh nguyệt  
- 🔮 Dự đoán ngày rụng trứng  
- 👶 Tính ngày dự sinh  
- 📚 Thư viện kiến thức  
- 👩‍⚕️ Tư vấn chuyên gia  
- 🛠️ Quản lý người dùng & bài viết  

---

## 🚀 Các tính năng chính  

- **📅 Theo dõi chu kỳ:** Cho phép người dùng theo dõi và dự đoán chu kỳ kinh nguyệt.  
- **🔮 Dự đoán ngày rụng trứng:** Công cụ tính toán ngày rụng trứng, hỗ trợ kế hoạch hóa gia đình.  
- **👶 Tính ngày dự sinh:** Dành cho các bà mẹ tương lai.  
- **📚 Thư viện kiến thức:** Kho bài viết & thông tin về sức khỏe/lối sống.  
- **👩‍⚕️ Tư vấn chuyên gia:** Kết nối và trò chuyện trực tiếp.  
- **🛠️ Quản trị viên:** Quản lý người dùng, bài viết, tài nguyên.  

---

## 🛠️ Công nghệ sử dụng  

### 🌐 Front-end  
- Angular CLI: `19.2.13`  
- TypeScript  
- HTML5 & CSS3  

### 💻 Back-end  
- Node.js + Express  
- MySQL2 + Sequelize  
- Socket.IO (chat realtime)  
- JWT (xác thực người dùng)  
- Nodemailer (gửi email)  
- ImageKit (quản lý & tối ưu hình ảnh)  

---

## ⚙️ Hướng dẫn cài đặt và sử dụng  

### 🔑 Yêu cầu  
- Node.js + npm  
- Angular CLI  
- MySQL  

---

### 📦 Cài đặt Back-end  

Clone repository:  
```bash
git clone <your-repository-url>

Cài dependencies:

npm install


Tạo file .env trong thư mục src:

DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
JWT_SECRET=your-secret-key


Chạy server (development với nodemon):

npm run dev


Chạy server (production):

npm start

🎨 Cài đặt Front-end

Di chuyển đến thư mục front-end:

cd front-end/WomanWeb


Cài dependencies:

npm install


Chạy development server:

ng serve


Truy cập: 👉 http://localhost:4200/

📜 Scripts có sẵn
Back-end
npm start   # chạy production
npm run dev # chạy development (nodemon auto reload)

Front-end
ng serve    # dev server
ng build    # build ra thư mục dist/
ng test     # unit test (Karma)
ng e2e      # end-to-end test

