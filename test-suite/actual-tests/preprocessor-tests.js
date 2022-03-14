
    tests.preprocessor = {
        func: preprocessor.process_content_blocks,
        tests: [
            
            {
                input: [  `bla %%command content%% bla`],
                output: {
                    text: `bla                     bla`,
                    content_blocks: [{
                        command: "command",
                        content: "content",
                    }]
                }
            },

            
            {
                input: [                   
`

bla %%

    command

 content%% bla


`
                ],
                output: {
                    text: 
`

bla   

           

           bla


`                   ,
                    content_blocks: [{
                        command: "command",
                        content: "content",
                    }]
                }
            },

            
            {
                input: [  `bla %%\n%% bla`],
                output: {
                    text: `bla   \n   bla`,
                    content_blocks: [{
                        command: "",
                        content: "",
                    }]
                }
            },
            
            {
                input: [  `bla %%        %% bla`],
                output: {
                    text: `bla              bla`,
                    content_blocks: [{
                        command: "",
                        content: "",
                    }]
                }
            },

            
            {
                input: [  `Okay okay okay %%js\nconsole.log(3)\nc++\n c--\n%%`],
                output: {
                    text: `Okay okay okay     \n              \n   \n    \n  `,
                    content_blocks: [{
                        command: "js",
                        content: "console.log(3)\nc++\n c--",
                    }]
                }
            },

            {
                input: [  `%%abc%%%%def%%%%ghi%%jklm%%opq%%`],
                output: {
                    text: `                     jklm       `,
                    content_blocks: [
                        {command: "abc", content: ""},
                        {command: "def", content: ""},
                        {command: "ghi", content: ""},
                        {command: "opq", content: ""},
                    ]
                }
            },

  
            {
                input: [  `%%abc%% %%def`],
                output: {
                    text: `        %%def`,
                    content_blocks: [
                        {command: "abc", content: ""},
                    ]
                }
            },

  

        ]
    }

