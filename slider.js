function initializeSlider(config) {
  const sliderWrapper = $(config.slider_id);
  const sliderContent = sliderWrapper.find('.product-slider .slider-wrapper .slider-content');
  const sliderControls = sliderWrapper.find('.product-slider .slider-controls');
  let currentIndex = 0;

  const getWindowSize = () => {
    const screenWidth = window.innerWidth;
    return config.slider_width_ranges.find(
      (range) =>
        screenWidth >= range.range[0] && screenWidth <= range.range[1]
    );
  };

  const getSliderWidth = () => {
    const windowRange = getWindowSize();
    return windowRange.slider_width;
  };

  const updateVisibleItems = () => {
    updateSliderControls();
    sliderContent.css('transform', `translateX(${config.slider_offset * -currentIndex}px)`);
  };

  const updateSliderControls = () => {
    const sliderWidth = getSliderWidth();
    const maxItemWidth = config.item_width;
    const maxVisibleItems = Math.floor(sliderWidth / (maxItemWidth + 20));
    const itemsCount = sliderContent.find('.product-item').length;

    if (currentIndex === itemsCount - maxVisibleItems) {
      sliderControls.find('.slider-control.right').css('display', 'none');
    } else {
      sliderControls.find('.slider-control.right').css('display', 'block');
    }

    if (currentIndex === 0) {
      sliderControls.find('.slider-control.left').css('display', 'none');
    } else {
      sliderControls.find('.slider-control.left').css('display', 'block');
    }
  };

  const updateSliderWidth = () => {
    const sliderWidth = getSliderWidth();
    sliderWrapper.css('max-width', `${sliderWidth}px`);
  };

  const handleArrowClick = (direction) => {
    itemsCount = sliderContent.find('.product-item').length;
    maxVisibleItems = Math.floor(window.innerWidth / (config.item_width + 20));
    console.log("Arek " + direction + " - " + itemsCount + "  " + maxVisibleItems)  

    if (direction === 'left' && currentIndex > 0) {
      currentIndex--;
    } else if (direction === 'right' && currentIndex < itemsCount - maxVisibleItems) {
      currentIndex++;
    }

    updateVisibleItems();
  };

  sliderControls.find('.slider-control.left').click(() => handleArrowClick('left'));
  sliderControls.find('.slider-control.right').click(() => handleArrowClick('right'));

  let touchStartX = 0;
  let touchEndX = 0;

  sliderContent.on('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
  });

  sliderContent.on('touchend', function (e) {
    touchEndX = e.changedTouches[0].clientX;
    const touchDiff = touchStartX - touchEndX;

    if (touchDiff > 50 && currentIndex > 0) {
      currentIndex--;
    } else if (touchDiff < -50 && currentIndex < sliderContent.find('.product-item').length - 1) {
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
