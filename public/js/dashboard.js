// Tạo đối tượng FirebaseUI AuthUI với đối tượng xác thực Firebase đã khởi tạo trước đó
let ui = new firebaseui.auth.AuthUI(auth);

// Lấy ra phần tử HTML một lần và sử dụng chúng sau đó
const login = document.querySelector('.login');
const blogSection = document.querySelector('.blogs-section');
const loginButton = document.getElementById("loginButton");
const usernameField = document.getElementById("username");
const passwordField = document.getElementById("password");

// Lắng nghe sự kiện cuộn trang
window.addEventListener('scroll', () => {
    const backToTopButton = document.getElementById('back-to-top');
    backToTopButton.style.display = document.documentElement.scrollTop > 100 ? 'block' : 'none';
});

// Xử lý sự kiện khi nút "Back to Top" được nhấn
document.getElementById('back-to-top').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Hàm lấy và hiển thị tất cả bài viết từ Firestore dựa trên quyền
function getAllBlogs() {
    if (isAdmin()) {
        db.collection("blogs")
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    createBlog(doc);
                });
            })
            .catch((error) => {
                console.error("Lỗi khi lấy bài viết: ", error);
            });
    } else {
        getUserWrittenBlogs();
    }
}

// Hàm xử lý sự kiện khi người dùng đăng nhập
auth.onAuthStateChanged((user) => {
    if (user) {
        // Nếu người dùng đã đăng nhập
        login.style.display = "none";
        getAllBlogs(); // Hiển thị tất cả bài viết của tất cả tác giả
        hideLoginForm();
    } else {
        // Nếu người dùng chưa đăng nhập
        showLoginForm();
    }
});

// Hàm xử lý sự kiện khi người dùng nhấn nút "Login"
loginButton.addEventListener("click", handleLogin);

// Hàm xóa một blog với xác nhận
function deleteBlog(id) {
    // Hiển thị hộp thoại xác nhận
    const confirmed = confirm("Bạn có chắc chắn muốn xóa bài viết này không?");
    if (confirmed) {
        // Kiểm tra xem người dùng có quyền xóa không
        userHasPermissionToDelete(id)
            .then((hasPermission) => {
                if (hasPermission) {
                    db.collection("blogs")
                        .doc(id)
                        .delete()
                        .then(() => {
                            alert("Bài viết đã được xóa thành công!");
                            location.reload();
                        })
                        .catch((error) => {
                            console.log("Error deleting the blog", error);
                            alert("Đã xảy ra lỗi khi xóa bài viết. Vui lòng thử lại!");
                        });
                } else {
                    alert("Bạn không có quyền xóa bài viết.");
                }
            });
    }
}

// Hàm kiểm tra người dùng có phải là Admin không
function isAdmin() {
    const currentUserUID = firebase.auth().currentUser.uid;
    return currentUserUID === "ZjM8lAWolkaSBvbA0B536Jf5Ws42";
}

// Hàm kiểm tra xem người dùng có quyền xóa bài viết
function userHasPermissionToDelete(blogId) {
    // Kiểm tra xem có phải là Admin không, nếu đúng thì cho phép xóa tất cả
    if (isAdmin()) {
        return Promise.resolve(true);
    }

    // Lấy userUID của người dùng hiện tại
    const currentUserUID = firebase.auth().currentUser.uid;

    // Lấy thông tin bài viết từ Firestore
    return db.collection("blogs")
        .doc(blogId)
        .get()
        .then((doc) => {
            if (doc.exists) {
                const blogData = doc.data();
                // Kiểm tra xem userUID của bài viết có trùng với userUID của người dùng hiện tại không
                return blogData.userUID === currentUserUID;
            } else {
                console.log("Blog not found");
                return false;
            }
        })
        .catch((error) => {
            console.log("Error getting blog data", error);
            return false;
        });
}

// Hàm tạo HTML để hiển thị một blog
function createBlog(blog) {
    const data = blog.data();
    const titleText = document.createElement('div');
    titleText.innerHTML = data.title;
    const articleText = document.createElement('div');
    articleText.innerHTML = data.article;

    // Kiểm tra xem trong nội dung có chứa đường dẫn ảnh hay không
    const hasImage = /<img.*?src="(.*?)"/.test(articleText.innerHTML);
    
    // Tạo một chuỗi mới cho mục tiêu hiển thị
    let overviewText = articleText.textContent.substring(0, 200);

    // Nếu có ảnh và ảnh nằm sau kích thước 200, thêm chữ "Picture"
    if (hasImage && articleText.innerHTML.indexOf('<img') < 200) {
        overviewText += ' (Picture)...';
    } else {
        overviewText += '...';
    }

    blogSection.innerHTML += `
    <div class="blog-card">
        <img src="${data.bannerImage}" class="blog-image" alt="">
        <h1 class="blog-title">${titleText.textContent.substring(0, 100) + '...'}</h1>
        <p class="blog-overview">${overviewText}</p>
        <div class="btn-group">
            <a href="/${blog.id}" class="btn dark">Read</a>
            <a href="/${blog.id}/editor" class="btn grey">Edit</a>
            <a href="#" onclick="deleteBlog('${blog.id}')" class="btn danger">Delete</a>
        </div>
    </div>
    `;
}

// Hàm lấy và hiển thị blog của người dùng
function getUserWrittenBlogs() {
    const currentUserUID = firebase.auth().currentUser.uid;
    db.collection("blogs").where("userUID", "==", currentUserUID)
        .get()
        .then((blogs) => {
            blogs.forEach(createBlog);
        })
        .catch((error) => console.log("Lỗi khi lấy bài viết", error));
}

// Hàm xử lý sự kiện khi người dùng nhấn nút "Login"
function handleLogin() {
    const username = usernameField.value;
    const password = passwordField.value;
    auth.signInWithEmailAndPassword(username, password)
        .then((userCredential) => {
            const user = userCredential.user;
            alert("Đã đăng nhập với tài khoản: " + user.email);
            location.reload();
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Lỗi đăng nhập:", errorCode, errorMessage);
        });
}

// Hiển thị form đăng nhập
function showLoginForm() {
    loginButton.style.display = "block";
    usernameField.style.display = "block";
    passwordField.style.display = "block";
}

// Ẩn form đăng nhập
function hideLoginForm() {
    loginButton.style.display = "none";
    usernameField.style.display = "none";
    passwordField.style.display = "none";
}