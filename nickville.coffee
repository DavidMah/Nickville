$(document).ready(()->
  testFunctions()
  setControls()
  initializeGameData()
)

testFunctions = () ->
  window.encounterPerson = encounterPerson
  window.setupPerson = setupPerson
  window.travelToLocation = travelToLocation
  window.getPossibleLinks = getPossibleLinks
  window.recordGameState  = recordGameState
  window.activateOpeningMenu = activateOpeningMenu
  window.rewardAchievement   = rewardAchievement
  window.collectAchievement = collectAchievement


initializeGameData = () ->
  $('.container').hide()
  cached_game_state = $.cookie('game_state')
  window.control_elements.hide()
  $('.loading').show()
  $('#loading_skip').click(activateOpeningMenu)
  window.loading = true

  $.get("gamedata/data.json", (data) ->
    window.game_data = data
    window.chatlocked = false
    if cached_game_state == null
      initializeNewGame()
    else
      window.game_state = cached_game_state
    initializeImages()

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

  window.preload =
    necessary: image_names.length - 4
    success: 0
  $.each(image_names, (i, path) ->
    cached_image = $('<img/>')
    cached_image.addClass('cached_image')
    cached_image.load(() ->
      window.preload['success'] += 1
      $('#progress_bar').width(600 * (1.0 * window.preload['success'] / window.preload['necessary']))
      if window.preload['success'] >= window.preload['necessary']
        if window.loading
          activateOpeningMenu()
    )
    cached_image.attr('src', path)
    window.image_data[path] = cached_image
    cached_image.appendTo($("#meta_container")))

  $('#background_image').hide()
  $('#person_image').hide()

# -------------------------------------------
# Logic around Controls!!!
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

  window.control_elements = $('.free').add($('.menu')).add($('.opening')).add($('.chat')).add($('.love')).add($('.loading')).add($('.relationship')).add($('.achievements')).add($('.reward'))

  $('#menu_button').click(openMenu)
  $('#autosave_button').click(changeAutoSave)
  $('#save_button').click(() -> recordGameState(true))
  $('#menu_opening').click(activateOpeningMenu)
  $('#menu_relationships').click(prepareRelationshipTable)
  $('#menu_achievements').click(prepareAchievementData)

  $('#reward_back').click(changeToPreviousControl)

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
  unless state == 'Relationship' or state == "Achievements"
    window.game_state['previous_control'] = window.game_state['control']
  window.game_state['control'] = state
  window.control_elements.hide()
  window.loading = false
  switch state
    when 'Loading'
      enterLoadingState()
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
    when 'Relationship'
      enterRelationshipState()
    when 'Achievements'
      enterAchievementsState()
    when 'Reward'
      enterRewardState()
    when 'Opening'
      enterOpeningState()
  console.log("chatlocked #{window.chatlocked}")
  console.log("moving to #{state} State")

enterLoadingState = () ->
  $('.loading').show()

enterChatState = () ->
  $('.chat').show()
  setChatlock(false)

enterChoiceState = () ->
  setChatlock(true)

enterFreeState = () ->
  $('.free').show()
  setChatlock(true)

enterLoveState = () ->
  $('.free').show()
  $('.love').show()
  setChatlock(true)

enterMenuState = () ->
  $('.menu').show()
  $('#menu_items_container').show()
  setChatlock(true)

enterRelationshipState = () ->
  setChatlock(true)
  $('.menu').show()
  $('#menu_items_container').hide()
  $('#data_container').show()

enterAchievementsState = () ->
  setChatlock(true)
  $('.menu').show()
  $('#menu_items_container').hide()
  $('#data_container').show()

enterRewardState = () ->
  setChatlock(true)
  $('.reward').show()

enterOpeningState = () ->
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

changeToPreviousControl = () ->
  changeControlState(window.game_state['previous_control'])

#------------------------------
# Logic around dialogue
# -----------------------------

followDialogue = (dialogue) ->
  changeControlState('Chat')
  dialogue = dialogue.slice() # I really want clone
  window.dialogue = dialogue
  console.log("previous control #{window.game_state['previous_control']}")
  unless window.game_state['previous_control'] == 'Love'
    console.log("IT WAS HERE")
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
  collectAchievement(buildAchievementMessage("Dialogue", window.game_state['location'], window.person, window.dialogue))
  window.intro = false

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
# Logic around Travel!!!
# -----------------------------

getPossibleLinks = () ->
  possible_links = window.game_data['Locations'][window.game_state['location']]['Links']
  console.log(possible_links)
  possible_links

travelToLocation = (location, encounter_possible = true) ->
  return unless window.game_state['control'] == 'Free' or window.game_state['control'] == 'Love'
  changeControlState('Free')
  setChatlock(true)
  console.log "Moving to #{location}"
  window.game_state['location'] = location
  setIndicatorArea(location)
  setDescription(location, 'Location')
  $('#status_location').text(location)
  # Things that happen right when you arrive somewhere :
  setPersonImage(null)
  if encounter_possible
    possiblyEncounterPerson(location)
  else
    changeControlState('Free')
    window.person = null
  collectAchievement(buildAchievementMessage("Travel", location, window.person, window.dialogue))
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

possiblyEncounterPerson = (location) ->
  possible_people = window.game_data['Locations'][location]['People']
  if possible_people != null and ((possible_people.length == 1 and Math.random() > 0.75) or (Math.random() > 0.4))
    encounterPerson(location)

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
  setDescription(person, 'Person')
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
# Logic around Love!!!
# -----------------------------

loveEvent = (level) ->
  current    = window.game_state['love'][window.person]
  difficulty = (6 * Math.pow(level, 3) - 0.1 * current)
  if current == null
    initializeLove(window.person)
  power = Math.random() * 10
  if power > difficulty
    succeedLove(person, level)
  else
    failLove(person, level)

initializeLove = (person) ->
  window.game_state['love'][person] = 1

succeedLove = (person, level) ->
  window.game_state['love'][person] += Math.max(Math.pow((level + 1), 2), -5)
  prepareNextState('Free')
  message = window.game_data['People'][person]['Love']['Success']
  if window.game_state['love'][person] >= 400
    message = window.game_data['People'][person]['Love']['Love']
  if message == undefined
    message = "#{person}: #{window.game_data['Default Love Success']}"
  followDialogue(message)

failLove = (person, level) ->
  window.game_state['love'][person] -= level
  prepareNextState('Free')
  message = window.game_data['People'][person]['Love']['Failure']
  if message == undefined
    message = "#{person}: #{window.game_data['Default Love Failure']}"
  followDialogue(message)

prepareRelationshipTable = () ->
  console.log("relationshipping")
  changeControlState('Relationship')
  container = $('#data_container')
  container.text("")
  for person in window.game_data['People List']
    entry = $(document.createElement('dt'))
    entry.text(person)

    value = $(document.createElement('dd'))
    love_points = window.game_state['love'][person]
    value.text(love_points)
    if love_points < 0
      value.addClass("rel_bad")
    else if love_points < 100
      value.addClass("rel_normal")
    else if love_points < 400
      value.addClass("rel_good")
    else
      value.addClass("rel_best")

    item  = $(document.createElement('div'))
    item.append(entry)
    item.append(value)
    container.append(item)

#------------------------------
# Misc Utility
# -----------------------------

chooseRandomFromList = (list) ->
  list[parseInt(Math.random() * list.length)]

setIndicatorArea = (message) ->
  $('#indicator_area').text(message)

setChatlock = (chatlock) ->
  if chatlock
    window.chatlocked = true
  else
    setTimeout((() -> window.chatlocked = false), 100)

setDescription = (target, type) ->
  if type == 'Location'
    message = window.game_data['Locations'][target]['Description']
  else
    message = window.game_data['People'][target]['Description']
    $('#description_love').text("Love Points: #{window.game_state['love'][window.person]}")
  $('#description_message').text(message)

#------------------------------
# Manage Gameplay
# -----------------------------

activateOpeningMenu = () ->
  changeControlState('Opening')
  setChatlock(true)

  $('#opening_new').click(startNewGame)
  $('#opening_continue').click(continueSavedGame)

initializeNewGame = () ->
  default_love = {}
  no_achievements = []
  for person in game_data['People List']
    default_love[person] = 0
  for ach in game_data['Achievement List']
    achievement = ach
    no_achievements[achievement] = [achievement[0], false, {}]
  window.game_state =
    location: "Home"
    control:  "Free"
    autosave: false
    love: default_love
    achievements: no_achievements
  setAutoSaveButtonState()

startNewGame = () ->
  initializeNewGame()
  startingSequence()

continueSavedGame = () ->
  console.log("trying to continue")
  window.game_state = JSON.parse($.cookie('game_state'))
  setAutoSaveButtonState()
  travelToLocation(window.game_state['location'], false)

startingSequence = () ->
  window.intro = true
  setChatlock(false)
  travelToLocation('The Apartment', false)
  prepareNextState('Free')
  followDialogue(window.game_data['Starting Sequence'])

#------------------------------
# Achievements
# -----------------------------
prepareAchievementData = () ->
  console.log("Building Achievement Record")
  changeControlState('Achievements')
  container = $('#data_container')
  container.text("")
  for achievement in window.game_data['Achievement List']
    record = window.game_state['achievements'][achievement]
    entry = $(document.createElement('div'))
    success = if record[1] then ":)" else "__"
    text = "#{success} -- #{achievement}"
    entry.addClass("ach")
    if record[1]
      entry.addClass("ach_yes")
    else
      entry.addClass("ach_no")
    entry.text(text)
    container.append(entry)

collectAchievement = (message) ->
  console.log("collecting........................")

  # Happy Birthday Nick
  rewardAchievement('Happy Birthday Nick!')

  # Molest Jin
  if message['Action'] == "Travel" and message['Location'] == "Jin's Bed"
    rewardAchievement('Molested Jin')

  # Socially Acceptable
  data = window.game_state['achievements']['Socially Acceptable'][2]
  if message['Action'] == 'Dialogue'
    if data['list'] == undefined
      data['list'] = []
    if data['list'].indexOf(message['Person']) == -1
      unless message['Person'] == null
        data['list'].push(message['Person'])
    if data['list'].length == window.game_data['People List'].length
      rewardAchievement('Socially Acceptable')

  # NERD ALERT
  data = window.game_state['achievements']['NERD ALERT'][2]
  # if message['Action'] == 'Dialogue'

  # Fried Rice
  if window.game_state['love']['Hawaiian Barbecue Guy'] >= 400
    rewardAchievement('Fried Rice')

  # Waifu Status
  if window.game_state['love']['Lilly'] >= 400 or window.game_state['love']['Lydia'] >= 400
    rewardAchievement('Waifu Status')

  # Le Me and the Gf
  if window.game_state['love']['Some Post'] >= 400
    rewardAchievement('Le Me and the Gf')

  # Fatass
  if message['Action'] == "Travel" and message['Location'] == "Chipotle"
    data = window.game_state['achievements']['Fatass'][2]
    if data['count'] == undefined
      data['count'] = 0
    data['count'] += 1
    if data['count'] >= 30
      rewardAchievement('Fatass')

  # Office After Hours
  if window.game_state['love']['Professor'] >= 400
    rewardAchievement('Office After Hours')

  # Through the portal
  data = window.game_state['achievements']['Through The Portal'][2]
  if message['Action'] == 'Travel'
    console.log("whoo")
    if data['list'] == undefined
      data['list'] = []
    data['list'].push(message['Location'])
    if data['list'].length > 3
      data['list'] = data['list'].slice(1)
    if data['list'].length == 3 and data['list'][0] == 'The Apartment' and data['list'][1] == 'Skyrim' and data['list'][2] == "David's Room"
      rewardAchievement("Through The Portal")

rewardAchievement = (achievement) ->
  setTimeout((() ->
    unless window.game_state['achievements'][achievement][1]
      window.game_state['achievements'][achievement][1] = true
      description = window.game_data['Achievements'][achievement]
      changeControlState('Reward')
      $('#reward_message').text("Solved! Achievement: #{achievement} -- #{description}")
  ), 200)

buildAchievementMessage = (action, location, person, dialogue) ->
  console.log("building.........................")
  Action:   action
  Location: location
  Person:   person
  Dialogue: dialogue
