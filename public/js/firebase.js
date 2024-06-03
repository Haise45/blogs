
// Khai báo cấu hình Firebase cho dự án của bạn
const firebaseConfig = {
    apiKey: "AIzaSyB8fsOAjbDVWFeejl9k421PILx_zBnHUmI",
    authDomain: "blogging-b144d.firebaseapp.com",
    projectId: "blogging-b144d",
    storageBucket: "blogging-b144d.appspot.com",
    messagingSenderId: "262381480904",
    appId: "1:262381480904:web:039f07744f2500f4c1eefd",
    measurementId: "G-HLWT16EX9E"
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
