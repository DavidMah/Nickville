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

  window.game_state =
    location: "Home"
    control:   "Free"

# Logic around mechanics
setControls = () ->
  console.log("controls being set")

  actions =
    32:
      Chat: continueDialogue

  window.actions = actions

  $(document).keypress((e) ->
    actions[e.which][window.game_state['control']]()
  )

followDialogue = (dialogue) ->
  # Create chat box
  window.game_state['control'] = 'Chat'
  dialogue = dialogue.slice() # I really want clone
  window.dialogue = dialogue
  continueDialogue()

# TODO
continueDialogue = () ->
  dialogue = window.dialogue
  if dialogue.length > 0
    handleMessage(dialogue[0])
    window.dialogue = dialogue.splice(1)
  else
    completeDialogue()

completeDialogue = () ->
  # Remove chat box
  # Present buttons on where to go

handleMessage = (message) ->
  if message instanceof Object
    choices = message['Choice']
    i = 0
    window.choices = choices
    for c in choices
      console.log("#{i} -- #{c['Response']}")
      i += 1
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
