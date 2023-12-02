function initializeConfiguration() {
  $(".delivery-cost").text(getCheapestShippingCost())

  injectMegamenuActionButton()
  setupMobileMenu()
  setupExtraMessages();
  setupItemCountModifiers();

  setupSiteCartActionListeners();
  setupViewSelectHandlers();
  setupProductInfoPager();
  setupProductMainImage();

  changePhotoOnHover();
  setupMenuExpander();

  handleSearchOnMobile();
  handleLogoutOnClick();
  handleMobileMenu();
  handleBackgroundOnMobileMenuClick();

  handleProductContainerPosition();
  handleMobileFilterButton();

  appendProductCountOnFooterMenu();
  handleMobileItemsBackgroundClick();

  setupPaymentIcons();
  setupShippingIcons();

  observeProductChanges();
  handleAddOpinionOnTabs();
  handleHideMenuOnBackgroundMousenter();
  handleVerticalMenu();
  onProductNameClicked();
}

function injectMegamenuActionButton() {
  const limit = templateConfiguration.numberOfVisibleCategoryItems
  console.info(`Action button injected on menu on position: ${limit}`)

  $(".submenu.level1 ul.level1 > li.parent").each(function () {
    const level2 = $(this).find(".submenu.level2 ul.level2 > li")
    const hideCount = level2.length - limit;

    level2.slice(limit).hide()

    const expandButton = createButton("expand-menu-button", templateConfiguration.translation.expandCategory, (el) => { })
    expandButton.on("click", (element) => {
      window.location.href = expandButton.parent().find(">h3 a").attr("href")
    })

    $(this).append(expandButton)
  })
}

const createButton = (className, text, clickHandler) => $("<button>", { class: className, text: text, click: clickHandler })

function getCheapestShippingCost() {
  const basket = frontAPI.getBasketInfo({ lang: templateConfiguration.lang, currency: templateConfiguration.currency })
  const nonZeroCostItems = basket.shippings.filter((item) => item.cost_float > 0)

  if (nonZeroCostItems.length == 0) return templateConfiguration.translation.freeDelivery

  const cheapestItem = nonZeroCostItems.reduce((minItem, currentItem) => currentItem.cost_float < minItem.cost_float ? currentItem : minItem, nonZeroCostItems[0])
  return cheapestItem.cost
}

function setupMobileMenu() {
  appendSwipeableMobileMenu();
  $(".fa-align-justify").off();
  $(".fa-align-justify").on("click", function (e) {
    e.preventDefault()
    $(".swipeable-mobile-menu").toggle()
    if ($(".swipeable-mobile-menu").css('display') === "none") {
      $(".mobile-items-background").hide();
    } else {
      $(".mobile-items-background").show();
    }
  })
}

function appendSwipeableMobileMenu() {
  var div = document.createElement("div");
  div.classList.add("swipeable-mobile-menu")
  div.appendChild(createHTMLTree(frontAPI.getCategories(), 0, templateConfiguration.translation.backToShop, templateConfiguration.translation.mobileMenuTitle, ""))

  document.body.appendChild(div);

  let currentLevel = 0;
  const mobileMenu = $(".swipeable-mobile-menu");

  $(".mobile-menu-back").on("click", function (e) {
    if (currentLevel === 0) {
      mobileMenu.hide()
      $(".mobile-items-background").hide();
      const htmlBox = document.querySelector("html");
      htmlBox.style.cssText = "overflow-y: scroll !important;";
      return
    }

    currentLevel--;
    const currentMenu = $(this).parent();
    const prevMenu = $(this).parent().parent().parent();
    mobileMenu.css('transform', `translateX(${-currentLevel * 100}%)`);
    currentMenu.css("display", "none");
    prevMenu.css("overflow", "scroll");
  });

  $(".mobile-menu-item").on("click", function (e) {
    const pixelsFromRight = 30;
    const clickX = e.clientX - $(this).offset().left;

    if (clickX >= ($(this).width() - pixelsFromRight) && $(this).siblings().length > 0) {
      currentLevel++;
      e.preventDefault();
      const nextMenu = $(this).parent().find(">ul");
      const prevMenu = $(this).parent().parent();
      nextMenu.css("display", "block");
      prevMenu.css("overflow", "visible");
      mobileMenu.css('transform', `translateX(${-currentLevel * 100}%)`);
    }
  });
}

