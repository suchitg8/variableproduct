var sectionError = false;

$(function()
{
  var onload = window.onload;

  /* Добавляет атрибут onpaste, чтобы отключить возможность вставлять текст в поля для ввода. */
  $(document).find('input.js-event').attr('onpaste', 'return false;');

  window.onload = function () {
      if (typeof onload == "function") {
          onload.apply(this, arguments);
      }

      var fields = [];
      var inputs = document.getElementsByTagName("input");
      var textareas = document.getElementsByTagName("textarea");

      for (var i = 0; i < inputs.length; i++) {
          fields.push(inputs[i]);
      }

      for (var i = 0; i < textareas.length; i++) {
          fields.push(textareas[i]);
      }

      for (var i = 0; i < fields.length; i++) {
          var field = fields[i];

          if (typeof field.onpaste != "function" && !!field.getAttribute("onpaste")) {
              field.onpaste = eval("(function () { " + field.getAttribute("onpaste") + " })");
          }

          if (typeof field.onpaste == "function") {
              var oninput = field.oninput;

              field.oninput = function () {
                  if (typeof oninput == "function") {
                      oninput.apply(this, arguments);
                  }

                  if (typeof this.previousValue == "undefined") {
                      this.previousValue = this.value;
                  }

                  var pasted = (Math.abs(this.previousValue.length - this.value.length) > 1 && this.value != "");

                  if (pasted && !this.onpaste.apply(this, arguments)) {
                      this.value = this.previousValue;
                  }

                  this.previousValue = this.value;
              };

              if (field.addEventListener) {
                  field.addEventListener("input", field.oninput, false);
              } else if (field.attachEvent) {
                  field.attachEvent("oninput", field.oninput);
              }
          }
      }
  }
})

/* При загрузке страницы создает скроллбары с указанных блоках. */
$(window).on('load', function ()
{
    $('.fixed-height, #sizing_modal').niceScroll();

});

/* Клик на кнопки “Personalization” и “Color/Material” ­ делает видимым меню конкретного раздела, заголовки и форму
   (становятся видны при нажатии на пункт и подпункт меню) */
$(document).on('click', '[data-section]', function (e)
{
    e.preventDefault();

    var t = $(this);
    if (!t.hasClass('disabled'))
    {
        var s = t.data('section');

        $(document).find('[data-menu="'+s+'"]').removeClass('closed')
            .siblings().addClass('closed');
        $(document).find('[data-titles="'+s+'"]').removeClass('closed')
            .siblings().addClass('closed');
        $(document).find('[data-form="'+s+'"]').removeClass('closed')
            .siblings().addClass('closed');
    }
    return false
});

/* Клик на пункт меню ­ открывается конкретный заголовок, форма и перегружается canvas.
   Сторона куртки прописана в атрибуте data­side у открывающейся формы. */
$(document).on('click', '[data-show-step]', function (e)
{
    e.preventDefault();

    var t = $(this);
    if (!t.hasClass('disabled'))
    {
        $('#editor_buttons, #editor_menus').addClass('closed');
        $('#editor_titles, #editor_forms').removeClass('closed');
        var b = t.closest('ol').data('menu');
        var s = t.data('show-step');

        $(document).find('[data-titles="'+b+'"] [data-title="'+s+'"]').removeClass('closed')
            .siblings().addClass('closed');
        $(document).find('[data-form="'+b+'"] [data-step="'+s+'"]').removeClass('closed').addClass('current-step')
            .siblings().addClass('closed').removeClass('current-step');
        if (_is(a = $(document).find('[data-form="'+b+'"] [data-step="'+s+'"]').data('side')))
        {
            side = sides[parseInt(a)];
            wiz.reload();
        }
    }
    return false
});

/* Клик на переключение шагов (вперед/назад). Проверяется на ошибки блок, в котором расположены кнопки.

    checkStep() ­ проверка на ошибки (поля f­error без класса closed)

    completeStep() ­ добавляет класс complete пункту в меню, сравнивает кол­во законченных шагов и общее число,
    чтобы включить кнопку “Personalization” (allowPersonalization)
*/
$(document).on('click', '.prev_step, .next_step', function(e)
{
    sectionError = false;
    e.preventDefault();

    var t = $(this);
    var section = t.closest('[data-step]');
    sectionError = checkStep(section);

    if (t.hasClass('disabled'))
    {
        return false;
    }

    completeStep(section, !sectionError);
    checkForSizing();
    if ( !sectionError )
    {
        step(t);
    }
});

/* При нажатии на кнопку “Назад в меню (<)” проверяет, заполнен ли до конца блок ­
   если да, то добавляет класс complete и возвращается, если нет, то просто возвращается в меню. */
$(document).on('click', '.switch-to-menu', function (e)
{
    var error = false;
    e.preventDefault();
    var current = $('.current-step');
    error = checkStep(current);
    completeStep(current, !error);
    goMenu();
});

/* При нажатии на кнопку “Следующий шаг (>)” имитирует клик на onclick ".prev_step, .next_step". */
$(document).on('click', '.switch-to-next', function (e)
{
    e.preventDefault();
    var current = $('.current-step');
    var next = current.find('.next_step');
    if (next.length > 0)
    {
        next.trigger('click');
    }
    else
    {
        var last = current.find('.last_step');
        if (last.length > 0)
        {
            last.trigger('click');
        }
    }
});

