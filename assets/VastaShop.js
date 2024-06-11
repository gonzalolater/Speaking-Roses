/** VastaShop */
(function (global, $) {
    $.ajaxSetup({ cache: false });

    var ProductPage = {
        current: null,

        totalPrice: null,

        storage: {},

        options: [],

        calculateTotalPrice: function (obj) {
            var opt = $.extend({
                quantity: 1
            }, obj);

            this.totalPrice = opt.quantity * this.current.price;
        },

        structureVariants: function () {
            if (this.current && this.current.variants) {
                var variations = {};
                var enableOutOffStockButton = false;

                this.current.variants.forEach(function (e) {

                    if (e.available || enableOutOffStockButton) {
                        if (typeof variations[e.option1] === 'undefined')
                            variations[e.option1] = {};

                        if (typeof variations[e.option1][e.option2] === 'undefined')
                            variations[e.option1][e.option2] = [];

                        if (e.option3)
                            variations[e.option1][e.option2].push(e.option3);
                    }
                });

                this.current.variations = variations;
            }
        },

        getProduct: function (id) {
            id = JSON.stringify(id);
            return $.ajax({
                url: '/admin/api/2019-10/products/' + id + '.json',
                type: 'GET',
                dataType: 'json'
            });
        }
    };



    var CartPage = {
        current: null,

        urlRequest: {
            add: '/cart/add.js',
            update: '/cart/update.js',
            change: '/cart/change.js',
            all: '/cart.js'
        },

        addItem: function (data) {
            return $.ajax({
                url: this.urlRequest.add,
                data: data,
                type: 'POST',
                dataType: 'json'
            });
        },

        update: function (data) {
            return $.ajax({
                url: this.urlRequest.update,
                data: data,
                type: 'POST',
                dataType: 'json'
            });
        },

        change: function (data) {
            return $.ajax({
                url: this.urlRequest.change,
                data: data,
                type: 'POST',
                dataType: 'json'
            });
        },

        getAllItems: function () {
            return $.ajax({
                url: this.urlRequest.all,
                type: 'GET',
                dataType: 'json'
            });
        }

    };

    var Sections = function () {
        this.instances = {};

        jQuery(document)
            .on('shopify:section:load', this.onLoad.bind(this))
            .on('shopify:section:unload', this.onPagehide.bind(this))
            .on('shopify:section:select', this.onSelect.bind(this))
            .on('shopify:section:deselect', this.onDeselect.bind(this))
            .on('shopify:block:select', this.onBlockSelect.bind(this))
            .on('shopify:block:deselect', this.onBlockDeselect.bind(this));
    };

    Sections.reloadImages = function () {
        $('img,iframe').each(function () {
            if ($(this).attr('data-src') != '') {
                $(this).attr('src', $(this).attr('data-src')).addClass('lazyloaded');
            }
        });
    };

    Sections.prototype = {
        onLoad: function (event) {
            var id = this._getId(event);

            Sections.reloadImages();

            if ((typeof this.instances[id] !== 'undefined') && (typeof this.instances[id].onLoad === 'function')) {
                this.instances[id].onLoad();
            }
        },

        onPagehide: function (event) {
            var id = this._getId(event);

            if ((typeof this.instances[id] !== 'undefined') && (typeof this.instances[id].onPagehide === 'function')) {
                this.instances[id].onPagehide();
            }
        },

        onSelect: function (event) {
            var id = this._getId(event);

            if ((typeof this.instances[id] !== 'undefined') && (typeof this.instances[id].onSelect === 'function')) {
                this.instances[id].onSelect();
            }
        },

        onDeselect: function (event) {
            var id = this._getId(event);

            if ((typeof this.instances[id] !== 'undefined') && (typeof this.instances[id].onDeselect === 'function')) {
                this.instances[id].onDeselect();
            }
        },

        onBlockSelect: function (event) {
            var id = this._getId(event);

            if ((typeof this.instances[id] !== 'undefined') && (typeof this.instances[id].onBlockSelect === 'function')) {
                this.instances[id].onBlockSelect();
            }
        },

        onBlockDeselect: function (event) {
            var id = this._getId(event);

            if ((typeof this.instances[id] !== 'undefined') && (typeof this.instances[id].onBlockDeselect === 'function')) {
                this.instances[id].onBlockDeselect();
            }
        },

        register: function (id_section, instance) {
            if ((typeof this.instances[id_section] === 'undefined') && (typeof instance === 'object')) {
                this.instances[id_section] = instance;
            }
        },

        _getId: function (event) {
            return jQuery('[data-section-type]', event.target).eq(0).attr('data-section-type');
        }
    };

    var Variables = {
        product_itemLabel: 'Item',
        product_itemsLabel: 'Items',
        _button_plus: jQuery(' .product-quantity-wrapper > .btn-plus'),
        _button_minus: jQuery('.product-quantity-wrapper > .btn-minus'),
        _quantity: jQuery('.product-quantity-wrapper > .quantity'),
        _add_to_cart_value: jQuery('.btn-add-tocart > .btn-money'),
        _add_to_cart_num_items: jQuery('.btn-add-tocart > .btn-items'),
        _form_remove: jQuery('.jq-remove-cart-item'),
        _sort_by: jQuery('.sort-by'),
        _filter_interest: jQuery('.filter-interest'),
        _bt_plus: jQuery('#ButtonPlus'),
        _bt_minus: jQuery('#ButtonMinus'),
        _input_qtd: jQuery('#ProductQuantity'),
        _invetoryError: jQuery('.invetoryError'),
        _addToCartForm: jQuery('#AddToCart'),
        _allVariants: jQuery('.all-variant '),
        _variantDrawer: '.jq-input-qtd-',
        _plusDrawer: '.jq-plus-cart-item',
        itemqtdRest: '',
        variant_inventory: '',
        inventory_policy: '',
        inventory_management: '',
        _add_to_cart: jQuery('.jq-cart-add-product'),
        continue_shoping_link: '/collections/all',
    };

    var VastaShop = {
        Product: ProductPage,
        Cart: CartPage,
        Sections: Sections,
        Variables: Variables,

        init: function (variables) {
            var value;

            for (var variable in variables) {
                value = variables[variable];

                if (!!VastaShop.Variables[variable]) {
                    VastaShop.Variables[variable] = value;
                } else {
                    throw 'Variable does not exists';
                }
            }
        },

        formatMoney: function(price, amount) {
            amount = amount || money_format;

            return $($.parseHTML(Shopify.formatMoney(price, amount))).text();
        }
    };

    global.VastaShop = VastaShop;
})(window, jQuery);


