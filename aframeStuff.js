var text = "";
var inVR = false;

AFRAME.registerComponent('vr-in-out',{
  init: function() {
    var el = this.el;
    el.addEventListener('enter-vr', function () {
       inVR = true;
    })
    el.addEventListener('exit-vr', function () {
       inVR = false;
    })
  }
});

AFRAME.registerComponent('keyboard-settings',{
  init: function() {
    var tall = document.querySelector('#tallButton');
    var stand = document.querySelector('#standingButton');
    var sit = document.querySelector('#sittingButton');
    var abc = document.querySelector('#abcButton');
    var dvorak = document.querySelector('#dvorakButton');
    var qwerty = document.querySelector('#qwertyButton');

    addKeys('dvorak');
    tall.addEventListener('click', function(){heightChange(tall,stand,sit,1.5)});
    stand.addEventListener('click', function(){heightChange(stand,tall,sit,1)});
    sit.addEventListener('click', function(){heightChange(sit,tall,stand,.5)});
    abc.addEventListener('click', function(){
      buttonSelect(abc,dvorak,qwerty);
      addKeys('abc');
    });
    dvorak.addEventListener('click', function(){
      buttonSelect(dvorak,abc,qwerty);
      addKeys('dvorak');
    });
    qwerty.addEventListener('click', function(){
      buttonSelect(qwerty,abc,dvorak);
      addKeys('qwerty');
    });

    function heightChange(a,b,c,pos){
      buttonSelect(a,b,c);
      document.querySelector('#keyboard').object3D.position.y = pos;
    }

  }
});



AFRAME.registerComponent('velocity-calculator', {
  init: function() {
    var hand = this.el;
    var position = new THREE.Vector3();
    var oldPos = hand.object3D.getWorldPosition(position);
    var newPos = oldPos;
    var timer = 100;
    setInterval(function(){
      //figure out how far the hand moved in the last 100ms
      oldPos = newPos;
      var position = new THREE.Vector3();
      newPos = hand.object3D.getWorldPosition(position);
      var vel = distanceBetween(oldPos, newPos); //not dividing by time to avoid teensy numbers
      hand.setAttribute('velocity',vel);
    }, timer);
  }
});

AFRAME.registerComponent('sphere-collider', {
  init: function() {
    var hand = this.el;
    var timer = 100;

    setInterval(function(){
      var objs = document.querySelectorAll('.interactable');//fix this - set when settings change, make global var
      var handPosition = new THREE.Vector3();
      var handPos = hand.object3D.getWorldPosition(handPosition);
      for(var i=0; i<objs.length; i++){
        var objPosition = new THREE.Vector3();
        var objPos = objs[i].object3D.getWorldPosition(objPosition);
        var dist = distanceBetween(objPos, handPos);
        if(dist < .15){
          objs[i].emit('hit', {hand:hand}, false);
        }
      }
    }, timer);
  }
});


function updateText(){
  document.querySelector('#vrText').setAttribute('text','value:'+text+'_');
  document.querySelector('#flatText').innerHTML = text;
}

