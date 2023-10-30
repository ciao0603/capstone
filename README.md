# Alpha Camp 個人capstone專案(後端) - 英文家教媒合平台

這是一個英文家教媒合平台，使用者註冊後可瀏覽多位家教的介紹，並根據需求選擇心儀家教預約時段上課，或者申請成為家教的一員進行線上授課。

## 目錄

- [功能](#功能)
- [環境](#環境)
- [安裝](#安裝)
- [測試帳號](#測試帳號)

## 功能

- **使用者註冊/登入：** 使用者需註冊或登入後才可使用網站。

- **第三方登入：** 可直接使用 Google 帳號登入。

- **瀏覽/搜尋課程：** 使用者可以瀏覽所有家教開設的課程資訊，包含個人簡介、教學風格、過往評分及留言等，也可通過關鍵字搜尋。

- **成為家教：** 使用者可以填寫表單成為家教，並自行設定開課的時間。

- **瀏覽/編輯個人介面：** 學生可看到個人學習總時數的排名、尚未開始的預約及對已完課的家教進行評價等；家教可以看到新增的預約及過往學生的評價。學生和家教皆可編輯名字、介紹等資訊。

- **預約課程：** 根據每位家教設定的時間產生學生兩周內(每天18:00pm - 21:00pm)可預約的課程時段 (已被預約的時段不會顯示)。

- **學習時數排名：** 預約上課後即會累積個人總學習時數，首頁右側可看到學習時數前七名的學生排行榜。

- **後台：** 僅限擁有管理員權限的帳號，普通帳號輸入網址會被返回，可看到所有使用者和其對應身分。

## 環境
請先確保已安裝 Node.js 和 npm 。

## 安裝

1. 將專案clone到本地:
```
git clone https://github.com/ciao0603/capstone.git
```
2. 在本地開啟專案:
```
cd capstone
```
3. 下載相關套件:
```
npm i
```
4. 參考 .env 範例設定環境變數:
```
MONGODB_URI=mongodb://localhost/restaurant
SESSION_SECRET=IAmSessionSecret
FACEBOOK_ID=SKIP
FACEBOOK_SECRET=SKIP
FACEBOOK_CALLBACK=http://localhost:3000/auth/facebook/callback
PORT=3000
```
5. 設定資料庫 (或根據個人需求調整):
```
// config/config.json
"development": {
    "username": "root",
    "password": "password",
    "database": "capstone",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
```
6. 建立資料模型:
```
npm run migrate
```
7. 載入種子資料:
```
npm run seed
```
8. 啟動專案:
```
npm run start
// 使用 nodemon 則輸入下行
npm run dev
```
9. 如果看到這行字代表啟動成功，輸入網址即可進入應用程式:
```
Capstone app is listening on localhost:3000
```
10. 如需停止請輸入
```
ctrl+C
```

## 測試帳號
可使用以下三個帳號進行各種身分的測試
- 管理者
[Tab]帳號: root@example.com  
[Tab]密碼: 12345678
- user1
[Tab]身分: 學生  
[Tab]帳號: user1@example.com  
[Tab]密碼: 12345678
- user2
[Tab]身分: 老師  
[Tab]帳號: user2@example.com  
[Tab]密碼: 12345678