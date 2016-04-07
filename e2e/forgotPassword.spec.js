'use strict';

var di = require('simple-di');
var sinon = require('sinon');
var expect = require('chai').expect;

di.invoke(function(loginPage, forgotPasswordModal, AuthController, ApiHelper, toast) {
    describe('Forgot Password', function() {
        var sandbox;

        before(function() {
            browser.get('/');
        })

        beforeEach(function() {
            sandbox = sinon.sandbox.create();
            loginPage.forgot_password_link.click();
        });

        afterEach(function() {
            sandbox.restore();
        })

        it("should let me cancel the modal", function() {
            forgotPasswordModal.cancel_button.click();
        });

        it("should not let me click OK if I haven't filled anything in", function() {
            expect(forgotPasswordModal.ok_button.isEnabled()).to.eventually.be.false;
            forgotPasswordModal.cancel_button.click();
        });

        it("should show the 'required' indicator if the email isn't filled in.", function() {
            forgotPasswordModal.email.sendKeys('test');
            forgotPasswordModal.email.clear();
            expect(forgotPasswordModal.email_error.isDisplayed()).to.eventually.be.true;
            expect(forgotPasswordModal.ok_button.isEnabled()).to.eventually.be.false;
            forgotPasswordModal.cancel_button.click();
        });

        it("should show the 'not an email' indicator if the email isn't actually an email.", function() {
            forgotPasswordModal.email.sendKeys('test');
            expect(forgotPasswordModal.email_error.isDisplayed()).to.eventually.be.true;
            expect(forgotPasswordModal.ok_button.isEnabled()).to.eventually.be.false;
            forgotPasswordModal.cancel_button.click();
        });

        it("should show an error if the email address provided isn't recognized.", function() {
            sandbox.stub(AuthController, 'forgotPassword', function(_req, res) {
                ApiHelper.NOT_FOUND(res);
            });

            forgotPasswordModal.email.sendKeys('test@email.com');
            expect(forgotPasswordModal.ok_button.isEnabled()).to.eventually.be.true;
            forgotPasswordModal.ok_button.click();

            expect(toast.getText()).to.eventually.equal('An account with that email address could not be found.');
            forgotPasswordModal.cancel_button.click();
        });

        it("should show an error if an error occurs on the server.", function() {
            sandbox.stub(AuthController, 'forgotPassword', function(_req, res) {
                ApiHelper.INTERNAL_SERVER_ERROR(res);
            });

            forgotPasswordModal.email.sendKeys('test@email.com');
            expect(forgotPasswordModal.ok_button.isEnabled()).to.eventually.be.true;
            forgotPasswordModal.ok_button.click();

            expect(toast.getText()).to.eventually.equal('An unexpected error occurred. Please contact support if this happens again.');
            forgotPasswordModal.cancel_button.click();
        });

        it("should dismiss if the api succeeds.", function() {
            sandbox.stub(AuthController, 'forgotPassword', function(_req, res) {
                ApiHelper.OK(res);
            });

            forgotPasswordModal.email.sendKeys('test@email.com');
            expect(forgotPasswordModal.ok_button.isEnabled()).to.eventually.be.true;
            forgotPasswordModal.ok_button.click();

            expect(forgotPasswordModal.modal.isPresent()).to.eventually.be.false;
        });
    });
});
