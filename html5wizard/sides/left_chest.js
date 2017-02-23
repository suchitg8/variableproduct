var LeftChest = function ()
{
    var x = this;
    this.text = '';
    this.font = 'AthleticBlock';
    this.color = '';
    this.outline = '';
    this.patch = new Image();
    this.logo = new Image();
    this.logoReadedData = false;


    this.reload = function ()
    {
        ctx.textAlign = "start";
        if (_is(a = jd.personalisation) && _is(b = a.left_chest))
        {
            x.text = b.text;
            x.font = (b.font != '') ? b.font : defFont;
            x.color = (_is(b.color)) ? b.color : defColor;
            x.outline = (_is(b.outline)) ? b.outline : defColor;
        }

        var b = (jd.personalisation) ? jd.personalisation.left_chest : {type:''};

        x.print(b);
    };

    this.print = function (b)
    {
        switch(b.type){
            case 'patch':
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
                break;
            case 'text':
                if (x.text.length)
                {
                    if (jd.personalisation.left_chest.color_type == 1)
                    {
                        x.drawLetters(true);
                    }
                    x.drawLetters(false);
                }
                break;
            case 'logo':
                if(x.logoReadedData){
                    if(x.logo.src != this.logoReadedData){
                        x.logo.src = this.logoReadedData;
                    }
                    x.drawLogo();
                }else{
                    var fileinput = $('input[name="personalisation[left_chest][logo]"]')[0];
                    if (fileinput.files && fileinput.files[0]) {
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            if(e.target.result.indexOf('data:image/')!==-1){
                                x.logo.src = e.target.result;
                                x.logoReadedData = e.target.result;
                                x.logo.onload = function() {
                                    x.drawLogo();
                                }
                            }
                        }
                        reader.readAsDataURL(fileinput.files[0]);
                    }
                }
                break;
        }

    };

    this.drawLogo = function(){
        if(x.logo.height < 100
            || x.logo.width < 100
        ){
            alert('Image size too small!');
            $('input[name="personalisation[left_chest][logo]"]')[0].value = '';
            x.logoReadedData = false;
            return false;
        }
        if(x.logo.height > 4000
            || x.logo.width > 4000
        ){
            alert('Image size too big!');
            $('input[name="personalisation[left_chest][logo]"]')[0].value = '';
            x.logoReadedData = false;
            return false;
        }
        var width = 64;
        var height = parseInt(x.logo.height * width / x.logo.width);
        ctx.drawImage(x.logo, 30, -110, width, height);
    }

    this.drawPatch = function ()
    {
        var custom = wiz.getPatchPrintSize(x.patch, 64);
        switch(wiz.jacketImageType){
            case 'generated':
                ctx.drawImage(x.patch, 15 + custom.x, -100 + custom.y, custom.width, custom.height);
                break;
            case 'stock':
            case 'builder':
                ctx.drawImage(x.patch, 30 + custom.x, -110 + custom.y, custom.width, custom.height);
                break;
        }

    };

    this.drawLetters = function (type)
    {
        var size = 90;
        var top, left = 40;
        if (x.text.length == 2) size = 60;
        if (x.text.length == 3) size = 40;

        switch(x.text.length)
        {
            default:
                size = 100; top = -40;
                if (x.font == "script")
                {
                    size = 90; top = -46; left = 30;
                }
                if (x.font == "oldenglish") { size = 260; }
                break;
            case 2:
                size = 60;  top = -84;
                if (x.font == "oldenglish") { size = 150; }
                break;
            case 3:
                size = 44;  top = -90;
                if (x.font == "oldenglish") { size = 100; }
                break;
        }

        if(wiz.jacketImageType == 'generated'){
            top += 20;
            left -= 15;
        }

        ctx.font = size + 'px ' + fonts[x.font];
        ctx.strokeStyle = x.outline;
        ctx.fillStyle = x.color;
        var ff = 0;
        for (var i=0; i<x.text.length; i++)
        {
            var l = 0, t = 0;
            switch (i)
            {
                default:
                    l = 0;  t = 0;
                    if (x.text.length == 2)
                    {
                        t = 16;
                    }
                    break;
                case 1:
                    l = 20; t = 39;
                    if (x.font == "problock") { l = 16; }
                    if (x.font == "script") { l = 8; }
                    if (x.font == "oldenglish") { t = 34; }
                    if (isNumeric(x.text.charAt(0)))
                    {
                        t = 0;
                        l = 30;
                    }
                    if (x.text.length<3)
                    {
                        break;
                    }
                case 2:
                    l = 16; t = 30;
                    if (x.font == "problock") { l = 12; t = 28; }
                    if (x.font == "script") { l = 10; t = 25; }
                    if (x.font == "oldenglish") { l = 13; t = 24; }
                    break;
            }

            left += l;
            top += t;
            if (type)
            {
                ctx.strokeText( x.text[i], left + ff, top );
            }
            else
            {
                ctx.fillText(x.text[i], left + ff, top);
            }
        }
    };
};