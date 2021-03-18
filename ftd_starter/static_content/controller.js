var stage=null;
var view = null;
var interval=null;
var difficulty = null;
var credentials={ "username": "", "password":"" };

function setupGame(){
	stage=new Stage(document.getElementById('stage'), difficulty);

        // events
	document.addEventListener('keydown', moveByKey);
        document.addEventListener('keyup', stopByKey);
        document.getElementById('stage').addEventListener('click', shootByClick)
        document.addEventListener('keydown', pickupAmmoByClick);
        document.getElementById('stage').addEventListener('mousemove', adjustTurret);
}

function gameStep() {
        if (!stage.gameOver) {
                stage.step(); 
                stage.draw(); 
        }
        else {
                clearInterval(interval);
        }
}

function startGame(){
	interval=setInterval(gameStep, 1);
}

function pauseGame(){
	clearInterval(interval);
	interval=null;
}

function adjustTurret(event) {
        stage.player.adjustTurret(event.clientX, event.clientY);
}

function moveByKey(event){

	var key = event.key;
        var dx = stage.player.velocity.x;
        var dy = stage.player.velocity.y;

        if (key == 'w') {
                dy = -1;
                stage.player.velocity = new Pair(dx, dy);
        }
        if (key == 'a') {
                dx = -1;
                stage.player.velocity = new Pair(dx, dy);
        }
        if (key == 's') {
                dy = 1;
                stage.player.velocity = new Pair(dx, dy);
        }
        if (key == 'd') {
                dx = 1;
                stage.player.velocity = new Pair(dx, dy);
        }
}

function stopByKey (event) {
        var key = event.key;
        var dx = stage.player.velocity.x;
        var dy = stage.player.velocity.y;

        if (key == 'w') {
                if (dy < 0) {dy = 0;}
                stage.player.velocity = new Pair(dx, dy);
        }
        if (key == 'a') {
                if (dx < 0) {dx = 0;}
                stage.player.velocity = new Pair(dx, dy);
        }
        if (key == 's') {
                if (dy > 0) {dy = 0;}
                stage.player.velocity = new Pair(dx, dy);
        }
        if (key == 'd') {
                if (dx > 0) {dx = 0;}
                stage.player.velocity = new Pair(dx, dy);
        }
}

function shootByClick(event) {
        stage.player.shoot(event.clientX - stage.canvas.getBoundingClientRect().left, event.clientY - stage.canvas.getBoundingClientRect().top);
}

function pickupAmmoByClick(event) {
        if (event.key == 'e') {
                stage.player.pickupAmmo();
        }
}

function login(){
	credentials =  { 
		"username": $("#username").val(), 
		"password": $("#password").val() 
	};

        $.ajax({
                method: "POST",
                url: "/api/auth/login",
                data: JSON.stringify({}),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                processData:false,
                contentType: "application/json; charset=utf-8",
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));

                hideAll();
                $("#ui_difficulty").show();
                

        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
        });
}

// Using the /api/auth/test route, must send authorization header
function test(){
        $.ajax({
                method: "GET",
                url: "/api/auth/test",
                data: {},
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
                dataType:"json"
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
        });
}

function register(){
        values = {
                "username": $('#newusername').val(),
                "password": $('#pwd').val(),
                "password2": $('#pwd2').val(),
                "skill": "",
                "birthday": $("#birthday").val()
        };
        if ($("#beginner").prop("checked") == true) {
                values["skill"] = "beginner";
        } else if ($("#intermediate").prop("checked") == true) {
                values["skill"] = "intermediate";
        } else if ($("#pro").prop("checked") == true) {
                values["skill"] = "pro";
        }

        // check all fields are non empty
        var error = 0;
        if (values["username"] == "") {
                $("#usernameError").html("Please enter username");
                error = 1;
        } else { 
                $("#usernameError").html("");
        }
        $.ajax({
                method: "GET",
                url: "api/user/" + values["username"],
                async: false
        }).done(function(data, text_status, jqXHR){
                if (jqXHR.status == 200) {
                        $("#usernameError").html("Username is taken")
                        error = 1;
                } else {
                        $("#usernameError").html("");
                }
        });
        // check if passwords match
        if (values["password"] != values["password2"]) {
                $("#passwordError").html("Passwords do not match");
                error = 1;
        } else if (values["password"] == "" && values["password2"] == "") {
                $("#passwordError").html("Please enter password");
                error = 1;
        } else if (values["password"].length < 8) {
                $("#passwordError").html("Password must be at least 8 characters long");
                error = 1;
        } else { 
                $("#passwordError").html("");
        }
        if (values["birthday"] == "") {
                $("#birthdayError").html("Please enter birthday");
                error = 1;
        } else { 
                $("#birthdayError").html("");
        }
        if (values["skill"] == "") {
                $("#skillError").html("Please choose skill level");
                error = 1;
        } else { 
                $("#skillError").html("");
        }
        if (error) {
                return;
        }

        $.ajax({
                method: "POST",
                url: "/api/user",
                data: JSON.stringify(values),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                processData: false
        }).done(function(data, text_status, jqXHR){
                console.log(jqXHR.status+" "+text_status+JSON.stringify(data));
                $("#ui_login").show();
                $("#ui_play").hide();
                $("#ui_register").hide();
        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
        });
}

