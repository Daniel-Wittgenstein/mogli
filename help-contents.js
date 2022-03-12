


$_HELP_CONTENTS = `


Mogli is a new simple tool for creating text-based games and
Interactive Fiction stories for the web. Mogli uses Ink under the hood, so
you can use normal Ink markup to create your story.
The following just details the special features that Mogli adds.


Add custom JavaScript blocks. The JavaScript is run when the page starts:

    %% js
        function show_alert() {
            alert("Hi there!")
        }
        show_alert()
    %%

Run a JS snippet:

    === Forest
        You are in the ...
        #js alert("... forest!")

Add custom CSS blocks:

    %% css
        input {
            border-radius: 8px;
        }
    %%

Display an image. The image name should match the name you have given
to the image in the assets panel:

    # image / name: castle 




`