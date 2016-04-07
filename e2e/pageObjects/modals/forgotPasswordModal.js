'use strict';

var di = require('simple-di');

di.register('forgotPasswordModal', forgotPasswordModal);

function forgotPasswordModal() {
    var service = {
        get email() {
            return service.modal.element(by.css('.t-email'));
        },

        get email_error() {
            return service.modal.element(by.css('.t-email-error'));
        },

        get ok_button() {
            return service.modal.element(by.css('.t-ok-button'));
        },

        get cancel_button() {
            return service.modal.element(by.css('.t-cancel-button'));
        },

        get modal() {
            return element(by.css('.t-forgot-password-modal'));
        }
    };

    return service;
}
