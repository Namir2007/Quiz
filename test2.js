/* prvi dio zadatka
class User {
    city = "Sarajevo";
    constructor(name, age) {
        this.name = name;
        this.age = age;
        this.score = 0;
    }

    getInfo() {
        return `${this.name} is ${this.age} years old and has a score of ${this.score}.`;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        if (value.length < 3) {
            console.log("Name is too short");
            return;
        }
        this._name = value;
    }

    get age() {
        return this._age;
    }

    set age(value) {
        if (value < 18) {
            console.log("Age is too low");
            return;
        }
        this._age = value;
    }

    incrementScore() {
        this.score += 1;
    }

    decrementScore() {
        this.score -= 1;
    }
}

const user = new User('John', 30);
user.incrementScore();
user.incrementScore();
user.decrementScore();
console.log(user.getInfo());

const userInfo = user.getInfo()
console.log(user.city);
console.log(User.prototype.city)
console.log(user.name);
console.log(User.prototype.name)







2 dio zadatka

class Animal {
    constructor(name) {
      this.speed = 0;
      this.name = name;
    }
  
    run(speed) {
      this.speed = speed;
      console.log(`${this.name} runs with speed ${this.speed} km/h`);
    }
  
    stop() {
      this.speed = 0;
      console.log(`${this.name} has stopped`);
    }
  }
  
  class Rabbit extends Animal {
    hide() {
      console.log(`${this.name} hides`);
    }
  
    stop() {
      super.stop();
      this.hide();
    }
  }
  
  const rabbit = new Rabbit('White Rabbit');
  rabbit.run(10);
  rabbit.stop();
  */






// Task: Create a class named Car with properties like make, model, and year.
// Method: Add a method called displayInfo() that prints the car's details.
// Practice: Create an instance of Car and call displayInfo().
class Car {
  constructor(make, model, year) {
    this.make = make;
    this.model = model;
    this.year = year;
  }
  displayInfo() {
    console.log(`Mark: ${this.make}, Model: ${this.model}, Year: ${this.year}`);
  }
}
const myCar = new Car("VW", "Tiguan", 2017);
myCar.displayInfo();

// Task: Create a class named Dog with properties such as name and breed.
// Method: Add a method bark() that prints a simple message like "Woof! Woof!".
// Practice: Instantiate a Dog and call the bark() method.
class Dog {
  constructor(name, breed) {
    this.name = name;
    this.breed = breed;
  }
  bark() {
    console.log("Woof! Woof!");
  }
}
const myDog = new Dog("Amar", "Zlatni resiver");
myDog.bark();

// Task: Create a class called Calculator with methods for basic operations.
// Methods: Implement methods add(a, b), subtract(a, b), multiply(a, b), and divide(a, b) that each return the result of the operation.
// Practice: Create an instance of Calculator and test each method with a couple of numbers.
class Calculator {
  add(a, b) {
    return a + b;
  }
  subtract(a, b) {
    return a - b;
  }
  multiply(a, b) {
    return a * b;
  }
  divide(a, b) {
    if (b == 0) {
      return "Division by zero is not allowed";
    }
    return a / b;
  }
}
const calc = new Calculator();
console.log(calc.add(5, 3));

// Task: First, create a Person class with properties name and age and a method introduce() that prints a greeting like "Hi, I'm [name] and I'm [age] years old."
// Extension: Create a Student class that extends Person. Add an extra property such as grade and a new method study() that prints something like "[name] is studying."
// Practice: Instantiate a Student object and call both the introduce() and study() methods.
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  introduce() {
    console.log(`I'm ${this.name} and I'm ${this.age} years old.`);
  }
}
class Student extends Person {
  constructor(name, age, grade) {
    super(name, age);
    this.grade = grade;
  }
  study() {
    console.log(`${this.name} is studying.`);
  }
}
const student = new Student("Balerina", 18, "3");
student.introduce();
student.study();

// Task: Create a class called Book with properties title and author.
// Method: Add a method describe() that prints the book's title and author.
// Practice: Instantiate a Book and call describe().
class Book {
  constructor(title, author) {
    this.title = title;
    this.author = author;
  }
  describe() {
    console.log(
      `Book name is "${this.title}" and it was written by ${this.author}.`
    );
  }
}
const book = new Book("Branko Čopić", "Orlovi rano lete");
book.describe();