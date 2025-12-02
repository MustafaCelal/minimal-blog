// API Configuration
const API_BASE_URL = "http://localhost:3000";
const API_URL = `${API_BASE_URL}/posts`;

// API Service
const api = {
    fetchPosts: async function () {
        console.log(`Fetching from ${API_URL}...`);
        const sortedUrl = `${API_URL}?_sort=id&_order=desc`;
        const response = await fetch(sortedUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },

    fetchPage: async function (slug) {
        console.log(`Fetching page ${slug}...`);
        // json-server structure for nested objects: /pages
        // However, json-server doesn't support fetching a specific key from a nested object directly via URL like /pages/about
        // It returns the whole object for /pages.
        // Let's fetch /pages and extract the slug.
        const response = await fetch(`${API_BASE_URL}/pages`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const pages = await response.json();
        return pages[slug];
    },

    createPost: async function (post) {
        console.log(`Posting to ${API_URL}...`);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(post)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }
};

const app = {
    // State
    posts: [],
    currentPage: 'home',
    isLoading: false,

    // Initialization
    init: function () {
        this.renderHome();
    },

    // Navigation / Routing
    renderHome: async function () {
        this.currentPage = 'home';
        const appDiv = document.getElementById('app');

        // Show Loading State
        this.isLoading = true;
        appDiv.innerHTML = '<div style="text-align: center; margin-top: 50px;">Loading...</div>';

        try {
            // Fetch Data
            // json-server returns the array directly for /posts
            // But we want to sort them by date or ID descending because json-server appends to the end.
            // We can do client-side sorting or use json-server sorting features (e.g. ?_sort=id&_order=desc)
            // Let's fetch with sorting to keep the "newest first" behavior
            this.posts = await api.fetchPosts();

        } catch (error) {
            console.error("Failed to fetch posts:", error);
            appDiv.innerHTML = '<p>Error loading posts. Is the server running?</p>';
            return;
        } finally {
            this.isLoading = false;
        }

        // Render Posts
        let postsHtml = this.posts.map(post => `
            <article class="post-item">
                <h2><a href="#" onclick="app.renderPost(${post.id}); return false;">${post.title}</a></h2>
                <div class="post-meta">
                    <span>${post.date}</span>
                </div>
                <p>${post.summary}</p>
                <a class="read-more" href="#" onclick="app.renderPost(${post.id}); return false;">Read more &rarr;</a>
            </article>
        `).join('');

        if (this.posts.length === 0) {
            postsHtml = '<p>No posts found.</p>';
        }

        appDiv.innerHTML = `
            <section class="post-list">
                ${postsHtml}
            </section>
        `;
        window.scrollTo(0, 0);
    },

    renderPost: function (id) {
        this.currentPage = 'post';
        const post = this.posts.find(p => p.id === id);
        const appDiv = document.getElementById('app');

        if (!post) {
            appDiv.innerHTML = '<p>Post not found.</p>';
            return;
        }

        appDiv.innerHTML = `
            <article class="post-detail">
                <a class="back-link" href="#" onclick="app.renderHome(); return false;">&larr; Back to Home</a>
                <header>
                    <h1>${post.title}</h1>
                    <div class="post-meta">
                        By ${post.author} on ${post.date}
                    </div>
                </header>
                <div class="post-content">
                    <p>${post.content}</p>
                </div>
            </article>
        `;
        window.scrollTo(0, 0);
    },

    renderPage: async function (slug) {
        this.currentPage = slug;
        const appDiv = document.getElementById('app');

        this.isLoading = true;
        appDiv.innerHTML = '<div style="text-align: center; margin-top: 50px;">Loading...</div>';

        try {
            const page = await api.fetchPage(slug);
            if (!page) {
                appDiv.innerHTML = '<p>Page not found.</p>';
                return;
            }

            appDiv.innerHTML = `
                <article class="page-detail">
                    <header>
                        <h1>${page.title}</h1>
                    </header>
                    <div class="page-content">
                        <p>${page.content}</p>
                    </div>
                </article>
            `;
        } catch (error) {
            console.error("Failed to fetch page:", error);
            appDiv.innerHTML = '<p>Error loading page.</p>';
        } finally {
            this.isLoading = false;
        }
        window.scrollTo(0, 0);
    },

    renderAddPost: function () {
        this.currentPage = 'add-post';
        const appDiv = document.getElementById('app');

        appDiv.innerHTML = `
            <section class="add-post-form">
                <a class="back-link" href="#" onclick="app.renderHome(); return false;">&larr; Back to Home</a>
                <h2>Add New Post</h2>
                <form onsubmit="app.handleAddPost(event)">
                    <div>
                        <label for="title">Title</label>
                        <input type="text" id="title" required>
                    </div>
                    <div>
                        <label for="summary">Summary</label>
                        <input type="text" id="summary" required>
                    </div>
                    <div>
                        <label for="content">Content</label>
                        <textarea id="content" rows="10" required></textarea>
                    </div>
                    <div>
                        <label for="author">Author</label>
                        <input type="text" id="author" required>
                    </div>
                    <button type="submit" id="submit-btn">Publish Post</button>
                </form>
            </section>
        `;
        window.scrollTo(0, 0);
    },

    // Actions
    handleAddPost: async function (event) {
        event.preventDefault();

        const submitBtn = document.getElementById('submit-btn');
        const originalBtnText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerText = "Publishing...";

        const title = document.getElementById('title').value;
        const summary = document.getElementById('summary').value;
        const content = document.getElementById('content').value;
        const author = document.getElementById('author').value;

        // We don't need to generate ID, json-server does it.
        // But we need the date.
        const newPost = {
            title: title,
            summary: summary,
            content: content,
            author: author,
            date: new Date().toISOString().split('T')[0]
        };

        try {
            await api.createPost(newPost);
            this.renderHome();
        } catch (error) {
            console.error("Failed to create post:", error);
            alert("Failed to create post. Please try again.");
            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;
        }
    }
};

// Start the app
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
