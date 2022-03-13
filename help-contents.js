


$_HELP_CONTENTS = `

# Mogli
Mogli is an experimental tool for creating text-based games and
Interactive Fiction stories for the web.

Mogli uses 
[Ink](https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md#5-functions)
under the hood, so
you can use normal Ink markup to create your story.

The following guide just details the special features that Mogli adds.

## Images

Display an image. The image name should match the name you have given
to the image in the assets panel:

    # image / name: cat3

## Audio

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

## Setting a Title

Adding a title to your game is a bit different than in standard Ink.
Add a title by adding this line anywhere in your story:

    %%title My Great Story %%

## HTML

You can output HTML in your story. Just write the HTML like you normally would:

    === foresta
    Nel mezzo del cammin di nostra vita, mi ritrovai per
    una selva <span style="background: black; color: white;">oscura</span>, ché
    la diritta via era <b>smarrita</b>.



## JavaScript
You can add custom JavaScript blocks. The JavaScript is run when the page starts:

    %% js
        function show_alert() {
            alert("Hi there!")
        }
        show_alert()
    %%

Run a JS snippet during the game (single-line only):

    === Forest
        You are in the ...
        #js alert("... forest!")

JS snippets have access to a global object called info. "info.story" provides
access to the current Ink story, info.continueStory provides access to an internal
function that continues the story. Careful: if you use this, you are playing with fire!

    #js console.log(info)

For your convenience, Mogli includes jQuery into your game
(it's just 90kb), so you can use jQuery features, too:

    #js $("#element-id").hide()
    
## CSS

You can add custom CSS blocks:

    %% css
        input {
            border-radius: 8px;
        }
    %%



## Showing stats

At the top of the HTML page there is a small box with CSS class "stats".
That's where you can display some simple permanent text for your game. Consider
this example:

    %%title My Great Story %%
    VAR health = 90
    VAR pet = "black cat"
    VAR food = 7
    
    #js setInterval(my_update, 500); my_update()
    
    -> alley
    
    === alley
    = back
    
    You are standing in an alleyway.
    
    + Feed your cat
    
    -
    You feed the cat.
    ~ food -= 1
    
    -> back
     
    
    %%js
        function my_update() {
            let health = info.story.variablesState["health"]
            let pet = info.story.variablesState["pet"]
            let food = info.story.variablesState["food"]
            $(".stats").html(\`health: \${health} | pet: \${pet} | food ratios: \${food}\`)
        }
    %%
    
As you can see, the variables in the top bar automatically update and
display the current value.

## Localization

You can localize the links in the top bar. Just add this anywhere in your story:

    %%restart Neustart%%
    %%save speichern%%
    %%load laden%%
    %%theme hell/dunkel%%
    %%about über%%

## Simple Input

You can display a simple input field where the player can type text, for example
to choose a name:

    -> start
    === start
    VAR player_name = "Mogli"
    Choose your name:
    #simple_input / var: player_name / trim / capitalize
    * Okay

    -
    Your name is {player_name}.

    -> DONE

These are all options supported by simple_input:

- var: variable_name

    This is mandatory. The variable must have already been defined in Ink
    (by using Ink's VAR command).

    The text typed by the player will be stored in this variable.
    
    If the variable has been set to an empty string (""), the input will be initially
    empty. If it has been set to another string (like "Baby"), this will be the
    initial text shown by the input.

- trim: This option removes spaces from the beginning and end of the text.
    Using this option is recommended.

- uppercase: The text will be converted to UPPERCASE.

- lowercase: The text will be converted to lowercase.

- capitalize (or "capitalise", if you prefer): The Text Will Be Capitalized.

- live: trim, uppercase, lowercase and capitalise transformations will be shown as
the player types. If live is off, the text stored inside the variable will
still be transformed, but you won't see the transformation as you type.

- disabled: The input is disabled, meaning it is shown, but cannot be used to
input anything.

- focus: The input is automatically focused, so the player can start typing right away.

`