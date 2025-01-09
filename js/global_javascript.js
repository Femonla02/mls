/*
 * COPYRIGHT INFORMATION - DO NOT REMOVE
 *
 * Copyright (c) LinuxMagic Inc. 2018-2020 All Rights Reserved
 *
 * This file contains Original Code as created by LinuxMagic Inc.
 *
 * The Original Code is distributed on an 'AS IS' basis,
 * WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, AND LINUXMAGIC
 * HEREBY DISCLAIMS ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, QUIET
 * ENJOYMENT OR NON-INFRINGEMENT.
 *
 * Do NOT download, distribute, use or alter this software or file in any
 * way without express written permission from LinuxMagic Inc. or its parent
 * company Wizard Tower TechnoServices signed by an authorized company officer.
 *
 * Author(s): Rares Harnagea <rares@linuxmagic.com>
 *            Arturo Gamez <arturo@linuxmagic.com>
 *
 * $Id: global_javascript.js 48885 2024-05-24 20:54:48Z shaun $
 */
//<!-- $Id: global_javascript.js 48885 2024-05-24 20:54:48Z shaun $ -->

//<!-- Global Javascript File for the MagicMail Server -->
//<!-- Hide from unsuspecting browsers

// set up a namespace object - 'mm' - to avoid naming collisions.
if (!MM) {
    var MM = {};
}

// ------------------------------------------------------------------------
// -- First section should be for javascript used in both admin and user
// ------------------------------------------------------------------------

// global vars for mouse tracking...
var mouse_x = 0;
var mouse_y = 0;
var IE = document.all ? true : false;

/*
 * getMousePos()
 *
 * call back to the event listener to track the mouse cursor.
 */
function getMousePos(e) {
    if (IE) {
        // in ie8 standards mode we use 'document.documentElement', but in
        // quirks mode we want to use 'document.body'.
        mouse_x = event.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft);
        mouse_y = event.clientY + (document.documentElement.scrollTop || document.body.scrollTop);
    } else {
        mouse_x = e.pageX;
        mouse_y = e.pageY;
    }
}

/*
 * This should take place as soon as the script loads to register
 * the event handlers correctly.
 */
if (window.Event) {
    // ie8 standards mode does not have document.captureEvents - nor does
    // it seem to need it.
    if (document.captureEvents) {
        document.captureEvents(Event.MOUSEMOVE);
    }
}
document.onmousemove = getMousePos;

// Function for adding events to HTML tags, ie add an on click event to a span
function addListener(elementId, eventName, eventHandler) {
    var target = document.getElementById(elementId);
    if (target) {
        if (target.addEventListener) {
            target.addEventListener(eventName, eventHandler, false);
        } else if (target.attachEvent) {
            target.attachEvent("on" + eventName, eventHandler);
        }
    }
}

// Function that will fade a Help element to nothing
function fadeOut(id, fadelevel, originalOpacity) {
    var target = document.getElementById(id);
    var newfadelevel = fadelevel;
    if (target) {
        if (newfadelevel > 0) {
            newfadelevel -= 10;
            if (document.all) {
                target.style.filter = 'alpha(opacity=' + newfadelevel + ')';
            } else {
                target.style.opacity = newfadelevel / 100;
            }
            setTimeout("fadeOut('" + id + "', " + newfadelevel +", " + originalOpacity + ")", 50);
        } else {
            hideId(id);
            if (document.all) {
                target.style.filter = 'alpha(opacity=' + originalOpacity + '90)';
            } else {
                target.style.opacity = originalOpacity / 100;
            }
        }
    }
}

// Show help without the need for a popup
function displayHelp(e, id) {

    getMousePos(e);

    var target = document.getElementById(id);
    var x = y = 0;

    x = mouse_x + 20;
    y = mouse_y - 20;

    // the magicWrapper it's using position: relative
    // so now we need to offset the viewport to the magicWrapper
    var wrapper = document.getElementById('MagicWrapper');
    if (wrapper !== null && wrapper !== undefined) {
        x -= wrapper.getBoundingClientRect().x;
    }
    
    target.style.position="absolute";
    target.style.top = y + "px";
    target.style.left = x + "px";
    target.style.display = "block";
    
}

