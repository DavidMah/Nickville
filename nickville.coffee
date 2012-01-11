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
  $('.container').hide()
  $.get("gamedata/data.json", (data) ->
    window.game_data = data
    startingSequence()
  )

  window.game_state =
    location: "Home"
    control:   "Free"

  $('#background_image').error(() ->
    $(this).hide())
  $('#person_image').error(() ->
    $(this).hide())
  $('#person_image').load(() ->
    name = $('#person_image').attr('src')
    console.log(name)
    name = name.substr(name.lastIndexOf('/') + 1) || input
    name = name.substr(0, name.lastIndexOf('.')) || input
    console.log(name)
    window.game_data['People'][name]['Width']  = $(this).width()
    window.game_data['People'][name]['Height'] = $(this).height()
  )

  $('#background_image').hide()
  $('#person_image').hide()

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
  $('.free').hide()
  $('.chat').show()

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

getPossibleLinks = () ->
  possible_links = window.game_data['Locations'][window.game_state['location']]['Links']
  console.log(possible_links)
  possible_links

travelToLocation = (location, encounter_possible = true) ->
  console.log "Moving to #{location}"
  window.game_state['location'] = location
  setIndicatorArea(location)
  # Things that happen right when you arrive somewhere :
  setPersonImage(null)
  if encounter_possible and Math.random() >  0.4
    encounterPerson(location)
  setTravelList(location)
  setLocationImage(location)

setTravelList = (location) ->
  container = $('#travel_links').text("")
  links = window.game_data['Locations'][location]['Links']

  for l in links
    link_container = $(document.createElement('div'))
    link_container.addClass('link_container')

    item = $(document.createElement('button'))
    item.addClass('link box')

    item.text(l)
    item.click( () -> travelToLocation($(this).text()))

    link_container.append(item)
    container.append(link_container)

setLocationImage = (location) ->
    $('#background_image').attr('src', "images/#{location}.jpg")
    $('#background_image').show()

encounterPerson = (location) ->
  possible_people   = window.game_data['Locations'][location]['People']
  unless possible_people == null
    person   = chooseRandomFromList(possible_people)
    setupPerson(person)

# TODO
setupPerson = (person) ->
  console.log("Encountered #{person}")
  setIndicatorArea(person)
  possible_dialogue = window.game_data['People'][person]['Dialogue']
  dialogue = chooseRandomFromList(possible_dialogue)
  setPersonImage(person)
  followDialogue(dialogue)

setPersonImage = (person) ->
  if person == null
    $('#person_image').hide()
    return
  $('#person_image').attr('src', "images/#{person}.png")
  $('#person_image').show()
  $('#person_image').width(window.game_data['People'][person]['Width'])
  $('#person_image').height(window.game_data['People'][person]['Height'])

chooseRandomFromList = (list) ->
  list[parseInt(Math.random() * list.length)]

setIndicatorArea = (message) ->
  $('#indicator_area').text(message)


# Logic around the chat box
triggerChatBox = () ->
  visibility = $("#chatbox").visibility
  $("#chatbox").visibility = (visibility == "hidden" ? "visible" : "hidden")

# Logic around plot
startingSequence = () ->
  travelToLocation('The Apartment', false)
  followDialogue(window.game_data['Starting Sequence'])
