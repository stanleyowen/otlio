/*! TodoApp - CSS Version 0.1.2 Copyright 2021, Stanley Owen */
var observe;
var scrollTop_btn = document.getElementById("scrollTop");
var currentTheme = localStorage.getItem("__theme");
var form = document.getElementById('comment__form');

if (window.attachEvent) {
    observe = function (element, event, handler) {
        element.attachEvent('on'+event, handler);
    };
}else {
    observe = function (element, event, handler) {
        element.addEventListener(event, handler, false);
    };
}

function init() {
    function resize () {
        form.style.height = 'auto';
        form.style.height = form.scrollHeight+'px';
    }
    function delayedResize () {
        window.setTimeout(resize, 0);
    }
    observe(form, 'change',  resize);
    observe(form, 'cut',     delayedResize);
    observe(form, 'paste',   delayedResize);
    observe(form, 'drop',    delayedResize);
    observe(form, 'keydown', delayedResize);
    form.focus();
    form.select();
    resize();
}

document.addEventListener("DOMContentLoaded", function(){
    setTimeout(function(){
        document.body.classList.add('loaded');
    }, 500);
});

if(currentTheme == "dark"){
    document.body.classList.add("dark");
}

/*window.onscroll = function() {scrollButton()};

function scrollButton() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    scrollTop_btn.style.display = "block";
  } else {
    scrollTop_btn.style.display = "none";
  }
}*/

function scrollToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}


$('a[href*=\\#]').on('click', function(event){
    $('html,body').animate({scrollTop:$(this.hash).offset().top}, 500);
});

$(window).scroll(function(){
    $('.content__fadeIn').each(function(){
        var topElement = $(this).offset().top;
        var bottomElement = $(this).offset().top + $(this).outerHeight();
        var bottomScreen = $(window).scrollTop() + $(window).innerHeight();
        var topScreen = $(window).scrollTop();
        if((bottomScreen > topElement) && (topScreen < bottomElement) && !$(this).hasClass('visible')){
            $(this).addClass('visible');
        }
    });
});

setTimeout(function(){
    $('.content__transition').fadeIn(1500);  
}, 1000);