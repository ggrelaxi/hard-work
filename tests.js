import React from 'react';
import { test, expect } from '@playwright/experimental-ct-react';
import { OtpForm } from '../../../aes-airport-dashboard-front/src/modules/AuthModule/components/OtpForm';

test('should render', async ({ mount }) => {
	const component = await mount(<OtpForm></OtpForm>);
	await expect(component).toContainText('React');
});

test('Have 4 inputs', async ({ mount }) => {
	const component = await mount(<OtpForm></OtpForm>);
	const inputs = component.locator('//input[@data-testid="otp-input"]');

	expect((await inputs.all()).length).toBe(4);
});

test('next input have focus after enter digit', async ({ mount }) => {
	const component = await mount(<OtpForm></OtpForm>);
	const [firstInput, secondInput, thirdInput] = await component
		.locator('//input[@data-testid="otp-input"]')
		.all();

	firstInput.fill('1');
	const secondInputIsFocused = await secondInput.evaluate((el) => el === document.activeElement);
	expect(secondInputIsFocused).toBeTruthy();

	secondInput.fill('2');
	const thirdInputIsFocused = await thirdInput.evaluate((el) => el === document.activeElement);
	expect(thirdInputIsFocused).toBeTruthy();
});