/* Клик на кнопку “Перейти в персонализацию”, которая находится в последнем шаге “Color/Material” */
$(document).on('click', '#btn_personalise', function (e)
{
    e.preventDefault();
    var t = $(this);
    if (t.hasClass('disabled'))
    {
        showPersonalizationNotify(true);
        setTimeout(
            showPersonalizationNotify,
            3000
        );
        return false;
    }

    $(document).find('#head_personalise').trigger('click');
    $(document).find('[data-form="personalise"] [data-step="1"]')
        .addClass('current-step')
        .siblings()
        .removeClass('current-step');
});

/* Показывают предупреждение при наведении мыши на disabled кнопки “Перейти в персонализацию” */
$(document).on('mouseover','#head_personalise.disabled',function ()
{
    showPersonalizationNotify(true, 'head');
});

/* Показывают предупреждение при наведении мыши на disabled кнопки “Перейти в персонализацию” */
$(document).on('mouseover','#btn_personalise.disabled',function ()
{
    showPersonalizationNotify(true);
});

/* Скрывает предупреждения */
$(document).on('mouseout', '#btn_personalise.disabled, #head_personalise.disabled', showPersonalizationNotify);

/* Клик на патч ­ добавляет класс “checked” к родительскому элементу “label” */
$(document).on('click', '.check-patch', function ()
{
    isChecked($(this));
});

/* IE fix, that piece of a browser does not check our input on label/img click */
$(document).on('click', 'label img', function ()
{
    $(this).parent().find('input').click();
    reloadWizard(); // because sometimes (on live, not on dev) it only worked on second click. go figure.
});

/* .p­back ­ это label элементов персонализации спины
   при клике на них, добавляется класс .small, который делает их меньше и размещает в 1 ряд. */
$(document).on('click', '.p-back', function ()
{
    $('.p-back').addClass('small');
});

/* Клик на стрелки, которые вращают куртку. */
$(document).on('click', '#r_right', function ()
{
    var t = $(this);
    var c = $('.current-step');
    var f = c.closest('[data-form]').data('form');
    var i = sides.indexOf(side);
    switch(i){
        case 0: i = 1; break;
        case 1: i = 3; break;
        case 2: i = 0; break;
        case 3: i = 2; break;
    }
    /*if (i == sides.length-1)
    {
        i = 0;
    }
    else
    {
        i++;
    }*/
    side = sides[i];
    wiz.reload();

    if (f == 'personalise')
    {
        $(document).find('[data-form="'+f+'"] [data-side="'+i+'"]').first().removeClass('closed').addClass('current-step')
            .siblings().addClass('closed').removeClass('current-step');
        var s = $(document).find('[data-form="'+f+'"] [data-side="'+i+'"]').data('step');
        $(document).find('[data-titles="'+f+'"] [data-title="'+s+'"]').removeClass('closed')
            .siblings().addClass('closed');
    }
});

/* Клик на стрелки, которые вращают куртку. */
$(document).on('click', '#r_left', function ()
{
    var t = $(this);
    var c = $('.current-step');
    var f = c.closest('[data-form]').data('form');
    var i = sides.indexOf(side);
    switch(i){
        case 0: i = 2; break;
        case 1: i = 0; break;
        case 2: i = 3; break;
        case 3: i = 1; break;
    }
    /*if (i == 0)
    {
        i = sides.length-1;
    }
    else
    {
        i--;
    }*/
    side = sides[i];
    wiz.reload();

    if (f == 'personalise')
    {
        $(document).find('[data-form="'+f+'"] [data-side="'+i+'"]').first().removeClass('closed').addClass('current-step')
            .siblings().addClass('closed').removeClass('current-step');
        var s = $(document).find('[data-form="'+f+'"] [data-side="'+i+'"]').data('step');
        $(document).find('[data-titles="'+f+'"] [data-title="'+s+'"]').removeClass('closed')
            .siblings().addClass('closed');
    }
});

/* Клик на кнопку “BUY”. Перегоняет все data­real­value и data­color­id в атрибут value.
   Делает принты всех сторон куртки и отправляет форму. */
$(document).on("click", "#buy", function (e)
{
    e.preventDefault();

    if (!$(this).hasClass("disabled"))
    {
        $('[data-color-id]:checked').each(function()
        {
            $(this).val( $(this).data('color-id') );
        });

        $('[data-real-value]:checked').each(function()
        {
            $(this).val( $(this).data('real-value') );
        });

        var form = $(this).closest("form");

        for (var i = 0; i < sides.length; i++)
        {
            if (jd.data.info.jacket == 'satin' && (sides[i] == 'left' || sides[i] == 'right'))
            {}
            else
            {
                side = sides[i];
                wiz.reload( true );

                var image = canvas.toDataURL("image/jpeg");
                if (side == 'side')
                {
                    side = 'left';
                }
                $("input[name='data[output][" + side + "]']").val( image );
            }
        }

        form.submit();
    }else{
        alert('Please complete these steps');
    }
});

