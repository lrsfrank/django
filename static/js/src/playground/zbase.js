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
        this.players = [];
        this.players.push(new Player(this, this.width/2/this.scale, 0.5, 0.05, "white", 0.20, 1, "me", this.root.settings.username, this.root.settings.photo));
        if (mode === "single mode") {
            for (let i = 0; i < 5; i ++ ){
                this.players.push(new Player(this, this.width/2/this.scale, 0.5, 0.05, this.get_random_color(), 0.15, 0.6, "bot"));
            }
        } else if (mode === "multi mode") {
            let outer = this;
            this.mps = new MultiPlayerSocket(outer);
            this.mps.uuid = this.players[0].uuid;
            this.mps.ws.onopen = function() {
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            }
        }
    }
    hide() {
        this.$playground.hide();
    }

}
