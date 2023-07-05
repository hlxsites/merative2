document.addEventListener("DOMContentLoaded", function () {
  init();
});
var scrollContainer = document.createElement('div');
var years = [];
var navs = [];
var previousScroll = 0;
var isProgressing = false;

function init(){
  scrollContainer = document.querySelector(".slider");
  years = document.querySelectorAll('.slide.year');
  navs = document.querySelectorAll('.slider-nav>div');
  if (navigator.appVersion.indexOf('Win') != -1)
    document.querySelector("meta[name=viewport]").setAttribute('content', 'width=device-width, initial-scale='+(1/window.devicePixelRatio));
  horizontalScroll();
  scrollEvent();
  navClick();
  customVH();
}
function scrollEvent(event) {
  scrollContainer = document.querySelector(".slider");
  var fadeIns = document.querySelectorAll('.fadeInPls');
  var counters = document.querySelectorAll('.countup');;
  var sequenceAnimations = document.querySelectorAll('.steps');
  var theVideo = document.querySelector('.title video');
  var theVideoBackground = document.querySelector('.bg-video');
  var played = false;
  scrollContainer.addEventListener('scroll', function(e) {
    if ( theVideo ) {
      var vidBounding = theVideo.getBoundingClientRect();
      var vidExtra = 40;
      if ( window.innerWidth > 1075 )
        vidExtra = 220;
      if ( vidBounding.left + vidExtra - window.innerWidth*.6 < 0 && vidBounding.right > 0 && !played ) {
        theVideo.play();
        theVideoBackground.play();
        played = true;
      } else if (vidBounding.left > window.innerWidth) {
        theVideo.pause();
        theVideo.currentTime = 0;
        played = false;
      }
    }

    fadeIns.forEach(function(item, index) {
      var bounding = fadeIns[index].getBoundingClientRect();
      if ( bounding.left - 100 - window.innerWidth*.6 < 0 && bounding.right > 0 ) {
        fadeIns[index].classList.add('animate');
      } else if (bounding.left > window.innerWidth) {
        fadeIns[index].classList.remove('animate');
      }
    });

    counters.forEach(function(item, index) {
      var bounding = counters[index].getBoundingClientRect();
      if ( bounding.left - 100 - window.innerWidth*.6 < 0 && bounding.right > 0 && !counters[index].classList.contains('counted') ) {
        animateCountUp(counters[index]);
        counters[index].classList.add('counted')
      } else if (bounding.left > window.innerWidth) {
        counters[index].classList.remove('counted');
        counters[index].innerHTML = 0;
      }
    });

    sequenceAnimations.forEach(function(item, index) {
      var bounding = sequenceAnimations[index].getBoundingClientRect();
      if ( bounding.left - 100 - window.innerWidth*.6 < 0 && bounding.right > 0 && !sequenceAnimations[index].classList.contains('animate') ) {
        sequenceAnimations[index].classList.add('animate');
        var children = [].slice.call(sequenceAnimations[index].children);
        var theTimeout = 0;
        children.forEach(function(item2, index) {
          setTimeout( function() {
            item2.classList.add('animate');
            if ( item2.querySelector('.countThis') )
              animateCountUp(item2.querySelector('.countThis'));
          }, theTimeout);
          theTimeout += 1000;
        });
      } else if (bounding.left > window.innerWidth) {
        sequenceAnimations[index].classList.remove('animate');
        var children = [].slice.call(sequenceAnimations[index].children);
        children.forEach(function(item2, index) {
          item2.classList.remove('animate');
          if ( item2.querySelector('.countThis') )
            item2.querySelector('.countThis').innerHTML = 0;
        });
      }
    });

    activeNav();

  });
}

