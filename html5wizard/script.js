var canvas,     //canvas object
    cx,         //canvas center X
    cy,         //canvas center Y
    ctx,        //canvas context
    defColor,   //default color
    wiz,        //wizard object
    sPtchW,     //small patch width
    bPtchH,     //big patch max height
    li = 0,     //loaded images count
    wi,         //wizard images
    jo = {},    //jacket object [for drawing]
    cjo = {};   //colored jacket details
var jd = {};    //jacket data
var old_color = {}; //old color list

var sides = ['front', 'side', 'right', 'back']; // jacket sides
var side = sides[0];

defColor = '#ffffff';
var defFont = 'AthleticBlock';
sPtchW = 56;    // side patch width
bPtchH = 170;   // back patch height/width

var chArr = []; //exceptions from layers
var vinylSleeves = false;
var LChest, RChest, LSleeve, RSleeve, Back;

var isFullLeather = false;

var fonts = {
    'AthleticBlock' : ' Athletic',
    'oldenglish' : 'Oldenglish',
    'tiffany' : 'Tiffany',
    'script' : 'Script',
    'problock' : 'Problock'
};

/** Preparing Wizard on Page Start */
/* Создание объектов для редактирования куртки и ее деталей. Проверка на атрибут leather (full leather jacket).
   Подсчет цены.
   Загрузка изображений ­ при загрузке запускается визард. */
$(document).on('ready', function ()
{
    canvas = document.getElementById('wizard');
    ctx = canvas.getContext('2d');
    cy = canvas.height/2;
    cx = canvas.width/2;
    ctx.translate(cx, cy); // setting center of canvas
    ctx.lineWidth = 6; // setting text outline width
    wiz = new html5wizard();
    afterSerialize(); // setting default jacket object values
    genOldColors();   // generate default colors of jacket, on each next time when repainting colors are compared

    wi = $('#wiz-images').find('img');  // images of the jacket parts
    LChest = new LeftChest();
    RChest = new RightChest();
    LSleeve = new Sleeve( 'left' );
    RSleeve = new Sleeve( 'right' );
    Back = new BackP();

    if ($(canvas).data('leather') == 1)
    {
        isFullLeather = true;
        $('input[value="wool"], input[value="vinyl"]').closest('label').addClass('closed');
        $('input[value="leather"]').closest('label').trigger('click');
    }

    // calcPrice();

    /** Loading images of the jacket */
    $('img.onload').each(function ()
    {
        if (this.complete)
        {
            imageIsLoaded($(this).get(0));
        }

        $(this).on('load', function ()
        {
            imageIsLoaded($(this).get(0));
        });
    });
});

/** Refresh Events */
/* Обновление состояния канваса при указанных действиях с редактируемыми элементами формы. */
$(document).on('click', '.js-event[type=radio], .js-event[type=checkbox]', reloadWizard);
$(document).on('keyup change focusout', '.js-event[type=text]', reloadWizard);
$(document).on('change', 'select.js-event', reloadWizard);
$(document).on('change', 'input[type=file].js-event', function(){
    LChest.logoReadedData = false;
    reloadWizard();
});

$(document).on('click', '[data-step="6"] .js-event[type=radio], [data-step="6"] .js-event[type=checkbox], [data-step="6"] option.js-event, [data-step="7"] .js-event[type=radio], [data-step="7"] .js-event[type=checkbox], [data-step="7"] option.js-event', function()
{
    var current = $('.current-step');
    var error = checkStep(current);
    completeStep($(this), !error);
});

/* На предпоследнем шаге персонализации при редактировании идет проверка на заполненность всей формы,
   чтобы включить кнопку “Sizing & Finalize” */
$(document).on(
    'click',
    '[data-form="personalise"] [data-step="5"] option.js-event, [data-form="personalise"] [data-step="5"] .js-event[type=radio]',
    checkForSizing
);

/* На предпоследнем шаге персонализации при редактировании идет проверка на заполненность всей формы,
   чтобы включить кнопку “Sizing & Finalize” */
