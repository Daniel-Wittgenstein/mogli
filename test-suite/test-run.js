

(function() {
    window.onload = start

    function is_string() {
        return typeof myVar === 'string'         
    }

    function obj_not_null() {
        return v === 'object' &&
            v !== null
    }

    function run_test(func, test) {

        if ( !Array.isArray(test.input) ) {
            throw `Wrongly designed test. Input MUST BE an array containing
            arguments to pass to the function.`
        }

        let a = func(...test.input)
        let b = test.output
        return {
            status: convert(a) === convert(b),
            a: a,
            b: b,
        } 
    }


    function log(...args) {

        console.log(...args)
    }

    function green_log(...args) {
        log("%c OK", " background: green; color: white;")
        log(...args)
    }

    function red_log(...args) {
        log("%c FAIL", " background: #d00; color: white;")
        log(...args)
    }

    function start() {
        for (let key of Object.keys(tests)) {
            log("STARTING TEST SET: '"+key+"' - " + tests[key].tests.length + " tests")
            let test = tests[key]
            let func = test.func
            let xtests = test.tests
            let i = 0
            for (let t of xtests) {
                i++
                //log("############# Starting test " + i)
                // log (t.input, "-> should be ->", t.output
                let r
                let pass = false
                try {
                    r = run_test(func, t)
                    pass = r.status
                } catch(e) {
                    log("Function threw error. Test failed:")
                    log(e)
                    pass = false
                }

                if (pass) {
                    //green_log()
                    /*log("input:", t.input)
                    log("--actual output:", r.a)
                    log("-desired output:", r.b)*/
                } else {
                    red_log("test "+ i + ": FAILED")
                    log("input:", t.input)
                    if (r) {
                        log("--actual output:", r.a)
                        log("-desired output:", r.b)
                    }
                    throw "Test failed. aborting."
                }
            }
            green_log()
        }

    }


    function convert(x) {
        if (x instanceof Set) throw `cannot convert sets or maps. test is written wrong`
        if (x instanceof Map) throw `cannot convert sets or maps. test is written wrong`
        if (obj_not_null) return JSON.stringify(x)
        return x        
    }



})()

