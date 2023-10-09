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
        this.character = character;
        this.eps = 0.01;
        this.move_length = 0;
        this.stamp_time = 0;
        this.cur_skill = null;
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
        }
    }
    start(){
        this.playground.player_count ++ ;
        this.playground.notice_board.write("你躲哪去了？目前已准备： " + this.playground.player_count + "人");

        if (this.playground.player_count >= 2) {
            this.playground.state = "fighting";
            this.playground.notice_board.write("你们不要再打啦！");
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

                outer.cur_skill = "fireball";

                if (outer.keys.length > 0){
                    let key = outer.keys.pop();
                    if (key['key'] === 3){
                        let fireball = outer.shoot_fireball(key['tx'], key['ty']);
                        if (outer.playground.mode === "multi mode"){
                            outer.playground.mps.send_shoot_fireball(key['tx'], key['ty'], fireball.uuid);
                        }
                        outer.cur_skill = null;
                    }
                }

                return false;
            } else if (e.which === 70){
                if (outer.flash_coldtime > outer.eps){
                    return true;
                }
                outer.cur_skill = "flash";
                if (outer.keys.length > 0){
                    let key = outer.keys.pop();
                    if (key['key'] === 3){
                        outer.flash(key['tx'], key['ty']);
                        if (outer.playground.mode === "multi mode"){
                            outer.playground.mps.send_flash(key['tx'], key['ty']);
                        }
                        outer.cur_skill = null;
                    }
                }
                return false;
            }
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

        var audio = new Audio('/static/sounds/射击.wav');
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
    flash(tx, ty) {
        //闪现前的特效--------------------------------------------
        let color = "rgb(255,255,0)";
        this.flash_light(this.x, this.y, color, 15, 0.15);
        color = "rgb(255,255,255)";
        this.flash_light(this.x, this.y, color, 20, 0.15);

        //--------------------------------------------------------
        let d = this.get_dist(this.x, this.y, tx, ty);
        d = Math.min(d, 0.4);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);
        this.flash_coldtime = 10;
        this.move_length = 0; //flash后不动
        //闪现后的特效--------------------------------------------
        color = "rgb(255,255,0)";
        this.flash_light(this.x, this.y, color, 15, 0.15);
        color = "rgb(255,255,255)";
        this.flash_light(this.x, this.y, color, 20, 0.15);
        //--------------------------------------------------------
        
        
        //音效
        var audio = new Audio('static/sounds/guidaoyikai.wav');
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
        attacker.destroy_fireball(ball_uuid);
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

        //闪现
        x = 1.62, y = 0.9, r = 0.04;
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