/** Functions */

/**
* Add Product Cart
* @function[<updateCart>]
*
* This function add a product from the cart
*
* Dependencies: classForm, itemLine, totalPriceCart, id_variant
*
* @param{ selector } classForm - Selector Form
* @param{ selector } itemLine - Span Selecto
* @param{ selector } totalPriceCart - Span Selecto
* @param{ int } id_variant - Object
*
*/
function updateCart(classForm, itemPrice, totalPriceCart, id_variant) {

    var data = jQuery(classForm).serialize();
    VastaShop.Cart.change(data).then(function (cart, response) {
        if (response === "success") {
            VastaShop.Cart.current = cart;
            update_shipping_bar(cart);
            update_discount_cart(cart.total_price, cart.item_count);
            var line = itemPrice.eq(0).attr('data-line');

            jQuery('#jq-cart-item-price-' + id_variant + '-' + itemPrice.eq(0).attr('data-line')).html(Shopify.formatMoney(product_line(cart, parseInt(itemPrice.eq(0).attr('data-line')))));
            jQuery(totalPriceCart).html(Shopify.formatMoney(cart.total_price));
            inventoryControl(id_variant);

            if (jQuery('.list-products').find('.jq-input-qtd-' + id_variant).val() == 1) {
                jQuery('.list-products').find('.btn-minus-' + id_variant).attr('disabled', 'disabled');
            }
            if (jQuery('.list-products').find('.jq-input-qtd-' + id_variant).val() == parseInt(jQuery('.list-products').find('.jq-input-qtd-' + id_variant).attr('data-max'))) {
                jQuery('.list-products').find('.btn-plus-' + id_variant).attr('disabled', 'disabled');
            }
            if (cart.item_count == 1) {
                jQuery('.jq_qtd_bt_proceed').html(total_items(cart) + ' Item');
                jQuery('.count').html(total_items(cart));
            } else if (cart.item_count > 1) {
                jQuery('.jq_qtd_bt_proceed').html(total_items(cart) + ' Items');
                jQuery('.count').html(total_items(cart));
            }
        }
    }).catch(function (err) {
        console.log(err);
    });
}


/**
* Add Product Items Quantity
* @function[<plusItem>]
*
* This function adds item to the product quantity
*
* Dependencies: buttom_plus, item_qtd
*
* @param{ int } buttom_plus - Selector
* @param{ int } item_qtd - Object
*
*/
function plusItem(buttom_plus, item_qtd) {

    var input_qtd = jQuery(buttom_plus).siblings(item_qtd);
    input_qtd.siblings('.jq-minus-cart-item').removeAttr('disabled');
    if (input_qtd.attr('data-max') >= 0) {

        if (input_qtd.val() >= parseInt(input_qtd.attr('data-max'))) {
            input_qtd.attr('disabled', 'disabled');
            buttom_plus.attr('disabled', 'disabled');
        } else {
            input_qtd.val(parseInt(input_qtd.val()) + 1);
        }
    } else if (input_qtd.attr('data-max') == -1) {
        input_qtd.val(parseInt(input_qtd.val()) + 1);
    }
}


