'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2024-02-21T17:01:17.194Z',
    '2024-02-23T23:36:17.929Z',
    '2024-02-24T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.floor(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return `Today`;
  if (daysPassed === 1) return `Yesterday`;
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    /*
    const day = `${date.getDate()}`.padStart(2, 0);
    const month = `${date.getMonth() + 1}`.padStart(2, 0);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
    */
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

const formatCurr = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formatCurr(
          mov,
          acc.locale,
          acc.currency
        )}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${formatCurr(
    acc.balance,
    acc.locale,
    acc.currency
  )}`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCurr(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCurr(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCurr(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogoutTimer = function () {
  //set time to 5 min
  let time = 60 * 5;

  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    //in each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    //when time at 0, stop timer and logout user
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
    }
    //decrease by 1 sec
    time--;
  };

  //timer does not start until 1 sec after function is called
  //create separate function so that timer starts immediately, then call the function each second using setINterval

  //call timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

//Fake log in --> remove later
/*
currentAccount = account1;
updateUI(currentAccount);
containerApp.style.opacity = 100;

*/

/*
setInterval(function () {
  const day = `${rightnow.getDate()}`.padStart(2, 0);
  const month = `${rightnow.getMonth() + 1}`.padStart(2, 0);
  const year = rightnow.getFullYear();
  const hour = rightnow.getHours();
  const min = `${rightnow.getMinutes()}`.padStart(2, 0);
  labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;
}, 1000);
*/
//day/month/year

//pass in local string (language-country)
//define options to also give time fo rthe format
const options = {
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  weekday: 'long',
};

//instead of getting language info manually, use the users web browser info

/*
setInterval(function () {
  const rightnow = new Date();
  labelDate.textContent = new Intl.DateTimeFormat(
    currentAccount.locale,
    options
  ).format(rightnow);
}, 1000);
*/

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    const currentDate = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      //weekday: 'long',
    };

    //instead of getting language info manually, use the users web browser info
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(currentDate);

    if (timer) clearInterval(timer);

    timer = startLogoutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    //reset timer
    clearInterval(timer);
    timer = startLogoutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      //add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);
    }, 2500);
  }
  inputLoanAmount.value = '';

  //reset timer
  clearInterval(timer);
  timer = startLogoutTimer();
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

//all numbers are represented as decimals (floats) in JS
//even if written as an int
console.log(23 === 23.0);

//base 10 -> 0-9
//binary -> 0-1
//difficult to represent fractions in binary
console.log(0.1 + 0.2); //weird result --> infinte fraction
console.log(0.1 + 0.2 === 0.3); // know it should be true but JS gives false

//changing strings to number
console.log(Number('23'));
console.log(+'23'); //can make the code look cleaner

//parse a number from a string
//method from Number object
//string needs to start with a string
//Number.parseInt(string, base (base 10, base 2, etc))
console.log(Number.parseInt('30fps', 10));
console.log(Number.parseFloat('2.5rem', 10));
console.log(Number.parseInt('2.5rem', 10));
//these are global functions and don't technically need the Number object

//check if almost any value is a number
//does not consider certain use cases
//use only to check if not a number
console.log(Number.isNaN(30));
console.log(Number.isNaN('30'));
console.log(Number.isNaN(23 / 0));
console.log(Number.isNaN(+'23'));

//other method isFinite --> best way to check if value is a number
//use this to check if something is a number
console.log(Number.isFinite(23 / 0));
console.log(Number.isFinite('30'));
console.log(Number.isFinite(+'23'));

//Math and rounding
//square root
console.log(Math.sqrt(4));
console.log(4 ** 0.5);
console.log(8 ** (1 / 3));

//max and min value
console.log(Math.max(3, 10, 50, 80, 4, 3));
console.log(Math.min(3, 4, 60, 3, 1));

console.log(Math.PI * Number.parseFloat('10px') ** 2);

//random --> random value from 0-1
console.log(Math.random());

//produce function to produce random int
console.log('min max function');
const randInt = (low, high) =>
  Math.floor(Math.random() * (high - low) + 1) + low;
console.log(randInt(7, 10));

//rounding integers
//math.trunc removes decimals at end
console.log(Math.trunc(23.3));

//math.round
console.log(Math.round(23.3));
console.log(Math.round(23.9));

console.log(Math.ceil(23.3));
console.log(Math.ceil(23.9));

//similar to math.truc, but math.floor will work for negative numbers
console.log(Math.floor(23.3));
console.log(Math.floor(23.9));
console.log(Math.floor(-23.4));
console.log(Math.trunc(-23.4));

//rounding decimals --> always returns a string
//numbers are primitive and don't have methods --> toFixed converts to string to work around that
console.log((2.7).toFixed(0));
console.log((2.7).toFixed(3));
console.log((2.7).toFixed(4));
console.log(+(2.345).toFixed(2));

//Remainder Operator --> returns remainder of an operation
console.log(5 % 2); // --> 2*2 + 1
console.log(8 % 3);
//useful to check if a number is even or odd
//even --> if divsible by 2, no remainder

const isEven = n => n % 2 == 0;
console.log(isEven(2));
console.log(isEven(9));
console.log(isEven(8));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    //color every second row
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
    //every third row
    if (i % 3 === 0) row.style.backgroundColor = 'blue';
  });
});

//Numeric separators (since ES2021)
//large numbers can be difficult to read
const diameter = 287_460_000_000; //use underscore to separate
console.log(diameter); // will ignore the separators

const price = 345_99;
console.log(price);

//can only place _ between numbers
// const = 3._1415; will cause error

console.log(Number('270_000')); //causes NaN
//only use numberic separators in the code

//BigInt --> special type of integer
//limit to how large numbers can be store (64 bit, but only 53 bits for JS. some data used to store info on decimal place)
//big numbers = "unsafe numbers"
console.log(2 ** 53);
console.log(2 ** 53 + 1); //will stay the same number
//if get a large number from an API, need to use BigInt

//add n at end of large number

console.log(7764567876543456757687975646879665434567876543456765434567n);
console.log(BigInt(7764567876543456757687975646879665434567876543456765434567));

//normal operators still work the same
console.log(1000n * 2000n);

//cannot mix big ints with regular numbers

//can still use comparitive operators between the two data types
console.log(20n > 1);
console.log(typeof 20n);
//string concatinations will still work with the different types
console.log('200n' + 'is a big int');

//divisions --> returns the closest big int
console.log(10 / 3);
console.log(10n / 3n);

//Creating Dates
//4 ways to create a date (all use same function but can accept different parameters)
//months are 0 based
//1
const now = new Date();
console.log(now);

//2 - parse date from string
console.log(new Date('Aug 02 2020 09:56:49'));
console.log(new Date('December 24 2015'));
console.log(new Date(account1.movementsDates[0]));

//3
//months are 0 based
//if an incorrect date is added, it will go to the next possible date
//ex: Nov 31st DNE, so JS spits out Dec 1st
console.log(new Date(2017, 10, 31));
//unix time --> Jan 1st 1970
console.log(new Date(0));
//3 days after unix time
//accepts milliseconds
//days to hours to min to sec to millisec
console.log(new Date(3 * 24 * 60 * 60 * 1000));

//working with dates
const future = new Date(2037, 10, 19, 15, 23);
//don't use get year, use get full year
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDay()); // day of the week

console.log(future.getTime()); // get timestamp --> miliseconds since Jan 1st 1970
//current timestamp
console.log(Date.now());
future.setFullYear(2040);
console.log(future);

//operations with dates

const daysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

console.log(daysPassed(new Date(2034, 3, 4), new Date(2034, 3, 14)));

//note, there is another package you can download if you need very accurate dates (that takes into account day light savings etc)\

//Internationalization API
//Format numbers and strings according to different languages

//internationalizing numbers
const optionsNum = {
  style: 'unit',
  unit: 'mile-per-hour',
  //other styles can be used (currency, temperature, etc)
  useGrouping: false,
};
const num = 123456.23;
console.log(`US: ${new Intl.NumberFormat('en-US', optionsNum).format(num)}`);
console.log(
  `Germany: ${new Intl.NumberFormat('de-GE', optionsNum).format(num)}`
);
console.log(`Syria: ${new Intl.NumberFormat('ar-SY', optionsNum).format(num)}`);
console.log(
  `Browser: ${
    (navigator.language, new Intl.NumberFormat(navigator.language).format(num))
  }`
);

//set timeout --> set time until something gets executed and only executed once
//setTimeout( function, amount of waiting time)
setTimeout(() => console.log(`Here is your pizza`), 3000); //code execution does not stop at this point, will continue after this
console.log('Waiting...');
//JS will keep counting in the background for the setTimeout, but will continue executing function below the setTimeout
//arguments after the delay time will be arguments for the function
setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
  4000,
  'olives',
  'spinach'
);

//for an array
const ingredients = ['pepperoni', 'sausage'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
  4000,
  ...ingredients
);
if (ingredients.includes('sausage')) clearTimeout(pizzaTimer); //this will delete the timer if it detects sausage
//is preveneted from executing by clearTimeout()

//set Interval --> run a function once every x time
setInterval(function () {
  const now = new Date();
  const hour = `${now.getHours()}`.padStart(2, 0);
  const minute = `${now.getMinutes()}`.padStart(2, 0);
  const seconds = `${now.getSeconds()}`.padStart(2, 0);
  console.log(`${hour}:${minute}:${seconds}`);
}, 3000);
