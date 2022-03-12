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

        this.first_tag_read = false
        this.item_separator = "/"
        this.prop_separator = ":"
        this.commands = {}
        this.load_commands()
        this.yes = "yes"
        this.no = "no"
        window.onerror = this.on_error.bind(this)
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
    }

    do_command_image(text, param, ctx) {
        console.log("performing image", param, ctx, $_ASSETS)
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

    perform_command(tag, command, store, ctx) {
        this["do_command_" + command.do_command_id](tag, store, ctx, command)
    }

    parse_tag(tag) {
        if (!this.first_tag_read) {
            //first tag must be title. so ignore it.
            this.first_tag_read = true
            return
        }
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




