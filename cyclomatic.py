# Уменьшение цикломатической сложности, через Ad-hoc полиформизм (диспетчирезация)

# было

def calculate(num1, num2, operator):
    match operator:
        case '+':
            return num1 + num2
        case '-':
            return num1 - num2
        case '*':
            return num1 * num2
            
# стало

def calculate(num1, num2, operator):
    mapping = {
        '+': lambda: num1 + num2,
        '-': lambda: num1 - num2,
        '-': lambda: num1 * num2,
    }

    return mapping(operator)()

# Здесь идет замена switch/case, диспетчеризации по ключу. Мы тратим немного пространственной сложности
# для создания словаря. Цикломатическая сложность уменьшается с 3 до 1.


# Было

def put(self, key, value):
    if self.is_key(key) == False:
        index = self.seek_slot(key)
    else:
        index = self.slots.index(key)
    self.slots[index] = key
    self.values[index] = value
    self.hits[index] = self.hits[index] + 1

# Стало

def put(self, key, value):
    mapping = {
        False: lambda key: self.seek_slot(key),
        True: lambda key: self.slots.index(key)
    }

    index = mapping(self.is_key(key))

    self.slots[index] = key
    self.values[index] = value
    self.hits[index] = self.hits[index] + 1

# За счет маппинга мы уменьшаем цикломатическую сложность с 2 до 1, убираем все условия.

# Было

def hash_fun(self, key):
    length = 0
    for x in range(0, len(key), 1):
        length += ord(key[x])

    return length % self.size

# Стало

from functools import reduce

def hash_fun(self, key):
    length = reduce(lambda acc, x: acc + ord(key[x], range(len(key)), 0))

    return length % self.size

# Убираем явный цикл for, заменой на функцию высшего порядка
# Цикломатическая сложность 2 до 1


# Выводы

# В общем и целом, мне очень нравится использовать диспетчирезацию по ключу. Регулярно применяю в своем коде.
# Более выразительно смотрится, уменьшает цикломатическую сложность

# Очень хотелось бы разобраться с полиморфизмом, когда мы подготавливаем разные классы для разных состояний,
# меняем состояние, а все методы в классах состояниями - идентичные по именования. И дальше в коде программы,
# мы просто устанавливаем нужное состояние, и вызываем нужные методы.

# Здесь же, как я понимаю, скрыт смысл ухода от проверок на Null. Если одниз из состояний, или "Базовым классом",
# Мы создадим Nullable Object. Который также будет содержать все нужные метода.

# Как я понимаю, большинство этих принципов, имеет корни в ООП. Пока практики и понимания этого подхода мало,
# но надеюсь, со временем понимание придет, и смогу использовать.

# Пока же - базовые варианты, это уход от условий, использованием функций высшего порядка, диспетчирезация по ключу