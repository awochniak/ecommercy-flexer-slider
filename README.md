# Slider Component

This is a simple slider component written in JavaScript and jQuery for displaying a carousel of items. It is designed to be configurable and easy to integrate into webpages.

## Features

- Responsive design with variable item widths based on screen size.
- Left and right navigation controls for user interaction.
- Touch support for mobile devices.
- Dynamically adjusts to the screen width and the number of visible items.

## Usage

1. **Include Dependencies**

   Make sure to include the jQuery library in your HTML file before using this slider component.

   ```html
   <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
   ```

2. **Include the Slider JavaScript File**

   Include the `slider.js` file in your HTML file after jQuery.

   ```html
   <script src="slider.js"></script>
   ```

3. **Initialize the Slider**

   You can create an instance of the slider by calling the `initializeSlider` function with a configuration object as follows:

   ```javascript
   $(document).ready(function () {
     const customConfig = {
       slider_id: "#box_specialoffer",
       item_width: 208,
       slider_offset: 265,
       slider_width_ranges: [
         { range: [0, 979], slider_width: 240 },
         { range: [980, 1199], slider_width: 770 },
         { range: [1200, 1679], slider_width: 1035 },
         { range: [1680, Infinity], slider_width: 1300 }
       ]
     };

     initializeSlider(customConfig);
   });
   ```

   Replace the `customConfig` object with your desired configuration.

## Configuration Options

- `slider_id`: The ID of the slider container element.
- `item_width`: The width of each item in pixels.
- `slider_offset`: The total offset of the slider, including item spacing and gaps.
- `slider_width_ranges`: An array of objects defining different screen width ranges and their corresponding slider widths.

## Customization

You can customize the appearance and behavior of the slider by modifying the JavaScript code in `slider.js`. Feel free to tailor it to your specific requirements.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Author

[Arkadiusz Wochniak]

## Acknowledgments

- [jQuery](https://jquery.com/) - The JavaScript library used for DOM manipulation.

---
