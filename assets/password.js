
var getLink = document.querySelector('.js-password__link'),
    getFormPassword = document.querySelector('.js-password__form--password'),
    getFormEmail = document.querySelector('.js-password__form--email'),
    getClose = document.querySelector('.js-password__close'),
    getInputError = document.querySelector('.password__input--error');


getLink.addEventListener('click', function() {
    getFormEmail.style.display = "none";
    getFormPassword.classList.remove("js-password__form--hide");
});

getClose.addEventListener('click', function() {
    getFormEmail.style.display = "block";
    getFormPassword.classList.add("js-password__form--hide");
});
if(getInputError != null && getInputError.hasAttribute('data-error')){
    getFormEmail.style.display = "none";
    getFormPassword.classList.remove("js-password__form--hide");
}