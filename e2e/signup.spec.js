'use strict';

var di = require('simple-di');
var sinon = require('sinon');
var expect = require('chai').expect;

di.invoke(function(signupPage) {
    describe('Signup Page', function() {
        var sandbox;

        beforeEach(function() {
            sandbox = sinon.sandbox.create();
            browser.get('/signup');
        });

        afterEach(function() {
            sandbox.restore();
        });

        it("should not let me click Signup if I haven't filled anything in", function() {
            expect(signupPage.signup_button.isEnabled()).to.eventually.be.false;
        });

        it("should show the 'required' indicator if the name isn't filled in.", function() {
            signupPage.full_name.sendKeys('foo');
            signupPage.full_name.clear();
            expect(signupPage.full_name_error.isDisplayed()).to.eventually.be.true;
            expect(signupPage.signup_button.isEnabled()).to.eventually.be.false;
        });

        it("should show the 'required' indicator if the company name isn't filled in.", function() {
            signupPage.company_name.sendKeys('foo');
            signupPage.company_name.clear();
            expect(signupPage.company_name_error.isDisplayed()).to.eventually.be.true;
            expect(signupPage.signup_button.isEnabled()).to.eventually.be.false;
        });

        it("should show the 'required' indicator if the email isn't filled in.", function() {
            signupPage.email.sendKeys('foo');
            signupPage.email.clear();
            expect(signupPage.email_error.isDisplayed()).to.eventually.be.true;
            expect(signupPage.signup_button.isEnabled()).to.eventually.be.false;
        });

        it("should show the 'not an email' indicator if the email isn't actually an email.", function() {
            signupPage.email.sendKeys('test');
            expect(signupPage.email_error.isDisplayed()).to.eventually.be.true;
            expect(signupPage.signup_button.isEnabled()).to.eventually.be.false;
        });

        it("should show the 'required' indicator if the password isn't filled in.", function() {
            signupPage.password.sendKeys('foo');
            signupPage.password.clear();
            expect(signupPage.password_error.isDisplayed()).to.eventually.be.true;
            expect(signupPage.signup_button.isEnabled()).to.eventually.be.false;
        });
    });
});