// Hide help, though could be used for any html object with an id
function hideId(id) {
    var target = document.getElementById(id);
    if (target) {
        target.style.display = 'none';
    }
}

// TODO: Deprecated
// NOTE: This function opens a popup window for help. 
//       However, a new function showHelpModal(id) will be used instead to open a modal window. 
//       Please update to use the new function if you encounter this function being used.
//! Show a help file for a particular ID in a popup window
/*!
 * @param string id   help file name
 *
 * @return void
 */
function showHelp(id) {
    // path of where (URL path) we are when we click the help link
    var pathName = window.location.pathname;
    // regex to check whether admin is in the url
    var regexObj = /^\/admin\//;

    // if we're in an admin page we want to keep /admin/
    // in the URL so the correct show-help.php is opened
    // (one that has access to the admin help files)
    var newUrl;
    if (regexObj.test(pathName)) {
        newUrl = 'show-help.php?rule=' + id;
    // otherwise we want to access the user level show-help
    // (for webmails & user interface)
    } else {
        newUrl = '/show-help.php?rule=' + id;
    }

    var helpwin = window.open(newUrl, 'mmruleshelp', 'width=450,height=450,status=yes,resizable=yes,scrollbars=yes');
    // if it's open in the background, the user may not know it, so focus it
    helpwin.focus();
}

//! Show a help file for a particular ID in a modal window
/*!
 * @param string id   help file name
 *
 * @return void
 */
function showHelpModal(id) {
    // path of where (URL path) we are when we click the help link
    var pathName = window.location.pathname;
    // regex to check whether admin is in the url
    var regexObj = /^\/admin\//;

    // if we're in an admin page we want to keep /admin/
    // in the URL so the correct show-help.php is opened
    // (one that has access to the admin help files)
    var newUrl;
    if (regexObj.test(pathName)) {
        newUrl = 'show-help.php';

    // otherwise we want to access the user level show-help
    // (for webmails & user interface)
    } else {
        newUrl = '/show-help.php';
    }

    // set the title name
    var title = id.replace(/_/g, ' ');
    title = title.replace(/\b\w/g, function(char) {
        return char.toUpperCase();
    });

    // AJAX request
    $.ajax({
        type: 'POST',
        url: newUrl,
        data: { rule: id },
        success: function(data) {
            if (data.status == 'error') {
                // add title to the modal header
                $('#helpModal').find('.modal-box__header').html('<h2>' + data.data.title + '</h2>');
                // add response data to the modal content
                $('#helpModal').find('.modal-box__details').html(data.message);
                // call the function to open the modal
                mmOpenModalBox('helpModal');
                return;
            }

            if (data.status == 'success') {
                // add title to the modal header
                $('#helpModal').find('.modal-box__header').html('<h2>' + data.data.title + '</h2>');
                // add response data to the modal content
                $('#helpModal').find('.modal-box__details').html(data.data.body);
                // call the function to open the modal
                mmOpenModalBox('helpModal');
                return;
            }
        }
    });
}

// Show a desc for a particular Template in a popup window
function showHelpDesc(desc)
{
    var helpwin = window.open('', 'Help', 'width=450,height=250,resizable=yes,scrollbars=yes');

    // if it's open in the background, the user may not know it, so focus it
    helpwin.document.open();
    helpwin.document.write(desc);
    helpwin.document.close();
    helpwin.focus();
}

// ------------------------------------------------------------------------
// -- All functions below here should be for admin_javascript.js
// ------------------------------------------------------------------------

function redirect_if_logged_on_as_admin() {
    var l_url = document.location.href;

    if ((document.cookie.length > 0) && (document.cookie.indexOf('magicmail_admin_auth=') >= 0)) {
        if (l_url.substr(0,l_url.indexOf(".html"))) {
            document.location.href = l_url.substr(0,l_url.indexOf(".html")) + ".php";
        } else {
            document.location.href = l_url + "index.php";
        }
    }

    return false;
};

