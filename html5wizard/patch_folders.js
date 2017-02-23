/* При загрузке страницы клонирует патчи с атрибутами data­categories/data­sub­categories в папки data­folder. */
$(document).on('ready', function ()
{

    var dummyFolder = $('.dummy-folder');
    var patchBlocks = $('.patch-block');

    patchBlocks.each(
        function ()
        {
            var t = $(this);
            var patches = t.find('.patch-label');
            var clone = dummyFolder.clone();
            clone.removeClass('dummy-folder');



            t.prepend( clone );
            patches.each(
                function ()
                {
                    var p = $(this);
                    var cats = p.data('categories');
                    var sub = p.data('sub-categories');

                    var f = 0;

                    if (_is(cats) && cats != '')
                    {
                        f = (cats.toString().indexOf(",") >= 0) ? cats.toString().split(",") : [ cats ];
                    }

                    if (_is(sub) && sub != '')
                    {
                        f = (sub.toString().indexOf(",") >= 0) ? sub.toString().split(",") : [ sub ];
                    }

                    if (f != 0)
                    {
                        for ( var i=0; i<f.length; i++ )
                        {
                            var folder = t.find('[data-folder="' + f[i] + '"]');
                            if (folder.length > 0)
                            {
                                folder.append(p.clone());
                                var index  = folder.data('folder');
                                $(document).find('[data-folder-id="'+index+'"]').removeClass('hidden-folder');
                            }
                        }
                    }
                }
            );
        }
    );

});

/* При нажатии на папку показывает ее патчи. */
$(document).on('click', '.folder-open-sub', function (e)
{
    e.preventDefault();

    var t = $(this);
    var parent = t.parent();

    var folderID = t.data('folder-id');
    var folder = parent.children('[data-folder="' + folderID + '"]');
    var back = parent.children('.folder-back');

    parent.children().addClass('closed');
    folder.removeClass('closed');

});

/* При нажатии возвращается назад (к списку папок) */
$(document).on('click', '.folder-back', function (e)
{
    e.preventDefault();

    var t = $(this);
    var folder = t.closest('.folder');
    var outerFolder = folder.parent();

    outerFolder.children().removeClass('closed');
    outerFolder.children('.folder').addClass('closed');
    folder.addClass('closed');

});

/** Just For Test / Is old version on Live */
