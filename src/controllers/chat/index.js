const mongoose = require("mongoose");
const Chats = require("../../models/chat");
// API FOR CHAT

const saveChat = (data, socket) => {
  const chatMessage = data.text;
  // generate public key
  // var keyArray = [
  //   [2, 3],
  //   [3, 6],
  // ];
  var keyArray = [
    [2, 8, 3],
    [3, 9, 3],
    [5, 6, 9],
  ];
  hillKey = "";
  // keyArray.map((item) => {
  //   hillKey = hillKey + item[0] + item[1];
  // });
  keyArray.map((item) => {
    hillKey = hillKey + item[0] + item[1] + item[2];
  });
  console.log("hillKey", hillKey);
  var plainT = chatMessage;
  // dimension = 2;

  let enc = false;
  function search(aChar) {
    var letter = aChar.toLowerCase();
    var alphabet = "abcdefghijklmnopqrstuvwxyz";
    return alphabet.indexOf(letter);
  }

  function reverseSearch(array, dimension) {
    var strArray = [];
    var alphabet = "abcdefghijklmnopqrstuvwxyz";
    var item;

    if (dimension == 2) {
      // console.log("hello");
      for (var i in array) {
        item = array[i];
        strArray.push([alphabet[item[0]], alphabet[item[1]]]);
      }
    } else {
      for (var i in array) {
        // console.log("array", array);
        item = array[i];
        strArray.push([
          alphabet[item[0]],
          alphabet[item[1]],
          alphabet[item[2]],
        ]);
      }
    }

    return strArray;
  }

  function modInverse(a, m) {
    var atemp = a;
    atemp = atemp % m;

    if (atemp < 0) {
      atemp = m + atemp;
    }
    // console.log("atemp", atemp);
    for (var x = 1; x < m; x++) {
      if ((atemp * x) % m == 1) {
        return x;
      }
      // console.log("x", x);
    }
  }

  function getColumnVectors(xdimgrams, dimensions) {
    var item;
    var topElement;
    var middleElement;
    var bottomElement;
    var columnVectors = [];

    if (dimensions == 2) {
      for (var i in xdimgrams) {
        item = xdimgrams[i];
        topElement = item.charAt(0);
        bottomElement = item.charAt(1);

        //get the index of each letter and push into column vector
        columnVectors.push([search(topElement), search(bottomElement)]);
      }
    } else {
      for (var i in xdimgrams) {
        item = xdimgrams[i];
        topElement = item.charAt(0);
        middleElement = item.charAt(1);
        bottomElement = item.charAt(2);

        //get the index of each letter and push into column vector
        columnVectors.push([
          search(topElement),
          search(middleElement),
          search(bottomElement),
        ]);
      }
    }

    return columnVectors;
  }

  // console.log(keyArray);
  function getPremodMatrix(columnVectors, dimensions) {
    var premodArray = [];
    var kr0 = keyArray[0][0];
    var kr1 = keyArray[0][1];
    var kr2 = keyArray[1][0];
    var kr3 = keyArray[1][1];
    var cr0;
    var cr1;
    var cr2;
    var topElement;
    var middleElement;
    var bottomElement;
    var counter = 0;

    if (dimensions == 2) {
      while (premodArray.length < columnVectors.length) {
        for (var i in columnVectors) {
          cr0 = columnVectors[i][0];
          cr1 = columnVectors[i][1];
          topElement = kr0 * cr0 + kr1 * cr1;
          bottomElement = kr2 * cr0 + kr3 * cr1;
          premodArray.push([topElement, bottomElement]);
        }
        counter++;
      }
    } else {
      while (premodArray.length < columnVectors.length) {
        for (var i in columnVectors) {
          cr0 = columnVectors[i][0];
          cr1 = columnVectors[i][1];
          cr2 = columnVectors[i][2];
          topElement =
            keyArray[0][0] * cr0 + keyArray[0][1] * cr1 + keyArray[0][2] * cr2;
          middleElement =
            keyArray[1][0] * cr0 + keyArray[1][1] * cr1 + keyArray[1][2] * cr2;
          bottomElement =
            keyArray[2][0] * cr0 + keyArray[2][1] * cr1 + keyArray[2][2] * cr2;
          premodArray.push([topElement, middleElement, bottomElement]);
        }
        counter++;
      }
    }

    return premodArray;
  }

  function getDigrams(aString) {
    var input = aString.toLowerCase();
    var tempDigram = "";
    var textLength = input.length;
    var digramLength;
    var letter;
    var array = [];
    var count = 0;

    while (count < textLength) {
      digramLength = tempDigram.length;
      letter = input.charAt(count);

      if (digramLength < 2) {
        tempDigram += letter;

        if (tempDigram.length == 2) {
          array.push(tempDigram);
          tempDigram = "";
        }
      } else {
        array.push(tempDigram);
        tempDigram = "";
        tempDigram += letter;
      }

      // pad if at odd  ending
      if (count == textLength - 1 && textLength % 2 != 0) {
        tempDigram += "x";
        array.push(tempDigram);
      }
      count++;
    }

    return array;
  }

  function getTrigraph(aString) {
    var input = aString.toLowerCase();
    var tempTrigram = "";
    var textLength = input.length;
    var trigramLength;
    var letter;
    var array = [];
    var count = 0;

    while (count < textLength) {
      trigramLength = tempTrigram.length;
      letter = input.charAt(count);

      if (trigramLength < 3) {
        tempTrigram += letter;

        if (tempTrigram.length == 3) {
          array.push(tempTrigram);
          tempTrigram = "";
        }
      } else {
        array.push(tempTrigram);
        tempTrigram = "";
        tempTrigram += letter;
      }

      // pad if at odd  ending
      if (count == textLength - 1 && textLength % 3 != 0) {
        if (tempTrigram.length == 1) {
          tempTrigram += "xx";
        } else {
          tempTrigram += "x";
        }
        array.push(tempTrigram);
      }
      count++;
    }

    // pad if input does not form 3 X 3 matrix
    while (array.length < 3) {
      array.push("xxx");
    }
    return array;
  }

  var cryptedText;
  function encrypt() {
    enc = true;
    console.log("plainT", plainT);
    var dimension = 3;
    var encryptedArray = [];
    var columnVectors;
    var topElement;
    var bottomElement;
    var premodMatrix;

    if (plainT == "") {
      alert("Please input a text to be encrypted.");
    } else {
      if (dimension == 2) {
        var digrams = getDigrams(plainT);
        columnVectors = getColumnVectors(digrams, 2);
        premodMatrix = getPremodMatrix(columnVectors, 2);

        for (var i in premodMatrix) {
          topElement = premodMatrix[i][0];
          bottomElement = premodMatrix[i][1];
          encryptedArray.push([topElement % 26, bottomElement % 26]);
        }
      } else {
        var trigraph = getTrigraph(plainT);
        columnVectors = getColumnVectors(trigraph, 3);
        premodMatrix = getPremodMatrix(columnVectors, 3);
        var middleElement;

        for (var i in premodMatrix) {
          topElement = premodMatrix[i][0];
          middleElement = premodMatrix[i][1];
          bottomElement = premodMatrix[i][2];
          encryptedArray.push([
            topElement % 26,
            middleElement % 26,
            bottomElement % 26,
          ]);
        }
      }

      // console.log(
      //   reverseSearch(encryptedArray, dimension).toString().replace(/,/gi, "")
      // );
      cryptedText = reverseSearch(encryptedArray, dimension)
        .toString()
        .replace(/,/gi, "");
    }
  }

  encrypt();
  console.log("encrypted", cryptedText);

  function decrypt() {
    enc = false;
    var ciphT = cryptedText;
    var dimension = 3;
    var decryptedArray = [];
    var determinant;
    var columnVectors;
    var topElement;
    var bottomElement;
    var multiplicativeInverse;
    var adjugateMatrix = [];
    var inverseKeyMatrix = [];

    if (ciphT == "") {
      alert("Please input a text to be decrypted.");
    } else {
      if (dimension == 2) {
        var digrams = getDigrams(ciphT);
        determinant =
          keyArray[0][0] * keyArray[1][1] - keyArray[0][1] * keyArray[1][0];
        // console.log(determinant);
        multiplicativeInverse = modInverse(determinant, 26);
        columnVectors = getColumnVectors(digrams, 2);
        adjugateMatrix.push([keyArray[1][1], -keyArray[0][1] + 26]);
        adjugateMatrix.push([-keyArray[1][0] + 26, keyArray[0][0]]);

        for (var i in adjugateMatrix) {
          // console.log(adjugateMatrix[i], multiplicativeInverse);
          inverseKeyMatrix.push([
            (adjugateMatrix[i][0] * multiplicativeInverse) % 26,
            (adjugateMatrix[i][1] * multiplicativeInverse) % 26,
          ]);
        }

        // finally, the decryption
        for (var i in columnVectors) {
          topElement =
            (inverseKeyMatrix[0][0] * columnVectors[i][0] +
              inverseKeyMatrix[0][1] * columnVectors[i][1]) %
            26;
          bottomElement =
            (inverseKeyMatrix[1][0] * columnVectors[i][0] +
              inverseKeyMatrix[1][1] * columnVectors[i][1]) %
            26;
          decryptedArray.push([topElement, bottomElement]);
        }

        // console.log(
        //   reverseSearch(decryptedArray, 2).toString().replace(/,/gi, "")
        // );
        cryptedText = reverseSearch(decryptedArray, 2)
          .toString()
          .replace(/,/gi, "");
      } else {
        var trigraph = getTrigraph(ciphT);
        columnVectors = getColumnVectors(trigraph, 3);
        var middleElement;

        // determinant calculation components
        var leftElement =
          keyArray[0][0] *
          (keyArray[1][1] * keyArray[2][2] - keyArray[1][2] * keyArray[2][1]);
        var middleElement =
          keyArray[0][1] *
          (keyArray[1][0] * keyArray[2][2] - keyArray[1][2] * keyArray[2][0]);
        var rightElement =
          keyArray[0][2] *
          (keyArray[1][0] * keyArray[2][1] - keyArray[1][1] * keyArray[2][0]);

        determinant = leftElement - middleElement + rightElement;
        multiplicativeInverse = modInverse(determinant % 26, 26);

        // cofactor calculation
        var cf00 =
          keyArray[1][1] * keyArray[2][2] - keyArray[1][2] * keyArray[2][1];
        var cf01 = -(
          keyArray[1][0] * keyArray[2][2] -
          keyArray[2][0] * keyArray[1][2]
        );
        var cf02 =
          keyArray[1][0] * keyArray[2][1] - keyArray[1][1] * keyArray[2][0];
        var cf10 = -(
          keyArray[0][1] * keyArray[2][2] -
          keyArray[0][2] * keyArray[2][1]
        );
        var cf11 =
          keyArray[0][0] * keyArray[2][2] - keyArray[0][2] * keyArray[2][0];
        var cf12 = -(
          keyArray[0][0] * keyArray[2][1] -
          keyArray[0][1] * keyArray[2][0]
        );
        var cf30 =
          keyArray[0][1] * keyArray[1][2] - keyArray[0][2] * keyArray[1][1];
        var cf31 = -(
          keyArray[0][0] * keyArray[1][2] -
          keyArray[0][2] * keyArray[1][0]
        );
        var cf32 =
          keyArray[0][0] * keyArray[1][1] - keyArray[0][1] * keyArray[1][0];

        adjugateMatrix.push([cf00, cf01, cf02]);
        adjugateMatrix.push([cf10, cf11, cf12]);
        adjugateMatrix.push([cf30, cf31, cf32]);

        //find the mods
        for (var i in adjugateMatrix) {
          if (adjugateMatrix[i][0] < 0) {
            adjugateMatrix[i][0] = (adjugateMatrix[i][0] % 26) + 26;
          } else {
            adjugateMatrix[i][0] = adjugateMatrix[i][0] % 26;
          }

          if (adjugateMatrix[i][1] < 0) {
            adjugateMatrix[i][1] = (adjugateMatrix[i][1] % 26) + 26;
          } else {
            adjugateMatrix[i][1] = adjugateMatrix[i][1] % 26;
          }

          if (adjugateMatrix[i][2] < 0) {
            adjugateMatrix[i][2] = (adjugateMatrix[i][2] % 26) + 26;
          } else {
            adjugateMatrix[i][2] = adjugateMatrix[i][2] % 26;
          }
        }

        // multiply adjugateMatrix with multiplicativeInverse and mod
        for (var i in adjugateMatrix) {
          topElement = (multiplicativeInverse * adjugateMatrix[i][0]) % 26;
          middleElement = (multiplicativeInverse * adjugateMatrix[i][1]) % 26;
          bottomElement = (multiplicativeInverse * adjugateMatrix[i][2]) % 26;
          inverseKeyMatrix.push([topElement, middleElement, bottomElement]);
        }

        // finally, the decryption
        for (var i in columnVectors) {
          topElement =
            (inverseKeyMatrix[0][0] * columnVectors[i][0] +
              inverseKeyMatrix[1][0] * columnVectors[i][1] +
              inverseKeyMatrix[2][0] * columnVectors[i][2]) %
            26;

          middleElement =
            (inverseKeyMatrix[0][1] * columnVectors[i][0] +
              inverseKeyMatrix[1][1] * columnVectors[i][1] +
              inverseKeyMatrix[2][1] * columnVectors[i][2]) %
            26;

          bottomElement =
            (inverseKeyMatrix[0][2] * columnVectors[i][0] +
              inverseKeyMatrix[1][2] * columnVectors[i][1] +
              inverseKeyMatrix[2][2] * columnVectors[i][2]) %
            26;

          decryptedArray.push([topElement, middleElement, bottomElement]);
        }

        // console.log(
        //   reverseSearch(decryptedArray, 3).toString().replace(/,/gi, " ")
        // );
        cryptedText = reverseSearch(decryptedArray, 3)
          .toString()
          .replace(/,/gi, "");
      }
    }
  }
  // decrypt();
  // console.log(cryptedText);

  // console.log(cryptedText);

  // >>>>>>>>>>>>>>>>>>>>>>>>>> RSA ALGORITHAM SECTION <<<<<<<<<<<<<<<<<<<<<<<<<<<<

  let p = 3;
  let q = 11;

  let n = p * q;

  console.log("n", n);

  let t = (p - 1) * (q - 1);

  console.log("totient function", t);

  function gcd_two_numbers(x, y) {
    if (typeof x !== "number" || typeof y !== "number") return false;
    x = Math.abs(x);
    y = Math.abs(y);
    while (y) {
      var t = y;
      y = x % y;
      x = t;
    }
    return x;
  }
  // get array of prime numbers
  function primeFactorsTo(max) {
    var store = [],
      i,
      j,
      primes = [];
    for (i = 2; i <= max; ++i) {
      if (!store[i]) {
        primes.push(i);
        for (j = i << 1; j <= max; j += i) {
          store[j] = true;
        }
      }
    }
    return primes;
  }

  // console.log(primeFactorsTo(t));
  let primeArray = primeFactorsTo(t);
  let e;
  for (let i = 2; i < primeArray.length; i++) {
    let cc = gcd_two_numbers(primeArray[i], t);
    if (cc == 1) {
      e = primeArray[i];
      break;
    }
  }
  // Assume e such that gcd(e,t)==1 & 1<e<t
  // e = 7

  console.log("e", e);

  // find d

  // d * e mod t = 1
  let d;
  for (let j = 2; j < 10000; j++) {
    if ((j * e) % t == 1) {
      d = j;
      break;
    }
  }
  console.log("d", d);

  // encryption
  // message == hill key
  let cryptedArray = [];
  console.log(">>>>>>>>> ENCRYPTION<<<<<<<<<");
  let length = hillKey.length >= 9 ? 9 : 4;
  for (let i = 0; i < length; i++) {
    let message = +hillKey[i];

    // FORMULA OF ENCRYPTION OF RSA ALGORITHAM
    // C = M^e mod n

    let c = Math.pow(message, e) % n;
    console.log("encrypted text C = ", c);
    cryptedArray.push(c);
  }

  Chats.create({
    text: cryptedText,
    chatRoom: data.chatRoom,
    encryptedKey: cryptedArray,
  })
    .then((chat) => {
      let tempArray = [];
      console.log("chat", chat);

      console.log(">>>>>>>>> DECRYPTION<<<<<<<<<");
      console.log("cryptedArray", cryptedArray);
      let index = 0;
      for (let i = 0; i < chat.encryptedKey.length; i++) {
        let M = Math.pow(chat.encryptedKey[i], d) % n;
        // pow = Math.pow(c, d);
        // console.log(pow);
        // pp = (p % n) + n;
        // console.log(pp);
        // let M = pp % n;
        tempArray.push(M);
        console.log("Message M = ", M);
      }
      // keyArray = [...tempArray];
      console.log("text", chat.text);
      cryptedText = chat.text;
      decrypt();

      for (let i = cryptedText.length - 1; i > 0; ) {
        // console.log(cryptedText[i]);
        let aa = cryptedText[i];
        if (aa != "x") {
          // console.log("qq");
          break;
        } else if (aa == "x") {
          // console.log("3", aa, i);
          cryptedText = cryptedText.slice(0, i);
          i = i - 1;
        }
      }
      console.log("decrypted text", cryptedText);
      chat = { ...chat, text: cryptedText };
      socket.to(data.chatRoom).emit("chat", chat);
    })
    .catch((err) => {
      console.log(err);
    });
};
const fetchChat = (data, socket) => {
  // console.log("chat", data);
  var keyArray = [
    [2, 8, 3],
    [3, 9, 3],
    [5, 6, 9],
  ];
  hillKey = "";
  // keyArray.map((item) => {
  //   hillKey = hillKey + item[0] + item[1];
  // });
  keyArray.map((item) => {
    hillKey = hillKey + item[0] + item[1] + item[2];
  });
  console.log("hillKey", hillKey);
  var plainT = "";
  // dimension = 2;

  let enc = false;
  function search(aChar) {
    var letter = aChar.toLowerCase();
    var alphabet = "abcdefghijklmnopqrstuvwxyz";
    return alphabet.indexOf(letter);
  }

  function reverseSearch(array, dimension) {
    var strArray = [];
    var alphabet = "abcdefghijklmnopqrstuvwxyz";
    var item;

    if (dimension == 2) {
      // console.log("hello");
      for (var i in array) {
        item = array[i];
        strArray.push([alphabet[item[0]], alphabet[item[1]]]);
      }
    } else {
      for (var i in array) {
        // console.log("array", array);
        item = array[i];
        strArray.push([
          alphabet[item[0]],
          alphabet[item[1]],
          alphabet[item[2]],
        ]);
      }
    }

    return strArray;
  }

  function modInverse(a, m) {
    var atemp = a;
    atemp = atemp % m;

    if (atemp < 0) {
      atemp = m + atemp;
    }
    // console.log("atemp", atemp);
    for (var x = 1; x < m; x++) {
      if ((atemp * x) % m == 1) {
        return x;
      }
      // console.log("x", x);
    }
  }

  function getColumnVectors(xdimgrams, dimensions) {
    var item;
    var topElement;
    var middleElement;
    var bottomElement;
    var columnVectors = [];

    if (dimensions == 2) {
      for (var i in xdimgrams) {
        item = xdimgrams[i];
        topElement = item.charAt(0);
        bottomElement = item.charAt(1);

        //get the index of each letter and push into column vector
        columnVectors.push([search(topElement), search(bottomElement)]);
      }
    } else {
      for (var i in xdimgrams) {
        item = xdimgrams[i];
        topElement = item.charAt(0);
        middleElement = item.charAt(1);
        bottomElement = item.charAt(2);

        //get the index of each letter and push into column vector
        columnVectors.push([
          search(topElement),
          search(middleElement),
          search(bottomElement),
        ]);
      }
    }

    return columnVectors;
  }

  // console.log(keyArray);
  function getPremodMatrix(columnVectors, dimensions) {
    var premodArray = [];
    var kr0 = keyArray[0][0];
    var kr1 = keyArray[0][1];
    var kr2 = keyArray[1][0];
    var kr3 = keyArray[1][1];
    var cr0;
    var cr1;
    var cr2;
    var topElement;
    var middleElement;
    var bottomElement;
    var counter = 0;

    if (dimensions == 2) {
      while (premodArray.length < columnVectors.length) {
        for (var i in columnVectors) {
          cr0 = columnVectors[i][0];
          cr1 = columnVectors[i][1];
          topElement = kr0 * cr0 + kr1 * cr1;
          bottomElement = kr2 * cr0 + kr3 * cr1;
          premodArray.push([topElement, bottomElement]);
        }
        counter++;
      }
    } else {
      while (premodArray.length < columnVectors.length) {
        for (var i in columnVectors) {
          cr0 = columnVectors[i][0];
          cr1 = columnVectors[i][1];
          cr2 = columnVectors[i][2];
          topElement =
            keyArray[0][0] * cr0 + keyArray[0][1] * cr1 + keyArray[0][2] * cr2;
          middleElement =
            keyArray[1][0] * cr0 + keyArray[1][1] * cr1 + keyArray[1][2] * cr2;
          bottomElement =
            keyArray[2][0] * cr0 + keyArray[2][1] * cr1 + keyArray[2][2] * cr2;
          premodArray.push([topElement, middleElement, bottomElement]);
        }
        counter++;
      }
    }

    return premodArray;
  }

  function getDigrams(aString) {
    var input = aString.toLowerCase();
    var tempDigram = "";
    var textLength = input.length;
    var digramLength;
    var letter;
    var array = [];
    var count = 0;

    while (count < textLength) {
      digramLength = tempDigram.length;
      letter = input.charAt(count);

      if (digramLength < 2) {
        tempDigram += letter;

        if (tempDigram.length == 2) {
          array.push(tempDigram);
          tempDigram = "";
        }
      } else {
        array.push(tempDigram);
        tempDigram = "";
        tempDigram += letter;
      }

      // pad if at odd  ending
      if (count == textLength - 1 && textLength % 2 != 0) {
        tempDigram += "x";
        array.push(tempDigram);
      }
      count++;
    }

    return array;
  }

  function getTrigraph(aString) {
    var input = aString.toLowerCase();
    var tempTrigram = "";
    var textLength = input.length;
    var trigramLength;
    var letter;
    var array = [];
    var count = 0;

    while (count < textLength) {
      trigramLength = tempTrigram.length;
      letter = input.charAt(count);

      if (trigramLength < 3) {
        tempTrigram += letter;

        if (tempTrigram.length == 3) {
          array.push(tempTrigram);
          tempTrigram = "";
        }
      } else {
        array.push(tempTrigram);
        tempTrigram = "";
        tempTrigram += letter;
      }

      // pad if at odd  ending
      if (count == textLength - 1 && textLength % 3 != 0) {
        if (tempTrigram.length == 1) {
          tempTrigram += "xx";
        } else {
          tempTrigram += "x";
        }
        array.push(tempTrigram);
      }
      count++;
    }

    // pad if input does not form 3 X 3 matrix
    while (array.length < 3) {
      array.push("xxx");
    }
    return array;
  }

  var cryptedText;
  function decrypt() {
    enc = false;
    var ciphT = cryptedText;
    var dimension = 3;
    var decryptedArray = [];
    var determinant;
    var columnVectors;
    var topElement;
    var bottomElement;
    var multiplicativeInverse;
    var adjugateMatrix = [];
    var inverseKeyMatrix = [];

    if (ciphT == "") {
      alert("Please input a text to be decrypted.");
    } else {
      if (dimension == 2) {
        var digrams = getDigrams(ciphT);
        determinant =
          keyArray[0][0] * keyArray[1][1] - keyArray[0][1] * keyArray[1][0];
        // console.log(determinant);
        multiplicativeInverse = modInverse(determinant, 26);
        columnVectors = getColumnVectors(digrams, 2);
        adjugateMatrix.push([keyArray[1][1], -keyArray[0][1] + 26]);
        adjugateMatrix.push([-keyArray[1][0] + 26, keyArray[0][0]]);

        for (var i in adjugateMatrix) {
          // console.log(adjugateMatrix[i], multiplicativeInverse);
          inverseKeyMatrix.push([
            (adjugateMatrix[i][0] * multiplicativeInverse) % 26,
            (adjugateMatrix[i][1] * multiplicativeInverse) % 26,
          ]);
        }

        // finally, the decryption
        for (var i in columnVectors) {
          topElement =
            (inverseKeyMatrix[0][0] * columnVectors[i][0] +
              inverseKeyMatrix[0][1] * columnVectors[i][1]) %
            26;
          bottomElement =
            (inverseKeyMatrix[1][0] * columnVectors[i][0] +
              inverseKeyMatrix[1][1] * columnVectors[i][1]) %
            26;
          decryptedArray.push([topElement, bottomElement]);
        }

        // console.log(
        //   reverseSearch(decryptedArray, 2).toString().replace(/,/gi, "")
        // );
        cryptedText = reverseSearch(decryptedArray, 2)
          .toString()
          .replace(/,/gi, "");
      } else {
        var trigraph = getTrigraph(ciphT);
        columnVectors = getColumnVectors(trigraph, 3);
        var middleElement;

        // determinant calculation components
        var leftElement =
          keyArray[0][0] *
          (keyArray[1][1] * keyArray[2][2] - keyArray[1][2] * keyArray[2][1]);
        var middleElement =
          keyArray[0][1] *
          (keyArray[1][0] * keyArray[2][2] - keyArray[1][2] * keyArray[2][0]);
        var rightElement =
          keyArray[0][2] *
          (keyArray[1][0] * keyArray[2][1] - keyArray[1][1] * keyArray[2][0]);

        determinant = leftElement - middleElement + rightElement;
        multiplicativeInverse = modInverse(determinant % 26, 26);

        // cofactor calculation
        var cf00 =
          keyArray[1][1] * keyArray[2][2] - keyArray[1][2] * keyArray[2][1];
        var cf01 = -(
          keyArray[1][0] * keyArray[2][2] -
          keyArray[2][0] * keyArray[1][2]
        );
        var cf02 =
          keyArray[1][0] * keyArray[2][1] - keyArray[1][1] * keyArray[2][0];
        var cf10 = -(
          keyArray[0][1] * keyArray[2][2] -
          keyArray[0][2] * keyArray[2][1]
        );
        var cf11 =
          keyArray[0][0] * keyArray[2][2] - keyArray[0][2] * keyArray[2][0];
        var cf12 = -(
          keyArray[0][0] * keyArray[2][1] -
          keyArray[0][1] * keyArray[2][0]
        );
        var cf30 =
          keyArray[0][1] * keyArray[1][2] - keyArray[0][2] * keyArray[1][1];
        var cf31 = -(
          keyArray[0][0] * keyArray[1][2] -
          keyArray[0][2] * keyArray[1][0]
        );
        var cf32 =
          keyArray[0][0] * keyArray[1][1] - keyArray[0][1] * keyArray[1][0];

        adjugateMatrix.push([cf00, cf01, cf02]);
        adjugateMatrix.push([cf10, cf11, cf12]);
        adjugateMatrix.push([cf30, cf31, cf32]);

        //find the mods
        for (var i in adjugateMatrix) {
          if (adjugateMatrix[i][0] < 0) {
            adjugateMatrix[i][0] = (adjugateMatrix[i][0] % 26) + 26;
          } else {
            adjugateMatrix[i][0] = adjugateMatrix[i][0] % 26;
          }

          if (adjugateMatrix[i][1] < 0) {
            adjugateMatrix[i][1] = (adjugateMatrix[i][1] % 26) + 26;
          } else {
            adjugateMatrix[i][1] = adjugateMatrix[i][1] % 26;
          }

          if (adjugateMatrix[i][2] < 0) {
            adjugateMatrix[i][2] = (adjugateMatrix[i][2] % 26) + 26;
          } else {
            adjugateMatrix[i][2] = adjugateMatrix[i][2] % 26;
          }
        }

        // multiply adjugateMatrix with multiplicativeInverse and mod
        for (var i in adjugateMatrix) {
          topElement = (multiplicativeInverse * adjugateMatrix[i][0]) % 26;
          middleElement = (multiplicativeInverse * adjugateMatrix[i][1]) % 26;
          bottomElement = (multiplicativeInverse * adjugateMatrix[i][2]) % 26;
          inverseKeyMatrix.push([topElement, middleElement, bottomElement]);
        }

        // finally, the decryption
        for (var i in columnVectors) {
          topElement =
            (inverseKeyMatrix[0][0] * columnVectors[i][0] +
              inverseKeyMatrix[1][0] * columnVectors[i][1] +
              inverseKeyMatrix[2][0] * columnVectors[i][2]) %
            26;

          middleElement =
            (inverseKeyMatrix[0][1] * columnVectors[i][0] +
              inverseKeyMatrix[1][1] * columnVectors[i][1] +
              inverseKeyMatrix[2][1] * columnVectors[i][2]) %
            26;

          bottomElement =
            (inverseKeyMatrix[0][2] * columnVectors[i][0] +
              inverseKeyMatrix[1][2] * columnVectors[i][1] +
              inverseKeyMatrix[2][2] * columnVectors[i][2]) %
            26;

          decryptedArray.push([topElement, middleElement, bottomElement]);
        }

        // console.log(
        //   reverseSearch(decryptedArray, 3).toString().replace(/,/gi, " ")
        // );
        cryptedText = reverseSearch(decryptedArray, 3)
          .toString()
          .replace(/,/gi, "");
      }
    }
  }

  let p = 3;
  let q = 11;

  let n = p * q;

  console.log("n", n);

  let t = (p - 1) * (q - 1);

  console.log("totient function", t);

  function gcd_two_numbers(x, y) {
    if (typeof x !== "number" || typeof y !== "number") return false;
    x = Math.abs(x);
    y = Math.abs(y);
    while (y) {
      var t = y;
      y = x % y;
      x = t;
    }
    return x;
  }
  // get array of prime numbers
  function primeFactorsTo(max) {
    var store = [],
      i,
      j,
      primes = [];
    for (i = 2; i <= max; ++i) {
      if (!store[i]) {
        primes.push(i);
        for (j = i << 1; j <= max; j += i) {
          store[j] = true;
        }
      }
    }
    return primes;
  }

  // console.log(primeFactorsTo(t));
  let primeArray = primeFactorsTo(t);
  let e;
  for (let i = 2; i < primeArray.length; i++) {
    let cc = gcd_two_numbers(primeArray[i], t);
    if (cc == 1) {
      e = primeArray[i];
      break;
    }
  }
  // Assume e such that gcd(e,t)==1 & 1<e<t
  // e = 7

  console.log("e", e);

  // find d

  // d * e mod t = 1
  let d;
  for (let j = 2; j < 10000; j++) {
    if ((j * e) % t == 1) {
      d = j;
      break;
    }
  }
  console.log("d", d);

  Chats.find({ chatRoom: data.chatRoom })
    .then((chat) => {
      let tempArray = [];
      console.log("chat", chat);
      if (chat.length > 0) {
        const newChat = chat.map((item) => {
          console.log("item", item.text);
          console.log(">>>>>>>>> DECRYPTION<<<<<<<<<");
          for (let i = 0; i < item.encryptedKey.length; i++) {
            let M = Math.pow(item.encryptedKey[i], d) % n;
            // pow = Math.pow(c, d);
            // console.log(pow);
            // pp = (p % n) + n;
            // console.log(pp);
            // let M = pp % n;
            tempArray.push(M);
            console.log("Message M = ", M);
          }
          // keyArray = [...tempArray];
          console.log("text", item.text);
          cryptedText = item.text;
          decrypt();

          for (let i = cryptedText.length - 1; i > 0; ) {
            // console.log(cryptedText[i]);
            let aa = cryptedText[i];
            if (aa != "x") {
              // console.log("qq");
              break;
            } else if (aa == "x") {
              // console.log("3", aa, i);
              cryptedText = cryptedText.slice(0, i);
              i = i - 1;
            }
          }
          console.log("decrypted text", cryptedText);
          item.text = cryptedText;
        });
        socket.to(data.chatRoom).emit("joinChatRoom", chat);
      } else {
        Chats.create({ text: "", chatRoom: data.chatRoom }).then((chats) => {
          // convert object to array
          let chatArray = Object.values(chats);
          console.log("chatArray", chatArray);
          let chatss = [];
          chatss.push(chatArray[1]);
          console.log("chat", chatss);
          socket.to(data.chatRoom).emit("joinChatRoom", chatss);
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
module.exports = {
  saveChat,
  fetchChat,
};