function warnDelete() {
    if (! confirm("Warning!\nAre you sure you wish to delete?")) {
        return false;
    }
    return true;
}

//--------------------------------------------------------------------------
// function to perform validation on new domain addition
//
// @param   object      the domain form being submitted
// @param   integer     the maximum domain name length limit before warning
// @param   string      the warning message to throw if length limit is reached
//
// NOTE: this function really doesn't belong in global_javascript... but
//       retaining for now until better restructure can be achieved.
//--------------------------------------------------------------------------
function submitDomain(theForm, maxlimit, msg) {
    // base sanity test
    if (!theForm || !maxlimit || !parseInt(maxlimit) || !msg) {
        return false;
    }

    // determine if this requires passwords...
    let require_passwords = true;

    // if this is a system/hosting account form....
    if (theForm.system_domain_is_alias && theForm.system_domain_is_alias.value == 'true') {
        require_passwords = false;
    } else if (theForm.user_domain_is_alias && theForm.user_domain_is_alias.value == 'true') {
        require_passwords = false;
    }

    if (require_passwords) {
        // we must have a password
        if (!theForm.new_password.value.length) {
            theForm.new_password.focus();
            return false;
        }
        // and confirmation password
        if (!theForm.new_confirm_password.value.length) {
            theForm.new_confirm_password.focus();
            return false;
        }
        
    }
    // those passed - test to see if we need to show confirmation message
    if (theForm.new_domain.value.length > maxlimit) {
        return confirm(msg);
    }

    // if we are here then all is well - we'll leave the rest up to the post handler
    return true;
}

// --------------------------------------------------------------------------
// function to return the browser detected time zone GMT offset.
function detectTimeZone() {
    // NOTE: The below method (getTimezoneOffset) has been known to fail for
    // daylight savings times in the southern hemisphere for certain browsers.
    return ((new Date()).getTimezoneOffset() / 60 ) * -1;
}

// enable an element, and disable an element, based on if a 'select' box has something selected.
function toggleListSelection(selectElement, enableMe, disableMe) {
    // sanity check for minimum elements
    if ( typeof(selectElement) == 'undefined' ||
         typeof(enableMe) == 'undefined') {
        return;
    }
    var i = 0;
    var count = 0;
    // we start the count at '1' since the elements we're dealing have option '0' as empty.
    for (i = 0; i < selectElement.options.length; i++) {
        if (selectElement.options[i].selected) {
            count++;
        }
    }
    if (count > 0) {
        enableMe.disabled = false;
        if (typeof(disableMe) != 'undefined') {
            disableMe.disabled = true;
        }
    } else {
        enableMe.disabled = true;
        if (typeof(disableMe) != 'undefined') {
            disableMe.disabled = true;
        }
    }
}

//! Function to expand / collapse the Data Maintaince->Summary of Packages page 
/*!
 * @param   int  tab number to open 
 *
 * @return  void
 *
 * @author  Anonymous
 */
function toggleGroup(groupid) {
    try {
        groupinfo  = document.getElementById("td" + groupid);
        grouptitle = document.getElementById("title" + groupid);
    } catch(e) {
        return false;
    }

    if (grouptitle.innerHTML.substr(0,1) == '+') {
        groupinfo.style.display = '';
        grouptitle.innerHTML = '-' + grouptitle.innerHTML.substr(1, grouptitle.innerHTML.length);
    } else {
        groupinfo.style.display = 'none';
        grouptitle.innerHTML = '+' + grouptitle.innerHTML.substr(1, grouptitle.innerHTML.length);
    }
    return;
}

//! set set of checkboxes checked or unchecked
/*!
 * @param string className Class name of the checkboxes
 * @param bool check Whether to set the checkboxes checked or unchecked
 *
 * @return void
 *
 * @author William Storey <william@linuxmagic.com>
 */
