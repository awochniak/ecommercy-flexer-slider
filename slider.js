function initializeSlider(config) {
  console.log("Init slider for config" + config.slider_id)
  const sliderWrapper = $(config.slider_id + ' .product-slider');
  const slider = $(config.slider_id + ' .slider-content');
  const sliderControls = $(config.slider_id + ' .slider-controls');
  let currentIndex = 0;

  const getWindowSize = () => {
    const screenWidth = window.innerWidth;
    const windowSize = config.slider_width_ranges.find(range => screenWidth >= range.range[0] && screenWidth <= range.range[1]);
    return windowSize
  };

  const getSliderWidth = () => {
    const windowRange = getWindowSize();
    return windowRange.slider_width;
  };

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
      $(config.slider_id + ' .slider-control.right').css('display', 'none');
    } else {
      $(config.slider_id + ' .slider-control.right').css('display', 'block');
    }

    if (currentIndex === 0) {
      $(config.slider_id + ' .slider-control.left').css('display', 'none');
    } else {
      $(config.slider_id + ' .slider-control.left').css('display', 'block');
    }
  }

  const updateSliderWidth = () => {
    const sliderWidth = getSliderWidth();
    sliderWrapper.css('max-width', `${sliderWidth}px`);
  }

  const handleArrowClick = (direction) => {
    const itemsCount = $(config.slider_id + ' .product-item').length;
    const maxVisibleItems = Math.floor(window.innerWidth / (config.item_width + 20));

    if (direction === 'left' && currentIndex > 0) {
      currentIndex--;
    } else if (direction === 'right' && currentIndex < itemsCount - maxVisibleItems) {
      currentIndex++;
    }

    updateVisibleItems();
  };

  $(config.slider_id + ' .slider-control.left').click(() => handleArrowClick('left'));
  $(config.slider_id + ' .slider-control.right').click(() => handleArrowClick('right'));

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

  updateVisibleItems();
  updateSliderWidth();
  updateSliderControls();

  $(window).resize(() => {
    updateSliderWidth();
    updateSliderControls();
  });
}
