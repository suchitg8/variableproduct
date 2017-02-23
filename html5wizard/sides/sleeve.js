var Sleeve = function ( side )
{
    side = side.replace('side', 'left');
    var left = (side == 'left') ? 14 : -10;
    if ($(canvas).data('builder') == 0)
    {
        left = (side == 'left') ? 28 : -32;
    }

    var x = this;
    x.first = {};
    x.second = {};
    x.first.text = '';
    x.first.font = 'AthleticBlock';
    x.first.color = '';
    x.first.outline = '';
    x.second.text = '';
    x.second.font = 'AthleticBlock';
    x.second.color = '';
    x.second.outline = '';
    x.first.patch = new Image();
    x.second.patch = new Image();

    this.reload = function ()
    {
        ctx.save();
        var rotate = (side == 'left') ? -0.1 : 0.1;
        //ctx.rotate(rotate);
        if (_is(a = jd.personalisation) && _is(b = a[side+'_sleeve']))
        {
            x.first.text = b.first.text;
            x.first.font = (b.first.font != '') ? b.first.font : defFont;
            x.first.color_type = _is(b.first.color_type) ? b.first.color_type : '';
            x.first.color = (_is(b.first.color)) ? b.first.color : defColor;
            x.first.outline = (_is(b.first.outline)) ? b.first.outline : defColor;
            x.first.type = (_is(b.first.type)) ? b.first.type : '';

            x.second.text = b.second.text;
            x.second.font = (b.second.font != '') ? b.second.font : defFont;
            x.second.color_type = _is(b.second.color_type) ? b.second.color_type : '';
            x.second.color = (_is(b.second.color)) ? b.second.color : defColor;
            x.second.outline = (_is(b.second.outline)) ? b.second.outline : defColor;
            x.second.type = (_is(b.second.type)) ? b.second.type : '';
        }

        x.print();
        ctx.restore();
    };

    this.print = function ()
    {
        var isFirst = false;
        if (x.first.type != '')
        {
            if (x.first.type == 'text' && x.first.text.length)
            {
                x.drawRow(x.first, left, -70);
                isFirst = true;
            }
            if (x.first.type == 'patch' && _is(jd.personalisation[side+'_sleeve'].first.patch))
            {
                x.drawPatch('first');
                isFirst = true;
            }

            if (isFirst)
            {
                if (x.second.type == 'text' && x.second.text.length)
                {
                    x.drawRow(x.second, left, -26);
                }
                if (x.second.type == 'patch' && _is(jd.personalisation[side+'_sleeve'].second.patch))
                {
                    x.drawPatch('second');
                }
            }
        }
    };

    this.drawPatch = function (type )
    {
        ctx.save();

        switch(wiz.jacketImageType){
            case 'stock':
                var coords = {
                    'left' : {
                        'first' : [-8, -130],
                        'second': [-8, -66]
                    },
                    'right' : {
                        'first' : [-66, -130],
                        'second': [-66, -66]
                    }
                };
                break;
            case 'generated':
                var coords = {
                    'left' : {
                        'first' : [-8, -110],
                        'second': [-8, -46]
                    },
                    'right' : {
                        'first' : [-8, -110],
                        'second': [-8, -46]
                    }
                };
                break;
            case 'builder':
                coords = {
                    'left' : {
                        'first' : [-14, -130],
                        'second': [-14, -66]
                    },
                    'right' : {
                        'first' : [-44, -130],
                        'second': [-44, -66]
                    }
                };
                break;
        }





        if ($(canvas).data('builder') == 1)
        {

        }

        if (_is(a = jd.personalisation) && _is(b = a[side+'_sleeve']))
        {
            if (x[type].patch.src.toString().indexOf(b[type].patch.toString()) < 0)
            {
                x[type].patch.src = b[type].patch;
                x[type].patch.onload = function ()
                {
                    var custom = wiz.getPatchPrintSize(x[type].patch, 64);
                    ctx.drawImage(x[type].patch, coords[side][type][0] + custom.x, coords[side][type][1] + custom.y, custom.width, custom.height );
                    ctx.restore();
                }
            }
            else
            {
                var custom = wiz.getPatchPrintSize(x[type].patch, 64);
                ctx.drawImage(x[type].patch, coords[side][type][0] + custom.x, coords[side][type][1] + custom.y, custom.width, custom.height );
                ctx.restore();
            }
        }
    };

    this.drawRow = function ( data, x, y )
    {
        var size = 50;

        ctx.textAlign = 'center';
        ctx.font = size + 'px ' + fonts[data.font];
        ctx.fillStyle = data.color;
        ctx.strokeStyle = data.outline;
        if (data.color_type == 1)
        {
            ctx.strokeText(data.text, x, y);
        }
        ctx.fillText(data.text, x, y);
        ctx.textAlign = 'start';
    };

};