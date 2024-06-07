
// Khai báo cấu hình Firebase cho dự án của bạn
const firebaseConfig = {
    apiKey: "AIzaSyCItQ4EcIGAnOZ6uy6D3TC-1bo4exO9gX4",
    authDomain: "blogging-ed0a6.firebaseapp.com",
    projectId: "blogging-ed0a6",
    storageBucket: "blogging-ed0a6.appspot.com",
    messagingSenderId: "1010057120740",
    appId: "1:1010057120740:web:3b1804eaa896c3106bd5f1",
    measurementId: "G-5XD7C3TPVM"
};

// Khởi tạo Firebase với cấu hình dự án
firebase.initializeApp(firebaseConfig);

// Khởi tạo kết nối tới Firestore
let db = firebase.firestore();

// Khởi tạo Firebase Authentication
let auth = firebase.auth();

// Hàm đăng xuất người dùng
const logoutUser = () => {
    auth.signOut().then(() => {
        location.reload();
    }).catch(error => {
        console.error("Error logging out:", error);
    });
}
