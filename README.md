# Blogging
This is Blog. HTML/CSS/JS/Node JS/  Firebase
User Admin:

Rule: Admin xóa được tất cả bài viết

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }

    function isUserLHB7YX0RXJSPwC71xBNSQCmUXvR2() {
      return request.auth.uid == 'LHB7YX0RXJSPwC71xBNSQCmUXvR2';
    }

    // Cho phép tất cả người dùng đọc tài liệu
    match /blogs/{blogId} {
      allow read: if true;
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && isUserLHB7YX0RXJSPwC71xBNSQCmUXvR2();
    }
  }
}