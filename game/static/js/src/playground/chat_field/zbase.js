class ChatField {
    constructor(playground){
        this.playground = playground;
        this.$history = $(`<div class="ac-game-chat-field-history">历史记录</div>`);
        this.$input = $(`<input type="text" class="ac-game-chat-field-input">`);
        this.$introduction = $(`<div class="ac-game-introduction">
            鼠标右键:朝点击位置移动<br>
            Q:向鼠标位置发射火球 CD:3s<br>
            E:按住蓄力，释放后朝鼠标位置发射迅箭，最长可蓄力3秒 CD:7s<br>
            F:朝鼠标位置瞬间移动一段距离 CD:10s<br>
            S:停止移动<br>
            </div>`)
        this.$history.hide();
        this.$input.hide();
        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);
        //this.playground.root.$ac_game.append(this.$introduction);
        this.func_id = null;

        this.start();
    }

    start(){
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$input.keydown(function(e){
            if (e.which === 27){
                outer.hide_input();
                return false;
            } else if (e.which === 13){
                let username = outer.playground.root.settings.username;
                let text = outer.$input.val();
                if (text){
                    outer.$input.val("");
                    outer.add_message(username, text);
                }
                outer.playground.mps.send_chat(outer.playground.root.settings.username, text);
                return false;
            }
        });
    }

    render_message(message) {
        return $(`<div>${message}</div>`);
    }

    add_message(username, text){
        let message = `[${username}]${text}`;
        this.$history.append(this.render_message(message));
        this.$history.scrollTop(this.$history[0].scrollHeight);
        this.show_history();
    }
    show_history(){
        let outer = this;
        this.$history.fadeIn();

        if (this.func_id) clearTimeout(this.func_id);

        this.func_id = setTimeout(function() {
            outer.$history.fadeOut();
        }, 3000);
    }

    show_input(){
        this.show_history();
        this.$input.show();
        this.$input.focus();
    }
    hide_input(){
        this.$input.hide();
        this.playground.game_map.$canvas.focus();
    }
}
