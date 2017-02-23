var RightChest = function ()
{
    var x = this;
    x.first = {};
    x.second = {};
    x.first.text = '';
    x.first.font = 'AthleticBlock';
    x.first.color = '';
    x.second.text = '';
    x.second.font = 'AthleticBlock';
    x.second.color = '';
    x.patch = new Image();

    this.reload = function ()
    {
        if (_is(a = jd.personalisation) && _is(b = a.right_chest))
        {
            x.first.text = b.first.text;
            x.first.font = (b.first.font != '') ? b.first.font : 'problock';
            x.first.color = (_is(b.first.color)) ? b.first.color : defColor;

            x.second.text = b.second.text;
            x.second.font = (b.second.font != '') ? b.second.font : 'problock';
            x.second.color = (_is(b.second.color)) ? b.second.color : defColor;
        }

        var b = (jd.personalisation) ? jd.personalisation.right_chest : { type: '' };

        x.print(b);
    };

    this.print = function (b)
    {
        if (b.type == 'patch')
        {
            if (_is(b.patch))
            {
                if (x.patch.src.toString().indexOf(b.patch.toString()) < 0)
                {
                    x.patch.src = b.patch;
                    x.patch.onload = x.drawPatch();
                }
                else
                {
                    x.drawPatch();
                }
            }
        }
        else
        {
            if (_is(x.first.text) && x.first.text.length)
            {
                x.drawLetters(x.first, -80);
                if (x.second.text.length)
                {
                    x.drawLetters(x.second, -60);
                }
            }
        }
    };

    this.drawPatch = function ()
    {
        var custom = wiz.getPatchPrintSize(x.patch, 64);
        ctx.drawImage(x.patch, -90 + custom.x, -110 + custom.y, custom.width, custom.height);
    };

    this.drawLetters = function ( str, top )
    {
        var size = (str.font == 'script') ? 14 : 12;
        if(str.text.length>12 && str.text.length<=15){
            size = (str.font == 'script') ? 12 : 10;
        }
        if(str.text.length>15 && str.text.length<=20){
            size = (str.font == 'script') ? 10 : 8;
        }
        if(str.text.length>20){
            size = (str.font == 'script') ? 8 : 6;
        }
        ctx.font = "normal "+size+"px \"" + fonts[str.font] + "\"";
        ctx.fillStyle = str.color;
        ctx.textAlign = "center";
        ctx.fillText(str.text, -60, top );
    };
};
