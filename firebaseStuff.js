
var database = firebase.firestore();
//var docRef = database.collection("users").doc("julia");
var provider = new firebase.auth.GoogleAuthProvider();
var message = document.getElementById("message");
var current_user = null;

function authenticate(){
	firebase.auth().getRedirectResult().then(function(result) {
	  if (result.credential) {
	    var token = result.credential.accessToken;
	  }
	  else {
		  firebase.auth().signInWithPopup(provider);
	  }
	  current_user = result.user;
	  message.innerHTML = "Signed in as " + current_user.email;
	}).catch(function(error) {
		console.log('error signing in: ', error);
	});
}

function signOut(){
	firebase.auth().signOut().then(function() {
		message.innerHTML = "Signed out";
		document.querySelector('#saveButton').style.display = 'none';
	}).catch(function(error) {
		console.log('error signing out: ', error);
	});
}

firebase.auth().onAuthStateChanged(function(user){
	console.log("auth state changed");
	current_user=user;
	if(user){
		document.querySelector('#saveButton').style.display = 'inline';
		message.innerHTML = "Signed in as " + user.email;

		docRef = database.collection("users").doc("julia");
		docRef.get().then(function(doc) {
	    if (doc.exists) {
        //console.log("Document data:", doc.data());
				text = doc.data().text;
				updateText();
	    }else{
	      console.log("No such document!");
	    }
			}).catch(function(error) {
		    console.log("Error getting document:", error);
			});
  	}else{
			message.innerHTML = "Sign in to save your text";
  	}
});


function saveText(){
	var txt = document.querySelector('#flatText').value;
	database.collection("users").doc(current_user.email).set({
    text: txt
	})
	.then(function() {
	    console.log("Document written: "+txt);
	})
	.catch(function(error) {
	    console.error("Error writing document: ", error);
	});
}

document.getElementById("saveButton").addEventListener("click", saveText);
document.getElementById("signInButton").addEventListener("click", authenticate);
document.getElementById("signOutButton").addEventListener("click", signOut);
