const config = {
  slider_id: "#box_specialoffer",
  item_width: 208,
  slider_offset: 265, // Sum of item width with spacing and gap between elements
  slider_width_ranges: [
    { range: [0, 979], slider_width: 240 },       // Mobile
    { range: [980, 1199], slider_width: 770 },   // Desktop Small
    { range: [1200, 1679], slider_width: 1035 },  // Desktop Medium
    { range: [1680, Infinity], slider_width: 1300 } // Desktop Large and above
  ]
};

$(document).ready(function () {
  const sliderWrapper = $('.product-slider');
  const slider = $('.slider-content');
  const sliderControls = $('.slider-controls');
  let currentIndex = 0;

  const getWindowSize = () => {
    const screenWidth = window.innerWidth;
    return config.slider_width_ranges.find(range => screenWidth >= range.range[0] && screenWidth <= range.range[1]);
  };

  const getSliderWidth = () => {
    const windowRange = getWindowSize();
    return windowRange.slider_width;
  };

  // Replace the existing updateVisibleItems function with this updated one
  const updateVisibleItems = () => {
    updateSliderControls()
    slider.css('transform', `translateX(${config.slider_offset * -currentIndex}px)`);
  };

  const updateSliderControls = () => {
    const sliderWidth = getSliderWidth();
    const maxItemWidth = config.item_width;
    const maxVisibleItems = Math.floor(sliderWidth / (maxItemWidth + 20));
    const itemsCount = $(config.slider_id + ' .product-item').length;

    if (currentIndex === itemsCount - maxVisibleItems) {
      // Hide the right slider control when at the end
      $('.slider-control.right').css('display', 'none');
    } else {
      // Show the right slider control otherwise
      $('.slider-control.right').css('display', 'block');
    }

    if (currentIndex === 0) {
      // Hide the right slider control when at the end
      $('.slider-control.left').css('display', 'none');
    } else {
      // Show the right slider control otherwise
      $('.slider-control.left').css('display', 'block');
    }
  }

  const updateSliderWidth = () => {
    const sliderWidth = getSliderWidth();
    sliderWrapper.css('max-width', `${sliderWidth}px`);
  }

  const handleArrowClick = (direction) => {
    const itemsCount = $('.product-item').length;
    const maxVisibleItems = Math.floor(window.innerWidth / (config.item_width + 20));

    if (direction === 'left' && currentIndex > 0) {
      currentIndex--;
    } else if (direction === 'right' && currentIndex < itemsCount - maxVisibleItems) {
      currentIndex++;
    }

    updateVisibleItems();
  };

  $('.slider-control.left').click(() => handleArrowClick('left'));
  $('.slider-control.right').click(() => handleArrowClick('right'));

  let touchStartX = 0;
  let touchEndX = 0;

  slider.on('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
  });

  slider.on('touchend', function (e) {
    touchEndX = e.changedTouches[0].clientX;
    const touchDiff = touchStartX - touchEndX;

    if (touchDiff > 50 && currentIndex > 0) {
      currentIndex--;
    } else if (touchDiff < -50 && currentIndex < $('.product-item').length - 1) {
      currentIndex++;
    }

    updateVisibleItems();
  });

  // Initial update of visible items
  updateVisibleItems();
  updateSliderWidth();
  updateSliderControls();

  // Update max-width on window resize
  $(window).resize(() => {
    updateSliderWidth();
    updateSliderControls();
  });
});
