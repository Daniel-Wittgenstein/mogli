

/*

For preprocessing the user story file before
sending it to the Ink transpiler.

All functions here should be written to be pure.

*/


preprocessor = {
    process_content_blocks(text) {
        /* process "%% content %%"" blocks: */
        let extra_blocks = []
        text = text.replace(/\%\%[\S\s]*?\%\%/g, (n) => {
            //remove the block, so the ink compiler
            //never sees it, but keep the character and line
            //amount the exact same:
            let replace_string = n.replace(/[\S\s]/g, (char) => {
                if (char === "\n") return "\n"
                return " "
            })
            n = n.replaceAll("%%", "").trim()
            let [first, rest] = split_into_first_word_and_rest(n)
            first = first.replace(":", "")
            extra_blocks.push({
                command: first,
                content: rest,
            })
            return replace_string
        })
        return {
            text: text,
            content_blocks: extra_blocks,
        }
    },

    process_script_for_error_tracking(txt) {
        let lines = txt.split("\n")
        let out = ""
        let index = 0
        for (let line of lines) {
            index ++
            //out += `#$_info $--_.line:${line}$--_.line_nr:${index}\n`
            //out += "# "+index+"\n"
            out += "# y_x_x_x_x_x_x_y " + index + "\n"
            out += line + "\n"
        }
        return out
    },


}

