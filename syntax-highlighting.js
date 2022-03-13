
function init_syntax_highlighting() {
    CodeMirror.defineSimpleMode("mogli", {
    // The start state contains the rules that are initially used
        start: [

            {regex: /===.*/, token: "knot"},

            {regex: /=.*/, token: "stitch"},

            {regex: /-\>\s*\w+/, token: "arrow"},

            {regex: /\*\*\*\*\*\*.*/, token: "choice6"},

            {regex: /\*\*\*\*\*.*/, token: "choice5"},

            {regex: /\*\*\*\*.*/, token: "choice4"},

            {regex: /\*\*\*.*/, token: "choice3"},

            {regex: /\*\*.*/, token: "choice2"},

            {regex: /\*.*/, token: "choice1"},


        ],



    })
}