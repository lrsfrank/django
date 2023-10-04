class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, fireball_speed, is_me){
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
        this.is_me = is_me;
        this.eps = 0.1;
        this.move_length = 0;
        this.stamp_time = 0;
        this.cur_skill = null;

        if (this.is_me) {
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;
        }
    }
    start(){
        if (this.is_me) {
            this.add_listening_events();
        } else {
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    }
    add_listening_events(){
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function(){
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function(e) {
            if (e.which === 3) {
                outer.move_to(e.clientX, e.clientY);
                if (outer.cur_skill === "fireball") {
                     outer.shoot_fireball(e.clientX, e.clientY);
                     outer.cur_skill = null;
                } 
            } else if (e.which === 1) {
                if (outer.cur_skill === "fireball") {
                     outer.shoot_fireball(e.clientX, e.clientY);
                     outer.cur_skill = null;
                }
            }
        });
        
        if (outer.is_me){

            $(window).keydown(function(e) {
                if (e.which === 81){
                    outer.cur_skill = "fireball";
                    return false;
                }
            });
        }
    }
    shoot_fireball(tx, ty) {
        let ball_x = this.x, ball_y = this.y;
        let ball_radius = this.playground.height * 0.01;
        let ball_angle = Math.atan2(ty - ball_y, tx - ball_x);
        let ball_vx = Math.cos(ball_angle);
        let ball_vy = Math.sin(ball_angle);
        let ball_color = "orange";
        let ball_speed = this.playground.height * this.fireball_speed;
        let ball_move_length = this.playground.height * 0.8;
        let ball_damage = 5;
        new FireBall(this.playground, this, ball_x, ball_y, ball_radius, ball_vx, ball_vy, ball_color, ball_speed, ball_move_length, ball_damage);

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
    is_attacked(angle, fireball){
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
        this.radius -= fireball.damage;
        if (this.radius <= 10) {
            this.destroy();
            return false;
        }

        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = fireball.damage * 100;


    }
    update(){
        this.stamp_time += this.timedelta;
        if (!this.is_me){
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
            if (this.is_me) {
                console.log(this.damage_speed);
            }
        } else{
            if (this.move_length < this.eps){
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (!this.is_me) {
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
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
        this.render();

    }
    render(){
        if (this.is_me) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2); 
            this.ctx.restore();
        } else {

            this.ctx.beginPath();
            this.ctx.arc(this.x,this.y,this.radius,0,Math.PI*2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }
    on_destroy() {
        for (let i = 0; i < this.playground.players.length; i ++ ){
            if (this.playground.players[i] === this){
                this.playground.players.splice(i, 1);
            }
        }
    }
}