function distanceBetween(a,b){
  var difX = a.x - b.x;
  var difY = a.y - b.y;
  var difZ = a.z - b.z;
  var difXsq = difX * difX;
  var difYsq = difY * difY;
  var difZsq = difZ * difZ;
  var difSum = difXsq + difYsq + difZsq;
  var distance = Math.sqrt(difSum);
  return distance;
}


    AFRAME.registerComponent('yx-button-listener', {
      init: function () {

        var el = this.el;
        textY = 3;
        el.addEventListener('ybuttondown', function (evt) {
          //scroll text up
          scrolling = setInterval(function(){
            textY += .03;
            var text = document.querySelector('#vrTextBox');
            text.setAttribute('position','0, '+textY+', -5');
          }, 10);
        });
        el.addEventListener('ybuttonup', function (evt) {
          clearInterval(scrolling);
        });
        el.addEventListener('xbuttondown', function (evt) {
          //scroll text down
          scrolling = setInterval(function(){
            textY -= .03;
            var text = document.querySelector('#vrTextBox');
            text.setAttribute('position','0, '+textY+', -5');
          }, 10);
        });
        el.addEventListener('xbuttonup', function (evt) {
          clearInterval(scrolling);
        });
      }
    });

    AFRAME.registerComponent('a-button-listener', {
      init: function () {
        var el = this.el;
        numpadVisible = false;
        el.addEventListener('abuttondown', function (evt) {
          numpadVisible = !numpadVisible;
          var keyboard = document.querySelector('#keyboard');
          var numpad = document.querySelector('#numpad');
          if(numpadVisible){
            numpad.setAttribute('animation','property:position; to:0 1 -.5');
            keyboard.setAttribute('animation','property:position; to:0 -2 -4');
          }else{
            numpad.setAttribute('animation','property:position; to:0 -2 -4');
            keyboard.setAttribute('animation','property:position; to:0 .6 .3');
          }
        })
      }
    });

    AFRAME.registerComponent('letter-key', {
      init: function () {
        var el = this.el;
        el.addEventListener('hit', function (evt) {
          if(inVR){
            var hand = evt.detail.hand;
            var velocity = hand.getAttribute('velocity');
            var char = '';
            if(velocity > .2){
              char = el.getAttribute('capchar');
              el.emit('hardPunch');
            }else{
              char = el.getAttribute('lowchar');
              el.emit('softPunch');
            }
            text += char;
            updateText();
          }
        })
      }
    });

    AFRAME.registerComponent('backspace', {
      init: function () {
        var el = this.el;
        el.addEventListener('hit', function (evt) {
          text = text.substring(0, text.length -1);
          updateText();
        })
      }
    });

    function buttonSelect(a,b,c){
      a.setAttribute('class','selected');
      b.setAttribute('class','deselected');
      c.setAttribute('class','deselected');
    }

    AFRAME.registerComponent('external-text', {
      init: function() {
        document.querySelector('#flatText').addEventListener('change', function(){
          text = document.querySelector('#flatText').value;
          updateText();
        })
      }
    });


        function addKeys(layout){
          var keyboard = document.querySelector('#keyboard');
        //clear keyboard
        var keys = keyboard.querySelectorAll('.interactable');
        for(var i=0; i<keys.length; i++){
          keyboard.removeChild(keys[i]);
        }

        var capChars = [];
        var lowChars = [];
        if(layout == 'abc'){
          capChars.push(['A','B','C','D','E','F','G','H','I',':']);
          capChars.push(['J','K','L','M','N','O','P','Q','R','"']);
          capChars.push(['S','T','U','V','W','X','Y','Z','.','?']);
          lowChars = [];
          lowChars.push(['a','b','c','d','e','f','g','h','i',';']);
          lowChars.push(['j','k','l','m','n','o','p','q','r',"'"]);
          lowChars.push(['s','t','u','v','w','x','y','z',',','/']);
        }else if(layout == 'qwerty'){
          capChars.push(['Q','W','E','R','T','Y','U','I','O','P']);
          capChars.push(['A','S','D','F','G','H','J','K','L',':']);
          capChars.push(['Z','X','C','V','B','N','M','.','?','"']);
          lowChars = [];
          lowChars.push(['q','w','e','r','t','y','u','i','o','p']);
          lowChars.push(['a','s','d','f','g','h','j','k','l',';']);
          lowChars.push(['z','x','c','v','b','n','m',',','/',"'"]);
        }else{
          capChars.push(['"','.','P','Y','F','G','C','R','L','?']);
          capChars.push(['A','O','E','U','I','D','H','T','N','S']);
          capChars.push([':','Q','J','K','X','B','M','W','V','Z']);
          lowChars = [];
          lowChars.push(["'",',','p','y','f','g','c','r','l','/']);
          lowChars.push(['a','o','e','u','i','d','h','t','n','s']);
          lowChars.push(['~','q','j','k','x','b','m','w','v','z']);
        }

        var rowCount = 10;
        var radius = .9;
        for(var i=0; i<capChars.length; i++){
          var y = 1-(.25*i);
          for(var j=0; j<rowCount; j++){
            var newBall = document.createElement('a-sphere');
            var step = Math.PI/(rowCount-.5);
            var x = radius * Math.cos(step*j + Math.PI);
            var z = -radius * Math.sin(step*j);
            var x2 = (radius*2) * Math.cos(step*j + Math.PI);
            var z2 = -(radius*2) * Math.sin(step*j);
            var rot = x*-90;
            newBall.setAttribute('color', '#ff66a3');
            newBall.setAttribute('position', x+' '+y+' '+z);
            newBall.setAttribute('animation','property:position; from:'+x2+' '+y+' '+z2+'; to:'+x+' '+y+' '+z+'; startEvents:hit');
            newBall.setAttribute('mixin','ball');
            newBall.setAttribute('letter-key','');
            newBall.setAttribute('class','interactable');
            newBall.setAttribute('lowchar', lowChars[i][j]);
            newBall.setAttribute('capchar', capChars[i][j]);
            var newLetter = document.createElement('a-text');
            var l = lowChars[i][j];
            if(l.charCodeAt(0)< 123 && l.charCodeAt(0)>96){
              newLetter.setAttribute('value',capChars[i][j]);
            }else{
              newLetter.setAttribute('value',capChars[i][j]+'\n'+ l);
            }
            newLetter.setAttribute('scale','4 4');
            newLetter.setAttribute('align','center');
            newLetter.setAttribute('rotation','0 '+rot+' 0');
            newBall.appendChild(newLetter);
            keyboard.appendChild(newBall);
          }
        }

        //space key
        var newBall = document.createElement('a-sphere');
        newBall.setAttribute('position','0 .3 -.8');
        //newBall.setAttribute('animation','property:position; from:0 0 -3; to:0 .3 -.8; startEvents:hit;');
        newBall.setAttribute('mixin','ball');
        newBall.setAttribute('letter-key','');
        newBall.setAttribute('scale','.3 .1 .1');
        newBall.setAttribute('lowchar',' ');
        newBall.setAttribute('capchar',' ');
        newBall.setAttribute('class','interactable');
        var newLetter = document.createElement('a-text');
        newLetter.setAttribute('value','|___|');
        newLetter.setAttribute('scale','2 4');
        newLetter.setAttribute('align','center');
        newBall.appendChild(newLetter);
        keyboard.appendChild(newBall);

        //backspace key
        var newBall = document.createElement('a-sphere');
        newBall.setAttribute('position','-.4 .3 -.7');
        //newBall.setAttribute('animation','property:position; from:0 0 -3; to:-.4 .3 -.7; startEvents:hit;');
        newBall.setAttribute('mixin','ball');
        newBall.setAttribute('class','interactable');
        newBall.setAttribute('backspace','');
        var newLetter = document.createElement('a-text');
        newLetter.setAttribute('value','bksp');
        newLetter.setAttribute('scale','2 4');
        newLetter.setAttribute('align','center');
        newBall.appendChild(newLetter);
        keyboard.appendChild(newBall);

        //return key
        var newBall = document.createElement('a-sphere');
        newBall.setAttribute('position','.4 .3 -.7');
        //newBall.setAttribute('animation','property:position; from:0 0 -3; to:.4 .3 -.7; startEvents:hit;');
        newBall.setAttribute('mixin','ball');
        newBall.setAttribute('letter-key','');
        newBall.setAttribute('lowchar','\n');
        newBall.setAttribute('capchar','\n');
        newBall.setAttribute('class','interactable');
        var newLetter = document.createElement('a-text');
        newLetter.setAttribute('value','rtrn');
        newLetter.setAttribute('scale','2 4');
        newLetter.setAttribute('align','center');
        newBall.appendChild(newLetter);
        keyboard.appendChild(newBall);
      }//end addKeys function
      //}
    //});

    AFRAME.registerComponent('numpad-setup', {
      init: function() {
        var numpad = this.el;
        capChars = [];
        capChars.push(['!','@','#','$']);
        capChars.push(['%','^','&','*']);
        capChars.push(['(',')','_','+']);
        lowChars = [];
        lowChars.push(['1','2','3','4']);
        lowChars.push(['5','6','7','8']);
        lowChars.push(['9','0','-','=']);
        var rowCount = 4;
        var z = 0;
        for(var i=0; i<3; i++){
          var y = .6-(.25*i);
          for(var j=0; j<rowCount; j++){
            var newBall = document.createElement('a-sphere');
            var x = j*.3 - .5;
            newBall.setAttribute('color', 'cyan');
            newBall.setAttribute('position', x+' '+y+' '+z);
            newBall.setAttribute('animation','property:object3D.position.z; from:'+(z-1)+'; to:'+z+'; startEvents:hit');
            newBall.setAttribute('mixin','ball');
            newBall.setAttribute('letter-key','');
            newBall.setAttribute('class','interactable');
            newBall.setAttribute('lowchar', lowChars[i][j]);
            newBall.setAttribute('capchar', capChars[i][j]);
            var newLetter = document.createElement('a-text');
            newLetter.setAttribute('value',capChars[i][j]+'\n'+lowChars[i][j]);
            newLetter.setAttribute('align','center');
            newLetter.setAttribute('scale','4 4');
            newBall.appendChild(newLetter);
            numpad.appendChild(newBall);
          }
        }
      }
    });
