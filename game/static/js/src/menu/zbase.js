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
