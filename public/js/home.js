const blogSection = document.querySelector('.blogs-section');

db.collection("blogs").get().then((blogs) => {
    blogs.forEach(blog => {
        if(blog.id != decodeURI(location.pathname.split("/").pop())){
            createBlog(blog);
        }
    })
})

const createBlog = (blog) => {
    let data = blog.data();
    let titleText = document.createElement('div');
    titleText.innerHTML = data.title;
    let articleText = document.createElement('div');
    articleText.innerHTML = data.article;

    // Kiểm tra xem trong nội dung có chứa đường dẫn ảnh hay không
    let hasImage = /<img.*?src="(.*?)"/.test(articleText.innerHTML);

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
        <a href="/${blog.id}" class="btn dark">read</a>
    </div>
    `;
}

// Lắng nghe sự kiện cuộn trang
window.addEventListener('scroll', () => {
    const backToTopButton = document.getElementById('back-to-top');
    if (document.documentElement.scrollTop > 100) {
        backToTopButton.style.display = 'block';
    } else {
        backToTopButton.style.display = 'none';
    }
});

// Xử lý sự kiện khi nút được nhấn
document.getElementById('back-to-top').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
