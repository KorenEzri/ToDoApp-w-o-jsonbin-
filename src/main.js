window.addEventListener("DOMContentLoaded", function () {
  //BASE
  // BUTTONS
  const addButton = document.getElementById("add-button");
  const sortButton = document.getElementById("sort-button");
  const wipeButton = document.getElementById("wipe-button");
  const registerButton = document.getElementById("register-button");
  const signInButton = document.getElementById("load-list");
  const saveBtn = document.createElement("button");
  const cancelbtn = document.createElement("button");
  //BUTTONS END
  //DARKMODE
  const swapStyleSheets = (sheet) => {
    document.getElementById("style").setAttribute("href", sheet);
  };
  const darkModeSwitch = document.getElementById("dark-mode-switch");
  const darkModeselected = document.getElementById("dark-mode-select");
  const darkbackground = document.getElementById("background-image");
  darkbackground.hidden = true;
  const darkModeChecked = JSON.parse(localStorage.getItem("darkmodeon"));
  if (darkModeChecked == true) {
    darkModeselected.checked = true;
  }
  if (darkModeselected.checked) {
    swapStyleSheets("darkmode.css");
    darkbackground.hidden = false;
  }
  //DARKMODE - END
  //REGISTRATION
  const firstNameInput = document.getElementById("first-name");
  const lastNameInput = document.getElementById("last-name");
  const userPassword = document.getElementById("password");
  const introPassword = document.getElementById("intro-password");
  const getUser = localStorage.getItem("user");
  const registerData = [];
  const newUserDetails = [];
  const controlSection = document.getElementById("control-section");
  //REGISTRATION END
  //LIST
  const userInput = document.getElementById("text-input");
  const list = document.getElementById("todo-list");
  const listItemsAll = list.getElementsByTagName("LI");
  const listItemsAllArray = [];
  const oldList = [];
  const userPriority = document.getElementById("priority-selector");
  const search = document.getElementById("search");
  //LIST END
  //COUNTER - COUNTER-RELATED
  const counts = document.getElementById("tasks-finished");
  const finishedCounter = document.getElementById("finished-counter");
  const allSpans = list.getElementsByTagName("SPAN");
  const checkedArr = [];
  const counter = document
    .getElementById("counter")
    .appendChild(document.createTextNode(""));
  finishedCounter.style.display = "none";
  counts.style.display = "none";
  //COUNTER END
  const storedPassword = JSON.parse(localStorage.getItem("password"));
  const mainWrapper = document.getElementById("main-wrapper");
  navigator.permissions.query({ name: "clipboard-write" }).then((status) => {
    status.onchange = () => {};
  });
  const spinner = document.getElementById("spin");
  const regspinner = document.getElementById("regspinner");
  spinner.style.display = "none";
  regspinner.style.display = "none";
  //BASE END
  //FUNCTIONS
  //FUNCTION: ADD TO LIST
  const addToList = () => {
    if (storedPassword === "cyber4s" || storedPassword === `"cyber4s"`) {
      Swal.fire({
        title: "Can't update default bin!",
        text: "Please sign in or register to continue :)",
        icon: "info",
        position: "center",
        showConfirmButton: true,
        toast: true,
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    list.style.display = "none";
    if (userInput.value === "") {
      userInput.focus();
      return;
    }
    const listItem = document.createElement("li");
    const itemContainer = document.createElement("div");
    const todoText = document.createElement("div");
    const todoDate = document.createElement("div");
    const todoPriority = document.createElement("div");
    const chosenPriority =
      userPriority.options[userPriority.selectedIndex].text;
    itemContainer.classList.add("todo-container");
    todoText.classList.add("todo-text");
    todoDate.classList.add("todo-created-at");
    todoPriority.classList.add("todo-priority");
    colorPriority(chosenPriority, todoPriority);
    todoText.appendChild(document.createTextNode(userInput.value));
    todoDate.appendChild(
      document.createTextNode(", added at: " + comfyDate() + "Priority ")
    );
    todoPriority.appendChild(document.createTextNode(chosenPriority));
    list.appendChild(listItem);
    listItem.appendChild(itemContainer);
    itemContainer.appendChild(todoText);
    itemContainer.appendChild(todoDate);
    itemContainer.appendChild(todoPriority);
    userInput.value = "";
    userInput.focus();
    updateCounter();
    updateBin(checkedArr);
    spinner.style.display = "inline-block";
  };
  //FUNCTION: COLOR PRIORITY
  const colorPriority = (priority, element) => {
    switch (priority) {
      case "1":
        element.classList.add("priorityOne");
        break;
      case "2":
        element.classList.add("priorityTwo");
        break;
      case "3":
        element.classList.add("priorityThree");
        break;
      case "4":
        element.classList.add("priorityFour");
        break;
      case "5":
        element.classList.add("priorityFive");
        break;
    }
  };
  //FUNCTION: WIPE LIST
  const wipeList = () => {
    Swal.fire({
      title: "Are you sure you want to delete?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        if (storedPassword === "cyber4s" || storedPassword === "default") {
          Swal.fire({
            title: "This is our default bin, and you WILL NOT delete it!",
            text: "",
            icon: "error",
            showCancelButton: false,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "I understand.",
          });
        } else {
          const PASS = storedPassword;
          localStorage.removeItem("password");
          localStorage.removeItem("user");
          const defaultpass = [];
          defaultpass.push(`"cyber4s"`);
          localStorage.setItem("password", defaultpass); //imhere
          localStorage.setItem("user", "Cyber4s");
          const DELETE_BIN = `http://localhost:3001/b/${PASS}`;
          fetch(DELETE_BIN, {
            method: "DELETE",
          })
            .then((res) => {
              res.text();
            })
            .catch((err) => {
              Swal.fire({
                title: `${err.message}.`,
                text: `${err}  (URL is most likely incorrect (400 BAD REQUEST))`,
                icon: "error",
                showCancelButton: false,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "OK",
              });
              console.log(err);
              window.stop();
            });
          const userSpan = document.getElementById("user-span");
          userSpan.style.display = "none";
          Swal.fire("Deleted!", "Your file has been deleted.", "success");
          localStorage.setItem("deleted", "true");
        }
      }
    });
  };
  //FUNCTION: UPDATE COUNTER
  setTimeout(function () {
    if (!counter.textContent) {
      mainWrapper.classList.add("no-tasks");
    } else {
      mainWrapper.classList.remove("no-tasks");
    }
  }, 1100);
  const updateCounter = (n) => {
    const count = list.querySelectorAll("li").length;
    counter.textContent = count;
    if (n > 0) {
      counts.style.display = "unset";
      finishedCounter.style.display = "unset";
      finishedCounter.textContent = n;
    }
    if (n <= 0 || n === "" || n === undefined) {
      finishedCounter.textContent = "";
      finishedCounter.style.display = "none";
      counts.style.display = "none";
    }
    if (n > 0 && n === count) {
      mainWrapper.classList.add("done-all-tasks");
    } else {
      mainWrapper.classList.remove("done-all-tasks");
    }
    setTimeout(function () {
      if (count === 0 || !count) {
        mainWrapper.classList.add("no-tasks");
      } else {
        mainWrapper.classList.remove("no-tasks");
      }
    }, 800);
  };
  //FUNCTION: COMFY DATE
  const comfyDate = () => {
    const current_datetime = new Date();
    const formatted_date =
      current_datetime.getFullYear() +
      "-" +
      `${current_datetime.getMonth() + 1}`.padStart(2, "0") +
      "-" +
      `${current_datetime.getDate()}`.padStart(2, "0") +
      "T" +
      +`${current_datetime.getHours()}`.padStart(2, "0") +
      ":" +
      current_datetime.getMinutes() +
      ":" +
      current_datetime.getSeconds() +
      "." +
      current_datetime.getMilliseconds() +
      " ";
    return formatted_date;
  };
  //FUNCTION: SORT LIST
  const sortList = () => {
    let i;
    let shouldSwitch;
    let switching = true;
    while (switching) {
      switching = false;
      const listItems = list.getElementsByTagName("LI");
      for (i = 0; i < listItems.length - 1; i++) {
        shouldSwitch = false;
        let priorityValue = listItems[i].querySelector("div.todo-priority")
          .innerHTML;
        if (
          priorityValue <
          listItems[i + 1].querySelector("div.todo-priority").innerHTML
        ) {
          shouldSwitch = true;
          break;
        }
      }
      if (shouldSwitch) {
        listItems[i].parentNode.insertBefore(listItems[i + 1], listItems[i]);
        switching = true;
      }
    }
    userInput.focus();
  };
  //FUNCTION: SEARCH LIST
  const searchList = () => {
    let isUppercase = document.querySelector(".upper-case");
    let filter = search.value.toUpperCase();
    if (isUppercase.checked) {
      filter = search.value;
    }
    for (let i = 0; i < listItemsAll.length; i++) {
      result = listItemsAll[i];
      let innerValue = result.textContent || result.innerText;
      if (isUppercase.checked) {
        if (innerValue.indexOf(filter) > -1) {
          listItemsAll[i].style.display = "";
        } else {
          listItemsAll[i].style.display = "none";
        }
      } else if (innerValue.toUpperCase().indexOf(filter) > -1) {
        listItemsAll[i].style.display = "";
      } else {
        listItemsAll[i].style.display = "none";
      }
    }
  };
  //FUNCTION: CREATE BIN
  const CREATE_BIN = "http://localhost:3001/";
  const createBin = () => {
    spinner.style.display = "inline-block";
    list.style.display = "none";
    mainWrapper.classList.remove("no-tasks");
    registerData.push(firstNameInput.value);
    registerData.push(lastNameInput.value);
    newUserDetails.push(registerData);
    localStorage.setItem("user", registerData);
    const data = JSON.stringify(registerData);
    fetch(CREATE_BIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    })
      .then((initialResponse) => {
        console.log(initialResponse);
        initialResponse.json().then((jsonRes) => {
          localStorage.setItem("password", JSON.stringify(jsonRes));
          introPassword.appendChild(document.createTextNode(jsonRes));
          window.location.reload();
        });
      })
      .catch((err) => {
        Swal.fire({
          title: `${err.message}.`,
          text: `${err}  (URL is most likely incorrect (400 BAD REQUEST))`,
          icon: "error",
          showCancelButton: false,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "OK",
        });
        console.log(err);
        window.stop();
      });
  };
  //FUNCTION: READ BIN / SIGN IN
  const postBin = () => {
    for (let i = 0; i < oldList.length; i++) {
      const currentLapse = i;
      const { date, priority, text } = oldList[i];
      const { index } = oldList[oldList.length - 1];
      if (!date || !priority || !text) {
        return;
      }
      const listItem = document.createElement("li");
      const itemContainer = document.createElement("div");
      const todoText = document.createElement("div");
      const todoDate = document.createElement("div");
      const todoPriority = document.createElement("div");
      const removeBtn = document.createElement("button");
      const copyBtn = document.createElement("button");
      const buttonsDiv = document.createElement("div");
      //checkbox
      const checkedLabel = document.createElement("label");
      const checkedInput = document.createElement("input");
      const checkedDiv = document.createElement("div");
      checkedLabel.classList.add("checked-contain");
      checkedLabel.setAttribute("id", "check-label");
      checkedDiv.classList.add("checked-input");
      checkedInput.setAttribute("type", "checkbox");
      checkedLabel.appendChild(checkedInput);
      checkedLabel.appendChild(checkedDiv);
      if (index) {
        for (let t = 0; t < index.length; t++) {
          if (!checkedArr.includes(index[t])) checkedArr.push(index[t]);
          let k = index[t];
          if (k === currentLapse) {
            checkedInput.setAttribute("checked", "checked");
            itemContainer.classList.toggle("line-through");
            checkedLabel.appendChild(document.createElement("span"));
          }
        }
      }
      //checkbox end
      removeBtn.innerHTML = "Delete";
      removeBtn.classList.add("delete-button");
      copyBtn.innerHTML = "Copy";
      copyBtn.classList.add("copy-button");
      itemContainer.classList.add("todo-container");
      todoText.classList.add("todo-text");
      todoDate.classList.add("todo-created-at");
      todoPriority.classList.add("todo-priority");
      colorPriority(priority, todoPriority);
      buttonsDiv.classList.add("buttons-div");
      todoText.appendChild(document.createTextNode(text));
      todoDate.appendChild(document.createTextNode(date));
      todoPriority.appendChild(document.createTextNode(priority));

      buttonsDiv.appendChild(copyBtn);
      buttonsDiv.appendChild(removeBtn);
      list.appendChild(listItem);
      listItem.appendChild(itemContainer);
      itemContainer.appendChild(todoText);
      itemContainer.appendChild(todoDate);
      itemContainer.appendChild(todoPriority);
      itemContainer.appendChild(buttonsDiv);
      itemContainer.appendChild(checkedLabel);
      removeBtn.addEventListener("click", (e) => {
        if (storedPassword === "cyber4s" || storedPassword === `"cyber4s"`) {
          Swal.fire({
            title: "Can't update default bin!",
            text: "Please sign in or register to continue :)",
            icon: "info",
            position: "center",
            showConfirmButton: true,
            toast: true,
            confirmButtonColor: "#3085d6",
          });
          return;
        }
        Swal.fire({
          title: "Are you sure you want to delete?",
          text: "You won't be able to revert this!",
          icon: "warning",
          position: "center",
          showCancelButton: true,
          toast: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        }).then((result) => {
          if (result.isConfirmed) {
            const taskToRemove = e.target.parentNode.parentNode.parentNode;
            taskToRemove.remove();
            updateCounter();
            updateBin();
          }
        });
      });
      list.onclick = (e) => {
        if (e.target.innerHTML !== "Copy") return;
        let fullLi = e.target.parentNode.parentNode.textContent;
        const liLength = fullLi.length;
        const text = fullLi.substr(0, liLength - 10);
        navigator.clipboard.writeText(text);
        e.target.innerHTML = "Copied!";
      };
      userInput.value = "";
      userInput.focus();
      updateCounter();
    }
  };
  const readBin = (password, user) => {
    spinner.style.display = "inline-block";
    if (!password) {
      localStorage.setItem("password", `"cyber4s"`);
      password = "cyber4s";
      Swal.fire({
        title: `<strong>Hey there!`,
        icon: "success",
        html: `</span>You're currently not signed in, so we've signed you into our default bin. To sign in, please register first. \n
          Your password for the default bin, which you can return to at any time without any username is: </br> <strong id="intro-password">cyber4s</strong>`,
        showCloseButton: false,
        showCancelButton: false,
        focusConfirm: false,
        confirmButtonText: '<i class="fa fa-thumbs-up"></i> Great!',
        confirmButtonAriaLabel: "Thumbs up, great!",
        cancelButtonText: '<i class="fa fa-thumbs-down"></i>',
        cancelButtonAriaLabel: "Thumbs down",
      });
    }
    let cyber4s = "cyber4s";
    let PASS = userPassword.value;
    if (password) PASS = password;
    if (password === "cyber4s" || password === `"cyber4s"`) {
      PASS = cyber4s;
      user = { firstname: "Cyber", lastname: "4s" };
    }
    if (!cyber4s) PASS = "default";
    const GET_BIN = `http://localhost:3001/b/${password}`;
    fetch(GET_BIN)
      .catch((err) => {
        Swal.fire({
          title: `${err.message}.`,
          text: `${err}  (URL is most likely incorrect (400 BAD REQUEST))`,
          icon: "error",
          showCancelButton: false,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "OK",
        });
        console.log(err);
        window.stop();
      })
      .then((initialResponse) => {
        initialResponse.json().then((main) => {
          if (main.record[0]) {
            const todoList = main.record[0]["my-todo"];
            if (todoList) {
              for (let i = 0; i < todoList.length; i++) {
                oldList.push(todoList[i]);
              }
            }
          }
          spinner.style.display = "none";
          postBin();
          if (checkedArr.length > 0) {
            finishedCounter.style.display = "unset";
            counts.style.display = "unset";
            finishedCounter.innerText = checkedArr.length;
          }
          if (user) {
            if (user.firstname) {
              const userSpan = document.createElement("span");
              userSpan.setAttribute("id", "user-span");
              userSpan.appendChild(
                document.createTextNode(
                  `Signed in as: ${user.firstname} ${user.lastname} `
                )
              );
              controlSection.appendChild(userSpan);
            } else {
              const userSpan = document.createElement("span");
              userSpan.setAttribute("id", "user-span");
              userSpan.appendChild(
                document.createTextNode(
                  `Signed in as: ${user.replace(",", " ")}`
                )
              );
              controlSection.appendChild(userSpan);
            }
          }
        });
      });
  };
  //FUNCTION: UPDATE BIN
  const updateBin = (checked) => {
    list.style.display = "none";
    spinner.style.display = "inline-block";
    let BIN_ID = `${userPassword.value}`;
    if (storedPassword) BIN_ID = storedPassword;
    const UPDATE_BIN_URL = `http://localhost:3001/b/${BIN_ID}`;
    let todoList = [];
    const amountofChecks = {
      amount: list.getElementsByTagName("SPAN").length,
      index: checked,
    };
    const allDates = document.querySelectorAll(
      "#todo-list > li > div > div.todo-created-at"
    );
    const allTextInputs = document.querySelectorAll(
      "#todo-list > li > div > div.todo-text"
    );
    const allPriorities = document.querySelectorAll(
      "#todo-list > li > div > div.todo-priority"
    );

    for (let j = 0; j < allDates.length; j++) {
      const obj = {
        date: allDates[j].textContent,
        text: allTextInputs[j].textContent,
        priority: allPriorities[j].textContent,
      };
      todoList.push(obj);
    }
    todoList.push(amountofChecks);
    const binUpdate = fetch(UPDATE_BIN_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ "my-todo": todoList }),
    })
      .catch((err) => {
        Swal.fire({
          title: `${err.message}.`,
          text: `${err}  (URL is most likely incorrect (400 BAD REQUEST))`,
          icon: "error",
          showCancelButton: false,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "OK",
        });
        console.log(err);
        window.stop();
      })
      .then(() => {
        window.location.reload();
      });
  };
  //FUNCTION: CHECK ITEM AS DONE
  const checkFinishedTasks = (e) => {
    let target = e.target;
    if (target.tagName !== "LABEL") return;
    for (let i = 0; i < listItemsAll.length; i++) {
      listItemsAllArray.push(listItemsAll[i]);
    }
    let listItemIndex = listItemsAllArray.indexOf(target.closest("LI"));
    const spans = target.getElementsByTagName("SPAN");
    target.parentNode.classList.toggle("line-through");
    if (target.parentNode.classList.contains("line-through")) {
      target.appendChild(document.createElement("span"));
      setTimeout(function () {
        updateCounter(allSpans.length);
      });
      checkedArr.push(listItemIndex);
      updateBin(checkedArr);
    }
    if (!target.parentNode.classList.contains("line-through")) {
      spans[0].remove();
      let remove = checkedArr.indexOf(listItemIndex);
      if (remove !== -1) {
        checkedArr.splice(remove, 1);
      }
      updateCounter(allSpans.length);
      updateBin(checkedArr);
    }
    listItemsAllArray.length = 0;
  };
  //FUNCTION: EDIT TASK
  const editTask = (e) => {
    if (storedPassword === "cyber4s" || storedPassword === `"cyber4s"`) {
      Swal.fire({
        title: "Can't update default bin!",
        text: "Please sign in or register to continue :)",
        icon: "info",
        position: "center",
        showConfirmButton: true,
        toast: true,
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    let target = e.target.closest("LI");
    emptyarray = [];
    for (let i = 0; i < listItemsAll.length; i++) {
      emptyarray.push(listItemsAll[i]);
    }
    let targetTextBox = emptyarray.indexOf(target) + 1;
    let itemToEdit = document.querySelector(
      `#todo-list > li:nth-child(${targetTextBox}) > div > div.todo-text`
    );
    const oldText = itemToEdit.textContent;
    if (itemToEdit.childNodes.length >= 2) return;
    const inputField = document.createElement("INPUT");
    const editBtnDiv = document.createElement("div");
    inputField.setAttribute("placeholder", oldText);
    editBtnDiv.classList.add("edit-button-div");
    saveBtn.classList.add("save-button");
    cancelbtn.classList.add("cancel-button");
    inputField.classList.add("edit-input");
    saveBtn.innerHTML = "Save";
    cancelbtn.innerHTML = "Cancel";
    itemToEdit.style.color = "transparent";
    itemToEdit.appendChild(inputField);
    editBtnDiv.appendChild(saveBtn);
    editBtnDiv.appendChild(cancelbtn);
    itemToEdit.appendChild(editBtnDiv);
    saveBtn.addEventListener("click", () => {
      itemToEdit.textContent = inputField.value;
      itemToEdit.style.color = "unset";
      updateBin();
    });
    cancelbtn.addEventListener("click", () => {
      itemToEdit.style.color = "unset";
      inputField.remove();
      editBtnDiv.remove();
    });
  };
  ///////////////////////***********************************************************/////////////////////////////////
  /*---          -----       BEGIN       -----          ---*/
  ///////////////////////***********************************************************/////////////////////////////////
  //LOAD USER'S LIST
  localStorage.removeItem("deleted");
  readBin(storedPassword, getUser);
  const signedFlag = sessionStorage.getItem("flag");
  const logInMsg = () => {
    if (localStorage.getItem("user")) {
      Swal.fire({
        title: `<strong>Hey there,
      <span id="intro-username"> ${localStorage
        .getItem("user")
        .replace(",", " ")}</strong>`,
        icon: "success",
        html:
          `</span>Your super-secret-password is: </br> <strong id="intro-password">${storedPassword}</strong>` +
          `<br><br>You are now signed in. </span>`,
        showCloseButton: false,
        showCancelButton: false,
        focusConfirm: false,
        confirmButtonText: '<i class="fa fa-thumbs-up"></i> Great!',
        confirmButtonAriaLabel: "Thumbs up, great!",
        cancelButtonText: '<i class="fa fa-thumbs-down"></i>',
        cancelButtonAriaLabel: "Thumbs down",
      });
    }
  };
  if (!signedFlag) {
    logInMsg();
    sessionStorage.setItem("flag", "1");
  }
  //FOCUS ON TASK INPUT BOX
  userInput.focus();
  //FOCUS ON TASK INPUT EVERY TIME YOU CHANGE PRIORITY
  userPriority.addEventListener("change", () => {
    userInput.focus();
  });
  //CHECKBOX WHEN HOVER ON LI: "FINISH TASK"
  list.addEventListener("click", checkFinishedTasks);
  list.addEventListener("dblclick", editTask);
  //ADD TO LIST (ENTER AND CLICK)
  addButton.addEventListener("click", addToList);
  userInput.onkeyup = (event) => {
    if (event.keyCode == 13 || event.which == 13) {
      addButton.click();
    }
  };
  //SORT LIST
  sortButton.addEventListener("click", sortList);
  //SEARCH LIST
  search.addEventListener("keyup", searchList);
  //WIPE LIST
  console.log(localStorage.getItem("deleted"));
  wipeButton.addEventListener("click", () => {
    setTimeout(() => {
      if (localStorage.getItem("deleted")) {
        window.location.reload();
      }
    }, 3000);
    wipeList();
  });
  //REGISTER TO SERVICE (ENTER AND CLICK)
  registerButton.addEventListener("click", () => {
    if (!firstNameInput.value || !lastNameInput.value) {
      Swal.fire({
        position: "top-center",
        icon: "error",
        title: "Please enter your name first =)",
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }
    createBin();
    sessionStorage.clear();
  });
  lastNameInput.onkeyup = (event) => {
    if (event.keyCode == 13 || event.which == 13) {
      if (!firstNameInput.value || !lastNameInput.value) {
        Swal.fire({
          position: "top-center",
          icon: "error",
          title: "Please enter your full name first =)",
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }
      if (!userPassword.value) {
        registerButton.click();
      } else if (userPassword.value) {
        signInButton.click();
      }
    }
  };
  firstNameInput.onkeyup = (event) => {
    if (event.keyCode == 13 || event.which == 13) {
      if (!firstNameInput.value || !lastNameInput.value) {
        Swal.fire({
          position: "top-center",
          icon: "error",
          title: "Please enter your name first =)",
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }
      registerButton.click();
    }
  };
  //SIGN IN
  let allPasswords = [];
  const GET_ALL_PASSWORDS = `http://localhost:3001/all`;
  fetch(GET_ALL_PASSWORDS)
    .catch((err) => {
      Swal.fire({
        title: `${err.message}.`,
        text: `${err}  (URL is most likely incorrect (400 BAD REQUEST))`,
        icon: "error",
        showCancelButton: false,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "OK",
      });
      console.log(err);
      window.stop();
    })
    .then((response) => {
      response.json().then((data) => {
        allPasswords = data;
      });
    });
  signInButton.addEventListener("click", () => {
    sessionStorage.removeItem("flag");
    if (!allPasswords.includes(`${userPassword.value}.json`)) {
      return (
        Swal.fire({
          position: "top-center",
          icon: "error",
          title: `No user found that matches the password: " ${userPassword.value} "`,
          showConfirmButton: false,
          timer: 2000,
        }),
        (userPassword.value = ""),
        userPassword.focus()
      );
    } else if (allPasswords.includes(`${userPassword.value}.json`)) {
      if (
        firstNameInput.value ||
        lastNameInput.value ||
        userPassword.value === "cyber4s"
      ) {
        const credintials = firstNameInput.value + " " + lastNameInput.value;
        localStorage.setItem("user", credintials);
        localStorage.setItem("password", JSON.stringify(userPassword.value));
        readBin(userPassword.value, credintials);
        window.location.reload();
      } else if (!firstNameInput.value && !lastNameInput.value) {
        Swal.fire({
          icon: "error",
          title: "Please enter your name first =)",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    }
  });
  userPassword.onkeyup = (event) => {
    if (event.keyCode == 13 || event.which == 13) {
      signInButton.click();
    }
  };
  //DARK MODE
  darkModeSwitch.addEventListener("change", () => {
    if (darkModeselected.checked) {
      swapStyleSheets("darkmode.css");
      darkbackground.hidden = false;
      localStorage.setItem("darkmodeon", darkModeselected.checked);
    }
    if (!darkModeselected.checked) {
      swapStyleSheets("style.css");
      darkbackground.hidden = true;
      localStorage.removeItem("darkmodeon");
    }
    window.location.reload();
  });
  if (spinner.style.display !== "none") {
    mainWrapper.classList.remove("no-tasks");
  }
});
