var userName;
const backendURL = "http://localhost:3000/";
var timeStamp = moment().format("MM.DD.YYYY, h:mm A");
var socket = io(backendURL);

const postData = function (url, data) {
  const xhr = new XMLHttpRequest();
  return new Promise(function (resolve, reject) {
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.setRequestHeader(
      "Authorization",
      "bearer " + localStorage.getItem("jwttoken")
    );
    xhr.send(JSON.stringify(data));
    xhr.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE) {
        if (this.status === 200) {
          resolve(this.response);
        } else {
          reject({
            status: this.status,
            statusText: this.statusText,
            response: this.response,
          });
        }
      }
    };
  });
};

const getData = function (url) {
  const xhr = new XMLHttpRequest();
  return new Promise(function (resolve, reject) {
    xhr.open("GET", url, true);
    xhr.setRequestHeader(
      "Authorization",
      "bearer " + localStorage.getItem("jwttoken")
    );
    xhr.send();
    xhr.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE) {
        if (this.status === 200) {
          resolve(this.response);
        } else {
          reject({
            status: this.status,
            statusText: this.statusText,
            response: this.response,
          });
        }
      }
    };
  });
};

function formatDateTime(time) {
  return moment(time).format("MM.DD.YYYY, h:mm A");
}

// UNTIL USER TYPE SOMETHING ON TEXTBOX THE POST BUTTON IS DISABLED !
$(".chat-textarea").on("input", function (element) {
  if (element.target.value === "") {
    $(".post-button").attr("disabled", true);
  } else {
    $(".post-button").attr("disabled", false);
  }
});

window.onload = (event) => {
  // GET CHATS FROM ALL USERS FROM THE BACKEND SERVER
  $(".chat-container").empty(); //empty the chat container first;
  getData(backendURL + "users/checkJWTtoken")
    .then((data) => {
      userName = JSON.parse(data).user.username;
      getData(backendURL + "chats")
        .then((data) => {
          let parseData = JSON.parse(data);
          if (data.length !== 0) {
            for (let item of parseData) {
              $(".chat-container")
                .append(`<div class='chat-card'><div class='chat-detail'><div class='name'>${
                item.username
              }</div></div><div class='chat-description'>${
                item.description
              }</div>
							<div class='date-time'>${formatDateTime(item.createdAt)}</div></div>`);
            }
            $(".chat-container").scrollTop(
              $(".chat-container")[0].scrollHeight
            );
          }
        })
        .catch((error) => {
          console.log("Could not get the chat history!! Error:", error);
        });
    })
    .catch((error) => {
      console.log("Error:", error);
      window.location.href = "/index.html";
    });
};

// WHEN USER CLICKS ON THE POST BUTTON
$(".post-button").on("click", function () {
  //stores the chat
  let chatDescription = $(".chat-textarea").val();
  // append the chat from the current user into the chat container
  $(".chat-container").append(
    `<div class='chat-card'><div class='chat-detail'><div class='name'>${userName}</div><div class='date-time'>${timeStamp}</div></div><div class='chat-description'>${chatDescription}</div></div>`
  );
  $(".chat-container").scrollTop($(".chat-container")[0].scrollHeight);
  let dataForBackend = {
    username: userName,
    description: chatDescription,
  };
  postData(backendURL + "chats", dataForBackend)
    .then((data) => {
      let parseData = JSON.parse(data);
      socket.emit("connectedUserMessage", JSON.stringify(parseData)); //emit data only when added into server database
    })
    .catch((error) => {
      console.log("Error:", error);
    });
  $(".chat-textarea").val(""); // chat text area reset
  $(".post-button").attr("disabled", true); // post button disabled again
});

// WHEN USER CLICK LOGOUT BUTTON
$(".logout-button").on("click", function () {
  localStorage.clear();
  window.location.href = "/index.html";
});

// ESTABLISH SOCKET CONNECTION TO RECEIVE CHAT MESSAGES FROM OTHER USERS
socket.on("otherConnectedUserMessage", function (msg) {
  let parsedMsg = JSON.parse(msg);
  // do not append current user message into chat container
  if (parsedMsg.username !== userName) {
    $(".chat-container").append(
      `<div class='chat-card'><div class='chat-detail'><div class='name'>${
        parsedMsg.username
      }</div><div class='date-time'>${formatDateTime(
        parsedMsg.createdAt
      )}</div></div><div class='chat-description'>${
        parsedMsg.description
      }</div></div>`
    );
    $(".chat-container").scrollTop($(".chat-container")[0].scrollHeight);
  }
});
