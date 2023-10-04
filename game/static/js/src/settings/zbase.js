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
        <div class="ac-game-settings-tips">
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
        <div class="ac-game-settings-login-user-submit">
            <button>注册</button>
        </div>
        <div class="ac-game-settings-error-messages">
            账号已存在
        </div>
        <div class="ac-game-settings-option">
            返回登录
        </div>
        <div class="ac-game-settings-tips">
            登录即代表您同意LRS是帅哥
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
        this.$register.hide();
        this.$register_error = this.$register.find(".ac-game-settings-error-messages");
        this.$register_error.hide();
        this.root.$ac_game.append(this.$settings);
        this.start();
    }
    start(){
        this.getinfo();
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
            url: "http://8.134.174.213:8000/settings/getinfo/",
            type: "GET",
            data: {
            },
            success: function(reap) {
                console.log(reap);
                if (reap.result === "success") {
                    outer.username = reap.username;
                    outer.photo = reap.photo;
                    outer.hide();
                    outer.root.menu.show();
                } else {
                    //outer.login();
                    outer.register();
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
