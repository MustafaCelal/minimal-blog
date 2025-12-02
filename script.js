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
    },

    updatePost: async function (id, post) {
        console.log(`Updating post ${id}...`);
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(post)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    },

    deletePost: async function (id) {
        console.log(`Deleting post ${id}...`);
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return true;
    }
};

const app = {
    // State
    posts: [],
    currentPage: 'home',
    isLoading: false,
    isLoggedIn: false,

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

    renderLogin: function () {
        this.currentPage = 'login';
        const appDiv = document.getElementById('app');

        appDiv.innerHTML = `
            <section class="login-container">
                <h2>Admin Login</h2>
                <form onsubmit="app.handleLogin(event)">
                    <div>
                        <label for="username">Username</label>
                        <input type="text" id="username" required>
                    </div>
                    <div>
                        <label for="password">Password</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit">Login</button>
                </form>
            </section>
        `;
        window.scrollTo(0, 0);
    },

    renderAdmin: async function () {
        if (!this.isLoggedIn) {
            this.renderLogin();
            return;
        }

        this.currentPage = 'admin';
        const appDiv = document.getElementById('app');

        this.isLoading = true;
        appDiv.innerHTML = '<div style="text-align: center; margin-top: 50px;">Loading...</div>';

        try {
            this.posts = await api.fetchPosts();
        } catch (error) {
            console.error("Failed to fetch posts:", error);
            appDiv.innerHTML = '<p>Error loading posts.</p>';
            return;
        } finally {
            this.isLoading = false;
        }

        let rowsHtml = this.posts.map(post => `
            <tr>
                <td>${post.title}</td>
                <td>${post.date}</td>
                <td style="text-align: right;">
                    <button class="btn-small" onclick="app.renderEditPost(${post.id})">Edit</button>
                    <button class="btn-small btn-delete" onclick="app.handleDeletePost(${post.id})">Delete</button>
                </td>
            </tr>
        `).join('');

        if (this.posts.length === 0) {
            rowsHtml = '<tr><td colspan="3">No posts found.</td></tr>';
        }

        appDiv.innerHTML = `
            <section class="admin-panel">
                <div class="admin-header">
                    <h2>Admin Panel</h2>
                    <button onclick="app.renderAddPost()">+ Add New Post</button>
                </div>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Date</th>
                            <th style="text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </section>
        `;
        window.scrollTo(0, 0);
    },

    renderAddPost: function () {
        this.currentPage = 'add-post';
        const appDiv = document.getElementById('app');

        appDiv.innerHTML = `
            <section class="add-post-form">
                <a class="back-link" href="#" onclick="app.renderAdmin(); return false;">&larr; Back to Admin</a>
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

    renderEditPost: function (id) {
        this.currentPage = 'edit-post';
        const post = this.posts.find(p => p.id === id);
        const appDiv = document.getElementById('app');

        if (!post) {
            appDiv.innerHTML = '<p>Post not found.</p>';
            return;
        }

        appDiv.innerHTML = `
            <section class="add-post-form">
                <a class="back-link" href="#" onclick="app.renderAdmin(); return false;">&larr; Back to Admin</a>
                <h2>Edit Post</h2>
                <form onsubmit="app.handleEditPost(event, ${id})">
                    <div>
                        <label for="title">Title</label>
                        <input type="text" id="title" value="${post.title}" required>
                    </div>
                    <div>
                        <label for="summary">Summary</label>
                        <input type="text" id="summary" value="${post.summary}" required>
                    </div>
                    <div>
                        <label for="content">Content</label>
                        <textarea id="content" rows="10" required>${post.content}</textarea>
                    </div>
                    <div>
                        <label for="author">Author</label>
                        <input type="text" id="author" value="${post.author}" required>
                    </div>
                    <button type="submit" id="submit-btn">Update Post</button>
                </form>
            </section>
        `;
        window.scrollTo(0, 0);
    },

    // Actions
    handleLogin: function (event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === 'admin' && password === 'admin') {
            this.isLoggedIn = true;
            this.renderAdmin();
        } else {
            alert('Invalid credentials');
        }
    },

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
            this.renderAdmin();
        } catch (error) {
            console.error("Failed to create post:", error);
            alert("Failed to create post. Please try again.");
            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;
        }
    },

    handleEditPost: async function (event, id) {
        event.preventDefault();

        const submitBtn = document.getElementById('submit-btn');
        const originalBtnText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerText = "Updating...";

        const title = document.getElementById('title').value;
        const summary = document.getElementById('summary').value;
        const content = document.getElementById('content').value;
        const author = document.getElementById('author').value;

        // Keep original date or update it? Let's keep original date for now.
        const originalPost = this.posts.find(p => p.id === id);

        const updatedPost = {
            title: title,
            summary: summary,
            content: content,
            author: author,
            date: originalPost.date
        };

        try {
            await api.updatePost(id, updatedPost);
            this.renderAdmin();
        } catch (error) {
            console.error("Failed to update post:", error);
            alert("Failed to update post. Please try again.");
            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;
        }
    },

    handleDeletePost: async function (id) {
        if (!confirm("Are you sure you want to delete this post?")) {
            return;
        }

        try {
            await api.deletePost(id);
            // Wait a bit to ensure server processes delete before fetching again
            // Although await should handle it, sometimes json-server is fast but the file write is async
            // But usually await fetch is enough.
            this.renderAdmin();
        } catch (error) {
            console.error("Failed to delete post:", error);
            alert("Failed to delete post. Please try again.");
        }
    }
};

// Start the app
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