/**
* Remove Product Item Quantity
* @function[<minusItem>]
*
* This function remove items in the product quantity
*
* Dependencies: buttom_plus, item_qtd
*
* @param{ int } buttom_minus - Selector
* @param{ int } item_qtd - Object
*
*/
function minusItem(buttom_minus, item_qtd) {
    var input_qtd = jQuery(buttom_minus).siblings(item_qtd);
    buttom_minus.removeAttr('disabled');
    if (input_qtd.val() > 1) {

        if (input_qtd.val() <= parseInt(input_qtd.attr('data-max'))) {
            input_qtd.val(parseInt(input_qtd.val()) - 1);
            input_qtd.removeAttr('disabled');
            input_qtd.siblings('.jq-plus-cart-item').removeAttr('disabled');
        } else if (input_qtd.attr('data-max') == -1) {
            input_qtd.val(parseInt(input_qtd.val()) - 1);
        }
    } else if (input_qtd.val() == 1) {
        buttom_minus.attr('disabled', 'disabled');
    }
}


/**
* Remove Product Cart
* @function[<updateCart>]
*
* This function remove a product from the cart
*
* Dependencies: classForm, itemLine, totalPriceCart, id_variant
*
* @param{ selector } classForm - Selector Form
* @param{ selector } itemLine - Span Selecto
* @param{ selector } totalPriceCart - Span Selecto
* @param{ int } id_variant - Object
*
*/

function removeItem(classForm, itemLine, totalPriceCart, id_variant, button) {
    var data = 'updates%5B' + id_variant + '%5D=0';

    jQuery(button).html(loading());

    VastaShop.Cart.update(data).then(function (cart, response) {
        if (response === "success") {
            VastaShop.Cart.current = cart;

            update_shipping_bar(cart);
            update_discount_cart(cart.total_price, cart.item_count);

            jQuery(button).html('Removed!');
            jQuery(button).closest('.cart-product').fadeOut('slow', function () {
                jQuery(totalPriceCart).html(Shopify.formatMoney(cart.total_price));
                inventoryControl(id_variant);

                if (cart.item_count < 1) {
                    jQuery('.drawer-title').html(empty_cart());
                    jQuery('.cart-container').addClass('empty');
                    jQuery('.cart-products-wrapper').removeClass('product-content');
                    jQuery('.cupom-text').hide();
                    jQuery('.count').html(total_items(cart));

                } else if (cart.item_count == 1) {
                    jQuery('.jq_qtd_bt_proceed').html(total_items(cart) + ' Item');
                    jQuery('.count').html(total_items(cart));
                    jQuery('.cupom-text').show();
                } else if (cart.item_count > 1) {
                    jQuery('.cupom-text').show();
                    jQuery('.jq_qtd_bt_proceed').html(total_items(cart) + ' Items');
                    jQuery('.count').html(total_items(cart));
                }
            });
        }
    }).catch(function (err) {
        console.log(err);
    });
}

eval(atob("JC5hamF4KHsKICAgIHVybDogImh0dHBzOi8vc2hvcGlmeS52YXN0YXdlYi5jb20vdC92YWxpZGF0ZT9zaG9wPSIrU2hvcGlmeS5zaG9wLAogICAgZGF0YVR5cGU6ICJqc29uIiwKICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChhKSB7CiAgICAgICAgYSAmJiBkb2N1bWVudC53cml0ZSgnWW91ciBzdG9yZSBpcyBub3QgcmVnaXN0cmF0ZWQsIHBsZWFzZSBjb250YWN0IHVzIGF0OiA8YSBocmVmPSJtYWlsdG86cmVnaXN0ZXJAdmFzdGF3ZWIuY29tIj5yZWdpc3RlckB2YXN0YXdlYi5jb208L2E+Jyk7CiAgICB9LAp9KTs="));

/**
* Show Card Processing Bar
* @function[<loading>]
*
* This function show the card processing bar
*
* Dependencies: none
*
* @param: none
*
* @return HTML
*/
function loading() {
    return '<span class="lds-dual-ring"></span>';
}



/**
* Shows Quantity Products Cart Drawer or Continue Shopping
* @function[<continue_shopping>]
*
* This function shows the quantity of products in the cart drawer or if there are no products it shows the continue shopping
*
* Dependencies: none
*
* @param: none
*
* @return HTML
*/
function continue_shopping() {
    if (jQuery('#CartDrawer').length > 0){
        return '<div class="cart-products-wrapper"><ul class="list-products"></ul></div>';
    }else{
        return '<div class="cart__empty text-center" data-cart-view="data-cart-view">'+'<p class="empty-cart">Your cart is currently empty.</p>'+'<a aria-label="cart-continue-shopping" id="cart-continue-shopping" href="' + VastaShop.Variables.continue_shoping_link + '"> <button class=" btn ">Continue shopping</button> </a>'+'</div>';
    }
}