function createHTMLTree(categories, level, buttonText, h1Text, h1Url) {
  var ul = document.createElement("ul");
  ul.classList.add(`mobile-level-${level}`);

  // Create an h1 element
  var a = document.createElement("a");
  a.classList = "title-menu";
  a.href = h1Url;
  a.textContent = h1Text;

  // Create a button element
  var button = document.createElement("button");
  button.classList = "mobile-menu-back";
  button.textContent = buttonText;

  ul.appendChild(button);
  ul.appendChild(a);

  categories.forEach(category => {
    var li = document.createElement("li");
    var a = document.createElement("a");

    a.href = `/pl/c/${category.name}/${category.id}`;
    a.textContent = category.name;
    a.classList = "mobile-menu-item";

    li.appendChild(a);

    if (category.children.length > 0) {
      var subTree = createHTMLTree(category.children, level + 1, h1Text, category.name, `/pl/c/${category.name}/${category.id}`);
      li.appendChild(subTree);
    }

    ul.appendChild(li);
  });

  if (level == 0 && typeof customMobileMenuItems !== "undefined") {
    customMobileMenuItems.forEach((item) => {
      var staticItem1 = document.createElement("li");
      var staticLink1 = document.createElement("a");
      staticLink1.href = item.url;
      staticLink1.textContent = item.name;
      staticLink1.classList = "mobile-menu-item";
      staticItem1.appendChild(staticLink1);
      ul.appendChild(staticItem1);
    });
  }

  return ul;
}

function setupExtraMessages() {
  let index = 0,
    messages = $(".extra-message"),
    display = i => messages.hide().eq(i).show(),
    changeIndex = delta => index = (index + delta + messages.length) % messages.length;

  $(".next-message").on("click", () => { changeIndex(1); display(index); });
  $(".prev-message").on("click", () => { changeIndex(-1); display(index); });

  setInterval(() => { changeIndex(1); display(index); }, templateConfiguration.extraMessageAutoChangeAfter);
}

function setupItemCountModifiers() {
  setupItemCountModifier(".quantity input");
  setupItemCountModifier(".quantity_wrap input");
}

function setupItemCountModifier(inputSelector) {
  const inputs = Array.from(document.querySelectorAll(inputSelector));
  const moreButtons = Array.from(document.querySelectorAll(".more-item"));
  const lessButtons = Array.from(document.querySelectorAll(".less-item"));

  function incrementValue(input) {
    try {
      const currentValue = Number(input.value);
      input.value = currentValue + 1;
      const event = new Event("change", { bubbles: true });
      input.dispatchEvent(event);
    } catch (error) { }
  }

  function decrementValue(input) {
    try {
      const currentValue = Number(input.value);
      if (currentValue > 1) {
        input.value = currentValue - 1;
        const event = new Event("change", { bubbles: true });
        input.dispatchEvent(event);
      }
    } catch (error) { }
  }

  moreButtons.forEach((button, index) => {
    button.addEventListener("click", () => incrementValue(inputs[index]));
  });

  lessButtons.forEach((button, index) => {
    button.addEventListener("click", () => decrementValue(inputs[index]));
  });
}

function setupSiteCartActionListeners() {
  const siteBasket = $(".basket-site-cart").get(0);
  const background = $(".menu-background").get(0);
  const menu = $(".menu").get(0);
  const basket = $(".basket.right").get(0);

  if (!siteBasket || templateConfiguration.cartType != "site-cart") return;

  const siteBasketOffset = window.getComputedStyle(siteBasket).getPropertyValue("right");

  $(siteBasket).on("mouseleave click", function () {
    siteBasket.style.right = siteBasketOffset;
    background.style.opacity = 0;
    background.style.height = 0;
    menu.style.zIndex = 24;
  });

  $(basket).on("click", function (e) {
    e.preventDefault()
    siteBasket.style.right = 0;
    background.style.opacity = 1;
    background.style.height = "100%";
  });
}

function setupViewSelectHandlers() {
  const activeTabletClass = "select-tablet-active";
  const tablets = document.querySelectorAll(".select-tablet");

  $(tablets).on("click", function () {
    const selectId = this.getAttribute("select-id");
    tablets.forEach(function (el) { el.classList.remove(activeTabletClass); });
    this.classList.add(activeTabletClass);
    $("#" + selectId).prop("selectedIndex", $(this).index() + 1);
  });
}

