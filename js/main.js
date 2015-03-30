//starting condition
function newRound(thePlayer){
    var shuffleWord = function(array){ //scrambles a word
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array; //returns scrambled word string
    };
    //1. takes answer and scrambles it again + returns scrambled value  2. refreshes browser for new scrambled word
    var reset = function(answer){
        //empty container div
        $('#letters_guessed').empty();
        var chosenWordArr = answer.split('');
        var shuffledWord = shuffleWord(chosenWordArr);
        //add letters to display
        shuffledWord.forEach(function(letter){
            var letterElement = $('<span class="letter"></span>').text(letter);
            $('#letters_remaining').append(letterElement);
        });
        return shuffledWord;
    };
    var resetWordBanks = function (newShuffledWord){ //resets containers if user guesses incorrectly
        shuffledWordArr = newShuffledWord;
        pickedLetters = [];
    };

    //after all letters are selected, checks if the user has picked them in the right order + returns bool
    var checkIfCorrect = function(selectedLetters, answer){
        var selectedWord = ''; //the word the user has guessed
        selectedLetters.forEach(function(indexLetterPair){
            selectedWord += indexLetterPair[1]; //the letter is at index===1
        });
        return selectedWord === answer;
    };

    var selectLetter = function(letterBank, selectedLetters, answer, event){
        var guessedLetterContainer = $('#letters_guessed');
        //letterBank is an array of unpicked letters, while selectedLetters is an array of [index, pickedLetter]
        var indexOfTyped = letterBank.indexOf(String.fromCharCode(event.which));
        if (indexOfTyped !== -1){
            //select the span that corresponds to the user-typed letter
            var $eleToMove = $('#letters_remaining').children('span:eq(' + indexOfTyped + ')');
            guessedLetterContainer.append($eleToMove);
            //remove letter from selectable letters and add index to selectedLetters
            var letter = letterBank.splice(indexOfTyped, 1);
            selectedLetters.push([indexOfTyped, letter]);
            //if all letters have been selected check to see if correct; if wrong, reset game
            if (letterBank.length === 0) {
                var isCorrect = checkIfCorrect(selectedLetters, answer);
                if (!isCorrect){
                    //reset letters and randomize again
                    resetWordBanks(reset(answer)); //resets and returns new letterBank
                } else { //if user got correct answer
                    guessedLetterContainer.empty();
                    //stop countdown clock
                    clearInterval(countdownStopper);
                }
            }
            //if backspace is pressed then reverse last move
        }else if(event.which === 8 && selectedLetters.length > 0){
            var $eleToReverse = guessedLetterContainer.children().last();
            //get [index, letter] where $eleToReverse will get inserted and remove index from selectedLetters
            var indexLetterPair = selectedLetters.splice(selectedLetters.length - 1, 1);
            var indexToMoveTo = +(indexLetterPair[0][0]); //get index and convert to #
            //move most recent letter that was moved back to where it was previously
            if (indexToMoveTo === letterBank.length){
                //if we need to move the element to the end
                $('#letters_remaining').append($eleToReverse);
            }else {
                //if the element does not go at the end, insert it before the indexToMoveTo
                $eleToReverse.insertBefore($('#letters_remaining span:eq(' + indexToMoveTo + ')'));
            }
            //add letter back to array of letters remaining
            letterBank.splice(indexToMoveTo, 0, $eleToReverse.text());
        }
    };

    //update the player's info on browser
    (function updateGui(){
        $('#score').val(thePlayer.getScore());
        $('#round').val(thePlayer.getRound());
    })();

    //start timer
    var countdownStopper = thePlayer.startCountdown();
    //randomly select word, make it all caps, and split it into an array of its characters
    var answer = words[(Math.random() * words.length) | 0].toUpperCase();
    var chosenWordArr = answer.split('');
    //shuffle randomly selected word ['w', 'o', 'r', 'd']
    var shuffledWordArr = shuffleWord(chosenWordArr);
    //add letters to display
    shuffledWordArr.forEach(function(letter){
        var letterElement = $('<span class="letter"></span>').text(letter);
        $('#letters_remaining').append(letterElement);
    });
    var pickedLetters = []; //letters user has guessed in order

    //EVENT LISTENER
    $('body').keyup(function(event){
        selectLetter(shuffledWordArr, pickedLetters, answer, event);
        //start next round when their are no letters left to be guessed + guess is correct
        if (shuffledWordArr.length === 0) {
            $('body').off();
            //updates player's score/round/timeLimit
            thePlayer.nextWord(answer.length);
            newRound(thePlayer); //starts next round
        }
    });
}
//would import word-list normally, but following works to demonstrate app
var words=['bear', 'stair', 'square', 'smile', 'while', 'quilt', 'burst', 'dream', 'fleet', 'sleet', 'orange', 'house',
    'robot', 'file', 'trial', 'squid', 'rabbit', 'steel', 'ballad', 'crate', 'brake', 'snake', 'yellow', 'pearl', 'witch',
    'snitch', 'twitch', 'itch', 'ditch', 'shone', 'hone', 'bone', 'lone', 'loan', 'moan', 'cone', 'tone', 'honest'];

(function main(){
    //player/scoring object
    var Player = function(){
        var score = 0;
        var round = 1;
        var timeRemaining = 40;
        this.nextWord = function(wordLength){
            score += round * wordLength;
            round += 1;
            timeRemaining = (timeRemaining > 3) ? timeRemaining - 1: timeRemaining; //3 seconds is min amt of time per round
        };
        this.getScore = function(){
            return score;
        };
        this.getRound = function(){
            return round;
        };
        this.startCountdown = function(){
            var seconds = timeRemaining;
            var stopper = setInterval(function(){
                $('#time_remaining').val(seconds);
                if (seconds === 0){
                    clearInterval(stopper);
                    $('body').off(); //freezes game
                    $('span').addClass('done');
                }
                seconds -= 1;
            }, 1000);
            return stopper;
        };
    };

    var player = new Player();
    newRound(player);
})();