MM.checkUncheckAll = function(className, check) {
    if (typeof className !== 'string' || className.length === 0
        || typeof check !== 'boolean') {
        return;
    }

    // get all elements with this class name
    // we don't use getElementsByClassName since IE8 doesn't support it.

    // first find all input elements.
    eles = document.getElementsByTagName('input');
    // look for those with our class name.
    for (var i = 0; i < eles.length; i++) {
        if (eles[i].className !== className || eles[i].hasAttribute("disabled")) {
            continue;
        }
        eles[i].checked = check;
    }
};

//! Function to expand / collapse the Data Maintaince->Summary of Packages page
/*!
 * @param   int      modalId       the html id of the modal
 * @param   callable closeCallback Callback function to call when closing a modal (optional)
 *
 * @return  void
 *
 * @author Logan Borean <loganb@linuxmagic.com>
 */
MM.mmOpenModal = function(modalId, closeCallback) {
    if (modalId === undefined || typeof modalId !== 'string') {
        return;
    }

    var modal = $('#' + modalId);

    if(modal.length === 0) {
        return;
    }
    modal.show();

    // When the user clicks on <span> (x), close the modal
    modal.find('.mm-modal-close').click(function() {
        $(modal).css('display', 'none');
        if (typeof closeCallback === 'function') {
            closeCallback();
        }
    });

    // When the user clicks on <span> (x), close the modal
    modal.find('.mm-modal-footer button[name=close]').click(function() {
        $(modal).css('display', 'none');
        if (typeof closeCallback === 'function') {
            closeCallback();
        }
    });

    // clicking outside of the modal should close it
    modal = modal.get(0);
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            if (typeof closeCallback === 'function') {
                closeCallback();
            }
        }
    }
};
//! Helper function to scrol to an selector  
/*!
 * @param   string selector, the ID or class and combination of both must include '#' or '.'
 *
 * @returns void 
 *
 * @author  Rares Harnagea <rares@linuxmagic.com>
 */
function scrollToId(selector) {
    if (selector === undefined || typeof selector !== 'string') {
        return;
    }
    var el = $(selector);
    if (el.length !== 1) {
        return;
    }

    $([document.documentElement, document.body]).animate({
        scrollTop: el.offset().top
    }, 2000);
}

// This is needed for the admin interface, user interface, webmail lite, and
// tuxedo
/*
 * This function is the onsubmit handler for the form submission when adding a
 * new domain to the whitelist or blacklist. The purpose here is to display a
 * confirmation box to make sure that the user understands that they are trying
 * to submit a whole domain instead of a single address
 *
 * @author Steven Hall <stevenh@linuxmagic.com>
 */
function warnUserAboutDomainOnlyEntry(form) {
    // Check to see if the entered value is just a domain
    if (form !== undefined) {
        // If the submitted form is passed, then use it.
        var value = $(form).find('input[type=text]').val();
    } else {
        // If we were not passed a form, then we will get our entry this way
        var value = document.getElementById('new_entry').value;
    }
    var new_entry = value.split('@');

    // If we didn't get an expected result, submit the form. There is probably
    // something wrong with the input that the backend will catch
    if (new_entry.length !== 2) {
        return true;
    }
    // Check to see if the information before the @ sign is empty
    if (new_entry[0].trim() === '') {
        // If it is, then we were passed just a domain and we should warn the
        // user
        var msg = "You have requested to add a rule for an entire domain.\n\n";
        msg += "Please confirm that you wish to add the entire domain of "+ value +".\n\n";
        msg += "Adding broad whitelist entries carries additional risk as spammers may forge their identity and bypass normal spam protections through this entry. It is normally better to add entries for specific email addresses.";

        var confirmation = confirm(msg);
        if (!confirmation) {
            // Don't submit the form
            return false;
        }
    }
    // Submit the form
    return true;
}

//! New string method to strip the HTML tags from a string and getting just the
//  left over text content
/*!
 *
 * @returns string text content of the string
 *
 * @author  Steven Hall <stevenh@linuxmagic.com>
 */