function setupProductInfoPager() {
  const activeMenuItemTag = "active-menu-item";
  const productsAttributeSelector = document.querySelector(
    ".product-additional-items-menu"
  );
  if (!productsAttributeSelector) return;

  const firstItem = productsAttributeSelector.children[0];
  firstItem.classList.add(activeMenuItemTag);

  Array.from(productsAttributeSelector.children).forEach((item) => {
    item.addEventListener("click", function () {
      document.querySelectorAll("." + activeMenuItemTag).forEach((element) => {
        element.classList.remove(activeMenuItemTag);
      });
      item.classList.add(activeMenuItemTag);

      Array.from(item.classList).forEach((className) => {
        switch (className) {
          case "description-btn":
            document
              .querySelectorAll(".product-modules > div")
              .forEach((element) => {
                element.style.cssText = "display: none !important";
              });
            document.querySelector("#box_description").style.cssText =
              "display: block !important";
            break;
          case "shipping-btn":
            document
              .querySelectorAll(".product-modules > div")
              .forEach((element) => {
                element.style.cssText = "display: none !important";
              });
            document.querySelector("#box_productdeliveries").style.cssText =
              "display: block !important";
            break;
          case "attributes-btn":
            document
              .querySelectorAll(".product-modules > div")
              .forEach((element) => {
                element.style.cssText = "display: none !important";
              });
            document.querySelector("#box_productdata").style.cssText = "display: block !important";
            break;
          case "bundle-btn":
            document
              .querySelectorAll(".product-modules > div")
              .forEach((element) => {
                element.style.cssText = "display: none !important";
              });
            document.querySelector("#box_bundle").style.cssText = "display: block !important";
            break;
          case "comments-btn":
            const commentsId = templateConfiguration.commentsContainerId !== undefined ? templateConfiguration.commentsContainerId : "#box_productcomments"
            document
              .querySelectorAll(".product-modules > div")
              .forEach((element) => {
                element.style.cssText = "display: none !important";
              });
            document.querySelector(commentsId).style.cssText =
              "display: block !important";
            break;
        }
      });
    });
  });
}

function setupProductMainImage() {
  const productFull = $("#box_productfull")[0];
  if (!productFull) return;

  const productFullClassList = Array.from(productFull.classList);
  if (productFullClassList.includes("horizontal-miniatures")) {
    setupCarouselProductPageHandler(4, 4);
  } else if (productFullClassList.includes("carousel")) {
    setupCarouselProductPageHandler(1, 1);
  } else {
    setupCarouselProductPageHandler(2, 3);
  }
}

function setupCarouselProductPageHandler(itemsPerPage, itemsPerPageMobile) {
  const prevImage = $(".prev-image")[0];
  const nextImage = $(".next-image")[0];
  const links = $(".smallgallery a");
  let currentStartIndex = 0;

  if (!prevImage || !nextImage) return;

  if (links.length <= itemsPerPage) {
    prevImage.style.display = "none";
    nextImage.style.display = "none";
    return;
  }

  $(prevImage).on("click", () => {
    const counter = window.innerWidth < 980 ? itemsPerPageMobile : itemsPerPage
    currentStartIndex = Math.max(currentStartIndex - 1, 0);
    showLinks(links, currentStartIndex, counter);
  });

  $(nextImage).on("click", () => {
    const counter = window.innerWidth < 980 ? itemsPerPageMobile : itemsPerPage
    if (currentStartIndex + counter <= links.length - 1) {
      currentStartIndex++;
    }
    showLinks(links, currentStartIndex, counter);
  });
}

function showLinks(links, startIndex, itemsPerPage) {
  links.each(function (idx, link) {
    if (idx >= startIndex && idx < startIndex + itemsPerPage) {
      $(link).css("display", "inline");
    } else {
      $(link).css("display", "none");
    }
  });
}

function changePhotoOnHover() {
  const thumbnailImages = $(".smallgallery a img");
  thumbnailImages.on("mouseenter", function () {
    $(".smallgallery a").removeClass("current");
    $(this).parent().addClass("current");
    const mainImage = $(".mainimg .photo");
    mainImage.attr("src", this.src);
  });
}