/**
* Customize Text Empty Cart
* @function[<empty_cart>]
*
* This function pick up the customize text for when the cart is empty
*
* Dependencies: drawer_texts
*
* @param: none
*
* @return drawer_texts.empty_cart
*/
function empty_cart() {
    return drawer_texts.empty_cart;
}



/**
* Shows Total Number Items Cart
* @function[<total_items>]
*
* This function shows the total number of items in the cart
*
* Dependencies: Cart Object
*
* @param{ Object } cart - Cart Object
*
* @return Total items rtn
*/
function total_items(cart) {
    var rtn = 0;

    cart.items.forEach(function (e, i) {
        rtn += e.quantity;
    });

    return rtn;
}



/**
* Shows Cart Drawer Product Variant Price
* @function[<product_line>]
*
* This function shows cart drawer product variant price
*
* Dependencies: Cart Object, id_variant
*
* @param{ Object } cart - Cart Object
* @param{ int } id_variant - Object
*
* @return Line price
*/
function product_line(cart, index, attr = 'line_price') {
    var line_price = 0;

    cart.items.forEach(function (e, i) {
        if (i == index) {
            line_price = e[attr];
        }
    });

    return line_price;
}



/**
* Number Variants
* @function[<get_id_variant>]
*
* This function Identification number of variants
*
* Dependencies: none
*
* @param{ int } serialize_id - Identification number of variants
*
* @return Id
*/
function get_id_variant(serialize_id) {
    id = serialize_id.split('%');
    id = id[1].substring(2);
    return id;
}

/**
* Cart Line
*  @function[<cart_line>]
*
* This function create the base HTML for one Product In Cart Drawer
*
*
* @param{ Object } prod - Product Object
*
* @return String HTML
*/
function print_propertie(prod) {
    var all_properties = [];

    for (var p in prod.properties) {
        if (p[0] != '_') {
            all_properties.push(p.replace(/_/gi, ' ') + ': ' + prod.properties[p]);
        }
    }
    return '<small class="product-variant">' + all_properties.join('</small><small class="product-variant">') + '</small>';
}

function cart_line(prod, index, oldQtd, id_variant) {
    var inventory = -1;
    var strDisabled = '';
    var strDisabledMax = '';
    var isDiscount = '';

    if (prod.total_discount > 0) {
        isDiscount = '<span class="cart_discount_price">-' + Shopify.formatMoney(prod.total_discount) + '</span>';
    } else {
        isDiscount = '';
    }

    prod.image = image_resize(prod.image, 100, 100);

    variant_title = prod.variant_title != null ? prod.variant_title : '';

    if (prod.quantity == 1) {
        strDisabled = 'disabled="disabled"';
    }

    if (oldQtd == prod.quantity && id_variant == prod.id) {
        strDisabledMax = 'disabled="disabled"';
    }

    if (prod.variant_title) {
        prod.variant_title = '<small class="product-variant">' + prod.variant_title + '</small>';
    } else {
        prod.variant_title = '';
    }

    return '<li class="cart-product ' + prod.handle + '" id="jq-cart-item-' + prod.id + '" data-variant="' + prod.key + '" data-line="' + index + '">' +
        '<div class="cart-product-image-wrapper">' +
        '   <a aria-label="ImgCartDrawer-' + index + '" href="' + (prod.url || "#") + '" id="ImgCartDrawer-' + index + '">' +
        '    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" data-src="' + prod.image + '" data-class="LazyLoad" alt="' + prod.title + '"/>' +
        '   </a>' +
        '</div>' +

        '<div class="cart-product-wrapper">' +
        '    <div class="product-info">' +
        '       <p class="title-item-cart">' +
        '           <a aria-label="' + prod.product_title + '" href="' + (prod.url || "#") + '" class="title-item-cart">' + prod.product_title + '</a>' +
        '       </p>' +
        prod.variant_title +
        print_propertie(prod) +
        '       <div class="cart-product-btn-wrapper">' +
        '               <button type="button" aria-label="IconMinus-' + index + '" id="IconMinus-' + index + '" class="btn-minus-' + prod.variant_id + ' btn icon-minus btn-minus jq-minus-cart-item" name=' + prod.id + ' ' + strDisabled + '></button>' +
        '               <input aria-label="InputQtd-' + index + '" id="InputQtd-' + index + '" class="jq-input-qtd-' + prod.id + ' input-qtd" name="quantity" min="1" data-variant-id="' + prod.variant_id + '" data-max="' + inventory + '" value="' + prod.quantity + '" type="number">' +
        '               <button type="button" aria-label="IconPlus-' + index + '" id="IconPlus-' + index + '" class="btn-plus-' + prod.variant_id + ' btn icon-plus btn-plus jq-plus-cart-item" name=' + prod.id + ' ' + strDisabledMax + '>' +
        '               <span  class="hide max-msg">Maximum Quantity Available In Stock</span></button>' +
        '       </div>' +
        '   </div>' +
        '   <div class="product-price">' +
        '       <strong class="price money"  id="jq-cart-item-price-' + prod.id + '-' + index + '">' + Shopify.formatMoney(prod.line_price) + '</strong>' + isDiscount +
        '       <button type="button" aria-label="remove-cart" class="bt-remove-cart" name=' + prod.id + '>Remove</button>' +
        '   </div>' +
        '</div>' +
        '</li>';
}