String.prototype.stripHTML = function() {
    // temporary element
    var temp = document.createElement("div");
    // Set the html of that element to our html string
    temp.innerHTML = this;
    // Extract the text content
    return temp.textContent || temp.innerText || '';
}

//! Validates the server response structure
/*!
 *
 * @param object response
 *
 * @returns bool
 *
 * @author  Steven Hall <stevenh@linuxmagic.com>
 */
function checkServerResponse(response) {
    // If the response is not defined or is not an object then fail right away.
    if (response === undefined) {
        MM.log('Server response is undefined. Response validation failed');
        return false;
    }
    if (typeof response !== 'object') {
        MM.log('Server response is not an object. Response validation failed');
        return false;
    }

    // Response MUST have a status
    if (!response.hasOwnProperty('status')) {
        MM.log('Server response is missing a status. Response validation failed');
        return false;
    }
    // Response MUST have a message
    if (!response.hasOwnProperty('message')) {
        MM.log('Server response is missing a message. Response validation failed');
        return false;
    }
    // Response MUST have data
    if (!response.hasOwnProperty('data')) {
        MM.log('Server response is missing its data. Response validation failed');
        return false;
    }

    // the status must be a string
    if (typeof response.status !== 'string') {
        MM.log('Server response status is incorrectly typed');
        return false;
    }
    // The data must be an object (doesn't matter if it is empty)
    if (typeof response.data !== 'object') {
        MM.log('Server response data is incorrectly typed');
        return false;
    }
    // Message must be a string
    if (typeof response.message !== 'string') {
        MM.log('Server response message is incorrectly typed');
        return false;
    }
    // If all of this passes, then we have a good response.
    return true;
}

//! Cross browser log function. IE console.log doesn't work if the console is
//  not open by default.
/*!
 * @param   mixed msg The message to log
 *
 * @returns void
 *
 * @author  Steven Hall <stevenh@linuxmagic.com>
 */
// TODO: This should be added to a global JS file that is common to all
// projects.
MM.logs = [];
MM.log = function(msg) {
    if (window.console) {
        console.log(msg);
    }

    // We will also keep a record of the last 20 logs, but more importantly,
    // this is meant to stop IE from failing due to the window.console not being
    // available unless the console is actually open.

    // For this case, save our logs to a variable instead.
    MM.logs.push(msg);

    // Remove elements from the logs array until the size of the array is 20.
    while (MM.logs.length > 20) {
        MM.logs.shift();
    }
}

// Try to set a cookie with the users Timezone
if (navigator.cookieEnabled) {
    var cookieString = 'userTimezone=' + new Date().getTimezoneOffset();
    cookieString += ';path=/;SameSite=Lax;';
    document.cookie = cookieString;
    cookieString = 'userTimezoneName=' + Intl.DateTimeFormat().resolvedOptions().timeZone;
    cookieString += ';path=/;SameSite=Lax;';
    document.cookie = cookieString;
} else {
    MM.log('Failed to get user timezone.');
}

//! this function responds to requests to show ICS event details
/*!
 * TODO: this doesn't really belong in global_javascript.js... this is calendar
 *       invite specific.... but... leaving alone for now as this is the only
 *       reliable script always included in all mail interfaces that need it.
 */
function showEventDetails() {
    var myelement = document.getElementById('MMICSPreviewDetailsButton');
    if (!myelement) {
        console && console.log('details button element not found');
        return;
    }
    var previewElements = document.getElementsByClassName('event-preview-container');
    if (previewElements.length !== 1) {
        console && console.log('Failed to find preview container');
        return;
    }
    var eventPreview = previewElements[0];

    var curvalue = myelement.innerHTML.trim();
    if (curvalue === 'Show Details') {
        myelement.innerHTML = 'Hide Details';
        eventPreview.style.display = 'block';
    } else {
        myelement.innerHTML = 'Show Details';
        eventPreview.style.display = 'none';
    }
}

