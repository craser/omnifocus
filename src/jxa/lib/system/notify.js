'use strict'

const defaults = {
    title: 'Notification',
    message: 'This is a notification',
    sound: 'Glass',
};

/**
 * Two ways to call this:
 * @param (title | options) - first parameter is either a string title, or an options object
 * @param options.title - title to display in notification
 * @param options.message - message to display in notification
 * @param options.sound - sound to play with notification
 * @param message
 */
export function notify(options, message) {
    let props = (typeof options == 'object')
        ? { ...defaults, ...options}
        : { ...defaults, title: options, message };

    console.log(`props: ${JSON.stringify(props)}`);

    const a = Application.currentApplication();
    a.includeStandardAdditions = true;
    a.displayNotification(props.message, {
        withTitle: props.title,
        soundName: props.sound,
    });
}