function setupMenuExpander() {
  const menuItems = $('[class^="level_"]>li:has(.current)>a, li:has(.current) >a, li.current:has(ul)>a');
  if (!menuItems.length) return;

  menuItems.on("click", function (e) {
    const lowerMenu = $(this).next();
    if (!lowerMenu.length) return;

    // Calculate the position of the click relative to the element
    const clickPosition = e.clientX - $(this).offset().left;

    // Check if the click is within the last 24 pixels of the element
    if (clickPosition >= $(this).outerWidth() - 24) {
      e.preventDefault();
      const lowerMenuHidden = lowerMenu.css("display") === "none";
      if (lowerMenuHidden) {
        $(this).removeClass("collapsed");
        lowerMenu.css("display", "block");
      } else {
        $(this).addClass("collapsed");
        lowerMenu.css("display", "none");
      }
    }
  });
}

var isSearchOpened = false;
function handleSearchOnMobile() {
  const searchToggle = $(".open-search");
  const searchContainer = $(".search__container");
  const contactHeader = $(".contact-header-container");
  let isSearchOpened = false;

  searchToggle.on("click", () => {
    if (!isSearchOpened) {
      searchContainer.css("display", "block");
      contactHeader.css("display", "none");
    } else {
      searchContainer.css("display", "none");
      contactHeader.css("display", "flex");
    }
    isSearchOpened = !isSearchOpened;
  });
}

function handleLogoutOnClick() {
  const logoutButton = $(".logout-button");

  logoutButton.on("click", () => {
    frontAPI.logout();
    window.location.reload();
  });
}

function handleMobileMenu() {
  const contact = document.querySelector(".footer-menu-contact");
  const search = document.querySelector(".footer-menu-search");
  const account = document.querySelector(".footer-menu-account");
  const basket = document.querySelector(".footer-menu-basket");
  const mobileMenu = document.querySelector(".mobile-menu-items");

  const backButton = document.querySelector(".mobile-menu-items > button");
  const menuItems = document.querySelectorAll(".mobile-menu-items >div");

  backButton.addEventListener("click", () => {
    mobileMenu.style.display = "none";
    const searchContainer = document.querySelector(".search__container");
    searchContainer.style.display = "none";
    $(".mobile-items-background").hide();
    const htmlBox = document.querySelector("html");
    htmlBox.style.cssText = "overflow-y: scroll !important;";
    $(".search__container").hide();
  });

  $(".basket-site-cart button").on('click', function () {
    if (window.innerWidth > 1300) {
      $(".basket-site-cart").get(0).trigger("mouseleave");
      return
    }

    mobileMenu.style.display = "none";
    const basketContainer = document.querySelector(".basket-site-cart");
    basketContainer.style.cssText = "display: none !important;";
    $(".mobile-items-background").hide();
    const htmlBox = document.querySelector("html");
    htmlBox.style.cssText = "overflow-y: scroll !important;";
    $(".search__container").hide();
  })

  contact.addEventListener("click", () => onMobileItemClicked(mobileMenu, menuItems, ".mobile-menu-contact", false, false));
  search.addEventListener("click", () => {
    onMobileItemClicked(mobileMenu, menuItems, ".mobile-menu-search", true, false)
    $(".search__container").show();
  });
  account.addEventListener("click", () => onMobileItemClicked(mobileMenu, menuItems, ".mobile-menu-profile", false, false));
  basket.addEventListener("click", () => onMobileItemClicked(mobileMenu, menuItems, ".mobile-menu-basket", false, true));
}

function onMobileItemClicked(mobileMenu, menuItems, selector, isSearchContainer, isBasketContainer) {
  $(".search__container").hide();
  $(".mobile-items-background").show();
  const htmlBox = document.querySelector("html");
  htmlBox.style.cssText = "overflow-y: hidden !important;";

  $(".swipeable-mobile-menu").hide();
  $("#box_filter").hide();

  mobileMenu.style.display = "block";
  Array.from(menuItems).forEach((element) => { element.style.display = "none"; });
  document.querySelector(selector).style.display = "flex";

  const searchContainer = document.querySelector(".search__container");
  searchContainer.style.display = isSearchContainer ? "block" : "none";

  const basketContainer = document.querySelector(".basket-site-cart");
  basketContainer.style.cssText = isBasketContainer ? "display: block !important;" : "display: none !important;";
}

