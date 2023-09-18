function initializeConfiguration() {
    setupCart()
    setupMegamenu()
    setupMobileMenu()
    setupExtraMessages();
    setupCombinedOffersAndNewProducts();
    setupSEOs();
    setupItemCountModifiers();

    setupSiteCartActionListeners();
    setupViewSelectHandlers();
    setupProductInfoPager();
    setupProductMainImage();

    changePhotoOnHover();
    setupMenuExpander();
    setIconsOnChildfulMenuItems();

    handleSearchOnMobile();
    handleLogoutOnClick();
    handleMobileMenu();
    handleBackgroundOnMobileMenuClick();

    handleProductContainerPosition();
    handleMobileFilterButton();
    initProductHover();

    appendProductCountOnFooterMenu();
    renderProducts();
    handleMobileItemsBackgroundClick();

    setupPaymentIcons();
    setupShippingIcons();

    observeProductChanges();
    handleAddOpinionOnTabs();
    handleHideMenuOnBackgroundMousenter();
}

function setupCart() {
    const variant = templateConfiguration.cartType
    console.info(`Selected cart type: ${variant}`)

    switch (variant) {
        case "site-cart":
            $(".basket-contain").remove();
            $(".delivery-cost").text(getCheapestShippingCost())
            break;

        case "short-cart":
            $(".basket-site-cart").hide()
            $(".delivery-cost").text(getCheapestShippingCost())
            break;

        default:
            console.warn(`Invalid basket variant: "${variant}". The variant was not applied.`)
    }
}

function getCheapestShippingCost() {
    const basket = frontAPI.getBasketInfo({ lang: templateConfiguration.lang, currency: templateConfiguration.currency })
    const nonZeroCostItems = basket.shippings.filter((item) => item.cost_float > 0)

    if (nonZeroCostItems.length == 0) return templateConfiguration.translation.freeDelivery

    const cheapestItem = nonZeroCostItems.reduce((minItem, currentItem) => currentItem.cost_float < minItem.cost_float ? currentItem : minItem, nonZeroCostItems[0])
    return cheapestItem.cost
}

function setupMegamenu() {
    const variant = templateConfiguration.megamenuType
    console.info(`Selected mega menu type: ${variant}`)

    const allowedVariants = ["cascade", "version-1", "version-1-plus", "version-2", "version-2-plus", "version-3"]

    $(".menu").removeClass(allowedVariants.join(" "))
    if (allowedVariants.includes(variant)) {
        $(".menu").addClass(variant)
    } else {
        console.warn(`Invalid megamenu variant: "${variant}". The variant was not applied.`)
    }

    switch (variant) {
        case "version-2":
        case "version-2-plus":
            injectMegamenuActionButton()
        case "version-1-plus":
        case "version-2-plus":
            addProductOfTheDaysToMegamenu()
    }
}

function injectMegamenuActionButton() {
    const limit = templateConfiguration.numberOfVisibleCategoryItems
    console.info(`Action button injected on menu on position: ${limit}`)

    $(".submenu.level1 ul.level1 > li.parent").each(function () {
        const level2 = $(this).find(".submenu.level2 ul.level2 > li")
        const hideCount = level2.length - limit;

        if (hideCount <= 0) return

        level2.slice(limit).hide()

        const expandButton = createButton("expand-menu-button", templateConfiguration.translation.expandCategory, () => {
            expandButton.hide()
            collapseButton.show()
            level2.show()
        })

        const collapseButton = createButton("collapse-menu-button", templateConfiguration.translation.collapseCategory, () => {
            collapseButton.hide()
            expandButton.show()
            level2.slice(limit).hide()
        })

        $(this).append(expandButton).append(collapseButton)
    })
}

function addProductOfTheDaysToMegamenu() {
    return
    setTimeout(function () {
        console.info(`Product of the day added to list`)
        $(".productoftheday_menu .slider-wrap").each(function () {
            const slider = $(this)
            slider.css("left", "0px")

            const icons = slider.closest(".productoftheday_menu").find(".slider-nav-left, .slider-nav-right")

            icons.on("click", function (e) {
                e.preventDefault()
                const currentLeft = parseInt(slider.css("left"), 10)
                const newLeft = isNaN(currentLeft) ? 0 : currentLeft + ($(this).hasClass("slider-nav-left") ? 280 : -280)
                slider.css("left", newLeft + "px")
            })

            populateProductBoxFromAPI(slider)
        })
    }, 500)
}

