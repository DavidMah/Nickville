(function() {
  var changeControlState, chooseRandomFromList, completeDialogue, continueDialogue, encounterPerson, enterChatState, enterFreeState, followDialogue, getPossibleLinks, handleMessage, initializeGameData, initializeImages, recordGameState, setControls, setIndicatorArea, setLocationImage, setPersonImage, setTravelList, setupPerson, startingSequence, testFunctions, travelToLocation, triggerChatBox;
  $(document).ready(function() {
    testFunctions();
    initializeGameData();
    return setControls();
  });
  testFunctions = function() {
    window.encounterPerson = encounterPerson;
    window.setupPerson = setupPerson;
    window.travelToLocation = travelToLocation;
    return window.getPossibleLinks = getPossibleLinks;
  };
  initializeGameData = function() {
    var cached_game_state;
    $('.container').hide();
    cached_game_state = $.cookie('game_state');
    if (cached_game_state !== null) {
      cached_game_state = JSON.parse(cached_game_state);
    }
    return $.get("gamedata/data.json", function(data) {
      window.game_data = data;
      initializeImages();
      if (cached_game_state === null) {
        window.game_state = {
          location: "Home",
          control: "Free"
        };
        startingSequence();
      } else {
        window.game_state = cached_game_state;
        travelToLocation(window.game_state['location'], false);
      }
      return setInterval(recordGameState, 15000);
    });
  };
  recordGameState = function() {
    var game_state;
    game_state = window.game_state;
    game_state['control'] = 'Free';
    $.cookie('game_state', JSON.stringify(game_state));
    return console.log("game saved");
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
    $.each(image_names, function(i, path) {
      var cached_image;
      cached_image = $('<img/>');
      cached_image.addClass('cached_image');
      cached_image.attr('src', path);
      window.image_data[path] = cached_image;
      return cached_image.appendTo($("#meta_container"));
    });
    $('#background_image').hide();
    return $('#person_image').hide();
  };
  setControls = function() {
    var actions;
    console.log("controls being set");
    actions = {
      32: {
        Chat: continueDialogue
      }
    };
    window.actions = actions;
    return $(document).keypress(function(e) {
      var action;
      action = actions[e.which][window.game_state['control']];
      if (action !== void 0) {
        return action();
      }
    });
  };
  changeControlState = function(state) {
    window.game_state['control'] = state;
    switch (state) {
      case 'Chat':
        console.log("moving to Chat State");
        return enterChatState();
      case 'Free':
        console.log("moving to Free State");
        return enterFreeState();
    }
  };
  enterChatState = function() {
    $('.free').hide();
    return $('.chat').show();
  };
  enterFreeState = function() {
    $('.chat').hide();
    return $('.free').show();
  };
  followDialogue = function(dialogue) {
    changeControlState('Chat');
    dialogue = dialogue.slice();
    window.dialogue = dialogue;
    return continueDialogue();
  };
  continueDialogue = function() {
    var dialogue;
    dialogue = window.dialogue;
    if (dialogue.length > 0) {
      handleMessage(dialogue[0]);
      return window.dialogue = dialogue.splice(1);
    } else {
      return completeDialogue();
    }
  };
  completeDialogue = function() {
    return changeControlState('Free');
  };
  handleMessage = function(message) {
    var c, choices, i, _i, _len, _results;
    if (message instanceof Object) {
      choices = message['Choice'];
      i = 0;
      window.choices = choices;
      _results = [];
      for (_i = 0, _len = choices.length; _i < _len; _i++) {
        c = choices[_i];
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
    console.log("Moving to " + location);
    window.game_state['location'] = location;
    setIndicatorArea(location);
    setPersonImage(null);
    if (encounter_possible && Math.random() > 0.4) {
      encounterPerson(location);
    } else {
      changeControlState('Free');
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
  encounterPerson = function(location) {
    var person, possible_people;
    possible_people = window.game_data['Locations'][location]['People'];
    if (possible_people !== null) {
      person = chooseRandomFromList(possible_people);
      return setupPerson(person);
    }
  };
  setupPerson = function(person) {
    var dialogue, possible_dialogue;
    console.log("Encountered " + person);
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
  chooseRandomFromList = function(list) {
    return list[parseInt(Math.random() * list.length)];
  };
  setIndicatorArea = function(message) {
    return $('#indicator_area').text(message);
  };
  triggerChatBox = function() {
    var visibility, _ref;
    visibility = $("#chatbox").visibility;
    return $("#chatbox").visibility = (_ref = visibility === "hidden") != null ? _ref : {
      "visible": "hidden"
    };
  };
  startingSequence = function() {
    travelToLocation('The Apartment', false);
    return followDialogue(window.game_data['Starting Sequence']);
  };
}).call(this);
