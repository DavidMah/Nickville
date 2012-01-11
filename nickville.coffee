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
  cached_game_state = $.cookie('game_state')
  if cached_game_state != null
    cached_game_state = JSON.parse(cached_game_state)
  $.get("gamedata/data.json", (data) ->
    window.game_data = data
    initializeImages()
    if cached_game_state == null
      window.game_state =
        location: "Home"
        control:   "Free"
      startingSequence()
    else
      window.game_state = cached_game_state
      travelToLocation(window.game_state['location'], false)

    setInterval(recordGameState, 15000)
  )

recordGameState = () ->
  game_state = window.game_state
  game_state['control'] = 'Free'
  $.cookie('game_state', JSON.stringify(game_state))
  console.log("game saved")


initializeImages = () ->
  $('#background_image').error(() ->
    $(this).hide())
  $('#person_image').error(() ->
    $(this).hide())

  window.image_data = {}
  image_names = []
  for p in window.game_data['People List']
    image_names.push("images/#{p}.png")
  for l in window.game_data['Location List']
    image_names.push("images/#{l}.jpg")

  $.each(image_names, (i, path) ->
    cached_image = $('<img/>')
    cached_image.addClass('cached_image')
    cached_image.attr('src', path)
    window.image_data[path] = cached_image
    cached_image.appendTo($("#meta_container")))

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
  else
    changeControlState('Free')
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
  person_element = $('#person_image')
  if person == null
    return person_element.hide()
  path = "images/#{person}.png"
  person_element.attr('src', path)
  person_element.show()
  width = window.image_data[path].width()
  person_element.width(width)
  person_element.height(window.image_data[path].height())
  person_element.css('margin-left', (800 - width) / 2)

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