//! Helper function that will send a browser notification
/*!
 * @param   string text, the message that you want to push
 *
 * @returns void
 *
 * @author  Logan Borean <logan@linuxmagic.com>
 *          Rares Harnagea <rares@linuxmagic.com>
 */
MM.desktopNotification = function(pushMessageText, title) {
    title = title || 'Web Calendar Notification'; // <<< GRRRRRRRRR... this ain't global is it!

    if (pushMessageText === undefined && typeof pushMessageText !== 'string') {
        MM.log('no body');
        return;
    }

    if (title === undefined && typeof title !== 'string') {
        MM.log('no title ');
        return;
    }
    // If the browser does not support Notification or notifications have been
    // denied by the user, then display an alert notification instead
    if (!("Notification" in window) || Notification.permission === "denied") {
        alert('Event Alert: ' + pushMessageText);
        return;
    }

    // If we have permission, then use the notification to display our
    // notification
    if (Notification.permission === "granted") {
        var notification = new Notification(title, {body: pushMessageText});
        return;
    }

    // we do not have permission to use notifications. So, don't do anything.

    // In order to request permission to use notifications, make an explicit
    // call to MM.requestNotificationPermission()
}

//! Handler to trigger the display of an event on the
//! event 'plugin.icalendar_display_notifications'
/*!
 * @param   object events, the event that trigger
 *
 * @returns void
 *
 * @author  Logan Borean <loganb@linuxmagic.com>
 */
MM.displayEventNotifications = function(events) {
    var startDate, endDate, title, msg;

    // Loop through the events object
    for (var i in events) {
        // We are interested only in the events that have the key 'i' as int
        if (i === 'event') {
            continue;
        }

        // Check to see if we have each property, and assign it to a
        // corresponding variable
        if (events[i].hasOwnProperty('startTime')) {
            startDate =  MM.dateToStrTime(parseInt(events[i].startTime));
        }
        if (events[i].hasOwnProperty('endTime')) {
            endDate =  MM.dateToStrTime(parseInt(events[i].endTime));
        }
        if (events[i].hasOwnProperty('title')) {
            title = events[i].title;
        }

        // Generate our notification message
        msg = startDate + '-' + endDate + '  ' + title;

        // Display the desktop notification
        MM.desktopNotification(msg);
    }
};

//! Helper function to convert unix time into a human readable form
/*!
 * @param   int seconds, time in seconds that we want to convert
 *
 * @returns
 *
 * @author  Rares Harnagea <rares@linuxmagic.com>
 */
MM.dateToStrTime = function (seconds) {
    if (seconds === undefined || isNaN(seconds)) {
        return;
    }

    // Date() object expects milliseconds, so multiply our seconds by 1000
    var dateTime = new Date(seconds * 1000);
    // Get the hour and minute of the day
    var hours   = dateTime.getHours();
    var minutes = dateTime.getMinutes();

    // Deduce whether this is an am or pm time
    var ampm = hours >= 12 ? 'pm' : 'am';
    // Get the hours as a 12 hour time
    hours = hours % 12;
    // If 0, then it is 12am, so assign 12 to hours
    hours = hours ? hours : 12;

    // 0 pad the minutes if less than 10
    minutes = minutes < 10 ? '0'+minutes : minutes;

    // Now put everything together to get the string time
    var strTime = hours + ':' + minutes + '' + ampm;
    return strTime;
}

//! Helper function that request user permission to allow notifications
/*!
 *
 * @returns void
 *
 * @author  Rares Harnagea <rares@linuxmagic.com>
 */
MM.requestNotificationPermission = function() {
    // If the browser does not support Notification or they denied
    if (!("Notification" in window) || Notification.permission === "denied" ||
        Notification.permission === "granted") {
        return;
    }

    // we do not have permission, so we need to request for permission
    Notification.requestPermission();
}

//! This function makes an AJAX request to add an invitation to the calendar
/*!
 * @param   object e          Click Event
 * @param   string usersEmail The email address of the user that is
                              accepting/declining the invitation
 * @param   bool   accepted   Whether or not the user is accepting the invite
 *
 * @returns void
 */
