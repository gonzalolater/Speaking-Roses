/**
 * Swatch component
 * 
 * This component define the a plugin for swatch o product page.
 * 
 * Options:
 * 
 * container          Container ID of swatch
 * productHandle:     Product Handle
 * onInit:            Method for run when the swatch is completly loaded.
 * onOptionChange:    Method for run when some option its selected.
 * onVariantChange:   Method for run when some variant its selected.
 */
const VastaSwatch = (function(opt) {
  function VastaSwatch(opt) {
    const settings = Object.assign({
      container: '',
      productHandle: '',
      onInit: function() {},
      onOptionChange: function() {},
      onVariantChange: function() {},
      enableOutOfStockButton: true
    }, opt);

    if (/\/products\//.test(settings.url)) {
      throw new Error('This handle is invalid.');
    }
    
    let container = settings.container !== '' ? document.getElementById(settings.container): 'body';

    $.getJSON(settings.productHandle + '.js').then(function(product) {
      const $quantity = $('.product-quantity-wrapper > .quantity', container);
      const $productOptions = $('.jq-swatch-element,.jq-product-variant', container);
      const $addToCartPrice = $('.btn-add-tocart > .btn-money', container);
      const $addToCartItems = $('.btn-add-tocart > .btn-items', container);
      const $currentPrice = $('.product-price .current-price', container);
      const $currentComparePrice = $('.product-price .compare-price, .new-price-discounts-wrapper .compare-price', container);
      const $newCurrentPrice = $('.new-product-price .jq-new-price', container);
      const $newCurrentComparePrice = $('.new-product-price .jq-new-compare-price', container);
      const $choosedVariant = $('.all-variant', container);

      const variations = product.variants.reduce(function(variations, variant) {
        if (variant.available == false && settings.enableOutOfStockButton == false) {
          return variations;
        } 

        if (typeof variations[variant.option1] === 'undefined') {
          variations[variant.option1] = {};
        }

        if (typeof variations[variant.option1][variant.option2] === 'undefined') {
          variations[variant.option1][variant.option2] = [];
        }

        if (variant.option3) {
          variations[variant.option1][variant.option2].push(variant.option3);
        }

        return variations
      }, {});

      /**
       * Method for prepare an array that contains the variants value.
       * 
       * @param {Object} variants
       * @return {Array}
       */
      function prepare_variants(variants) {
        return $.map(variants, function(el) {
          return el.value;
        });
      }

      /**
       * Method for get the variation based on selected options.
       * 
       * @param {Object} allVariants 
       * @param {Array} options 
       */
      function getVariation(allVariants, options) {
        const $allVariants = $(allVariants);
        const selectedOptions = options.join(',').replace(/"/g, '\\"').replace(/'/g, "\\'");
        const $variations = $allVariants.find('option[data-options="' + selectedOptions + '"]');
        if ($variations.length > 0) {
          $allVariants.val($variations.val()).trigger('change');
        }
      }

      /**
       * Method for to filter the variants.
       * 
       * @param {Array} options 
       * @param {Number} currentOptionIndex 
       * @param {Number} swatchIndex 
       * @param {Boolean} enabledATC 
       */
      function filterVariants(options, currentOptionIndex, swatchIndex, enabledATC) {
        const $swatchType = $('.swatch-type[data-index="' + (swatchIndex + 1) + '"]', container);
        if (typeof variations[currentOptionIndex] !== 'undefined') {
          changeSwatchVariants($swatchType, Object.keys(variations[currentOptionIndex]), enabledATC);
        } else if (typeof variations[options[0]] !== 'undefined' && typeof variations[options[0]][currentOptionIndex] !== 'undefined') {
          changeSwatchVariants($swatchType, variations[options[0]][currentOptionIndex], enabledATC);
        }
      }

      /**
       * Method for update the selects after choose any swatch option based
       * by select HTML element.
       * 
       * @param {Object} $swatch
       */
      function updateSwatchAsSelect($swatch, variants, enabledATC) {
        const $swatchAsSelect = $swatch.find('.product-variant option');
        $swatchAsSelect.prop({
          disabled: true,
          checked: false
        }).each(function() {
          if (variants.indexOf(this.value) > -1) {
            $(this).prop('disabled', false);
          }
        });
        const firstSelectedValue = $swatchAsSelect.filter(':not(:disabled):first').val();
        if (enabledATC) {
          $swatchAsSelect.parent().val(firstSelectedValue).trigger('change');
        }
      }

      /**
       * Method for update the selects after choose any swatch option based
       * by input HTML element.
       * 
       * @param {Object} $swatch
       */
      function updateSwatchAsInput($swatch, variants, enabledATC) {
        const $swatchAsInput = $swatch.find('.swatch-variant-value');

        $swatchAsInput.parent().addClass('swatch-disabled');
        $swatchAsInput.prop({
          disabled: true,
          checked: false
        }).each(function(i) {
          if (variants.indexOf(this.value) > -1) {
            $(this).prop('disabled', false);
            $(this).parent().removeClass('swatch-disabled');
          }
        });

        if (enabledATC) {
          $swatchAsInput.filter(':not(:disabled):first').trigger('click');
        }
      }

      /**
       * Method for to manipulate the selected options.
       * 
       * @param {Object} $swatch 
       * @param {Array} variants 
       * @param {Boolean} enabledATC 
       */
      function changeSwatchVariants($swatch, variants, enabledATC) {
        $('.product-variant', $swatch).prop('disabled', false);
        updateSwatchAsSelect($swatch, variants, enabledATC);
        updateSwatchAsInput($swatch, variants, enabledATC);
        $swatch.prev().find('.choose-option').removeClass('choose-option');
      }

      /**
       * Method for perform the choose option before option.
       * 
       * @param {Number} i 
       */
      function chooseBeforeOption(i) {
        $('.swatch-type[data-index="' + i + '"] .swatch-element', container).on('click', function() {
          var checkedSwatchOptions = $('.swatch-type[data-index="' + (i - 1) + '"] input:checked', container).length;
          var selectedSwatchOptions = typeof $('.swatch-type[data-index="' + (i - 1) + '"] select', container).val() !== 'undefined' && $('.swatch-type[data-index="' + (i - 1) + '"] select').val() !== '';
          $('.swatch-type.swatch-elements-wrapper', container).removeClass('choose-option');
          if (checkedSwatchOptions === 0 && selectedSwatchOptions === false) {
            $('.swatch-type[data-index="' + (i - 1) + '"] .swatch-elements-wrapper', container).addClass('choose-option');
          }
        });
      }

      /**
       * Method for to computed the you save value.
       * 
       * @param {Number} compareAtPrice 
       * @param {Number} price 
       * @param {Number} decimalsTotal 
       */
      function computeYouSave(compareAtPrice, price, decimalsTotal = 2) {
        const $youSave = $('.you-save-price', container);
        const value = (1 - (price / compareAtPrice)) * 100;

        if (compareAtPrice > price) {
          $('.compare_percent', container).html(" (" + value.toFixed(decimalsTotal) + "%)");

          $('.you-save-price .money', container).html(Shopify.formatMoney(compareAtPrice - price));
          $youSave.fadeIn(function() {
            $youSave.show();
          });
        } else {
          $youSave.fadeOut(function() {
            $youSave.hide();
          });
        }
      }

      /**
       * Method for listining the change event on change any product option.
       */
      $productOptions.change(function(event) {
        const $self = $(this);
        const selectedOptions = $('.jq-product-variant option:selected,.swatch-variant-value:checked', container);
        const options = prepare_variants(selectedOptions);
        const enabledATC = options.length == product.options.length;
        const swatchIndex = parseInt($self.attr('data-swatch-index'));
        const $quantity = $('[name="quantity"]', container);
        const $buttonMinus = $('.btn--minus', container);
        
        event.preventDefault();

        getVariation($choosedVariant, options);
        $self.parent().removeClass('choose-option');

        if (options.length === product.options.length) {
          $('.btn-add-tocart', container).prop('disabled', false);
          $('.btn.btn-wishlist', container).prop('disabled', false);
          $('.product-form-buttons-wrapper,.btn-add-tocart', container).removeClass('hide');
          $('.btn-choose-variant', container).addClass('hide');
          
          enableInputs($('.all-variant option:selected', container).val());
          
          if (parseInt($quantity.val()) == 1) {
            $buttonMinus.attr('disabled', 'disabled');
          }

          if (typeof settings.onOptionChange === 'function') {
            settings.onOptionChange($self.val(), swatchIndex, enabledATC);
          }
        }
      });

      /**
       * Method for listening the change event on change any variant.
       */
      $choosedVariant.change(function(event) {
        try {
          const $priceunit = $('.price-per-unit-edits', container);
          const $quantity = $('.product-quantity-wrapper > .quantity', container)
          const variantID = $(this).val();
          const variantInventory = parseInt($(':selected', this).attr('data-inventory') || -1);
          const selectEl = document.querySelector('select.product-variant');
          const pplrImpresion = document.querySelector('.pplr-text');

          const variant = product.variants.find(function(v) {
            return v.id == variantID;
          });

          if (!variant) {
            throw new Error('Variant does not exist.');
          }

          if(selectEl.value == 'Create your own (+ $19.99)') {
            $(pplrImpresion).show();
          }
          else {
            $(pplrImpresion).hide();
          }

          event.preventDefault();

          $('.add-to-cart--error', container).addClass('hide');
          $priceunit.hide();
          $priceunit.filter('[data-variant = "' + variantID + '"]').show();
          $quantity.val(1);

          /**
           * Update the ancient layout for prices.
           */
          $currentPrice.html(Shopify.formatMoney(variant.price));
          
          if (variant.compare_at_price > variant.price) {
            $currentComparePrice.html(Shopify.formatMoney(variant.compare_at_price)).show();
          } else {
            $currentComparePrice.empty().hide();
          }

          /**
           * Update the new layout for prices.
           */
          // $newCurrentPrice.html(Shopify.formatMoney(variant.price).replace(/[^0-9,.]/gi, ''));
          
          if (variant.compare_at_price > variant.price) {
            $newCurrentComparePrice.html(Shopify.formatMoney(variant.compare_at_price)).show();
          } else {
            $newCurrentComparePrice.empty().hide();
          }
          
          const quantity = parseInt($quantity.val());
          
          $addToCartPrice.html(Shopify.formatMoney(quantity * variant.price));
          $quantity.attr('data-max', variantInventory);
          
          if (typeof inventoryControl === 'function') {
            inventoryControl(variantID);
          }

          if (typeof enableInputs === 'function') {
            enableInputs(variantID);
          }

          computeYouSave(variant.compare_at_price, variant.price);
          if (quantity > 1) {
            $quantity.siblings('.btn-minus').attr('disabled', false);
            $($addToCartItems).html(quantity + " ITEMS")
          } else {
            $quantity.siblings('.btn-minus').attr('disabled', true);
            $($addToCartItems).html(quantity + " ITEM")
          }
          
          if (variant.available === true) {
            $('.product-quantity,#AddToCart2', container).show();
            $('.product-quantity,#AddToCart', container).show();
            $('#button-out-of-stock', container).hide();
            $('#button-out-of-stock-2', container).hide();
            $('#tabs-button-out-of-stock', container).hide();
            $('.btn-wishlist.out-of-stock').hide()
          } else {
            $('.product-quantity,#AddToCart2', container).hide();
            $('.product-quantity,#AddToCart', container).hide();
            $('#button-out-of-stock', container).show();
            $('#button-out-of-stock-2', container).show();
            $('#tabs-button-out-of-stock', container).show();
            $('.btn-wishlist.out-of-stock').css('display', 'block');
          }
          Shopify.replaceState(Shopify.newState('variant', variant.id));

          if (variant.selling_plan_allocations.length > 0) {
            const sellingPlan = variant.selling_plan_allocations[0].selling_plan_id;

            $('#product-selling-plan').val(sellingPlan);
          }

          if (typeof settings.onInit === 'function') {
            settings.onVariantChange(variant);
          }
        } catch (error) {
          console.error('[SWATCH ERROR]', error);
        }
      });

      const selectedVariantID = Shopify.urlParam('variant');

      let variant = product.variants.find(function(v, i) {
        return v.id == selectedVariantID;
      });

      if (!variant || selectedVariantID == undefined) {
        variant = product.variants[0];
      }

      $('.swatch-type[data-index="1"] .swatch-element', container).each(function() {
        const $self = $(this);

        if (Object.keys(variations).indexOf($self.attr('data-swatch')) > -1) {
          $self.removeClass('swatch-disabled').find('input').prop('disabled', false);
        } else {
          $self.find(".tooltip").remove();
        }
      });

      $('.swatch-type[data-index="1"] .jq-product-variant option', container).each(function() {
        const $self = $(this);

        if (Object.keys(variations).indexOf($self.attr('value')) < 0 && $self.attr('value') !== '') {
          $self.prop('disabled', true);
        }
      });

      variant.options.forEach(function(option) {
        option = option.replace(/"/g, '\\"').replace(/'/g, "\\'");
        $('.swatch-element[data-swatch="' + option + '"]', container).trigger('click');
        $('.product-variant option[value="' + option + '"]', container).parent().val(option.replace(/\\/gi, '')).trigger('change');
      });

      if (prepare_variants($('.swatch-variant-value:checked', $('.swatch-element', container))).length == product.options.length) {
        $currentPrice.html(Shopify.formatMoney($(':selected', $choosedVariant).attr('data-price')));
        $currentComparePrice.html(Shopify.formatMoney(variant.compare_at_price));
        $addToCartPrice.html(Shopify.formatMoney(parseInt($quantity.val()) * variant.price));
      }

      $('.modal-close', container).click(function() {
        $('.modal-container').removeClass('active');
      });

      $(window).click(function(e) {
        if (e.target == $('.modal-container', container).get(0))
          $('.modal-container', container).removeClass('active');
      });

      for (var i = 2, j = product.options.length + 1; i < j; i++) {
        chooseBeforeOption(i);
      }

      window.VastaProduct = {
        computeYouSave: computeYouSave
      };

      if (typeof settings.onInit === 'function') {
        settings.onInit();
      }
    }).catch(function(error) {
      console.error('[SWATCH]', error);
    });
  }
  
  return VastaSwatch;
})();
