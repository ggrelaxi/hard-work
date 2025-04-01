// FizzBuzz Без for и условий.

function fizzBuzz(max) {
	const mapping = {
		true_true: (_) => console.log('fizz buzz'),
		true_false: (_) => console.log('fizz'),
		false_true: (_) => console.log('buzz'),
		false_false: (num) => console.log(num),
	};

	Array(max)
		.fill(0)
		.reduce((acc, _, index) => [...acc, index], [])
		.forEach((num) => mapping[`${num % 5 === 0}_${num % 3 === 0}`](num));
}

fizzBuzz(50);



