var BackP = function ()
{
    var x = this;
    var type;
    var defFont = 'AthleticBlock';

    x.first = {};
    x.second = {};
    x.third = {};

    x.first.text = '';
    x.first.font = '';
    x.first.color_type = 0;
    x.first.color = '';
    x.first.outline = '';

    x.second.text = '';
    x.second.font = '';
    x.second.color_type = 0;
    x.second.color = '';
    x.second.outline = '';

    x.third.text = '';
    x.third.font = '';
    x.third.color_type = 0;
    x.third.color = '';
    x.third.outline = '';

    x.script = {};

    x.patch = new Image();
    x.type = '';

    this.reload = function ()
    {
        type = jd.materials.body.collar;
        if (_is(a = jd.personalisation) && _is(b = a.back))
        {
            x.type = b.type;

            x.first.text = _is(b.first) ? b.first.text : '';
            x.first.font = (_is(c = b.first) && _is(c.font) && c.font !='') ? c.font : defFont;
            x.first.color_type = (_is(c = b.first) && _is(c.color_type)) ? c.color_type : 0;
            x.first.color = (_is(c = b.first) && _is(c.color)) ? c.color : defColor;
            x.first.outline = (_is(c = b.first) && _is(c.outline)) ? c.outline : defColor;

            x.second.text = _is(b.second) ? b.second.text : '';
            x.second.font = (_is(c = b.second) && _is(c.font) && c.font !='') ? c.font : defFont;
            x.second.color_type = (_is(c = b.second) && _is(c.color_type)) ? c.color_type : 0;
            x.second.color = (_is(c = b.second) && _is(c.color)) ? c.color : defColor;
            x.second.outline = (_is(c = b.second) && _is(c.outline)) ? c.outline : defColor;

            x.third.text = _is(b.third) ? b.third.text : '';
            x.third.font = (_is(c = b.third) && _is(c.font) && c.font !='') ? c.font : defFont;
            x.third.color_type = (_is(c = b.third) && _is(c.color_type)) ? c.color_type : 0;
            x.third.color = (_is(c = b.third) && _is(c.color)) ? c.color : defColor;
            x.third.outline = (_is(c = b.third) && _is(c.outline)) ? c.outline : defColor;

            x.script.text = (_is(b.script)) ? b.script.text : '';
            x.script.color_type = (_is(a = b.script) && _is(a.color_type)) ? a.color_type : 0;
            x.script.font = 'Script';
            x.script.color = (_is(c = b.script) && _is(c.color)) ? c.color : defColor;
            x.script.outline = (_is(c = b.script) && _is(c.outline)) ? c.outline : defColor;
            x.script.insert = (_is(a = b.script)) ? a.insert_text : '';
            x.script.ins_color = (_is(c = b.script) && _is(c.insert_color)) ? c.insert_color : defColor;

            var sc = x.script;

            switch (x.type)
            {
                case 'script':
                    if (sc.text.length > 2)
                    {
                        var left = 0;
                        top = -40;
                        size = 100;
                        var tail_font = "Tahoma";
                        var tail_font_size = 12;
                        var tail_width;

                        var max_lw = 180;
                        var prop;

                        ctx.font = "normal " + size + "px \"" + sc.font + "\"";

                        var line1_width = ctx.measureText(sc.text).width;
                        if (line1_width > max_lw)
                        {
                            prop = max_lw/line1_width;
                            size = 100 * prop;
                        }
                        else
                        {
                            prop = 1;
                        }

                        if (sc.text.length > 2)
                        {
                            ctx.font = "normal " + size + "px \"" + sc.font + "\"";

                            line1_width = ctx.measureText(sc.text).width;
                            var scale_X = line1_width / 290 / prop - 0.1; // Tail width on 100px font size
                            var fromLeftTail = (line1_width/2 + left)/scale_X;

                            ctx.textAlign = "center";
                            ctx.fillStyle = sc.color;
                            ctx.strokeStyle = sc.outline;

                            if (sc.color_type == 1)
                            {
                                ctx.strokeText(sc.text, left, top);

                                ctx.scale(scale_X, 1);
                                ctx.strokeText("\\", fromLeftTail, top);
                                ctx.scale(1/scale_X, 1);
                            }

                            ctx.fillText(sc.text, left, top);
                            ctx.scale(scale_X, 1);

                            tail_width = ctx.measureText("\\");

                            ctx.fillText("\\", fromLeftTail, top);
                            ctx.scale(1/scale_X, 1);

                            var additive_up = (sc.text.length > 7 && sc.text.length < 19) ? 2 : 0;

                            if (sc.text.length)
                            {
                                ctx.save();

                                var angle = -0.25;
                                if (sc.insert.length > 7)
                                {
                                    tail_font_size = 10;

                                    if (sc.insert.length > 10)
                                    {
                                        tail_font_size = 8;
                                        if (sc.insert.length > 12)
                                        {
                                            tail_font_size = 6;
                                        }
                                    }
                                }


                                if (sc.text.length > 3)
                                {
                                    angle = -0.2;

                                    if (sc.insert.length > 10)
                                    {
                                        tail_font_size = 10;
                                        if (sc.insert.length > 14)
                                        {
                                            tail_font_size = 8;
                                        }
                                    }

                                    if (sc.text.length > 5)
                                    {
                                        additive_up = 4;
                                        if (sc.insert.length < 8)
                                        {
                                            additive_up = 2;
                                        }
                                        angle = -0.1;
                                        if (sc.text.length > 7)
                                        {
                                            angle = -0.08;
                                            additive_up = 4;

                                            if (sc.text.length > 8)
                                            {
                                                angle = -0.05;
                                                tail_font_size = 10;
                                                if (sc.insert.length > 11)
                                                {
                                                    tail_font_size = 8;
                                                }
                                            }

                                            if (sc.text.length > 10)
                                            {
                                                tail_font_size = 8;
                                                if (sc.insert.length > 10)
                                                {
                                                    tail_font_size = 6;
                                                }
                                                angle = -0.05;
                                                if (sc.text.length > 12)
                                                {
                                                    angle = -0.04;
                                                    tail_font_size = 5;
                                                    if (sc.text.length > 14)
                                                    {
                                                        angle = -0.02;
                                                        additive_up = 2;
                                                        if (sc.text.length > 18)
                                                        {
                                                            angle = -0.02;
                                                            additive_up = 0;
                                                        }
                                                    }
                                                }
                                            }

                                        }
                                    }
                                }

                                ctx.rotate(angle);

                                ctx.fillStyle = sc.ins_color;
                                ctx.font = "normal " + tail_font_size + "px \"" + tail_font + "\"";

                                var tailFromTop = -30;

                                ctx.fillText(sc.insert, 16, tailFromTop + 30 * prop - 0.5 * (sc.text.length - 6) - additive_up);

                                ctx.restore();
                            }
                        }
                    }
                    break;
                case 'lines':
                    if (x.first.text.length > 2)
                    {
                        x.drawRow(x.first, -90);
                        if (x.second.text.length > 2)
                        {
                            x.drawRow(x.second, -30);
                            if (x.third.text.length > 2)
                            {
                                x.drawRow(x.third, 30);
                            }
                        }
                    }
                    break;
                case 'text_p':
                    var size = 170;
                    var top = -110;
                    if (x.first.text.length > 2)
                    {
                        x.drawRow(x.first, -90);
                        size = 140;
                        top = -80;
                    }
                    if (_is(x.patch))
                    {
                        x.drawPatch(size, top);
                    }
                    break;
                case 'patch':
                    if (_is(x.patch))
                    {
                        x.drawPatch(170, -110);
                    }
                    break;
            }
        }
    };

    this.drawRow = function ( data, top )
    {
        if (_is(a = jd.materials) && _is(b = a.body) && _is(c = b.collar) && c == 'hoodie')
        {
            top += 20;
        }
        var size = (data.font == 'oldenglish') ? 130 : 50;
        if (data.text.length > 7)
        {
            var k = (data.font == 'oldenglish') ? 0 : (data.text.length-7)*0.36*size/10;
            size = size - (data.text.length-7)*size/10 + k;
        }
        ctx.textAlign = 'center';
        ctx.font = size + 'px ' + fonts[data.font];
        ctx.fillStyle = data.color;
        ctx.strokeStyle = data.outline;
        if (data.color_type == 1)
        {
            ctx.strokeText(data.text, 0, top);
        }
        ctx.fillText(data.text, 0, top);
        ctx.textAlign = 'start';
    };

    this.drawPatch = function (size, top)
    {
        var custom;
        if (x.patch.src.toString().indexOf(jd.personalisation.back.patch.toString()) < 0)
        {
            x.patch.src = jd.personalisation.back.patch;
            x.patch.onload = function ()
            {
                custom = wiz.getPatchPrintSize(x.patch, size);
                ctx.drawImage(x.patch, -custom.width/2 + custom.x, top + custom.y, custom.width, custom.height);
            }
        }
        else
        {
            custom = wiz.getPatchPrintSize(x.patch, size);
            ctx.drawImage(x.patch, -custom.width/2 + custom.x, top + custom.y, custom.width, custom.height);
        }
    }
};