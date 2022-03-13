/*
Syntax of Mogli tags:
#image [/] name: castle / size: 5 / destroyer: true / maybe:true / text: Dunno. But maybe. [/]

Commands can also define "special_commands".
These are just keys that do not need a value
(but only when used for this command). If these special commands are provided
without colon and value they are just initialized to the string "yes"

All other keys are initialized to the string (!) of value.

*/

class MogliManager {
    constructor(story, continueStory) {
        /* story: the ink story */
        this.story = story
        this.continueStory = continueStory

        this.item_separator = "/"
        this.prop_separator = ":"
        this.commands = {}
        this.load_commands()
        this.yes = "yes"
        this.no = "no"
        window.onerror = this.on_error.bind(this)
        this.sounds = {}

        let info = {
            story: this.story,
            continueStory: this.continueStory,
        }
        window.info = info

        this.text = {}
        this.text.created_with = `Created with Ink / Mogli.`
        this.text.find_out_more_about_ink = `Find out more about INK`
        this.text.close = "Close"

        window.set_text = this.set_text.bind(this)

    }

    set_text(prop, text) {
        this.text[prop] = text
    }

    on_error(e) {
        console.log("ERROR", e)
        document.body.innerHTML = e
    }

    add_command(names, command) {
        for (let name of names) {
            this.commands[name] = command
        }
    }

    load_commands() {
        this.add_command(["image", "img"], {
            do_command_id: "image",
            special_props: {
                //center: true,
            }
        })

        this.add_command(["audio"], {
            do_command_id: "audio",
            special_props: {mute: true, loop: true,}
        })

        this.add_command(["stop_audio"], {
            do_command_id: "stop_audio",
        })

        this.add_command(["pause_audio"], {
            do_command_id: "pause_audio",
        })

        this.add_command(["resume_audio"], {
            do_command_id: "resume_audio",
        })

        this.add_command(["resume_audio"], {
            do_command_id: "resume_audio",
        })

        this.add_command(["simple_input"], {
            do_command_id: "simple_input",
            special_props: {
                "disabled": true, "focus": true ,
                "uppercase": true , "lowercase": true ,
                "capitalize": true , "capitalise": true ,
                "live": true , "trim": true,
            },
        })

    }

    do_command_simple_input(text, param, ctx) {
        function process_val(val) {
            if (param.trim) val = val.trim()
            if (param.uppercase) {
                val = val.toUpperCase();
            } else if (param.lowercase) {
                val = val.toLowerCase();
            } else if (param.capitalize || param.capitalise) {
                val = val.substr(0, 1).toUpperCase() +
                    val.substr(1).toLowerCase();
            }
            return val
        }

        if (!param.max) param.max = 16

        let allowed = false
        if (param.allowed) {
            allowed = new Set(param.allowed.split(""))
            console.log(allowed)
        }

        let lst = ["disabled", "focus", "uppercase", "lowercase",
            "capitalize", "capitalise", "live", "trim"]
        for (let x of lst) {
            param[x] = this.normalize_yes(param[x])
        }

        let var_name = param.var
        let inputElement = document.createElement('input');
        inputElement.classList.add("tag-input");
        let vv = this.story.variablesState[var_name]
        inputElement.value = process_val(vv);
        inputElement.maxLength = param.max
        if (param.disabled) inputElement.disabled = true;
        inputElement.spellcheck = false
        ctx.storyContainer.appendChild(inputElement);
        if (param.focus) inputElement.focus();
        ctx.showAfter(ctx.get_delay(), inputElement)
        ctx.incr_delay(200.0)

        inputElement.addEventListener("input", () => {
            let val = inputElement.value;
            val = process_val(val)
            /* prevent HTML injection: */
            val = val.replace(/</g, "").replace(/>/g, "");
            if (allowed) {
                val = val.replace(/./g, (char) => {
                    if ( allowed.has(char) ) return char
                    return ""
                })
            }
            if (param.live) inputElement.value = val
            this.story.variablesState[param.var] = val;
        })
    }




    normalize_yes(x) {
        if (x === "yes") return true
        if (x === "no") return false
        return !!x
    }

    do_command_resume_audio(text, param, ctx) {
        let sound = this.sounds[param.id]
        if (!sound) return
        sound.play()
    }

    do_command_pause_audio(text, param, ctx) {
        let sound = this.sounds[param.id]
        if (!sound) return
        sound.pause()
    }

    do_command_stop_audio(text, param, ctx) {
        let sound = this.sounds[param.id]
        if (!sound) return //could throw error, but currently just ignores
        //because it would be a bit too strict to throw error (what if you don't
        //know whether the sound is still playing?)
        sound.stop()
    }

