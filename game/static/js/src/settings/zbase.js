class Settings {
    constructor(root) {
        this.root = root;
        this.username = "";
        this.photo = "";
        this.$settings = $(`
<div class="ac-game-settings">
    <div class="ac-game-settings-login">
        <div class="ac-game-settings-login-title">
            账号登录
        </div>
        <div class="ac-game-settings-login-user">
            <div class="ac-game-settings-login-user-item">
                <input type="text" placeholder="用户名：">
            </div>
            <div class="ac-game-settings-login-user-item">
                <input type="password" placeholder="密码：">
            </div>
        </div>
        <div class="ac-game-settings-login-user-submit">
            <button>登录</button>
        </div>
        <div class="ac-game-settings-error-messages">
            用户信息错误
        </div>
        <div class="ac-game-settings-option">
            注册
        </div>
        <div class="ac-game-settings-tips ac-game-settings-login-tips">
            登录即代表您同意LRS是帅哥
        </div>
    </div>
    <div class="ac-game-settings-register">
        <div class="ac-game-settings-login-title">
            账号注册
        </div>
        <div class="ac-game-settings-register-user">
             <div class="ac-game-settings-register-user-item">
                <input type="text" placeholder="用户名：">
             </div>
             <div class="ac-game-settings-register-user-item">
                <input type="password" placeholder="密码：">
             </div>
             <div class="ac-game-settings-register-user-item">
                <input type="password" placeholder="确认密码: ">
             </div>
        </div>
        <div class="ac-game-settings-register-user-submit">
            <button>注册</button>
        </div>
        <div class="ac-game-settings-error-messages">
            
        </div>
        <div class="ac-game-settings-option">
            返回登录
        </div>
        <div class="ac-game-settings-tips">
            注册即代表您同意LRS是帅哥
        </div>
    </div>
</div>
        `);
        this.$login = this.$settings.find(".ac-game-settings-login");
        this.$login_username = this.$login.find(".ac-game-settings-login-user > :first-child > input");
        this.$login_password = this.$login.find(".ac-game-settings-login-user > :nth-child(2) > input");
        this.$login_submit = this.$login.find(".ac-game-settings-login-user-submit > button");
        this.$login_error = this.$login.find(".ac-game-settings-error-messages");
        this.$login_error.hide();
        this.$login_option = this.$login.find(".ac-game-settings-option");

        this.$login.hide();

        this.$register = this.$settings.find(".ac-game-settings-register");
        this.$register_username = this.$register.find(".ac-game-settings-register-user > :first-child > input");
        this.$register_password = this.$register.find(".ac-game-settings-register-user > :nth-child(2) > input");
        this.$register_password_confirm = this.$register.find(".ac-game-settings-register-user > :nth-child(3) > input");
        this.$register_submit = this.$register.find(".ac-game-settings-register-user-submit > button");
        this.$register_option = this.$register.find(".ac-game-settings-option");

        this.$register.hide();
        this.$register_error = this.$register.find(".ac-game-settings-error-messages");
        this.root.$ac_game.append(this.$settings);
        this.start();
    }
    start(){
        this.getinfo();
        this.add_listening_events();
    }
    add_listening_events(){
        this.add_listening_events_login();
        this.add_listening_events_register();
    }
    add_listening_events_login(){
        let outer = this;
        this.$login_option.click(function() {
            outer.$login_error.hide();
            outer.register();
        });
        this.$login_submit.click(function() {
            outer.login_on_remote();
        });
    }
    add_listening_events_register(){
        let outer = this;
        this.$register_option.click(function() {
            outer.$register_error.empty();
            outer.login();
        });
        this.$register_submit.click(function() {
            outer.register_on_remote();
        });
    }
    login_on_remote(){
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error.hide();

        $.ajax({
            url:"https://app6083.acapp.acwing.com.cn/settings/login/",
            type:"GET",
            data: {
                username: username,
                password: password,
            },
            success: function(resp) {
                if (resp.result === "success") {
                    location.reload();
                } else {
                    outer.$login_error.show();
                }
            }
        });
    }
    register_on_remote(){
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error.empty();
        $.ajax({
            url: "https://app6083.acapp.acwing.com.cn/settings/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function(resp) {
                if (resp.result === "success") {
                    location.reload();
                } else {
                    outer.$register_error.html(resp.result);
                }
            }
        });
    }
    logout_on_remote(){
        $.ajax({
            url: "https://app6083.acapp.acwing.com.cn/settings/logout/",
            type: "GET",
            success: function(resp) {
                if (resp.result === "success") {
                    location.reload();
                }
            }
        });
    }
    register() {
        this.$login.hide();
        this.$register.show();
    }
    login() {
        this.$register.hide();
        this.$login.show();
    }
    getinfo() {
        let outer = this;
        $.ajax({
            url: "https://app6083.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
            },
            success: function(reap) {
                if (reap.result === "success") {
                    outer.username = reap.username;
                    outer.photo = reap.photo;
                    outer.hide();
                    outer.root.menu.show();
                } else {
                    outer.login();
                    //outer.register();
                }
            }
        })
    }
    
    hide(){
        this.$settings.hide();
    }
    show() {
        this.$settings.show();
    }
}
