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
    action = actions[e.which][window.game_state['control']]
    unless action == undefined
      action()
  )

changeControlState = (state) ->
  window.game_state['control'] = state
  switch state
    when 'Chat'
      console.log("moving to Chat State")
      enterChatState()
    when 'Free'
      console.log("moving to Free State")
      enterFreeState()

enterChatState = () ->
  $('.chat').show()
  $('.free').hide()

enterFreeState =() ->
  $('.chat').hide()
  $('.free').show()


followDialogue = (dialogue) ->
  # Create chat box
  changeControlState('Chat')
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
  changeControlState('Free')

handleMessage = (message) ->
  if message instanceof Object
    choices = message['Choice']
    i = 0
    window.choices = choices
    for c in choices
      console.log("#{i} -- #{c['Response']}")
      i += 1
  else
    $("#dialogue_area").text(message)
    console.log(message)


encounterPerson = (location) ->
  possible_people   = window.game_data['Locations'][location]['People']
  person   = chooseRandomFromList(possible_people)
  setupPerson(person)

getPossibleLinks = () ->
  possible_links = window.game_data['Locations'][window.game_state['location']]['Links']
  console.log(possible_links)
  possible_links

travelToLocation = (location, encounter_possible = true) ->
  console.log "Moving to #{location}"
  window.game_state['location'] = location
  # Things that happen right when you arrive somewhere :
  if encounter_possible and Math.random() >  0.4
    encounterPerson(location)
  # Destroy old person
  setTravelList(location)

setTravelList = (location) ->
  container = $('#travel_links').text("")
  links = window.game_data['Locations'][location]['Links']
  for l in links
    link_container = $(document.createElement('div'))
    link_container.addClass('link_container')

    item = $(document.createElement('button'))
    item.addClass('link')
    item.text(l)
    item.click(() -> travelToLocation(l))

    link_container.append(item)
    container.append(link_container)


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
  travelToLocation('The Apartment', false)
  followDialogue(window.game_data['Starting Sequence'])