    do_command_audio(text, param, ctx) {
        let name = param.name
        let audio = $_ASSETS[name]
        if (!audio) {
            this.mild_error(text, `No audio with name <b>${name}</b> found.`)
            return
        }
        if (audio.type !== "audio") {
            this.mild_error(text, `Asset with name <b>${name}</b> is not an audio.`)
            return            
        }

        if (!param.volume && param.volume != 0) param.volume = 1.0 //default value if unspecified
        if (!param.mute && param.mute != 0) param.mute = false //default value if unspecified

        let sound = new Howl({
            src: audio.data,
            volume: Number(param.volume),
            loop: this.normalize_yes(param.loop),
            mute: this.normalize_yes(param.mute),
        })

        sound.play()

        if (param.id) this.sounds[param.id] = sound
    }

    do_command_image(text, param, ctx) {
        let name = param.name
        let img = $_ASSETS[name]
        if (!img) {
            this.mild_error(text, `No image with name <b>${name}</b> found.`)
            return
        }
        if (img.type !== "image") {
            this.mild_error(text, `Asset with name <b>${name}</b> is not an image.`)
            return            
        }

        let image_el = document.createElement('img')
        ctx.storyContainer.appendChild(image_el)
        image_el.src = img.data
        ctx.showAfter(ctx.get_delay(), image_el)
        ctx.incr_delay(200.0)

    }


    mild_error(...args) {
        //you should only use mild_error if ignoring the error
        //would be a feasible option, for example in the case
        //of a tag command that is not recognized, the tag could be just
        //ignored or an error could be thrown.
        //currently we treat mild_errors just like errors, though 
        this.error(...args)
    }

    error (line_text, msg) {
        let el = document.getElementById("error-notifier")
        if (!el) return
        let m = `<p class="error-notifier-p"><b>Error at line:</b> <i>${line_text}</i></p>
            <p class="error-notifier-p">${msg}</p>
        `
        /*             <button
            onclick='document.getElementById("error-notifier").style.display = "none"'>
            Okay</button> */
        el.style.display = "block"
        el.innerHTML = m
        throw msg
    }

    process_tags(tags, ctx) {
        for (let tag of tags) {
            let res = this.parse_tag(tag)
            if (!res) continue
            this.perform_command(tag, res.command, res.key_value_store, ctx)
        }
    }


    inside_iframe () {
        try {
            return window.top !== window.self
        } catch (e) {
            return true
        }
    }



    show_about() {
        let href = `https://www.inklestudios.com/ink`
        if (this.inside_iframe()) href = `#`
        let link = `<a href="${href}">${this.text.find_out_more_about_ink}</a>`
        let el = $(`
        <div class="about-box">
            <div class="about-box-inner">
                <p>${this.text.created_with}</p>
                <p>${link}</p>     
                <p><a href="#" onclick="$('.about-box').remove()">${this.text.close}</a></p>           
            </div>
        </div>`)
        $("body").append(el)
    }

    perform_command(tag, command, store, ctx) {
        this["do_command_" + command.do_command_id](tag, store, ctx, command)
    }

    parse_tag(tag) {

        tag = tag.trim()
        let first_word
        let rest = tag.replace(/.*?(\s|$)/, (n) => {
            first_word = n
            return ""
        })
        first_word = first_word.trim().toLowerCase()
        rest = rest.trim()

        if ( first_word === "note" || first_word === "n"
            || first_word === "todo" ) {
            //comment. ignore.
            return
        }
        
        if ( first_word === "js" || first_word === "javascript" ) {
            try {
                eval(rest)
            } catch(e) {
                console.log("#js LINE ERROR", e)
                let txt = `
                    <p>A JavaScript line you wrote seems to be incorrect.</p>
                    <p>The error is in this line: #<b>${tag}</b></p>
                    <p>The browser thinks this is the error:</p>
                    <p><b>${e}</b></p>`
                document.body.innerHTML = txt                
            }
            
            return
        }
        
        let command = this.commands[first_word]
        if (!command) {
            if (first_word && first_word.includes(":")) {
                this.mild_error(tag, `<b>#${first_word}</b> No colon (:) expected here.`)
                return
            }
            this.mild_error(tag, `<b>#${first_word}</b> is not a valid tag command`)
            return
        }

        let parts = rest.split(this.item_separator)
            .map(n => n.trim()).filter(n => n)

        let obj = {}

        for (let part of parts) {
            part = part.trim()
            let key
            let value
            if (command.special_props && command.special_props[part.toLowerCase()]) {
                key = part.toLowerCase()
                value = this.yes
            } else {

                let ix = part.indexOf (this.prop_separator)
                if (ix === -1) {
                    this.mild_error(tag, `<b>${part}</b> - I expected something like 
                    <b>name: value</b> here.`)
                    return
                }
                key = part.substr(0, ix).toLowerCase().trim()
                value = part.substr(ix + 1).trim()
            }
            obj[key] = value
        }

        return {
            command: command,
            key_value_store: obj,
        }
    }





}




