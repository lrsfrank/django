class NoticeBoard extends AcGameObject {
    constructor(playground){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.text = "已准备： 0人";
        this.cdtext = "技能冷却";
        this.start();
    }

    start(){
    }
    write(text){
        this.text = text;
    }
    update(){
        this.render();
    }
    render(){
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.playground.width/2, 50);
        this.ctx.fillText(this.cdtext, this.playground.width/10 * 7.5, this.playground.height / 10 * 9);
    }
}
