$(document).ready(()->
  initializeGameData()
  setControls()
  startingSequence()
)

initializeGameData = () ->
  # Retrieve Data Json
  $.get("gamedata/data.json", (data) ->
    window.game_data = JSON.parse(data))

# Logic around mechanics
setControls = () ->
  $(document).keypress((e) ->
    switch e.which
      when 32 then continueDialogue
  )

# TODO
followDialogue = (dialogue) ->
    # Create element and hide it

# TODO
continueDialogue = () ->

encounterPerson = (location) ->
  possible_people   = window.game_data[location]['People']
  person   = chooseRandomFromList(possible_people)
  setupPerson(person)
  possible_dialogue = window.game_data['People'][person]
  dialogue = chooseRandomFromList(possible_dialogue)
  followDialogue = (dialogue)

# TODO
setupPerson = (person) ->

chooseRandomFromList = (list) ->
  list[parseInt(Math.random() * list.length)]


# Logic around the chat box
triggerChatBox = () ->
  visibility = $("#chatbox").visibility
  $("#chatbox").visibility = (visibility == "hidden" ? "visible" : "hidden")

# Logic around plot
# TODO
startingSequence = () ->