function populateProductBoxFromAPI(innerbox) {
    const productPlaceholder = $(".product-placeholder").prop("outerHTML")

    frontAPI.getPotdProducts((potdProducts) => {
        const { list } = potdProducts

        $.each(list, (index, item) => {
            const {
                id: STOCK_ID,
                main_image: MAIN_IMAGE,
                category: { name: CATEGORY_NAME },
                producer: { name: PRODUCER_NAME },
                url: URL,
                name: NAME,
                price: {
                    gross: { base: PRICE_GROSS_BASE },
                    net: { base: PRICE_NET_BASE },
                },
            } = item

            const readyProduct = replacePlaceholders(productPlaceholder, { STOCK_ID, MAIN_IMAGE, CATEGORY_NAME, PRODUCER_NAME, URL, NAME, PRICE_GROSS_BASE, PRICE_NET_BASE })
            innerbox.append(readyProduct)
        })
    }, {
        lang: templateConfiguration.lang,
        currency: templateConfiguration.currency,
    })
}

function replacePlaceholders(content, data) {
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const placeholder = new RegExp(`POTD_${key}`, "g")
            content = content.replace(placeholder, data[key])
        }
    }
    return content
}

function setupMobileMenu() {
    const variant = templateConfiguration.mobileMenuType
    console.info(`Selected mobile menu type: ${variant}`)

    switch (variant) {
        case "horizontal":
            appendSwipeableMobileMenu();
            $(".fa-align-justify").off();
            $(".fa-align-justify").on("click", function (e) {
                e.preventDefault()
                $(".swipeable-mobile-menu").toggle()
            })
            break;

        case "vertical":
            break;

        default:
            console.warn(`Invalid mobile menu type variant: "${variant}". The variant was not applied.`)
    }
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
        mobileMenu.css('transform', `translateX(${-currentLevel * 100}%)`);
        currentMenu.css("display", "none");
    });

    $(".mobile-menu-item").on("click", function (e) {
        const pixelsFromRight = 30;
        const clickX = e.clientX - $(this).offset().left;

        if (clickX >= ($(this).width() - pixelsFromRight) && $(this).siblings().length > 0) {
            currentLevel++;
            e.preventDefault();
            const nextMenu = $(this).parent().find(">ul");
            nextMenu.css("display", "block");
            mobileMenu.css('transform', `translateX(${-currentLevel * 100}%)`);
        }
    });
}

function createHTMLTree(categories, level, buttonText, h1Text, h1Url) {
    var ul = document.createElement("ul");
    ul.classList.add(`mobile-level-${level}`);

    // Create an h1 element
    var a = document.createElement("a");
    a.classList = "title-menu"
    a.href = h1Url;
    a.textContent = h1Text;

    // Create a button element
    var button = document.createElement("button");
    button.classList = "mobile-menu-back"
    button.textContent = buttonText;

    ul.appendChild(button);
    ul.appendChild(a);

    categories.forEach(category => {
        var li = document.createElement("li");
        var a = document.createElement("a");

        a.href = `/pl/c/${category.name}/${category.id}`;
        a.textContent = category.name;
        a.classList = "mobile-menu-item"

        li.appendChild(a);

        if (category.children.length > 0) {
            var subTree = createHTMLTree(category.children, level + 1, h1Text, category.name, `/pl/c/${category.name}/${category.id}`);
            li.appendChild(subTree);
        }

        ul.appendChild(li);
    });

    return ul;
}

function setupExtraMessages() {
    let currentShownExtraMessageIndex = 0;

    $(".next-message").on("click", function () {
        currentShownExtraMessageIndex = (currentShownExtraMessageIndex + 1) % $(".extra-message").length
        $(".extra-message").css("display", "none").eq(currentShownExtraMessageIndex).css("display", "block")
    })

    $(".prev-message").on("click", function () {
        currentShownExtraMessageIndex = (currentShownExtraMessageIndex - 1 + $(".extra-message").length) % $(".extra-message").length
        $(".extra-message").css("display", "none").eq(currentShownExtraMessageIndex).css("display", "block")
    })

    setInterval(function(){
        currentShownExtraMessageIndex = (currentShownExtraMessageIndex + 1) % $(".extra-message").length
        $(".extra-message").css("display", "none").eq(currentShownExtraMessageIndex).css("display", "block")
    }, templateConfiguration.extraMessageAutoChangeAfter);
}