/* При вводе цифр в поля с атрибутом data­number, находится поле с атрибутом name=”font”
   атрибут data­check­field которого равняется значению атрибута name текущего поля.
   У поля font дисейблятся шрифты, которые не поддерживают цифры. */
$(document).on('keyup', '[data-number]', function ()
{
    var t = $(this);
    var val = t.val();
    var name = t.attr('name');

    var fontField = $(document).find('[name*="font"][data-check-field="'+name+'"]');
    var disable = !!( /\d/.test(val) ) ;

    var fonts = ['oldenglish', 'script'];
    if ( /\d/.test(val) && fonts.indexOf(fontField.val()) >= 0 )
    {
        fontField.val( fontField.find('option').first().next().val() );
        fontField.trigger('change');
    }

    fontField.find('option[value="script"], option[value="oldenglish"]').attr('disabled', disable);
});

/* Смена шрифта в Right Chest требует смены uppercase на camelcase, если шрифт Script,
   поэтому имитируется клик на текстовое поле, чтобы сработал нужный event. */
$(document).on('change', '[data-check-field]', function ()
{
    var name = $(this).data('check-field');
    var input = $('input[name="'+name+'"]');
    if (_is(input.data('script')))
    {
        input.trigger('keypress');
    }
});

/* Открывает модальное окно с таблицей размеров. */
$(document).on('click', '#showSizeChart', function (e)
{
    e.preventDefault();

    var modal = $('#sizing_modal_outer');
    var locale = '';
    if (_locale != 'us')
    {
        locale = _locale + '/';
    }

    //modal.find('#sizing_modal').load('/' + locale + 'size-chart-varsity-jacket/ .scright');
    modal.addClass('modal_show');

});

/* Закрывает модальное окно с таблицей размеров. */
$(document).on('click', '#close_size_modal', function (e)
{
    e.preventDefault();

    var t = $(this);
    t.closest('#sizing_modal_outer').removeClass('modal_show');
    $('#sizing_modal').getNiceScroll().remove();
});

/* Вызывается на последних шагах в персонализации,
   чтобы проверить, заполнены ли все поля и включить кнопку BUY. */
function checkForBuy ()
{
    var step = $('.current-step'); // as we don't know which step we're in, can be 6th, can be 5th (in case of team jackets mode)
    var buy = $('.current-step #buy'); // probably okay with just '#buy', but i'm not taking any chances

    var success = !checkStep(step); // "very logical naming of functions"

    activateButton( buy.closest('[data-step]'), success ); // aktiveit ze buy butan

    if (success)
    {
        buy.removeClass('disabled');
    }
    else
    {
        buy.addClass('disabled');
    }
}

/* Проверяет все шаги персонализации на ошибки, за исключением шага с выбором размера куртки.
   Если все ок, то кнопка “SIZING & FINALIZE” становится активной. */
function checkForSizing ()
{
    var steps = $(document).find('[data-form="personalise"] [data-step]');
    var error = false;
    var tmp_err = false;
    steps.each(function ()
    {
        var t = $(this);
        if (parseInt(t.data('step')) < steps.length)
        {
            error = checkStep(t);
            if (error)
            {
                tmp_err = true;
            }
        }
    });
    var btns = $('#sizing, #sizing-btn');
    if (tmp_err)
    {
        btns.addClass('disabled');
    }
    else
    {
        btns.removeClass('disabled');
    }
}

/* Вызывается при переходе на другой шаг или в меню.
   Добавляет/убирает класс “completed” из формы и пункта меню, в зависимости от параметра “bool”. */
function completeStep ( element, bool )
{
    var type = element.closest('[data-form]').data('form');
    var index = element.data('step');
    var sizing = $(document).find('#sizing');
    var sizing_btn = $(document).find('#sizing-btn');
    if (!_is(index))
    {
        index = element.closest('[data-step]').data('step');
    }
    var menu = $('[data-menu="'+type+'"]');
    var step = menu.find('[data-show-step="'+index+'"]');
    var form_step = $('[data-form="'+type+'"]').find('[data-step="'+index+'"]');

    if (bool === false)
    {
        allowPersonalisation(false);
        step.removeClass('completed');
        form_step.removeClass('completed');
        if (element.closest('[data-form]').data('form') != 'materials')
        {
            sizing.addClass('disabled');
            sizing_btn.addClass('disabled');
            allowPersonalisation(true);
            return false;
        }
        return false;
    }
    if (element.closest('[data-form]').data('form') != 'materials')
    {
        return false;
    }
    step.addClass('completed');
    var items = menu.find('li');
    var completed = menu.find('li.completed');
    bool = (items.length == completed.length);
    allowPersonalisation(bool);
}

/* Закрывает текущий раздел и переходит в следующий или предыдущий,
   в зависимости от кнопки, которая нажималась (параметр button) */