addEventInvitationToCalendar = function(e, usersEmail, accepted) {
    // Make sure we get an event object
    if (e === undefined || typeof e !== 'object') {
        return;
    }

    // Get the event preview that contains data about the event, and the buttons
    // to accept or decline the event
    var eventPreview = e.target.closest('.event-notification-container').getElementsByClassName('event-preview');
    if (eventPreview.length !== 1) {
        return;
    }
    eventPreview = $(eventPreview[0]);

    // Get the event data items.
    let eventValues = eventPreview.find('.event-value');

    // and a handle to the 'title'.
    let inviteTitle = eventPreview.find('.invite-title')[0];

    // Prepare the AJAX payload to accept the invitation and act as our container.
    var obj = {
    }

    eventValues.each(function(idx) {
        obj[$(this).attr('data-event-title')] = $(this).attr('data-event-value');
    });

    var payload = '';

    payload += '_start=' + encodeURIComponent(obj.start);
    payload += '&_end=' + encodeURIComponent(obj.end);
    payload += '&_description=' + encodeURIComponent(obj.description);
    payload += '&_location=' + encodeURIComponent(obj.location);
    payload += '&_title=' + encodeURIComponent(obj.title);

    // Submit the request
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var response = JSON.parse(this.response);

            // If not successful, then display an error
            if (response.status !== 'success') {
                // Tuxedo
                if (window.rcmail) {
                    rcmail.display_message(response.message, response.status);
                } else {
                    FW.notify(response.message, 'warning');
                }
            } else {
                if (window.rcmail) {
                    rcmail.display_message(response.message, 'confirmation');
                } else {
                    FW.notify(response.message, 'info');
                }
                // i18n? how?
                inviteTitle.append(' (On Calendar)');

                document.getElementsByClassName('add-cal-btn')[0].remove();
            }
        } else if (this.readState == 4){
            // Tuxedo
            if (window.rcmail) {
                rcmail.display_message('An unknown error has occurred', 'error');
            }
        }
    };

    // TODO: use tuxedo or portal ajax targets.... this stand alone ajax handler
    //       is ripe for abuse...
    var target = '/ajax_accept_decline_event_invite.php';

    xhttp.open("POST", target, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(payload);
}


//! For multilists, set the hidden input optlist with the currently selected
//! values so that they will submit to the form
/*!
 *
 * @returns void
 *
 * @author  Unknown
 *          Steven Hall <stevenh@linuxmagic.com>
 */
function submitter() {
    // Find the select options for the enabled list
    var $selected = $('select[name="selected"] > option');

    // Keep track of action
    var action = "";

    // Add each selected value to our action separated by pipes
    $selected.each(function(idx, value) {
        var val = $(value).val();
        if (val !== '') {
            action += '|' + encodeURIComponent(val);
        }
    });

    // Find the hidden input optlist
    var $optList = $('input[name="optlist"]');

    if ($optList.val() === '') {
        // If the optlist is empty then use the action as is, but take away the
        // leading pipe
        action = action.substring(1,action.length);
    } else {
        // If we have an optlist, then just append the action to it
        action = $optList.val() + action;
    }

    // set the new optlist
    $optList.val(action);
}

//! Click event for multilist to move value to the selected multi list
/*!
 * @param   object sourceclicker The button that was clicked to trigger this call
 * @param   bool   addValue      Whether we are adding values or removing
 *
 * @returns void
 *
 * @author  Unknown
 */
