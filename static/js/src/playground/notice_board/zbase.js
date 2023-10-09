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
