


function split_into_first_word_and_rest(str) {
    //this returns a trimmed version of both first_word and rest
    str = str.trim()
    let ix = str.search(/[\s]/)
    if (ix === -1) return [str, ""]
    return [str.substr(0, ix), str.substr(ix).trim()]
}

