// element
let add = document.getElementById("input_add");
let fetch = document.getElementById("input_fetch");
let body = document.getElementsByTagName("body")[0];
// global function
function getObjStore(db, storeName, mode) {
    let transaction = db.transaction([storeName], mode);
    // return store data
    return transaction.objectStore(storeName);
}

// Profile database ko open karega ya create karega
let request = indexedDB.open("profile", 1);

// Database upgrade ya creation ke liye event
request.onupgradeneeded = function (event) {
    let db = event.target.result;

    // Agar "users" object store exist nahi karta to create kare
    if (!db.objectStoreNames.contains("users")) {
        let store = db.createObjectStore("users", { keyPath: "id", autoIncrement: true });

        // Indexes create karna
        store.createIndex("name", "name", { unique: false });
        store.createIndex("password", "password", { unique: false });
    }

    console.log("Database 'profile' successfully created or upgraded.");
};

// Jab database successfully open ho jaye
request.onsuccess = function (event) {
    console.log("IndexedDB 'profile' is ready to use!");
    let db = event.target.result;

    // ✅ Pehle check karo ki object store exist karta hai ya nahi
    if (!db.objectStoreNames.contains("users")) {
        console.error("Error: Object store 'users' not found! Try clearing the database.");
        return;
    }

    let store = getObjStore(db, "users", "readonly")
    let getRequest = store.get(1);

    getRequest.onsuccess = function () {
        let user = getRequest.result;
        if (user) {
            // Login
            console.log("User Found:", user);
            let db = event.target.result;
            let store = getObjStore(db, "users", "readonly");
            let getRequest = store.get(1);
            fetch.innerHTML = `
                <h2 id="heading">Welcome back ${user.name}</h2> 
                <input type="password" id="pass" placeholder="Enter your password" required>
                <button id="btn">Login</button>
            `;
            body.classList.add("body-theme-0");
            fetch.classList.add("login-container");
            let pass = document.getElementById("pass");
            let heading = document.getElementById("heading");
            let btn = document.getElementById("btn");
            document.getElementById("btn").addEventListener("click", function () {
                if (!((pass.value).trim())) {
                    alert("Please enter correct password");
                }
                else {
                    let server_pass = user.password;
                    let manual_pass = pass.value;
                    if (server_pass === manual_pass) {
                        console.log("Login Successfull");
                        // main page
                        pass.remove();
                        heading.remove();
                        btn.remove();
                        add.remove();
                        fetch.remove();

                        // body.className = "";
                        body.classList.remove("body-theme-0");
                        body.classList.add("body-theme-1");

                        // new page
                        let mp = document.getElementById("mainPage");
                        mp.innerHTML = `
                        <div class="marquee">
                            <span id="hd">Welcome back ${user.name}</span>
                        </div>
                        <nav id="mp_nav">
                            <div class="nav-links">
                                <a href="#" id="home">Home</a>
                                <a href="#" id="add">Add</a>
                                <a href="#" id="delete">Delete</a>
                                <a href="#" id="show">Show</a>
                                <a href="#" id="about">About</a>
                            </div>
                            <button id="logout" class="logout-button">Logout</button>
                        </nav>
                        <div id="dynMainPage"></div>
                        `;
                        let home_nav = document.getElementById("home")
                        let add_nav = document.getElementById("add")
                        let show_nav = document.getElementById("show")
                        let dmp = document.getElementById("dynMainPage");
                        let logout = document.getElementById("logout");
                        function cleardmp() {
                            dmp.innerHTML = "";
                        }
                        function showHome() {
                            cleardmp();
                            dmp.innerHTML = `  
                            <div class="">
                                <div class="card">
                                    <div class="floating-element"></div>
                                    <div class="card-content"></div>
                                </div>
                            </div>
                            `;
                            dmp.classList.add("body-theme-v-0");
                        }
                        function showAdd() {
                            cleardmp();
                            dmp.innerHTML = `  
                                <p> Add Page</p>
                            `;
                        }
                        function showShow() {
                            cleardmp();
                            dmp.innerHTML = `  
                                <p> Show Page</p>
                            `;
                        }
                        function doLogout() {
                            caches.keys().then(names => {
                                names.forEach(name => caches.delete(name));
                            }).then(() => {
                                location.reload(true);
                            });
                        }
                        home_nav.addEventListener("click", showHome);
                        add_nav.addEventListener("click", showAdd);
                        show_nav.addEventListener("click", showShow);
                        logout.addEventListener("click", doLogout);
                    }
                    else {
                        console.log("Incorrect");
                    }
                }
            })
        } else {
            console.warn("No profile found!");
            // add data
            // signup
            add.innerHTML = `
                <h2> Sign Up</h2>
                <input type="text" id="name" placeholder="Enter your name" required>
                <input type="password" id="password" placeholder="Enter you password" required>
                <button id="save">Save</button>
            `;
            body.classList.add("body-theme-0");
            add.classList.add("sign-container");
            let userName = document.getElementById("name");
            let userPassword = document.getElementById("password");
            document.getElementById("save").addEventListener("click", function () {
                // yaha pe || ka use es liye hai taki agr ek bhi true rahe ho alert show jaye
                // true || true
                // true || false
                // false || true
                if (!(userName.value.trim()) || !(userPassword.value.trim())) {
                    alert("name and password can not null!");
                }
                // else mein tab tab nahi jayega jab tak dono false na ho jaye
                // false || false
                else {
                    console.log(userName.value);
                    console.log(userPassword.value);
                    let db = event.target.result;
                    let store = getObjStore(db, "users", "readwrite");

                    // new user add
                    let newUser = { name: userName.value, password: userPassword.value };
                    let addRequest = store.add(newUser);
                }

            });

        };

        getRequest.onerror = function () {
            console.error("Error fetching profile data.");
        };
    };

    // Agar database open karne mein koi error aaye
    request.onerror = function (event) {
        console.log("Error opening IndexedDB 'profile': ", event.target.error);
    }
}
