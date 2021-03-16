var stage=null;
var view = null;
var interval=null;
var credentials={ "username": "", "password":"" };

// function initView(){
//         if (!view){
//                 view = 'login';
//         }
// }

function setupGame(){
	stage=new Stage(document.getElementById('stage'));

	// https://javascript.info/keyboard-events
	document.addEventListener('keydown', moveByKey);
        document.addEventListener('keyup', stopByKey);
        document.getElementById('stage').addEventListener('click', shootByClick)
        document.addEventListener('keydown', pickupAmmoByClick);
        document.getElementById('stage').addEventListener('mousemove', adjustTurret);
}

function startGame(){
	interval=setInterval(function(){ stage.step(); stage.draw(); }, 1);
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
        stage.player.shoot(event.clientX, event.clientY);
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

        	$("#ui_login").hide();
                $("#ui_play").show();
                $("#ui_register").hide();

		setupGame();
                startGame();
                

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
        //console.log("skill: " + values["skill"]);
        // check all fields are non empty
        var error = 0;
        if (values["username"] == "") {
                $("#usernameError").html("Please enter username");
                error = 1;
        } else { 
                $("#usernameError").html("");
        }
        // check if passwords match
        if (values["password"] != values["password2"]) {
                $("#passwordError").html("Passwords do not match");
                error = 1;
        } else if (values["password"] == "" && values["password2"] == "") {
                $("#passwordError").html("Please enter password");
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
        // check uniqueness of username
        // check len of password
        $.ajax({
                method: "POST",
                url: "/api/register",
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

$(function(){
        // Setup all events here and display the appropriate UI
        $("#loginSubmit").on('click',function(){ login(); });
        $("#loginRegister").on('click', function() { 
                $("#ui_login").hide(); 
                $("#ui_register").show();
        });
        $("#registerSubmit").on('click', function(){ register(); })
        $("#registerBack").on('click', function(){
                $("#ui_login").show();
                $("#ui_register").hide();
        })
        $("#playInstructions").on('click', function(){
                $("#ui_play").hide();
                $("#ui_instructions").show();
        })
        $("#instructionsBackToGame").on('click', function() {
                $("#ui_play").show();
                $("#ui_instructions").hide();
        })
        $("#logout").on('click', function() {
                $("#ui_play").hide();
                $("#ui_login").show();
        })
        $("#ui_login").show();
        $("#ui_play").hide();
        $("#ui_register").hide();
        $("#ui_instructions").hide();
});