function move_value(sourceclicker, addValue) {
    if (typeof addValue !== 'boolean') {
        return;
    }

    // Source and destination sections
    var s;
    var d;

    if (addValue) {
        s = window.document.select.selectees;
        d = window.document.select.selected;
    } else {
        d = window.document.select.selectees;
        s = window.document.select.selected;
    }

    var selected_arr = new Array();

    // Must go in reverse, because "=null" will cause reindexing of the selection list
    var counter = 0;
    for (var i = s.length-1; i >= 0; i--) {
        var item = s.options[i];
        if (item.value == "") {
            continue;
        }
        if (item.selected) {
            selected_arr[counter] = new Option(item.text, item.value);
            counter++;
            s.options[i] = null;
        }
    }
    for (var j = counter - 1; j >= 0; j--) {
        d.options[d.length] = selected_arr[j];
    }
    sourceclicker.disabled = true;
}

//! utility function for getting a cookie value in Javascript
/*!
 * @param   string  the cookie name
 *
 * @return  string  the cookie value, or null if not found
 */
function mmGetCookie(cname) {
    // prepare the name string part we really need to locate
    let cookiename = cname + "=";

    // decode the existing cookies
    let decodedCookie = decodeURIComponent(document.cookie);
    
    // split the cookies into a list
    let cookies = decodedCookie.split(';');
    for(let i = 0; i < cookies.length; i++) {
        let c = cookies[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(cookiename) == 0) {
            return c.substring(cookiename.length, c.length);
        }
    }
    return null;
}

//! utility function to set a cookie value in Javascript
/*!
 * @param	string	the name of the cookie to set
 * @param   string  the value of the cookie to set
 * @param   int     the number of days for the cookie lifetime
 *
 * @return  void    if this is a browser that blocks cookies, 
 *                  JS has no real way to deal with it. If
 *                  a user tries to use our applications with
 *                  cookies blocked / disabled, there are a
 *                  lot of issues that can occur, so not
 *                  going to sweat it here.
 *
 * NOTE: there is no 'real' way to set a never expiring
 *       cookie.  If you need that, then use a ridiculously large
 *       expiry days argument to work around it - something like
 *       36500 (100 years)
 */
function mmSetCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;SameSite=none; Secure";
}



//! Function to generate the content of the information sections doing an AJAX 
//  request. this will pass 2 i18n labels and some values if needed.
/*!
 * @param   string  the i18n label responsible to print the title of the modal,
 *                  this i18n doesn't accept any params, so it MUST be hardcoded
 * @param   string  the i18n label responsible to print the content of the modal
 *                  you can pass values to this label if needed
 * @param   string  (optional) you can pass zero or as many as you need values,
 *                  this values will feed the content of the i18n label, if the
 *                  label doesn't require any value then you can leave this 
 *                  option empty
 */
function mmGetInfoTool(title, content, ...variables) {
    // validate the parameters
    if ((title == null || title.trim() == '')
       || (title == null || title.trim() == '')) {
        return;
    }

    // get and validate the info modal
    let modal_element = document.getElementById('info_tool_modal');
    if (modal_element == null) {
        return;
    }

    // get the title and content elements of the modal
    var titleElement = modal_element.querySelector('.modal-box__header h2');
    var contentElement = modal_element.querySelector('.modal-box__details');

    // prepare the AJAX call
    let ajaxURL = '/ajax.info-tool.php';
    let ajaxData = {
        'title': title,
        'content': content,
        'i18n_variables': JSON.stringify({array_i18n_variables: variables}),
    }

    $.ajax({
        type: 'POST',
        url: ajaxURL,
        data: ajaxData,
        success: function(res) {
            titleElement.innerHTML = 'Unexpected Error';
            // show the modal with the error details if any error
            if (res.status == 'error') {
                contentElement.innerHTML = res.message;
                mmOpenModalBox('info_tool_modal');
                return;
            }
            // validate that the data is not empty
            if (res.data == undefined || res.data.length < 0 
               || res.data.title == '' || res.data.title == undefined
               || res.data.content == '' || res.data.content == undefined) {
                contentElement.innerHTML = 'The information is NOT available, please contact support';
                mmOpenModalBox('info_tool_modal');
                return;
            }

            // show the modal with the content if no errors
            titleElement.innerHTML = res.data.title;
            contentElement.innerHTML = res.data.content;
            mmOpenModalBox('info_tool_modal');
        },
    });
}