// Lấy các phần tử HTML liên quan đến đăng ký
const signup = document.querySelector('.signup');
const blogSection = document.querySelector('.blogs-section');
const signupButton = document.getElementById("signupButton");
const usernameSignupField = document.getElementById("username-signup");
const passwordSignupField = document.getElementById("password-signup");
const confirmPasswordField = document.getElementById("confirmPassword");

// Hàm xử lý sự kiện khi người dùng nhấn nút "Signup"
function handleSignup() {
    const email = usernameSignupField.value;
    const password = passwordSignupField.value;
    const confirmPassword = confirmPasswordField.value;
  
    if (password !== confirmPassword) {
      alert('Password xác nhận không hợp lệ.');
      return;
    }
  
    // Tạo mới người dùng với Authentication của Firebase
    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const userUID = userCredential.user.uid;
  
        // Lưu thông tin người dùng vào db
        return db.collection("users").doc(userUID).set({
          email: email,
          userUID: userUID,
          password: password,
          createdAt: new Date().toISOString()
        });
      })
      .then(() => {
        alert("Đăng ký thành công");
        window.location.href = "/admin";
      })
      .catch((error) => {
        if (error.code === 'auth/email-already-in-use') {
          alert("Email đã được đăng ký. Vui lòng nhập lại email");
        } else {
          console.error("Error during signup or adding user data to Firestore: ", error);
          alert(error.message);
        }
      });
  }

// Gán sự kiện cho nút "Signup"
signupButton.addEventListener("click", handleSignup);
