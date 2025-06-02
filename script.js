let title = document.getElementById('title');
let textarea = document.getElementById('textarea');
const saveBtn = document.getElementById('saveBtn');
const postContainer = document.querySelector('.post-container');
const form = document.querySelector('form');
const radioContainer = document.querySelector('.radioContainer');
const item = document.querySelector('.item');
const email = document.getElementById('email');
const name = document.getElementById('name');
const loading = document.getElementById('Loading');
// popup
const popupForm = document.getElementById('popupForm');
const closePopupBtn = document.getElementById('closePopupBtn');
const popupTitle = document.getElementById('popupTitle');
const popupBody = document.getElementById('popupBody');
const popupFormElement = document.getElementById('popupFormElement');


let posts = [];

// global variable for edit post
let newTitle;
let newContent;

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

    let savedPost = null;
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

        if (cookies) {
            try {
                savedPost = decodeURIComponent(cookies.split("=")[1]);
            } catch (err) {
                console.error("Error decoding cookie:", err);
                savedPost = null;
            }
        } else {
            console.log("Cookie are Empty");
        }
    }

    if (savedPost) {
        try {
            posts = JSON.parse(savedPost);
            display();
            // console.log(posts);
        } catch (error) {
            handelError("Errro while parse savedPost", error)
        }
    } else {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=10');
            posts = await response.json();
            // console.log("post", posts);
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
        <div class="item" id=${post.id}>
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
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 7); // 7 days
        document.cookie = "posts=" + encodeURIComponent(JSON.stringify(posts)) +
            "; path=/; expires=" + expiry.toUTCString();
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
    popupTitle.value = "";
    popupBody.value = "";
    popupForm.classList.remove('hidden');
    closePopupBtn.addEventListener("click", () => {
        popupForm.classList.add('hidden');
    })

    popupFormElement.addEventListener("submit", (e) => {
        e.preventDefault();
        let idN = Number(id);
        newTitle = popupTitle.value;
        newContent = popupBody.value;
        posts.forEach((post) => {
            if (post.id == idN) {
                post.title = newTitle;
                post.body = newContent;
            }
        })
        savePosts();
        display();
        popupForm.classList.add('hidden');
        editPostHttp(id);
    })
}

// add post with Fetch Request [POST Request]
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

// Edit post with Fetch Request [PUT Request]
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

// Delete post with XMLHttpRequest Request [Delete Request]
function deletePostHttp2(id) {
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', `https://jsonplaceholder.typicode.com/posts/${id}`, true);

    xhr.onload = function () {
        if (xhr.status === 200 || xhr.status === 204) {
            console.log("post Deleted", xhr.responseText);
            alert("Post Deleted");
        } else {
            console.error("Failed to delete post", xhr.status);
            alert("Failed to delete post");
        }
    }
    xhr.send();
}


// show username and email
async function showUserInfo(id) {
    // Reset UI before loading
    name.textContent = '';
    email.textContent = '';
    loading.textContent = "Loading...";

    try {
        const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();

        name.textContent = `Name : ${data.name}`;
        email.textContent = `Email : ${data.email}`;
    } catch (error) {
        name.textContent = "Error";
        email.textContent = "No user Found";
        console.error("Failed to fetch user info:", error);
    } finally {
        loading.textContent = "";
    }
}

// show username and email
function closeUserDetails() {
    document.querySelector(".userDetails").classList.remove("show");
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
    if (e.target.classList.contains("delete")) {
        const id = e.target.id;
        deletePost(id);
        // deletePostHttp(id);
        deletePostHttp2(id);
    }
    else if (e.target.classList.contains("edit")) {
        const id = e.target.id;
        editPost(id);
    }
    else if (e.target.closest(".item")) {
        showUserInfo(e.target.closest(".item").id);
        document.querySelector(".userDetails").classList.add("show");
    }
})

// radio button
radioContainer.addEventListener("change", (e) => {
    localStorage.setItem('radioState', e.target.id);
    fetchUser();
})


