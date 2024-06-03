let blogId = decodeURI(location.pathname.split("/").pop());

let docRef = db.collection("blogs").doc(blogId);

docRef.get().then((doc) => {
    if (doc.exists) {
        setupBlog(doc.data());
    } else {
        location.replace("/");
    }
});

const setupBlog = (data) => {
    const banner = document.querySelector('.banner');
    const blogTitle = document.querySelector('.title');
    const titleTag = document.querySelector('title');
    const publish = document.querySelector('.published');
    
    banner.style.backgroundImage = `url(${data.bannerImage})`;

    titleTag.innerHTML += blogTitle.innerHTML = data.title;
    publish.innerHTML += data.publishedAt;
    publish.innerHTML += ` -- ${data.author}`;

    try {
        const currentUser = auth.currentUser;
        const adminUID = "ZjM8lAWolkaSBvbA0B536Jf5Ws42";

        if (currentUser && (currentUser.uid === data.userUID || currentUser.uid === adminUID)) {
            let editBtn = document.getElementById('edit-blog-btn');
            editBtn.style.display = "inline";
            editBtn.href = `${blogId}/editor`;
        }
    } catch {
        // do nothing here
    }

    const article = document.querySelector('.article');
    addArticle(article, data.article);
}

const addArticle = (ele, data) => {
    // Gán trực tiếp HTML từ dữ liệu bài viết
    ele.innerHTML = data;
}
