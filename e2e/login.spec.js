'use strict';

var di = require('simple-di');
var expect = require('chai').expect;

di.invoke(function(loginPage, e2eUsers, toast) {
    describe('Login Page', function() {
        var user = e2eUsers.verifiedUser;

        beforeEach(function() {
            browser.get('/');
        });

        it("should not let me click Login if I haven't filled anything in", function() {
            expect(loginPage.login_button.isEnabled()).to.eventually.be.false;
        });

        it("should show the 'required' indicator if the email isn't filled in.", function() {
            loginPage.email.sendKeys('foo');
            loginPage.email.clear();
            expect(loginPage.email_error.isDisplayed()).to.eventually.be.true;
            expect(loginPage.login_button.isEnabled()).to.eventually.be.false;
        });

        it("should show the 'not an email' indicator if the email isn't actually an email.", function() {
            loginPage.email.sendKeys('test');
            expect(loginPage.email_error.isDisplayed()).to.eventually.be.true;
            expect(loginPage.login_button.isEnabled()).to.eventually.be.false;
        });

        it("should show the 'required' indicator if the password isn't filled in.", function() {
            loginPage.password.sendKeys('foo');
            loginPage.password.clear();
            expect(loginPage.password_error.isDisplayed()).to.eventually.be.true;
            expect(loginPage.login_button.isEnabled()).to.eventually.be.false;
        });

        it('should show an error if the user does not exist', function() {
            loginPage.login({
                email: 'user_does_not_exist@email.com',
                password: 'password'
            });

            expect(toast.getText()).to.eventually.equal('Unrecognized email or password. Please try again.');
        });

        it('should show an error if the password is incorrect', function() {
            loginPage.login({
                email: user.email,
                password: 'this is the wrong password'
            });

            expect(toast.getText()).to.eventually.equal('Unrecognized email or password. Please try again.');
        });
    });
});