function step ( button )
{
    var section = button.closest('[data-step]');
    var index = parseInt(section.data('step'));
    var form = button.closest('[data-form]');

    var toIndex = 0;

    if (button.hasClass('prev_step'))
    {
        if (index == 1)
        {
            goMenu();
        }
        else
        {
            section.prev('[data-step]').removeClass('closed').addClass('current-step')
                .siblings().addClass('closed').removeClass('current-step');
            toIndex = section.prev('[data-step]').data('step');
            $(document).find('[data-titles="'+form.data('form')+'"] [data-title="'+(toIndex)+'"]').removeClass('closed')
                .siblings().addClass('closed');
            if (_is(a = section.prev('[data-step]').data('side')))
            {
                side = sides[parseInt(a)];
                wiz.reload();
            }
        }
    }
    if (button.hasClass('next_step'))
    {
        section.next('[data-step]').removeClass('closed').addClass('current-step')
            .siblings().addClass('closed').removeClass('current-step');
        toIndex = section.next('[data-step]').data('step');
        if (_is(a = section.next('[data-step]').data('side')))
        {
            side = sides[parseInt(a)];
            wiz.reload();
        }
        $(document).find('[data-titles="'+form.data('form')+'"] [data-title="'+(toIndex)+'"]').removeClass('closed')
            .siblings().addClass('closed');
    }
}

/* Закрывается форма и открывается меню */
function goMenu ()
{
    $('#editor_buttons, #editor_menus').removeClass('closed');
    $('#editor_titles, #editor_forms').addClass('closed');
    $('.current-step').removeClass('current-step');
}

/* Вызывается при клике на label > input.
   Добавляет класс checked элементу label, если атрибут input checked=true. */
function isChecked ( label )
{
    label.addClass('checked').siblings().removeClass('checked');
}

/* При выборе типа куртки (retro, hoodie, ) */
function enableList ()
{
    $('#menu_materials li').removeClass('disabled');
}

/* Открывает блок со списком цветов элемента.
   Вызывается из HTML, при нажатии на span.color­icon. */
function showColorList ( span )
{
    var list = span.closest('section').find('.color-list');
    if (list.hasClass('closed'))
    {
        list.removeClass('closed');
        var top = span.position().top;
        list.css('top', top-list.height()/2);
    }
    else
    {
        list.addClass('closed');
    }
}

/* При нажатии на цвет меняет фон .color­icon и вставляет название цвета рядом с ним. */
function setColor ( input )
{
    var span = input.closest('section').find('.color-icon');
    var descSpan = input.closest('section').find('.color-desc');
    span.addClass('checked').css('background-color', input.val());
    input.closest('section').find('.color-desc').text(input.parent().data('original-title'));
    input.closest('.color-list').addClass('closed');
}

/* При нажатии на input[type=radio] или вводе текста в input[type=text] открывает связанный с ним блок,
   в котором находятся доп. поля.
   Например, при выборе материала куртки, открывается блок с выбором цвета. */
function openSub ( input, double, row )
{
    ((input.attr('name') == 'personalisation[back][type]') && (input.val() == 'text_p' || input.val() == 'patch')) ?
        $('.folder-main .folder-open-sub[data-folder-id="8"]').hide() : $('.folder-main .folder-open-sub[data-folder-id="8"]').show();
    var article, val;
    if (!double)
    {
        article = input.closest('.row-field');
        if (article.length < 1)
        {
            article = input.closest('article');
        }
        val = input.val();
        article.children('[data-f-val]').addClass('closed');
        article.children('.sub-field[data-f-val*="'+val+'"]').removeClass('closed');
        return false;
    }
    article = input.closest('section.sub-field');
    val = input.val();
    article.children('[data-f-val]').addClass('closed');
    article.children('.sub-field[data-f-val*="'+val+'"]').removeClass('closed');
}

/* Открывает второй и третий ряды (прим. рукава и three line text). */
function openRow ( field, row )
{
    if (field.val().length > 0)
    {
        row.removeClass('disabled');
    }
    else
    {
        row.addClass('disabled');
    }
}

