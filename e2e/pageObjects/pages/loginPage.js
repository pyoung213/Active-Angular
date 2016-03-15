'use strict';

var di = require('simple-di');

di.register('loginPage', loginPage);

function loginPage() {
    var service = {
        get email() {
            return element(by.css('.t-login-form-email'));
        },

        get email_error() {
            return element(by.css('.t-login-form-email-error'));
        },

        get password() {
            return element(by.css('.t-login-form-password'));
        },

        get password_error() {
            return element(by.css('.t-login-form-password-error'));
        },

        get forgot_password_link() {
            return element(by.css('.t-forgot-password-link'));
        },

        get login_button() {
            return element(by.css('.t-login-button'));
        },

        login: login
    };

    return service;

    function login(data) {
        service.email.sendKeys(data.email);
        service.password.sendKeys(data.password);
        service.login_button.click();
    }
}