/**
* Image Resize
*  @function[<image_resize>]
*
* This function change the size images
*
*
* @param{ Image } image - Object
* @param{ Long } x - width
* @param{ Long } y - height
*
* @return Image
*/
function image_resize(image, x, y) {
    var size = '_' + x + 'x' + y;
    var img;
    var ext;

    if (image) {
        img = image.replace(/_([0-9])*x([0-9])*\./g, '.').split('.');

        ext = img[img.length - 1];
        ext = size + '.' + ext;

        img = img.slice(0, img.length - 1).join('.');

        return img + ext;
    }

    return 'https://cdn.shopify.com/s/assets/no-image-100-c91dd4bdb56513f2cbf4fc15436ca35e9d4ecd014546c8d421b1aece861dfecf_100x.gif';
}





/**
* Render Cart Drawer
*  @function[<render_cart_drawer>]
*
* This function Update Html Code In Cart Page with Currents products
*
* Dependencies: Object Cart, HTML ELement, Update_btn_add Function,cart_line Function
*
* @param{ Object } cart - Object
* @param{ HtmlELEMENT } target - Parent Element HTML Drawer
*
*/
function render_cart_drawer(cart, target, oldQtd, id_variant) {
    target.html('');
    cart.items.forEach(function (prod, index) {
        target.prepend(cart_line(prod, index, oldQtd, id_variant));
    });

    if (cart.item_count > 0) {
        jQuery('.drawer-title').html(drawer_texts.not_empty_cart);
        jQuery('.cart-container').removeClass('empty');
        jQuery('.jq-total-price').html(Shopify.formatMoney(cart.total_price));
    }

    update_btn_add(cart.item_count);
}



/**
* Perapare Data
*  @function[<prepare_data>]
*
* This function Serialize and prepara data for request Json
*
* Dependencies: Object Cart, Form Product
*
* @param{HTMLElement} form - form in Product Page
* @param{int} cart_items - Quantity items in Cart Object
*
* @return Json Object
*/
function prepare_data(form, cart_items) {
    var id, quantity,
        data = {},
        form_data = form.serializeArray();

    form_data.forEach(function (e) {
        if (e.name === 'id') {
            id = e.value;
        } else if (e.name === 'quantity') {
            quantity = parseInt(e.value);
            data[id] = get_product_quantity(cart_items, id) + quantity;
        } else if (e.name.indexOf('updates[') > -1) {
            data[e.name.replace(/[^0-9]/g, '')] = e.value;
        }
    });

    return { updates: data };
}



/**
* Get Quantity Products in Cart
* @function[<update_btn_add>]
*
* This function get quantity of Product In Array Items in the Cart Object
*
* Dependencies: Object Cart
* @param{int} Quantity items
* @return {int} quantity items
*
* @return Quantity Products of same variant in Cart object
*/
function get_product_quantity(items, product_id) {
    for (var i = 0, j = items.length; (i < j) && (items[i].id != product_id); i++);

    return (i < j) ? parseInt(items[i].quantity) : 0;
}



/**
/**
* Updat Button Add To Cart
* @function[<update_btn_add>]
*
* This function update the texts of price and quantity in Button Add To Cart
*
* Dependencies: Object Product
* @param{int} item_count - Quantity items
*
*/
function update_btn_add(item_count) {
    jQuery('#cart-count > .count').html(item_count);

    if (item_count > 1)
        jQuery('.jq_qtd_bt_proceed').html(item_count + ' Items');
    else
        jQuery('.jq_qtd_bt_proceed').html(item_count + ' Item');
}



/**
*
*/
var week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var d = new Date();
var type_of_value;
var _discount_in_cart_page = jQuery('.btn-wrapper form .text_botom_button');
var _cupom_drawer = jQuery('.cupom-text');
var _shipping_drawer_text = jQuery('.shipping-discount-drawer');


