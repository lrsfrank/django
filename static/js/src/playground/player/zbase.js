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
        this.origin_speed = speed;
        this.speed = speed;
        this.fireball_speed = fireball_speed;
        this.fireballs = [];
        this.E_is_down = false;//   不设置的话，只有自己才有这个属性，在E技能按下时广播减速信息会出错，因为对方角色没有这个属性，所以不会随着变小而加速
        this.arrow;
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
                   outer.speed = outer.speed / 2;
                    if (outer.playground.mode === "multi mode"){
                        outer.playground.mps.send_arrow_slow_speed(outer.speed);
                    }
                }
                outer.E_length = (new Date().getTime() - outer.E_start_time) / 1000;
                outer.E_length = Math.min(3, outer.E_length);
                outer.E_is_down = true;
            }


        });
        this.playground.game_map.$canvas.keyup(function(e){
            if (e.which === 69){
                if (outer.arrow_coldtime > outer.eps || outer.E_is_down === false){
                    return true;
                }
                outer.E_is_down = false;
                outer.speed = outer.speed * 2;
                if (outer.playground.mode === "multi mode"){
                    outer.playground.mps.send_arrow_restore_speed();
                }
                outer.E_end_time = new Date().getTime();
                let E_time = (outer.E_end_time - outer.E_start_time) / 1000;
                let power = Math.min(3, E_time);
                outer.arrow = outer.shoot_arrow(outer.mouse_x, outer.mouse_y, power);
                if (outer.playground.mode === "multi mode"){
                    outer.playground.mps.send_shoot_arrow(outer.mouse_x, outer.mouse_y, power, outer.arrow.uuid);
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
        this.arrow.destory();
    }
    shoot_arrow(tx, ty, power){
        let arrow_x = this.x, arrow_y = this.y;
        let arrow_radius = 0.01 + power / 300;
        let arrow_angle = Math.atan2(ty - arrow_y, tx - arrow_x);
        let arrow_vx = Math.cos(arrow_angle);
        let arrow_vy = Math.sin(arrow_angle);
        let arrow_speed = 0.8 + power/3;
        let arrow_move_length = 0.7 + power * 0.2;
        let arrow_damage = 0.005 + power / 100;
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
                if (this.E_is_down === false){
                    this.speed = this.origin_speed + (this.origin_radius - this.radius) * 10;
                }
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
        if (this.character === "me"){
            this.render_skill_animation();
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
    render_skill_animation(){
        let scale = this.playground.scale;
        if (this.E_is_down){

            let len = 0.06 + this.E_length * 0.03;
            let angle = Math.atan2(this.mouse_y - this.y, this.mouse_x - this.x);
            let tx = this.x + len * Math.cos(angle);
            let ty = this.y + len * Math.sin(angle);
            this.ctx.save();
            this.ctx.lineWidth = 3;      // 线条宽度
            let transparency = 250 - this.E_length * 50;
            this.ctx.strokeStyle = `rgb(${transparency}, 0, 0)`;   // 线条颜色
            this.ctx.fillStyle = `rgb(${transparency}, 0, 0)`;  // 填充颜色

            this.ctx.beginPath();
            this.ctx.moveTo(this.x * scale, this.y * scale);
            this.ctx.lineTo(tx * scale, ty * scale);
            this.ctx.stroke();
            let arrowSize = 0.02;
            this.ctx.beginPath();
            this.ctx.moveTo(tx * scale, ty * scale);
            var arrow_pointx = tx - arrowSize * Math.cos(angle - Math.PI / 6);
            var arrow_pointy = ty - arrowSize * Math.sin(angle - Math.PI / 6);
            this.ctx.lineTo(arrow_pointx * scale, arrow_pointy * scale);
            var arrow_pointx = tx - arrowSize * Math.cos(angle + Math.PI / 6);
            var arrow_pointy = ty - arrowSize * Math.sin(angle + Math.PI / 6);
            this.ctx.lineTo(arrow_pointx * scale, arrow_pointy * scale);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.restore();
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
