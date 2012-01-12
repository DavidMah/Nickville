(function() {
  var activateOpeningMenu, changeAutoSave, changeControlState, chooseRandomFromList, completeDialogue, continueDialogue, continueSavedGame, encounterPerson, enterChatState, enterChoiceState, enterFreeState, enterLoadingState, enterLoveState, enterMenuState, enterOpeningState, enterRelationshipState, exitMenu, failLove, followDialogue, getPossibleLinks, handleMessage, initializeGameData, initializeImages, initializeLove, initializeNewGame, loveEvent, openMenu, possiblyEncounterPerson, prepareNextState, prepareRelationshipTable, recordGameState, setAutoSaveButtonState, setChatlock, setControls, setIndicatorArea, setLocationImage, setPersonImage, setTravelList, setupPerson, startNewGame, startingSequence, succeedLove, testFunctions, travelToLocation;
  $(document).ready(function() {
    testFunctions();
    setControls();
    return initializeGameData();
  });
  testFunctions = function() {
    window.encounterPerson = encounterPerson;
    window.setupPerson = setupPerson;
    window.travelToLocation = travelToLocation;
    window.getPossibleLinks = getPossibleLinks;
    window.recordGameState = recordGameState;
    return window.activateOpeningMenu = activateOpeningMenu;
  };
  initializeGameData = function() {
    var cached_game_state;
    $('.container').hide();
    cached_game_state = $.cookie('game_state');
    window.control_elements.hide();
    $('.loading').show();
    $('#loading_skip').click(activateOpeningMenu);
    return $.get("gamedata/data.json", function(data) {
      window.game_data = data;
      window.chatlocked = false;
      if (cached_game_state === null) {
        initializeNewGame();
      } else {
        window.game_state = cached_game_state;
      }
      initializeImages();
      return setInterval(recordGameState, 15000);
    });
  };
  recordGameState = function(force) {
    var game_state;
    if (force == null) {
      force = false;
    }
    if (force || window.game_state['autosave']) {
      game_state = JSON.parse(JSON.stringify(window.game_state));
      game_state['control'] = 'Free';
      $.cookie('game_state', JSON.stringify(game_state));
      return console.log("game saved");
    }
  };
  initializeImages = function() {
    var image_names, l, p, _i, _j, _len, _len2, _ref, _ref2;
    $('#background_image').error(function() {
      return $(this).hide();
    });
    $('#person_image').error(function() {
      return $(this).hide();
    });
    window.image_data = {};
    image_names = [];
    _ref = window.game_data['People List'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      p = _ref[_i];
      image_names.push("images/" + p + ".png");
    }
    _ref2 = window.game_data['Location List'];
    for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
      l = _ref2[_j];
      image_names.push("images/" + l + ".jpg");
    }
    window.preload = {
      necessary: image_names.length - 4,
      success: 0
    };
    $.each(image_names, function(i, path) {
      var cached_image;
      cached_image = $('<img/>');
      cached_image.addClass('cached_image');
      cached_image.load(function() {
        console.log(path);
        window.preload['success'] += 1;
        $('#progress_bar').width(600 * (1.0 * window.preload['success'] / window.preload['necessary']));
        if (window.preload['success'] >= window.preload['necessary']) {
          if (window.game_state['control'] === 'Loading') {
            return activateOpeningMenu();
          }
        }
      });
      cached_image.attr('src', path);
      window.image_data[path] = cached_image;
      return cached_image.appendTo($("#meta_container"));
    });
    $('#background_image').hide();
    return $('#person_image').hide();
  };
  setControls = function() {
    var action_handler, actions;
    console.log("controls being set");
    actions = {
      32: {
        Chat: continueDialogue
      },
      'click': {
        Chat: continueDialogue
      }
    };
    window.actions = actions;
    action_handler = function(event) {
      var action;
      action = actions[event][window.game_state['control']];
      if (action !== void 0) {
        return action();
      }
    };
    $(document).keypress(function(e) {
      return action_handler(e.which);
    });
    $('#game_container').click(function() {
      return action_handler('click');
    });
    window.control_elements = $('.free').add($('.menu')).add($('.opening')).add($('.chat')).add($('.love')).add($('.loading'));
    $('#menu_button').click(openMenu);
    $('#autosave_button').click(changeAutoSave);
    $('#save_button').click(function() {
      return recordGameState(true);
    });
    $('#menu_opening').click(activateOpeningMenu);
    $('#menu_relationships').click(prepareRelationshipTable);
    $('#love_talk').click(function() {
      return loveEvent(0);
    });
    $('#love_chill').click(function() {
      return loveEvent(1);
    });
    $('#love_footsy').click(function() {
      return loveEvent(2);
    });
    return $('#love_sex').click(function() {
      return loveEvent(3);
    });
  };
  changeAutoSave = function() {
    var current_autostate;
    current_autostate = window.game_state['autosave'];
    window.game_state['autosave'] = !current_autostate;
    return setAutoSaveButtonState();
  };
  setAutoSaveButtonState = function() {
    var next_state;
    next_state = (window.game_state['autosave'] ? "Off" : "On");
    return $('#autosave_button').text("Turn " + next_state + " Autosave");
  };
  changeControlState = function(state) {
    window.game_state['previous_control'] = window.game_state['control'];
    window.game_state['control'] = state;
    window.control_elements.hide();
    switch (state) {
      case 'Loading':
        enterLoadingState();
        break;
      case 'Chat':
        enterChatState();
        break;
      case 'Choice':
        enterChoiceState();
        break;
      case 'Free':
        enterFreeState();
        break;
      case 'Love':
        enterLoveState();
        break;
      case 'Menu':
        enterMenuState();
        break;
      case 'Relationship':
        enterRelationshipState();
        break;
      case 'Opening':
        enterOpeningState();
    }
    console.log("chatlocked " + window.chatlocked);
    return console.log("moving to " + state + " State");
  };
  enterLoadingState = function() {
    return $('.loading').show();
  };
  enterChatState = function() {
    $('.chat').show();
    return setChatlock(false);
  };
  enterChoiceState = function() {
    return setChatlock(true);
  };
  enterFreeState = function() {
    $('.free').show();
    return setChatlock(true);
  };
  enterLoveState = function() {
    $('.free').show();
    $('.love').show();
    return setChatlock(true);
  };
  enterMenuState = function() {
    $('.menu').show();
    $('#menu_items_container').show();
    return setChatlock(true);
  };
  enterRelationshipState = function() {
    setChatlock(true);
    $('.menu').show();
    $('#menu_items_container').hide();
    return $('.relationship_container').show();
  };
  enterOpeningState = function() {
    return $('.opening').show();
  };
  openMenu = function() {
    console.log('open menu');
    changeControlState('Menu');
    $('#menu_button').unbind();
    return $('#menu_button').click(exitMenu);
  };
  exitMenu = function() {
    var previous_state;
    console.log('close menu');
    previous_state = window.game_state['previous_control'];
    changeControlState(previous_state);
    $('#menu_button').unbind();
    return $('#menu_button').click(openMenu);
  };
  followDialogue = function(dialogue) {
    changeControlState('Chat');
    dialogue = dialogue.slice();
    window.dialogue = dialogue;
    if (window.game_state['previous_control'] !== 'Love') {
      return setTimeout(continueDialogue, 100);
    }
  };
  continueDialogue = function(choice) {
    var dialogue;
    if (choice == null) {
      choice = null;
    }
    console.log("continued dialogue");
    if (!window.chatlocked || choice !== null) {
      changeControlState("Chat");
      dialogue = window.dialogue;
      if (dialogue.length > 0) {
        handleMessage(dialogue[0]);
        return window.dialogue = dialogue.splice(1);
      } else {
        return completeDialogue();
      }
    }
  };
  completeDialogue = function() {
    return changeControlState(window.next_state);
  };
  handleMessage = function(message) {
    var c, choice_box, choices, container, i, item, _i, _len, _results;
    if (message instanceof Object) {
      choices = message['Choice'];
      i = 0;
      window.choices = choices;
      container = $('#choice_container').text("");
      _results = [];
      for (_i = 0, _len = choices.length; _i < _len; _i++) {
        c = choices[_i];
        choice_box = $(document.createElement('div'));
        choice_box.addClass('choice_box');
        item = $(document.createElement('button'));
        item.attr("count", i);
        item.addClass('choice_item box');
        item.click(function() {
          return continueDialogue(item.attr("count"));
        });
        item.text(c);
        choice_box.append(item);
        container.append(choice_box);
        console.log("" + i + " -- " + c['Response']);
        _results.push(i += 1);
      }
      return _results;
    } else {
      $("#dialogue_area").text(message);
      return console.log(message);
    }
  };
  getPossibleLinks = function() {
    var possible_links;
    possible_links = window.game_data['Locations'][window.game_state['location']]['Links'];
    console.log(possible_links);
    return possible_links;
  };
  travelToLocation = function(location, encounter_possible) {
    if (encounter_possible == null) {
      encounter_possible = true;
    }
    if (!(window.game_state['control'] === 'Free' || window.game_state['control'] === 'Love')) {
      return;
    }
    setChatlock(true);
    console.log("Moving to " + location);
    window.game_state['location'] = location;
    setIndicatorArea(location);
    $('#status_location').text(location);
    setPersonImage(null);
    if (encounter_possible) {
      possiblyEncounterPerson(location);
    } else {
      changeControlState('Free');
      window.person = null;
    }
    setTravelList(location);
    return setLocationImage(location);
  };
  setTravelList = function(location) {
    var container, item, l, link_container, links, _i, _len, _results;
    container = $('#travel_links').text("");
    links = window.game_data['Locations'][location]['Links'];
    _results = [];
    for (_i = 0, _len = links.length; _i < _len; _i++) {
      l = links[_i];
      link_container = $(document.createElement('div'));
      link_container.addClass('link_container');
      item = $(document.createElement('button'));
      item.addClass('link box');
      item.text(l);
      item.click(function() {
        return travelToLocation($(this).text());
      });
      link_container.append(item);
      _results.push(container.append(link_container));
    }
    return _results;
  };
  setLocationImage = function(location) {
    $('#background_image').attr('src', "images/" + location + ".jpg");
    return $('#background_image').show();
  };
  possiblyEncounterPerson = function(location) {
    var possible_people;
    possible_people = window.game_data['Locations'][location]['People'];
    if (possible_people !== null && ((possible_people.length === 1 && Math.random() > 0.75) || (Math.random() > 0.4))) {
      return encounterPerson(location);
    }
  };
  encounterPerson = function(location) {
    var person, possible_people;
    possible_people = window.game_data['Locations'][location]['People'];
    if (possible_people !== null) {
      prepareNextState('Love');
      person = chooseRandomFromList(possible_people);
      return setupPerson(person);
    }
  };
  setupPerson = function(person) {
    var dialogue, possible_dialogue;
    console.log("Encountered " + person);
    window.person = person;
    setIndicatorArea(person);
    possible_dialogue = window.game_data['People'][person]['Dialogue'];
    dialogue = chooseRandomFromList(possible_dialogue);
    setPersonImage(person);
    return followDialogue(dialogue);
  };
  setPersonImage = function(person) {
    var path, person_element, width;
    person_element = $('#person_image');
    if (person === null) {
      return person_element.hide();
    }
    path = "images/" + person + ".png";
    person_element.attr('src', path);
    person_element.show();
    width = window.image_data[path].width();
    person_element.width(width);
    person_element.height(window.image_data[path].height());
    return person_element.css('margin-left', (800 - width) / 2);
  };
  prepareNextState = function(state) {
    return window.next_state = state;
  };
  loveEvent = function(level) {
    var current, difficulty, power;
    current = window.game_state['love'][window.person];
    difficulty = 6 * level * level - 0.1 * current;
    if (current === null) {
      initializeLove(window.person);
    }
    power = Math.random() * 10;
    if (power > difficulty) {
      return succeedLove();
    } else {
      return failLove();
    }
  };
  initializeLove = function(person) {
    return window.game_state['love'][person] = 1;
  };
  succeedLove = function() {
    console.log(window.game_data['Default Love Success']);
    prepareNextState('Free');
    return followDialogue(window.game_data['Default Love Success']);
  };
  failLove = function() {
    console.log(window.game_data['Default Love Failure']);
    prepareNextState('Free');
    return followDialogue(window.game_data['Default Love Failure']);
  };
  prepareRelationshipTable = function() {
    var container, entry, person, value, _i, _len, _ref, _results;
    console.log("relationshipping");
    changeControlState('Relationship');
    container = $('#relationship_container');
    _ref = window.game_data['People List'];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      person = _ref[_i];
      console.log("rel for " + person);
      entry = $(document.createElement('dt'));
      entry.text(person);
      value = $(document.createElement('dd'));
      value.text(window.game_state['love'][person]);
      container.append(value);
      _results.push(container.append(entry));
    }
    return _results;
  };
  chooseRandomFromList = function(list) {
    return list[parseInt(Math.random() * list.length)];
  };
  setIndicatorArea = function(message) {
    return $('#indicator_area').text(message);
  };
  setChatlock = function(chatlock) {
    if (chatlock) {
      return window.chatlocked = true;
    } else {
      return setTimeout((function() {
        return window.chatlocked = false;
      }), 100);
    }
  };
  activateOpeningMenu = function() {
    changeControlState('Opening');
    setChatlock(true);
    $('#opening_new').click(startNewGame);
    return $('#opening_continue').click(continueSavedGame);
  };
  initializeNewGame = function() {
    var default_love, person, _i, _len, _ref;
    default_love = {};
    _ref = game_data['People List'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      person = _ref[_i];
      default_love[person] = 0;
    }
    window.game_state = {
      location: "Home",
      control: "Free",
      autosave: false,
      love: default_love
    };
    return setAutoSaveButtonState();
  };
  startNewGame = function() {
    initializeNewGame();
    return startingSequence();
  };
  continueSavedGame = function() {
    console.log("trying to continue");
    window.game_state = JSON.parse($.cookie('game_state'));
    setAutoSaveButtonState();
    return travelToLocation(window.game_state['location'], false);
  };
  startingSequence = function() {
    setChatlock(false);
    travelToLocation('The Apartment', false);
    prepareNextState('Free');
    return followDialogue(window.game_data['Starting Sequence']);
  };
}).call(this);
