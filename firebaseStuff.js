alert("2")

var database = firebase.firestore();
//var docRef = database.collection("users").doc("julia");
var provider = new firebase.auth.GoogleAuthProvider();
var message = document.getElementById("message");
var current_user = null;

function authenticate(){
	firebase.auth().getRedirectResult().then(function(result) {
	  if (result.credential) {
	    // This gives you a Google Access Token. You can use it to access the Google API.
	    var token = result.credential.accessToken;
	  }
	  else {
		  //google sign-in redirect
		  firebase.auth().signInWithPopup(provider);
	  }
	  // The signed-in user info
	  current_user = result.user;
	  message.innerHTML = "Signed in as " + current_user.email;



	}).catch(function(error) {
		console.log('error '+error.code+": "+error.message);
	});
}

function signOut(){
	firebase.auth().signOut().then(function() {
		// Sign-out successful
		message.innerHTML = "Signed out";
		document.querySelector('#saveButton').style.display = 'none';
	}).catch(function(error) {
		// An error happened
	});
}

//setting an event listener for change of authentication state
firebase.auth().onAuthStateChanged(function(user){
	console.log("auth state changed");
	current_user=user;
	if(user){
    	// User is signed in
		document.querySelector('#saveButton').style.display = 'inline';
		message.innerHTML = "Signed in as " + user.email;
		var docRef = database.collection("users").doc("julia");

		docRef.get().then(function(doc) {
	    if (doc.exists) {
	        console.log("Document data:", doc.data());
					text = doc.data().text;
					updateText();
	    }else{
	        // doc.data() will be undefined in this case
	        console.log("No such document!");
					//add new user
	    }
			}).catch(function(error) {
		    console.log("Error getting document:", error);
			});
  	}else{
    	// No user is signed in
			message.innerHTML = "Sign in to save your text";
  	}
});


function save(){
	database.collection("users").doc("julia").set({
    text: text
	})
	.then(function() {
	    console.log("Document successfully written!");
	})
	.catch(function(error) {
	    console.error("Error writing document: ", error);
	});
}

document.getElementById("saveButton").addEventListener("click", save);
document.getElementById("signInButton").addEventListener("click", authenticate);
document.getElementById("signOutButton").addEventListener("click", signOut);
