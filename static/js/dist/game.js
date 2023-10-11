class AcGameMenu {
    constructor(root){
        this.root = root;
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="ac-game-menu-field">
        <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">
        单人模式
        </div>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
        多人模式
        </div>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-setting">
        退出登录
        </div>
        <div class="ac-game-menu-field-item ac-game-menu-bgm">
        背景音乐:关
        </div>
    </div>
</div>
`)
        this.$menu.hide();
        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi-mode');
        this.$setting = this.$menu.find('.ac-game-menu-field-item-setting');
        this.$bgm = this.$menu.find('.ac-game-menu-bgm');
        this.has_bgm = false;
        this.start();
        
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function(){
            if (outer.has_bgm){
                outer.bgm.pause();
                outer.bgm.currentTime = 0; // 将播放位置重置为起始位置
                outer.bgm.src = ""; // 关闭音频
            }
            outer.hide();
            outer.root.playground.show("single mode");
        });
        this.$multi_mode.click(function(){
            if (outer.has_bgm){
                outer.bgm.pause();
                outer.bgm.currentTime = 0; // 将播放位置重置为起始位置
                outer.bgm.src= ""; // 关闭音频
            }
            outer.hide();
            outer.root.playground.show("multi mode");
        });
        this.$setting.click(function(){
            if (outer.has_bgm){
                outer.bgm.pause();
                outer.currentTime = 0; // 将播放位置重置为起始位置
                outer.src = ""; // 关闭音频
            }
            outer.root.settings.logout_on_remote();
        });
        this.$bgm.click(function(){
            if (!outer.has_bgm){
                outer.bgm = new Audio('/static/sounds/menu/bgm_menu.mp3');
                outer.bgm.volume = 0.5;
                outer.bgm.play();
                outer.$bgm.text('背景音乐:开');
                outer.has_bgm = true;
                return false;
            }
            if (outer.has_bgm){
                outer.bgm.pause();
                outer.currentTime = 0;
                outer.src = "";
                outer.$bgm.text('背景音乐:关');
                outer.has_bgm = false;
                return false;
            }
        })
    }

    show() {
        this.$menu.show();
    }

    hide() {
        this.$menu.hide();
    }

}
let AC_GAME_OBJECT = [];
class AcGameObject {
    constructor() {
        AC_GAME_OBJECT.push(this);
        this.has_called_start = false;
        this.timedelta = 0;
        this.uuid = this.create_uuid();
    }
    create_uuid(){
        let res = "";
        for (let i = 0; i < 8; i ++ ){
            let x = parseInt(Math.floor(Math.random() * 10));
            res += x;
        }
        return res;
    }
    start(){ //第一帧执行一次
    }
    update(){  //每帧执行一次
    }
    on_destroy() {  // 删除前执行
    }
    destroy(){
        this.on_destroy();
        for (let i = 0; i < AC_GAME_OBJECT.length; i ++ ) {
            if (AC_GAME_OBJECT[i] === this){
                AC_GAME_OBJECT.splice(i, 1);
                break;
            }
        }
    }
}


let last_timestamp;
let AC_GAME_ANIMATION = function(timestamp) {
    
    for (let i = 0; i < AC_GAME_OBJECT.length; i ++ ){
        let obj = AC_GAME_OBJECT[i];
        if (!obj.has_called_start){
            obj.start();
            obj.has_called_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;
    requestAnimationFrame(AC_GAME_ANIMATION);
}

requestAnimationFrame(AC_GAME_ANIMATION);
class ChatField {
    constructor(playground){
        this.playground = playground;
        this.$history = $(`<div class="ac-game-chat-field-history">历史记录</div>`);
        this.$input = $(`<input type="text" class="ac-game-chat-field-input">`);

        this.$history.hide();
        this.$input.hide();
        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);

        this.func_id = null;

        this.start();
    }

    start(){
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$input.keydown(function(e){
            if (e.which === 27){
                outer.hide_input();
                return false;
            } else if (e.which === 13){
                let username = outer.playground.root.settings.username;
                let text = outer.$input.val();
                if (text){
                    outer.$input.val("");
                    outer.add_message(username, text);
                }
                outer.playground.mps.send_chat(outer.playground.root.settings.username, text);
                return false;
            }
        });
    }

    render_message(message) {
        return $(`<div>${message}</div>`);
    }

    add_message(username, text){
        let message = `[${username}]${text}`;
        this.$history.append(this.render_message(message));
        this.$history.scrollTop(this.$history[0].scrollHeight);
        this.show_history();
    }
    show_history(){
        let outer = this;
        this.$history.fadeIn();

        if (this.func_id) clearTimeout(this.func_id);

        this.func_id = setTimeout(function() {
            outer.$history.fadeOut();
        }, 3000);
    }

    show_input(){
        this.show_history();
        this.$input.show();
        this.$input.focus();
    }
    hide_input(){
        this.$input.hide();
        this.playground.game_map.$canvas.focus();
    }
}
class GameMap extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas tabindex=0></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start(){
        this.$canvas.focus();
    }
    resize(){
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
    update(){
        this.render();
    }
    render() {
        this.ctx.fillStyle = "rgba(0,0,0,0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width,this.ctx.canvas.height);

    }
}
class NoticeBoard extends AcGameObject {
    constructor(playground){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.text = "已准备： 0人";
        this.cdtext = "技能冷却";
        this.start();
        this.gameover = false;
    }

    start(){
    }
    write(text){
        this.text = text;
    }
    update(){
        this.render();


        if (this.playground.player_count <= 1 && this.playground.state === "fighting"){
            this.render_gameover();
            if (!this.gameover){
                var audio = new Audio('/static/sounds/gameover.wav');
                audio.play();
                setTimeout(function(){
                    location.reload();
                }, 3000);
                this.gameover = true;
            }
        }


    }
    render(){
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.playground.width/2, 50);
        this.ctx.fillText(this.cdtext, this.playground.width/10 * 7.5, this.playground.height / 10 * 9);
    }
    render_gameover(){
        this.ctx.font = "50px serif";
        this.ctx.fillText("游戏结束，2S后退出", this.ctx.canvas.width/2, this.ctx.canvas.height/2);
    }
}
class Particle extends AcGameObject {
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.friction = 0.85;
        this.eps = 0.01;
        this.move_length = move_length;
        this.alpha = 0.9;
    }
    start(){
    }
    update(){
        if (this.alpha < this.eps || this.move_length < this.eps || this.speed < this.eps) {
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;
        this.render();
    }
    render(){
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.color = getColorRGBA(this.color, this.alpha);
        this.alpha -= Math.random() * 0.02;
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, fireball_speed, character, username, photo){
        super();
        this.x = x;
        this.y = y;
        this.vx = 1;
        this.vy = 1;
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.friction = 0.7;
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.origin_radius = radius;
        this.radius = radius;
        this.color = color;
        this.origin_speed = speed;
        this.speed = speed;
        this.fireball_speed = fireball_speed;
        this.fireballs = [];
        //this.arrow;
        this.character = character;
        this.eps = 0.01;
        this.move_length = 0;
        this.stamp_time = 0;
        this.cur_skill = [false, false]; //0是fireball, 1是flash
        this.username = username;
        this.photo = photo;


        this.keys = [];




        if (this.character != "bot") {
            this.img = new Image();
            this.img.src = this.photo;
        }
        if (this.character === "me") {
            this.fireball_cdscale = 3;
            this.fireball_coldtime = 3; //秒
            this.fireball_img = new Image();
            this.fireball_img.src = "https://img-qn.51miz.com/2017/06/21/14/2017062114434615_P836724_82a909a8O.jpg";

            this.flash_coldtime = 10;
            this.flash_img = new Image();
            this.flash_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";

            this.arrow_coldtime = 3;
            this.arrow_cdscale = 3;
            this.arrow_img = new Image();
            this.arrow_img.src = "https://s3.bmp.ovh/imgs/2023/10/11/f3440f0d11537123.png";
            this.E_is_down = false;

        }
    }
    start(){
        this.playground.player_count ++ ;
        this.playground.notice_board.write("你躲哪去了？目前已准备： " + this.playground.player_count + "人");

        if (this.playground.player_count >= 2) {
            this.playground.state = "fighting";
            this.playground.notice_board.write("您已到达战场，加油特种兵");
        }
        if (this.character === "me") {
            this.add_listening_events();
        } else if (this.character === "bot") {
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random();
            this.move_to(tx, ty);
        }
    }
    add_listening_events(){
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function(){
            return false;
        });
        this.playground.$playground.on("contextmenu", function(){
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function(e) {

            

            if (outer.playground.state !== "fighting") {
                return true;
            }
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3) {
                let tx = (e.clientX - rect.left) / outer.playground.scale, ty = (e.clientY - rect.top) / outer.playground.scale;
                if (outer.keys.length === 0){
                    outer.keys.push({
                        'key': 3,
                        'tx': (e.clientX - rect.left) / outer.playground.scale,
                        'ty': (e.clientY - rect.top) / outer.playground.scale
                    });
                } else {
                    let key = outer.keys.pop();
                    if (key['key'] === 3){
                        outer.keys.push({
                            'key': 3,
                            'tx': (e.clientX - rect.left) / outer.playground.scale,
                            'ty': (e.clientY - rect.top) / outer.playground.scale
                        });
                    }
                }
                outer.move_to((e.clientX - rect.left) / outer.playground.scale, (e.clientY - rect.top) / outer.playground.scale);
                if (outer.playground.mode === "multi mode"){
                    outer.playground.mps.send_move_to(tx, ty);
                }
                /*if (outer.cur_skill === "fireball") {
                    if (outer.fireball_coldtime > outer.eps){
                        return false;
                    }
                    let fireball = outer.shoot_fireball(tx, ty);
                    if (outer.playground.mode === "multi mode"){
                        outer.playground.mps.send_shoot_fireball(tx, ty, fireball.uuid);
                    }
                    outer.cur_skill = null;

                }*/
            } /*else if (e.which === 1) {
                let tx = (e.clientX - rect.left) / outer.playground.scale, ty = (e.clientY - rect.top) / outer.playground.scale;
                if (outer.cur_skill === "fireball") {
                    if (outer.fireball_coldtime > outer.eps){
                        return false;
                    }
                    let fireball = outer.shoot_fireball(tx, ty);
                    if (outer.playground.mode === "multi mode"){
                        outer.playground.mps.send_shoot_fireball(tx, ty, fireball.uuid);
                    }
                    outer.cur_skill = null;
                } else if (outer.cur_skill === "flash"){
                    if (outer.flash_coldtime > outer.eps) {
                        return false;
                    }
                    outer.flash(tx, ty);
                    if (outer.playground.mode === "multi mode"){
                        outer.playground.mps.send_flash(tx, ty);
                    }
                }
            }*/
        });

        this.playground.game_map.$canvas.keydown(function(e) {

            if (e.which === 13){
                if (outer.playground.mode === "multi mode"){
                    outer.playground.chat_field.show_input();
                    return false;
                } 
            } else if (e.which === 27){
                if (outer.playground.mode === "multi mode"){
                    outer.playground.chat_field.hide_input();
                }
            }

            if (outer.playground.state !== "fighting"){
                return true;
            }
            if (e.which === 81){
                if (outer.fireball_coldtime > outer.eps){
                    return true;
                }

                let fireball = outer.shoot_fireball(outer.mouse_x, outer.mouse_y);
                if (outer.playground.mode === "multi mode"){
                    outer.playground.mps.send_shoot_fireball(outer.mouse_x, outer.mouse_y, fireball.uuid);
                }

                /*if (outer.keys.length > 0){
                    let key = outer.keys.pop();
                    if (key['key'] === 3){
                        let fireball = outer.shoot_fireball(key['tx'], key['ty']);
                        if (outer.playground.mode === "multi mode"){
                            outer.playground.mps.send_shoot_fireball(key['tx'], key['ty'], fireball.uuid);
                        }
                        outer.cur_skill[0] = false;
                    }
                }*/

                return false;
            } else if (e.which === 70){
                if (outer.flash_coldtime > outer.eps){
                    return true;
                }
                outer.flash(outer.mouse_x, outer.mouse_y);
                if (outer.playground.mode === "multi mode"){
                    outer.playground.mps.send_flash(outer.mouse_x, outer.mouse_y);
                }
                /*if (outer.keys.length > 0){
                    let key = outer.keys.pop();
                    if (key['key'] === 3){
                        outer.flash(key['tx'], key['ty']);
                        if (outer.playground.mode === "multi mode"){
                            outer.playground.mps.send_flash(key['tx'], key['ty']);
                        }
                        outer.cur_skill[1] = false;
                    }
                }*/
                return false;
            } else if (e.which === 83){
                if (outer.playground.mode === "multi mode"){
                    outer.playground.mps.send_stop_move();
                }
                outer.stop_move();
                return false;
            } else if (e.which === 69){
                if (outer.arrow_coldtime > outer.eps){
                    return true;
                }
                if (outer.E_is_down === false){
                   outer.E_start_time = new Date().getTime();
                }
                outer.E_is_down = true;
            }
            
            
        });
        this.playground.game_map.$canvas.keyup(function(e){
            if (e.which === 69){
                if (outer.arrow_coldtime > outer.eps){
                    return true;
                }
                outer.E_is_down = false;
                outer.E_end_time = new Date().getTime();
                let E_time = (outer.E_end_time - outer.E_start_time) / 1000;
                let power = Math.min(3, E_time);
                let arrow = outer.shoot_arrow(outer.mouse_x, outer.mouse_y, power);
                if (outer.playground.mode === "multi mode"){
                    outer.playground.mps.send_shoot_arrow(outer.mouse_x, outer.mouse_y, power, arrow.uuid);
                }
                outer.arrow_coldtime = 7;
            }
        });
        this.playground.game_map.$canvas.mousemove(function(e){
            const rect = outer.ctx.canvas.getBoundingClientRect();
            outer.mouse_x = (e.clientX - rect.left) / outer.playground.scale;
            outer.mouse_y = (e.clientY - rect.top) / outer.playground.scale;
        });
    }
    shoot_fireball(tx, ty) {
        let ball_x = this.x, ball_y = this.y;
        let ball_radius = 0.01;
        let ball_angle = Math.atan2(ty - ball_y, tx - ball_x);
        let ball_vx = Math.cos(ball_angle);
        let ball_vy = Math.sin(ball_angle);
        let ball_color = "orange";
        let ball_speed = this.fireball_speed;
        let ball_move_length = 0.8;
        let ball_damage = 0.01;
        let fireball = new FireBall(this.playground, this, ball_x, ball_y, ball_radius, ball_vx, ball_vy, ball_color, ball_speed, ball_move_length, ball_damage);
        this.fireballs.push(fireball);
        this.fireball_coldtime = 1;

        var audio = new Audio('/static/sounds/playground/shoot.wav');
        audio.play();

        return fireball;
    }
    destroy_fireball(uuid){
        for (let i = 0; i < this.fireballs.length; i ++ ){
            let fireball = this.fireballs[i];
            if (fireball.uuid === uuid){
                fireball.destroy();
                break;
            }
        }
    }
    shoot_arrow(tx, ty, power){
        let arrow_x = this.x, arrow_y = this.y;
        let arrow_radius = 0.01 + power / 300;
        let arrow_angle = Math.atan2(ty - arrow_y, tx - arrow_x);
        let arrow_vx = Math.cos(arrow_angle);
        let arrow_vy = Math.sin(arrow_angle);
        let arrow_speed = 0.8 + power/3;
        let arrow_move_length = 0.7 + power * 0.2;
        let arrow_damage = 0.01 + power / 100;
        let arrow_transparency = 255 - parseInt(50 * power);
        this.arrow = new Arrow(this.playground, this, arrow_x, arrow_y, arrow_radius, arrow_vx, arrow_vy, arrow_speed, arrow_move_length, arrow_damage, arrow_transparency);
        this.arrow_coldtime = 7;

        //var audio = new Audio('/static/sounds/playground/shoot.wav');
        //audio.play();

        return this.arrow;
    }
    flash(tx, ty) {
        //闪现前的特效--------------------------------------------
        let color = "rgb(255,255,0)";
        this.flash_light(this.x, this.y, color, 5, 0.2);
        color = "rgb(255,255,255)";
        this.flash_light(this.x, this.y, color, 5, 0.2);

        //--------------------------------------------------------
        let d = this.get_dist(this.x, this.y, tx, ty);
        d = Math.min(d, 0.4);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);
        this.flash_coldtime = 10;
        this.fireball_coldtime = 0;
        this.move_length = 0; //flash后不动
        //闪现后的特效--------------------------------------------
        color = "rgb(255,255,0)";
        this.flash_light(this.x, this.y, color, 5, 0.2);
        color = "rgb(255,255,255)";
        this.flash_light(this.x, this.y, color, 5, 0.2);
        //--------------------------------------------------------


        //音效
        var audio = new Audio('static/sounds/playground/guidaoyikai.wav');
        audio.volume = 0.6;
        audio.play();
    }
    flash_light(x, y, color, num, radius){
        for (let i = 0; i < num + parseInt(Math.random() * 5); i ++ ) {
            let p_x = x;
            let p_y = y;
            let p_radius = this.radius * Math.random() * radius;
            let p_angle = Math.PI * 2 * Math.random();
            let p_vx = Math.cos(p_angle), p_vy = Math.sin(p_angle);
            let p_color = color;
            let p_speed = this.speed * 10 * Math.random();
            let p_move_length = this.radius * Math.random() * 3;
            new Particle(this.playground, p_x, p_y, p_radius, p_vx, p_vy, p_color, p_speed, p_move_length);
        }
    }

    quick_shot(){

    }
    stop_move(){
        this.move_length = 0;
    }
    get_dist(x1, y1, x2, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }
    is_attacked(angle, damage){
        //被撞击后粒子效果——————————————————————————————————————————————————————————————————————————-
        for (let i = 0; i < 10 + parseInt(Math.random() * 5); i ++ ) {
            let p_x = this.x;
            let p_y = this.y;
            let p_radius = this.radius * Math.random() * 0.25;
            let p_angle = Math.PI * 2 * Math.random();
            let p_vx = Math.cos(p_angle), p_vy = Math.sin(p_angle);
            let p_color = this.color;
            let p_speed = this.speed * 10 * Math.random();
            let p_move_length = this.radius * Math.random() * 10;
            new Particle(this.playground, p_x, p_y, p_radius, p_vx, p_vy, p_color, p_speed, p_move_length);
        }
        //————————————————————————————————————————————————————————————————————————————————————————————
        this.radius -= damage;
        if (this.radius <= this.eps) {
            this.destroy();
            return false;
        }

        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;


    }
    get_fireball(attacker, ball_uuid){
        for (let i = 0; i < attacker.fireballs.length; i ++){
            if (ball_uuid === attacker.fireballs[i].uuid){
                return attacker.fireballs[i];
            }
        }
    }
    receive_attack(x, y, angle, damage, ball_uuid, attacker){
        this.x = x;
        this.y = y;
        this.is_attacked(angle, damage);
        if (damage === this.fireball_damage){
            attacker.destroy_fireball(ball_uuid);
        }
    }
    update(){
        this.stamp_time += this.timedelta;

        if (this.character === "me" && this.playground.state === "fighting"){
            this.update_coldtime();
        }
        this.update_move();


        this.render();

    }
    update_coldtime(){
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0);

        this.arrow_coldtime -= this.timedelta / 1000;
        this.arrow_coldtime = Math.max(this.arrow_coldtime, 0);

        this.flash_coldtime -= this.timedelta / 1000;
        this.flash_coldtime = Math.max(this.flash_coldtime, 0);

        
    }
    update_move(){
        if (this.character === "bot"){
            if (this.stamp_time > 5000 && Math.random() < 1 / 180.0) {
                this.shoot_fireball(this.playground.players[0].x, this.playground.players[0].y);
            }
        }
        if (this.damage_speed > this.eps){
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        } else{
            if (this.move_length < this.eps){
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (this.character === "bot") {
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random();
                    this.move_to(tx, ty);
                }
            } else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
                this.speed = this.origin_speed + (this.origin_radius - this.radius) * 10;
            }
        }

    }

    render(){
        let scale = this.playground.scale;
        if (this.character !== "bot") {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale); 
            this.ctx.restore();
        } else {

            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI*2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
        if (this.character === "me" && this.playground.state === "fighting"){
            this.render_skill_coldtime();
        }
    }
    render_skill_coldtime(){

        let scale = this.playground.scale;

        //火球
        let x = 1.5, y = 0.9, r = 0.04;
        if (this.fireball_coldtime === 0){
            this.fireball_cdscale = 1;
        }
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale); 
        this.ctx.restore();

        this.ctx.beginPath();
        if (this.fireball_coldtime > 0){

            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI*2 * (1 - this.fireball_coldtime / this.fireball_cdscale) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
        //蓄力箭
        x = 1.6, y = 0.9, r = 0.04;
        if (this.arrow_coldtime < this.eps){
            this.arrow_cdscale = 7;
        }
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x*scale, y * scale, r * scale, 0, Math.PI*2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.arrow_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale); 
        this.ctx.restore();

        this.ctx.beginPath();
        if (this.arrow_coldtime > 0){

            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI*2 * (1 - this.arrow_coldtime / this.arrow_cdscale) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
        //闪现
        x = 1.7, y = 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.flash_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale); 
        this.ctx.restore();

        this.ctx.beginPath();
        if (this.flash_coldtime > 0){

            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI*2 * (1 - this.flash_coldtime / 10) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }
    on_destroy() {
        this.playground.player_count -- ;
        for (let i = 0; i < this.playground.players.length; i ++ ){
            if (this.playground.players[i] === this){
                this.playground.players.splice(i, 1);
                break;
            }
        }
    }
}
class Arrow extends AcGameObject {
    constructor(playground, player, x, y, radius, vx, vy, speed, move_length, damage, transparency) {
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        console.log(this.x, this.y);
        this.vx = vx;
        this.vy = vy;
        //this.color = "red";
        this.color = `rgb(${transparency}, 0, 0)`;
        this.speed = speed;
        this.move_length = move_length;
        this.eps = 0.01;
        this.damage = damage;
    }
    start(){
    };
    update(){
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }
        this.update_move();
        if (this.player.character !== "enemy"){
            this.update_attack();
        }
        this.render();
    };
    update_move(){

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
    }
    update_attack(){
        for (let i = 0; i < this.playground.players.length; i ++ ) {
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player)) {
                this.attack(player);
                break;
            }
        }

    }
    get_dist(x1, y1, x2, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx*dx + dy*dy);
    }
    is_collision(obj) {
        let distance = this.get_dist(this.x, this.y, obj.x, obj.y);
        if (distance < this.radius + obj.radius) {
            return true;
        } else {
            return false;
        }

    }
    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(-angle, this.damage);
        if (this.playground.mode === "multi mode"){
            this.playground.mps.send_attack(player.uuid, player.x, player.y, angle, this.damage, this.uuid);
        }
        this.destroy();
    }
    render(){
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
    on_destroy(){
      
    }
}
class FireBall extends AcGameObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.eps = 0.01;
        this.damage = damage;
    }
    start(){
    };
    update(){
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }
        this.update_move();
        if (this.player.character !== "enemy"){
            this.update_attack();
        }
        this.render();
    };
    update_move(){

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
    }
    update_attack(){
        for (let i = 0; i < this.playground.players.length; i ++ ) {
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player)) {
                this.attack(player);
                break;
            }
        }

    }
    get_dist(x1, y1, x2, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx*dx + dy*dy);
    }
    is_collision(obj) {
        let distance = this.get_dist(this.x, this.y, obj.x, obj.y);
        if (distance < this.radius + obj.radius) {
            return true;
        } else {
            return false;
        }

    }
    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(-angle, this.damage);
        if (this.playground.mode === "multi mode"){
            this.playground.mps.send_attack(player.uuid, player.x, player.y, angle, this.damage, this.uuid);
        }
        this.destroy();
    }
    render(){
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
    on_destroy(){
        let fireballs = this.player.fireballs;
        for (let i = 0; i < fireballs.length; i ++){
            if (fireballs[i] === this){
                fireballs.splice(i, 1);
                break;
            }
        }
    }
}
class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;
        this.ws = new WebSocket("wss://app6083.acapp.acwing.com.cn/wss/multiplayer/");
        
        this.start();
}
    start(){
        this.receive();
    }
    receive(){
        let outer = this;
        this.ws.onmessage = function(e){
            let data = JSON.parse(e.data);
            let uuid = data.uuid;
            if (uuid === outer.uuid) return false;

            let event = data.event;
            if (event === "create_player") {
                outer.receive_create_player(uuid, data.username, data.photo);
            } else if (event === "move_to") {
                outer.receive_move_to(uuid, data.tx, data.ty);
            } else if (event === "shoot_fireball"){
                outer.receive_shoot_fireball(uuid, data.tx, data.ty, data.ball_uuid);
            } else if (event === "shoot_arrow"){
                outer.receive_shoot_arrow(uuid, data.tx, data.ty, data.power, data.arrow_uuid);
            } else if (event === "attack"){
                outer.receive_attack(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid);
            } else if (event === "flash"){
                outer.receive_flash(uuid, data.tx, data.ty);
            } else if (event === "chat"){
                outer.receive_chat(data.username, data.text);
            } else if (event === "stop_move"){
                outer.receive_stop_move(uuid);
            }
        };
    }
    send_create_player(username, photo){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uuid': outer.uuid,
            'username': username,
            'photo': photo,
        }));
    }
    get_player(uuid) {
        let players = this.playground.players;
        for (let i = 0; i < players.length; i ++ )
        {
            let player = players[i];
            if (player.uuid === uuid){
                return player;
            }
        }
            return null;
    }
    receive_create_player(uuid, username, photo){
        let outer = this;
        let player = new Player(
            outer.playground,
            outer.playground.width/2/outer.playground.height,
            0.5,
            0.05,
            "white",
            0.20,
            1,
            "enemy",
            username,
            photo
        );
        player.uuid = uuid;
        outer.playground.players.push(player);
    }

    send_move_to(tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "move_to",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }
    
    receive_move_to(uuid, tx, ty){
        let player = this.get_player(uuid);
        if (player) {
            player.move_to(tx, ty);
        }
    }

    send_shoot_fireball(tx, ty, ball_uuid){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "shoot_fireball",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
            'ball_uuid': ball_uuid,
        }));
    }
    receive_shoot_fireball(uuid, tx, ty, ball_uuid){
        let player = this.get_player(uuid);
        if (player){
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = ball_uuid;
        }
    }
    send_shoot_arrow(tx, ty, power, arrow_uuid){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event':"shoot_arrow",
            'uuid':outer.uuid,
            'tx':tx,
            'ty':ty,
            'power':power,
            'arrow_uuid':arrow_uuid
        }));
    }
    receive_shoot_arrow(uuid, tx, ty, power, arrow_uuid){
        let player = this.get_player(uuid);
        if (player){
            let arrow = player.shoot_arrow(tx, ty, power);
            arrow.uuid = arrow_uuid;
        }
    }
    send_attack(attackee_uuid, x, y, angle, damage, ball_uuid){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event':"attack",
            'uuid':outer.uuid,
            'attackee_uuid':attackee_uuid,
            'x':x,
            'y':y,
            'angle':angle,
            'damage':damage,
            'ball_uuid':ball_uuid
        }));
    }
    receive_attack(uuid, attackee_uuid, x, y, angle, damage, ball_uuid){
        let attacker = this.get_player(uuid);
        let attackee = this.get_player(attackee_uuid);
        if (attacker && attackee) {
            attackee.receive_attack(x, y, angle, damage, ball_uuid, attacker);
        }

    }
    send_flash(tx, ty){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "flash",
            'uuid':outer.uuid,
            'tx':tx,
            'ty':ty
        }));
    }
    receive_flash(uuid, tx, ty){
        let player = this.get_player(uuid);
        if (player){
            player.flash(tx, ty);
        }
    }

    send_chat(username, text){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "chat",
            'uuid': outer.uuid,
            'username': username,
            'text': text
        }));
    }
    receive_chat(username, text)
    {
        this.playground.chat_field.add_message(username, text);
    }
    send_stop_move(){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "stop_move",
            'uuid': outer.uuid
        }));
    }
    receive_stop_move(uuid){
        let player = this.get_player(uuid);
        player.stop_move();
    }
}
function getColorRGBA(color, alpha) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);

      const pixelData = ctx.getImageData(0, 0, 1, 1).data;
      const [r, g, b] = Array.from(pixelData.slice(0, 3));

      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);
        this.start();
        
    }
    get_random_color(){
        let colors = ["blue", "red", "green", "pink", "grey", "lightblue"];
        return colors[Math.floor(Math.random() * 6)];
    }

    start() {
        this.hide();
        this.root.$ac_game.append(this.$playground);
        let outer = this;
        $(window).resize(function() {
            outer.resize();
        });
    }
    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;
        if (this.game_map) this.game_map.resize();
    }
    show(mode) {
        this.mode = mode;
        this.$playground.show();
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.resize();
        this.state = "waiting";   //waiting, fighting, over
        this.notice_board = new NoticeBoard(this);
        this.player_count = 0;
        this.players = [];
        this.players.push(new Player(this, this.width/2/this.scale, 0.5, 0.05, "white", 0.20, 1, "me", this.root.settings.username, this.root.settings.photo));
        if (mode === "single mode") {
            for (let i = 0; i < 5; i ++ ){
                this.players.push(new Player(this, this.width/2/this.scale, 0.5, 0.05, this.get_random_color(), 0.15, 0.6, "bot"));
            }
        } else if (mode === "multi mode") {
            let outer = this;
            this.chat_field = new ChatField(outer);
            this.mps = new MultiPlayerSocket(outer);
            this.mps.uuid = this.players[0].uuid;
            this.mps.ws.onopen = function() {
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            }
        }
        
        this.bgm = new Audio('/static/sounds/playground/bgm.mp3');
        this.bgm.loop = true;
        this.bgm.play();
    }
    hide() {
        this.$playground.hide();
    }

}
class Settings {
    constructor(root) {
        this.root = root;
        this.username = "";
        this.photo = "";
        this.$settings = $(`
<div class="ac-game-settings">
    <div class="ac-game-settings-login">
        <div class="ac-game-settings-login-title">
            账号登录
        </div>
        <div class="ac-game-settings-login-user">
            <div class="ac-game-settings-login-user-item">
                <input type="text" placeholder="用户名：">
            </div>
            <div class="ac-game-settings-login-user-item">
                <input type="password" placeholder="密码：">
            </div>
        </div>
        <div class="ac-game-settings-login-user-submit">
            <button>登录</button>
        </div>
        <div class="ac-game-settings-error-messages">
            用户信息错误
        </div>
        <div class="ac-game-settings-option">
            注册
        </div>
        <div class="ac-game-settings-tips ac-game-settings-login-tips">
            登录即代表您同意LRS是帅哥
        </div>
    </div>
    <div class="ac-game-settings-register">
        <div class="ac-game-settings-login-title">
            账号注册
        </div>
        <div class="ac-game-settings-register-user">
             <div class="ac-game-settings-register-user-item">
                <input type="text" placeholder="用户名：">
             </div>
             <div class="ac-game-settings-register-user-item">
                <input type="password" placeholder="密码：">
             </div>
             <div class="ac-game-settings-register-user-item">
                <input type="password" placeholder="确认密码: ">
             </div>
        </div>
        <div class="ac-game-settings-register-user-submit">
            <button>注册</button>
        </div>
        <div class="ac-game-settings-error-messages">
            
        </div>
        <div class="ac-game-settings-option">
            返回登录
        </div>
        <div class="ac-game-settings-tips">
            注册即代表您同意LRS是帅哥
        </div>
    </div>
</div>
        `);
        this.$login = this.$settings.find(".ac-game-settings-login");
        this.$login_username = this.$login.find(".ac-game-settings-login-user > :first-child > input");
        this.$login_password = this.$login.find(".ac-game-settings-login-user > :nth-child(2) > input");
        this.$login_submit = this.$login.find(".ac-game-settings-login-user-submit > button");
        this.$login_error = this.$login.find(".ac-game-settings-error-messages");
        this.$login_error.hide();
        this.$login_option = this.$login.find(".ac-game-settings-option");

        this.$login.hide();

        this.$register = this.$settings.find(".ac-game-settings-register");
        this.$register_username = this.$register.find(".ac-game-settings-register-user > :first-child > input");
        this.$register_password = this.$register.find(".ac-game-settings-register-user > :nth-child(2) > input");
        this.$register_password_confirm = this.$register.find(".ac-game-settings-register-user > :nth-child(3) > input");
        this.$register_submit = this.$register.find(".ac-game-settings-register-user-submit > button");
        this.$register_option = this.$register.find(".ac-game-settings-option");

        this.$register.hide();
        this.$register_error = this.$register.find(".ac-game-settings-error-messages");
        this.root.$ac_game.append(this.$settings);
        this.start();
    }
    start(){
        this.getinfo();
        this.add_listening_events();
    }
    add_listening_events(){
        this.add_listening_events_login();
        this.add_listening_events_register();
    }
    add_listening_events_login(){
        let outer = this;
        this.$login_option.click(function() {
            outer.$login_error.hide();
            outer.register();
        });
        this.$login_submit.click(function() {
            outer.login_on_remote();
        });
    }
    add_listening_events_register(){
        let outer = this;
        this.$register_option.click(function() {
            outer.$register_error.empty();
            outer.login();
        });
        this.$register_submit.click(function() {
            outer.register_on_remote();
        });
    }
    login_on_remote(){
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error.hide();

        $.ajax({
            url:"https://app6083.acapp.acwing.com.cn/settings/login/",
            type:"GET",
            data: {
                username: username,
                password: password,
            },
            success: function(resp) {
                if (resp.result === "success") {
                    location.reload();
                } else {
                    outer.$login_error.show();
                }
            }
        });
    }
    register_on_remote(){
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error.empty();
        $.ajax({
            url: "https://app6083.acapp.acwing.com.cn/settings/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function(resp) {
                if (resp.result === "success") {
                    location.reload();
                } else {
                    outer.$register_error.html(resp.result);
                }
            }
        });
    }
    logout_on_remote(){
        $.ajax({
            url: "https://app6083.acapp.acwing.com.cn/settings/logout/",
            type: "GET",
            success: function(resp) {
                if (resp.result === "success") {
                    location.reload();
                }
            }
        });
    }
    register() {
        this.$login.hide();
        this.$register.show();
    }
    login() {
        this.$register.hide();
        this.$login.show();
    }
    getinfo() {
        let outer = this;
        $.ajax({
            url: "https://app6083.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
            },
            success: function(reap) {
                if (reap.result === "success") {
                    outer.username = reap.username;
                    outer.photo = reap.photo;
                    outer.hide();
                    outer.root.menu.show();
                } else {
                    outer.login();
                    //outer.register();
                }
            }
        })
    }
    
    hide(){
        this.$settings.hide();
    }
    show() {
        this.$settings.show();
    }
}
export class AcGame {
        constructor(id) {
            this.id = id;
            this.$ac_game = $('#' + id);
            this.settings = new Settings(this);
            this.menu = new AcGameMenu(this);
            this.playground = new AcGamePlayground(this);
        }
}