$(document).on(
    'keyup',
    '[data-form="personalise"] [data-step="5"] .js-event[type=text]',
    checkForSizing
);

/* Аналогично с предыдущим шагом включает кнопку “BUY” */
$(document).on('change', '[data-form="personalise"] [data-step="5"] select', checkForBuy);
$(document).on('change', '[data-form="personalise"] [data-step="6"] select', checkForBuy);
$(document).on('keyup change', '[data-form="personalise"] [data-step="5"] input', checkForBuy);
$(document).on('keyup change', '[data-form="personalise"] [data-step="6"] input', checkForBuy);

/* Главный объект отвечающий за прорисовку куртки. */
var html5wizard = function ()
{

    var x = this;
    var b = true; // make a jacket

    x.jacketImageType = 'builder'; //"builder" for make a jacket wizard, "stock" (stock, overstock), "generated" (380x380)

    /** Side images */
    x.front = new Image();
    x.back = new Image();
    x.left = new Image();
    x.right = new Image();

    /**
     * Personalization parts
     * --Patches
     */
    x.lcp = new Image();
    x.rcp = new Image();
    x.lsp = new Image();
    x.ls2p = new Image();
    x.rsp = new Image();
    x.rs2p = new Image();
    x.bp = new Image();

    x.colExc = ['collar_inner', 'hoodie_inner', 'retro_inner'];

    /** Jacket drawing layers by side in queue */
    /* Указывает в каком порядке прорисовываются детали куртки для каждого вида. */
    x.layer = {};
    x.layer.front = [
        'collar_inner', 'hoodie_inner', 'retro_inner',
        'body', 'vinyl_body', 'knit','sleeves', 'vinyl_sleeves', 'inserts', 'snaps', 'pockets',
        'collar', 'retro', 'line', 'stripes', 'feather', 'hoodie'
    ];
    /** side = left */
    x.layer.side = ['body', 'vinyl_body', 'knit', 'sleeves', 'inserts', 'pockets',
        'collar', 'retro', 'line', 'stripes', 'feather', 'hoodie'
    ];
    x.layer.right = x.layer.side;
    x.layer.back = ['body', 'vinyl_body', 'knit', 'sleeves', 'vinyl_sleeves', 'inserts',
        'collar', 'retro', 'line', 'stripes', 'feather', 'hoodie'
    ];

    /**
     *
     * @param background boolean (if true, then jacket is drawing before saving)
     */
    this.start = function ( background )
    {
        x.clear();
        /* background ­ равен TRUE, когда перед сохранением формы запускается прорисовка каждой стороны,
           чтобы фон не был черным. */
        if ( background === true )
        {
            ctx.fillStyle = 'white';
            ctx.fillRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
        }
        /* В зависимости от выбранных параметров, в массив chArr заносятся те детали,
           которые не должны быть отображены при прорисовке куртки. */
        switch (jd.materials.knit.type)
        {
            case 'solid':
                chArr = ['line', 'stripes', 'feather']; /** add names of the parts, which don't need to be drawn */
                break;
            case 'line':
                chArr = ['stripes', 'feather'];
                break;
            case 'stripes':
                chArr = ['line', 'feather'];
                break;
            case 'feather':
                chArr = ['line'];
                break;
        }
        switch (jd.materials.body.collar)
        {
            case 'classic':
                chArr.push('hoodie', 'hoodie_inner', 'retro', 'retro_inner', 'inserts');
                break;
            case 'hoodie':
                chArr.push('retro', 'retro_inner', 'collar', 'collar_inner', 'inserts');
                break;
            case 'retro':
                chArr.push('hoodie', 'hoodie_inner', 'collar', 'collar_inner');
                if (isFullLeather)
                {
                    chArr.push('inserts');
                }
                break;
        }
        switch (jd.materials.snaps.type)
        {
            case 'zipper':
                chArr.push('snaps');
                break;
        }

        switch (jd.materials.body.type)
        {
            default:
                chArr.push('vinyl_body', 'vinyl_sleeves');
                break;
            case 'vinyl':
                chArr.push('body', 'sleeves');
                break;
        }

        switch (jd.materials.sleeves.type)
        {
            default:
                vinylSleeves = false;
                break;
            case 'vinyl':
                vinylSleeves = true;
                break;
        }

        x.print(side);
        x.personalisation(side);
        x.loader(false);
    };

    /* Определяется, если визард “Make a Jacket”.

    Если да, то сперва перекрашиваются детали, а затем запускается start,
     где осуществляется прорисовка куртки и персонализации.

    Если нет, то выключается кнопка Color/Material,
     включается вкладка Personalization и запускается прорисовка в методе start.

    Если происходит редактирование уже сохраненной куртки (атрибут customized), то запускается скрипт подготовки формы
     (добавляет необходимые классы, прячет лишнее, показывает необходимое ­ см. "function startUp()")
     и обновляет визард ­ скрывает ошибки, которых не должно быть, преобразовывает форму в объект.
     Подсчитывает цену. */
    this.load = function ()
    {
        b = $(canvas).data('builder');
        x.jacketImageType = $(canvas).data('jacket-image-type');
        if (b === true || b == 1) // if is make a jacket
        {
            $('#head_personalise').addClass('disabled');
            $('#head_materials').removeClass('disabled').trigger('click');
            $('#menu_materials').find('li').first().trigger('click');
            var ci = 0;

            /**
             * "jo" - serialized jacket object from form
             */

            for (var prop in jo)
            {
                cjo[prop] = {};
                for (var prop2 in jo[prop])
                {
                    var toColor = defColor;
                    if (_is(a = jd.materials[prop2]) && _is(a.color))
                    {
                        toColor = jd.materials[prop2].color;
                    }
                    x.repaint(jo[prop][prop2], toColor, prop, prop2, function ( tmp_detail, prop, prop2 )
                    {
                        cjo[prop][prop2] = tmp_detail;
                        ci++;
                        if (ci == wi.length)
                        {
                            if ($(canvas).data('customized') == 1) /** if is "EDIT" jacket wizard page */
                            {
                                startUp(); /** setting price and open hidden by default blocks */
                                reloadWizard();
                                return false;
                            }
                            $("#canvas-preloader").fadeOut();
                            x.start();
                        }
                    });
                }
            }
        }
        else /** if personalization */
        {
            $('#head_materials').addClass('disabled');
            $('#head_personalise').removeClass('disabled').trigger('click');
            if ($(canvas).data('customized') == 1)
            {
                startUp();
                reloadWizard();
                return false;
            }
            $("#canvas-preloader").fadeOut();
            x.start();
        }
    };

    /* Метод аналогичен предыдущему, но убрано все лишнее ­
       оставлена только перекраска элементов и запуск прорисовки методом start. */
    this.reload = function ( background )
    {
        if (b === true || b == 1) // if is make a jacket
        {
            var ci = 0;
            for (var prop in jo)
            {
                for (var firstKey in jo[prop]) break;
                //x.drawNextLayer(firstKey, prop, jo, background, ci );
                for (var prop2 in jo[prop])
                {
                    var toColor = defColor;
                    if (_is(a = jd.materials[prop2]) && _is(a.color))
                    {
                        toColor = jd.materials[prop2].color;
                    }
                    if (toColor != old_color[prop][prop2] && x.colExc.indexOf(prop2) < 0)
                    {
                        old_color[prop][prop2]= toColor;
                        x.repaint(jo[prop][prop2], toColor, prop, prop2, function ( tmp_detail, prop, prop2 )
                        {
                            cjo[prop][prop2] = tmp_detail;
                            ci++;
                            if (ci == wi.length)
                            {
                                $("#canvas-preloader").fadeOut();
                                x.start( background );
                            }
                        });
                    }
                    else
                    {
                        ci++;
                        if (ci == wi.length)
                        {
                            $("#canvas-preloader").fadeOut();
                            x.start( background );
                        }
                    }
                }
            }
        }
        else
        {
            $("#canvas-preloader").fadeOut();
            x.start( background );
        }
    };


    this.printProperty = false;
    /* Не законченный метод. Предпологалось, что с его помощью будет осуществляться перекраска элементов,
       т.к. сейчас она осуществляется вся разом и нагружает браузер. */
    this.drawNextLayer = function ( property, objectKey, object, background, counter )
    {
        var found = false;
        for (var p in object[objectKey])
        {
            x.printProperty = p;
            if (found === true)
            {
                var toColor =
                    (_is(a = jd.materials[x.printProperty]) && _is(a.color))
                        ? jd.materials[x.printProperty].color : defColor ;

                if (toColor != old_color[objectKey][x.printProperty] && x.colExc.indexOf(x.printProperty) < 0)
                {
                    old_color[objectKey][x.printProperty] = toColor;
                    x.repaint(
                        jo[objectKey][x.printProperty],
                        toColor,
                        objectKey,
                        x.printProperty,
                        function ( tmp_detail, prop, prop2 )
                        {
                            cjo[prop][prop2] = tmp_detail;
                            if (counter == wi.length)
                            {
                                $("#canvas-preloader").fadeOut();
                                x.start( background );
                                return false;
                            }
                            x.drawNextLayer(x.printProperty, objectKey, object);
                            counter++;
                        }
                    );
                }
                else
                {
                    counter++;
                    if (counter == wi.length)
                    {
                        $("#canvas-preloader").fadeOut();
                        x.start( background );
                        return false;
                    }
                }
            }
            if (p == property)
            {
                found = true;
            }
        }
        $("#canvas-preloader").fadeOut();
        x.start( background );
    };

    /** Print Jacket */
    /* Прорисовывается куртка в зависимости от типа визарда.

       Если персонализация, то рисуется изображение стороны куртки, если полный конструктор ­
        рисуются перекрашенные элементы в указанном ранее порядке, исключая указанные ранее элементы. */
    this.print = function ()
    {
        if (b === true || b == 1)
        {
            for (var i=0; i<x.layer[side].length;i++)
            {
                var prop = x.layer[side][i];

                if (chArr.indexOf(prop) > -1)
                {
                    if (!(prop == 'sleeves' && vinylSleeves))
                        continue;
                }
                if (vinylSleeves && prop == 'sleeves' && jd.materials.body.collar != 'retro')
                {
                    prop = 'vinyl_sleeves';
                }
                ctx.drawImage(cjo[side][prop], -cjo[side][prop].width/2, -cjo[side][prop].height/2);
            }
        }
        else
        {
            ctx.drawImage(jo[side], -jo[side].width/2, -jo[side].height/2);
        }
    };

    /** Print Personalisation */
    /* Вызывает методы прорисовки персонализации в зависимости от текущей стороны куртки. */
    this.personalisation = function ( side )
    {
        switch (side)
        {
            case 'front':
                LChest.reload();
                RChest.reload();
                break;
            case 'back':
                Back.reload();
                break;
            case 'side':
                LSleeve.reload();
                break;
            case 'right':
                RSleeve.reload();
                break;
        }
    };

    /** Repainting Jacket Parts */
    /* Перекрашивает указанную деталь в указанный цвет и возвращает в колбеке ее и атрибуты для объекта cjo.
       prop ­ сторона, prop2 ­ элемент (прим. body.sleeves) */
    this.repaint = function ( detail, color, prop, prop2, callback )
    {
        var tmp_detail = new Image();
        x.clear();
        ctx.save();
        ctx.drawImage( detail, -detail.width/2, -detail.height/2 );
        color = x.hex2rgb(color);

        var originalPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var currentPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for(var I = 0, L = originalPixels.data.length; I < L; I += 4)
        {
            if(currentPixels.data[I + 3] > 0) // If it's not a transparent pixel
            {
                if (originalPixels.data[I] != 0)
                {
                    currentPixels.data[I] = originalPixels.data[I] / 255 * color.R;
                    currentPixels.data[I + 1] = originalPixels.data[I + 1] / 255 * color.G;
                    currentPixels.data[I + 2] = originalPixels.data[I + 2] / 255 * color.B;
                }

            }
        }
        ctx.putImageData(currentPixels, 0, 0);

        /** Exception for knit lines on top */
        var lineArr = ['line', 'stripes', 'feather'];
        if (jd.materials.body.collar != 'classic' && lineArr.indexOf(prop2) >= 0)
        {
            x.clear('half');
        }

        tmp_detail.src = canvas.toDataURL();
        tmp_detail.onload = function ()
        {
            callback(tmp_detail, prop, prop2);
        };
        x.clear();
        ctx.restore();
        return tmp_detail;
    };

    /** Converting HEX code to RGB format */
    /* Преобразовывает HEX в RGB, чтобы перекрашивать детали. */
    this.hex2rgb = function ( hex )
    {
        var long = parseInt(hex.replace(/^#/, ""), 16);
        return {
            R: (long >>> 16) & 0xff,
            G: (long >>> 8) & 0xff,
            B: long & 0xff
        };
    };

    /** Clearing Canvas */
    /* Очищает канвас. Если это knit, то очищает на половину ­ только верхнюю часть (opt = half). */
    this.clear = function ( opt )
    {
        var top = canvas.height;
        if (_is(opt) && opt == 'half')
        {
            top = canvas.height/2;
        }
        ctx.clearRect(-canvas.width/2, -canvas.height/2, canvas.width, top);
    };

    /** Show Loading Bar While Wizard is Repainting Images */
    /* Показывает/прячет анимацию загрузки. */
    this.loader = function ( bool, callback )
    {
        var loader = $('#js-loader');
        if (bool)
        {
            loader.show();
        }
        else
        {
            loader.hide();
        }

        var timeout = 0;
        if ($('.current-step').closest('[data-form]').data('form') == 'materials')
        {
            timeout = 250;
        }

        setTimeout(callback, timeout);
    };

    /* Т.к. размер патчей большой, чтобы не расплывался на спине, то этот метод используется,
       чтобы при уменьшении по ширине посчитать высоту и добавить параметры x или y.

       При рисовании патча с их помощью он центруется, если имеет горизонтальную или вертикальную форму. */
    this.getPatchPrintSize = function (patch, size)
    {
        var width = patch.width;
        var height = patch.height;

        var result = {
            width: size,
            height: size,
            x: 0,
            y: 0
        };

        if (width != height)
        {
            var biggest = Math.max(height, width);
            var sides = Math.max( (biggest-height), (biggest-width) );
            var k = biggest/size;
            sides = sides/2/k;

            if (width > height)
            {
                result.y = sides;
            }
            else
            {
                result.x = sides;
            }
            result.width = width/k;
            result.height = height/k;
        }

        return result;

    };
};

/* Вызывается, когда изображение загружено. Определяет, когда необходимо запустить визард. */
function imageIsLoaded (img)
{
    li++;
    var name = $(img).data('name');
    var type = $(img).data('type');

    if (!_is(jo[''+type]))
    {
        jo[''+type] = {};
    }
    if (_is(name))
    {
        jo[''+type][''+name] = img;
    }
    else
    {
        jo[type] = img;
    }

    if (li == wi.length)
    {
        wiz.load();
    }
}

/* Проверка на тип undefined */
function _is($var)
{
    var o = true;
    if (typeof($var) == 'undefined')
        o = false;
    return o;
}

/* Вызывается в методе load, когда куртка уже сохранена и редактируется.

   Преобразовывает форму, чтобы добавить классы checked, открыть необходимые sub­field и отметить шаги как completed
   (в colors/materials). */
function startUp ()
{
    var checkboxes = $('input[type="radio"].js-event:checked');
    checkboxes.each(function ()
    {
        var t = $(this);
        if (_is(t.data('color-id')))
        {
            t.closest('.sub-field').find('.choose-color > .color-icon').css('background-color', t.val()).addClass('checked');
            t.closest('.sub-field').removeClass('closed');
        }

        if (_is(t.data('real-value')))
        {
            t.closest('.patch-label').addClass('checked');
            t.closest('.sub-field').removeClass('closed');
        }
        if (a = t.parent('.has-sub'))
        {
            a.trigger('click');
        }

        if (_is(t.attr('onclick')))
        {
            t.trigger('click');
        }

        var form = t.closest('[data-form]');
        if (form.data('form') == 'materials')
        {
            completeStep(t, true);
        }

    });

    var textfields = $('input[type="text"][value!=""].js-event');
    textfields.each(function()
    {
        var t = $(this);
        if (_is(t.attr('onkeyup')))
        {
            t.trigger('keyup');
        }
    });
}

/** Reloading Wizard With New Values */
/* Преобразует форму в объект и перезагружает канвас. */
function reloadWizard ()
{
    var t = $(this);
    var f_error = $(document).find('[data-check-for="'+ t.attr('name')+'"]');
    if (_is(f_error) && (t.is(':checked') || t.is(':selected')) || (t.get(0).nodeName == 'SELECT' && t.val()!=""))
    {
        f_error.addClass('closed');
    }

    var form = document.getElementById("wizard-editor-form");
    jd = $(form).serializeObject();
    afterSerialize();
    wiz.loader(true, function ()
    {
        wiz.reload();
    });

    var section = t.closest('[data-step]');
    var error = checkStep( section );
    activateButton( section, !error );

    calcPrice();
}

/** Prepare Jacket Material Object for Drawing */
/* Вызывается, чтобы назначить переменные “по умолчанию”, если в форме еще они не выбраны. */
function afterSerialize ()
{
    if (!_is(jd.materials)) jd.materials = {};
    if (!_is(jd.materials.body )) jd.materials.body = {};
    if (!_is(jd.materials.vinyl_body )) jd.materials.vinyl_body = {};
    if (!_is(jd.materials.sleeves )) jd.materials.sleeves = {};
    if (!_is(jd.materials.vinyl_sleeves )) jd.materials.vinyl_sleeves = {};
    if (!_is(jd.materials.knit )) jd.materials.knit = {};
    if (!_is(jd.materials.line )) jd.materials.line = {};
    if (!_is(jd.materials.stripes )) jd.materials.stripes = {};
    if (!_is(jd.materials.feather )) jd.materials.feather = {};
    if (!_is(jd.materials.pockets )) jd.materials.pockets = {};
    if (!_is(jd.materials.snaps )) jd.materials.snaps = {};

    if (!_is(jd.materials.body.color )) jd.materials.body.color = defColor;
    if (!_is(jd.materials.sleeves.color )) jd.materials.sleeves.color = defColor;

    if (!_is(jd.materials.vinyl_body.color )) jd.materials.vinyl_body.color = defColor;
    if (!_is(jd.materials.vinyl_sleeves.color )) jd.materials.vinyl_sleeves.color = defColor;

    if (!_is(jd.materials.knit.color )) jd.materials.knit.color = defColor;
    if (!_is(jd.materials.line.color )) jd.materials.line.color = defColor;
    if (!_is(jd.materials.stripes.color )) jd.materials.stripes.color = defColor;
    if (!_is(jd.materials.feather.color )) jd.materials.feather.color = defColor;
    if (!_is(jd.materials.pockets.color )) jd.materials.pockets.color = defColor;
    if (!_is(jd.materials.snaps.color )) jd.materials.snaps.color = defColor;

    if (!_is(jd.materials.knit.type )) jd.materials.knit.type = 'solid'; //line, stripes, feather
    if (!_is(jd.materials.body.collar )) jd.materials.body.collar = 'classic';
    if (!_is(jd.materials.snaps.type )) jd.materials.snaps.type = 'snaps';

    switch (jd.materials.body.type)
    {
        case 'leather':
            if(_is(jd.materials.body.leather_color))
            {
                jd.materials.body.color = jd.materials.body.leather_color;
            }
            break;
        case 'wool':
            if(_is(jd.materials.body.wool_color))
            {
                jd.materials.body.color = jd.materials.body.wool_color;
            }
            break;
        case 'vinyl':
            if(_is(jd.materials.body.vinyl_color))
            {
                jd.materials.body.color = jd.materials.body.vinyl_color;
                jd.materials.vinyl_body.color = jd.materials.body.color;
            }
            break;
    }

    switch (jd.materials.sleeves.type)
    {
        case 'leather':
            if(_is(jd.materials.sleeves.leather_color))
            {
                jd.materials.sleeves.color = jd.materials.sleeves.leather_color;
            }
            break;
        case 'wool':
            if(_is(jd.materials.sleeves.wool_color))
            {
                jd.materials.sleeves.color = jd.materials.sleeves.wool_color;
            }
            break;
        case 'vinyl':
            if(_is(jd.materials.sleeves.vinyl_color))
            {
                jd.materials.sleeves.color = jd.materials.sleeves.vinyl_color;
                jd.materials.vinyl_sleeves.color = jd.materials.sleeves.color;
            }
            break;
    }

    switch (jd.materials.pockets.type)
    {
        case 'leather':
            if(_is(jd.materials.pockets.leather_color))
            {
                jd.materials.pockets.color = jd.materials.pockets.leather_color;
            }
            break;
        case 'wool':
            if(_is(jd.materials.pockets.wool_color))
            {
                jd.materials.pockets.color = jd.materials.pockets.wool_color;
            }
            break;
        case 'vinyl':
            if(_is(jd.materials.pockets.vinyl_color))
            {
                jd.materials.pockets.color = jd.materials.pockets.vinyl_color;
            }
            break;
    }

    if(_is(jd.materials.knit.solid_color))
    {
        jd.materials.knit.color = jd.materials.knit.solid_color;
    }

    if(_is(jd.materials.knit.line_color))
    {
        jd.materials.line.color = jd.materials.knit.line_color;
    }

    if(_is(jd.materials.knit.stripes_color))
    {
        jd.materials.stripes.color = jd.materials.knit.stripes_color;
    }

    if(_is(jd.materials.knit.feather_color))
    {
        jd.materials.feather.color = jd.materials.knit.feather_color;
    }

    jd.materials.collar = {};
    jd.materials.hoodie = {};
    jd.materials.retro = {};
    jd.materials.inserts = {};

    jd.materials.hoodie.color = jd.materials.body.color;
    jd.materials.retro.color = jd.materials.body.color;
    jd.materials.inserts.color = jd.materials.sleeves.color;
    if (jd.materials.body.collar == 'retro')
    {
        if (!isFullLeather)
        {
            jd.materials.sleeves.color = jd.materials.body.color;
        }
    }
    if (jd.materials.body.collar == 'classic')
    {
        jd.materials.collar.color = jd.materials.knit.color;
    }
}

/** Generating Materials Old Colors Object */
/* Генерирует объекты для предыдущих цветов,
   чтобы при перекраске сравнивать и пропускать те детали, которые не изменились. */
function genOldColors ()
{
    old_color.front = {};
    old_color.side = {};
    old_color.right = {};
    old_color.back = {};
    for (var prop in jd.materials)
    {
        old_color.front[prop] = '';
        old_color.side[prop] = '';
        old_color.right[prop] = '';
        old_color.back[prop] = '';
    }
}

/* Проверяет символ на то, является ли он цифрой. */
function isNumeric (char)
{
    var r = false;
    if (!isNaN( parseInt(char) ))
    {
        r = true;
    }

    return r;
}

$('input[name="personalisation[back][script][text]"]').on('change keyup paste click', function(){
    $(this).val($(this).val().toLowerCase().replace(/\b[a-z]/g, function(letter) {
        return letter.toUpperCase();
    }));
});
