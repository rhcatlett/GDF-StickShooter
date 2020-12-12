var sketchProc=function(processingInstance){ with (processingInstance){
size(400, 400); 
frameRate(60);

//------------Constant Declaration---------------------
var GAME_STATE_MENU=0;
var GAME_STATE_OPTIONS=1;
var GAME_STATE_GAMEPLAY=2;
var GAME_STATE_INTRO=3;
var GAME_STATE_VICTORY=4;
var GAME_STATE_DEFEAT=5;

var EASY=0;
var HARD=1;



var KEY_W=87;
var KEY_A=65;
var KEY_S=83;
var KEY_D=68;
var KEY_SPACE=32;


var KEY_LEFT=37;
var KEY_UP=38;
var KEY_RIGHT=39;
var KEY_DOWN=40;
var KEY_SPACE=32;


var CMD_UP=0;
var CMD_LEFT=1; 
var CMD_RIGHT=2;
var CMD_DOWN=3;



//click is a down edge of the mouse getting pressed
//mouse pressed is if the mouse  down
var CMD_CLICK=4;
var CMD_MOUSE_PRESSED=5;


var CMD_BACK_TO_MENU=6;

var MENU_PINK=color(244, 212, 220);
var BACKGROUND_TEXT=color(61, 65, 135);
var PLATFORM_GREY=color(87, 87, 87);
var DOOR_BROWN=color(160,82,45);
var SKY_BLUE=color(91, 206, 250);
var WINDOW_BLUE=color(92, 124, 250);
var GRAVITY=4/60;
//-------------Constant Declaration-------------------

//-----------------Variable Declartion-----------------
var gameState=GAME_STATE_INTRO;
var mainMenuScene;
var optionsMenuScene;
var options={difficulty:EASY};
var gameScene;
var introScene;
var defeatScene;
var victoryScene;
var cmds=[];

//--------------------Variable Declartion-------------




//--------------------Utiliy Functions-------------
//wrapper for the translate fucntion
//to make it work for a vector
var translateVec = function(pos){
    translate(pos.x,pos.y);
};

// is lower<=x<=upper
var between = function(lower,x,upper){
    return (lower<=x&&x<=upper);
    
};

// is a<=x<=b or is b<=x<=a
var symmetricBetween = function(a,x,b){
    return between(a,x,b)||between(b,x,a);
    
};

//updates the command array when a key is pressed or released
var commandUpdate = function(keyCode,enable){
    if(keyCode===KEY_W||keyCode===KEY_UP){
        cmds[CMD_UP]=enable;
    }else if(keyCode===KEY_A||keyCode===KEY_LEFT){
        cmds[CMD_LEFT]=enable;
    }else if(keyCode===KEY_D||keyCode===KEY_RIGHT){
        cmds[CMD_RIGHT]=enable;
    }else if(keyCode===KEY_S||keyCode===KEY_DOWN){
        cmds[CMD_DOWN]=enable;
    }else if(keyCode===KEY_SPACE){
        cmds[CMD_BACK_TO_MENU]=enable;
    }
};


//sets a command to true if the key pressed maps to that command
var keyPressed = function() {
    commandUpdate(keyCode,true);
    
    
};
//sets a command to false if the key released maps to that command
var keyReleased = function() {
    commandUpdate(keyCode,false);
};


//updates the CMD_CLICK variable
var mousePressed = function() {
    cmds[CMD_MOUSE_PRESSED]=true;
    cmds[CMD_CLICK]=true;
    
};
var mouseReleased = function() {
    cmds[CMD_MOUSE_PRESSED]=false;
    
};

//gets the center position of a rectangle
var rectCenter= function(rect){
    var center= rect.dim.get();
    center.div(2);
    center.add(rect.pos);
    return center;
};

//determines if two rectangles with a PVecotr .pos top right corner
//and a pPvector.dim height/width intersect
var rectCollision = function(lhs,rhs){
    
    var x1 =lhs.pos.x<rhs.pos.x+rhs.dim.x;
    var x2 =lhs.pos.x+lhs.dim.x>rhs.pos.x;
    
    var y1 =lhs.pos.y<rhs.pos.y+rhs.dim.y;
    var y2 =lhs.pos.y+lhs.dim.y>rhs.pos.y;
    
    return x1&&x2&&y1&&y2;
    
    
    
};

//used with rectangle on rectangle collision
//pushes the rhs rectangle out of the lhs
//returns if the rhs was push to the top of the lhs
var rectPushOut =function(lhs,rhs){
   // println("begun push");
    var lhsC=rectCenter(lhs);
    var rhsC=rectCenter(rhs);
    //println("got centers");
    var difLine=rhsC.get();
    difLine.sub(lhsC);
    //println("got difline");
    
    var mult =1;
    
    //how tall vs wide the base rectangle is
    var dimRatio=abs(lhs.dim.y/lhs.dim.x);
    //println(dimRatio);
    //println("got a ratio");
    
    //how tall vs wide the collision line is
    var collRatio=abs(difLine.y/difLine.x);
   // println(collRatio);
    //println("got ratios");
    
    //vertical pushout
    if(collRatio>dimRatio){
      //  println("vert pushout");
        //if pushee below pusher, push down
        if(rhsC.y>lhsC.y){
            rhs.pos.y=lhs.pos.y+lhs.dim.y;
            
        //otherwise push up
        }else{
            rhs.pos.y=lhs.pos.y-rhs.dim.y;
            return true;
            
        }
        rhs.vel.y=0;
    //horizontal pushout
    }else{
        
        //if pushee to the right of the pusher, psuh right
        if(rhsC.x>lhsC.x){
            rhs.pos.x=lhs.pos.x+lhs.dim.x;
            
        //otherwise push up
        }else{
            rhs.pos.x=lhs.pos.x-rhs.dim.x;
            
        }
        rhs.vel.x=0;
        
        
    }
    return false;
};

//takes a point with a pvector .pos
//and a rectangle witha pvector pos/dim
//returns wehter the point is in the rectangle
var pointInRect=function(point,rect){
  //  println(rect.pos.x);
  //  println(rect.pos.x+rect.dim.x);
   // println(point.x);
    var xBound=between(rect.pos.x,point.pos.x,rect.pos.x+rect.dim.x);
    var yBound=between(rect.pos.y,point.pos.y,rect.pos.y+rect.dim.y);
 //   println("xb "+xBound);
  //  println("yb "+yBound);
    return xBound&&yBound;
};
//--------------------Utiliy Functions-------------
//--------------------Graphics Functions-------------

//draws a pistol at 0,0
//move with translate 
var pistolGraphic = function(){

    
    line(0,5,0,-5);
    
    line(0,-5,20,-5);
};
//draws a helicopter centered at 0,0
var helicopterGraphic=function(){

    //grey body
    fill(199, 199, 199);
    ellipse(38,15,120,50);
    
    //the landing gear
    rect(38-60-20,15+25+11,120+40,5);
    
    //the blades
    rect(-52,-15,180,1);
    rect(37,-15,10,10);
    
    //connectors to landing gear
    stroke(199, 199, 199);
    line(-28,15+25+13,54,0);
    line(103,15+25+13,54,0);
   
    //cockpit
    noStroke();
    fill(WINDOW_BLUE);
    arc(63,16,50,36,3/2*PI,2*PI);
    
    //body
    fill(0, 255, 0);
    rect(0,0,50,30);

};
//--------------------Graphics Functions-------------







//--------------------Class Declartion--------------
//a randomly moving gun Particle for decor
var GunParticle=function(){
    this.pos= new PVector(random(75,325),random(75,325));
    
    this.vel=new PVector(random(-2,2),random(-2,2));
    
    this.rot=random(0,3*2*PI/60);
    this.heading=new PVector(random(0,1),random(0,1));
    
    this.scale=random(0.8,1.2);
    
    this.gunColor=color(random(0,255),random(0,255),random(0,255));
};
//a decorative floating cloud
var Cloud = function (position){
    
    this.pos=position;
    this.vel=new PVector(random (-0.5,0.5),0);
    
    
 
};

//defines a rectangular stickman character.
// Decision making done by external agents
//but handles physics
var StickCharacter= function(position,platforms, groundLevel,sideBound){
    //the top right of the stick characters rectangle
    this.pos=position;
    
    this.vel= new PVector(0,0);

    //the dimensioning of the stick character's rectangle
    this.dim= new PVector(20,40);
    
    //where the arms attach to the body relative to the base position
    this.hardpoint=new PVector(10,17);
    

    //what should the character aim at
    this.target= new PVector(0,0);
    
    //is the character grounded on the floor
    this.canJump=false;

    this.health=1;


    //not what it should be, but close enough
    //sense it SHOULD be updated before actually 
    //being used. Setting it to this.pos is just
    //in case it isnt set
    this.bulletLaunchPoint= this.pos.get();
    
    //the list of bullets that the character can interact with


    //gotta know this for physics updates.
    this.plats=platforms;
    this.groundLevel=groundLevel;
    this.sideBound=sideBound;

    this.refirePeriod=80;
    this.fireDelay=0;

};

//the agent+character for the player
var PlayerStickCharacter= function(position,platforms, groundLevel,sideBound){
    
    this.maxAirJumps=1;
    this.curAirJumps=1;
    //like height from -5signle jump, but made it 2 half hgeight jumps
    //1.41=sqrt(2)
    this.jumpVelocity=-5/1.41;
    this.character=new StickCharacter(position,platforms, groundLevel,sideBound);
    this.character.health=2;
    if(options.difficulty===HARD){
        this.character.refirePeriod=80;
    }else if (options.difficulty===EASY){
        this.character.refirePeriod=15;
        
    }

};
//the agent+character for the enemy
var EnemyStickCharacter= function(position,platforms, groundLevel,sideBound){
 //   this.jumpVelocity=-5;
  //  this.maxJumpCharge=8;
  //  this.curJumpCharge=0;
    this.character=new StickCharacter(position,platforms, groundLevel,sideBound);
    this.inRange=false;
    if(options.difficulty===HARD){
        this.character.refirePeriod=60;
    }else if (options.difficulty===EASY){
        this.character.refirePeriod=120;
        
    }

};

//a simple linear bullet
var BasicBullet= function(position, velocity){
    this.pos=position;
    this.vel=velocity;
    
};

// a rectangular platform for standing on and jumping
var Platform = function(position, dimensions){
    this.pos=position;
    this.dim=dimensions;
    this.col=PLATFORM_GREY;
    
};

//A Rectnagular Click Based Pushbutton
//position Pvector of upper left corner of rectangle
//dimensions Pvector of width/height
//buttonColor color of back rectangle
//text text to display on button
//textColor color of the text
var MenuButton= function(position,dimensions, buttonColor,text, textColor){
    this.pos=position;
    this.dim=dimensions;
    this.bColor=buttonColor;

    //generate the rollover color
    //make it a maximally saturated version
    //of the base color
    var h = hue(this.bColor);
    var s= 255;
    var b = brightness(this.bColor);
  
    colorMode(HSB);
    this.mouseOverColor=color(h,s,b);
    colorMode(RGB);
  
    this.text=text;
    this.tColor=textColor;
    
    this.clickState=0;
    this.clicked=false;
    
    this.highlighted=false;
    
};


//manages varius menubuttons
//centered at position
var ButtonGroup= function(position){
    this.buttons=[];
    this.buttonDimensions= new PVector(120,50);
    this.pos=position;
    
    
    
};

//a Scene controlling the menu functionality
var MainMenuScene = function(){
    
    
    this.buttons= new ButtonGroup(new PVector(200,200));
    this.buttons.setButtonsFromList(["Play","Options"]);
};
//a Scene controlling the options functionality
var OptionsMenuScene = function(){
    
    
    this.buttons= new ButtonGroup(new PVector(100,200));
    this.buttons.setButtonsFromList(["Hard","Easy", "Main Menu"]);
};


//containter for the levels in the game
//does not do game logic
//the seperation is a bit cludgy, but with an all in one file
//it can be hard to get functions declared in a functioning manner otherwise
var Level = function(groundLevel, sideBound, doorPos, pcPos, platforms,enemyPoses){
    //Y where you can't fall further
    this.groundLevel=groundLevel;
    //How far you can travel from 0 in the X
    this.sideBound=sideBound;

    //rectangle version of the bounds
    var tPos=new PVector(-this.sideBound,-this.groundLevel);
    var tDim=new PVector(2*this.sideBound,2*this.groundLevel);
    this.boundingRect={pos:tPos,dim:tDim};


    this.victoryDoor={pos:doorPos, dim:new PVector(30,50)};

    this.bullets=[];
    this.fireDelay=-1;
    
    this.platforms=platforms;

    this.pc = new PlayerStickCharacter(pcPos,this.platforms,this.groundLevel,this.sideBound,this.bullets);
    this.enemies=[];
    for(var i=0;i<enemyPoses.length;i++){
        var nEnemy=new EnemyStickCharacter(enemyPoses[i],this.platforms, this.groundLevel,this.sideBound);
        this.enemies.push(nEnemy);

    }


    //the customLevelFunction function is used for when I wan to add complex decoration to a level that is not easily fit withing
    //the basic paradigm, like adding text at a position
    this.customLevelFunction= function(){};
    

    this.bullets=[];
};

//creates a medium playform at centered at position x,y
var MediumPlatform=function(x,y){
    return new Platform(new PVector(x-25,y-5),new PVector(50,10));
};

//creates a Blue window platform with corner at x,y
var WindowPlatform=function(x,y){
    var window= new Platform(new PVector(x,y),new PVector(15,45));
    window.col=WINDOW_BLUE;
    return window;
};


//a Scene controlling the game functionality
//also creates the levels
//not very easy to make the levels with
var GameScene = function(){
    this.level=0;
    this.deco=[];
    //create clouds
    for( var i=0;i<3;i++){
        var x=random(20,380);
        var y=100+100*i+random(-20,20);
        var pos=new PVector(x,y);
        this.deco.push(new Cloud(pos ));
    }
    
    
    
    var tutPlatforms=[];

    tutPlatforms.push(new Platform(
        new PVector(-250,300),
        new PVector(200,10)));
    tutPlatforms.push(new Platform(
        new PVector(50,200),
        new PVector(200,10))); 
    tutPlatforms.push(new Platform(
        new PVector(-50,50),
        new PVector(100,10)));
    
    this.tutorialLevel= new Level(400,500,new PVector(-15,0),new PVector(0,200),tutPlatforms,[]);
    this.tutorialLevel.customLevelFunction=function(){
        textSize(12);
        fill(0,0,0);
        textAlign(CENTER, CENTER);
        text("Welcome to the Tutorial. Move mouse to aim. Click to shoot. Space Bar to return to main menu. WASD/Arrow keys to move. Go to the green door to progress to the next level",-75,50,200,400);
    };










    var l1WallWidth=15;
    var firstPlats=[];


    firstPlats.push(MediumPlatform(-150,125));
    firstPlats.push(MediumPlatform(150,200));
    firstPlats.push(MediumPlatform(-150,300));
    firstPlats.push(MediumPlatform(150,400));
    firstPlats.push(MediumPlatform(-150,500));
    firstPlats.push(MediumPlatform(150,600));
    firstPlats.push(MediumPlatform(-150,700));
    firstPlats.push(MediumPlatform(150,800));

    
    
    firstPlats.push(MediumPlatform(  50 ,250));
    firstPlats.push(MediumPlatform(  -50 ,350));
    firstPlats.push(MediumPlatform(  50 ,450));
    firstPlats.push(MediumPlatform(  -50 ,550));
    firstPlats.push(MediumPlatform(  50 ,650));
    firstPlats.push(MediumPlatform(  -50 ,750));





    //top of skyscraper
    firstPlats.push(new Platform(
        new PVector(-75,0),
        new PVector(250,10)));
    
    //sides of skyscraper
    firstPlats.push(new Platform(
        new PVector(175,0),
        new PVector(l1WallWidth,840)));
    
        //sides of skyscraper
    firstPlats.push(new Platform(
        new PVector(-175-l1WallWidth,0),
        new PVector(l1WallWidth,840)));

    //windows
    firstPlats.push(WindowPlatform(-175-l1WallWidth,0));
    firstPlats.push(WindowPlatform(-175-l1WallWidth,200));
    firstPlats.push(WindowPlatform(-175-l1WallWidth,400));
    firstPlats.push(WindowPlatform(-175-l1WallWidth,600));

    firstPlats.push(WindowPlatform(175,100));
    firstPlats.push(WindowPlatform(175,300));
    firstPlats.push(WindowPlatform(175,500));
    firstPlats.push(WindowPlatform(175,700));

    var fEnemies=[];
    //list of positions of enemies
    //fEnemies.push(new PVector(50,800));
    fEnemies.push(new PVector(-150,650));
    fEnemies.push(new PVector(150,350));
    fEnemies.push(new PVector(-150,250));
    fEnemies.push(new PVector(150,750));


    this.firstLevel= new Level(900,500,new PVector(0,-50),new PVector(0,860),firstPlats,fEnemies);    
    this.firstLevel.victoryDoor.dim.x=50;    
    this.firstLevel.victoryDoor.dim.y=30;
    this.firstLevel.customLevelFunction=function(){
        fill(PLATFORM_GREY);
        rect(-175-l1WallWidth,900,350+40,40);
        
        fill(255,255,255);
        rect(-175,0,350,900);
        
        fill(DOOR_BROWN);
        rect(-175,840,-l1WallWidth,60);
        rect(175,840,l1WallWidth,60);

        //helicopter
        pushMatrix();
        translateVec(this.victoryDoor.pos);
        helicopterGraphic();
        popMatrix();

        textSize(12);
        fill(0,0,0);
        textAlign(CENTER, CENTER);
        text("You're trapped! Get to the roof and escape in the helicopter",-120,600,200,400);
 
        
    };

    var secondPlats =[];   
    //door 
    var l2Door=new Platform(
        new PVector(300,320),
        new PVector(10,60));
    l2Door.col=DOOR_BROWN;
    secondPlats.push(l2Door);
    
    //door frame
    secondPlats.push(new Platform(
        new PVector(300,275),
        new PVector(10,45)));


    //main floor
    secondPlats.push(new Platform(
        new PVector(-400,380),
        new PVector(400*2-50,20)));

    //Top floor
    secondPlats.push(new Platform(
        new PVector(-400,260),
        new PVector(400*2-100-50,20)));
    
    //top floor fill in
    secondPlats.push(new Platform(
        new PVector(300,260),
        new PVector(100,20)));

    //rooof
    secondPlats.push(new Platform(
        new PVector(-400,140),
        new PVector(400*2,20)));
    var secondEnemies=[];

    secondEnemies.push(new PVector(250,340));

    secondEnemies.push(new PVector(-150,220));
    secondEnemies.push(new PVector(150,220));

    secondEnemies.push(new PVector(-150,460));
    secondEnemies.push(new PVector(150,460));
    //second level
   // function(groundLevel, sideBound, doorPos, pcPos, platforms,enemyPoses)
    this.secondLevel=  new Level(500,400,new PVector(-300,450),new PVector(-300,340),secondPlats,secondEnemies);
    this.secondLevel.doorOpened=false;
    this.secondLevel.doorID=0;
    this.secondLevel.securityRoom={"pos":new PVector(-400,140), "dim":new PVector(150,120)};
    this.secondLevel.customLevelFunction=function(){
        
        fill(255,255,255);
        rect(-400,140,800,360);
        fill(0,0,255);

        rect(this.securityRoom.pos.x,this.securityRoom.pos.y,
            this.securityRoom.dim.x,this.securityRoom.dim.y);

        if(rectCollision(this.pc.character,this.securityRoom)&&this.doorOpened===false){
            this.doorOpened=true;
            this.platforms.splice(this.doorID,1);

        }
        
        fill(PLATFORM_GREY);
        rect(-400,500,800,40);
        
        textSize(12);
        fill(0,0,0);
        textAlign(CENTER, CENTER);        
        text("Get to the underground valut",-300,100,200,400);
        text("Open the door via the securiy room up top",200,100,100,400);
        
    };



    //levels intentionally out of order
    //realized this.secondLevel worked better as a first level and haven't renamed them yet
    this.levelList=[this.tutorialLevel,this.secondLevel,this.firstLevel];
    
    
    
};


// a scene that does the intro animation
//and then goes to the main menu
var IntroScene= function(){
    this.duration=60*10;
    this.deco=[];
    
    for(var i =0;i<16;i++){
        this.deco.push(new GunParticle());
    }


};
//victory animation scene
var VictoryScene=function(){

};

//failure animation scene
var DefeatScene=function(){

};



//--------------------Class Declartion--------------------------------------------------------------




















//--------------------Class Implementatoin-----------------------------------------------------------

//draws the rectangular platform
Platform.prototype.display = function(){
    pushMatrix();
    translateVec(this.pos);
    noStroke();
    fill(this.col);
    rect(0,0,this.dim.x,this.dim.y);
    popMatrix();

};
//updates platforms, currently jsut calls display
Platform.prototype.update = function(){
    this.display();
};
BasicBullet.prototype.display = function(){
    stroke(0,0,0);
    strokeWeight(4);
    point(this.pos.x,this.pos.y);
    noStroke();
    
};
BasicBullet.prototype.update = function(){
    this.pos.add(this.vel);
    this.display();
    
};

//draw the randomly rotated pistol
GunParticle.prototype.display=function(){
    pushMatrix();
    translateVec(this.pos);
    rotate(this.heading.heading());
    scale(this.scale);
    stroke(this.gunColor);
    pistolGraphic();
    popMatrix();
};

//move the randomly rotating gun
GunParticle.prototype.update= function(){
    this.pos.add(this.vel);
    this.heading.rotate(this.rot);
    this.display();
};

Cloud.prototype.display = function() {
    
    noStroke();
    pushMatrix();
    translateVec(this.pos);
    fill(255,255,255);
    ellipse(0,0,50,50);
    
    ellipse(20,-10,50,50);
    ellipse(40,5,50,50);
    popMatrix();
};
Cloud.prototype.update = function() {

    
    this.pos.add(this.vel);
    
    if(!between(-100,this.pos.x,500)){
        this.pos.y=random(40,360);
        this.vel.x*=-1;
    }
    this.display();
    
};



//determines if the mouse is over the rectangular button
//does not account for curved corners
MenuButton.prototype.isMouseOver= function(){
    var betX= between(this.pos.x,mouseX,this.pos.x+this.dim.x);
    var betY= between(this.pos.y,mouseY,this.pos.y+this.dim.y);
    
    return betX&&betY;

};

//draws a menu button at its current state
MenuButton.prototype.display= function(){
    
    pushMatrix();
    translateVec(this.pos);
    noStroke();
    //rollover colors
    if(this.isMouseOver()===false){
        fill(this.bColor);
    }else{
        fill(this.mouseOverColor);
    }
    rect(0,0,this.dim.x,this.dim.y,10);
    
    if(this.clickState===0){
        fill(this.tColor);
    }else{
        fill(0,0,0);
    }
    
    textSize(20);
    text(this.text,this.dim.x/2,this.dim.y/2);
    
    
    if(this.highlight===true){
        translate(-30,this.dim.y/2);
        stroke(0,0,0);
        strokeWeight(1);
        pistolGraphic();
        
        
    }
    
    noStroke();
    popMatrix();

};

//Updates the buttons click status
MenuButton.prototype.update= function(){
    

    
    var rollover=this.isMouseOver();
    if(this.clickState===0){
        //if we are over the button and press down
        //advance to next state
        if(rollover && cmds[CMD_CLICK]){
            this.clickState=1;
        }
        
    }else if (this.clickState===1){
        //if mouse released over button
        //button has been clicked
        if(!cmds[CMD_MOUSE_PRESSED]&&rollover){
            
            this.clickState=2;
            this.clicked=true;
            
        //if we are not over the button
        //stop trying to click
        }else if(!rollover){
            this.clickState=0;
             
        }
        
    }else{
        this.clickState=0;
        this.clicked=false;
    
    }
    
   this.display();
};

//draws the button group    
ButtonGroup.prototype.display= function(){

    
    for(var i=0;i<this.buttons.length;i++){
        this.buttons[i].display();
    }
};
//Updates the and draws all buttons in the button group
ButtonGroup.prototype.update= function(){
    

        for(var i=0;i<this.buttons.length;i++){
           this.buttons[i].update();
        }
        
        
    
};


//is the ith member of the buttongroup clicked
ButtonGroup.prototype.buttonClicked= function(i){
    return this.buttons[i].clicked;

};

//highlight the ith member of the buttongroup 
ButtonGroup.prototype.highlightButton= function(i, highlight){
     this.buttons[i].highlight=highlight;

};


//adds a button with default dimensions and color
//centered at X,Y with some text
ButtonGroup.prototype.addButton=function(x,y,text){
    //convert the centered X,Y to the corner of the
    //rectangle  123, 214, 247   91, 206, 250
    
    //217, 178, 194
    var nPos= new PVector(
        x-this.buttonDimensions.x/2,
        y-this.buttonDimensions.y/2
        );
    
    var nButton= new MenuButton(
        nPos,
        this.buttonDimensions,
        color(123, 214, 247),
        text,
        color(242, 242, 242)
        );
        
        this.buttons.push(nButton);
        

};

//deletes all already existing buttons
//and then creates a line of buttons centered 
//on the top left of the screan using addButton
//with text from the array of strings textList
ButtonGroup.prototype.setButtonsFromList=function(textList){
    this.buttons=[];
    var yOffset=this.buttonDimensions.y*1.7;
    var yPos=this.pos.y-(textList.length-1)*yOffset/2;
    for(var i =0;i<textList.length;i++){
        this.addButton(this.pos.x,yPos,textList[i]);
        yPos+=yOffset;
    }

};


//updates the main menu and returns the next GameState
MainMenuScene.prototype.update= function(){
    
    background(MENU_PINK);
    this.buttons.update();
   
    if(this.buttons.buttonClicked(0)){
        gameScene= new GameScene();
        return GAME_STATE_GAMEPLAY;
    }else if(this.buttons.buttonClicked(1)){
        return GAME_STATE_OPTIONS;
    }
    return GAME_STATE_MENU;

};

//updates the options menu and returns the next GameState
OptionsMenuScene.prototype.update= function(){
    
    background(MENU_PINK);
    this.buttons.update();
    
    //select difficulty options
    if(this.buttons.buttonClicked(0)){
        options.difficulty=HARD;
    }else if(this.buttons.buttonClicked(1)){
        options.difficulty=EASY;
    }
    
    //highlight difficulty option
    if(options.difficulty===HARD){
        this.buttons.highlightButton(0,true);
        this.buttons.highlightButton(1,false);
    }else if(options.difficulty===EASY){
        this.buttons.highlightButton(0,false);
        this.buttons.highlightButton(1,true);
    }
    
    textAlign(LEFT, TOP);
    textSize(15);
    fill(BACKGROUND_TEXT);
    text("Welcome to Stick Shooter. Move the mouse to aim. Click to shoot. Hit spacebar to give up and return to the main menu. Have fun.\n\nThis is the options screen where you can select the difficulty. The current difficulty is highlighted. Currently Difficulty changes the firerate",180,70,220,400);
    textAlign(CENTER, CENTER);
    
    
    
    //state transitions
    if(this.buttons.buttonClicked(2)){
        return GAME_STATE_MENU;
    }
    return GAME_STATE_OPTIONS;

};




//draw a generic stickman holding a pistol
StickCharacter.prototype.display= function(){
    pushMatrix();
    translateVec(this.pos);
  
  /*  noFill();
    stroke(0,0,0);
    strokeWeight(1);
    rect(0,0,this.dim.x,this.dim.y);
*/
    //body
    fill(255, 255, 255);
    stroke(0,0,0);
    strokeWeight(1);
    line(10,10,10,25);
    
    //head
    ellipse(10,6,12,12);

    //eyes
    point(8,4);
    point(12,4);

    //smile
    if(this.health>1){
        arc(10,6,7,4,0,PI);
    }else{

        arc(10,8,7,4,PI,2*PI);

    }
    
    //legs
    line(10,25,5,40);
    line(10,25,15,40);
    
    //arm
    //we want the arm to be pointing at the mouse cursor
    translateVec(this.hardpoint);
    var absHardpoint=this.pos.get();
    absHardpoint.add(this.hardpoint);
    

   
    
    //rebase the absolute MouseX Targettting to the relative
    // translated positions
    this.target.sub(absHardpoint);
    this.target.normalize();
    this.target.mult(18);
    
    //where the bulletes are launched from
    this.bulletLaunchPoint=this.target.get();
    this.bulletLaunchPoint.add(absHardpoint);
    

    line(0,0,this.target.x,this.target.y);
    
    //draw the gun
    translateVec(this.target);
    var gunAngle=this.target.heading();
    rotate(gunAngle);
    if(!between(-PI/2,gunAngle,PI/2)){
        scale(1,-1);
    }
    pistolGraphic();
    
    popMatrix();

};

//PC movement  update, also displays
StickCharacter.prototype.update= function(){

    this.fireDelay++;
    if(this.canJump===false){
        this.vel.y+=GRAVITY;

    }
    
   
    this.pos.add(this.vel);
    
    //calculate if the stickman is standing on something and can
    //therefore jump next time
    this.canJump=false;
    for(var i=0;i<this.plats.length;i++){
        if(rectCollision(this,this.plats[i])){
            //println("sSDAFASDFASDFasdfasd");
            var pushedTop=rectPushOut(this.plats[i],this);                      
            this.canJump=this.canJump||pushedTop;
        }
    }
    
    if(this.pos.y>=this.groundLevel-this.dim.y){
        this.pos.y=this.groundLevel-this.dim.y;
        this.canJump=true;
    }
    this.pos.x=min(this.pos.x,this.sideBound-this.dim.x);
    this.pos.x=max(this.pos.x,-this.sideBound);
    this.display();
};
//time wise, cna the character fire again
//and is the character in range of the target
StickCharacter.prototype.canFire=function(){
    return this.fireDelay>this.refirePeriod;
};
//launches a bullet at the characters current target and updates the delay
//returns the bullet object so it can be added to the levels bullet list
StickCharacter.prototype.generateBullet=function(){
    this.fireDelay=0;
    var blltVel=this.target.get();
  //  println("pre targ get");
    blltVel.normalize();
    blltVel.mult(9);
    
   // println("pre pos get");
    var blltPos=this.bulletLaunchPoint.get();
    
   // println("pre bullet make");
    var nBullet= new BasicBullet(blltPos,blltVel);
   // println("pre Push");
  //  println(this.bullets);
    //this.bullets.push(nBullet);
    return nBullet;
   // println(this.bullets);
};
PlayerStickCharacter.prototype.canFire=function(){
    return cmds[CMD_CLICK] && this.character.canFire();

};
//wrapper for the stick character generate bullet function
//launches a bullet at the characters current target and updates the delay
//returns the bullet object so it can be added to the levels bullet list
//otherwise the play class has to be able to modify the level bueelt ilsit which is hard
PlayerStickCharacter.prototype.generateBullet=function(){
    return this.character.generateBullet();
};

//Player character agent, does the decision making for the 
//player character
//takes the target in pixels as an input
PlayerStickCharacter.prototype.update= function(nTarget){

    
    this.character.target=nTarget;
    if(this.character.canJump===true){
       
        this.curAirJumps=this.maxAirJumps;
        
    }

    if(cmds[CMD_UP]){
        if(this.character.canJump===true){
            this.character.vel.y=this.jumpVelocity;
            cmds[CMD_UP]=false;
        }else if(this.curAirJumps>0){
            this.character.vel.y=this.jumpVelocity;
            this.curAirJumps--;
            cmds[CMD_UP]=false;
    
        }


    }    

        
        
    

    this.character.vel.x=0;
    if(cmds[CMD_LEFT]){
        this.character.vel.x+=-3;   
    }
    if(cmds[CMD_RIGHT]){
        this.character.vel.x+=3;   
    }


    this.character.update();


 
};

//time wise, cna the character fire again
//and is the character in range of the target
//in range is updated in this.update()
EnemyStickCharacter.prototype.canFire=function(){
   return this.character.canFire()&&this.inRange;

};

//wrapper for the stick character generate bullet function
//launches a bullet at the characters current target and updates the delay
//returns the bullet object so it can be added to the levels bullet list
//otherwise the play class has to be able to modify the level bueelt ilsit which is hard
EnemyStickCharacter.prototype.generateBullet=function(){
    return this.character.generateBullet();
};

//Enemy character agent, does the decision making for the 
//Enemy characters
EnemyStickCharacter.prototype.update= function(nTarget){

    
   
    
    
    

    this.character.vel.x=0;
    // move the enemy towards the player if theyre roughly on screen
    //only fire if the target is in range
    //also only aim if the target will be shot at
    var center=this.character.pos.get();
    center.add(this.character.hardpoint)
    var dist=center.dist(nTarget);
    if(dist<190){
        this.inRange=true;
        this.character.target=nTarget;
        if(this.character.pos.x-50>nTarget.x){
            this.character.vel.x=-1;

        } else if(this.character.pos.x+50<nTarget.x){
            this.character.vel.x=1;

            
        }
    }else{
        
        this.inRange=false;
        this.character.fireDelay=0;
        center.x+=10;
        this.character.target=center;
        
    }

    this.character.update();


 
};

//where should the camera be centered
Level.prototype.getCamOffset=function(){
    var camOffset=new PVector(200,200);
    camOffset.sub(this.pc.character.pos);
        
    //when near the edges of the map, uncenter the camera
    camOffset.y=max(camOffset.y,-this.groundLevel-40+400);  
    camOffset.x=max(camOffset.x,-this.sideBound-20+400);
    camOffset.x=min(camOffset.x,this.sideBound+40);

    return camOffset;

};

//updates and draws the game background that does move
//in relation to the player camera
Level.prototype.drawDynamicBackground=function(camOffset){
    
    //draw the road grey main body
    fill(PLATFORM_GREY);
    rect(-this.sideBound-40,this.groundLevel-20,2*(this.sideBound+40),80);
    fill(255,255,255);
    
    
    //draw the roads white sidelines
    //used to determine where to start drawing street strips
    var leftSide=-camOffset.x-200;
    //divide by 64
    leftSide=leftSide>>7;
    //move over one step
    leftSide-=1;
    //return to pixels
    leftSide=leftSide<<7;
    
    var rightSide=-camOffset.x+400;
    //divide by 64
    rightSide=rightSide>>7;
    //move over one step
    rightSide+=1;
    //return to pixels
    rightSide=rightSide<<7;
        
    for(var x=leftSide;x<rightSide;x+=128){
        rect(x,this.groundLevel,64,10);
        
    }
    
    
    //draw the boundaries for the X 
    fill(PLATFORM_GREY);
    rect(-this.sideBound-40,-1024,40,2048);
    rect(this.sideBound,-1024,40,2048);
    

};

//handles bullet physics and collisions
Level.prototype.updateBullets= function(){
    for(var i=0;i<this.bullets.length;){
        var bllt=this.bullets[i];
        bllt.update();
        
        //deelete bullets that fly out too far
        if(!pointInRect(bllt,this.boundingRect)){
            this.bullets.splice(i,1);
            continue;
            
            
        }
        
        //delete bullets that hnit platforms
        for(var j =0;j<this.platforms.length;j++){
            if(pointInRect(bllt,this.platforms[j])){
                this.bullets.splice(i,1);
                break;
            
            
            }
            
        }//loop over platformes


        if(pointInRect(bllt,this.pc.character)){
            this.bullets.splice(i,1);
            this.pc.character.health--;
            continue;
            
            
        }

        var deleted= false;
        //collision with enemies, should be last to run because 
        //of the break and nested loops
        for(var j =0;j<this.enemies.length;){
            if(pointInRect(bllt,this.enemies[j].character)){
                this.bullets.splice(i,1);
                this.enemies.splice(j,1);
                deleted=true;
                break;
                
                
            }else{
                j++;
            }
        }

        //loop manually if the bullet aint deleted
        if(deleted===false){
            i++;
        }



    }//loop over bullets
    
    
};

//does the pc aiming and physics and bullet creation
//d0es not do bullet collision, but does not do bullet collision
Level.prototype.updatePC = function(camOffset){
    var nTarget= new PVector(mouseX,mouseY);
    nTarget.sub(camOffset);
    this.pc.update(nTarget);
    
  //  gotta manually add the bullet to the bullet list because its hard
  //to add it from other classes
    if(this.pc.canFire()){
        this.bullets.push(this.pc.generateBullet());
    }


};
//updates the enemy aiming and phsyics and bullet creation
//d0es not do bullet collision
Level.prototype.updateEnemies = function(){
    var targ=this.pc.character.pos.get();
    targ.add(this.pc.character.hardpoint);
    for(var i=0;i<this.enemies.length;i++){
        var enemy=this.enemies[i];
        enemy.update(targ.get());

        if(enemy.canFire()){
            this.bullets.push(enemy.generateBullet());
        }

    }


};

//does all the level gameplay functions
//returns -1 for failing the level
//0 for continuing it
//1 for victory
Level.prototype.update=function(){
    var camOffset=this.getCamOffset();
    translateVec(camOffset);
   // println("Drawdynamics");
    this.drawDynamicBackground(camOffset,this);
    
    this.customLevelFunction();
    pushMatrix();
    // println(this.victoryDoor.pos);
    translateVec(this.victoryDoor.pos);
    fill(0, 255, 0);
    rect(0,0,this.victoryDoor.dim.x,this.victoryDoor.dim.y);
    popMatrix();

    this.updatePC(camOffset);
    this.updateEnemies();
    this.updateBullets();
    if(this.pc.character.health<=0){
        return -1;
    }
    
    for(var i=0;i<this.platforms.length;i++){
        this.platforms[i].update();
    }
        
        
    if(rectCollision(this.pc.character,this.victoryDoor)){
        return 1;
    }
    
    return 0;

};

//updates and draws the game background that does not move in
//relation to the player camera
GameScene.prototype.drawStaticBackground=function(){
    background(SKY_BLUE);
    noStroke();
    fill(255, 255, 0);
    ellipse(75,75,100,100);
    for(var i=0;i<this.deco.length;i++){
        this.deco[i].update();
    }
    

    
    
    fill(0,0,0);
    rect(0,450,400,20);
    
};







GameScene.prototype.update= function(){ 
    pushMatrix();
    
    this.drawStaticBackground();
  
    
    if(this.level<0||this.level>=this.levelList.length){
        textSize(12);
        fill(0,0,0);
        textAlign(CENTER, CENTER);
        text("Level Under construction, return to main menu ",50,50,300,400);
        
    }else{
           //println("Start run");
            var result=this.levelList[this.level].update();
            
            if(result===-1){
                return GAME_STATE_DEFEAT;
            }else if(result===1){
                if(this.level+1>=this.levelList.length){
                    return GAME_STATE_VICTORY;
                }else{
                    this.level++;
                }
                
            }//next level handling
           //println("end Run");
    }
    popMatrix();

    if(cmds[CMD_BACK_TO_MENU]){
        return GAME_STATE_MENU;
    }
    return GAME_STATE_GAMEPLAY;

};


IntroScene.prototype.update= function(){
    background(MENU_PINK);
    
    
    for(var i =0; i<this.deco.length;i++){
        this.deco[i].update();
    }
    
    
    
    textAlign(LEFT, TOP);
    textSize(15);
    fill(BACKGROUND_TEXT);
    var tLeft= round((this.duration-frameCount)/60);
    text("Welcome to Stick Shooter. This project was made by Richard Catlett alone. Click to start or wait "+tLeft+" seconds",75,75,250,400);
    textAlign(CENTER, CENTER);
    
    
    
    
    if(frameCount>this.duration||cmds[CMD_MOUSE_PRESSED]){
        return GAME_STATE_MENU;
    }
    return GAME_STATE_INTRO;
};

VictoryScene.prototype.update=function(){
    background(MENU_PINK);
    fill(0,0,0);
    text("You won! Press space to return to menu",200,200);
    if(cmds[CMD_BACK_TO_MENU]){
        return GAME_STATE_MENU;
    }

    return GAME_STATE_VICTORY;
};

DefeatScene.prototype.update=function(){
    background(MENU_PINK);
    fill(0,0,0);
    text("You failed! Press space to return to menu",200,200);
    if(cmds[CMD_BACK_TO_MENU]){
        return GAME_STATE_MENU;
    }
    return GAME_STATE_DEFEAT;
};

//--------------------Class Implementatoin-------------

//--------------------Initilization-------------
angleMode = "radians";
ellipseMode(CENTER);
imageMode(CENTER);
textAlign(CENTER, CENTER);
noStroke();


mainMenuScene= new MainMenuScene();
optionsMenuScene= new OptionsMenuScene();
gameScene= new GameScene();
introScene= new IntroScene();
victoryScene=new VictoryScene();
defeatScene=new DefeatScene();

//--------------------Initilization-------------



draw = function() {
    var scene;

    if(gameState===GAME_STATE_MENU){
        scene=mainMenuScene;
    }else if(gameState===GAME_STATE_OPTIONS){
        scene=optionsMenuScene;
    }else if(gameState===GAME_STATE_GAMEPLAY){
        scene=gameScene;
    }else if(gameState===GAME_STATE_INTRO){
        scene=introScene;
    }else if(gameState===GAME_STATE_VICTORY){
        scene=victoryScene;
    }else if(gameState===GAME_STATE_DEFEAT){
        scene=defeatScene;
    }else{
        gameState=GAME_STATE_INTRO;
        scene=introScene;
    }
    gameState=scene.update();
    cmds[CMD_CLICK]=false;
};
}};