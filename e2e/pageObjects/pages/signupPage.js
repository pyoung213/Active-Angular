'use strict';

var di = require('simple-di');

di.register('signupPage', signupPage);

function signupPage() {
    var service = {
        get full_name() {
            return element(by.css('.t-full-name'));
        },

        get full_name_error() {
            return element(by.css('.t-full-name-error'));
        },

        get company_name() {
            return element(by.css('.t-company-name'));
        },

        get company_name_error() {
            return element(by.css('.t-company-name-error'));
        },

        get email() {
            return element(by.css('.t-email'));
        },

        get email_error() {
            return element(by.css('.t-email-error'));
        },

        get password() {
            return element(by.css('.t-password'));
        },

        get password_error() {
            return element(by.css('.t-password-error'));
        },

        get signup_button() {
            return element(by.css('.t-signup-button'));
        },

        signup: signup
    };

    return service;

    function signup(data) {
        service.full_name.sendKeys(data.full_name);
        service.company_name.sendKeys(data.company_name);
        service.email.sendKeys(data.email);
        service.password.sendKeys(data.secret);
        service.signup_button.click();
    }
}
