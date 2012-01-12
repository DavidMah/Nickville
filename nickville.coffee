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
  window.recordGameState  = recordGameState
  window.activateOpeningMenu = activateOpeningMenu


initializeGameData = () ->
  $('.container').hide()
  cached_game_state = $.cookie('game_state')

  $.get("gamedata/data.json", (data) ->
    window.game_data = data
    initializeImages()
    window.chatlocked = false
    if cached_game_state == null
      startNewGame()
    else
      window.game_state = cached_game_state
      activateOpeningMenu()

    setInterval(recordGameState, 15000)
  )

recordGameState = (force = false) ->
  if force or window.game_state['autosave']
    game_state = JSON.parse(JSON.stringify(window.game_state))
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

# -------------------------------------------
# Logic around control mechanics
# -------------------------------------------
setControls = () ->
  console.log("controls being set")

  actions =
    32:
      Chat: continueDialogue
    'click':
      Chat: continueDialogue

  window.actions = actions

  action_handler = (event) ->
    action = actions[event][window.game_state['control']]
    unless action == undefined
      action()

  $(document).keypress((e) -> action_handler(e.which))
  $('#game_container').click(() -> action_handler('click'))

  window.control_elements = $('.free').add($('.menu')).add($('.opening')).add($('.chat')).add($('.love'))

  $('#menu_button').click(openMenu)
  $('#autosave_button').click(changeAutoSave)
  $('#save_button').click(() -> recordGameState(true))
  $('#menu_opening').click(activateOpeningMenu)

  $('#love_talk').click(() -> loveEvent(0))
  $('#love_chill').click(() -> loveEvent(1))
  $('#love_footsy').click(() -> loveEvent(2))
  $('#love_sex').click(() -> loveEvent(3))

# -------------------------------------------
# Logic around Saving
# -------------------------------------------

changeAutoSave = () ->
  current_autostate = window.game_state['autosave']
  window.game_state['autosave'] = !current_autostate
  setAutoSaveButtonState()

setAutoSaveButtonState = () ->
  next_state = (if window.game_state['autosave'] then "Off" else "On")
  $('#autosave_button').text("Turn #{next_state} Autosave")

changeControlState = (state) ->
  window.game_state['previous_control'] = window.game_state['control']
  window.game_state['control'] = state
  switch state
    when 'Chat'
      enterChatState()
    when 'Choice'
      enterChoiceState()
    when 'Free'
      enterFreeState()
    when 'Love'
      enterLoveState()
    when 'Menu'
      enterMenuState()
    when 'Opening'
      enterOpeningState()
  console.log("chatlocked #{window.chatlocked}")
  console.log("moving to #{state} State")

enterChatState = () ->
  window.control_elements.hide()
  $('.chat').show()
  setChatlock(false)

enterChoiceState = () ->
  window.control_elements.hide()
  setChatlock(true)

enterFreeState = () ->
  window.control_elements.hide()
  $('.free').show()
  setChatlock(true)

enterLoveState = () ->
  window.control_elements.hide()
  $('.free').show()
  $('.love').show()
  setChatlock(true)

enterMenuState = () ->
  window.control_elements.hide()
  $('.menu').show()
  setChatlock(true)

enterOpeningState = () ->
  window.control_elements.hide()
  $('.opening').show()

openMenu = () ->
  console.log('open menu')
  changeControlState('Menu')
  $('#menu_button').unbind()
  $('#menu_button').click(exitMenu)

exitMenu = () ->
  console.log('close menu')
  previous_state = window.game_state['previous_control']
  changeControlState(previous_state)
  $('#menu_button').unbind()
  $('#menu_button').click(openMenu)

#------------------------------
# Logic around dialogue
# -----------------------------

followDialogue = (dialogue) ->
  changeControlState('Chat')
  dialogue = dialogue.slice() # I really want clone
  window.dialogue = dialogue
  unless window.game_state['previous_control'] == 'Love'
    setTimeout(continueDialogue, 100)

