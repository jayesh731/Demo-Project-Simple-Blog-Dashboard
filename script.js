let title = document.getElementById('title');
let textarea = document.getElementById('textarea');
const saveBtn = document.getElementById('saveBtn');
const postContainer = document.querySelector('.post-container');
const form = document.querySelector('form');
const radioContainer = document.querySelector('.radioContainer');

let posts = [];

// clear LocalStorage
function clearLocalStorage() {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = "posts=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    fetchUser();
}

// function for handel error
function handelError(msg, err) {
    console.log(msg, err);
    let error = document.getElementById('error');
    error.textContent = msg;
}

async function fetchUser() {
    let radio = localStorage.getItem('radioState') || 'localStorage';
    document.getElementById(radio).checked = true;

    let savedPost;
    if (radio == "localStorage") {
        savedPost = localStorage.getItem('blogPosts');
    }
    else if (radio == "sessionStorage") {
        savedPost = sessionStorage.getItem('blogPosts');
    }
    else if (radio == "coockie") {
        const cookies = document.cookie
            .split("; ")
            .find(row => row.startsWith("posts="));
        savedPost = cookies ? JSON.parse(decodeURIComponent(cookies.split("=")[1])) : [];
    }

    if (savedPost) {
        posts = JSON.parse(savedPost);
        display();
    } else {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=10');
            posts = await response.json();
            console.log("post", posts);
            savePosts();
            display();
        } catch (error) {
            handelError("Error while fetching data : ", error);
        }
    }
}
fetchUser();


// Display Posts
function display() {
    const item = posts.map((post) => {
        return `
        <div class="item">
                <h3>${post.title}</h3>
                <p>${post.body}</p>
                <button class="delete" id=${post.id}>Delete</button>
                <button class="edit" id=${post.id}>Edit</button>
        </div>
            `
    }).join("");
    postContainer.innerHTML = item;
}

// save post to storage
function savePosts() {
    let radio = localStorage.getItem('radioState') || 'localStorage';
    document.getElementById(radio).checked = true;

    if (radio == "localStorage") {
        localStorage.setItem('blogPosts', JSON.stringify(posts));
    }
    else if (radio == "sessionStorage") {
        sessionStorage.setItem('blogPosts', JSON.stringify(posts));
    }
    else if (radio == "coockie") {
        document.cookie = "posts=" + encodeURIComponent(JSON.stringify(posts)) + "; path=/";
    }
    else {
        alert("Select Storages");
    }

}

function getInput() {
    const newPost = {
        id: Date.now(),
        title: title.value,
        body: textarea.value
    }
    return newPost;
}

// addPost
function addPost() {
    const newPost = getInput();
    posts.unshift(newPost);
    savePosts();
    fetchUser();
}

// delete Post
function deletePost(id) {
    let numberId = Number(id);
    posts = posts.filter((post) => post.id !== numberId);
    savePosts();
    display();
}

// Edit post
function editPost(id) {
    let idN = Number(id);
    newTitle = prompt('Enter title');
    newContent = prompt('Enter Text');
    posts.forEach((post) => {
        if (post.id == idN) {
            post.title = newTitle;
            post.body = newContent;
        }
    })
    savePosts();
    display();
}

// add post with Http Request [POST Request]
function addPostHttp() {
    const newPost = getInput();
    fetch('https://jsonplaceholder.typicode.com/posts?_limit=10', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(newPost)
    })
        .then(res => res.json())
        .then(data => {
            console.log("New post Added", data);
            alert("New post Added", data);
        })
}

// Edit post with Http Request [PUT Request]
function editPostHttp(id) {
    const newPost = {
        id: Date.now(),
        title: newTitle,
        body: newContent
    };
    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(newPost)
    })
        .then(res => res.json())
        .then(data => {
            console.log("post Edited", data);
            alert("post Edited", data);
        })
}

// Delete post with Http Request [Delete Request]
function deletePostHttp(id) {
    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
        method: 'DELETE'
    })
        .then(res => res.json())
        .then(data => {
            console.log("post Deleted", data);
            alert("post Deleted", data);
        })
}


// Event Listener

// save button click
form.addEventListener("submit", function (e) {
    e.preventDefault();
    addPost();
    addPostHttp();
})

//delete button click & Edit button click
postContainer.addEventListener("click", (e) => {
    if (e.target.classList.value == "delete") {
        const id = e.target.id;
        deletePost(id);
        deletePostHttp(id);
    }
    if (e.target.classList.value == "edit") {
        let newTitle;
        let newContent;
        const id = e.target.id;
        editPost(id);
        editPostHttp(id);
    }
})

// radio button
radioContainer.addEventListener("click", (e) => {
    localStorage.setItem('radioState', e.target.id);
    fetchUser();
})

