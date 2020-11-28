alert("1")

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
	  // Handle Errors here.
	  var errorCode = error.code;
	  var errorMessage = error.message;
	  // The email of the user's account used.
	  var email = error.email;
	  // The firebase.auth.AuthCredential type that was used.
	  var credential = error.credential;
	});
}

function signOut(){
	firebase.auth().signOut().then(function() {
		// Sign-out successful
		message.innerHTML = "Signed out";
	}).catch(function(error) {
		// An error happened
	});
}

//setting an event listener for change of authentication state
firebase.auth().onAuthStateChanged(function(user) {
	console.log("auth state changed");
	current_user=user;
	if(user){
    	// User is signed in
		message.innerHTML = "Signed in as " + user.email;

		/*database.collection("users").julia.get()
		.then(function(querySnapshot){
	    querySnapshot.forEach(function(doc){
	      console.log(doc.id+": "+doc.data().text);
	      text += doc.data().text;
	      updateText();
	    });
	  });*/
		var docRef = database.collection("users").doc("julia");

		docRef.get().then(function(doc) {
		    if (doc.exists) {
		        console.log("Document data:", doc.data());
		    } else {
		        // doc.data() will be undefined in this case
		        console.log("No such document!");
		    }
		}).catch(function(error) {
		    console.log("Error getting document:", error);
		});



  	}else{
    	// No user is signed in
		message.innerHTML = "Signed out";
  	}
});





function order()
{
	if (current_user) {
		// Write a new document to firebase with a generated id.
		database.collection("text").add({
			text: "hello"
		})
		.then(function(docRef) {
    		console.log("Document written with ID: ", docRef.id);
		})
		.catch(function(error) {
			console.error("Error adding document: ", error);
		});
	}
	else {
		// No user is signed in.
		//alert("Sign in to save your text");
	}
}

document.getElementById("saveButton").addEventListener("click", order);
document.getElementById("signInButton").addEventListener("click", authenticate);
document.getElementById("signOutButton").addEventListener("click", signOut);