$(function(){

    /* При выборе типа куртки прячет несоответствующие ей материалы. */
    // user select collar type (classic, hoodie, retro)
    $('.collar-selector').on('click', function(){
        if (!isFullLeather)
        {
            var collarType = $(this).find('input:first').val();

            var bodySelectorVinyl = $('.body-selector input[value="vinyl"]').closest('.body-selector');

            switch(collarType){
                case 'classic':
                case 'hoodie':
                    //show vinyl material and trigger body-selector "on click" event
                    bodySelectorVinyl.removeClass('closed');
                    $('.body-selector input:checked').trigger('click');
                    break;
                case 'retro':
                    //hide vinyl in retro jacket (and set wool as default, if vinl was selected before)
                    bodySelectorVinyl.addClass('closed');
                    if($('input', bodySelectorVinyl).prop('checked'))
                    {
                        $('.body-selector input[value="wool"]')
                            .closest('.body-selector').trigger('click');
                    }
                    break;
            }
        }

        isChecked($(this));
        enableList();
    });

    /* При выборе материала боди выбирает соответствующий материал для рукавов, если требуется.
       Остальные прячет. */
    //user select body material (wool, leather, vinyl)
    $('.body-selector').on('click', function(){
        isChecked($(this));

        var material = $(this).find('input:first').val();
        var wool = $(document).find('[data-material="wool"]');
        var leather = $(document).find('[data-material="leather"]');
        var vinyl = $(document).find('[data-material="vinyl"]');
        switch (material)
        {
            case 'leather':
                wool.addClass('closed');
                vinyl.addClass('closed');
                leather.removeClass('closed');
                leather.trigger('click');
                leather.each(function ()
                {
                    var t = $(this);
                    var error = checkStep( t.closest('[data-step]') );
                    if (error)
                    {
                        completeStep(t, false);
                    }
                });
                break;
            case 'vinyl':
                wool.addClass('closed');
                leather.addClass('closed');
                vinyl.removeClass('closed');
                vinyl.trigger('click');
                vinyl.each(function ()
                {
                    var t = $(this);
                    var error = checkStep( t.closest('[data-step]') );
                    if (error)
                    {
                        completeStep(t, false);
                    }
                });
                break;
            case 'wool':
                wool.removeClass('closed');
                leather.removeClass('closed');
                if ($('input[data-show-sleeves="retro"]:checked').length == 0)
                {
                    vinyl.removeClass('closed');
                }
                break;
        }
    });

    /* При выборе материала рукавов, выбирает соответствующий материал для карманов. */
    $('.sleeves-selector').on('click', function(){
        var material = $(this).find('input:first').val();
        $(document).find('[data-material="'+material+'"]').each(function()
        {
            var t = $(this);
            var input = t.find('input');

            if (input.attr('name')=='materials[pockets][type]')
            {
                t.trigger('click');
                t.closest('article').children('.has-sub').addClass('closed');
                t.removeClass('closed');

                var error = checkStep( t.closest('[data-step]') );
                if (error)
                {
                    completeStep(t, false);
                }
            }
        });
    });
});

/* Проверяет шаг на ошибки ­ ищет .f­error, которые не имеют класса closed. */
function checkStep ( section )
{
    var error = false;
    var errors = section.find('.f-error');

    errors.each(function ()
    {
        var isErr = false;
        var er = $(this);
        if (er.closest('.sub-field').length > 0 && er.closest('.sub-field').hasClass('closed')
            || (er.hasClass('disabled') || er.closest('.row-field').hasClass('disabled')) )
        {
            return true;
        }
        er.addClass('closed');
        var cf = er.data('check-for');
        if (_is(cf))
        {
            var field = $(document).find('input[name="'+cf+'"]');
            if (field.length > 0)
            {
                var ftype = field.attr('type');
                switch(ftype)
                {
                    case 'number':
                    case 'text':
                        if (field.val().length < 1) isErr = true;
                        break;
                    case 'radio': case 'checkbox':
                    if ($(document).find('input[name="'+cf+'"]:checked').length < 1) isErr = true;
                    break;
                }
            }
            else
            {
                field = $(document).find('select[name="'+cf+'"]');
                if (field.val() == "")
                {
                    isErr = true;
                }
            }
            if (isErr)
            {
                er.removeClass('closed');
                error = true;
            }
        }
    });

    return error;
}

/* Включает/выключает кнопку “Перейти в персонализацию” на последнем шаге color/material. */
function allowPersonalisation ( bool )
{
    var button = $('[data-section="personalise"]');
    var last_btn = $('#btn_personalise');
    if (bool === false)
    {
        button.addClass('disabled');
        last_btn.addClass('disabled');
        return false;
    }

    button.removeClass('disabled');
    last_btn.removeClass('disabled');
    return true;
}

/* Показыват/скрывает подсказку о том, что все шаги должны быть выполнены, чтобы перейти в персонализацию. */
function showPersonalizationNotify ( show, attr)
{
    var notify = $('#personalise_notify');
    if (!attr) attr = '';
    if (!show || typeof(show) == 'object')
    {
        notify.addClass('closed').removeClass('head');
        return false;
    }
    notify.removeClass('closed').addClass(attr);
}

/* Показывает/скрывает ошибки в зависимости от заполненности поля. */
function enableErrorFields ( field )
{
    var name = field.attr('name');
    var fields = $('[data-check-field="'+name+'"]');
    fields.each(function ()
    {
        var t = $(this);
        var e = $('.f-error[data-check-for="'+ t.attr('name')+'"]');
        if (field.val().length < 1)
        {
            e.addClass('disabled closed');
            return true;
        }
        e.removeClass('disabled');
    });
}

/* В зависимости от заполненности текстового поля,
   скрывает/показывает указанный ряд (рукава, three line text) */
function disableRow ( radio, row )
{
    var article = radio.closest('article');
    var sub = article.children('.sub-field[data-f-val="'+radio.val()+'"]');
    var label = sub.find('label').first();
    var input = label.children('input');
    var type = input.attr('type');
    var disable = false;
    switch (type)
    {
        case 'text':
            if (input.val() < 1)
            {
                disable = true;
            }
            break;
        case 'radio':
            if (sub.find('input:checked').length < 1)
            {
                disable = true;
            }
            break;
    }
    if (disable)
    {
        row.addClass('disabled');
    }
    else
    {
        row.removeClass('disabled');
    }
}

