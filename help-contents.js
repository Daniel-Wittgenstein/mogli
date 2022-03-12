


$_HELP_CONTENTS = `


Mogli is an experimental tool for creating text-based games and
Interactive Fiction stories for the web.

Mogli uses 
[Ink](https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md#5-functions)
under the hood, so
you can use normal Ink markup to create your story.

The following just details the special features that Mogli adds.

Add custom JavaScript blocks. The JavaScript is run when the page starts:

    %% js
        function show_alert() {
            alert("Hi there!")
        }
        show_alert()
    %%

Run a JS snippet (single-line only):

    === Forest
        You are in the ...
        #js alert("... forest!")

JS snippets have access to a global object called info. "info.story" provides
access to the current Ink story, info.continueStory provides access to an internal
function that continues the story. Careful: if you use this, you are playing with fire!

    #js console.log(info)

Add custom CSS blocks:

    %% css
        input {
            border-radius: 8px;
        }
    %%

Display an image. The image name should match the name you have given
to the image in the assets panel:

    # image / name: cat3


For your convenience, Mogli includes jQuery into your game
(it's just 90kb), so you can use jQuery features, too:

    #js $("#element-id").hide()

Play an audio. The audio name should match the name you have given
to the audio in the assets panel:

    # audio / name: purr

Play an audio with adjusted volume. Volume is a
number from 0.0 (mute) to 1.0 (full volume):

        #audio / name: purr / volume: 0.6

Loop an audio:

    #audio / name: purr / volume: 0.75 / loop

Assign an id to an audio, so you can manipulate it later. The id
can consist of letters, numbers, the underscore and the minus symbol:

    #audio / name: purr / id: my-purr-audio / loop

Stop a sound using the sound's id:

    #stop_audio / id: my-purr-audio

Pause a sound using the sound's id:

    #pause_audio / id: my-purr-audio

Resume playing a stopped or paused sound:

    #resume_audio / id: my-purr-audio

Define a sound as initially muted and start playing it later:

    #audio / name: purr / id: my-purr-audio / muted

    (...)

    #resume_audio / id: my-purr-audio


`