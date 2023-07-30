
const backendURL = 'http://localhost:3000/users/';

const postData = function (url, data) {
    const xhr = new XMLHttpRequest();
    return new Promise(function (resolve, reject) {
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(data));
        xhr.onreadystatechange = function () {
            if (this.readyState === XMLHttpRequest.DONE) {
                if (this.status === 200) {
                    resolve(this.response);
                }
                else {
                    reject({
                        status: this.status,
                        statusText: this.statusText,
                        response: this.response
                    });
                }
            }
        }
    });
}

const getData = function (url) {
    const xhr = new XMLHttpRequest();
    return new Promise(function (resolve, reject) {
        xhr.open("GET", url, true);
        xhr.setRequestHeader("Authorization", 'bearer ' + localStorage.getItem('jwttoken'));
        xhr.send();
        xhr.onreadystatechange = function () {
            if (this.readyState === XMLHttpRequest.DONE) {
                if (this.status === 200) {
                    resolve(this.response);
                }
                else {
                    reject({
                        status: this.status,
                        statusText: this.statusText,
                        response: this.response
                    });
                }
            }
        }
    });
}

// To suppress form default behavior
$("form").submit(function (event) {
    event.preventDefault()
})

// When index page loads
window.onload = (event) => {
    // Check for JWT Token Validity if valid then redirects to chatroom page
    getData(backendURL + 'checkJWTtoken')
        .then((data) => {
            window.location.href = "/chatroom.html";
        })
        .catch((error) => {
            console.log("Login again token expired!! Error:", error);
        });
}


$(".login-button").click(function () {
    let formValue = $("form").serializeArray();
    if (formValue[0].value === '' || formValue[1].value === '') {
        $(".error-message-box").addClass('show');
        $(".error-message-box span").text("Username or password fields cannot be empty");
    }
    else {
        $(".error-message-box").removeClass('show');
        $(".error-message-box span").text("NA");
        let data = { username: formValue[0].value, password: formValue[1].value };
        postData(backendURL + 'login', data)
            .then((data) => {
                localStorage.setItem('jwttoken', JSON.parse(data).token);
                $("form")[0].reset();
                window.location.href = "/chatroom.html";
            })
            .catch((error) => {
                if (error.status === 401) {
                    $(".error-message-box").addClass('show');
                    $(".error-message-box span").text('Username or Password is incorrect');
                } else {
                    $(".error-message-box").addClass('show');
                    $(".error-message-box span").text('Oops! login failed try again after some time');
                }
            });
    }
});


$(".register-button").click(function () {
    let formValue = $("form").serializeArray();
    if (formValue[0].value === '' || formValue[1].value === '') {
        $(".error-message-box").addClass('show');
        $(".error-message-box span").text("Username or password fields cannot be empty");
    }
    else {
        $(".error-message-box").removeClass('show');
        $(".error-message-box span").text("NA");
        let data = { username: formValue[0].value, password: formValue[1].value };
        postData(backendURL + 'signup', data)
            .then((data) => {
                localStorage.setItem('jwttoken', JSON.parse(data).token);
                $("form")[0].reset();
                window.location.href = "/chatroom.html";
            })
            .catch((error) => {
                if (error.status === 403) {
                    $(".error-message-box").addClass('show');
                    $(".error-message-box span").text(JSON.parse(error.response).err.message);
                } else {
                    $(".error-message-box").addClass('show');
                    $(".error-message-box span").text("Oops! unable to register try again later");
                }
            });
    }
});