/* Делает активным указанный ряд. */
function enableRow ( row )
{
    row.removeClass('disabled');
}

/* Отмечает аналогичный патч, чтобы при переключении типа на спине клиент видел,
   какой патч у него отмечен (Text w Patch ­> Patch Only).

   Отмечает аналогичный цвет (Text w Patch ­> Three Line Text) */
function dublicate ( field, isColor, isPatch )
{
    var name = field.attr('name');
    if (field.attr('type') == 'text' || field.get(0).nodeName == 'SELECT')
    {
        var fields = $('[name="'+name+'"]');
        fields.val( field.val() );
        fields.each(function ()
        {
            var t = $(this);
            var a = '';
            if (t != field)
            {
                if (a = t.attr('onclick'))
                {
                    t.attr('onclick', a.replace('dublicate($(this))', ''));
                    t.trigger('click');
                    t.attr('onclick', a);
                }
                if (a = t.attr('onchange'))
                {
                    t.attr('onchange', a.replace('dublicate($(this))', ''));
                    t.trigger('change');
                    t.attr('onchange', a);
                }
                if (a = t.attr('onkeyup'))
                {
                    t.attr('onkeyup', a.replace('dublicate($(this))', ''));
                    t.trigger('keyup');
                    t.attr('onkeyup', a);
                }
            }
            if (t.get(0).nodeName == "SELECT")
            {
                t.find('option[value="'+field.val()+'"]').trigger('click');
            }
        });
    }

    if (isColor)
    {
        $('input[name="'+name+'"]').closest('.sub-field').find('span.color-icon').css(
            'background', field.val()
        ).addClass('checked');
    }

    if (isPatch)
    {
        $('input[name="'+name+'"][value="'+field.val()+'"]').closest('label').addClass('checked')
            .siblings().removeClass('checked');
    }
}

/* При изменении состояния элемента с атрибутом data­v­type проверяет на допустимые символы. */
$(document).on('focusout keypress change', '[data-v-type]', function (e)
{
    //e.preventDefault(); // спасибо, что отключили BACKSPACE и DEL ­ самые ненужные кнопки при редактировании текста :)
    //validate($(this), e);
    //return;

    var x = e.which || e.keyCode;
    var codes = [0, 8, 16, 35, 36, 37, 38, 39, 40, 46];
    if (codes.indexOf(x) < 0)
    {
        e.preventDefault();
        validate($(this), e);
    }
    else
    {
        var key = String.fromCharCode(e.charCode);
        var charArray = ["'", '"', '&', '%', '#', '$', '.'];
        if ($.inArray(key, charArray) != -1)
        {
          e.preventDefault();
        }
    }
});

