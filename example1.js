// Откровенно говоря, тема дается сложно. Не совсем понятно, как следует мыслить. Но попробую.

// Ниже довольно старый код, с проектов на hexlet. Который всегда вызывал вопросы, и хотелось его переписать.

import makeGameCore from '../index.js';

const getRandomFromInterval = (min, max) => Math.round(min + Math.random() * (max - min));

const getRandomOperator = () => {
	const operators = ['+', '-', '*'];
	const operator = operators[Math.floor(Math.random() * operators.length)];

	return operator;
};

const makeCalcGame = () => {
	const randomOperator = getRandomOperator();

	let randomNumber1;
	let randomNumber2;

	if (randomOperator === '*') {
		randomNumber1 = getRandomFromInterval(0, 10);
		randomNumber2 = getRandomFromInterval(1, 20);
	} else {
		randomNumber1 = getRandomFromInterval(0, 100);
		randomNumber2 = getRandomFromInterval(0, 80);
	}

	const randomExpression = `${randomNumber1} ${randomOperator} ${randomNumber2}`;

	let expressionResult;
	switch (randomOperator) {
		case '+':
			expressionResult = randomNumber1 + randomNumber2;
			break;
		case '-':
			expressionResult = randomNumber1 - randomNumber2;
			break;
		case '*':
			expressionResult = randomNumber1 * randomNumber2;
			break;
		default:
			return null;
	}

	return [gameQuestion, randomExpression];
};

const runGame = () => makeGameCore(makeCalcGame);

export default runGame;

// Рассуждения

// Начнем с getRandomFromInterval.
// у нас должна работать спецификация, что для любых входных значений min < max и getRandomFromInterval(min, max) = x и x in (min, max)
// и при этом min и max - числовые значения.
// если спецификация выполняется - мы всегда сможем безопасно использовать интерфейс getRandomFromInterval, для получения случайного числа.
// при этом сможем изменять его внутреннюю реализацию. Например, менять генератор случайных чисел, алгоритм округления и тд.

// Если я правильно понимаю - это уровень спецификации. Отсюда можно спустится на уровень реализации, и начать с TDD
// Мы можем написать тесты для этой функции. Например,
try {
	const x = getRandomFromInterval(0, 10);
	if (x < 0 || x > 10) throw new Error('Invalid range');
} catch (e) {
	console.log('test failed', e);
}

try {
	const result = getRandomFromInterval(null, 10);
	if (typeof result !== 'number') throw new Error('Invalid result type');
} catch (e) {
	console.log('test failed', e);
}

// Подобные тесты сразу помогут доработать функцию, например для проверки типа входных аргументов
const getRandomFromInterval = (min, max) => {
	if (typeof min !== 'number' || typeof max !== 'number') {
		throw new Error('invalid arguments type');
	}
	return Math.round(min + Math.random() * (max - min));
};
// PS часть таких юнит тестов, покрыло бы добавление TS, и типизацией входных аргументов.
// На практике, строгая типизация убирает довольно большой пласт юнит тестов

// И вот здесь меня всегда волновал вопрос.
// Я пишу функцию getRandomFromInterval для этого небольшого проекта.
// Я буду использовать ее, передавая на вход только числа из правильного диапазона.
// В этой программе не случится ситуации вызова функции, с неверными аргументами.
// Подобное утверждение неверно? Интуитивно конечно, становится понятно что неверно. Но довольно часто полагаешься на этот авось.
// Тогда с другой стороны где та грань, при которой мы сможем утверждать, что программа действительно работает без ошибок?

// x = getRandomOperator() и x in ['+', '-', '*']
try {
	const result = getRandomOperator();
	if (!['+', '-', '*'].includes(result)) {
		throw new Error('Invalid result value');
	}
} catch (e) {
	console.log('test failed', e);
}

// Часть кода с вычислением математического пример. Можно через диспетчерезацию
// У нас должны быть функция calculate(num1, num2, operator) === result, и result числовой тип данных и operator in ['+', '-', '*'] и num1, num2 числовой тип данных

// Тесты
try {
	const result = calculate(1, 2, '+');
	if (typeof result !== 'number') throw new Error('Invalid result type');
} catch (e) {
	console.log('test failed', e);
}

try {
	const result = calculate('1', 2, '*');
} catch {
	console.log('test passed');
}

// Реализация

const actions = {
	'+': (num1, num2) => num1 + num2,
	'-': (num1, num2) => num1 - num2,
	'*': (num1, num2) => num1 * num2,
};

const calculate = (num1, num2, operator) => {
	if (!['+', '-', '*'].includes(operator)) {
		throw new Error('Invalid operator');
	}
	if (typeof num1 !== 'number' || typeof num2 !== 'number') {
		throw new Error('Invalid operands type');
	}
	return actions[operator](num1, num2);
};

// makeCalcGame() === [x, y] и результат кортеж из двух элементов, x строковый тип, y числовой тип
// тесты
try {
	const result = makeCalcGame();
	if (typeof result[0] !== 'string' || typeof result[1] !== 'number') {
		throw new Error('Invalid result type');
	}
} catch (e) {
	console.log('Test failed', e);
}

// реализация
const makeCalcGame = () => {
	const num1 = getRandomFromInterval(1, 10);
	const num2 = getRandomFromInterval(1, 10);
	const operator = getRandomOperator();

	const question = `${num1} ${operator} ${num2}`;

	const result = calculate(num1, num2, operator);

	return [question, result];
};
