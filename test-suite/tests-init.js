
/*


define you tests:

    tests[key]: test set name
        - func: function to test against
        - tests: array of tests
            - input: array of arguments to pass to function.
                can be primitives (strings, numbers etc.),
                or jsonifiable objects or arrays.
                non jsonifiable stuff is not allowed
            - output: single value: output must match this. can be primitive
                or jsonifiable (same as input)



*/

window.tests = {

    testing_itself_works: {
        func: n => n,
        tests: [
            {input: [2], output: 2},
            {input: [ [2] ], output: [2] },
            {input: [ [2, 3, 4  ] ], output: [2,3,4] },
            {input: [{ 1: 1, "alba": 6, neu: "Käse" } ] ,
                output: { 1: 1, "alba": 6, neu: "Käse" } },
        ]
    },


}