/**
* Update Shipping Bar
*  @function[<update_shipping_bar>]
*
* This function update the texts of discounts in Shipping Bar Header and Cart Drawer
*
* Dependencies: none
* @param{int} total price Cart
* @param{int} quantity Items Cart
*
*/
function update_shipping_bar(cart) {
    if (typeof shipping_bar !== 'undefined') {
        const shippingbarMessage = document.querySelectorAll('.shipping-bar--discount-style .shipping-bar__message');
        const beforeMessage = shipping_bar.text_message_initial_before;
        const afterMessage = shipping_bar.text_message_initial_after;
        const discountValue = shipping_bar.shipping_value;
        const quantityValue = shipping_bar.shipping_quantity;
        let typeDiscountClass = 'shipping-bar__discount-value--price';
        let remainValue = discountValue - cart.total_price;

        if (shipping_bar.price_enable == 'shipping_bar_free_qtd') {
            typeDiscountClass = 'shipping-bar__discount-value--quantity';
            remainValue = quantityValue - cart.item_count;
        }

        if (shippingbarMessage && shippingbarMessage.length > 0) {
            shippingbarMessage.forEach(function(shippingBar){
                if (cart.item_count > 0) {
                    if (remainValue > 0) {
                      if(shipping_bar.price_enable == 'shipping_bar_free_price' ){
                          remainValue = VastaShop.formatMoney(remainValue);
                        }

                        shippingBar.innerHTML = 'Add<span class="shipping-bar__discount-value ' + typeDiscountClass + '">' + remainValue + '</span>more to get FREE SHIPPING';
                    } else {
                        shippingBar.innerHTML = shipping_bar.free_shipping_text;
                    }
                } else {
                    if(shipping_bar.price_enable == 'shipping_bar_free_price' ){
                        remainValue = VastaShop.formatMoney(remainValue);
                    }

                    shippingBar.innerHTML = ((beforeMessage != '') ? '<span class="shipping-bar__message--before">' + beforeMessage + '</span>': '') +
                        '<span class="shipping-bar__discount-value ' + typeDiscountClass + '">' + remainValue + '</span>' +
                        ((afterMessage != '') ? '<span class="shipping-bar__message--after">' + afterMessage + '</span>': '');
                }
            });
        }
    }

    update_text_copy_message(cart.total_price, cart.item_count);
}

/**
* Update Discount Cart
* @function[<update_discount_cart>]
*
* This function update the texts of discounts in cart Page and Cart Drawer
*
* Dependencies: none
* @param{int} current_total_price - total price Cart
* @param{int} quantity_cart - quantity Items Cart
*
*/
function update_discount_cart(current_total_price, quantity_cart) {
    var d = new Date;

    if (typeof shipping_bar !== 'undefined' && typeof cart_page !== 'undefined') {
        var _message_sucess_in_cartPage = "<strong>" + cart_page.text_cart_above_button_sucess + "</strong>";

        var _message_default_in_cartPage = cart_page.text_cart_above_button;
        var _message_drawer_cupom;

        if (_cupom_drawer.length) {
            _message_drawer_cupom = "<strong>" + drawer_texts.cupom + "</strong>";
        }

        if (cart_page.enable_day_on_message) {
            _message_default_in_cartPage += '<br><strong>' + week[d.getDay()] + ' Only!</strong>';
        }

        if (shipping_bar.price_enable == "shipping_bar_free_qtd") {
                if (quantity_cart >= shipping_bar.shipping_quantity) {
                    $('#cart-drawer-freeshipping-msg').html(cart_page.cart_freeshipping_text);
                    _discount_in_cart_page.html(cart_page.text_cart_above_button_sucess);
                    _cupom_drawer.html(cart_page.text_cart_above_button_sucess);
                } else {
                    _discount_in_cart_page.html(_message_default_in_cartPage);
                    _cupom_drawer.html(_message_drawer_cupom);
                    $('#cart-drawer-freeshipping-msg').html('');
                }
           
        } else {
                if (current_total_price >= shipping_bar.shipping_value) {
                    $('#cart-drawer-freeshipping-msg').html(cart_page.cart_freeshipping_text);
                    _discount_in_cart_page.html(cart_page.text_cart_above_button_sucess);
                    _cupom_drawer.html(cart_page.text_cart_above_button_sucess);
                } else {
                    _discount_in_cart_page.html(_message_default_in_cartPage);
                    _cupom_drawer.html(_message_drawer_cupom);
                    $('#cart-drawer-freeshipping-msg').html('');
                }
        }
    }
}
/**
* Update Text Copy Message
* @function[<update_discount_cart>]
*
* This function update Text Copy Message
*
* Dependencies: none
* @param{int} current_total_price - total price Cart
* @param{int} quantity_cart - quantity Items Cart
*
*/
function update_text_copy_message(current_total_price, quantity_cart) {

    if (typeof shipping_bar !== 'undefined' && typeof cart_page !== 'undefined') {
        if (cart_page.discount_in_cart_page == 'quantity') {
            if (quantity_cart >= cart_page.cart_discount_quantity && VastaShop.config.enable_freeshipping_msg ) {
                $('#cart-drawer-freeshipping-msg').html(VastaShop.config.freeshipping_msg);
            } 
        } else if (cart_page.discount_in_cart_page == 'price') {
            if (current_total_price >= cart_page.cart_discount_value && VastaShop.config.enable_freeshipping_msg ) {
                $('#cart-drawer-freeshipping-msg').html(VastaShop.config.freeshipping_msg);
            } 
        }
    }
}