function loadProfile() {
        $.ajax({
                method: "GET",
                url: "/api/user/" + credentials['username'],
                //data: JSON.stringify({username: "blah"}),
                //contentType: "application/json; charset=utf-8",
                dataType: "json",
        }).done(function(data, text_status, jqXHR) {
                //console.log(data['skill']);
                if (data['skill'] == 'beginner') {
                        $("#beginnerProfile").prop("checked", true);
                } else if (data['skill'] == 'intermediate') {
                        $("#intermediateProfile").prop("checked", true);
                } else {
                        $("#proProfile").prop("checked", true);
                }
                $("#birthdayProfile").val(data['birthday'].slice(0,10));

        }).fail(function(err){
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
        });
        $("#newusernameProfile").val(credentials["username"]);
};

function updateProfile() {
        values = {
                "oldUsername": credentials['username'],
                "newUsername": $('#newusernameProfile').val(),
                "password": $('#pwdProfile').val(),
                "password2": $('#pwd2Profile').val(),
                "skill": "",
                "birthday": $("#birthdayProfile").val()
        };

        if ($("#beginnerProfile").prop("checked") == true) {
                values["skill"] = "beginner";
        } else if ($("#intermediateProfile").prop("checked") == true) {
                values["skill"] = "intermediate";
        } else if ($("#proProfile").prop("checked") == true) {
                values["skill"] = "pro";
        }

        var error = 0;
        if (values["newUsername"] == "") {
                $("#usernameProfileError").html("Please enter username");
                error = 1;
        } else { 
                $("#usernameProfileError").html("");
        }

        if (values["newUsername"] != values["oldUsername"]) {
                $.ajax({
                        method: "GET",
                        url: "api/user/" + values["newUsername"],
                        async: false
                }).done(function(data, text_status, jqXHR){
                        if (jqXHR.status == 200) {
                                $("#usernameProfileError").html("Username is taken")
                                error = 1;
                        } else {
                                $("#usernameProfileError").html("");
                        }
                });
        }

        if (values["password"] != "" || values["password2"] != "") {
                if (values["password"] != values["password2"]) {
                        $("#passwordProfileError").html("Passwords do not match");
                        error = 1;
                } else if (values["password"].length < 8) {
                        $("#passwordProfileError").html("Password must be at least 8 characters long");
                        error = 1;
                } else { 
                        $("#passwordProfileError").html("");
                }
        } else {
                $("#passwordProfileError").html("");
        }

        if (values["birthday"] == "") {
                $("#birthdayProfileError").html("Please enter birthday");
                error = 1;
        } else { 
                $("#birthdayProfileError").html("");
        }

        if (values["skill"] == "") {
                $("#skillProfileError").html("Please choose skill level");
                error = 1;
        } else { 
                $("#skillProfileError").html("");
        }
        
        if (error) {
                return;
        }

        $.ajax({
                method: "PUT",
                url: "/api/user",
                data: JSON.stringify(values),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                processData: false
        }).done(function(data, text_status, jqXHR) {
                credentials["username"] = values["newUsername"];
        }).fail(function(err) {
                console.log("fail "+err.status+" "+JSON.stringify(err.responseJSON));
        });
}

function hideAll() {
        $("#ui_login").hide(); 
        $("#ui_register").hide();
        $("#ui_play").hide();
        $("#ui_instructions").hide();
        $("#ui_leaderboard").hide();
        $("#ui_profile").hide();
        $("#ui_difficulty").hide();
};

$(function(){
        // Setup all events here and display the appropriate UI
        $("#loginSubmit").on('click',function(){ login(); });
        $("#loginRegister").on('click', function() { 
                hideAll(); 
                $("#ui_register").show();
        });
        $("#registerSubmit").on('click', function(){ register(); })
        $("#registerBack").on('click', function(){
                hideAll();
                $("#ui_login").show();
        });

        $("#playSubmit").on('click', function(){
                hideAll();
                $("#ui_play").show();
        });

        $("#leaderboardSubmit").on('click', function(){
                hideAll();
                $("#ui_leaderboard").show();
        });

        $("#instructionsSubmit").on('click', function(){
                hideAll();
                $("#ui_instructions").show();
        });

        $("#profileSubmit").on('click', function(){
                hideAll();
                $("#ui_profile").show();
                loadProfile();
        });
        
        $("#update").on('click', function() {
                updateProfile();
        });

        $("#logoutSubmit").on('click', function(){
                hideAll();
                $("nav").hide();
                $("#ui_login").show();
        });

        $("#difficultySubmit").on('click', function(){
                if ($("#difficulty").val() == 'easy') {
                        difficulty = 3;
                } else if ($("#difficulty").val() == 'medium') {
                        difficulty = 2;
                } else if ($("#difficulty").val() == 'hard') {
                        difficulty = 1;
                }
                setupGame();
                startGame();
                hideAll();
                $("#ui_play").show();
                $("nav").show();
        })


        hideAll();
        $("nav").hide();
        $("#ui_login").show();
});

