// Lấy các phần tử DOM
const blogTitleField = document.querySelector(".title");
const articleField = document.querySelector(".article");
const bannerImage = document.querySelector("#banner-upload");
const banner = document.querySelector(".banner");
const publishBtn = document.querySelector(".publish-btn");
const uploadInput = document.querySelector("#image-upload");

// Thay thế khu vực văn bản bằng phiên bản CKEditor
document.addEventListener("DOMContentLoaded", () => {
  ClassicEditor.create(document.querySelector(".article"), {
    toolbar: {
      items: [
        "undo",
        "redo",
        "|",
        "code",
        "codeBlock",
        "sourceEditing",
        "showBlocks",
        "|",
        "heading",
        "|",
        "style",
        "|",
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "|",
        "fontFamily",
        "fontSize",
        "alignment",
        "findAndReplace",
        "|",
        "fontColor",
        "fontBackgroundColor",
        "highlight",
        "specialCharacters",
        "|",
        "removeFormat",
        "subscript",
        "superscript",
        "horizontalLine",
        "|",
        "bulletedList",
        "numberedList",
        "todoList",
        "|",
        "outdent",
        "indent",
        "|",
        "imageInsert",
        "blockQuote",
        "insertTable",
        "mediaEmbed",
        "link",
      ],
    },
    language: "vi",
    image: {
      toolbar: [
        "imageTextAlternative",
        "toggleImageCaption",
        "imageStyle:inline",
        "imageStyle:block",
        "imageStyle:side",
        "linkImage",
      ],
    },
    table: {
      contentToolbar: [
        "tableColumn",
        "tableRow",
        "mergeTableCells",
        "tableCellProperties",
        "tableProperties",
      ],
    },
    wordCount: {
      container: document.querySelector('.word-count-container'),
      displayWords: true,
      displayCharacters: true,
    },
  })
    .then((editor) => {
      window.articleEditor = editor;
    })
    .catch((error) => {
      console.error(error);
    });
});

// Biến lưu đường dẫn banner
let bannerPath;

// Sự kiện thay đổi hình banner
bannerImage.addEventListener("change", () =>
  uploadImage(bannerImage, "banner")
);

// Sự kiện thay đổi hình ảnh
uploadInput.addEventListener("change", () => uploadImage(uploadInput, "image"));

// Hàm tải hình ảnh lên server
const uploadImage = (uploadFile, uploadType) => {
  const [file] = uploadFile.files;
  if (file && file.type.includes("image")) {
    const formData = new FormData();
    formData.append("image", file);

    fetch("/upload", {
      method: "post",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (uploadType === "image") {
          addImage(data, file.name);
        } else {
          bannerPath = `${location.origin}/${data}`;
          banner.style.backgroundImage = `url("${bannerPath}")`;
        }
      })
      .catch(() => alert("Lỗi upload ảnh."));
  } else {
    alert("Chỉ upload file ảnh.");
  }
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Xử lý sự kiện nút Publish
publishBtn.addEventListener("click", () => {
  // Kiểm tra xem có nội dung bài viết và tiêu đề blog không
  if (window.articleEditor.getData().length && blogTitleField.value.length) {
    // Nếu không có ảnh banner, hiển thị cảnh báo và dừng
    if (!bannerPath) {
      alert("Bạn cần phải upload ảnh banner!");
      return;
    }

    let docName;
    // Nếu blogID bắt đầu bằng "editor", tạo ID ngẫu nhiên
    if (blogID[0] === "editor") {
      // Tạo ID ngẫu nhiên từ các ký tự chữ cái
      const letters = "abcdefghijklmnopqrstuvwxyz";
      const blogTitle = blogTitleField.value.split(" ").join("-");
      let id = "";
      for (let i = 0; i < 4; i++) {
        id += letters[Math.floor(Math.random() * letters.length)];
      }
      docName = `${blogTitle}-${id}`;
    } else {
      // Sử dụng blogID đã tồn tại
      docName = decodeURI(blogID[0]);
    }

    const date = new Date(); // Ngày xuất bản

    // Lấy UID của người dùng hiện tại và email
    const userUID = auth.currentUser.uid;
    const currentUserEmail = auth.currentUser.email.split("@")[0];

    // Tạo dữ liệu của blog để lưu vào Firestore
    const blogData = {
      title: blogTitleField.value,
      article: window.articleEditor.getData(),
      bannerImage: bannerPath,
      publishedAt: `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`,
    };

    // Tham chiếu đến tài liệu trong Firestore
    const docRef = db.collection("blogs").doc(docName);

    // Kiểm tra nếu tài liệu tồn tại
    docRef.get().then((doc) => {
      if (doc.exists) {
        // Nếu tồn tại, kiểm tra người viết có phải là admin không
        const data = doc.data();
        if (userUID === "ZjM8lAWolkaSBvbA0B536Jf5Ws42") {
          blogData.author = data.author;
          blogData.userUID = data.userUID;
        } else {
          // Nếu không phải admin, sử dụng email và UID của người viết hiện tại
          blogData.author = currentUserEmail;
          blogData.userUID = userUID;
        }
      } else {
        // Nếu không tồn tại, sử dụng email và UID của người viết hiện tại
        blogData.author = currentUserEmail;
        blogData.userUID = userUID;
      }

      // Lưu dữ liệu của blog vào Firestore
      docRef.set(blogData)
        .then(() => {
          // Chuyển hướng đến trang của bài viết
          location.href = `/${docName}`;
        })
        .catch((err) => {
          console.error(err);
        });
    });
  } else {
    // Nếu thiếu thông tin, hiển thị cảnh báo
    alert("Điền đủ thông tin Tiêu đề và nội dung Blog.");
  }
});

// Kiểm tra người dùng đã đăng nhập chưa
auth.onAuthStateChanged((user) => {
  if (!user) {
    location.replace("/admin");
  }
});

// Kiểm tra và chỉnh sửa blog đã tồn tại
let blogID = location.pathname.split("/");
blogID.shift();

if (blogID[0] !== "editor") {
  const docRef = db.collection("blogs").doc(decodeURI(blogID[0]));
  docRef.get().then((doc) => {
    if (doc.exists) {
      const data = doc.data();
      bannerPath = data.bannerImage;
      banner.style.backgroundImage = `url(${bannerPath})`;
      blogTitleField.value = data.title;
      window.articleEditor.setData(data.article);
    } else {
      location.replace("/");
    }
  });
}
