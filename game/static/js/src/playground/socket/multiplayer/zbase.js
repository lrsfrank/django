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
            } else if (event === "arrow_slow_speed"){
                outer.receive_arrow_slow_speed(uuid, data.speed);
            } else if (event === "arrow_restore_speed"){
                outer.receive_arrow_restore_speed(uuid);
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
    send_arrow_slow_speed(speed){
        let outer =this;
        this.ws.send(JSON.stringify({
            'event':"arrow_slow_speed",
            'uuid':outer.uuid,
            'speed':speed
        }));
    }
    receive_arrow_slow_speed(uuid){
        let player = this.get_player(uuid);
        if (player){
            player.speed = player.speed / 2;
            player.E_is_down = true;
        }
    }
    send_arrow_restore_speed(){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event':"arrow_restore_speed",
            'uuid':outer.uuid
        }));
    }
    receive_arrow_restore_speed(uuid){
        let player = this.get_player(uuid);
        if (player){
            player.speed = player.speed * 2;
            player.E_is_down = false;
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
