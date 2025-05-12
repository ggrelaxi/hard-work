// тестирование функции подготовки SQL запроса, из набора входных данных
import { prepareGoodsToOrderSQLQuery } from '../utils/prepareGoodsToOrderSQLQuery';

describe('Prepare goods to sql query', () => {
	test('empty fields', () => {
		expect(prepareGoodsToOrderSQLQuery('1', [])).toStrictEqual('');
	});
	test('single field', () => {
		expect(prepareGoodsToOrderSQLQuery('1', [{ goodId: 1, amount: 1 }])).toStrictEqual(
			'insert into orders_goods(order_id, good_id, amount) values(1, 1, 1)'
		);
	});
	test('multiply fields', () => {
		expect(
			prepareGoodsToOrderSQLQuery('1', [
				{ goodId: 1, amount: 1 },
				{ goodId: 2, amount: 2 },
			])
		).toStrictEqual(
			'insert into orders_goods(order_id, good_id, amount) values(1, 1, 1); insert into orders_goods(order_id, good_id, amount) values(1, 2, 2)'
		);
	});
});

// Базовые тесты на положительные случае, в общем и целом можно реализовать в течении 5 минут.
// Реализация самой функции

import { IOrderGoodsRequestData } from '../types/orders';

export const prepareGoodsToOrderSQLQuery = (orderId: string, goods: IOrderGoodsRequestData[]) => {
	return goods
		.map((good) => {
			return `insert into orders_goods(order_id, good_id, amount) values(${orderId}, ${good.goodId}, ${good.amount})`;
		})
		.join('; ');
};


// ******************************

// Тестирование функции парсинга поисковой строки

describe('Parse search string', () => {
	test('empty string', () => {
		expect(parseSearch('')).toStrictEqual({});
	});
	test('Single search', () => {
		expect(parseSearch('?key=value')).toStrictEqual({ key: 'value' });
	});
	test('Multiply search', () => {
		expect(parseSearch('?name=alex&key=value')).toStrictEqual({ name: 'alex', key: 'value' });
	});
});

// Снова довольно быстрая реализация тестов в один коммит

// Реализация функции

export const parseSearch = (search) => {
	const rawSearch = search.slice(1);
	const pairs = rawSearch.split('&').map((pair) => pair.split('='));
	return Object.fromEntries(pairs);
};

// Что интересно - эту функцию парсинга применял на нескольких проектах. И казалось бы - элементарные тесты, нашли здесь сразу ошибку, в кейсе с вызовом функции и передачей пустой строки
// Исправил, задумался.

// Что касается обычной рабочей практики - если в проекте есть вариант добавить тесты, думаю неплохо начинать с положительных кейсов. Насколько маленький должен быть тест, и насколько маленькая реализация кода под него - сказать затрудняюсь
// По ощущениями - точно будет необычно коммитить частичные реализации функций или методой.
// Хотя на одном проекте рекомендация лида заключалась в атомарности коммитов. Но там атомарность все таки сводилась - к одной реализованной фиче, исправлению, реализации функции, метода или компонента. А не его частичную реализацию
// Хотя, если задуматься, поставлять кусочками рабочий код, чем одним большим валом нерабочий - первое очевидно. И парадокс - почему так редко применяется.