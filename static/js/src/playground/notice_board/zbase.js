class NoticeBoard extends AcGameObject {
    constructor(playground){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.text = "已准备： 0人";
        this.cdtext = "技能冷却";
        this.itr_mouse = "鼠标右键:移动";
        this.itr_Q="Q:朝鼠标位置发射火球 1s";
        this.itr_E="E:按住蓄力释放后朝鼠标位置发射迅箭 7s";
        this.itr_D="D:加速三秒 10s";
        this.itr_F="F:朝鼠标位置闪现一段距离 10s";
        this.itr_S="S:停止移动";
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
                var audio = new Audio('/static/sounds/gameover.wav');  //游戏结束音效
                audio.play();
                setTimeout(function(){
                    location.reload();
                }, 3000);
                this.gameover = true;
            }
        }


    }
    render(){
        this.ctx.font = "20px KaiTi";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.playground.width/2, 50);
        //this.ctx.fillText(this.cdtext, this.playground.width/10 * 7.5, this.playground.height / 10 * 9);
        this.ctx.font = this.playground.width * 0.01 + 'px KaiTi';
        this.ctx.fillText(this.itr_mouse, this.playground.width/10 * 8.5, this.playground.height / 10 * 1);
        this.ctx.fillText(this.itr_Q, this.playground.width/10 * 8.5, this.playground.height / 10 * 1.2);
        this.ctx.fillText(this.itr_E, this.playground.width/10 * 8.5, this.playground.height / 10 * 1.4);
        this.ctx.fillText(this.itr_D, this.playground.width/10 * 8.5, this.playground.height / 10 * 1.6);
        this.ctx.fillText(this.itr_F, this.playground.width/10 * 8.5, this.playground.height / 10 * 1.8);
        this.ctx.fillText(this.itr_S, this.playground.width/10 * 8.5, this.playground.height / 10 * 2);
    }
    render_gameover(){
        this.ctx.font = "50px KaiTi";
        this.ctx.fillText("游戏结束，2S后退出", this.ctx.canvas.width/2, this.ctx.canvas.height/2);
    }
}