function setupCombinedOffersAndNewProducts() {
    if (!$("body").hasClass("shop_index")) return;

    const targetContainer = $("<div>", { id: "offers-new-wrapper" })
        .append($("#box_productoftheday"))
        .append($("#box_lastadded"));

    $(".main.row .centercol").prepend(targetContainer);
}

function setupSEOs() {
    setupSEO("#box-seo");
    setupSEO(".shop_product_list .categorydesc.bottom");
}

function setupSEO(seoBoxSelector) {
    const seoInvisibleElements = $(".seo-invisible");
    const seoBox = $(seoBoxSelector);

    if (!seoInvisibleElements.length || !seoBox.length) return;

    const expandButton = $("<button>")
        .attr("id", "expand-button")
        .text(templateConfiguration.translation.expandSEO)
        .click(function () {
            expandButton.hide();
            collapseButton.show();
            seoInvisibleElements.show();
        });

    const collapseButton = $("<button>")
        .attr("id", "collapse-button")
        .text(templateConfiguration.translation.collapseSEO)
        .click(function () {
            collapseButton.hide();
            expandButton.show();
            seoInvisibleElements.hide();
        });

    seoInvisibleElements.first().before(expandButton);
    seoBox.append(collapseButton);
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
        menu.style.zIndex = 25;
    });

    $(basket).on("click", function (e) {
        e.preventDefault()
        siteBasket.style.right = 0;
        background.style.opacity = 1;
        background.style.height = "100%";
        menu.style.zIndex = 0;
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
                        document.querySelector("#box_productdata").style.cssText =
                            "display: block !important";
                        break;
                    case "comments-btn":
                        document
                            .querySelectorAll(".product-modules > div")
                            .forEach((element) => {
                                element.style.cssText = "display: none !important";
                            });
                        document.querySelector("#box_productcomments").style.cssText =
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
        setupCarouselProductPageHandler(4);
    } else if (productFullClassList.includes("carousel")) {
        setupCarouselProductPageHandler(1);
    } else {
        setupCarouselProductPageHandler(2);
    }
}