continueDialogue = (choice = null) ->
  console.log("continued dialogue")
  if not window.chatlocked or choice != null
    changeControlState("Chat")
    dialogue = window.dialogue
    if dialogue.length > 0
      handleMessage(dialogue[0])
      window.dialogue = dialogue.splice(1)
    else
      completeDialogue()

completeDialogue = () ->
  changeControlState(window.next_state)

handleMessage = (message) ->
  if message instanceof Object
    choices = message['Choice']
    i = 0
    window.choices = choices
    container = $('#choice_container').text("")
    for c in choices
      choice_box = $(document.createElement('div'))
      choice_box.addClass('choice_box')

      item = $(document.createElement('button'))
      item.attr("count", i)
      item.addClass('choice_item box')
      item.click(() -> continueDialogue(item.attr("count")))

      item.text(c)
      choice_box.append(item)
      container.append(choice_box)
      console.log("#{i} -- #{c['Response']}")
      i += 1
  else
    $("#dialogue_area").text(message)
    console.log(message)

#------------------------------
# Logic around Travel
# -----------------------------

getPossibleLinks = () ->
  possible_links = window.game_data['Locations'][window.game_state['location']]['Links']
  console.log(possible_links)
  possible_links

travelToLocation = (location, encounter_possible = true) ->
  return unless window.game_state['control'] == 'Free' or window.game_state['control'] == 'Love'
  setChatlock(true)
  console.log "Moving to #{location}"
  window.game_state['location'] = location
  setIndicatorArea(location)
  $('#status_location').text(location)
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
    item.click(() -> travelToLocation($(this).text()))


    link_container.append(item)
    container.append(link_container)

setLocationImage = (location) ->
    $('#background_image').attr('src', "images/#{location}.jpg")
    $('#background_image').show()

#------------------------------
# Logic around Chat
# -----------------------------

encounterPerson = (location) ->
  possible_people   = window.game_data['Locations'][location]['People']
  unless possible_people == null
    prepareNextState('Love')
    person   = chooseRandomFromList(possible_people)
    setupPerson(person)

setupPerson = (person) ->
  console.log("Encountered #{person}")
  window.person = person
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

prepareNextState = (state) ->
  window.next_state = state

#------------------------------
# Logic around Love
# -----------------------------

loveEvent = (level) ->
  current    = window.game_state[window.person]
  difficulty = (6 * level * level - 0.1 * current)
  if current == null
    initializeLove(window.person)
  power = Math.random() * 10
  if power > difficulty
    succeedLove()
  else
    failLove()

initializeLove = (person) ->
  window.game_state['love'][person] = 1

succeedLove = () ->
  console.log(window.game_data['Default Love Success'])
  prepareNextState('Free')
  followDialogue(window.game_data['Default Love Success'])

failLove = () ->
  console.log(window.game_data['Default Love Failure'])
  prepareNextState('Free')
  followDialogue(window.game_data['Default Love Failure'])

chooseRandomFromList = (list) ->
  list[parseInt(Math.random() * list.length)]

setIndicatorArea = (message) ->
  $('#indicator_area').text(message)

setChatlock = (chatlock) ->
  if chatlock
    window.chatlocked = true
  else
    setTimeout((() -> window.chatlocked = false), 100)

activateOpeningMenu = () ->
  changeControlState('Opening')
  setChatlock(true)

  $('#opening_new').click(startNewGame)
  $('#opening_continue').click(continueSavedGame)

startNewGame = () ->
  window.game_state =
    location: "Home"
    control:  "Free"
    autosave: false
    love: {}
  setAutoSaveButtonState()
  startingSequence()

continueSavedGame = () ->
  console.log("trying to continue")
  window.game_state = JSON.parse($.cookie('game_state'))
  setAutoSaveButtonState()
  travelToLocation(window.game_state['location'], false)

# Logic around plot
startingSequence = () ->
  setChatlock(false)
  travelToLocation('The Apartment', false)
  prepareNextState('Free')
  followDialogue(window.game_data['Starting Sequence'])
