/* This solution makes use of "simple access" to google, providing only an API Key.
    * This way we can only get access to public calendars. To access a private calendar,
    * we would need to use OAuth 2.0 access.
    *
    * Solution from László L. L. on Stack Overflow:
    * https://stackoverflow.com/a/56496854/908059
    *
    * Dependencies: day.js & the localizedFormat plugin for day.js:
    * https://day.js.org/en/
    *
    * "Simple" vs. "Authorized" access: https://developers.google.com/api-client-library/javascript/features/authentication
    * Examples of "simple" vs OAuth 2.0 access: https://developers.google.com/api-client-library/javascript/samples/samples#authorizing-and-making-authorized-requests
    *
    * We will make use of "Option 1: Load the API discovery document, then assemble the request."
    * as described in https://developers.google.com/api-client-library/javascript/start/start-js
    */
function printCalendar () {
  // The "Calendar ID" from your calendar settings page, "Calendar Integration" secion:
  var calendarId = 'da8rrkg0dc8vbbhicdur9screc@group.calendar.google.com';

  // 1. Create a project using google's wizzard: https://console.developers.google.com/start/api?id=calendar
  // 2. Create credentials:
  //    a) Go to https://console.cloud.google.com/apis/credentials
  //    b) Create Credentials / API key
  //    c) Since your key will be called from any of your users' browsers, set "Application restrictions" to "None",
  //       leave "Website restrictions" blank; you may optionally set "API restrictions" to "Google Calendar API"
  var apiKey = 'AIzaSyAIUmj3d66z6C3M75mTOf6c1XnQ3ZM_LJs';

  // You can get a list of time zones from here: http://www.timezoneconverter.com/cgi-bin/zonehelp
  var userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (!userTimeZone) {
    userTimeZone = 'Europe/Stockholm';
  }

  var todayBegins = new Date();
  todayBegins.setHours(0);
  todayBegins.setMinutes(0);
  todayBegins.setSeconds(0);
  var todayEnds = new Date();
  todayEnds.setHours(23);
  todayEnds.setMinutes(59);
  todayEnds.setSeconds(59);

/*   var todayBegins = today.setHours(0).setMinutes(0).setSeconds(0);
  var todayEnds = today.setHours(23).setMinutes(59).setSeconds(59); */
  
  // Initializes the client with the API key and the Translate API.
  gapi.client.init({
    'apiKey': apiKey,
    // Discovery docs docs: https://developers.google.com/api-client-library/javascript/features/discovery
    'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
  }).then(function () {
    // Use Google's "apis-explorer" for research: https://developers.google.com/apis-explorer/#s/calendar/v3/
    // Events: list API docs: https://developers.google.com/calendar/v3/reference/events/list
    return gapi.client.calendar.events.list({
      'calendarId': calendarId,
      'timeZone': userTimeZone,
      'singleEvents': true,
      // 'timeMin': (new Date()).toISOString(), // gathers only events not happened yet
      'timeMin': todayBegins.toISOString(),
      'timeMax': todayEnds.toISOString(),
      'orderBy': 'startTime'
    });
  }).then(function (response) {
    console.log(response); // TODO: Remove!
    if (response.result.items) {
      var getNowPlayingDiv = document.getElementById('js-gcal-event'); // Make sure your HTML has This ID!
      // Create a table with events:
      var calendarRows = ['<table class="gcal-event"><tbody>'];
      response.result.items.forEach(function (entry) {
        var eventDate = dayjs(entry.start.dateTime).format('LT'); // eg: March 26, 2020 6:00 PM
        calendarRows.push('' +
          '<tr>' +
            '<td class="showtime">' + eventDate + '</td>' +
            '<td>' + '<span class="event-title">' + entry.summary + '</span>' + '<br>' + entry.description + '</td>' + 
          '</tr>');
      });
      calendarRows.push('</tbody></table>');
      getNowPlayingDiv.innerHTML = calendarRows.join('');
    }
  }, function (reason) {
    console.log('Error: ' + reason.result.error.message);
  });
}

// Loads the JavaScript client library and invokes `start` afterwards.
gapi.load('client', printCalendar);