function handleBackgroundOnMobileMenuClick() {
  const menuIcon = document.querySelector(".fa-align-justify");
  const mobileMenu = document.querySelector(".mobile-menu-items");
  const boxFilter = document.querySelector("#box_filter");
  const html = document.querySelector("html");

  menuIcon.addEventListener('click', function () {
    const isMobileMenuVisible = window.getComputedStyle(mobileMenu).display === "block";
    if (boxFilter) {
      document.querySelector("#box_filter").style.display = "none";
    }

    if (isMobileMenuVisible) {
      document.querySelector(".search__container").style.display = "none";
      document.querySelector(".basket-site-cart").style.cssText = "display: none !important;";
      mobileMenu.style.display = "none";
      html.style.overflowY = "scroll";
    } else {
      html.style.overflowY = "hidden";
    }
  });
}

function handleProductContainerPosition() {
  if ($(".shop_product").length == 0 || $(".with-tabs").length == 1) return

  let isMobileView = false;
  const productContainer = $(".product-container");
  const productAdditionalMenuItems = $(".product-additional-items-menu");
  const productModules = productAdditionalMenuItems.length > 0 ? productAdditionalMenuItems : $(".product-modules");
  const originalParent = productContainer.parent();

  function setMobileView() {
    if (innerWidth < 980 && !isMobileView) {
      isMobileView = true;
      productContainer.insertBefore(productModules);
    } else if (innerWidth >= 980 && isMobileView) {
      isMobileView = false;
      productContainer.appendTo(originalParent);
    }
  }

  setMobileView();

  window.onresize = function (event) {
    setMobileView();
  };
}

function handleMobileFilterButton() {
  const mobileFilterButton = $(".mobile-filter-button");
  const mobileFilterMenuBack = $(".mobile-filter-menu-back");
  const mobileItemBackground = $(".mobile-items-background");
  const shopProductList = $(".shop_product_list");
  if (shopProductList.length == 0) return

  document.body.addEventListener('scroll', () => {
    const scrollY = document.body.scrollTop
    const threshold = 100;

    mobileFilterButton.toggleClass('anchored', scrollY > threshold);
  });

  document.body.addEventListener('touchmove', () => {
    const scrollY = document.body.scrollTop();
    const threshold = 100;

    mobileFilterButton.toggleClass('anchored', scrollY > threshold);
  });

  mobileFilterButton.on("click", () => {
    mobileItemBackground.toggle();
    $("#box_filter").toggle()

    const htmlBox = document.querySelector("html");
    const leftcol = document.querySelector(".leftcol");
    const filter = document.querySelector(".leftcol #box_filter");

    if (mobileItemBackground.css("display") == "block") {
      htmlBox.style.cssText = "overflow-y: hidden !important;";
      if (filter) {
        leftcol.style.cssText = "display: block !important;";
      }
    } else {
      htmlBox.style.cssText = "overflow-y: scroll !important;";
      if (filter) {
        leftcol.style.cssText = "display: none !important;";
      }
    }
  });

  mobileFilterMenuBack.on("click", () => {
    mobileItemBackground.toggle();
    $("#box_filter").toggle()

    const htmlBox = document.querySelector("html");
    const leftcol = document.querySelector(".leftcol");
    const filter = document.querySelector(".leftcol #box_filter");

    if (mobileItemBackground.css("display") == "block") {
      htmlBox.style.cssText = "overflow-y: hidden !important;";
      if (filter) {
        leftcol.style.cssText = "display: block !important;";
      }
    } else {
      htmlBox.style.cssText = "overflow-y: scroll !important;";
      if (filter) {
        leftcol.style.cssText = "display: none !important;";
      }
    }
  });
}

function appendProductCountOnFooterMenu() {
  const maxCountVisible = templateConfiguration.maxCountVisible;
  const basket = frontAPI.getBasketInfo({});
  const productCount = basket.products.reduce((total, product) => total + product.quantity, 0);
  const productCountText = productCount > maxCountVisible ? maxCountVisible + "+" : productCount.toString();

  if (productCount > 0) {
    $(".counts-product-footer").text(productCountText)
    $(".counts-product-footer").show()
  }
}