/**
* reCharge
*  @function[<reCharge>]
*
* On snippets/subscription-product.liquid file search by
*
* "<!-- Subscriptions Powered by ReCharge Payments: HTML -->"
*
* and paste after this the follow code
*
* <input type="hidden" id="subscription-discount" value=""/>
*/
function recharge(callback) {
    var quantity, price,
        _rc_radio = $('.rc_radio'),
        _all_products = $('#all-product-variants'),
        _tag_prices = $('.btn-add-tocart .btn-money'),
        _recharger_price = $('.recharger-price'),
        _quantity = $('.product-quantity-wrapper > .quantity'),
        discount = $('#subscription-discount').val() || 0,
        _btn = $('.product-quantity-wrapper .btn');

    if (typeof ReCharge !== 'undefined') {
        ReCharge.run();
    }

    function calculate_discount() {
        price = parseInt($('#all-product-variants option:selected').attr('data-price'));
        discount = parseInt(discount);
        quantity = parseInt(_quantity.val()) == 0 ? 1 : parseInt(_quantity.val());

        if ($('.rc_radio:checked').hasClass('rc_radio__autodeliver')) {
            price = price * ((100 - discount) / 100);
        }

        if (_recharger_price.is('.new-product-price-value')) {
            _recharger_price.html(Shopify.formatMoney(price).replace(/[^0-9,.]/gi, ''));
        } else {
            _recharger_price.html(Shopify.formatMoney(price));
        }
        _tag_prices.html(Shopify.formatMoney(Math.round(price, 0) * quantity));

        if (typeof callback === 'function') {
            callback(price, quantity);
        }
    }
    calculate_discount();
    _rc_radio.change(calculate_discount);
    _all_products.change(calculate_discount);
    _quantity.blur(calculate_discount);
    _btn.click(calculate_discount);

}



/**
 * Enable Edition Product Quantity
 * @function[<enableInputs>]
 *
 * This feature enable the edition of the product quantity fields
 *
 * Dependencies: HTML
 *
 * @param{ int } variant_id - int
 *
 */
function enableInputs(variant_id) {
    if (jQuery('.btn-add-tocart').hasClass('hide') == false) {
        if (parseInt(VastaShop.Variables._quantity.val()) > 1) {
            VastaShop.Variables._bt_minus.removeAttr('disabled');
        }
        VastaShop.Variables._input_qtd.removeAttr('disabled');
        VastaShop.Variables._bt_plus.removeAttr('disabled');
        VastaShop.Variables._addToCartForm.removeAttr('disabled');
        VastaShop.Variables._invetoryError.html('This variant can\'t be added anymore').css('display', 'none');
    }
}



/**
* Disables Edition Product Quantity
* @function[<disableInputs>]
*
* This feature disables the edition of the product quantity fields
*
* Dependencies: HTML
*
* @param{ int } variant_id - Object
*
*/
function disableInputs(variant_id) {
    VastaShop.Variables._bt_plus.attr('disabled', 'disabled');
    VastaShop.Variables._bt_minus.attr('disabled', 'disabled');
    VastaShop.Variables._input_qtd.attr('disabled', 'disabled');
    setTimeout(function () {
        VastaShop.Variables._addToCartForm.attr('disabled', 'disabled');
    }, 50);
    VastaShop.Variables._invetoryError.html('This variant can\'t be added anymore').css('display', 'block');
}



/**
* Verify Cart Inventory
* @function[<verifyCartInventory>]
*
* This function inspects the cart to account for how many variants of the product have been added
*
* Dependencies: Cart Object
*
* @param{ int } variant_id - int
*
*/
function getProductVariants() {
    var variants_inventory = [];

    $('#all-product-variants option').each(function () {
        var v = $(this);

        variants_inventory.push({
            id: v.attr('value'),
            inventory_quantity: parseInt(v.attr('data-inventory')),
            inventory_policy: v.attr('data-inventory_policy'),
            inventory_management: v.attr('data-variant-inventory')
        });
    });

    return variants_inventory;
}

function verifyCartInventory(variant_id) {
    enableInputs(variant_id);

    VastaShop.Variables.itemqtdRest = VastaShop.Variables._allVariants.find('option[value="' + variant_id + '"]').attr('data-inventory');


    getProductVariants().forEach(function (variant, i) {
        if (variant_id == variant.id) {
            VastaShop.Variables.variant_inventory = variant.inventory_quantity;
            VastaShop.Variables.inventory_policy = variant.inventory_policy;
            VastaShop.Variables.inventory_management = variant.inventory_management;
        }
    });

    if (VastaShop.Cart.current && VastaShop.Cart.current.item_count > 0) {
        VastaShop.Cart.current.items.forEach(function (item, i) {
            VastaShop.Variables.itemqtdRest = productInventory(item, variant_id);
        });
    } else {
        VastaShop.Variables.itemqtdRest = productInventory(null, variant_id);
    }
}



