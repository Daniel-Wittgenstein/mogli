
/*

RELEVANT LINKS:
    https://github.com/smwhr/inkyweb
    https://github.com/y-lohse/inkjs/tree/compiler


*/

mogli_app = (function () {
    let settings = {}

    $(window).on("load", start)

    let assets_manager

    function start() {
        assets_manager = new AssetsManager()

        init_load_file_handler()

        init_editor()

        init_tabs()
        
        init_help()

        restore_project_from_state($_INITIAL_PROJECT)
        
        if ($_INITIAL_EDITOR_VALUE) {
            //overrides editor content set by initial project.
            //very useful for testing
            code_mirror_editor.setValue($_INITIAL_EDITOR_VALUE)
        }


        
    }


    function init_help() {
        let h = markdown_to_html($_HELP_CONTENTS)
        $("#content-help").html(h)
    }

    function init_tabs() {
        $(".tab-content").hide()

        $(".tab").on("click", function (e) {
            let el = $(this)
            let id = el.prop("id")
            if (!$(this).hasClass("tab-inactive")) {
                return
            }
            let type = "left-tab"
            if ($(this).hasClass("right-tab")) {
                type = "right-tab"
            }
            select_tab(type, id)
        })

        select_tab("left-tab", "tab-story")
        select_tab("right-tab", "tab-play")

        //testing only:
        //select_tab("left-tab", "tab-assets")
        
        //select_tab("right-tab", "tab-help")

    }

    function select_tab(type, id) {
        $(".tab-content-" + type.replace("-tab", "")).hide()
        $("." + type).addClass("tab-inactive")
        $("#"+id).removeClass("tab-inactive")
        let target = "#content-" + id.replace("tab-", "")
        $(target).show()

        if (target === "#content-assets") {
            assets_manager.on_tab_selected()
        }
    }


    function make_marker(text) {
        var marker = $(`<div class="gutter-error-symbol">!</div>`)
        return marker[0]
    }


    function init_editor() {

        init_syntax_highlighting()

        let cm = CodeMirror(document.querySelector('#text-editor'), {
            lineNumbers: true,
            tabSize: 4,
            value: "",
            gutters: ["extra-gutter"],
            lineWrapping: true,
            mode: "mogli",
        })


        cm.setSize("100%", "100%")

        code_mirror_editor = cm

        let locked_during_build = false
        cm.on("change", (e) => {
            destroy_tooltip()
            if (editor_has_errors) {
                editor_has_errors = false
                editor_clear_errors(cm)
            }
            if (locked_during_build) return
            locked_during_build = true
            setTimeout ( () => {
                build_and_run()
                locked_during_build = false
            }, 0)
        })

    }

    let editor_has_errors

    let code_mirror_editor

    function editor_clear_errors(cm) {
        cm.doc.getAllMarks().forEach( m => m.clear() )
    }

    function editor_get_value(cm) {
        return code_mirror_editor.getValue()
    }

    function destroy_tooltip() {
        $("#tooltip").hide()
    }

    function show_tooltip(event, text) {
        let m_x = event.pageX
        let m_y = event.pageY
        let tool_tip = $("#tooltip")
        tool_tip.css({
            left: m_x + "px",
            top: m_y + "px",
            position: "absolute",
            "z-index": 9000,        
        })
        tool_tip.html(text)
        tool_tip.show()
    }


        
    function add_mark(line_nr, text) {
        let lnr = line_nr
        code_mirror_editor.markText({line: lnr, ch: 0},
            {line: lnr, ch: 1000}, {
            className: "editor-error-line"
        })

        let el = make_marker(text)
        code_mirror_editor.doc.setGutterMarker(lnr, "extra-gutter", el)
        $(el).on("mouseover", (e) => {
            show_tooltip(e, text)
        })

        $(el).on("mouseout", (e) => {
            $("#tooltip").hide()
        })
        
    }

    function set_editor_state(state) {
        if (!state.is_editor_state) {
            console.log("Not a valid editor state:", state)
            return {error: true}
        }
        code_mirror_editor.setValue(state.content)
        return { error: false }
    }

    function get_editor_state() {
        return {
            is_editor_state: true,
            content: code_mirror_editor.getValue(),
        }
    }

    function build_and_run() {
        clear_error_message()
        code_mirror_editor.clearGutter("extra-gutter")
        let res = build()
        if (res.error) return false
        let html = res.html
        run(html)
        return true
    }


    function get_project_state() {
        //returned state should be jsonifiable
        return {
            is_project_state: true,
            assets: assets_manager.get_assets_state(),
            editor: get_editor_state(),
        }
    }

    function restore_project_from_state(state) {
        //restores app state from state obj

        if (!state.is_project_state) return {error: true}

        let res = assets_manager.set_assets_state(state.assets)
        if (res.error) return {error: true}

        res = set_editor_state(state.editor)
        if (res.error) return {error: true}

        return {
            error: false,
        }
    }


    function get_project_as_json() {
        //mirror of restore_project_from_json()
        let project_state = get_project_state()
        let json
        try {
            json = JSON.stringify(project_state)
        } catch(e) {
            return {
                error: true,
            }        
        }
        return {
            error: false,
            json: json,
        }
    }


    function restore_project_from_json(json) {
        //mirror of: get_project_as_json()
        let o
        try {
            o = JSON.parse(json)
        } catch(e) {
            return {
                error: true,
            }
        }
        let result = restore_project_from_state(o)
        if (!result || result.error) return {error: true}
        return {
            error: false,
        }
    }

    function init_load_file_handler() {
        $("#choose-file-to-upload-input").on("change", function(e) {
            let file = e.target.files[0]
            var reader = new FileReader()
            reader.onload = function(){
                //we want to read text here
                let json = reader.result
                let res = restore_project_from_json(json)
                if (res.error) {
                    alert(`Restoring the project failed. Was this a valid "save.mogli" file?`)
                }
            }
            reader.readAsText(file)
        })
    }


    function load() {
        let result = confirm("You are about to restore a project from a save file. " +
        'This action will DELETE the CURRENT PROJECT. ' +
        'If you really want to proceed, choose "OK". '+
        'Otherwise choose "Cancel" or press "Escape".')

        if (result) {
            $("#choose-file-to-upload-input").trigger("click")
        }

    }


    function save() {
        $("#save-button").html("Download may take a while ...")
        setTimeout( () => $("#save-button").html("Download save file"), 2000)

        let result = get_project_as_json()
        if (result.error) {
            throw `Error while trying to save.`
            return
        }
        download("save.mogli", result.json, "text/plain")
    }




    function export_game() {
        let res = build()
        if (res.error) {
            alert(`Error while trying to export the game. Is your script free of errors?`)
            console.log("ERROR", res)
            return
        }
        let html = res.html
        download("index.html", html, "text/html")
    }

    function download(file_name, text, type) {
        // type = 'text/html' or 'text/plain' etc. ...
        let el = document.createElement('a')
        el.setAttribute('href', 'data:' + type + ';charset=utf-8,' +
            encodeURIComponent(text))
        el.setAttribute('download', file_name)
        el.style.display = 'none'
        document.body.appendChild(el)
        el.click()
        document.body.removeChild(el)
    }

    function run(html) {
        //console.log(html)
        write_to_iframe(html)
    }

    let fullscreen_on = false

    function click_fullscreen() {

        fullscreen_on = !fullscreen_on

        if (fullscreen_on) {
            $("#content-play").addClass("fullscreeny")
            $("#fullscreen-button").html("Exit")
        } else {
            $("#content-play").removeClass("fullscreeny")
            $("#fullscreen-button").html("Fullscreen")
        }

    }



    function write_to_iframe(html) {

        //to be sure that old content is removed: (is this insane?)
        /*$("#play-iframe").remove()
        let nu_iframe = `<iframe id="play-iframe"></iframe>`
        $("#content-play").append(nu_iframe)
    */

        let el = document.getElementById("play-iframe")
        el.contentWindow.location.reload(true) //necessary or variables
        //in iframe will persist (?! is it?)
        
        setTimeout(
            () => {
                el.contentWindow.document.open()
                el.contentWindow.document.write(html)
                el.contentWindow.document.close()
            }, 100
        )
    }

    function markdown_to_html(md) {
        let html
        let converter = new showdown.Converter()
        html = converter.makeHtml(md)
        return html
    }



    function build() {
        let res = build_html_page()
        if (res.error) { return res }
        return {
            error: false,
            html: res.html,
        }
    }

    window.parent.on_ink_runtime_error = (ink_error_text, mogli_error_text,
        error_info) => {
        //MUST BE GLOBAL, SO IFRAME CAN CALL IT!
        //ella guru
        console.log("INK RUNTIME ERROR. line via secret tags:")
        let lnr = error_info.line_nr
        if (lnr) {
            add_mark(Number(lnr) - 1, ink_error_text)
        }

    }


    function build_html_page() {
        const untitled = `untitled story`

        let text = editor_get_value()

        //ella guru
        //text = preprocessor.strip_multiline_comments

        let p = preprocessor.process_content_blocks(text)
        if (p.error) {
            handle_preprocessor_error(p.error)
            return
        }

        text = p.text
        let extra_blocks = p.content_blocks

        text = preprocessor.process_script_for_error_tracking(text)

        let result = compile(text)

        if (result.error) {
            handle_errors(result)
            return  {
                error: true,
            }
        }

        let story = result.story
        let json_byte_code = story.ToJson()





        let runtime_data = flat_clone($_RUNTIME_DATA)

        //this list should be kept up to date with the file list in
        //build-runtime-data.js: (the list here is just for early error catching
        //purposes, though, not strictly necessary, but good.)
        let files = [
            "runtime/index.html-template",
            "runtime/main.js",
            "runtime/moglimanager.js",
            "runtime/ink-full.js",
            "runtime/style.css",
            "runtime/jquery-3.6.0.min.js",        
            "runtime/howler.core.min.js",        
        ]

        for (let n of files) {
            if (!runtime_data[n]) throw `File '${n}' is missing?`
        }

        let collector = {}

        let the_title = untitled

        let localized_links = ["restart", "save", "load", "theme", "about"]

        let locale = {}
        for (let p of localized_links) {
            locale[p] = p //set english defaults
        }

        //process extra block:
        for (let extra_block of extra_blocks) {
            let key = false
            let c = extra_block.command.toLowerCase()
            let cont = extra_block.content
            if (c === "js" || c === "javascript") {
                key = "js"
            } else if (c === "css") {
                key = "css"
            } else if ( localized_links.includes(c) ) {
                locale[c] = cont
            } else if (c === "title") {
                the_title = cont
            } else {
                let txt = `Inside a <b>%% ... %% block</b>, I found
                <b>${c}</b> as the first word, but this is not a
                valid command for a %% block. The first word should be (for example)
                <b>js</b> or <b>css</b>.`
                if (c === "") {
                    txt = `I found an empty <b>%% block</b>. This is not allowed.`
                }
                show_non_ink_transpilation_error(
                    {
                        msg: txt,
                    }
                )

                return {
                    error: true,
                }
            }
            if (key) {
                let separator = "\n\n\n"
                if (key === "js") separator = "\n\n;\n\n"
                if (!collector[key]) collector[key] = ""
                collector[key] += cont + separator
            }
        }


        let html_template = runtime_data["runtime/index.html-template"].content

        runtime_data["*user_js"] = collector.js ? collector.js : ""
        runtime_data["*user_css"] = collector.css ? collector.css : ""

        runtime_data["*asset_loader_script"] = `<script>$_ASSETS = ` +
            JSON.stringify(assets_manager.assets) + "</script>"

        runtime_data["*story"] = `<script>storyContent = ${json_byte_code}</script>`

        runtime_data["*title"] = the_title

        for (let p of localized_links) {
            runtime_data["*" + p] = locale[p]
        }


        //console.log(story, runtime_data, html_template, runtime_data["*story"])
        //console.log(runtime_data["*story"])

        for (let key of Object.keys(runtime_data)) {
            let value = runtime_data[key]
            if (!key.startsWith("*")) {
                runtime_data[key] = value.content
            }
        }

        html_template = get_html_page(html_template, runtime_data)

        return {
            error: false,
            html: html_template,
        }
    }


    function get_html_page(html_template, store) {
        /*  parameters:
            1. html_template: string containing
                html and special tags
            2. key/value store, where values are strings 
            
            inside the html template string all tags of the form:
                __$% some_key %$__

            will be converted to:

                string content that was stored under that key

        */
        html_template = html_template.replace(/__\$\%.*?\%\$__/g, (n) => {
            let org = n
            n = n.replace("__$%", "").replace("%$__", "").trim()
            let c = store[n]
            if (!c && c !== "") {
                throw `get_html_page: '${org}' is not a valid content key.`
            }
            return c
        })
        return html_template
    }



    function flat_clone(x) {
        return JSON.parse(JSON.stringify(x))
    }


    function compile(text) {
        let story
        let errors = []
        try {
            /*
                I'm not sure, but I assume the parameters 
                for compilerOptions work like this: (?)
            1. sourcefilename = null
            2. plugins = []
            3. countallvisits = false
            4. errorhandler func
            5. filehandler func
            */

            let file_handler = (e) => {
                console.log("SOME MYSTERIOUS FILE EVENT OCCURRED?!", e)
            }
            
            let error_handler = (e) => {
                errors.push(e)
            }

            const compiler_opts =  new inkjs.CompilerOptions(
                null, [], false, error_handler, file_handler )
            

            story = (new inkjs.Compiler(text, compiler_opts)).Compile()

            return {
                error: false,
                story: story,
                errors: errors,
            }
        } catch(e) {
            return {
                error: true,
                error_obj: e,
                errors: errors,
            }
        }
    }


    class AssetsManager {
        constructor() {
            this.assets = {}
            this.box = $("#assets-view-sub")
        }

        on_tab_selected() {
            this.render_assets_view()
        }

        get_assets_state() {
            //returns object NOT json! But returned
            //object must be JSONifiable.
            return {
                is_assets_state: true,
                assets: this.assets,
            }
        }

        set_assets_state(state) {
            //takes object NOT json!
            if (!state.is_assets_state) {
                console.log (`Not a valid assets state.`)
                return {
                    error: true,
                }
            }
            this.assets = state.assets
            return {
                error: false,
            }
        }

        get_asset_html(asset) {
            if (asset.type === "image") {
                return `<img class = "asset-preview-image"
                src="${this.asset_data_to_src("image", asset.data)}">`
            } else if (asset.type === "audio") {
                return `
                <audio controls>
                <source src="${this.asset_data_to_src("audio", asset.data)}" type="audio/mpeg">
                </audio>
                `
            }
        }

        asset_data_to_src(type, data) {
            return data
        }

        destroy_asset(asset_name) {
            delete this.assets[asset_name]
        }

        sanitize_asset_name(v) {
            return v
                .replaceAll('"', "")
                .replaceAll("'", "")
                .replaceAll('`', "")
                .replaceAll("#", "")
                .replaceAll("/", "")
                .replaceAll(":", "")
                .trim()
        }
        
        rename_asset(old, tnew) {
            if (!this.assets[old]) {
                return {
                    error: true,
                    msg: `Cannot rename asset: no asset with name "${old}" exists.`
                }
            }
            if (this.assets[tnew]) {
                return {
                    error: true,
                    msg: `Cannot rename asset: an asset with name "${tnew}" already exists.`
                }          
            }
            let asset = this.assets[old]
            delete this.assets[old]
            this.assets[tnew] = asset
            asset.name = tnew
            return {
                error: false,
            }
        }

        render_assets_view() {
            let that = this
            let html = ""
            html += `
            <button id="add-asset-button">Add file</button>
            <input style="display: none" type="file" id="asset-file-input"/>
            `

            for (let key of Object.keys(this.assets)) {
                let asset = this.assets[key]
                html += `<div class="asset-entry">
                    ${this.get_asset_html(asset)}
                    Name: <input class="asset-namor"
                    id = "asset-name-${asset.name}" value="${asset.name}">
                    <button class="asset-deletor"
                        id="asset-delete-${asset.name}">delete</button>
                    </div>`
            }
            let target = this.box

            target.html(html)

            //$(".asset-namor").off("click") //they get destroyed anyway
            //$(".asset-deletor").off("click")

            $(".asset-namor").on("keydown paste", function() {
                let master_class = that
                let self = this
                setTimeout( () => {
                    let v = $(self).val()
                    let id = $(self).prop("id")
                    v = master_class.sanitize_asset_name(v)
                    $(self).val(v)
                }, 0)
            })

            $(".asset-namor").on("change", function() {
                let master_class = that
                let self = this
                setTimeout( () => {
                    let v = $(self).val()
                    let id = $(self).prop("id")
                    v = master_class.sanitize_asset_name(v)
                    let result = master_class.rename_asset(id.replace("asset-name-", ""), v)
                    if (result.error) {
                        alert(result.msg)
                        master_class.render_assets_view()
                    } else {
                        master_class.render_assets_view()
                    }
                }, 0)
            })

            $(".asset-deletor").on("click", function() {
                let id = $(this).prop("id")
                let name = id.replace("asset-delete-", "")
                that.destroy_asset(name)
                that.render_assets_view()
            })

            $("#asset-file-input").on("change", function(e) {
                let file = e.target.files[0]
                let parts = file.type.split("/")
                let type = parts[0]
                let subtype = parts[1]
                let org_name = that.sanitize_asset_name( file.name.split(".")[0] )
                let name = org_name
                let nr = 1 //this way we start with number 2, so we have: cat, cat2 etc.
                while (that.assets[name]) {
                    nr += 1
                    name = org_name + nr
                }

                if (type !== "image" && type !== "audio") {
                    alert("Asset must be image or mp3 audio file.")
                    return
                }
                if (type === "audio" && subtype !=="mpeg") {
                    alert("Only mp3 is supported for audio.")
                    return
                }
                
                var reader = new FileReader()
                reader.onload = function(){
                    let data_url = reader.result
                    that.add_asset(type, subtype, data_url, name)
                    that.render_assets_view()
                }
                reader.readAsDataURL(file)
            })

            $("#add-asset-button").on("click", function() {
                $('#asset-file-input').trigger("click")
            })
        }

        add_asset(type, subtype, data, name) {
            let asset = {
                type: type,
                subtype: subtype,
                name: name,
                data: data,
            }
            if (this.assets[name]) return false
            this.assets[name] = asset
            return true
        }
    }


    //ERROR HANDLING:

    function handle_errors(error) {
        /* ERROR: line 1: Expected some kind of logic,
        condit???quence within braces: { ... } but saw end of line*/

        function handle_error(err) {
            let x = err.match(/line (\d+):/)
            if (!x) {
                return {
                    line_nr: -1,
                    text: err,
                }
            }
            let line_nr = Number( x[0].replace("line ", "").replace(":", "").trim() )
            return {
                line_nr: line_nr,
                text: err,
            }
        }

        editor_has_errors = true

        let err_text = ""

        //style for transpiler errors:
        let style = `font-family: sans-serif; color: #000;`

        for (let err of error.errors) {
            err = handle_error(err)
            if (err.line_nr < 0) {
                throw `Could not detect line number of error.`
            }

            //remove line number text because it's wrong, since
            //we duplicated the line numbers to insert extra error info,
            //replace it with correct line number:
            err.text = err.text.replace(/line .*?\s/, (n) => {
                
                n = n.replace("line", "").replace(":", "").trim()
                console.log(21218283, n)
                n = Number(n)
                n = n / 2
                return "line " + n + ": "
            })

            err_text += `<p style='${style}'>` + err.text + "</p>"
            if (!err.line_nr) {
                throw `Wrong line nr????`
                console.log(err)
            }

            //we want: 1/2 -> 1, 3/4 -> 2, 5/6 -> 3 etc.

            let here = Math.ceil(err.line_nr / 2)
            if (here <=0) throw `Out of bounds line number!`
            if (Math.round(here) !== here) throw `Float line number???!`
            try {
                add_mark( here, err.text)
            } catch(e) {
                console.log("OUT OF BOUNDS LINE NUMBER???")
            }
            
        }

        display_error(err_text)

        //error.errors -> text -> get info from text
        //-> display it accordingly
        /*         var issueRegex = /^(ERROR|WARNING|RUNTIME ERROR|RUNTIME WARNING|TODO): ('([^']+)' )?line (\d+): (.*)/;
            let issueMatches = message.match(issueRegex);

            if(issueMatches){
                const type = issueMatches[1] as Issue['type'];
                const filename = issueMatches[3];
                const lineNumber = parseInt(issueMatches[4]);
                const msg = issueMatches[5];*/
    }

    function show_non_ink_transpilation_error(err) {
        display_error(err.msg)
    }


    function handle_preprocessor_error(error) {
        display_error(error.msg)
    }



    function display_error(text) {
        //actually renders the error in the editor
        $("iframe").hide()
        $(".error-displaying-panel").html(text)
        $(".error-displaying-panel").show()
    }

    function clear_error_message() {
        $("iframe").show()
        $(".error-displaying-panel").html("")
        $(".error-displaying-panel").hide()
    }

    function on_runtime_error(text) {
        display_error(text)
    }
   



    return {
        save,
        load,
        export_game,
        click_fullscreen,
        on_runtime_error,
    }

})()
