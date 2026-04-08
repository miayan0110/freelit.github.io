window.HELP_IMPROVE_VIDEOJS = false;

// var INTERP_BASE = "./static/interpolation/stacked";
// var NUM_INTERP_FRAMES = 240;

// var interp_images = [];
// function preloadInterpolationImages() {
//   for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
//     var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
//     interp_images[i] = new Image();
//     interp_images[i].src = path;
//   }
// }

// function setInterpolationImage(i) {
//   var image = interp_images[i];
//   image.ondragstart = function() { return false; };
//   image.oncontextmenu = function() { return false; };
//   $('#interpolation-image-wrapper').empty().append(image);
// }

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

function setupInteractiveDemoSliders() {
  const defaultColorMap = [
    "#ffffff",
    "#ff4fcf",
    "#ff9bdc",
    "#9b59ff",
    "#4fc3ff"
  ];

  const sliderGroups = document.querySelectorAll('.slider_group');

  sliderGroups.forEach((sliderGroup) => {
    const demoRoot = sliderGroup.closest('.lightlab-demo');
    const img = demoRoot ? demoRoot.querySelector('.demo_img') : null;
    if (!img) return;

    const basePath = sliderGroup.dataset.base;

    // 每個 demo 自己的顏色表，沒設就用 default
    const colorMap = sliderGroup.dataset.colors
      ? sliderGroup.dataset.colors.split(',').map(c => c.trim())
      : defaultColorMap;

    const containers = sliderGroup.querySelectorAll('.demo_slider_container');

    containers.forEach(container => {
      const slider = container.querySelector('input[type="range"]');
      if (!slider) return;

      const x = parseFloat(container.dataset.x || "0.5") * 100;
      const y = parseFloat(container.dataset.y || "0.5") * 100;
      container.style.left = `${x}%`;
      container.style.top = `${y}%`;

      img.src = `${basePath}${slider.value}.png`;

      if (slider.dataset.demoType === "color") {
        const initValue = parseInt(slider.value, 10);
        const initColor = colorMap[initValue] || colorMap[0] || "#ffffff";
        slider.style.setProperty('--SliderColor', initColor);
      }

      slider.addEventListener('input', function () {
        const value = parseInt(this.value, 10);
        img.src = `${basePath}${value}.png`;

        if (this.dataset.demoType === "color") {
          const currentColor = colorMap[value] || colorMap[0] || "#ffffff";
          this.style.setProperty('--SliderColor', currentColor);
        }
      });
    });
  });
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    // Top paired carousel
    var topCarousels = bulmaCarousel.attach('#results-carousel', {
      slidesToScroll: 1,
      slidesToShow: 3,
      loop: true,
      infinite: true,
      autoplay: false,
      autoplaySpeed: 3000,
    });

    // Intensity carousel: 一次只顯示一張
    bulmaCarousel.attach('#intensityCarousel', {
      slidesToScroll: 1,
      slidesToShow: 1,
      loop: false,
      infinite: false,
      autoplay: false,
      autoplaySpeed: 3000,
    });

    // Color carousel: 一次只顯示一張
    bulmaCarousel.attach('#colorCarousel', {
      slidesToScroll: 1,
      slidesToShow: 1,
      loop: false,
      infinite: false,
      autoplay: false,
      autoplaySpeed: 3000,
    });

		// Initialize all div with carousel class
    // var carousels = bulmaCarousel.attach('.carousel', options);

    setupOverlayCarousel();
    setupInteractiveDemoSliders();
    bulmaSlider.attach();

    // // Loop on each carousel initialized
    // for(var i = 0; i < carousels.length; i++) {
    // 	// Add listener to  event
    // 	carousels[i].on('before:show', state => {
    // 		console.log(state);
    // 	});
    // }

    // // Access to bulmaCarousel instance of an element
    // var element = document.querySelector('#my-element');
    // if (element && element.bulmaCarousel) {
    // 	// bulmaCarousel instance is available as element.bulmaCarousel
    // 	element.bulmaCarousel.on('before-show', function(state) {
    // 		console.log(state);
    // 	});
    // }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    // preloadInterpolationImages();

    // $('#interpolation-slider').on('input', function(event) {
    //   setInterpolationImage(this.value);
    // });
    // setInterpolationImage(0);
    // $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

})
