

/*

This file is based on Inky's "main.js" standard web template file.

Inky is released under the MIT license: https://github.com/inkle/inky

I release all changes under the same license.

*/


$(window).on("load", start)

function start() {

    ;(function(storyContent) {

        let debug_log_output = false

        // Create ink story from the content using inkjs
        var story = new inkjs.Story(storyContent);

        const mogli = new MogliManager(story, continueStory)

        var savePoint = "";

        let savedTheme;
        let globalTagTheme;

        // Global tags - those at the top of the ink file
        // We support:
        //  # theme: dark
        //  # author: Your Name
        var globalTags = story.globalTags;
        if( globalTags ) {
            for(var i=0; i<story.globalTags.length; i++) {
                var globalTag = story.globalTags[i];
                var splitTag = splitPropertyTag(globalTag);

                // THEME: dark
                if( splitTag && splitTag.property == "theme" ) {
                    globalTagTheme = splitTag.val;
                }

                // author: Your Name
                else if( splitTag && splitTag.property == "author" ) {
                    var byline = document.querySelector('.byline');
                    byline.innerHTML = "by "+splitTag.val;
                }
            }
        }

        var storyContainer = document.querySelector('#story');
        var outerScrollContainer = document.querySelector('.outerContainer');

        // page features setup
        setupTheme(globalTagTheme);
        var hasSave = loadSavePoint();
        setupButtons(hasSave);

        // Set initial save point
        savePoint = story.state.toJson();

        // Kick off the start of the story!
        continueStory(true);

        // Main story processing function. Each time this is called it generates
        // all the next content up as far as the next set of choices.
        function continueStory(firstTime) {
            function incr_delay(t) {
                delay += t
            }

            function get_delay(t) {
                return delay
            }

            let counter = 0

            var paragraphIndex = 0;
            var delay = 0.0;

            // Don't over-scroll past new content
            var previousBottomEdge = firstTime ? 0 : contentBottomEdgeY();

            // Generate story text - loop through available content
            while(story.canContinue) {
                counter++
                if (counter >= 400) {
                    throw `Too much content. Is this an infinite loop?`
                }

                // Get ink to generate the next paragraph
                var paragraphText = story.Continue();
                if (debug_log_output) console.log("PARAGRAPH TEXT:", paragraphText)

                var tags = story.currentTags;

                //ctx: whatever you want to pass to the moglimanager
                //from here so it can do its job.
                let ctx = {
                    //story,
                    incr_delay,
                    get_delay,
                    storyContainer,
                    showAfter,
                }

                mogli.process_tags(tags, ctx)

                var customClasses = [];

                            /*
                // Any special tags included with this line

                for(var i=0; i<tags.length; i++) {
                    var tag = tags[i];

                    // Detect tags of the form "X: Y". Currently used for IMAGE and CLASS but could be
                    // customised to be used for other things too.
                    var splitTag = splitPropertyTag(tag);

                    // AUDIO: src
                    if( splitTag && splitTag.property == "AUDIO" ) {
                    if('audio' in this) {
                        this.audio.pause();
                        this.audio.removeAttribute('src');
                        this.audio.load();
                    }
                    this.audio = new Audio(splitTag.val);
                    this.audio.play();
                    }

                    // AUDIOLOOP: src
                    else if( splitTag && splitTag.property == "AUDIOLOOP" ) {
                    if('audioLoop' in this) {
                        this.audioLoop.pause();
                        this.audioLoop.removeAttribute('src');
                        this.audioLoop.load();
                    }
                    this.audioLoop = new Audio(splitTag.val);
                    this.audioLoop.play();
                    this.audioLoop.loop = true;
                    }

                    // IMAGE: src
                    if( splitTag && splitTag.property == "IMAGE" ) {
                        var imageElement = document.createElement('img');
                        imageElement.src = splitTag.val;
                        storyContainer.appendChild(imageElement);

                        showAfter(delay, imageElement);
                        delay += 200.0;
                    }

                    // LINK: url
                    else if( splitTag && splitTag.property == "LINK" ) {
                        window.location.href = splitTag.val;
                    }

                    // LINKOPEN: url
                    else if( splitTag && splitTag.property == "LINKOPEN" ) {
                        window.open(splitTag.val);
                    }

                    // BACKGROUND: src
                    else if( splitTag && splitTag.property == "BACKGROUND" ) {
                        outerScrollContainer.style.backgroundImage = 'url('+splitTag.val+')';
                    }

                    // CLASS: className
                    else if( splitTag && splitTag.property == "CLASS" ) {
                        customClasses.push(splitTag.val);
                    }

                    // CLEAR - removes all existing content.
                    // RESTART - clears everything and restarts the story from the beginning
                    else if( tag == "CLEAR" || tag == "RESTART" ) {
                        removeAll("p");
                        removeAll("img");
                        removeAll(".tag-input")

                        // Comment out this line if you want to leave the header visible when clearing
                        setVisible(".header", false);

                        if( tag == "RESTART" ) {
                            restart();
                            return;
                        }
                    }
                }
                */

                // Create paragraph element (initially hidden)
                var paragraphElement = document.createElement('p');
                paragraphElement.innerHTML = paragraphText;
                storyContainer.appendChild(paragraphElement);

                // Add any custom classes derived from ink tags
                for(var i=0; i<customClasses.length; i++)
                    paragraphElement.classList.add(customClasses[i]);

                // Fade in paragraph after a short delay
                showAfter(delay, paragraphElement);
                delay += 200.0;
            }

            // Create HTML choices from ink choices
            story.currentChoices.forEach(function(choice) {

                // Create paragraph with anchor element
                var choiceParagraphElement = document.createElement('p');
                choiceParagraphElement.classList.add("choice");
                choiceParagraphElement.innerHTML = `<a href='#'>${choice.text}</a>`
                storyContainer.appendChild(choiceParagraphElement);
                if (debug_log_output) console.log("CHOICE TEXT:", choice.text)

                // Fade choice in after a short delay
                showAfter(delay, choiceParagraphElement);
                delay += 200.0;

                // Click on choice
                var choiceAnchorEl = choiceParagraphElement.querySelectorAll("a")[0];
                choiceAnchorEl.addEventListener("click", function(event) {

                    // Don't follow <a> link
                    event.preventDefault();

                    // Remove all existing choices
                    removeAll(".choice");

                    // Remove all existing inputs
                    removeAll(".tag-input")

                    // Tell the story where to go next
                    story.ChooseChoiceIndex(choice.index);

                    // This is where the save button will save from
                    savePoint = story.state.toJson();

                    // Aaand loop
                    continueStory();
                });
            });


            
            /* Removed this bit:

                // Extend height to fit
                // We do this manually so that removing elements and creating new ones doesn't
                // cause the height (and therefore scroll) to jump backwards temporarily.
                storyContainer.style.height = contentBottomEdgeY()+"px";
            
            I honestly do not understand why the line
            was here in the first place.
            It seems to cause a bug where the first time the page loads, the height
            of the content is too small and the bottom line of the story can be cut
            off, not showing it at all. I don't fully understand it even after
            messing around with it for over an hour,
            but removing the line fixes the bug and does not seem to have
            any negative effects (hopefully). 
            
            */

            if( !firstTime )
                scrollDown(previousBottomEdge);


        }

        function restart() {
            story.ResetState();

            setVisible(".header", true);

            // set save point to here
            savePoint = story.state.toJson();

            continueStory(true);

            outerScrollContainer.scrollTo(0, 0);
        }

        // -----------------------------------
        // Various Helper functions
        // -----------------------------------

        // Fades in an element after a specified delay
        function showAfter(delay, el) {
            el.classList.add("hide");
            setTimeout(function() { 
                el.classList.remove("hide");
                if (debug_log_output) console.log("unhiding", el)
            }, delay);
        }

        // Scrolls the page down, but no further than the bottom edge of what you could
        // see previously, so it doesn't go too far.
        function scrollDown(previousBottomEdge) {

            // Line up top of screen with the bottom of where the previous content ended
            var target = previousBottomEdge;

            // Can't go further than the very bottom of the page
            var limit = outerScrollContainer.scrollHeight - outerScrollContainer.clientHeight;
            if( target > limit ) target = limit;

            var start = outerScrollContainer.scrollTop;

            var dist = target - start;
            var duration = 300 + 300*dist/100;
            var startTime = null;
            function step(time) {
                if( startTime == null ) startTime = time;
                var t = (time-startTime) / duration;
                var lerp = 3*t*t - 2*t*t*t; // ease in/out
                outerScrollContainer.scrollTo(0, (1.0-lerp)*start + lerp*target);
                if( t < 1 ) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        }

        // The Y coordinate of the bottom end of all the story content, used
        // for growing the container, and deciding how far to scroll.
        function contentBottomEdgeY() {
            var bottomElement = storyContainer.lastElementChild;
            let res = bottomElement ? bottomElement.offsetTop + bottomElement.offsetHeight : 0;
            return res
        }

        // Remove all elements that match the given selector. Used for removing choices after
        // you've picked one, as well as for the CLEAR and RESTART tags.
        function removeAll(selector)
        {
            var allElements = storyContainer.querySelectorAll(selector);
            for(var i=0; i<allElements.length; i++) {
                var el = allElements[i];
                el.parentNode.removeChild(el);
            }
        }

        // Used for hiding and showing the header when you CLEAR or RESTART the story respectively.
        function setVisible(selector, visible)
        {
            var allElements = storyContainer.querySelectorAll(selector);
            for(var i=0; i<allElements.length; i++) {
                var el = allElements[i];
                if( !visible )
                    el.classList.add("invisible");
                else
                    el.classList.remove("invisible");
            }
        }

        // Helper for parsing out tags of the form:
        //  # PROPERTY: value
        // e.g. IMAGE: source path
        function splitPropertyTag(tag) {
            var propertySplitIdx = tag.indexOf(":");
            if( propertySplitIdx != null ) {
                var property = tag.substr(0, propertySplitIdx).trim();
                var val = tag.substr(propertySplitIdx+1).trim();
                return {
                    property: property,
                    val: val
                };
            }

            return null;
        }

        // Loads save state if exists in the browser memory
        function loadSavePoint() {

            try {
                let savedState = window.localStorage.getItem('save-state');
                if (savedState) {
                    story.state.LoadJson(savedState);
                    return true;
                }
            } catch (e) {
                console.debug("Couldn't load save state");
            }
            return false;
        }

        // Detects which theme (light or dark) to use
        function setupTheme(globalTagTheme) {

            // load theme from browser memory
            var savedTheme;
            try {
                savedTheme = window.localStorage.getItem('theme');
            } catch (e) {
                console.debug("Couldn't load saved theme");
            }

            // Check whether the OS/browser is configured for dark mode
            var browserDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

            if (savedTheme === "dark"
                || (savedTheme == undefined && globalTagTheme === "dark")
                || (savedTheme == undefined && globalTagTheme == undefined && browserDark))
                document.body.classList.add("dark");
        }

        function clear_and_restart() {
            removeAll("p");
            removeAll("img");
            removeAll(".tag-input")
            setVisible(".header", false);
            restart();
        }

        // Used to hook up the functionality for global functionality buttons
        function setupButtons(hasSave) {

            let rewindEl = document.getElementById("rewind");
            if (rewindEl) rewindEl.addEventListener("click", clear_and_restart);

            let saveEl = document.getElementById("save");
            if (saveEl) saveEl.addEventListener("click", function(event) {
                try {
                    window.localStorage.setItem('save-state', savePoint);
                    document.getElementById("reload").removeAttribute("disabled");
                    window.localStorage.setItem('theme', document.body.classList.contains("dark") ? "dark" : "");
                } catch (e) {
                    console.warn("Couldn't save state");
                }

            });

            let reloadEl = document.getElementById("reload");
            if (!hasSave) {
                reloadEl.setAttribute("disabled", "disabled");
            }
            reloadEl.addEventListener("click", function(event) {
                if (reloadEl.getAttribute("disabled"))
                    return;

                removeAll("p");
                removeAll("img");
                removeAll(".tag-input")

                try {
                    let savedState = window.localStorage.getItem('save-state');
                    if (savedState) story.state.LoadJson(savedState);
                } catch (e) {
                    console.debug("Couldn't load save state");
                }
                continueStory(true);
            });

            let themeSwitchEl = document.getElementById("theme-switch");
            if (themeSwitchEl) themeSwitchEl.addEventListener("click", function(event) {
                document.body.classList.add("switched");
                document.body.classList.toggle("dark");
            });

            let about_el = document.getElementById("about")
            if (about_el) {
                about_el.addEventListener("click", function(event) {
                    mogli.show_about()
                })
            }
        }

    })(storyContent);

} //start