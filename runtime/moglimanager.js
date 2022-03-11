/*
Syntax of Mogli tags:
#image [/] name: castle / size: 5 / destroyer: true / maybe:true / text: Dunno. But maybe. [/]

Commands can also define "special_commands".
These are just keys that do not need a value
(but only when used for this command). If these special commands are provided
without colon and value they are just initialized to true.

All other keys are initialized to the string (!) of value.

*/

class MogliManager {
    constructor() {
        this.first_tag_read = false
        this.item_separator = "/"
        this.prop_separator = ":"
        this.commands = {}
        this.load_commands()
    }

    add_command(names, command) {
        for (let name of names) {
            this.commands[name] = command
        }
    }

    load_commands() {
        this.add_command(["image", "img"], {
            special_props: {
                center: true,
            }
        })
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

    process_tags(tags) {
        for (let tag of tags) {
            this.process_tag(tag)
        }
    }

    process_tag(tag) {
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

        console.log(first_word,"---", rest)

        if ( first_word === "note" || first_word === "n" ) {
            //comment. ignore.
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
                let key = part.toLowerCase()
                let value = true
            } else {
                let slices = part.split(this.prop_separator)
                .map(n => n.trim()).filter(n => n)
                key = slices[0].toLowerCase()
                value = slices[1]
                if (!key || !value) {
                    this.mild_error(tag, `<b>${part}</b> - I expected something like 
                    <b>name: value</b> here.`)
                    return
                }
            }

        }

    }
}




