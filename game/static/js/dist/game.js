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
        设置
        </div>
    </div>
</div>
`)
        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi-mode');
        this.$setting = this.$menu.find('.ac-game-menu-field-item-setting');

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi_mode.click(function(){
            outer.hide();
        });
        this.$setting.click(function(){
            outer.hide();
        });
    }

    show() {
        this.$menu.show();
    }

    hide() {
        this.$menu.hide();
    }

}
class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div>游戏界面</div>`);

        this.root.$ac_game.append(this.$playground);
        this.start();
    }

    start() {
        this.hide();
    }

    show() {
        this.$playground.show();
    }
    hide() {
        this.$playground.hide();
    }

}
class AcGame {
        constructor(id) {
            this.id = id;
            this.$ac_game = $('#' + id);
            this.menu = new AcGameMenu(this);
            this.playground = new AcGamePlayground(this);
        }
}

