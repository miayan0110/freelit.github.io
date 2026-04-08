window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}

function loadOverlay(overlayDiv) {
  if (!overlayDiv) return;
  if (overlayDiv.querySelector('img')) return; // 避免重複加入

  const img = new Image();
  img.src = overlayDiv.dataset.src;
  img.alt = 'overlay image';
  img.draggable = false;
  overlayDiv.appendChild(img);
}

function setupOverlayCarousel() {
  const autoToggleIntervalMs = 1000;
  const items = document.querySelectorAll('#results-carousel .item');

  if (!items.length) return;

  items.forEach(item => {
    const overlay = item.querySelector('.carousel-overlay');
    const sourceImage = item.querySelector('img');

    if (!overlay || !sourceImage) return;

    // 避免重複加載 overlay 圖
    if (!overlay.querySelector('img')) {
      const overlayImg = new Image();
      overlayImg.src = overlay.dataset.src;
      overlayImg.alt = 'overlay image';
      overlayImg.draggable = false;
      overlay.appendChild(overlayImg);
    }

    // 避免重複綁定事件
    if (item.dataset.overlayBound === 'true') return;
    item.dataset.overlayBound = 'true';

    const showOverlay = () => {
      overlay.classList.add('active');
      sourceImage.classList.add('inactive');
    };

    const hideOverlay = () => {
      overlay.classList.remove('active');
      sourceImage.classList.remove('inactive');
    };

    // 桌機：按住看結果
    item.addEventListener('mousedown', showOverlay);

    // 手機：按住看結果
    item.addEventListener('touchstart', showOverlay, { passive: true });

    // 圖片不可拖曳
    sourceImage.addEventListener('dragstart', (event) => {
      event.preventDefault();
    });

    const overlayImg = overlay.querySelector('img');
    if (overlayImg) {
      overlayImg.addEventListener('dragstart', (event) => {
        event.preventDefault();
      });
    }

    // 放開就恢復，掛在 document 上比較穩
    document.addEventListener('mouseup', hideOverlay);
    document.addEventListener('touchend', hideOverlay);
    document.addEventListener('touchcancel', hideOverlay);
  });

  // 自動切換 input / relit
  const autoToggle = setInterval(() => {
    items.forEach(item => {
      const overlay = item.querySelector('.carousel-overlay');
      const sourceImage = item.querySelector('img');

      if (!overlay || !sourceImage) return;

      overlay.classList.toggle('active');
      sourceImage.classList.toggle('inactive');
    });
  }, autoToggleIntervalMs);

  // 點一下 carousel 後，停止自動切換
  const carouselElement = document.getElementById('results-carousel');
  if (carouselElement && carouselElement.dataset.autoToggleBound !== 'true') {
    carouselElement.dataset.autoToggleBound = 'true';

    carouselElement.addEventListener('click', () => {
      clearInterval(autoToggle);
      console.log('Auto-toggle stopped.');
    }, { once: true });
  }
}

function setupSimpleImageSlider(sliderId, imageId, basePath, ext = "png") {
  const slider = document.getElementById(sliderId);
  const image = document.getElementById(imageId);

  if (!slider || !image) return;

  slider.addEventListener("input", function () {
    const value = this.value;
    image.src = `${basePath}/${value}.${ext}`;
  });
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    setupOverlayCarousel();

    setupSimpleImageSlider(
      "color-slider-dark2",
      "color-demo-dark2",
      "./static/images/slider/color/dark_2",
      "png"
    );

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    bulmaSlider.attach();

})
