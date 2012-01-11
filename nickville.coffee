$(document).ready(()->
  testFunctions()
  initializeGameData()
  setControls()
)

testFunctions = () ->
  window.encounterPerson = encounterPerson
  window.setupPerson = setupPerson
  window.travelToLocation = travelToLocation
  window.getPossibleLinks = getPossibleLinks

initializeGameData = () ->
  # Retrieve Data Json
  $.get("gamedata/data.json", (data) ->
    window.game_data = data
    startingSequence()
  )

  window.game_state = {
    "location" : "Home",
  }

# Logic around mechanics
setControls = () ->
  $(document).keypress((e) ->
    switch e.which
      when 32 then continueDialogue
  )

# TODO
followDialogue = (dialogue) ->
  dialogue = dialogue.slice() # I really want clone
  continueDialogue(dialogue)

# TODO
continueDialogue = (dialogue) ->
  if dialogue.length > 0
    handleMessage(dialogue[0])
    continueDialogue(dialogue.splice(1))

handleMessage = (message) ->
  if message instanceof Object
    choices = message['Choice']
    for c in choices
      console.log(c)
  else
    console.log(message)


encounterPerson = (location) ->
  possible_people   = window.game_data['Locations'][location]['People']
  person   = chooseRandomFromList(possible_people)
  setupPerson(person)

getPossibleLinks = () ->
  possible_links = window.game_data['Locations'][window.game_state['location']]['Links']
  console.log(possible_links)
  possible_links

travelToLocation = (location) ->
  console.log "Moving to #{location}"
  window.game_state['location'] = location
  # Things that happen right when you arrive somewhere :
  if Math.random() >  0.4
    encounterPerson(location)
  # Destroy old person
  # Destroy old travel buttons
  # Create new travel buttons

# TODO
setupPerson = (person) ->
  console.log("Encountered #{person}")
  possible_dialogue = window.game_data['People'][person]['Dialogue']
  dialogue = chooseRandomFromList(possible_dialogue)
  followDialogue(dialogue)

chooseRandomFromList = (list) ->
  list[parseInt(Math.random() * list.length)]


# Logic around the chat box
triggerChatBox = () ->
  visibility = $("#chatbox").visibility
  $("#chatbox").visibility = (visibility == "hidden" ? "visible" : "hidden")

# Logic around plot
startingSequence = () ->
  followDialogue(window.game_data['Starting Sequence'])
