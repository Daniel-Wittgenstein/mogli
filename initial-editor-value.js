/* very useful for testing. */

$_INITIAL_EDITOR_VALUE = `


-> start
=== start
VAR player_name = "Mogli"
Choose your name:
#simple_input / var: player_name / trim / capitalize
* Okay

-
Your name is {player_name}.

-> DONE

=== gaga
%%title My Great Story %%
VAR health = 90
VAR pet = "black cat"
VAR food = 7

%%restart Neustart%%
%%save speichern%%
%%load laden%%
%%theme hell/dunkel%%
%%about über%%



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



=== init

#audio / name: purr / loop / id: my-audio

#stop_audio id: my-audio

#image / name: cat3

* Go West! -> gowest

=== gowest

You went west.

-> DONE

=== every_turn
Hi there!!!




`