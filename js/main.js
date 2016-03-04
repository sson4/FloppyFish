
var game = new Phaser.Game(320, 480, Phaser.AUTO, 'game_div'); 


var score = -1;


var fish;
var frypan;
var gasp;
var choiceLabel;
var pause_label;
var trueScore = 1;


var load_state = {  
   
    preload: function() { 
        
        game.stage.backgroundColor = '#71c5cf';
        game.load.image('fish', 'assets/fish.png');
        game.load.image('frypan', 'assets/frypan.png');  
        game.load.image('gasp', 'assets/gasp.png');
    },
    
    create: function() {
        this.game.state.start('play');
    }
};

var play_state = {
    
    create: function() {
       
        fish = game.add.sprite(60, 250, 'fish');
        fish.scale.setTo(0.7, 0.7);
        gasp = game.add.sprite(-100, -100, 'gasp');
    
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.enable(fish, Phaser.Physics.ARCADE);
        fish.body.gravity.set(0, 550);
        fish.anchor.setTo(0.5, 0.5);
        
        score = 0;
        
        game.input.onDown.add(this.jump, this);
        
        this.frypans = game.add.group();
        this.frypans.createMultiple(10, 'frypan');
        
        this.timer = this.game.time.events.loop(1700, this.add_row_of_frypans, this);
        
        var style = { font: "30px Arial", fill: "#ffffff" };

        this.label_score = this.game.add.text(20, 20, "0", style);
        
        pause_label = game.add.text(220, 20, 'Pause', { font: '24px Arial', fill: '#fff' });
        pause_label.inputEnabled = true;
        pause_label.events.onInputUp.add(function () {
           
            if (game.paused === false) {
                game.paused = true;
                pause_label.text = "Resume";
            }
        });
        game.input.onDown.add(this.unpause, self);
         
    },

    update: function() {
        
        if (fish.inWorld === false) {
            this.restart_game(); 
        }
        if (fish.angle < 20) {
            fish.angle += 0.5;
        }
        if (fish.alive === true) {
        this.game.physics.arcade.collide(fish, this.frypans, this.hit_frypan, null, this);
        }
        if (this.checkOverlap(fish, gasp)) {
            if (trueScore === 1) {
            this.addScore();
            }
        }
        
        if (fish.x < 60) {
            fish.x = 60;
        }
    },
    
    unpause: function() {
      
        if (game.paused === false) {
            return;
        }
      
        game.paused = false;
        pause_label.text = "Pause";
    },
  
    jump: function() {
        
        if (fish.alive === false) {
            return; 
        }
        if (game.paused === true || Phaser.Rectangle.containsPoint(pause_label.getBounds(), game.input.activePointer.position)) {
            return;
        }

        fish.body.velocity.setTo(0, -320);
     
        this.game.add.tween(fish).to({angle: -20}, 250).start();
      
    },

    hit_frypan: function() {
        if (fish.alive === false) {
            return;
        }
        frypan.body.moves = false;
        gasp.body.moves = false;
        fish.alive = false;
        this.game.time.events.remove(this.timer);
        this.frypans.forEachAlive(function(p){
            p.body.velocity.x = 0;
            p.body.velocity.y = 0;
        }, this);
    },
    
    restart_game: function() {
        this.game.time.events.remove(this.timer);
        this.game.state.start('play');
    },
    
    add_row_of_frypans: function() {
        var hole = Math.floor(Math.random()*5)+1;
        for (var i = 0; i < 8; i++) {
            if (i != hole && i != hole +1) {
                this.add_one_frypan(320, i*60+5);   
            }
            }
        for (var t = 0; t < 1; t++) {
            this.addTransparent(320, hole * 60 + 30);
        }
       
        
    },
   
    add_one_frypan: function(x, y) {
           
            frypan = this.frypans.getFirstDead();
            frypan.reset(x, y);
        
            game.physics.enable(frypan, Phaser.Physics.ARCADE);
            frypan.scale.setTo(0.8, 0.8);
            frypan.body.velocity.setTo(-220, 0);
            frypan.body.bounce.set(0);
            frypan.checkWorldBounds = true;
            frypan.outOfBoundsKill = true;
            trueScore = 1;
    },
    addTransparent: function(x, y) {
        gasp = game.add.sprite(x, y, 'gasp');
        gasp.alpha = 0;
        gasp.scale.setTo(0.8, 0.8);
        game.physics.enable(gasp, Phaser.Physics.ARCADE);
        gasp.body.velocity.setTo(-220, 0);
        gasp.enableBody = false;
        gasp.checkWorldBounds = true;
        gasp.outOfBoundsKill = true;
    },
    addScore: function() {
        gasp.destroy();
        score = score + 1; 
        this.label_score.text = score;
        trueScore = 0;
    },
    checkOverlap: function(spriteA, spriteB) {
    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();

    return Phaser.Rectangle.intersects(boundsA, boundsB);
    }
};

game.state.add('load', load_state);

game.state.add('play', play_state);  

game.state.start('load');