/* Осуществляет проверку и не допускает добавление спец. символов. Преобразует вводимые символы. */
function validate ( t, e )
{
    var type = t.data('v-type');
    var l = t.data('v-length');
    var s = t.get(0).selectionStart;
    var s2 = t.get(0).selectionEnd;
    var c = t.data('case');

    if (t.data('script') == 1)
    {
        var name = t.attr('name');

        var fontField = $(document).find('[name*="font"][data-check-field="'+name+'"]');
        if (fontField.val() == 'script')
        {
            c = 'cap_each';
            type = 'script';
        }
        if (fontField.val() == 'problock')
        {
            c = 'upper';
        }
    }

    var str = t.val();
    var key = String.fromCharCode(e.which);
    var newStr = str.substr(0, s) + key + str.substr(s2);
    if (newStr.length <= l)
    {
        str = newStr;
        s++;
    }
    switch (type)
    {
        default:
            str = str.replace(/[^A-Za-z0-9]+/g, "");
            break;
        case 'text':
            str = str.replace(/[^A-Za-z ]+/g, "");
            break;
        case 'text_all':
            str = str.replace(/[^A-Za-z0-9\,\.\/\\\'\"\;\:\[\{\]\}\!\@\#\$\%\^\&\*\(\)\-\= ]+/g, "");
            break;
        case 'left_chest':
            if (str.length > 0)
            {
                if (str.charAt(0) >=0 && str.charAt(0) <= 9)
                {
                    l = 2;
                    str = str.replace(/[^A-Za-z0-9]+/g, "");
                }
                else
                {
                    str = str.replace(/[^A-Za-z0-9]+/g, "");
                }
            }
            c = 'upper';
            break;
        case 'lines':
            str = str.replace(/[^A-Za-z0-9 -]+/g, "");
            break;
        case 'script':
            str = str.replace(/[^A-Za-z -]+/g, "");
            break;
    }

    if (type != 'text_all')
    {
      str = str.replace("'", "");
      str = str.replace('"', '');
      str = str.replace('.', '');
    }

    switch (c)
    {
        case 'upper':
            str = str.toUpperCase();
            break;
        case 'cap':
            str = str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
            break;
        case 'cap_each':
            str = str.replace(/\w\S*/g, function(txt)
            {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
            break;
    }
    str = str.substr(0, l);
    if(t.val() != str){
        t.val(str);
        t.setCursorPosition(s);
    }
}

/* Преобразует форму в объект для дальнейшей работы с канвасом. */
$.fn.serializeObject = function(){
    var self = this,
        json = {},
        push_counters = {},
        patterns = {
            "validate": /^[a-zA-Z][a-zA-Z0-9_]*(?:\[(?:\d*|[a-zA-Z0-9_]+)\])*$/,
            "key":      /[a-zA-Z0-9_]+|(?=\[\])/g,
            "push":     /^$/,
            "fixed":    /^\d+$/,
            "named":    /^[a-zA-Z0-9_]+$/
        };

    this.build = function(base, key, value){
        base[key] = value;
        return base;
    };

    this.push_counter = function(key){
        if(push_counters[key] === undefined){
            push_counters[key] = 0;
        }
        return push_counters[key]++;
    };

    $.each($(this).serializeArray(), function(){
        if(!patterns.validate.test(this.name)){
            return;
        }
        var k,
            keys = this.name.match(patterns.key),
            merge = this.value,
            reverse_key = this.name;
        while((k = keys.pop()) !== undefined){
            reverse_key = reverse_key.replace(new RegExp("\\[" + k + "\\]$"), '');

            if(k.match(patterns.push)){
                merge = self.build([], self.push_counter(reverse_key), merge);
            }
            else if(k.match(patterns.fixed)){
                merge = self.build([], k, merge);
            }
            else if(k.match(patterns.named)){
                merge = self.build({}, k, merge);
            }
        }
        json = $.extend(true, json, merge);
    });
    return json;
};

/* При вылидации ставит курсор в необходимое место ­
   например, если ввел один символ, поставил курсор в начало и ввел еще символ. */
$.fn.setCursorPosition = function(pos) {
    this.each(function(index, elem) {
        if (elem.setSelectionRange) {
            elem.setSelectionRange(pos, pos);
        } else if (elem.createTextRange) {
            var range = elem.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    });
    return this;
};

/* Подсчитывает цену, принимая во внимание только заполненные и отмеченные поля с атрибутами:
   data­cost, data­cost­each, data­cost­arr. */
function calcPrice ()
{
    var rBaseField = $('#originalRetailPrice');
    var pBaseField = $('#originalPrice');

    var rViewField = $('#old_price').find('span');
    var pViewField = $('#new_price').find('span');

    var newPrice = parseInt(pBaseField.val()),
        newRetail = parseInt(rBaseField.val());

    newRetail = newRetail - newPrice;

    var cost = $('input[type="radio"][data-cost]:checked');
    cost.each(function()
    {
        var t = $(this);
        var inside = checkField(t);
        if (t.closest('label').hasClass('has-sub') || inside === true)
        {
            var empty = false;
            if (_is(t.data('cost-empty')))
            {
                if ($('input[name="'+ t.data('empty')+'"]').val().length == 0)
                {
                    empty = true;
                    newPrice += parseInt(t.data('cost-empty'));
                }
            }
            if (empty == false)
            {
                newPrice += parseInt(t.data('cost'));
                if (_is(a = t.data('except'))) {
                    newPrice -= parseInt($('input[name="' + a + '"]').data('cost'));
                }
            }
        }
        //console.log(t.data('cost'), t.attr('name'));
    });

    cost = $('input[type="text"][data-cost]');
    cost.each(function()
    {
        var t = $(this);
        if (t.val().length > 0)
        {
            var inside = checkField(t);
            if (t.closest('label').hasClass('has-sub') || inside === true)
            {
                var empty = true;
                if (_is(t.data('cost-empty')))
                {
                    if ($('input[name="'+ t.data('empty')+'"]').val().length > 0)
                    {
                        empty = false;
                        newPrice += parseInt(t.data('cost-empty'));
                    }
                }
                if (empty == true)
                {
                    newPrice += parseInt(t.data('cost'));
                    if (_is(a = t.data('except')))
                    {
                        newPrice -= parseInt($('input[name="'+a+'"]').data('cost'));
                    }
                }
            }
            //console.log('text', t.data('cost'), t.attr('name'));
        }
    });

    cost = $('input[type="text"][data-cost-each]');
    cost.each(function ()
    {
        var t = $(this);
        if (t.val().length > 0)
        {
            var inside = checkField(t);
            if (inside === true)
            {
                newPrice += (parseInt(t.data('cost-each')) * t.val().length);
            }
            //console.log('text', t.data('cost'), t.attr('name'));
        }
    });

    cost = $('input[type="text"][data-cost-arr]');
    cost.each(function ()
    {
        var t = $(this);
        if (t.val().length > 0)
        {
            var inside = checkField(t);
            if (inside === true)
            {
                newPrice += (parseInt(t.data('cost-arr')[t.val().length-1]));
            }
        }
    });

    cost = $('option[data-cost]:selected');
    cost.each(function ()
    {
        var t = $(this);
        if (t.val().length > 0)
        {
            var inside = checkField(t);
            if (inside === true)
            {
                if (_is(t.data('cost-empty')))
                {
                    var name = t.data('empty');
                    var select = t.closest('select');
                    var input = $('input[name="'+select.data('check-field')+'"]');
                    if (input.val().length > 0 && $('input[name="'+name+'"]').val().length > 0)
                    {
                        newPrice += parseInt(t.data('cost-empty')) - parseInt(input.data('cost-empty'));
                    }
                    else if (input.val().length > 0)
                    {
                        newPrice += parseInt(t.data('cost')) - parseInt(input.data('cost'));
                    }
                }
                else
                {
                    if (_is(t.data('except')))
                    {
                        newPrice += (parseInt(t.data('cost')) - parseInt($('input[name="'+ t.data('except')+'"]').data('cost')));
                    }
                    else
                    {
                        newPrice += parseInt(t.data('cost'));
                    }
                }
            }
        }
    });

    cost = $('option[data-cost-each]:selected');
    cost.each(function ()
    {
        var t = $(this);
        if (t.val().length > 0)
        {
            var inside = checkField(t);
            if (inside === true)
            {
                var exc = $('input[name="'+ t.data('except')+'"]');
                if (exc.val().length > 0)
                    newPrice += (parseInt(t.data('cost-each'))*exc.val().length - parseInt(exc.data('cost-each'))*exc.val().length);
            }
        }
    });

    cost = $('option[data-cost-arr]:selected');
    cost.each(function ()
    {
        var t = $(this);
        if (t.val().length > 0)
        {
            var inside = checkField(t);
            if (inside === true)
            {
                var exc = $('input[name="'+ t.data('except')+'"]');
                if (exc.val().length > 0)
                    newPrice += (parseInt(t.data('cost-arr')[exc.val().length-1]) - parseInt(exc.data('cost-arr')[exc.val().length-1]));
            }
        }
    });

    var afterDot = (_locale == 'us') ? 2 : 0;

    rViewField.text(number_format(newRetail + newPrice, afterDot, ".", ""));
    pViewField.text(number_format(newPrice, afterDot, ".", ""));
}

/* Проверяет родителя поля и определяет, находится ли поле в активном под поле или ряду.
   (При подсчете цены, поля, которые находятся в .row.disabled .sub­field.closed, игнорируются). */
function checkField (t)
{
    var inside = false;
    if (t.closest('.sub-field').length)
    {
        if (!t.closest('.sub-field').hasClass('closed'))
        {
            inside = true;
        }
    }
    if (t.closest('.row-field').length)
    {
        if (t.closest('.row-field').hasClass('disabled'))
        {
            inside = false;
        }
        var c = t.closest('.row-field');
        if (c.parent('.row-field').length && c.parent('.row-field').hasClass('disabled'))
        {
            inside = false;
        }
    }

    return inside;
}

/* Аналог PHP’шной функции */
function number_format( number, decimals, dec_point, thousands_sep )
{  // Format a number with grouped thousands
    var i, j, kw, kd, km;

    if( isNaN(decimals = Math.abs(decimals)) ){
        decimals = 2;
    }

    if( dec_point == undefined ){
        dec_point = ",";
    }

    if( thousands_sep == undefined ){
        thousands_sep = ".";
    }

    i = parseInt(number = (+number || 0).toFixed(decimals)) + "";

    if( (j = i.length) > 3 ){
        j = j % 3;
    } else{
        j = 0;
    }

    km = (j ? i.substr(0, j) + thousands_sep : "");
    kw = i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands_sep);
    kd = (decimals ? dec_point + Math.abs(number - i).toFixed(decimals).replace(/-/, 0).slice(2) : "");

    return km + kw + kd;
}

/* Содержимое не имеет почти ничего общего с названием.
   Добавляет/отнимает класс disabled для раздела, в зависимости от наличия ошибок и заполненности в нем. */
function activateButton ( section, bool )
{
    if ( bool )
    {
        section.addClass('completed');
        return false;
    }
    section.removeClass('completed');
}

$(document).on('click', '#getSize', function (e)
{
    e.preventDefault();

    var t = $(this);
    var f = t.closest('form');
    var data = f.serialize();

    $.post('/api/sizing', data)
        .done(function(response)
        {
            console.log(response);
        });
});

/** zipper hover */
/* При наведении на чекбокс “Zipper” показывает/скрывает изображение молнии. */
$(document).on('mouseover', '#show-zipper-image', function ()
{

    var zi = $('#zipper-image');
    zi.show();

}).on('mouseout', '#show-zipper-image', function ()
{

    var zi = $('#zipper-image');
    zi.hide();

});

/** Sleeves to Shoulder */
/* При выборе стиля куртки прячет/показывает допустимые материалы для рукавов. */
$(document).on('click', '[data-show-sleeves]', function ()
{
    if (!isFullLeather)
    {
        var t = $(this);
        var d = t.data('show-sleeves');
        $(document).find('[data-sleeves]').addClass('closed');
        $(document).find('[data-sleeves*="'+d+'"]').removeClass('closed');

        if (d == 'retro')
        {
            if ( $('input[name="materials[body][type]"]:checked').val() == 'leather' )
            {
                $('input[name="materials[body][type]"][value="wool"]').parent().trigger('click');
            }

            if ( $('input[name="materials[sleeves][type]"]:checked').val() == 'vinyl' )
            {
                $('input[name="materials[sleeves][type]"][value="wool"]').parent().trigger('click');
            }
        }
    }
});
