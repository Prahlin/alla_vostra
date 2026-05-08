"use strict";
//  passive events 
let passiveSupported = false;
try {
    window.addEventListener("test", null, Object.defineProperty({}, "passive", { get: function () { passiveSupported = true; } }));
}
catch (err) { }
//  scroll listener
addEventListener('scroll', e => {
    const height = document.querySelector('.parallax').getBoundingClientRect().height;
    const percentage = Math.min(Math.max(pageYOffset / height, 0), 1);
    document.documentElement.style.setProperty('--pct', percentage);
}, passiveSupported ? { passive: true } : false);
//  link to open without iframe 
const inIframe = () => { try {
    return window.self !== window.top;
}
catch (e) {
    return true;
} };
if (inIframe())
    document.querySelector('.no-iframe').style.display = 'block';




// contact form

const form = document.getElementById("form");
const result = document.getElementById("result");

form.addEventListener("submit", function (e) {
  const formData = new FormData(form);
  e.preventDefault();
  var object = {};
  formData.forEach((value, key) => {
    object[key] = value;
  });
  var json = JSON.stringify(object);
  result.innerHTML = "Please wait...";

  fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: json
  })
    .then(async (response) => {
      let json = await response.json();
      if (response.status == 200) {
        result.innerHTML = json.message;
        result.classList.remove("text-gray-500");
        result.classList.add("text-green-500");
      } else {
        console.log(response);
        result.innerHTML = json.message;
        result.classList.remove("text-gray-500");
        result.classList.add("text-red-500");
      }
    })
    .catch((error) => {
      console.log(error);
      result.innerHTML = "Something went wrong!";
    })
    .then(function () {
      form.reset();
      setTimeout(() => {
        result.style.display = "none";
      }, 5000);
    });
});

// end of contact form

