
var database = firebase.firestore();
//var docRef = database.collection("users").doc("julia");
var provider = new firebase.auth.GoogleAuthProvider();
var message = document.getElementById("message");
var currentUser = null;
var flatText = document.getElementById("flatText");

function authenticate(){
	firebase.auth().getRedirectResult().then(function(result) {
	  if (result.credential) {
	    var token = result.credential.accessToken;
	  }
	  else {
		  firebase.auth().signInWithPopup(provider);
	  }
	  currentUser = result.user;
	  message.innerHTML = "Signed in as " + currentUser.email;
	}).catch(function(error) {
		console.log('error signing in: ', error);
	});
}

function signOut(){
	firebase.auth().signOut().then(function() {
		message.innerHTML = "Signed out";
		document.querySelector('#saveButton').style.display = 'none';
		text = "";
		updateText();
	}).catch(function(error) {
		console.log('error signing out: ', error);
	});
}

firebase.auth().onAuthStateChanged(function(user){
	console.log("auth state changed");
	currentUser = user;
	if(currentUser){
		document.querySelector('#saveButton').style.display = 'inline';
		message.innerHTML = "Signed in as " + currentUser.email;
		docRef = database.collection("users").doc(currentUser.email);
		docRef.get().then(function(doc){
			text = doc.data().text;
			updateText();
		}).catch(function(error) {
		    console.log("Error getting document:", error);
		});
  }else{
		message.innerHTML = "Sign in to save your text";

  }
});

function saveText(){
	var txt = flatText.value;
	database.collection("users").doc(currentUser.email).set({
    text: txt
	})
	.then(function() {
	    console.log("Document written");
	})
	.catch(function(error) {
	    console.error("Error writing document: ", error);
	});
}

document.getElementById("saveButton").addEventListener("click", saveText);
document.getElementById("signInButton").addEventListener("click", authenticate);
document.getElementById("signOutButton").addEventListener("click", signOut);