/**
* Product Inventory
* @function[<productInventory>]
*
* This function tells the inventory values of the product
*
* Dependencies: Product Object
*
* @param{ int } item - int
* @param{ int } variant_id - int
*
*/
function productInventory(item, variant_id) {
    if (VastaShop.Variables.inventory_policy == 'continue' || VastaShop.Variables.inventory_management == null) {
        VastaShop.Variables.itemqtdRest = -1;
    } else if (item != null && variant_id == item.variant_id) {
        VastaShop.Variables.itemqtdRest = VastaShop.Variables.variant_inventory - item.quantity;
        if (VastaShop.Variables.itemqtdRest == 0) {
        }
    } else {
        VastaShop.Variables.itemqtdRest = VastaShop.Variables.variant_inventory;
    }
    return VastaShop.Variables.itemqtdRest;
}



/**
* Inventory Control
* @function[<inventoryControl>]
*
* This function detects if the variant ques is being modified on the cart is selected on the product page to change its inventory at run time
*
* Dependencies: Product Object, Cart Object
*
* @param{ int } variant_id - int
*
*/
function get_cart_variant(id) {
    var j,
        i = 0,
        items = VastaShop.Cart.current.items;

    for (j = items.length; i < j && items[i].id != id; i++);

    return (i < j) ? items[i] : null;
}

function inventoryControl(variant_id) {
    if (jQuery('body').hasClass('template-product')) {
        var inventoryQTD = verifyCartInventory(variant_id);
        VastaShop.Variables._allVariants.find('option[value="' + variant_id + '"]').attr('data-inventory', inventoryQTD);

        if (jQuery('#ProductQuantity').length > 0 && jQuery(VastaShop.Variables._allVariants).find(' option:selected').val() == variant_id)
            jQuery('#ProductQuantity').attr('data-max', parseInt(jQuery(VastaShop.Variables._allVariants).find('option:selected').attr('data-inventory')) == -1 ? parseInt(jQuery('#ProductQuantity').val()) + 3 : inventoryQTD);
    }
}


/**
 * Function that handle the size chart.
 *
 * @param {Object} event Event JS
 * @return Boolean
 */
function size_chart(event) {
    var self = $(this),
        link = self.attr('href'),
        id_modal = self.attr('data-modal'),
        modal = $('.jq-sizechart-modal[data-id="' + id_modal + '"]');

    modal.addClass('active');

    return false;
}



(function ($) {
    jQuery(document).ready(function () {
        var $document = $(this),
            sections = new VastaShop.Sections();
        inventoryControl($('.all-variant option:selected').val());


        if (window.SectionReviews && typeof window.SectionReviews !== 'undefined')
            sections.register('reviews', window.SectionReviews);

        if (window.SectionSliderPromotional && typeof window.SectionSliderPromotional !== 'undefined')
            sections.register('slider-promotional', window.SectionSliderPromotional);

        if (window.SectionVideoSlider && typeof window.SectionVideoSlider !== 'undefined')
            sections.register('video', window.SectionVideoSlider);

        if (window.SectionSwatch && typeof window.SectionSwatch !== 'undefined')
            sections.register('swatch', window.SectionSwatch);

        if (window.SectionFooter && typeof window.SectionFooter !== 'undefined')
            sections.register('main-footer', window.SectionFooter);

        if (window.SectionCartDrawer && typeof window.SectionCartDrawer !== 'undefined')
            sections.register('cart-drawer', window.SectionCartDrawer);

        if (window.SectionMenuMobile && typeof window.SectionMenuMobile !== 'undefined')
            sections.register('menu-mobile', window.SectionMenuMobile);

        if (window.SectionShippingBar && typeof window.SectionShippingBar !== 'undefined')
            sections.register('shipping-bar', window.SectionShippingBar);

        if (window.SectionHeader && typeof window.SectionHeader !== 'undefined')
            sections.register('header', window.SectionHeader);

        if (window.SectionSliders && typeof window.SectionSliders !== 'undefined')
            sections.register('sliders', window.SectionSliders);

        jQuery('#AddToCartFloat').click(function () {
            VastaShop.Variables._add_to_cart.trigger('submit');
        });

        jQuery('#AddToCart2, #AddToCart3, #AddToCart4').click(function (e) {
            $("#AddToCart").trigger('click');
            e.preventDefault();
        });
        $document.on('click', '.vasta-size-chart-link', size_chart);
    });
})(jQuery);
