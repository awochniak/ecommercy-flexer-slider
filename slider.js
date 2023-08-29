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
    const itemsCount = $(config.slider_id + ' .product-item').length / $(config.slider_id).length;

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
    currentIndex = 0;
    slider.css('transform', `translateX(0)`);
    sliderWrapper.css('max-width', `${sliderWidth}px`);
  }

  const handleArrowClick = (direction) => {
    const itemsCount = $(config.slider_id + ' .product-item').length / $(config.slider_id).length;
    const maxVisibleItems = Math.floor(getSliderWidth() / (config.item_width + 20));

    if (direction === 'left' && currentIndex > 0) {
      currentIndex--;
    } else if (direction === 'right' && currentIndex < itemsCount - maxVisibleItems) {
      currentIndex++;
    }

    updateVisibleItems();
  };

  $(config.slider_id + ' .slider-control.left').click(() => handleArrowClick('left'));
  $(config.slider_id + ' .slider-control.right').click(() => handleArrowClick('right'));

  updateVisibleItems();
  updateSliderWidth();
  updateSliderControls();

  $(window).resize(() => {
    updateSliderWidth();
    updateSliderControls();
  });
}