function handleMobileItemsBackgroundClick() {
  $(".mobile-items-background").on("click", function () {
    $(".swipeable-mobile-menu").hide();
    $(".mobile-menu-items").hide();
    $("#box_filter").hide();
    $(this).hide()

    const searchContainer = document.querySelector(".search__container");
    searchContainer.style.display = "none";

    const basketContainer = document.querySelector(".basket-site-cart");
    basketContainer.style.cssText = "display: none !important;";

    $(".search__container").hide();
  });
}

function setupPaymentIcons() {
  if (!$(".shop_basket")) return

  templateConfiguration.paymentsConfiguration.forEach((config) => {
    const section = $(`#${config.name}`).parent().next();
    section.css("background-image", `url(${config.url})`);
    section.css("padding-left", "48px");
  });
}

function setupShippingIcons() {
  if (!$(".shop_basket")) return

  templateConfiguration.shippingsConfiguration.forEach((config) => {
    const section = $(`#${config.name}`).parent().next();
    section.css("background-image", `url(${config.url})`);
    section.css("padding-left", "48px");
  });
}

function observeProductChanges() {
  var observer = new MutationObserver(checkForEvent);
  observer.observe(document.body, { subtree: true, childList: true });
}

function checkForEvent() {
  const productBlock = $(".ajax-product-block")
  if ($(".ajax-product-block").length && !isAjaxProductBlockLocked) {
    $(".basket-items-wrapper").empty()
    const basket = frontAPI.getBasketInfo();

    isAjaxProductBlockLocked = true
    var itemCount = 0

    basket.products.forEach(function (item) {
      itemCount += item.quantity
      const name = item.url.substring(item.url.lastIndexOf('/') + 1);
      const basketPattern = `
      <li>
          <img src="/environment/cache/images/75_75_productGfx_${item.image}/${item.image_filename}">
          <section>
          <a class="product-name" href="${item.url}">${item.name}</a>
          <span class="product-info">
              <span class="product-amount">${item.quantity} szt.</span><span class="product-price">${item.price}</span>
          </span>
          <span class="remove-product"><a href="${item.remove_url}">usuń</a></span>
          </section>
      </li>
      `
      $(".basket-items-wrapper").append(basketPattern)
    })

    $(".count-products").html(itemCount > 9 ? "9+" : itemCount)
    $(".delivery-cost").html(findDeliveryOption(basket.shippings))
    $(".price-products").html(basket.basket.sum)

    $(".ajax-product-block .btn.left").click(() => isAjaxProductBlockLocked = false)
    $(".modal-header .modal-close").click(() => isAjaxProductBlockLocked = false)
    $('*').removeClass('count-product-empty');

    replaceDiscountValues()
  }
}

var isAjaxProductBlockLocked = false;

function findDeliveryOption(options) {
  const selectedOption = options.find(option => option.selected);

  if (selectedOption.cost_float === 0) {
    return "Darmowa dostawa";
  } else {
    return selectedOption.cost;
  }
}

function handleAddOpinionOnTabs() {
  $(".comment a").click(function (e) {
    if (!$(".with-tabs")) return

    e.preventDefault();
    $(".comments-btn").trigger("click")
    $('body').animate({ scrollTop: $(".comments-btn").position().top });
  });
}

function handleHideMenuOnBackgroundMousenter() {
  $(".menu-background").on("mouseenter", function () {
    const el = $(this)
    el.addClass("menu-background-hidden")
    setTimeout(() => { el.removeClass("menu-background-hidden") }, 400);
  });
}

function handleVerticalMenu() {
  handleBehaviourVerticalMenu()
  $(window).on('resize', handleBehaviourVerticalMenu);
}

function handleBehaviourVerticalMenu() {
  if (window.innerWidth <= 1030) {
    $(".group-filter > h5").next().hide();
    $(".group-filter > h5").on('click', function () {
      $(this).next().toggle();

      if ($(this).hasClass('expanded')) {
        $(this).removeClass('expanded');
      } else {
        $(this).addClass('expanded');
      }
    });
  } else {
    $(".group-filter > h5").off('click');
    $(".group-filter > h5").next().show();
  }
}

function onProductNameClicked() {
  $(".product-inner-wrapper .productnamewrap").click(function () {
    window.location = $(this).parent().find(">a:first-of-type").attr("href");
  });
}
