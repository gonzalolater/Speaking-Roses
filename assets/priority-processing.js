(function($){
  'use strict';

  const methods = {
    async addItem(data) {
      return await $.ajax({
        url: '/cart/add.js',
        method: 'POST',
        dataType: 'json',
        data
      });
    },

    async clearCart() {
      return await $.ajax({
        url: '/cart/clear.js',
        dataType: 'json'
      });
    },

    async removeItem(data) {
      return await $.ajax({
        url: '/cart/update.js',
        method: 'POST',
        dataType: 'json',
        data: {
          updates: data
        }
      });
    },

    changeState(settings, checked) {
      if (typeof checked === 'boolean') {
        $('.priority-processing__input', settings.$container).prop('checked', checked);
        return;
      }

      $('.priority-processing__input', settings.$container).each(function(){
        const $input = $(this);

        if ($input.val() == settings.variantID) {
          $input.prop('checked', true);
        } else {
          $input.prop('checked', false);
        }
      });
    }
  }

  $.fn.checkboxUpsell = function(options){
    const settings = $.extend(true, {
      modal: '',
      properties: {},
      onAddItem: function(){},
      onRemove: function(){},
      onFinally: function(){}
    }, options);

    settings.$container = $(this);
    settings.variantID = $('.priority-processing__input', this).val();

    if (settings.$modal !== '') {
      settings.$modal = $(settings.modal);
    }

    $.getJSON('/cart.json')
      .then(function(loadedCart){
        console.log('PRIORITY PROCESSING IS READY');
        const priorityProcessing = loadedCart.items.find(function(item){
          return item.variant_id == settings.variantID;
        });

        if (priorityProcessing) {
          methods.changeState(settings, true);

          if (typeof settings.onInit === 'function') {
            settings.onInit(priorityProcessing);
          }
        }

        settings.$container.show();

        settings.$container.on('change', '.priority-processing__input', async function(e){
          const $input = $(this);

          e.preventDefault();
          
          try {
            if ($input.is(':checked')) {
              let cart = await $.getJSON('/cart.js');

              const result = await methods.addItem({
                id: settings.variantID,
                quantity: 1,
                properties: settings.properties
              });

              cart = await $.getJSON('/cart.js');

              methods.changeState(settings);

              if (typeof settings.onAddItem === 'function') {
                settings.onAddItem(result, cart)
              }
              console.log(cart, 'CART 2');
              if (typeof settings.onFinally === 'function') {
                settings.onFinally(cart)
              }
            } else {
              const id = settings.variantID;
              const result = await methods.removeItem({
                [id]: 0
              });

              methods.changeState(settings, false);

              if (typeof settings.onRemove === 'function') {
                settings.onRemove(result)
              }

              if (typeof settings.onFinally === 'function') {
                settings.onFinally(result)
              }
            }
          } catch(err) {
            console.error('[Priority Processing Error]', err);
          }
        });

        if (settings.$modal !== '') {
          settings.$container.on('click', 'a', function(e){
            e.preventDefault();
            
            $(document.body).addClass('priority-processing__modal--opened');
          });
        }

        settings.$modal.on('click', '.priority-processing__modal-close,.priority-processing__modal-overlay', function(e){
          e.preventDefault();

          $(document.body).removeClass('priority-processing__modal--opened');
        });
        $(document).keyup(function(e){
          if (e.which === 27 && e.key === 'Escape') {
            $(document.body).removeClass('priority-processing__modal--opened');
          }
        });
      })
      .catch(function(err){
        console.error(err);
      });
  };
})(jQuery);