function setupCarouselProductPageHandler(itemsPerPage) {
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
        currentStartIndex = Math.max(currentStartIndex - 1, 0);
        showLinks(links, currentStartIndex, itemsPerPage);
    });

    $(nextImage).on("click", () => {
        if (currentStartIndex + itemsPerPage <= links.length - 1) {
            currentStartIndex++;
        }
        showLinks(links, currentStartIndex, itemsPerPage);
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

function setIconsOnChildfulMenuItems() {
    const categories = frontAPI.getCategories({ lang: templateConfiguration.lang });
    $.each(categories, function (index, category) {
        if (category.children.length > 0) {
            const categoryContainer = $(`#category_${category.id} > a`);
            if (categoryContainer.length) {
                categoryContainer.addClass("expandable");
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
    const mobileItemsBackground = document.querySelector(".mobile-items-background");
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
        mobileItemsBackground.style.display = "block";
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

        if (mobileItemBackground.css("display") == "block") {
            const htmlBox = document.querySelector("html");
            htmlBox.style.cssText = "overflow-y: hidden !important;";
        } else {
            const htmlBox = document.querySelector("html");
            htmlBox.style.cssText = "overflow-y: scroll !important;";
        }
    });

    mobileFilterMenuBack.on("click", () => {
        mobileItemBackground.toggle();
        $("#box_filter").toggle()

        if (mobileItemBackground.css("display") == "block") {
            const htmlBox = document.querySelector("html");
            htmlBox.style.cssText = "overflow-y: hidden !important;";
        } else {
            const htmlBox = document.querySelector("html");
            htmlBox.style.cssText = "overflow-y: scroll !important;";
        }
    });
}

function initProductHover() {
    if (!templateConfiguration.hoverableProduct) return

    $(".product-inner-wrapper .boximgsize img").each(function () {
        const hoverableProduct = $("<div class='hoverable-product-wrapper'></div>");
        $(this).parent().append(hoverableProduct);
    });

    $(".product-inner-wrapper .boximgsize").on("mouseenter", function () {
        const hoverableContainer = $(this).find(">div");

        if (hoverableContainer.children().length === 0) {
            const id = parseInt($(this).parent().parent().parent().attr("data-product-id"));
            if (!isNaN(id)) {
                const productData = frontAPI.getProduct({ id: id });
                const productSection = $("<section></section>").attr("id", `hoverable-product-${id}`);

                productData.options_configuration.forEach((option) => {
                    const values = option.values;

                    if (values.length > 0) {
                        const optionDiv = $("<div class='hoverable-product-attr-" + option.id + "'></div>").addClass("option");
                        const optionHeader = $("<h3></h3>").text(option.name + ":");
                        optionDiv.append(optionHeader);

                        values.forEach((value) => {
                            const optionParagraph = $("<p class='hoverable-value-" + value.id + "'></p>").text(value.name);
                            optionParagraph.on("click", function (e) {
                                e.preventDefault();
                                e.stopPropagation();
                                $(this).siblings().removeClass("selected");
                                $(this).toggleClass("selected");
                            });

                            optionDiv.append(optionParagraph);
                        });

                        productSection.append(optionDiv);
                    }
                });

                hoverableContainer.append(productSection);
            }
        }

        hoverableContainer.show();
    });

    $(".product-inner-wrapper .boximgsize").on("mouseleave", function () {
        $(this).find(">div").hide();
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

// Function to create a product element
function createProductElement(product) {
    const productElement = document.createElement("div");
    productElement.className = "product product-item row center";

    // Add your HTML structure here, using product data
    productElement.innerHTML = `
      <div class="product-inner-wrapper">
              <a href="${product.url}" title="${product.name}" class="row">
                  <span class="boximgsize row">
                      <img src="/environment/cache/images/300_300_productGfx_${product.main_image}/Mask-Group-25.png" data-src="/environment/cache/images/300_300_productGfx_${product.main_image}/Mask-Group-25.png">
                      <noscript>
                          <img src="/environment/cache/images/300_300_productGfx_${product.main_image}/Mask-Group-25.png" alt="${product.name}">
                      </noscript>
                  </span>
                  <div class="manufacturer row">
                      <span>${product.producer.name}</span>
                  </div>
                  <div class="productnamewrap row">
                      <span class="productname">${product.name}</span>
                  </div>
              </a>
              <div class="price price_extended row">
                  <section>
                      <p>
                          <em>${product.price.gross.base}</em>
                      </p>
                  </section>
                  <span class="hide price-netto">
                      <p>
                          <em>${product.price.net.base}</em>
                      </p>
                  </span>
              </div>
              <a href="${window.location.href}pl/fav/add/${product.stockId}">
              <img class="add-to-fav" src="${templateConfiguration.templatePath}/images/user/add-to-fav.svg">
              </a>
              <form class="basket basket-box " action="/pl/basket/add/post" method="post">
                  <fieldset>
                      <div class="shaded_inputwrap"><input name="quantity" value="1" type="text" class="short center"></div>
                      <span class="unit">szt.</span>
                      <input type="hidden" value="${product.stockId}" name="stock_id">
                      <button class="addtobasket btn btn-red" type="submit">
                      <img src="/libraries/images/1px.gif" alt="" class="px1">
                      </button>
                  </fieldset>
              </form>
          </div>
      </div>
  `;

    return productElement;
}

// Function to render products
function renderProducts() {
    const productsContainer = document.querySelectorAll(".productoftheday_menu .slider-content");
    const products = frontAPI.getPotdProducts().list;

    productsContainer.forEach(productContainer => {
        products.forEach((product) => {
            const productElement = createProductElement(product);
            productContainer.append(productElement);
        });
    })
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
  const containers = document.querySelectorAll('.right.basket');

  containers.forEach((container) => {
    const observer = new MutationObserver(observeProduct);
    const config = { attributes: true, childList: true, subtree: true };
    observer.observe(container, config);
  });
}

function observeProduct(mutationsList, observer) {
  mutationsList.forEach((mutation) => {
    $(".ajax-product-block .btn.left").click(() => document.location.href="/")
  });
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

const createButton = (className, text, clickHandler) => $("<button>", { class: className, text: text, click: clickHandler })
setTimeout(() => $("html").css("height", "100%"), 600);