function activeNav() {
  if ( previousScroll < scrollContainer.scrollLeft )
    isProgressing = true;
  else
    isProgressing = false;
  previousScroll = scrollContainer.scrollLeft;

  if ( isProgressing ) {
    years.forEach(function(item,index) {
      var bounding = years[index].getBoundingClientRect();
      if ( bounding.right - window.innerWidth*.6 < 0 ) {
        navs[index].classList.add('visited');
        navs[index].classList.remove('active');
      } else if ( bounding.left - window.innerWidth*.6 < 0 ) {
        navs[index].classList.add('active');
      }
    });
  } else {
    years.forEach(function(item,index) {
      var bounding = years[index].getBoundingClientRect();
      if ( bounding.left - window.innerWidth/2 > 0 ) {
        navs[index].classList.remove('visited');
        navs[index].classList.remove('active');
      } else if ( bounding.right - window.innerWidth/2 > 0 ) {

        navs[index].classList.add('active');
        navs[index].classList.remove('visited');
      } else if ( bounding.right - window.innerWidth < 0 ) {
        navs[index].classList.add('visited');
        navs[index].classList.remove('active');
      }
    });
  }
}

function horizontalScroll() {
  scrollContainer.addEventListener("wheel", function(evt) {
    evt.preventDefault();
    scrollContainer.scrollLeft += evt.deltaY;
  });
}

function navClick() {
  var years = document.querySelectorAll('.slide.year');
  var navButtons = document.querySelectorAll('.slider-nav>div');
  var scrollContainer = document.querySelector('.fitb-wrap .slider');
  var clickCount = 0;

  navButtons.forEach(function(item,index) {
    navButtons[index].addEventListener("click", (evt) => {
      scrollContainer.scrollLeft = scrollContainer.scrollLeft + years[index].getBoundingClientRect().left;

      if ( window.innerWidth < 376 && window.innerHeight < 668 && clickCount < 10) {
        clickCount++;
        navButtons[index].dispatchEvent(new Event('click'));;
      }
      clickCount = 0;

    });
  });
  document.querySelector('.slider-nav>div:first-child').addEventListener("click", (evt) => {
    if ( window.innerWidth < 1076 )
      scrollContainer.scrollLeft = scrollContainer.scrollLeft + years[0].getBoundingClientRect().left;
    });
  document.querySelector('.slider-nav>div:last-child').addEventListener("click", (evt) => {
    if ( window.innerWidth < 1076 )
      scrollContainer.scrollLeft = scrollContainer.scrollLeft + years[11].getBoundingClientRect().left;
    });
};

function scroll(c, a, b, i, up) {
    i++; if (i > 35) {
      return;
    }
    c.scrollLeft = a + (b - a) / 35 * i;
    setTimeout(function(){ scroll(c, a, b, i); }, 20);
}

function smoothScroll(target) {
    var scrollContainer = target;
    do {
        scrollContainer = scrollContainer.parentNode;
        if (!scrollContainer) return;
        scrollContainer.scrollLeft += 1;
    } while (scrollContainer.scrollLeft == 0);

    var targetY = 0;
    do {
        if (target == scrollContainer) break;
        targetY += target.offsetLeft;
    } while (target = target.offsetParent);

    scroll = function(c, a, b, i) {
        i++; if (i > 30) return;
        c.scrollLeft = a + (b - a) / 30 * i;
        setTimeout(function(){ scroll(c, a, b, i); }, 20);
    }
    scroll(scrollContainer, scrollContainer.scrollLeft, targetY, 0);
}



function initWindowResizeFunction() {
  var doit;
  window.onresize = function(){
    resizedw();
    /*clearTimeout(doit);
    doit = setTimeout(resizedw, 200);*/
  };
}
function resizedw(){
  scrollContainer.dispatchEvent(new CustomEvent('scroll'));
}

function customVH() {

let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

window.addEventListener('resize', () => {
    resizedw();
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
});

}



const animationDuration = 1000;
const frameDuration = 1000 / 60;
const totalFrames = Math.round( animationDuration / frameDuration );
const easeOutQuad = t => t * ( 2 - t );

const animateCountUp = el => {
  let frame = 0;
  const countTo = parseInt( el.getAttribute('data-count-to'), 10 );
  const counter = setInterval( () => {
    frame++;
    const progress = easeOutQuad( frame / totalFrames );
    const currentCount = Math.round( countTo * progress );

    if ( parseInt( el.innerHTML, 10 ) !== currentCount ) {
      el.innerHTML = currentCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    if ( frame === totalFrames ) {
      clearInterval( counter );
    }
  }, frameDuration );
};