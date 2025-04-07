# Где то ранее, насколько помню в Ваших материалах, затрагивался вопрос об улучшении тестирования
# Если генегировать входные данные
# Фаззинг, насколько я понял, расширяет этот подход

# Проект на Python, фаззер Atheris. Несколько сложно установить на Windows/Mac. Но в целом
# По документации удалось справиться

# Исходная функция

def generate_progression(start, step, length):
    progression = []

    for i in range(length):
        progression.append(start + step * i)

    return progression


# Сам фаззер

import atheris
from brain_games.games.progression import generate_progression
import sys
   

def TestOneInput(data: bytes):
    try:
        if len(data) < 12:
            return
        
        a = int.from_bytes(data[:4], 'little', signed=True)
        b = int.from_bytes(data[4:8], 'little', signed=True)
        c = int.from_bytes(data[8:12], 'little', signed=True)

        if a > 100 and a <= 0 or b > 100 or a <= 0 or c > 15 or c <= 0:
            return
        if not all(isinstance(x, int) for x in [a, b, c]):
            return
        
        result = generate_progression(a,b,c);
    except OverflowError:
        print(f"Crash with a={a}, b={b}, c={c}")
        raise
    except Exception as e:
        print(e, a, b, c)
   


atheris.Setup(sys.argv, TestOneInput)
atheris.Fuzz()

# Нужно еще научится "готовить" сам фазер. Пока запускал вручную, и под каждую найденную ошибку, дописывал исходную функцию
# и сам тест

# Функция после рефакторинга

def checkArgsLength(a, b, c):
    if not all(isinstance(x, int) for x in [a, b, c]):
        raise ValueError('Не переданы аргументы')
    

def isIntArgs(a, b, c):
    if not all(isinstance(x, int) == True for x in [a, b, c]):
        raise OverflowError('Переданы не числа')

def isInputRange(a, b, c):
    if not all(x < 1 or x > 100 for x in [a, b, c]):
        raise ValueError('Нельзя использовать отрицательные числа, или числа больше 100')

error_mapping = {
    checkArgsLength,
    isIntArgs,
    isInputRange,
}
    

def generate_progression(start, step, length):
    for errorChecker in error_mapping:
        errorChecker(start, step, length)
    
    progression = []

    for i in range(length):
        progression.append(start + step * i)

    return progression

# Фаззер стару начал находить проблемы - передача отрицательных значений, передача не числе, слишком больших числе
# Результат - добавление проверок в функцию
# Также попробовал подход с диспетчеризацией
# Проверки - это if
# Разделение на отдельные функции проверки, как я понимаю, позволяет не увеличивать цикломатическую сложность

# Из размышлений - исходный код сильно разрастается
# Нужно подумать и понять, решит ли проблему - добавления явной типизации параметрам - start: int
# По идее такая проверка должна убрать проблему с передачей не чисел

# Но все равно, код будет требовать сильно много проверок, чтобы учесть максимально возможное количество ситуаций
# Это новая рефлексия - где тут золотая грань? Огромный код, но более надежный, или краткий, но ломающийся
# в граничных случаях

# Здравый смысл подсказывает, что нужно искать эталонные решения для этих ситуаций.