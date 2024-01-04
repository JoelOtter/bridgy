import './browser-polyfill.js'

import {login} from './common.js'
import {Instagram} from './instagram.js'
import {Facebook} from './facebook.js'

/* Local storage schema for this extension:
 *
 * browser.storage.sync:
 *   token: [string]
 *
 * browser.storage.local:
 *   [silo]-bridgySourceKey: [string],
 *   [silo]-lastStart: [Date],
 *   [silo]-lastSuccess: [Date],
 *   [silo]-post-[id]: {
 *     c: [integer],  // number of commenst
 *     r: [integer],  // number of reactions
 *   },
 */

const FREQUENCY_MIN = 30

// Must be top level in non-persistent background (aka event) pages
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Background_scripts#move_event_listeners
browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name == 'bridgy-facebook-poll') {
    Facebook.poll()
  // } else if (alarm.name == 'bridgy-instagram-poll') {
  //   Instagram.poll()
  }
})

function schedulePoll() {
  for (const silo of [/* Instagram, */ Facebook]) {
    const name = silo.alarmName()
    browser.alarms.get(name).then(function(alarm) {
      if (!alarm) {
        console.log(`Scheduling ${silo.NAME} poll every ${FREQUENCY_MIN}m`)
        browser.alarms.create(name, {
          delayInMinutes: 5,
          periodInMinutes: FREQUENCY_MIN,
        })
      }
    })
  }
}

login().then(() => {
  schedulePoll()
})
